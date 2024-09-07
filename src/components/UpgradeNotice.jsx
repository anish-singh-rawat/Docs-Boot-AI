import { useState, useEffect } from 'react'
import Alert from '@/components/Alert'
import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

export default function UpgradeNotice({ team, isSourcesPage }) {
  const [upgradeText, setUpgradeText] = useState(null)

  useEffect(() => {
    if (team?.botCredits === 0 && !isSourcesPage) {
      setUpgradeText(
        'You have no remaining bot credits. Please upgrade your plan to train bots.'
      )
    } else if (team?.botCount && team?.sourceCredits === 0) {
      setUpgradeText(
        'You have no remaining source credits. Please upgrade your plan to generate sources for your bots.'
      )
    }
  }, [team])

  return (
    <Alert title={upgradeText} type="warning">
      <Link href="/app/account">
        Manage plan <ArrowRightIcon className="inline ml-2 h-4 w-4" aria-hidden="true" />
      </Link>
    </Alert>
  )
}
