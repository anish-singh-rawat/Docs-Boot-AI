const Mixpanel = require('mixpanel')
export const mixpanel = Mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN, {
  host: 'api-eu.mixpanel.com',
})

export function mpTrack(userId, event, props = {}) {
  //get user email from firebase auth
  try {
    if (!userId) return

    mixpanel.track(event, {
      distinct_id: userId,
      ...props,
    })
  } catch (error) {
    console.error(error)
  }
}

export function mpProfile(userId, props = {}) {
  //get user email from firebase auth
  try {
    if (!userId) return

    mixpanel.people.set(userId, props)
  } catch (error) {
    console.error(error)
  }
}
