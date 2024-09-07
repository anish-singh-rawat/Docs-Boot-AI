import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import va from '@vercel/analytics'
import { useEffect, useState, useCallback } from 'react'
import { useCreateUserWithEmailAndPassword, useSignInWithGoogle } from 'react-firebase-hooks/auth'
import { useForm } from 'react-hook-form'
import clsx from 'clsx'
import { auth } from '@/config/firebase-ui.config'
import { postAuth } from '@/api/postAuth'
import { routePaths } from '@/constants/routePaths.constants'
import { useRegisterGoogleUser } from '@/hooks/useRegisterGoogleUser'
import { hasRegistrationError } from '@/utils/firebase.utils'
import { nonProtectedRouteRedirect } from '@/middleware/nonProtectedRouteRedirect'
import { RegisterLayout } from '@/components/RegisterLayout'
import { Button } from '@/components/Button'
import { TextField } from '@/components/Fields'
import { GoogleLogo } from '@/components/GoogleLogo'
import LoadingSpinner from '@/components/LoadingSpinner'
import FieldRadioCards from '@/components/FieldRadioCards'
import { configureFirebaseApp } from '@/config/firebase-server.config'
import { getFirestore } from 'firebase-admin/firestore'
import { updateProfile } from 'firebase/auth'
import { NextSeo } from 'next-seo'
import { Mixpanel } from '@/lib/mixpanel-web'
import { PencilIcon } from '@heroicons/react/24/outline'

function Register({ teamCount }) {
  const router = useRouter()
  const { register, handleSubmit, watch } = useForm()
  const [authError, setAuthError] = useState('')
  const [redirectPath, setRedirectPath] = useState(routePaths.APP)
  const [authLoading, setAuthLoading] = useState(false)
  const [notCheckedError, setNotCheckedError] = useState(false)
  const [site, setSite] = useState('')
  const [name, setName] = useState('')
  const [userType, setUserType] = useState(null)
  const [usageType, setUsageType] = useState(null)

  const userTypes = [
    { value: 'business', title: 'Business', description: 'Create chatbots for your company.' },
    { value: 'personal', title: 'Personal', description: 'Create chatbots for your personal use.' },
  ]

  const usageTypes = [
    { value: 'support', title: 'Support & Presales', description: 'Customer support & presales 24/7 in 95 languages.' },
    { value: 'internal', title: 'Internal Knowledge', description: 'Give your team answers from your company knowledge base.' },
    { value: 'research', title: 'Document Q&A', description: 'Chat with your docs & files for research or education.' },
    { value: 'content', title: 'Content Creation', description: 'Generate custom content for your blog or social media.' },
  ]

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

  const [createUserWithEmailAndPassword, user, userAuthLoading, error] =
    useCreateUserWithEmailAndPassword(auth)
  const [signInWithGoogle, googleUser, googleAuthLoading] = useSignInWithGoogle(auth)
  const [checked, setChecked] = useState(false)
  const handleTos = () => {
    setChecked(!checked)
  }

  useEffect(() => {
    const subscription = watch((_) => setAuthError(''))
    return () => subscription.unsubscribe()
  }, [watch])

  useEffect(() => {
    setAuthError(error)
  }, [error])

  const isAnyAuthMethodLoading = userAuthLoading || googleAuthLoading || authLoading

  const authorizeUser = useCallback(postAuth, [])
  useEffect(() => {
    if (user && !userAuthLoading) {
      //update user profile with name
      updateProfile(user?.user, {
        displayName: name,
      })
      setAuthLoading(true)
      authorizeUser({
        accessToken: user?.user?.accessToken,
        name: name,
        isNewUser: true,
        onComplete: () => {
          if (window.bento !== undefined) {
            window.bento.identify(user?.user?.email)
            window.bento.updateFields({ website: site, user_type: userType, name: name, usage_type: usageType })
          }
          if (window.fpr !== undefined) {
            window.fpr("referral",{email: user?.user?.email})
          }
          va.track('Signup', { provider: 'email', user_type: userType, usage_type: usageType })
          Mixpanel.identify(user.user.uid)
          Mixpanel.track('Signup', { provider: 'email', user_type: userType, usage_type: usageType })
          Mixpanel.profile({
            $email: user.user.email,
            $name: user.user.displayName,
            "Usage Type": usageType,
            "User Type": userType,
            "Login Method": "Email"
          })
          router.push(redirectPath)
        },
      })
    }
  }, [user, userAuthLoading, authorizeUser, router])

  useRegisterGoogleUser({
    googleUser,
    authLoading,
    setAuthLoading,
    onComplete: () => {
      if (window.bento !== undefined) {
        window.bento.identify(googleUser?.user?.email)
        window.bento.updateFields({
          name: googleUser?.user?.displayName,
          user_type: userType,
          usage_type: usageType,
          website: site,
        })
      }
      if (window.fpr !== undefined) {
        window.fpr("referral",{email: googleUser?.user?.email})
      }
      va.track('Signup', { provider: 'google', user_type: userType, usage_type: usageType })
      Mixpanel.identify(user.user.uid)
      Mixpanel.track('Signup', { provider: 'google', user_type: userType, usage_type: usageType })
      Mixpanel.profile({
        $email: googleUser.user.email,
        $name: googleUser.user.displayName,
        $avatar: googleUser.user.photoURL,
        "Usage Type": usageType,
        "User Type": userType,
        "Login Method": "Google"
      })
      router.push(redirectPath)
    },
  })

  return (
    <>
      <NextSeo
        title="Sign Up - DocsBot AI"
        description="Register for a free DocsBot AI account."
        noindex={true}
      />
      <RegisterLayout teamCount={teamCount}>
        {isAnyAuthMethodLoading ? (
          <div className="flex h-64 items-center justify-center text-2xl">
            <LoadingSpinner large={true} /> <span className="ml-3">Loading...</span>
          </div>
        ) : (
          <form
            action="#"
            className="mt-4 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2"
            onSubmit={handleSubmit(({ email, password }) => {
              setNotCheckedError(false)
              if (!checked) {
                setNotCheckedError(true)
                return
              }
              createUserWithEmailAndPassword(email, password)
            })}
          >
            <div className="col-span-full">
              <p className="col-span-full mb-2 text-sm text-gray-500">
                Please select your planned usage for DocsBot so we can better serve you.
              </p>
              {!userType && !usageType && (
              <FieldRadioCards options={usageTypes} selected={usageType} setSelected={setUsageType} />
              )}
              {usageType && (
                <>
              <p className="col-span-full mb-2 font-medium text-md text-gray-800">
                Usage: {usageTypes.find((x) => x.value === usageType).title} <button onClick={() => setUsageType(null)} className="underline text-sm text-gray-500" title="Change"><PencilIcon className='h-3 w-3' /></button>
              </p>
              <FieldRadioCards options={userTypes} selected={userType} setSelected={setUserType} />
              </>
              )}
            </div>
            {userType === 'business' && (
              <>
                <TextField
                  className="col-span-full"
                  label="Business website"
                  id="site"
                  name="site"
                  type="url"
                  placeholder="https://mycompany.com"
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                />
                <p className="col-span-full -mt-4 text-sm text-gray-500">
                  If your company has a website, please provide the URL. This will help us better
                  train your bot for your business.
                </p>
              </>
            )}

            {hasRegistrationError(authError) && (
              <div className="col-span-full">
                <span className="mb-1 mt-1 inline-flex items-center rounded-md bg-red-100 p-3 text-sm font-medium text-red-800">
                  There is already a user associated with this account. Please sign in.
                </span>
              </div>
            )}

            {notCheckedError && (
              <div className="col-span-full">
                <span className="mb-1 mt-1 inline-flex items-center rounded-md bg-red-100 p-3 text-sm font-medium text-red-800">
                  Please agree to the Terms of Service and Privacy Policy
                </span>
              </div>
            )}

            {userType && usageType && (
              <>
                <div className="col-span-full">
                  <label>
                    <input
                      type="checkbox"
                      id="terms"
                      name="terms"
                      className="mr-2"
                      onChange={handleTos}
                    />
                    I agree to the{' '}
                    <Link
                      href="/legal/terms-of-service"
                      target="_blank"
                      className="underline hover:text-gray-400"
                    >
                      Terms of Service
                    </Link>{' '}
                    &{' '}
                    <Link
                      href="/legal/privacy-policy"
                      target="_blank"
                      className="underline hover:text-gray-400"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <div className="col-span-full">
                  <Button
                    variant="outline"
                    color="slate"
                    className={clsx('w-full', { 'opacity-75': isAnyAuthMethodLoading })}
                    disabled={isAnyAuthMethodLoading}
                    onClick={(e) => {
                      e.preventDefault()
                      setNotCheckedError(false)
                      if (!checked) {
                        setNotCheckedError(true)
                        return
                      }
                      signInWithGoogle()
                    }}
                  >
                    <span className="mr-3">
                      <GoogleLogo />
                    </span>
                    <span>Sign up with Google</span>
                  </Button>
                </div>

                <div className="relative col-span-full">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm font-medium leading-6">
                    <span className="bg-white px-6 text-gray-900">or create a password</span>
                  </div>
                </div>

                <TextField
                  className="col-span-full"
                  label="Full name"
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <TextField
                  className="col-span-full"
                  label={userType === 'business' ? 'Work email' : 'Email address'}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  {...register('email')}
                />
                <TextField
                  className="col-span-full mb-6"
                  label="Password"
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  {...register('password')}
                />

                <div className="col-span-full">
                  <Button
                    type="submit"
                    variant="solid"
                    color="blue"
                    className={clsx('w-full', { 'opacity-75': isAnyAuthMethodLoading })}
                    disabled={isAnyAuthMethodLoading}
                  >
                    <span>
                      Sign up <span aria-hidden="true">&rarr;</span>
                    </span>
                  </Button>
                </div>
              </>
            )}
          </form>
        )}
      </RegisterLayout>
    </>
  )
}

export const getServerSideProps = async (context) => {
  const data = await nonProtectedRouteRedirect(context)
  if (data.redirect) {
    return data
  }
  context.res.setHeader('Cache-Control', 'public, s-maxage=72000, stale-while-revalidate=600')

  configureFirebaseApp()
  const firestore = getFirestore()

  //get team count from firestore
  const collectionRef = firestore.collection('teams')
  const snapshot = await collectionRef.count().get()
  const teamCount = snapshot.data().count

  data.props.teamCount = teamCount

  return data
}

export default Register
