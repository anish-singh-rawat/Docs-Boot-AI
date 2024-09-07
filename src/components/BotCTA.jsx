import { useState } from 'react'
import RobotIcon from '@/components/RobotIcon'

export default function BotCTA({ setOpen }) {
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="relative mx-auto mt-16 block w-full max-w-2xl rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
    >
      <RobotIcon className="mx-auto h-14 w-14 text-gray-400"/>

      <span className="mt-2 block text-sm font-medium text-gray-900">Create a new bot</span>

      <p className="mt-1 text-sm text-gray-500">
        Train a new bot with your own documentation and content.
      </p>
    </button>
  )
}
