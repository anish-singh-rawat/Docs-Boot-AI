import Link from 'next/link'

import { Logo } from '@/components/Logo'
import Image from 'next/image'
import docsbotLogo from '@/images/docsbot-logo-white.png'

function BackgroundIllustration(props) {
  return (
    <svg
      viewBox="0 0 1090 1090"
      aria-hidden="true"
      fill="none"
      preserveAspectRatio="none"
      {...props}
    >
      <circle cx={545} cy={545} r="544.5" />
      <circle cx={545} cy={545} r="480.5" />
      <circle cx={545} cy={545} r="416.5" />
      <circle cx={545} cy={545} r="352.5" />
    </svg>
  )
}

export function AuthLayout({ title, subtitle, children }) {
  return (
    <main className="flex min-h-full overflow-hidden pt-10 sm:py-18 bg-gradient-to-r from-teal-500 to-cyan-600">
      <div className="mx-auto flex w-full max-w-2xl flex-col px-4 sm:px-6">
        <Link href="/" aria-label="Home" className='mx-auto'>
          <Image src={docsbotLogo} alt="Docsbot" />
        </Link>
        <div className="relative mt-8 sm:mt-12">
          <h1 className="text-center text-2xl font-medium tracking-tight text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 text-center text-lg text-white">{subtitle}</p>
          )}
        </div>
        <div className="-mx-4 mt-10 flex-auto bg-white py-10 px-4 shadow-2xl shadow-gray-900/10 sm:mx-0 sm:flex-none sm:rounded-2xl sm:p-24">
          {children}
        </div>
      </div>
    </main>
  )
}
