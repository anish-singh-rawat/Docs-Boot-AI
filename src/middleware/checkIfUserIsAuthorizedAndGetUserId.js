import cookie from 'cookie'
import { authDefaults } from '@/constants/auth.constants'
import { verifySessionCookie } from '@/middleware/verifySessionCookie'

export const checkIfUserIsAuthorizedAndGetUserId = async (context) => {
  try {
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
