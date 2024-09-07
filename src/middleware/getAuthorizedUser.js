import cookie from 'cookie'
import crypto from 'crypto'
import { authDefaults } from '@/constants/auth.constants'
import { verifySessionCookie } from '@/middleware/verifySessionCookie'
import { configureFirebaseApp } from '@/config/firebase-server.config'
import { getFirestore } from 'firebase-admin/firestore'
configureFirebaseApp()
const firestore = getFirestore()

export const getAuthorizedUser = async (context) => {
  try {
    const authHeader = context.req.headers.authorization
    if (authHeader) {
      const token = authHeader.split(' ')[1] || authHeader
      //get sha256 hash of the token
      const hash = crypto.createHash('sha256').update(token).digest('hex')
      //check the user in the database
      const user = await firestore.collection('users').where('apiKey', '==', hash).get()
      if (!user.empty) {
        return { uid: user.docs[0].id }
      } else {
        throw new Error('Invalid API key')
      }
    }

    if (!context.req.headers.cookie) {
      throw new Error('Please login or provide an API key')
    }
    const parsedCookies = cookie.parse(context.req.headers.cookie)
    const accessToken = parsedCookies[authDefaults.COOKIE_NAME]

    try {
      const jwt = await verifySessionCookie(accessToken)

      return jwt
    } catch (error) {
      throw error
    }
  } catch (error) {
    throw error
  }
}
