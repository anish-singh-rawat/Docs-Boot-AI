import React, { useEffect, useState, useRef } from 'react'
import html from 'remark-html'
import remarkGfm from 'remark-gfm'
import { remark } from 'remark'
import remarkExternalLinks from 'remark-external-links'
import { MagnifyingGlassIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import { LinkIcon, DocumentTextIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import clsx from 'clsx'

const BotSearch = ({ team, bot, setErrorText }) => {
  const [searchInput, setSearchInput] = useState('')
  const [searchSize] = useState(5)
  const [searchData, setSearchData] = useState([])
  const [selectedButton, setSelectedButton] = useState(-1)
  const [selectedCardData, setSelectedCardData] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = textarea.scrollHeight + 'px'
    }
  }, [searchInput])

  const SourceIcon = ({ source }) => {
    const SourceIcon = source?.url ? LinkIcon : DocumentTextIcon
    return <SourceIcon className="h-5 w-5 flex-none" />
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSelectedButton(-1)
    setSelectedCardData('')
    if (searchInput.trim().length) {
      const apiUrl = `${process.env.NEXT_PUBLIC_BOT_API_URL}/teams/${team.id}/bots/${bot.id}/search`
      const searchPayload = {
        query: searchInput,
        top_k: searchSize,
      }
      const headers = {
        'Content-Type': 'application/json',
      }
      if (bot.privacy === 'private') {
        //add token to request
        headers['Authorization'] = 'Bearer ' + bot.signature
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(searchPayload),
      })
      if (response.ok) {
        const data = await response.json()
        setSearchData(data)
        setErrorText('')
        setLoading(false)
      } else {
        try {
          const data = await response.json()
          setErrorText(data?.error || 'Something went wrong, please try again.')
          setLoading(false)
        } catch (e) {
          setErrorText('Error ' + response.status + ', please try again.')
          setLoading(false)
        }
      }
    }
  }

  const getMarkdownHtml = (text) => {
    remark()
      .use(html)
      .use(remarkGfm)
      .use(remarkExternalLinks, { target: '_blank', rel: ['noopener'] })
      .process(text)
      .then((html) => {
        setHtmlContent(html.toString())
      })
  }

  useEffect(() => {
    if (selectedCardData) {
      const htmlContent = getMarkdownHtml(selectedCardData.content)
      setHtmlContent(htmlContent)
    }
  }, [selectedCardData])

  return (
    <div className={clsx('grid grid-cols-1 gap-4', selectedCardData ? 'lg:grid-cols-2' : "max-w-4xl mx-auto")}>
      <div className="w-full">
        <form className="w-full" onSubmit={handleSearch}>
          <div className="w-full rounded-md sm:flex sm:shadow-sm">
            <div className="relative flex w-full flex-grow items-end shadow-sm sm:shadow-inherit">
              <textarea
                ref={textareaRef}
                name="searchInput"
                id="searchInput"
                value={searchInput}
                maxLength={2000}
                minLength={2}
                required
                rows={1}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(e) => {
                  //this detects if the user is typing in a IME session (ie Kanji autocomplete) to avoid premature submission
                  if (e.isComposing || e.keyCode === 229) {
                    return
                  }
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (e.shiftKey) {
                      setSearchInput((prevQuestion) => `${prevQuestion}\n`)
                    } else if (!e.shiftKey && !loading) {
                      handleSearch(e) // Call the handleSearch function to submit the form
                    }
                  }
                }}
                tabIndex={1}
                autoComplete="off"
                className="block max-h-48 w-full resize-none rounded-md border border-gray-200 py-4 pl-2 pr-10 text-lg outline-none placeholder:text-gray-400 focus:border-none focus:border-cyan-500 focus:ring-cyan-500 disabled:opacity-50 sm:py-2 sm:pl-4 sm:pr-12 sm:text-lg"
                placeholder="Enter a question"
              />

              <button
                type="submit"
                tabIndex={2}
                disabled={loading}
                className="absolute right-0 my-3 mr-2 rounded-sm  px-1 text-cyan-600 hover:text-cyan-700 hover:ring-cyan-600 focus:outline-none focus:ring-1 focus:ring-offset-2 disabled:opacity-50"
              >
                <span className="sr-only">Search training documentation</span>
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="relative w-5">
                      <div className="h-5 w-5 rounded-full border border-teal-400"></div>
                      <div className="absolute left-0 top-0 h-5 w-5 animate-spin rounded-full border-t-2 border-cyan-600"></div>
                    </div>
                  </div>
                ) : (
                  <MagnifyingGlassIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
          <div className="mt-1 flex items-center justify-end text-xs text-gray-500">
            <span>Use Shift + Enter to skip to a new line.</span>
            {searchInput && (
              <button
                type="button"
                className="mx-1 flex items-center text-gray-600 hover:text-cyan-700 focus:outline-none focus:ring-1 focus:ring-offset-2"
                onClick={() => {
                  setSearchInput('')
                  setSearchData([])
                  setSelectedButton(-1)
                  setSelectedCardData('')
                }}
              >
                <ArrowPathIcon className="mr-0.5 h-3 w-3" aria-hidden="true" />
                Reset
              </button>
            )}
          </div>
        </form>
        {searchData.length ? (
          <ul
            role="list"
            className="mt-8 divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl"
          >
            {searchData.map((item, index) => (
              <li
                key={index}
                className={clsx(
                  'relative px-4 py-5 hover:bg-gray-50 sm:px-6',
                  selectedButton === index ? 'bg-gray-50' : null
                )}
              >
                <button
                  onClick={() => {
                    setSelectedButton(index)
                    setSelectedCardData(item)
                  }}
                  className="flex w-full items-center justify-between gap-x-6"
                >
                  <div className="flex min-w-0 items-center gap-x-4">
                    <SourceIcon source={item} />
                    <div className="min-w-0 flex-auto">
                      <p className="text-left text-sm font-semibold leading-6 text-gray-900">
                        {item.title}
                      </p>
                      {item.url && (
                        <p className="mt-1 flex text-xs leading-5 text-gray-500">
                          <Link
                            href={item.url}
                            className="relative truncate hover:underline"
                            target="_blank"
                          >
                            {item.url}
                          </Link>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-x-4">
                    <div className="hidden sm:flex sm:flex-col sm:items-end">
                      <p className="text-sm leading-6 text-gray-900">
                        {item?.page ? `Page ${item?.page}` : ''}
                      </p>
                    </div>
                  </div>
                  <ChevronRightIcon
                    className="h-5 w-5 flex-none text-gray-400"
                    aria-hidden="true"
                  />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {selectedCardData ? (
        <div className="w-full divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow">
          <div className="flex items-center gap-x-2 px-4 py-5 sm:px-6">
            <SourceIcon source={selectedCardData} />
            {selectedCardData.url ? (
              <Link href={selectedCardData.url} target="_blank">
                {selectedCardData.title}
              </Link>
            ) : (
              <span>{selectedCardData.title}</span>
            )}
          </div>
          <div
            className="prose min-w-full px-4 py-5 sm:p-6"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      ) : null}
    </div>
  )
}

export default BotSearch
