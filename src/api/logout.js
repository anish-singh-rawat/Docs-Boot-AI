import { noop } from '@/utils/function.utils'

export const logout = async function ({ onComplete = noop }) {
  try {
    const response = await fetch('/api/logout', {
      method: 'DELETE',
      credential: 'include',
    })

    if (response.ok) {
      onComplete()
    } else {
      throw new Error('Something went wrong. Please try again.')
    }
  } catch (error) {
    throw error
  }
}
