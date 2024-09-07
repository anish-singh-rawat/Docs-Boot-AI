import { noop } from '@/utils/function.utils'

export const postAuth = async function ({ accessToken, isNewUser, name, onComplete = noop }) {
  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        isNewUser,
        name,
      }),
    })

    if (response.ok) {
      await response.json()
      onComplete()
    } else {
      throw new Error('Something went wrong. Please try again.')
    }
  } catch (error) {
    throw error
  }
}
