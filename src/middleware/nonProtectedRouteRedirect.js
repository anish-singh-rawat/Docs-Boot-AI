import { configureFirebaseApp } from '@/config/firebase-server.config'
import { getAuthorizedUser } from '@/middleware/getAuthorizedUser'
import { routePaths } from '@/constants/routePaths.constants'

export const nonProtectedRouteRedirect = async (context) => {
  configureFirebaseApp()
  try {
    await getAuthorizedUser(context)
    let path = routePaths.APP
    if (context.query.redirect) {
      //check if redirect path is valid
      if (Object.values(routePaths).includes(context.query.redirect)) {
        path = context.query.redirect
        console.log('redirect path set to', context.query.redirect)
      }
    }
    return {
      redirect: {
        destination: path,
        permanent: false,
      },
    }
  } catch (error) {
    return { props: {} }
  }
}
