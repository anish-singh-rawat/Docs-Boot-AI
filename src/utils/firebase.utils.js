import {
  FIREBASE_WRONG_PASSWORD_ERROR,
  FIREBASE_USER_NOT_FOUND_ERROR,
  FIREBASE_USER_EMAIL_ALREADY_USED,
} from '@/constants/firebase.constants'

export const hasAuthenticationError = (error) => {
  return (
    error?.code === FIREBASE_WRONG_PASSWORD_ERROR || error?.code === FIREBASE_USER_NOT_FOUND_ERROR
  )
}

export const hasRegistrationError = (error) => {
  return error?.code === FIREBASE_USER_EMAIL_ALREADY_USED
}

export const getIsNewGmailUser = (user) => {
  return !!user?._tokenResponse?.isNewUser
}
