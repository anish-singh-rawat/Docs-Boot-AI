import { useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { noop } from '@/utils/function.utils'
import { auth } from '@/config/firebase-ui.config'

export function useFetchAPI({ urlParams, onComplete = noop, onError = noop, skip = false }) {
  const [user] = useAuthState(auth)
  useEffect(() => {
    async function fetchAPI() {
      const path = '/api/' + urlParams.join('/')
      const response = await fetch(path, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        onComplete(data)
      } else {
        try {
          const data = await response.json()
          onError(data.message || 'Something went wrong, please try again.')
        } catch (e) {
          onError('Error ' + response.status + ', please try again.')
        }
      }
    }

    if (skip) {
      return
    }

    if (user?.accessToken) {
      fetchAPI()
    }
  }, [user?.accessToken])
}
