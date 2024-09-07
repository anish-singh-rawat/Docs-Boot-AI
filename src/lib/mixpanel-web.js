// Remove { Dict, Query } if not using TypeScript
import mixpanel from 'mixpanel-browser'

const isProd = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'

mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN, {
  debug: !isProd,
  persistence: 'localStorage',
  ignore_dnt: true,
  api_host: isProd ? 'https://docsbot.ai/mp' : 'http://localhost:3000/mp',
})

export const Mixpanel = {
  identify: (id) => {
    mixpanel.identify(id)
  },

  reset: () => {
    mixpanel.reset()
  },

  profile: (props) => {
    mixpanel.people.set(props)
  },

  track: (name, props) => {
    mixpanel.track(name, props)
  },

  pageview: () => {
    mixpanel.track_pageview()
  },
}
