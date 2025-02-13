import clsx from 'clsx'

import { Icon } from '@/components/docs/Icon'

const styles = {
  note: {
    container:
      'bg-slate-800/60 ring-1 ring-slate-300/10',
    title: 'text-teal-400',
    body: 'text-teal-50 [--tw-prose-background:theme(colors.teal.50)] prose-a:text-teal-200 prose-code:text-teal-400 text-slate-300 prose-code:text-slate-300',
  },
  warning: {
    container:
      'bg-slate-800/60 ring-1 ring-slate-300/10',
    title: 'text-amber-500',
    body: 'text-amber-800 [--tw-prose-underline:theme(colors.amber.400)] [--tw-prose-background:theme(colors.amber.50)] prose-a:text-amber-900 prose-code:text-amber-900 text-slate-300 [--tw-prose-underline:theme(colors.teal.700)] prose-code:text-slate-300',
  },
}

const icons = {
  note: (props) => <Icon icon="lightbulb" {...props} />,
  warning: (props) => <Icon icon="warning" color="amber" {...props} />,
}

export function Callout({ type = 'note', title, children }) {
  let IconComponent = icons[type]

  return (
    <div className={clsx('my-8 flex rounded-3xl p-6', styles[type].container)}>
      <IconComponent className="h-8 w-8 flex-none" />
      <div className="ml-4 flex-auto">
        <p className={clsx('m-0 font-display text-xl', styles[type].title)}>
          {title}
        </p>
        <div className={clsx('prose mt-2.5', styles[type].body)}>
          {children}
        </div>
      </div>
    </div>
  )
}
