import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { ArrowPathIcon, ArrowRightCircleIcon, PencilIcon } from '@heroicons/react/24/outline'
import { getAuthorizedUserCurrentTeam } from '@/middleware/getAuthorizedUserCurrentTeam'
import { getUser } from '@/lib/dbQueries'
import DashboardWrap from '@/components/DashboardWrap'
import Alert from '@/components/Alert'
import ModalOpenAI from '@/components/ModalOpenAI'
import openAILogo from '@/images/logos/openai-logo.svg'

function Api({ user, team }) {
  const [errorText, setErrorText] = useState(null)
  const [open, setOpen] = useState(team.openAIKey ? false : true)
  const [apiKey, setApiKey] = useState(user.apiKey || 'No Key')
  const [copyMessage, setCopyMessage] = useState(null)

  useEffect(() => {
    if (!open && !team.openAIKey) {
      setOpen(true)
    }
  }, [open])

  async function updateKey() {
    setErrorText('')

    const urlParams = ['users', user.id]
    const apiPath = '/api/' + urlParams.join('/')

    const response = await fetch(apiPath, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey: true }),
    })
    if (response.ok) {
      const data = await response.json()
      setApiKey(data.apiKey)
      setCopyMessage('Copy this key now, you will not be able to view it again.')
    } else {
      try {
        const data = await response.json()
        setErrorText(data.message || 'Something went wrong, please try again.')
      } catch (e) {
        setErrorText('Error ' + response.status + ', please try again.')
      }
    }
  }

  return (
    <DashboardWrap page="API" team={team}>
      <Alert title={errorText} type="error" />
      <ModalOpenAI
        {...{
          team,
          open,
          setOpen,
          onKey: (key) => {
            team.openAIKey = key.substring(0, 3) + '...' + key.substring(47, 51)
          },
        }}
      />
      <div className="rounded-lg bg-white p-8 shadow">
        <h3 className="text-2xl font-bold">{team.AzureDeploymentBase && 'Azure '}OpenAI API Key</h3>

        {team.AzureDeploymentBase ? (
          <>
            <p className="text-md mt-2 text-justify text-gray-800">
              Your team is configured to use an Azure custom endpoint. You should enter your Azure
              API key here.{' '}
              <Link
                className="text-cyan-800 underline"
                href="https://learn.microsoft.com/en-us/azure/ai-services/openai/quickstart?tabs=command-line%2Cpython-new&pivots=programming-language-python#retrieve-key-and-endpoint"
                target="_blank"
              >
                Get my Azure key
              </Link>
              . To change your deployment settings, please contact support.
            </p>
            <ul>
              <li className="text-md mt-2 text-justify text-gray-800">
                <strong>Endpoint:</strong> {team.AzureDeploymentBase}
              </li>
              <li className="text-md mt-2 text-justify text-gray-800">
                <strong>Deployment Name:</strong> {team.AzureDeploymentName}
              </li>
              <li className="text-md mt-2 text-justify text-gray-800">
                <strong>API Version:</strong> {team.AzureDeploymentVersion}
              </li>
            </ul>
          </>
        ) : (
          <p className="text-md mt-2 text-justify text-gray-800">
            You can update your API key here. You must have a valid API key with billing enabled in
            your OpenAI account for DocsBot to function.{' '}
            <Link
              className="text-cyan-800 underline"
              href="https://platform.openai.com/api-keys"
              target="_blank"
            >
              Get my OpenAI key
            </Link>
            .
          </p>
        )}
        <div className="mt-4 flex justify-between">
          <div>
            <div className="mt-4 flex items-center justify-start">
              <pre className="">{team.openAIKey}</pre>
              <a
                type="button"
                className="ml-2 flex cursor-pointer items-center justify-end text-sm font-medium text-gray-500 hover:text-gray-900"
                onClick={() => {
                  setOpen(true)
                }}
              >
                <PencilIcon className="mr-0.5 h-4 w-4" aria-hidden="true" />
                Edit
              </a>
            </div>
            {team.supportsGPT4 ? (
              <p className="mt-4 text-sm italic">GPT-4 Support Enabled</p>
            ) : (
              <>
                <Link
                  className="mt-4 block text-sm underline hover:text-gray-500"
                  href="https://openai.com/waitlist/gpt-4-api"
                  target="_blank"
                >
                  GPT-4 access details
                </Link>
                <p className="mt-1 text-xs italic">
                  Optional - Once approved update your OpenAI API key to enable GPT-4
                </p>
              </>
            )}
          </div>
          <Image src={openAILogo} alt="OpenAI logo" width={130} height={90} />
        </div>
      </div>

      <div className="mt-8 rounded-lg bg-white p-8 shadow">
        <h3 className="text-2xl font-bold">DocsBot API Key</h3>
        <p className="text-md mt-2 text-justify text-gray-800">
          You can get your DocsBot API key here that can be used for the admin API and querying
          private bots. This key is is tied to your user account and can be used to access all teams
          that you have a role for.
        </p>
        <div className="mt-4 flex items-center justify-start">
          <pre className="block">{apiKey}</pre>
          <a
            type="button"
            className="ml-2 flex cursor-pointer items-center justify-end text-sm font-medium text-gray-500 hover:text-gray-900"
            onClick={() => {
              updateKey()
            }}
          >
            <ArrowPathIcon className="mr-0.5 h-4 w-4" aria-hidden="true" />
            Change
          </a>
        </div>
        <p className="mt-1 text-justify text-sm text-gray-800">{copyMessage}</p>
      </div>

      <div className="mt-8 rounded-lg bg-white p-8 shadow">
        <h3 className="text-2xl font-bold">API Documentation</h3>
        <p className="text-md mt-2 text-justify text-gray-800">
          You can find the full{' '}
          <Link href="/documentation/developer" className="text-cyan-800 underline">
            DocsBot API documentation here
          </Link>
          . You can use the API key above to access the admin API and query private bots. You will
          use the team ID below for the admin API and chat APIs.
        </p>
        <h3 className="mt-8 text-xl font-bold">Team ID</h3>
        <pre className="block">{team.id}</pre>
      </div>
    </DashboardWrap>
  )
}

export const getServerSideProps = async (context) => {
  const data = await getAuthorizedUserCurrentTeam(context)

  // get user data
  data.props.user = await getUser(data.props.userId)

  return data
}

export default Api
