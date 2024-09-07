import { useEffect, useCallback } from 'react'
import { noop } from '@/utils/function.utils'
import { postAuth } from '@/api/postAuth'
import { getIsNewGmailUser } from '@/utils/firebase.utils'

export function useRegisterGoogleUser({ googleUser, authLoading, setAuthLoading, onComplete = noop }) {
  const authorizeUser = useCallback(postAuth, [])
  useEffect(() => {
    if (googleUser && !authLoading) {
      setAuthLoading(true)
      const isNewUser = getIsNewGmailUser(googleUser)
      authorizeUser({
        accessToken: googleUser?.user?.accessToken,
        name: googleUser?.user?.displayName,
        isNewUser,
        onComplete: () => {
          onComplete()
        },
      })
    }
  }, [googleUser, authLoading, authorizeUser, onComplete])
}
