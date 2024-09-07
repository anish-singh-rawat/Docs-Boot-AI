import Link from 'next/link'

const Error = () => {
  return (
    <main className="grid min-h-full place-items-center bg-gray-900 px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">404</h1>
        <p className="mt-6 text-base leading-7 text-gray-300">Sorry, but we couldn't find the page you were looking for.</p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link href="/" className="rounded-md bg-gradient-to-r from-teal-500 to-cyan-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-teal-600 hover:to-cyan-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600">Go back home</Link>
          <a href="#" onClick={() => {DocsBotAI.open();}} className="text-sm font-semibold text-white">Contact support <span aria-hidden="true">&rarr;</span></a>
        </div>
      </div>
    </main>
  )
}

export default Error