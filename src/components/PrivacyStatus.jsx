import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export default function PrivacyStatus({ bot }) {
  return (
    <p className="flex items-center text-sm capitalize text-gray-500">
      {bot.privacy === 'private' ? (
        <EyeSlashIcon className="mr-1 h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
      ) : (
        <EyeIcon className="mr-1 h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
      )}
      {bot.privacy}
    </p>
  )
}
