import Head from 'next/head'
import Link from 'next/link'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import classNames from '@/utils/classNames'
import { NextSeo } from 'next-seo'

const colors = [
  { hex: '#0891B2', rgb: 'rgb(8, 145, 178)', bgColor: 'bg-cyan-600' },
  { hex: '#14B8A6', rgb: 'rgb(20, 184, 166)', bgColor: 'bg-teal-500' },
  { hex: '#111827', rgb: 'rgb(17, 24, 39)', bgColor: 'bg-gray-900' },
]

export default function Home() {
  return (
    <>
      <NextSeo
        title="Press & Branding Assets - DocsBot AI"
        description="Logos and media assets for DocsBot AI."
      />
      <Header />
      <main>
        <div className="bg-white">
          <div className="mx-auto max-w-7xl py-24 sm:px-2 sm:py-32 lg:px-4">
            <div className="mx-auto max-w-2xl px-4 lg:max-w-none">
              <div className="max-w-3xl">
                <h1 className="font-semibold text-gray-500">Branding Assets</h1>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  For Press and Media
                </h2>
                <p className="mt-4 text-gray-500">
                  We're happy to provide you with any of the following assets for your use. If you
                  need something that isn't listed here, just{' '}
                  <a href="mailto:human@docsbot.ai" className="underline">
                    contact us
                  </a>{' '}
                  and we'll get it to you as soon as possible.
                </p>
              </div>

              <div className="mt-10 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16">
                <h3 className="text-lg font-medium text-gray-900">Colors</h3>
                <ul role="list" className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
                  {colors.map((color) => (
                    <li key={color.hex} className="col-span-1 flex rounded-md shadow-sm">
                      <div
                        className={classNames(
                          color.bgColor,
                          'flex w-32 flex-shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white sm:w-16 lg:w-32'
                        )}
                      ></div>
                      <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-b border-r border-t border-gray-200 bg-white">
                        <div className="flex-1 truncate px-4 py-2 text-sm">
                          <p className="font-medium text-gray-900 hover:text-gray-600">
                            {color.hex}
                          </p>
                          <p className="text-gray-500">{color.rgb}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-10 space-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16">
                <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-8">
                  <div className="mt-6 lg:col-span-5 lg:mt-0 xl:col-span-4">
                    <h3 className="text-lg font-medium text-gray-900">Color Logo</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Use this logo on a white or color background.
                    </p>
                    <p className="text-md mt-2 flex space-x-2 text-gray-400">
                      <Link href="/branding/docsbot-logo-lg.png" target="_blank" download={true}>
                        PNG
                      </Link>
                      <Link href="/branding/docsbot-logo.svg" target="_blank" download={true}>
                        SVG
                      </Link>
                    </p>
                  </div>
                  <div className="flex-auto lg:col-span-7 xl:col-span-8">
                    <div className="aspect-h-2 aspect-w-5 overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src="/branding/docsbot-logo-lg.png"
                        alt="Color logo"
                        className="object-cover object-center"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-8">
                  <div className="mt-6 lg:col-span-5 lg:mt-0 xl:col-span-4">
                    <h3 className="text-lg font-medium text-gray-900">White Logo</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Use this logo on a dark or #111827 background.
                    </p>
                    <p className="text-md mt-2 flex space-x-2 text-gray-400">
                      <Link href="/branding/docsbot-logo-white.png" target="_blank" download={true}>
                        PNG
                      </Link>
                      <Link href="/branding/docsbot-logo-white.svg" target="_blank" download={true}>
                        SVG
                      </Link>
                    </p>
                  </div>
                  <div className="flex-auto lg:col-span-7 xl:col-span-8">
                    <div className="aspect-h-2 aspect-w-5 overflow-hidden rounded-lg bg-gray-900">
                      <img
                        src="/branding/docsbot-logo-white.png"
                        alt="White logo"
                        className="object-cover object-center"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
