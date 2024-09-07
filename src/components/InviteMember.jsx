import { useState, useEffect, useRef } from 'react'
import ModalCheckout from '@/components/ModalCheckout'

export default function InviteMember({ team, invite, setToInvite, setErrorText, setSuccessText }) {
  const [submitting, setSubmitting] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [showUpgrade, setShowUpgrade] = useState(false)
  const alertRef = useRef(null);

  async function submitInvite() {
    setErrorText('')
    setSubmitting(true)
    const response = await fetch(`/api/teams/${team.id}/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({inviteEmail:inviteEmail.toLowerCase(), teamId: team.id})
    })
    setSubmitting(false)
    if (response.ok) {
      const data = await response.json()
      setToInvite(null)
      setSuccessText(data.message || 'Success')
    } else if (response.status == 403) { // 403 is our response if the team needs to be upgraded
      setShowUpgrade(true)
    } else {
      try {
        const data = await response.json()
        setErrorText(data.message || 'Something went wrong, please try again.')
      } catch (e) {
        setErrorText('Error ' + response.status + ', please try again.')
      }
    }
  }

  //show whenever params change
  useEffect(() => {
    return () => {
      if (alertRef.current) {
        alertRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [invite])

  if (!invite) return null 

  return (
    <>
      <ModalCheckout team={team} open={showUpgrade} setOpen={setShowUpgrade} />
      <div className="mt-8 flex justify-between bg-white shadow sm:rounded-lg" ref={alertRef}>
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Invite a team member</h3>
          <div className="text-md mt-2 text-gray-500">
            <div className="relative flex flex-grow items-stretch focus-within:z-10 shadow-sm">
              <input
                type="text"
                id="team_name"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="block w-full rounded-none rounded-l-md rounded-r-md border-gray-300 focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
                placeholder="john@example.com"
              />
            </div>
          </div>
          <div className="mt-5">
            <div className="flex justify-start">
              <button
                onClick={() => setToInvite(null)}
                disabled={submitting}
                type="button"
                className="mr-2 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-25"
              >
                Cancel
              </button>
              <button
                onClick={submitInvite}
                  disabled={submitting}
                type="button"
                className="relative inline-flex items-center rounded-md border border-transparent bg-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-25"
              >
                Invite
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
