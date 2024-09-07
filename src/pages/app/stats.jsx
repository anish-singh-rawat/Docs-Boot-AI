import DashboardWrap from '@/components/DashboardWrap'
import Alert from '@/components/Alert'
import { getAuthorizedUserCurrentTeam } from '@/middleware/getAuthorizedUserCurrentTeam'
import { Fragment, useState, useEffect } from 'react'
import { isSuperAdmin } from '@/utils/helpers'
import { configureFirebaseApp } from '@/config/firebase-server.config'
import { getFirestore } from 'firebase-admin/firestore'
import { CheckIcon } from '@heroicons/react/24/solid'
import { Pie } from 'react-chartjs-2'
import 'chart.js/auto' // ADD THIS

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const feedbackReasons = {
  too_expensive: 'It’s too expensive',
  missing_features: 'Some features are missing',
  switched_service: 'I’m switching to a different service',
  unused: 'I don’t use the service enough',
  customer_service: 'Customer service was less than expected',
  too_complex: 'Ease of use was less than expected',
  low_quality: 'Quality was less than expected',
  other: 'Other reason',
}

function StatsPage({ userId, stats, steps, cancelReasons, cancelReasonsList }) {
  const [errorText, setErrorText] = useState(null)
  const [pieData, setPieData] = useState(null)

  useEffect(() => {
    if (!Object.keys(cancelReasons).length) return

    setPieData({
      labels: Object.keys(cancelReasons).map((key) => feedbackReasons[key]),
      datasets: [
        {
          data: Object.values(cancelReasons),
        },
      ],
    })
  }, [cancelReasons])

  return (
    <DashboardWrap page="Dashboard">
      <Alert title={errorText} type="error" />

      <div className="my-8">
        <h3 className="text-3xl font-medium leading-6 text-gray-900">DocsBot Superadmin Stats</h3>
        <p className="mb-0 mt-2 text-sm text-gray-500">Staff view of DocsBot usage.</p>
      </div>

      <div className="mt-8">
        <h3 className="text-base font-semibold leading-6 text-gray-900">Stats</h3>
        <dl className="mt-5 grid grid-cols-1 divide-x divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow md:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div key={item.name} className="px-4 py-5 sm:p-6">
              <dt className="text-base font-normal text-gray-900">{item.name}</dt>
              <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
                <div className="flex items-baseline text-2xl font-semibold text-cyan-600">
                  {item.stat}

                  {item.previousStat && (
                    <span className="ml-2 text-sm font-medium text-gray-500">
                      ({item.previousStat})
                    </span>
                  )}
                </div>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <h3 className="mt-16 text-base font-semibold leading-6 text-gray-900">Conversion Funnel</h3>
      <div className="mb-8 mt-4 overflow-hidden bg-white py-4 shadow sm:rounded-md">
        <div className="lg:border-b lg:border-t lg:border-gray-200">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Progress">
            <ol
              role="list"
              className="overflow-hidden rounded-md lg:flex lg:rounded-none lg:border-l lg:border-r lg:border-gray-200"
            >
              {steps.map((step, stepIdx) => (
                <li key={step.id} className="relative overflow-hidden lg:flex-1">
                  <div
                    className={classNames(
                      stepIdx === 0 ? 'rounded-t-md border-b-0' : '',
                      stepIdx === steps.length - 1 ? 'rounded-b-md border-t-0' : '',
                      'overflow-hidden border border-gray-200 lg:border-0'
                    )}
                  >
                    {step.status === 'complete' ? (
                      <a href={step.href} className="group">
                        <span
                          className="absolute left-0 top-0 h-full w-1 bg-transparent group-hover:bg-gray-200 lg:bottom-0 lg:top-auto lg:h-1 lg:w-full"
                          aria-hidden="true"
                        />
                        <span
                          className={classNames(
                            stepIdx !== 0 ? 'lg:pl-9' : '',
                            'flex items-start px-6 py-5 text-sm font-medium'
                          )}
                        >
                          <span className="flex-shrink-0">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600">
                              <CheckIcon className="h-6 w-6 text-white" aria-hidden="true" />
                            </span>
                          </span>
                          <span className="ml-4 mt-0.5 flex min-w-0 flex-col">
                            <span className="text-sm font-medium">{step.name}</span>
                            <span className="text-sm font-medium text-gray-500">
                              {step.description}
                            </span>
                          </span>
                        </span>
                      </a>
                    ) : step.status === 'current' ? (
                      <a href={step.href} aria-current="step">
                        <span
                          className="absolute left-0 top-0 h-full w-1 bg-indigo-600 lg:bottom-0 lg:top-auto lg:h-1 lg:w-full"
                          aria-hidden="true"
                        />
                        <span
                          className={classNames(
                            stepIdx !== 0 ? 'lg:pl-9' : '',
                            'flex items-start px-6 py-5 text-sm font-medium'
                          )}
                        >
                          <span className="flex-shrink-0">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-indigo-600">
                              <span className="text-indigo-600">{step.id}</span>
                            </span>
                          </span>
                          <span className="ml-4 mt-0.5 flex min-w-0 flex-col">
                            <span className="text-sm font-medium text-indigo-600">{step.name}</span>
                            <span className="text-sm font-medium text-gray-500">
                              {step.description}
                            </span>
                          </span>
                        </span>
                      </a>
                    ) : (
                      <a href={step.href} className="group">
                        <span
                          className="absolute left-0 top-0 h-full w-1 bg-transparent group-hover:bg-gray-200 lg:bottom-0 lg:top-auto lg:h-1 lg:w-full"
                          aria-hidden="true"
                        />
                        <span
                          className={classNames(
                            stepIdx !== 0 ? 'lg:pl-9' : '',
                            'flex items-start px-6 py-5 text-sm font-medium'
                          )}
                        >
                          <span className="flex-shrink-0">
                            <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-teal-300">
                              <span className="font-semibold text-cyan-700">{step.id}</span>
                            </span>
                          </span>
                          <span className="ml-4 mt-0.5 flex min-w-0 flex-col">
                            <span className="text-sm font-medium text-gray-700">{step.name}</span>
                            <span className="text-sm font-medium text-gray-500">
                              {step.description}
                            </span>
                          </span>
                        </span>
                      </a>
                    )}

                    {stepIdx !== 0 ? (
                      <>
                        {/* Separator */}
                        <div
                          className="absolute inset-0 left-0 top-0 hidden w-3 lg:block"
                          aria-hidden="true"
                        >
                          <svg
                            className="h-full w-full text-gray-300"
                            viewBox="0 0 12 82"
                            fill="none"
                            preserveAspectRatio="none"
                          >
                            <path
                              d="M0.5 0V31L10.5 41L0.5 51V82"
                              stroke="currentcolor"
                              vectorEffect="non-scaling-stroke"
                            />
                          </svg>
                        </div>
                      </>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      <h3 className="mt-16 text-base font-semibold leading-6 text-gray-900">
        Cancellation Reasons
      </h3>
      <div className="mt-4 items-start justify-between space-x-16 rounded-lg bg-white p-8 align-middle lg:flex">
        <div className="h-96 flex-none">
          {pieData && (
            <Pie
              data={pieData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    align: 'start',
                    textAlign: 'left',
                  },
                },
              }}
            />
          )}
        </div>
        <div className="flex-auto">
          <h4 className="text-base font-semibold leading-6 text-gray-900">Comments</h4>
          <ul className="divide-y divide-gray-200">
            {cancelReasonsList.map((reason) => (
              <li key={reason} className="flex py-4">
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{reason}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardWrap>
  )
}

export const getServerSideProps = async (context) => {
  const data = await getAuthorizedUserCurrentTeam(context)
  configureFirebaseApp()
  const firestore = getFirestore()

  //if not super admin, redirect to dashboard
  if (!isSuperAdmin(data?.props?.userId)) {
    return {
      redirect: {
        destination: '/app',
        permanent: false,
      },
    }
  }

  const teamsSnapshot = await firestore.collection('teams').get()
  let teams = []
  const cancelReasons = {}
  const cancelReasonsList = []
  teamsSnapshot.forEach(async (doc) => {
    let team = { id: doc.id, ...doc.data() }
    if (team.createdAt && team.createdAt instanceof Date) {
      team.createdAt = team.createdAt.toDate().toJSON() //make serializable
    }
    if (team.id !== '9oh1D8on7okSdakT1Ywn') {
      //skip staff team
      teams.push(team)

      //cancel feedback
      if (team.stripeSubscriptionCancelFeedback) {
        cancelReasons[team.stripeSubscriptionCancelFeedback] =
          cancelReasons[team.stripeSubscriptionCancelFeedback] + 1 || 1
      }
      if (team.stripeSubscriptionCancelComment) {
        cancelReasonsList.push(team.stripeSubscriptionCancelComment)
      }
    }
  })

  const teamCount = teams.length
  const botCount = teams.reduce((acc, team) => acc + (team.botCount || 0), 0)
  const sourceCount = teams.reduce((acc, team) => acc + (team.sourceCount || 0), 0)
  const pageCount = teams.reduce((acc, team) => acc + (team.pageCount || 0), 0)
  const questionCount = teams.reduce((acc, team) => acc + (team.questionCount || 0), 0)
  //teams with at least one question
  const teamBots = teams.reduce((acc, team) => {
    return team.botCount ? acc + 1 : acc
  }, 0)
  const percentTeamBots = Math.round((teamBots / teamCount) * 1000) / 10

  //teams with at least one question
  const teamsWbots = teams.reduce((acc, team) => {
    return team.status === 'ready' ? acc + 1 : acc
  }, 0)
  //percent of teams with at least one bot
  const percentAccountsWbots = Math.round((teamsWbots / teamCount) * 1000) / 10
  //questions per team
  const questionsPerAccount = Math.round((questionCount / teamsWbots) * 10) / 10
  //sources per team
  const sourcesPerAccount = Math.round((sourceCount / teamsWbots) * 10) / 10
  //pages per team
  const pagesPerAccount = Math.round((pageCount / teamsWbots) * 10) / 10
  //bots per team
  const botsPerAccount = Math.round((botCount / teamsWbots) * 10) / 10

  //active stripe subscriptions
  const activeSubscriptions = teams.reduce((acc, team) => {
    return team.stripeSubscriptionStatus === 'active' &&
      team.stripeSubscriptionCancelAtPeriodEnd === false
      ? acc + 1
      : acc
  }, 0)

  //percent of teams with active stripe subscriptions
  const percentAccountsWsubs = Math.round((activeSubscriptions / teamCount) * 1000) / 10

  //stripe signed up but not active
  const stripeSignedUp = teams.reduce((acc, team) => {
    return team.stripeSubscriptionId ? acc + 1 : acc
  }, 0)
  //percent of teams with stripe signed up but not active
  const percentAccountsWstripe = Math.round((stripeSignedUp / teamCount) * 1000) / 10

  const stats = [
    { name: 'Accounts', stat: teamCount },
    { name: 'Bots', stat: botCount },
    { name: 'Sources', stat: sourceCount },
    { name: 'Source Pages', stat: pageCount },
    { name: 'Questions Asked', stat: questionCount },
    {
      name: 'Accounts with Active Bots',
      stat: teamsWbots,
      previousStat: percentAccountsWbots + '%',
    },
    { name: 'Total Conversions', stat: stripeSignedUp, previousStat: percentAccountsWstripe + '%' },
    {
      name: 'Active Subscriptions',
      stat: activeSubscriptions,
      previousStat: percentAccountsWsubs + '%',
    },

    { name: 'Bots per Account', stat: botsPerAccount },
    { name: 'Sources per Account', stat: sourcesPerAccount },
    { name: 'Pages per Account', stat: pagesPerAccount },
    { name: 'Questions per Account', stat: questionsPerAccount },
  ]
  console.log('stats', stats)
  data.props.stats = stats

  data.props.steps = [
    {
      id: '100%',
      name: 'Signup',
      description: 'Create an account.',
      href: '#',
      status: 'upcoming',
    },
    {
      id: percentTeamBots + '%',
      name: 'Create Bot',
      description: 'Created a bot.',
      href: '#',
      status: 'upcoming',
    },
    {
      id: percentAccountsWbots + '%',
      name: 'Train Bot',
      description: 'Trained a bot.',
      href: '#',
      status: 'upcoming',
    },
    {
      id: percentAccountsWstripe + '%',
      name: 'Upgrade',
      description: 'Upgraded to a paid plan.',
      href: '#',
      status: 'upcoming',
    },
  ]

  data.props.cancelReasons = cancelReasons
  data.props.cancelReasonsList = cancelReasonsList

  return data
}

export default StatsPage
