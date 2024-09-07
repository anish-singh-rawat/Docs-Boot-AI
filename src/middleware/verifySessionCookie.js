import { getAuth } from 'firebase-admin/auth'

export const verifySessionCookie = async (accessToken) => {
  const auth = getAuth()
  const decodedToken = await auth.verifySessionCookie(accessToken)

  return decodedToken
}
