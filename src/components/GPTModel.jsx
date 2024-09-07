import { CubeIcon } from '@heroicons/react/24/outline'

export default function GPTModel({ bot }) {
  let label;
  if (bot.model === 'gpt-4') {
    label = 'GPT-4';
  } else if (bot.model === 'gpt-4-1106-preview') {
    label = 'GPT-4 Turbo (Preview)';
  } else {
    label = 'GPT-3.5';
  }
  return (
    <p className="flex items-center text-sm capitalize text-gray-500">
      <CubeIcon className="mr-1 h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
      {label}
    </p>
  )
}
