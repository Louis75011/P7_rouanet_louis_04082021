import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { errorHandler } from './errorHandler.mjs'

dotenv.config()

// Fonction d'authentification globale afin de sécuriser chaque route (ne se préocuppe pas de la sécurisation front)
export function auth(req, res, next) {
  // Export rend accessible la fonction dans tout le dossier
  try {
    let isConnected = false // Variable reste sur faux à la base
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ') // Si les deux sont ok, commencer par Bearer le porteur du token
    ) {
      // Le tableau d'un élément se place à l'intérieur du Token s'il n'y a pas de problème
      const token = req.headers.authorization.split(' ')[1]
      const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET) // Jwt vérifie le token pour le réutiliser
      if (decodedToken != undefined) {
        isConnected = true // En cas de bon fonctionnement on se connecte sinon cela renvoie un statut d'erreur
        req.accessToken = token
      }
    }
    if (isConnected) {
      // Nouveau if si on est bien "isConnected"
      next()
    } else {
      errorHandler(req, res, 401)
    }
  } catch (err) {
    console.log(err)
    res.status(401).json({ error: new Error('Requête Invalide!') })
  }
}

// Propriétaire - Permet la modification/suppression d'élément (post/profil) par quelqu'un de branché sur son propre compte
export function isOwner(req, res, checkUserId) {
  // Fonction de vérification de l'utilisateur
  try {
    if (checkUserId === undefined) {
      throw new Error('checkUserId undefined')
    }
    const decoded = jwt.decode(req.accessToken, process.env.TOKEN_SECRET) // Jwt récupère le contenu du token avec .decode
    return decoded.userId === checkUserId || decoded.userRole === 1 // Le propriétaire du post et l'admin peuvent supprimer le post
  } catch (err) {
    throw err // Minimiser les sorties d'erreur pour ne pas encombrer la boîte (petite transmission de l'erreur au parent deleteOne)
  }
}