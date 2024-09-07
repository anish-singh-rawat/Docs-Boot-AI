
export const MetaHead = ({ headers }) => {

  return (
    <>
	<meta
	name="viewport"
	content="width=device-width, initial-scale=1.0, user-scalable=no"
  />
      <title key="title">{headers.title}</title>
      <meta
        key="meta-robots"
        name="robots"
        content={`${headers.robots.index}, ${headers.robots.follow}, ${headers.robots['max-snippet']}, ${headers.robots['max-image-preview']}, ${headers.robots['max-video-preview']}`}
      />
      <meta key="meta-og-locale" property="og:locale" content={headers.og_locale} />
      <meta key="meta-og-type" property="og:type" content={headers.og_type} />
      <meta key="meta-og-title" property="og:title" content={headers.og_title} />
      <meta key="meta-og-description" property="og:description" content={headers.og_description} />
      <meta key="meta-og-url" property="og:url" content={headers.og_url} />
      <meta key="meta-og-site_name" property="og:site_name" content={headers.og_site_name} />
      <meta
        key="meta-article-published_time"
        property="article:published_time"
        content={headers.article_published_time}
      />
      <meta
        key="meta-article-modified_time"
        property="article:modified_time"
        content={headers.article_modified_time}
      />
      <meta key="meta-og-image" property="og:image" content={headers.og_image[0].url} />
      <meta
        key="meta-og-image-width"
        property="og:image:width"
        content={headers.og_image[0].width}
      />
      <meta
        key="meta-og-image-height"
        property="og:image:height"
        content={headers.og_image[0].height}
      />
      <meta key="meta-og-image-type" property="og:image:type" content={headers.og_image[0].type} />
      <meta key="meta-author" name="author" content={headers.author} />
      <meta key="meta-twitter-card" name="twitter:card" content={headers.twitter_card} />
      <meta key="meta-twitter-creator" name="twitter:creator" content={headers.twitter_creator} />
      <meta key="meta-twitter-site" name="twitter:site" content={headers.twitter_site} />
      <meta
        key="meta-twitter-label1"
        name="twitter:label1"
        content={Object.keys(headers.twitter_misc)[0]}
      />
      <meta
        key="meta-twitter-data1"
        name="twitter:data1"
        content={Object.values(headers.twitter_misc)[0]}
      />
      <meta
        key="meta-twitter-label2"
        name="twitter:label2"
        content={Object.keys(headers.twitter_misc)[1]}
      />
      <meta
        key="meta-twitter-data2"
        name="twitter:data2"
        content={Object.values(headers.twitter_misc)[1]}
      />
      <meta key="description" name="description" content={headers.description} />

	  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="manifest" href="/site.webmanifest" />
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
          <meta name="msapplication-TileColor" content="#da532c" />
          <meta name="theme-color" content="#ffffff"></meta>
    </>
  )
}
