import { useState, useEffect, useRef } from 'react'

export default function InviteRequest({ teamId, teamName, inviteId, setInviteList, setErrorText, setCurrTeam }) {
  const [submitting, setSubmitting] = useState(false)
  const alertRef = useRef(null);

  async function submitInvite(status) {
    setErrorText('')
    setSubmitting(true)
    const response = await fetch(`/api/teams/${teamId}/invite`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({status, teamId, inviteId})
    })
    if (response.ok) {
      const { message, data } = await response.json()
      setSubmitting(false)
      setInviteList((invites) => {
        const inv = invites.find((i) => i.uid === inviteId)
        invites.splice(inv, 1)
        return invites
      })
      if (status === 'accept') {
        setCurrTeam(data)
      }
    } else {
      try {
        const data = await response.json()
        setErrorText(data.message || 'Something went wrong, please try again.')
      } catch (e) {
        setErrorText('Error ' + response.status + ', please try again.')
      }
      setSubmitting(false)
    }
  }

  return (
    <div className="mb-8 flex justify-between bg-white shadow sm:rounded-lg" ref={alertRef}>
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">You've been invited to join {teamName}</h3>
        <div className="mt-5">
          <div className="flex justify-start">
            <button
              onClick={() => submitInvite('deny')}
              disabled={submitting}
              type="button"
              className="mr-2 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-25"
            >
              Decline
            </button>
            <button
              onClick={() => submitInvite('accept')}
              disabled={submitting}
              type="button"
              className="relative inline-flex items-center rounded-md border border-transparent bg-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-25"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
