import { useState, useEffect, useRef } from 'react'
import { getAuthorizedUserCurrentTeam } from '@/middleware/getAuthorizedUserCurrentTeam'
import DashboardWrap from '@/components/DashboardWrap'
import Alert from '@/components/Alert'
import { getBot } from '@/lib/dbQueries'
import {
  ChevronLeftIcon,
  XMarkIcon,
  PhotoIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import FieldToggle from '@/components/FieldToggle'
import FieldRadioIcon from '@/components/FieldRadioIcon'
import { i18n } from '@/constants/strings.constants'
import { SketchPicker } from 'react-color'
import {
  faComment,
  faComments,
  faRobot,
  faLifeRing,
  faQuestion,
  faBook,
} from '@fortawesome/free-solid-svg-icons'
import { stripePlan } from '@/utils/helpers'
import ModalCheckout from '@/components/ModalCheckout'
import { ref, uploadBytes } from 'firebase/storage'
import { storage } from '@/config/firebase-ui.config'
import { uuidv4 } from '@firebase/util'
import WidgetPreview from '@/components/WidgetPreview'

//icon can be default, robot, life-ring, or question-circle
const iconMap = {
  default: faComment,
  comments: faComments,
  robot: faRobot,
  'life-ring': faLifeRing,
  question: faQuestion,
  book: faBook,
}

function Widget({ team, bot }) {
  const [errorText, setErrorText] = useState(null)
  const [infoText, setInfoText] = useState(null)
  const [copied, setCopied] = useState(false)
  const [copiedIframe, setCopiedIframe] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)

  //bot settings
  const [allowedDomains, setAllowedDomains] = useState(bot.allowedDomains || [])
  const [allowedDomainsText, setAllowedDomainsText] = useState(allowedDomains.join(', '))
  const [logo, setLogo] = useState(bot.logo || null)
  const [headerAlignment, setHeaderAlignment] = useState(bot.headerAlignment || 'center')
  const [color, setColor] = useState(bot.color || '#1292EE')
  const [icon, setIcon] = useState(bot.icon || 'default')
  const [alignment, setAlignment] = useState(bot.alignment || 'right')
  const [botIcon, setBotIcon] = useState(bot.botIcon || 'none')
  const [branding, setBranding] = useState(bot.branding === undefined ? true : bot.branding)
  const [supportLink, setSupportLink] = useState(bot.supportLink || '')
  const [showButtonLabel, setShowButtonLabel] = useState(bot.showButtonLabel || false)
  const [labels, setLabels] = useState(bot.labels || i18n[bot.language]?.labels || i18n.en.labels)
  const [hideSources, setHideSources] = useState(bot.hideSources)
  const iconRef = useRef(null)
  const avatarRef = useRef(null)
  const logoRef = useRef(null)

  useEffect(() => {
    if (!branding && stripePlan(team).bots < 10) {
      setShowUpgrade(true)
      setBranding(true)
    }
  }, [branding, team])

  useEffect(() => {
    if (icon === 'custom') {
      //open file picker
      iconRef.current.click()
    }
    if (botIcon === 'custom') {
      //open file picker
      avatarRef.current.click()
    }
  }, [icon, botIcon])

  function handleFileChange(e, type) {
    const file = e.target.files[0]
    if (file) {
      //upload to firebase cloud storage
      //generate uuid for file name with same extension
      const uuid = uuidv4()
      const extension = file.name.split('.').pop()
      //move the file to the correct location in bucket
      const filepath = `teams/${team.id}/bots/${bot.id}/images/${uuid}.${extension}`
      const storageRef = ref(storage, filepath)

      uploadBytes(storageRef, file)
        .then((snapshot) => {
          //get public url for file
          const url = 'https://cdn.docsbot.ai/' + encodeURIComponent(filepath) + '?alt=media'
          //const url = 'https://firebasestorage.googleapis.com/v0/b/docsbot-test-c2482.appspot.com/o/' + encodeURIComponent(filepath) + '?alt=media'
          if (type === 'icon') setIcon(url)
          if (type === 'avatar') setBotIcon(url)
          if (type === 'logo') setLogo(url)
        })
        .catch((error) => {
          console.warn(error)
          setErrorText(
            'Error uploading file, please try again. If the problem persists, try logging out then back in again.'
          )
        })
    }
  }

  async function updateBot() {
    setAllowedDomainsText(allowedDomains.join(', '))
    setErrorText('')
    setIsUpdating(true)

    const botSettings = {
      allowedDomains,
      color,
      icon,
      alignment,
      botIcon: botIcon === 'none' ? false : botIcon,
      branding,
      supportLink,
      showButtonLabel,
      labels,
      hideSources,
      logo,
      headerAlignment,
    }

    const urlParams = ['teams', team.id, 'bots', bot.id]
    const apiPath = '/api/' + urlParams.join('/')

    const response = await fetch(apiPath, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(botSettings),
    })
    if (response.ok) {
      const data = await response.json()
      setIsUpdating(false)
    } else {
      try {
        const data = await response.json()
        setErrorText(data.message || 'Something went wrong, please try again.')
      } catch (e) {
        setErrorText(response.status + ', please try again.')
      }
      setIsUpdating(false)
    }
  }

  const embed = `<script type="text/javascript">window.DocsBotAI=window.DocsBotAI||{},DocsBotAI.init=function(c){return new Promise(function(e,o){var t=document.createElement("script");t.type="text/javascript",t.async=!0,t.src="https://widget.docsbot.ai/chat.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n),t.addEventListener("load",function(){window.DocsBotAI.mount({id:c.id,supportCallback:c.supportCallback,identify:c.identify,options:c.options,signature:c.signature});var t;t=function(n){return new Promise(function(e){if(document.querySelector(n))return e(document.querySelector(n));var o=new MutationObserver(function(t){document.querySelector(n)&&(e(document.querySelector(n)),o.disconnect())});o.observe(document.body,{childList:!0,subtree:!0})})},t&&t("#docsbotai-root").then(e).catch(o)}),t.addEventListener("error",function(t){o(t.message)})})};</script>
<script type="text/javascript">
  DocsBotAI.init({id: "${team.id}/${bot.id}"});
</script>`
  const iframe = `<iframe src="https://docsbot.ai/iframe/${team.id}/${bot.id}" width="600" height="650" frameborder="0" allowtransparency="true" scrolling="no"></iframe>`

  if (!bot) return null

  const title = [bot.name, 'Widget']

  return (
    <DashboardWrap page="Bots" title={title} team={team} fullWidth={true}>
      <Alert title={infoText} type="info" />
      <Alert title={errorText} type="warning" />

      <div className="mb-4 flex justify-start">
        <Link
          href={`/app/bots/${bot.id}`}
          className="text-md flex items-center font-medium text-gray-500 hover:text-gray-700"
        >
          <ChevronLeftIcon
            className="mr-1 h-4 w-4 flex-shrink-0 text-gray-400"
            aria-hidden="true"
          />
          Back
        </Link>
      </div>

      <div className="xl:flex">
        <div className="flex-1 overflow-hidden bg-white shadow sm:rounded-lg">
          <ModalCheckout team={team} open={showUpgrade} setOpen={setShowUpgrade} />
          <form
            onSubmit={(e) => {
              e.preventDefault()
              updateBot()
            }}
          >
            <div className="rounded-lg bg-white p-8 shadow">
              <h3 className="text-2xl font-bold">Chat Widget Embed Code</h3>
              <p className="text-md mt-2 text-justify text-gray-800">
                You can embed this DocsBot as a floating widget on your website by adding the following code to your HTML
                page anywhere before the closing &lt;/body&gt; tag.
              </p>
              <pre
                className="mx-auto w-full mt-2 block text-xs overflow-scroll whitespace-prewrap rounded-md border-2 border-solid border-gray-200 bg-gray-700 px-4 py-2 font-mono text-white"
                disabled
              >
                {embed}
              </pre>
              <p className="text-md mt-4 text-justify text-gray-800">
                Or embed as an iframe into a page in your website or many cloud services.
              </p>
              <pre
                className="mx-auto w-full mt-2 block text-xs overflow-scroll whitespace-prewrap rounded-md border-2 border-solid border-gray-200 bg-gray-700 px-4 py-2 font-mono text-white"
                disabled
              >
                {iframe}
              </pre>
              <div className="mx-auto mb-8 mt-4 items-center justify-between space-x-0 space-y-2 lg:flex lg:space-x-2 lg:space-y-0">
              <div className="items-center justify-between space-x-1 flex">
              <button
                  className="rounded bg-cyan-600 px-4 py-2 text-white hover:bg-cyan-600 active:opacity-80"
                  onClick={(e) => {
                    e.preventDefault()
                    navigator.clipboard.writeText(embed)
                    setCopied(true)
                    setTimeout(() => {
                      setCopied(false)
                    }, 2000)
                  }}
                >
                  {copied ? 'Copied!' : 'Copy embed'}
                </button>
                <button
                  className="rounded bg-cyan-600 px-4 py-2 text-white hover:bg-cyan-600 active:opacity-80"
                  onClick={(e) => {
                    e.preventDefault()
                    navigator.clipboard.writeText(iframe)
                    setCopiedIframe(true)
                    setTimeout(() => {
                      setCopiedIframe(false)
                    }, 2000)
                  }}
                >
                  {copiedIframe ? 'Copied!' : 'Copy iframe'}
                </button>
                </div>
                {bot.privacy === 'private' && (
                  <div className="relative flex h-10 rounded-md shadow-sm ring-1 ring-inset ring-gray-300 sm:max-w-md lg:w-1/3">
                    <span className="flex select-none items-center pl-3 text-xs text-gray-500">
                      {copiedKey ? 'Copied!' : 'Signing Key'}
                    </span>
                    <input
                      type="text"
                      id="embedding-key"
                      className="block flex-1 overflow-hidden border-0 bg-transparent py-1.5 pl-1 pr-8 text-xs text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:leading-6"
                      value={bot.signatureKey}
                      readOnly
                    />
                    <button
                      className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 hover:text-gray-600"
                      onClick={(e) => {
                        e.preventDefault()
                        navigator.clipboard.writeText(bot.signatureKey)
                        setCopiedKey(true)
                        setTimeout(() => {
                          setCopiedKey(false)
                        }, 2000)
                      }}
                      disabled={copiedKey}
                    >
                      <ClipboardDocumentIcon className="h-5 w-5" aria-hidden="true" />
                      <span className="sr-only">Copy key</span>
                    </button>
                  </div>
                )}
                <Link
                  href="/documentation/developer/embeddable-chat-widget"
                  className="mt-4 block text-cyan-800 underline sm:mt-0"
                >
                  Full widget documentation
                </Link>
              </div>

              <h3 className="text-2xl font-bold">Customize the Widget</h3>
              <Alert title={errorText} type="error" />
              <p className="text-md text-gray-700">
                Customize the behavior and appearance of your chat widget. Changes can take a few
                minutes to appear on your site.
              </p>

              <div className="flex flex-1 flex-col justify-between">
                <div className="divide-y divide-gray-200">
                  <div className="space-y-6 pb-5 pt-6">
                    <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:space-x-8 sm:space-y-0">
                      <div className="flex-none">
                        <label className="mb-2 block text-sm font-medium text-gray-900">
                          Widget Color
                        </label>
                        <SketchPicker
                          color={color}
                          onChange={(color) => setColor(color.hex)}
                          disableAlpha={true}
                          presetColors={[
                            '#F44336',
                            '#E91E63',
                            '#9C27B0',
                            '#673AB7',
                            '#3F51B5',
                            '#2196F3',
                            '#03A9F4',
                            '#00BCD4',
                            '#009688',
                            '#4CAF50',
                            '#FFEB3B',
                            '#FF9800',
                            '#FF5722',
                            '#607D8B',
                            '#FFFFFF',
                            '#000000',
                          ]}
                        />
                      </div>
                      <div className="flex flex-col justify-between space-y-4 sm:space-y-0">
                        <FieldRadioIcon
                          type="icon"
                          label="Button Icon"
                          icon={icon}
                          setIcon={setIcon}
                          disabled={isUpdating}
                        />
                        <input
                          ref={iconRef}
                          type="file"
                          accept="image/png, image/jpeg, image/gif, image/webp"
                          onChange={(e) => handleFileChange(e, 'icon')}
                          className="sr-only"
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-900">
                            Button Alignment
                          </label>
                          <fieldset className="mt-4">
                            <legend className="sr-only">Alignment</legend>
                            <div className="space-y-4 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
                              <div className="flex items-center">
                                <input
                                  id="left"
                                  name="alignment"
                                  type="radio"
                                  checked={alignment === 'left'}
                                  onChange={() => setAlignment('left')}
                                  className="h-4 w-4 border-gray-300 text-cyan-600 focus:ring-cyan-600"
                                />
                                <label
                                  htmlFor="left"
                                  className="ml-3 block text-sm font-medium leading-6 text-gray-900"
                                >
                                  Left
                                </label>
                              </div>
                              <div className="flex items-center">
                                <input
                                  id="right"
                                  name="alignment"
                                  type="radio"
                                  checked={alignment === 'right'}
                                  onChange={() => setAlignment('right')}
                                  className="h-4 w-4 border-gray-300 text-cyan-600 focus:ring-cyan-600"
                                />
                                <label
                                  htmlFor="right"
                                  className="ml-3 block text-sm font-medium leading-6 text-gray-900"
                                >
                                  Right
                                </label>
                              </div>
                            </div>
                          </fieldset>
                        </div>
                        <FieldToggle
                          label="Show Button Text"
                          description="Show text next to the floating button icon?"
                          enabled={showButtonLabel}
                          setEnabled={setShowButtonLabel}
                          disabled={isUpdating}
                        />
                        <div>
                          <label
                            htmlFor="button-label"
                            className="block text-sm font-medium text-gray-900"
                          >
                            Button Text
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="button-label"
                              id="button-label"
                              value={labels.floatingButton}
                              onChange={(e) =>
                                setLabels({ ...labels, floatingButton: e.target.value })
                              }
                              disabled={!showButtonLabel || isUpdating}
                              placeholder="Button text"
                              className="block rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 disabled:opacity-50 sm:text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <FieldRadioIcon
                      type="bot"
                      label="Bot Avatar"
                      icon={botIcon}
                      setIcon={setBotIcon}
                      disabled={isUpdating}
                    />
                    <input
                      ref={avatarRef}
                      type="file"
                      accept="image/png, image/jpeg, image/gif, image/webp"
                      onChange={(e) => handleFileChange(e, 'avatar')}
                      className="sr-only"
                    />
                    <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:space-x-8 sm:space-y-0">
                      <div className="w-full">
                        <label htmlFor="logo" className="block text-sm font-medium text-gray-900">
                          Header Logo
                        </label>
                        <div className="relative mt-2 flex items-center gap-x-3">
                          {logo ? (
                            <div className="flex">
                              <img
                                src={logo}
                                alt="logo"
                                className="max-h-9 w-auto group-hover:opacity-75"
                              />
                              <button
                                type="button"
                                onClick={() => setLogo(null)}
                                className="focus:outline-none"
                              >
                                <XMarkIcon
                                  className="h-4 w-4 text-gray-400 hover:text-gray-500"
                                  aria-hidden="true"
                                />
                                <span className="sr-only">Remove logo</span>
                              </button>
                            </div>
                          ) : (
                            <PhotoIcon className="h-12 w-12 text-gray-300" aria-hidden="true" />
                          )}
                          <input
                            ref={logoRef}
                            type="file"
                            id="logo"
                            accept="image/png, image/jpeg, image/gif, image/webp"
                            onChange={(e) => handleFileChange(e, 'logo')}
                            className="sr-only"
                          />
                          <button
                            type="button"
                            onClick={() => logoRef.current.click()}
                            className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                          >
                            {logo ? 'Change' : 'Upload'}
                          </button>
                        </div>
                      </div>
                      <div className="w-full">
                        <label className="block text-sm font-medium text-gray-900">
                          Header Alignment
                        </label>
                        <fieldset className="mt-4">
                          <legend className="sr-only">Alignment</legend>
                          <div className="space-y-4 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
                            <div className="flex items-center">
                              <input
                                id="logo-left"
                                name="headerAlignment"
                                type="radio"
                                checked={headerAlignment === 'left'}
                                onChange={() => setHeaderAlignment('left')}
                                className="h-4 w-4 border-gray-300 text-cyan-600 focus:ring-cyan-600"
                              />
                              <label
                                htmlFor="logo-left"
                                className="ml-3 block text-sm font-medium leading-6 text-gray-900"
                              >
                                Left
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                id="logo-center"
                                name="headerAlignment"
                                type="radio"
                                checked={headerAlignment === 'center'}
                                onChange={() => setHeaderAlignment('center')}
                                className="h-4 w-4 border-gray-300 text-cyan-600 focus:ring-cyan-600"
                              />
                              <label
                                htmlFor="logo-center"
                                className="ml-3 block text-sm font-medium leading-6 text-gray-900"
                              >
                                Center
                              </label>
                            </div>
                          </div>
                        </fieldset>
                      </div>
                    </div>

                    <div className="w-full">
                      <label
                        htmlFor="message-label"
                        className="block text-sm font-medium text-gray-900"
                      >
                        First Message
                      </label>
                      <span className="text-sm text-gray-500">
                        This text will appear as the first message from the bot displayed to the
                        user. Supports{' '}
                        <Link
                          href="https://www.markdownguide.org/basic-syntax/"
                          target="_blank"
                          className="text-cyan-600 underline hover:font-semibold"
                        >
                          Markdown
                        </Link>
                        . Optional, leave blank to disable.
                      </span>
                      <div className="mt-1">
                        <textarea
                          name="message-label"
                          id="message-label"
                          value={labels.firstMessage}
                          onChange={(e) => setLabels({ ...labels, firstMessage: e.target.value })}
                          disabled={isUpdating}
                          placeholder="Enter your message here..."
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 disabled:opacity-50 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:space-x-8 sm:space-y-0">
                      <div className="w-full">
                        <label
                          htmlFor="support-link"
                          className="block text-sm font-medium text-gray-900"
                        >
                          Support Link
                        </label>
                        <span className="text-sm text-gray-500">
                          This link will appear after the bot replies. Optional, leave blank to
                          hide.
                        </span>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="support-link"
                            id="support-link"
                            value={supportLink}
                            onChange={(e) => setSupportLink(e.target.value)}
                            disabled={isUpdating}
                            placeholder="https://example.com/support/"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 disabled:opacity-50 sm:text-sm"
                          />
                        </div>
                      </div>
                      <div className="w-full">
                        <label
                          htmlFor="support-label"
                          className="block text-sm font-medium text-gray-900"
                        >
                          Support Button Text
                        </label>
                        <span className="text-sm text-gray-500">
                          This text will appear on the support link button if a link has been set.
                        </span>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="support-label"
                            id="support-label"
                            value={labels.getSupport}
                            onChange={(e) => setLabels({ ...labels, getSupport: e.target.value })}
                            disabled={isUpdating}
                            placeholder="Support text"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 disabled:opacity-50 sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:space-x-8 sm:space-y-0">
                      <FieldToggle
                        label="Show Sources"
                        description="Show sources titles and links after answers."
                        enabled={!hideSources}
                        setEnabled={() => setHideSources(!hideSources)}
                        disabled={isUpdating}
                      />
                      <FieldToggle
                        label="Show Branding"
                        description="If your plan allows you can disable the DocsBot branding in your widget footer."
                        enabled={branding}
                        setEnabled={setBranding}
                        disabled={isUpdating || stripePlan(team).bots < 10}
                      />
                    </div>

                    <div className="w-full">
                      <label htmlFor="domains" className="block text-sm font-medium text-gray-900">
                        Allowed Domains
                      </label>
                      <span className="text-sm text-gray-500">
                        Enter a comma-separated list of domains that are allowed to embed this
                        widget. Any subdomains must be listed seperately. Leave blank to allow all
                        domains.
                      </span>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="domains"
                          id="domains"
                          value={allowedDomainsText}
                          onChange={(e) => {
                            setAllowedDomainsText(e.target.value)
                            setAllowedDomains(
                              e.target.value
                                .split(',')
                                .filter((s) => s)
                                .map((d) => d.trim().toLowerCase())
                            )
                          }}
                          disabled={isUpdating}
                          placeholder="mysite.com, www.mysite.com, anotherdomain.com, etc"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 disabled:opacity-50 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-end sm:mt-6">
                <button
                  type="submit"
                  name="submit-form"
                  className="inline-flex w-1/4 items-center justify-center rounded-md border border-transparent bg-cyan-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-75 sm:text-sm"
                  disabled={isUpdating}
                >
                  {!isUpdating ? (
                    <span>Save</span>
                  ) : (
                    <span>
                      <LoadingSpinner /> Saving...
                    </span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
        <div className="mx-auto mt-8 min-h-screen w-80 flex-none xl:ml-8 xl:mt-0">
          <WidgetPreview
            {...{
              bot,
              color,
              logo,
              headerAlignment,
              alignment,
              branding,
              icon,
              botIcon,
              showButtonLabel,
              labels,
              hideSources,
              supportLink,
            }}
          />
        </div>
      </div>
    </DashboardWrap>
  )
}

export const getServerSideProps = async (context) => {
  const data = await getAuthorizedUserCurrentTeam(context)
  const { botId } = context.params

  if (data?.props?.team) {
    data.props.bot = await getBot(data.props.team.id, botId)
    //return 404 if bot doesn't exist
    if (!data.props.bot) {
      return {
        notFound: true,
      }
    }
  }

  return data
}

export default Widget
