import { routePaths } from './routePaths.constants'

export const SECONDS_IN_MINUTE = 60
export const ONE_SECOND_IN_MILLISECONDS = 1000
export const MINUTES_IN_HOUR = 60
export const HOURS_IN_DAY = 24

export const TWO_WEEKS_IN_SECONDS = SECONDS_IN_MINUTE * MINUTES_IN_HOUR * HOURS_IN_DAY * 14
export const TWO_WEEKS_IN_MILLISECONDS = TWO_WEEKS_IN_SECONDS * ONE_SECOND_IN_MILLISECONDS

export const authDefaults = {
  COOKIE_NAME: 'docsbot-auth',
  COOKIE_OPTIONS: {
    maxAge: TWO_WEEKS_IN_SECONDS,
    httpOnly: true,
    SameSite: 'lax',
    secure: process.env.NODE_ENV !== 'development',
    path: '/',
  },
}

export const PUBLIC_ROUTES = [routePaths.LOGIN, routePaths.REGISTER]
