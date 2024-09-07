import { Head, Html, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html
      className="h-full scroll-smooth antialiased [font-feature-settings:'ss01']"
      lang="en"
    >
      <Head />
      <body className="flex h-full flex-col bg-gray-50">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
