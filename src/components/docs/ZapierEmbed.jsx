import Script from 'next/script'

export function ZapierEmbed() {
  return (
    <>
    <Script type="module" src="https://cdn.zapier.com/packages/partner-sdk/v0/zapier-elements/zapier-elements.esm.js" />
    <link rel="stylesheet" href="https://cdn.zapier.com/packages/partner-sdk/v0/zapier-elements/zapier-elements.css"/>
    <zapier-full-experience
        client-id="wSczYkR3kaYKKeKtvr6huOV53V4DyRgCymR4sZA1"
        theme="dark"
        intro-copy-display="show"
        app-search-bar-display="show"
        zap-limit={10}
        zap-style="row"
        zap-create-from-scratch-display="hide"
      />
      </>
  )
}
