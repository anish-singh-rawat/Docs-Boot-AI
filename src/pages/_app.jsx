import 'focus-visible'
import '@/styles/tailwind.css'
import '@/styles/overrides.css'
import Script from 'next/script'
import { useEffect } from 'react'
import { useRouter, Router } from 'next/router'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/config/firebase-ui.config'
import { slugifyWithCounter } from '@sindresorhus/slugify'
import { Layout } from '@/components/docs/Layout'
import { Analytics } from '@vercel/analytics/react'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { HeadlessApp } from '@headstartwp/next'
import { Link } from '@/components/blog/Link'
import { DefaultSeo } from 'next-seo'
import { Mixpanel } from '@/lib/mixpanel-web'

function getNodeText(node) {
  let text = ''
  for (let child of node.children ?? []) {
    if (typeof child === 'string') {
      text += child
    }
    text += getNodeText(child)
  }
  return text
}

function collectHeadings(nodes, slugify = slugifyWithCounter()) {
  let sections = []

  for (let node of nodes) {
    if (node.name === 'h2' || node.name === 'h3') {
      let title = getNodeText(node)
      if (title) {
        let id = slugify(title)
        node.attributes.id = id
        if (node.name === 'h3') {
          if (!sections[sections.length - 1]) {
            throw new Error('Cannot add `h3` to table of contents without a preceding `h2`')
          }
          sections[sections.length - 1].children.push({
            ...node.attributes,
            title,
          })
        } else {
          sections.push({ ...node.attributes, title, children: [] })
        }
      }
    }

    sections.push(...collectHeadings(node.children ?? [], slugify))
  }

  return sections
}

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const [user] = useAuthState(auth)

  // eslint-disable-next-line react/prop-types, no-unused-vars
  const { fallback = {}, themeJson = {}, ...props } = pageProps

  useEffect(() => {
    const handleRouteChange = () => {
      if (window.bento !== undefined) {
        if (user) {
          window.bento.identify(user.email)
        }
        window.bento.view()
      }
      Mixpanel.pageview()
    }

    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  useEffect(() => {
    if (user && 'Beacon' in window && Beacon !== undefined && typeof Beacon === 'function') {
      //only identify if not already in the queue
      if (Beacon.readyQueue.find((obj) => obj.method === 'identify')) {
        return
      }

      const ident = {
        email: user.email,
      }
      if (user.displayName) {
        ident.name = user.displayName
      }
      Beacon('identify', ident)
    }
  }, [user])

  if (router.pathname.startsWith('/documentation/developer')) {
    let title = pageProps.markdoc?.frontmatter.title

    let pageTitle =
      pageProps.markdoc?.frontmatter.pageTitle ||
      `${pageProps.markdoc?.frontmatter.title} - DocsBot Documentation`

    let description = pageProps.markdoc?.frontmatter.description

    let tableOfContents = pageProps.markdoc?.content
      ? collectHeadings(pageProps.markdoc.content)
      : []

    return (
      <>
        <DefaultSeo
          title={pageTitle}
          description={description}
          openGraph={{
            type: 'website',
            locale: 'en_US',
            url: 'https://docsbot.ai' + router.asPath,
            siteName: 'DocsBot AI',
            images: [
              {
                url: 'https://docsbot.ai/social-card.png',
                width: 1200,
                height: 630,
                alt: 'DocsBot AI',
              },
            ],
          }}
          twitter={{
            handle: '@docsbotai',
            site: '@docsbotai',
            cardType: 'summary_large_image',
          }}
          additionalLinkTags={[
            {
              rel: 'apple-touch-icon',
              href: '/apple-touch-icon.png',
              sizes: '180x180',
            },
            {
              rel: 'manifest',
              href: '/site.webmanifest',
            },
            {
              rel: 'icon',
              type: 'image/png',
              sizes: '16x16',
              href: '/favicon-16x16.png',
            },
            {
              rel: 'icon',
              type: 'image/png',
              sizes: '32x32',
              href: '/favicon-32x32.png',
            },
            {
              rel: 'mask-icon',
              href: '/safari-pinned-tab.svg',
              color: '#5bbad5',
            },
          ]}
          additionalMetaTags={[
            {
              name: 'viewport',
              content: 'width=device-width, initial-scale=1.0, user-scalable=no',
            },
            {
              charSet: 'utf-8',
            },
            {
              name: 'msapplication-TileColor',
              content: '#da532c',
            },
            {
              name: 'theme-color',
              content: '#ffffff',
            },
          ]}
        />
        <Layout title={title} tableOfContents={tableOfContents}>
          <Component {...pageProps} />
        </Layout>
        <Script id="helpscout">
          {`!function(e,t,n){function a(){var e=t.getElementsByTagName("script")[0],n=t.createElement("script");n.type="text/javascript",n.async=!0,n.src="https://beacon-v2.helpscout.net",e.parentNode.insertBefore(n,e)}if(e.Beacon=n=function(t,n,a){e.Beacon.readyQueue.push({method:t,options:n,data:a})},n.readyQueue=[],"complete"===t.readyState)return a();e.attachEvent?e.attachEvent("onload",a):e.addEventListener("load",a,!1)}(window,document,window.Beacon||function(){});`}
        </Script>
        <Script id="docsbot">
          {`window.DocsBotAI=window.DocsBotAI||{},DocsBotAI.init=function(c){return new Promise(function(e,o){var t=document.createElement("script");t.type="text/javascript",t.async=!0,t.src="https://widget.docsbot.ai/chat.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n),t.addEventListener("load",function(){window.DocsBotAI.mount({id:c.id,supportCallback:c.supportCallback});var t;t=function(n){return new Promise(function(e){if(document.querySelector(n))return e(document.querySelector(n));var o=new MutationObserver(function(t){document.querySelector(n)&&(e(document.querySelector(n)),o.disconnect())});o.observe(document.body,{childList:!0,subtree:!0})})},t&&t("#docsbotai-root").then(e).catch(o)}),t.addEventListener("error",function(t){o(t.message)})})};
          DocsBotAI.init({id: "ZrbLG98bbxZ9EFqiPvyl/UMADr9eozeBQ8sZKr0GW",supportCallback: function (event, history) {
  event.preventDefault();
  DocsBotAI.unmount();
  Beacon('init', '1dc28732-3f1c-4cd0-a15b-825c4aa5e4b2');
  Beacon('open');
},});`}
        </Script>
        <Script
          id="bento-script"
          src={'https://fast.bentonow.com?site_uuid=' + process.env.NEXT_PUBLIC_BENTO_SITE}
          strategy="afterInteractive"
        />
        <Script id="firstpromoter1">
          {`(function(w){w.fpr=w.fpr||function(){w.fpr.q = w.fpr.q||[];w.fpr.q[arguments[0]=='set'?'unshift':'push'](arguments);};})(window);
fpr("init", {cid:"08y4co6f"}); 
fpr("click");`}
        </Script>
        <Script
          id="firstpromoter2"
          strategy="afterInteractive"
          src="https://cdn.firstpromoter.com/fpr.js"
        />
        <Analytics />
      </>
    )
  }

  return (
    <HeadlessApp
      pageProps={pageProps}
      settings={{
        // instruct the framework to use Next.js link component or your own version
        linkComponent: Link,
      }}
      swrConfig={{
        /**
         * Setting this to true will refetch content whenever the tab is refocused
         */
        revalidateOnFocus: false,
        /**
         * Settings this to true will refetch content whenever the connection is reestablished
         */
        revalidateOnReconnect: false,
        /**
         * Setting this to true will refetch content after initial load
         */
        revalidateOnMount: false,
      }}
      useYoastHtml={true}
    >
      <DefaultSeo
        title="DocsBot AI - Custom chatbots from your documentation"
        description="Custom ChatGPT bots trained on your documentation and content for support, presales, research, and more."
        openGraph={{
          type: 'website',
          locale: 'en_US',
          url: 'https://docsbot.ai' + router.asPath,
          siteName: 'DocsBot AI',
          images: [
            {
              url: 'https://docsbot.ai/social-card.png',
              width: 1200,
              height: 630,
              alt: 'DocsBot AI',
            },
          ],
        }}
        twitter={{
          handle: '@docsbotai',
          site: '@docsbotai',
          cardType: 'summary_large_image',
        }}
        additionalLinkTags={[
          {
            rel: 'apple-touch-icon',
            href: '/apple-touch-icon.png',
            sizes: '180x180',
          },
          {
            rel: 'manifest',
            href: '/site.webmanifest',
          },
          {
            rel: 'icon',
            type: 'image/png',
            sizes: '16x16',
            href: '/favicon-16x16.png',
          },
          {
            rel: 'icon',
            type: 'image/png',
            sizes: '32x32',
            href: '/favicon-32x32.png',
          },
          {
            rel: 'mask-icon',
            href: '/safari-pinned-tab.svg',
            color: '#5bbad5',
          },
        ]}
        additionalMetaTags={[
          {
            name: 'viewport',
            content: 'width=device-width, initial-scale=1.0, user-scalable=no',
          },
          {
            charSet: 'utf-8',
          },
          {
            name: 'msapplication-TileColor',
            content: '#da532c',
          },
          {
            name: 'theme-color',
            content: '#ffffff',
          },
        ]}
      />
      <div className="h-screen">
        <Component {...props} />
      </div>
      {!router.pathname.startsWith('/chat/') &&
        !router.pathname.startsWith('/ask/') &&
        !router.pathname.startsWith('/iframe/') && (
          <>
            <Script id="helpscout">
              {`!function(e,t,n){function a(){var e=t.getElementsByTagName("script")[0],n=t.createElement("script");n.type="text/javascript",n.async=!0,n.src="https://beacon-v2.helpscout.net",e.parentNode.insertBefore(n,e)}if(e.Beacon=n=function(t,n,a){e.Beacon.readyQueue.push({method:t,options:n,data:a})},n.readyQueue=[],"complete"===t.readyState)return a();e.attachEvent?e.attachEvent("onload",a):e.addEventListener("load",a,!1)}(window,document,window.Beacon||function(){});`}
            </Script>
            <Script id="docsbot">
              {`window.DocsBotAI=window.DocsBotAI||{},DocsBotAI.init=function(c){return new Promise(function(e,o){var t=document.createElement("script");t.type="text/javascript",t.async=!0,t.src="https://widget.docsbot.ai/chat.js";const n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n),t.addEventListener("load",function(){window.DocsBotAI.mount({id:c.id,supportCallback:c.supportCallback,identify:c.identify,options:c.options,signature:c.signature});let t;t=function(n){return new Promise(function(e){if(document.querySelector(n))return e(document.querySelector(n));const o=new MutationObserver(function(t){document.querySelector(n)&&(e(document.querySelector(n)),o.disconnect())});o.observe(document.body,{childList:!0,subtree:!0})})},t&&t("#docsbotai-root").then(e).catch(o)}),t.addEventListener("error",function(t){o(t.message)})})};DocsBotAI.init({id: "ZrbLG98bbxZ9EFqiPvyl/UMADr9eozeBQ8sZKr0GW",supportCallback: function (event, history) {
      event.preventDefault();
      DocsBotAI.unmount();
      Beacon('init', '1dc28732-3f1c-4cd0-a15b-825c4aa5e4b2');
      Beacon('open');
  },});`}
            </Script>
            <Script id="firstpromoter1">
              {`(function(w){w.fpr=w.fpr||function(){w.fpr.q = w.fpr.q||[];w.fpr.q[arguments[0]=='set'?'unshift':'push'](arguments);};})(window);
fpr("init", {cid:"08y4co6f"}); 
fpr("click");`}
            </Script>
            <Script
              id="firstpromoter2"
              strategy="afterInteractive"
              src="https://cdn.firstpromoter.com/fpr.js"
            />
            <Script
              id="bento-script"
              src={'https://fast.bentonow.com?site_uuid=' + process.env.NEXT_PUBLIC_BENTO_SITE}
              strategy="afterInteractive"
            />
            <Analytics
              beforeSend={(event) => {
                const url = event.url.replace(/\/app\/bots\/[^\/]+/, `/app/bots/[botId]`)
                return {
                  ...event,
                  url: url,
                }
              }}
            />
          </>
        )}
    </HeadlessApp>
  )
}
