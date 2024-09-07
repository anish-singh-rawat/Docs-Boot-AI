import cookie from 'cookie'
import { configureFirebaseApp } from '@/config/firebase-server.config'
import { authDefaults } from '@/constants/auth.constants'

export default async function handler(req, res) {
  configureFirebaseApp()

  const parsedCookies = cookie.parse(req.headers.cookie)
  const accessToken = parsedCookies[authDefaults.COOKIE_NAME]

  try {
    const serializedCookie = cookie.serialize(authDefaults.COOKIE_NAME, accessToken, {
      ...authDefaults.COOKIE_OPTIONS,
      maxAge: 0,
    })
    res.setHeader('Set-Cookie', serializedCookie)
  } catch (error) {
    return res.status(500).end()
  }

  return res.status(204).end()
}
