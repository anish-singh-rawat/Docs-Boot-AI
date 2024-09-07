import Head from 'next/head'
import Header from '@/components/Header'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { remark } from 'remark'
import html from 'remark-html'
import remarkGfm from 'remark-gfm'
import Alert from '@/components/Alert'
import phImage from '@/images/logos/product-hunt-logo-horizontal-orange.png'
import { NextSeo } from 'next-seo'

export function ChatPage() {
  const [answer, setAnswer] = useState('')
  const [business, setBusiness] = useState('')
  const [resultHtml, setResultHtml] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [errorText, setErrorText] = useState(null)

  //convert markdown to html when answer changes or is appended to
  useEffect(() => {
    if (answer) {
      remark()
        .use(html)
        .use(remarkGfm)
        .process(answer)
        .then((html) => {
          setResultHtml(html.toString())
        })
    }
  }, [answer])

  // make api call to ask question
  const askQuestion = async () => {
    if (window.bento !== undefined) {
      window.bento.track('product_hunt_generate_comments')
    }
    setLoading(true)
    setErrorText(null)
    setAnswer('')
    setResultHtml('')
    setLoadingMessage('Sending...')
    let question =
      'Write an unordered list of 5 potential positive comments by a user for a Product Hunt post announcing the launch of DocsBot, proceed it with the header "Comment Ideas". Then create a list of 5 potential questions the user might have about DocsBot with the heading "Question Ideas".'

    //get apiBase from env
    const apiUrl = `wss://api.docsbot.ai/teams/ZrbLG98bbxZ9EFqiPvyl/bots/UMADr9eozeBQ8sZKr0GW/chat`
    const ws = new WebSocket(apiUrl)

    // Send message to server when connection is established
    ws.onopen = function (event) {
      setLoadingMessage('Thinking...')
      const req = { question: question, markdown: true }
      ws.send(JSON.stringify(req))
    }

    ws.onerror = function (event) {
      console.log('error', event)
      setErrorText('There was a connection error. Please try again.')
      setLoading(false)
      setLoadingMessage(null)
    }

    ws.onclose = function (event) {
      if (!event.wasClean) {
        setErrorText('Network error, please try again.')
        setLoading(false)
        setLoadingMessage(null)
      }
    }

    // Receive message from server word by word. Display the words as they are received.
    ws.onmessage = function (event) {
      const data = JSON.parse(event.data)
      if (data.sender === 'bot') {
        if (data.type === 'start') {
          //setLoadingMessage('Checking my sources...')
        } else if (data.type === 'stream') {
          setLoadingMessage('Answering...')
          //append to answer
          setAnswer((prev) => prev + data.message)
        } else if (data.type === 'info') {
          setLoadingMessage(data.message)
        } else if (data.type === 'end') {
          data = JSON.parse(data.message)
          setAnswer(data.answer)
          setLoading(false)
          setLoadingMessage(null)
          ws.close()
        } else if (data.type === 'error') {
          setErrorText(data.message)
          setLoading(false)
          setLoadingMessage(null)
          ws.close()
        }
      }
    }
  }

  return (
    <>
      <NextSeo
        title="Product Hunt Comment Generator - DocsBot AI"
        description="A DocsBot created page to generate potential reviews and questions for a Product Hunt launch."
      />
      <Header />
      <main className="mx-auto my-16 max-w-6xl">
        <div className="relative px-4 py-8">
          <div className="mx-auto max-w-md px-6 text-center sm:max-w-3xl lg:max-w-7xl lg:px-8">
            <div>
              <Link
                href="https://www.producthunt.com/posts/docsbot-ai?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-docsbot&#0045;ai"
                target="_blank"
                onClick={() => {
                  if (window.bento !== undefined) {
                    window.bento.track('product_hunt_rate')
                  }
                }}
                className="text-cyan-800 underline"
              >
                <Image src={phImage} width={250} height={90} alt="Product Hunt" />
              </Link>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                DocsBot Product Hunt Comment Inspiration
              </h1>
              {!resultHtml && (
                <p className="mx-auto mt-5 max-w-5xl text-lg text-gray-500">
                  Thanks for your help spreading the word about DocsBot via Product Hunt! Besides
                  rating,{' '}
                  <span className="font-semibold">
                    writing a comment, review, or question on our launch page has a HUGE impact!
                  </span>{' '}
                  So we built a little AI comment generator via our powerful API to give you some
                  inspiration and ideas!
                </p>
              )}
            </div>
            <div className="mt-12">
              <Alert title={errorText} type="warning" />

              {loading ? (
                <>
                  <div className="mt-4 flex items-center justify-center">
                    <div className="relative w-5">
                      <div className="h-5 w-5 rounded-full border border-teal-400"></div>
                      <div className="absolute left-0 top-0 h-5 w-5 animate-spin rounded-full border-t-2 border-cyan-600"></div>
                    </div>
                    <p className="ml-2 animate-pulse text-lg text-cyan-700">{loadingMessage}</p>
                  </div>
                </>
              ) : (
                <form
                  className="flex justify-center"
                  onSubmit={(e) => {
                    askQuestion()
                    e.preventDefault()
                  }}
                  disabled={loading}
                >
                  <div className="mt-1 flex w-full max-w-2xl rounded-md sm:shadow-sm">
                    <button
                      type="submit"
                      tabIndex={2}
                      className="relative mt-4 inline-flex w-full items-center justify-center space-x-2 rounded-md bg-gradient-to-r from-teal-500 to-cyan-600 px-4 py-3 text-sm font-bold text-white shadow hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900 sm:text-lg"
                    >
                      Generate Comments
                    </button>
                  </div>
                </form>
              )}
            </div>

            {resultHtml && (
              <>
                <div className="relative mt-16 rounded-sm bg-white text-left shadow-sm sm:rounded-lg ">
                  <div
                    className="wpchat-code prose min-w-full p-4 pb-2 sm:p-8 sm:pb-4"
                    dangerouslySetInnerHTML={{ __html: resultHtml }}
                  />
                </div>

                <div className="mt-12">
                  <div className="mt-4 items-center justify-center space-x-4  sm:flex">
                    <Link
                      href="https://www.producthunt.com/posts/docsbot-ai?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-docsbot&#0045;ai"
                      target="_blank"
                      onClick={() => {
                        if (window.bento !== undefined) {
                          window.bento.track('product_hunt_rate')
                        }
                      }}
                      className="mx-auto"
                    >
                      <img
                        src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=388863&theme=light"
                        alt="DocsBot&#0032;AI - Custom&#0032;ChatGPT&#0032;for&#0032;your&#0032;business&#0032;with&#0032;powerful&#0032;APIs&#0032;&#0038;&#0032;widget | Product Hunt"
                        style={{ width: '250px', height: '54px' }}
                        width="250"
                        height="54"
                        className="mx-auto block max-w-sm"
                      />
                    </Link>

                    <p className="mt-4 text-left text-xl text-gray-500 sm:m-0">
                      Now you can use your favorite comments as a starting point (make it your own),
                      then{' '}
                      <Link
                        href="https://www.producthunt.com/posts/docsbot-ai?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-docsbot&#0045;ai"
                        target="_blank"
                        onClick={() => {
                          if (window.bento !== undefined) {
                            window.bento.track('product_hunt_rate')
                          }
                        }}
                        className="text-cyan-800 underline"
                      >
                        visit our Product Hunt launch page
                      </Link>{' '}
                      to support us!
                    </p>
                  </div>
                  <p className="mx-auto mb-24 mt-12 max-w-5xl text-lg text-gray-500">
                    Thank you so much for your support of DocsBot! We can't wait to show you whats
                    next!
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

export default ChatPage
