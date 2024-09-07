import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/config/firebase-ui.config'
import { CheckCircleIcon, CreditCardIcon } from '@heroicons/react/24/outline'
import Alert from '@/components/Alert'
import { StripePricingTable } from '@/components/StripePricing'
import { stripePlan } from '@/utils/helpers'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function Checkout({ team, children }) {
  const [user] = useAuthState(auth)
  const [errorText, setErrorText] = useState(null)
  const [isStripeCustomer, setIsStripeCustomer] = useState(
    !!team.stripeCustomerId &&
      ['active', 'trialing', 'past_due', 'incomplete'].includes(team.stripeSubscriptionStatus)
  )
  const [opening, setOpening] = useState(false)

  useEffect(() => {
    if (['past_due', 'incomplete'].includes(team.stripeSubscriptionStatus)) {
      setErrorText(
        'There is a problem with your subscription. Please check your payment method in the billing portal.'
      )
    }
  }, [team.stripeSubscriptionStatus])

  useEffect(() => {
    if (isStripeCustomer && team.stripeSubscriptionCancelAtPeriodEnd) {
      setErrorText('Your subscription is scheduled to cancel at the end of your billing period.')
    }
  }, [team.stripeSubscriptionCancelAtPeriodEnd])

  async function openPortal() {
    setErrorText(null)
    setOpening(true)
    const response = await fetch(`/api/teams/${team.id}/stripe-portal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (response.ok) {
      const data = await response.json()
      const { url } = data
      //redirect to url
      window.location.href = url
      return
    } else {
      try {
        const data = await response.json()
        setErrorText(data.message || 'Something went wrong, please try again.')
      } catch (e) {
        setErrorText('Error ' + response.status + ', please try again.')
        setOpening(false)
      }
    }
    setOpening(false)
  }

  async function renewPlan() {
    setErrorText(null)
    setOpening(true)
    const response = await fetch(`/api/teams/${team.id}/stripe-portal`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (response.ok) {
      const data = await response.json()
      openPortal()
      return
    } else {
      try {
        const data = await response.json()
        setErrorText(data.message || 'Something went wrong, please try again.')
      } catch (e) {
        setErrorText('Error ' + response.status + ', please try again.')
        setOpening(false)
      }
    }
  }

  const Button = () => {
    return (
      <button
        type="button"
        className="text-md inline-flex w-64 items-center justify-center rounded-md border border-transparent bg-cyan-600 px-4 py-3 font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-25"
        onClick={openPortal}
        disabled={opening}
      >
        {opening ? (
          <LoadingSpinner />
        ) : (
          <CreditCardIcon className="mr-1.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
        )}
        Billing Portal
      </button>
    )
  }

  return (
    <>
      <Alert title={errorText} type="error" />

      {children ? (
        <>
          <div className="flex justify-center text-center">
            <div className="max-w-2xl">
              {children}
              <Button />
            </div>
          </div>
        </>
      ) : (
        <div className="">
          {!isStripeCustomer && (
            <StripePricingTable team={team} email={user?.email} setErrorText={setErrorText} />
          )}
          {!!team.stripeCustomerId && (
            <div className="flex justify-center text-center">
              {isStripeCustomer ? (
                <div className="max-w-2xl">
                  {team.stripeSubscriptionCancelAtPeriodEnd && (
                    <div className="mb-6 flex justify-center text-center">
                      <button
                        type="button"
                        className="text-md ring-inside inline-flex w-64 items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 font-medium text-cyan-700 shadow-sm ring-2 ring-cyan-600 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-25"
                        onClick={(e) => {
                          renewPlan()
                        }}
                        disabled={opening}
                      >
                        <CheckCircleIcon
                          className="mr-1.5 h-5 w-5 flex-shrink-0"
                          aria-hidden="true"
                        />
                        Reactivate Plan
                      </button>
                    </div>
                  )}
                  <h3 className="text-3xl font-bold">Manage your Plan</h3>
                  <p className="text-md mb-8 mt-2 text-gray-800 md:mb-16">
                    You are currently on the {stripePlan(team).name} plan. Open your billing portal
                    to change your plan, update payment methods, and download invoices.
                  </p>
                  <Button />
                </div>
              ) : (
                <div className="max-w-2xl">
                  <h3 className="text-3xl font-bold">Billing History</h3>
                  <p className="text-md mb-6 mt-2 text-gray-800 md:mb-16">
                    Open your billing portal to view billing history and download invoices.
                  </p>
                  <Button />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  )
}
