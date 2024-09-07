import { useState, useEffect, useRef } from 'react'

export default function MemberDelete({
  team,
  removeUser,
  setRemoveUser,
  setErrorText,
  setCurrTeamUsers,
  setCurrTeamInvites,
}) {
  const [submitting, setSubmitting] = useState(false)
  const alertRef = useRef(null)

  async function submitDelete() {
    if (submitting) {
      return
    }

    setErrorText('')
    setSubmitting(true)
    const body = (removeUser.inviteId) ? {removeUserEmail: removeUser.email} : {removeUserId: removeUser.uid}
    const response = await fetch(`/api/teams/${team.id}/members`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
    if (response.ok) {
      const data = await response.json()
      if (removeUser.inviteId) { // update invites
        setCurrTeamInvites((invites) => {
          const index = invites.findIndex((invite) => {
            return invite ? invite.inviteId === removeUser.inviteId : false
          })

          if (index != -1) {
            delete invites[index]
            return invites
          }
        })
      } else { // update users
        setCurrTeamUsers((users) => {
          const index = users.findIndex((user) => {
            return user ? user.uid === removeUser.uid : false
          })

          if (index != -1) {
            delete users[index]
            return users
          }
        })
      }
    } else {
      try {
        const data = await response.json()
        setErrorText(data.message || 'Something went wrong, please try again.')
      } catch (e) {
        setErrorText('Error ' + response.status + ', please try again.')
      }
    }
    setRemoveUser(null)
    setSubmitting(false)
  }

  //show whenever params change
  useEffect(() => {
    return () => {
      if (alertRef.current) {
        alertRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [removeUser])

  if (!removeUser) return null

  return (
    <div className="mt-8 flex justify-between bg-white shadow sm:rounded-lg" ref={alertRef}>
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Remove {removeUser.email}?
        </h3>
        <div className="text-md mt-2 text-gray-500">
          <p>
            Are you sure you'd like to remove this member from your team?
          </p>
        </div>
        <div className="mt-5">
          <div className="flex justify-start">
            <button
              onClick={() => setRemoveUser(null)}
              disabled={submitting}
              type="button"
              className="mr-2 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-25"
            >
              Cancel
            </button>
            <button
              onClick={() => submitDelete()}
              disabled={submitting}
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 font-medium text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-25 sm:text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
