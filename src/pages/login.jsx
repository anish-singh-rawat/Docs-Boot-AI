import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import va from '@vercel/analytics'

import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useSignInWithEmailAndPassword, useSignInWithGoogle } from 'react-firebase-hooks/auth'
import clsx from 'clsx'

import { auth } from '@/config/firebase-ui.config'
import { sendPasswordResetEmail } from 'firebase/auth'
import { hasAuthenticationError } from '@/utils/firebase.utils'
import { routePaths } from '@/constants/routePaths.constants'
import { nonProtectedRouteRedirect } from '@/middleware/nonProtectedRouteRedirect'
import { postAuth } from '@/api/postAuth'
import { AuthLayout } from '@/components/AuthLayout'
import { Button } from '@/components/Button'
import { TextField } from '@/components/Fields'
import { Logo } from '@/components/Logo'
import { GoogleLogo } from '@/components/GoogleLogo'
import { useRegisterGoogleUser } from '@/hooks/useRegisterGoogleUser'
import LoadingSpinner from '@/components/LoadingSpinner'
import { NextSeo } from 'next-seo'
import { Mixpanel } from '@/lib/mixpanel-web'

function Login() {
  const router = useRouter()
  const { register, handleSubmit, watch, getValues } = useForm()
  const [authError, setAuthError] = useState('')
  const [redirectPath, setRedirectPath] = useState(routePaths.APP)
  const [authLoading, setAuthLoading] = useState(false)

  //set redirect path from query param
  useEffect(() => {
    if (router.query.redirect) {
      //check if redirect path is valid
      if (Object.values(routePaths).includes(router.query.redirect)) {
        setRedirectPath(router.query.redirect)
        console.log('redirect path set to', router.query.redirect)
      }
    }
  }, [router.query.redirect])

  const [signInWithEmailAndPassword, user, userAuthLoading, error] =
    useSignInWithEmailAndPassword(auth)
  const [signInWithGoogle, googleUser, googleAuthLoading] = useSignInWithGoogle(auth)

  const isAnyAuthMethodLoading = userAuthLoading || googleAuthLoading || authLoading

  useEffect(() => {
    const subscription = watch((_) => setAuthError(''))
    return () => subscription.unsubscribe()
  }, [watch])

  useEffect(() => {
    setAuthError(error)
  }, [error])

  const authorizeUser = useCallback(postAuth, [])
  useEffect(() => {
    if (user && !userAuthLoading) {
      setAuthLoading(true)
      authorizeUser({
        accessToken: user?.user?.accessToken,
        name: null,
        isNewUser: false,
        onComplete: () => {
          if (window.bento !== undefined) {
            window.bento.identify(user?.user?.email)
          }
          Mixpanel.identify(user.user.uid)
          Mixpanel.profile({
            $email: user.user.email,
            $name: user.user.displayName,
            "Login Method": "Email"
          })
          router.push(redirectPath)
        },
      })
    }
  }, [user, userAuthLoading, router, authorizeUser])

  useRegisterGoogleUser({
    googleUser,
    googleAuthLoading,
    setAuthLoading,
    onComplete: () => {
      if (window.bento !== undefined) {
        window.bento.identify(googleUser?.user?.email)
        window.bento.updateFields({ name: googleUser?.user?.displayName })
      }
      if (window.fpr !== undefined) {
        window.fpr("referral",{email: googleUser?.user?.email})
      }
      va.track('Signup')
      Mixpanel.identify(googleUser.user.uid)
      Mixpanel.profile({
        $email: googleUser.user.email,
        $name: googleUser.user.displayName,
        $avatar: googleUser.user.photoURL,
        "Login Method": "Google"
      })
      router.push(redirectPath)
    },
  })

  return (
    <>
      <NextSeo title="Sign In - DocsBot AI" description="Login to your DocsBot AI account." />
      <AuthLayout
        title="Sign in to account"
        subtitle={
          <>
            Don’t have an account?{' '}
            <Link href="/register" className="text-teal-100">
              Sign up
            </Link>{' '}
            to get started.
          </>
        }
      >
        {isAnyAuthMethodLoading ? (
          <div className="flex h-64 items-center justify-center text-2xl">
            <LoadingSpinner large={true} /> <span className="ml-3">Loading...</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(async ({ email, password }) => {
              signInWithEmailAndPassword(email, password)
            })}
            action="#"
            className="mt-10 grid grid-cols-1 gap-y-8"
          >
            <TextField
              label="Email address"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              required
            />
            <TextField
              label="Password"
              id="password"
              name="password"
              type="password"
              {...register('password')}
              autoComplete="current-password"
              required
            />
            {hasAuthenticationError(authError) && (
              <span className="mb-1 mt-1 inline-flex items-center rounded-md bg-red-100 p-3 text-sm font-medium text-red-800">
                Username or password is incorrect.{' '}
                <button
                  className="ml-1 underline"
                  onClick={(e) => {
                    e.preventDefault()
                    sendPasswordResetEmail(auth, getValues('email'))
                      .then(() => {
                        // Password reset email sent!
                        alert('Password reset email sent!')
                      })
                      .catch((error) => {
                        const errorCode = error.code
                        const errorMessage = error.message
                        alert('Please check the email address you entered and try again.')
                      })
                  }}
                >
                  Forgot password?
                </button>
              </span>
            )}
            <div>
              <Button
                type="submit"
                variant="solid"
                color="blue"
                className={clsx('w-full', {
                  'opacity-75': isAnyAuthMethodLoading,
                })}
                disabled={isAnyAuthMethodLoading ? 'disabled' : ''}
              >
                <span>
                  Sign in <span aria-hidden="true">&rarr;</span>
                </span>
              </Button>
            </div>
            <div style={{ marginTop: '-15px' }}>
              <Button
                variant="outline"
                color="slate"
                className={clsx('w-full', {
                  'opacity-75': isAnyAuthMethodLoading,
                })}
                disabled={isAnyAuthMethodLoading ? 'disabled' : ''}
                onClick={(e) => {
                  e.preventDefault()
                  signInWithGoogle()
                }}
              >
                <span className="mr-3">
                  <GoogleLogo />
                </span>
                <span>Sign in with Google</span>
              </Button>
            </div>
          </form>
        )}
      </AuthLayout>
    </>
  )
}

export const getServerSideProps = nonProtectedRouteRedirect

export default Login
