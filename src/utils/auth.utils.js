import { PUBLIC_ROUTES } from '@/constants/auth.constants'

export const getIsPublicRoute = (pathname) => {
  return PUBLIC_ROUTES.some((route) => route === pathname)
}
