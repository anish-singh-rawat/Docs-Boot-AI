import random from 'random'

export const getURL = () => {
  const url =
    process?.env?.VERCEL_ENV && process.env.VERCEL_ENV === 'production'
      ? 'https://docsbot.ai'
      : process?.env?.VERCEL_URL && process.env.VERCEL_URL !== ''
        ? process.env.VERCEL_URL
        : 'http://localhost:3000'
  return url.includes('http') ? url : `https://${url}`
}

export const postData = async ({ url, data }) => {
  console.log('posting,', url, data)

  const res = await fetch(url, {
    method: 'POST',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    credentials: 'same-origin',
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    console.log('Error in postData', { url, data, res })

    throw Error(res.statusText)
  }

  return res.json()
}

export function stripePlan(team) {
  if ('ZrbLG98bbxZ9EFqiPvyl' === team.id) {
    return {
      name: 'Staff',
      bots: 1000,
      pages: 1000000,
      questions: 1000000000,
      teamMembers: 100000,
      scheduleInterval: 'daily',
      logLimit: 1000000000,
    }
  }

  if (process?.env?.NEXT_PUBLIC_STRIPE_PLANS) {
    const plans = JSON.parse(process.env.NEXT_PUBLIC_STRIPE_PLANS)

    if (['active', 'trialing'].includes(team?.stripeSubscriptionStatus)) {
      for (const planKey in plans) {
        const plan = plans[planKey]
        for (const frequency in plan.prices.current) {
          if (plan.prices.current[frequency] === team.stripeSubscriptionPlan) {
            return plan
          }
        }
        if (plan.prices.old) {
          for (const price of plan.prices.old) {
            if (price === team.stripeSubscriptionPlan) {
              return plan
            }
          }
        }
      }
    }
  }

  return {
    name: 'Free',
    bots: 1,
    pages: 50,
    questions: 100,
    teamMembers: 1,
    scheduleInterval: 'none',
    logLimit: 6,
  }
}

export function checkSourceScheduledFromInterval(team, interval) {
  const plan = stripePlan(team)

  let rawInterval = 0
  switch (interval) {
    case 'daily':
      rawInterval = 24 * 60 * 60 * 1000
      break
    case 'weekly':
      rawInterval = 7 * 24 * 60 * 60 * 1000
      break
    case 'monthly':
      rawInterval = 30 * 24 * 60 * 60 * 1000
      break
    case 'none':
      throw new Error('Please contact support')
    default:
      throw new Error(`Invalid schedule interval!`)
  }

  let limit = 0
  switch (plan.scheduleInterval) {
    case 'daily':
      limit = 24 * 60 * 60 * 1000
      break
    case 'weekly':
      limit = 7 * 24 * 60 * 60 * 1000
      break
    case 'monthly':
      limit = 30 * 24 * 60 * 60 * 1000
      break
    case 'none':
      throw new Error(
        'Scheduled refreshes are currently only available to paid plans. Please upgrade your plan to use this feature.'
      )
    default:
      throw new Error(`Invalid schedule interval for plan ${plan.name}!`)
  }

  if (rawInterval < limit) {
    throw new Error(
      `The schedule interval for this plan is limited to ${plan.scheduleInterval}. Please upgrade your plan to use this feature.`
    )
  }

  const scheduled = new Date()
  scheduled.setTime(scheduled.getTime() + rawInterval)
  return scheduled
}

export function isSuperAdmin(userId) {
  if (process?.env?.NEXT_PUBLIC_SUPER_ADMINS) {
    const superAdmins = JSON.parse(process.env.NEXT_PUBLIC_SUPER_ADMINS)
    return superAdmins.includes(userId)
  }

  return false
}

export const grabQuestions = (bot) => {
  // grab at most 3 unique questions from the bot
  if (bot && bot.questions) {
    const questions = bot.questions
    const randomQuestions = []
    const questionsLimit = questions.length > 4 ? 4 : questions.length

    for (let i = 0; i < questionsLimit; i++) {
      const randomIndex = random.int(0, questions.length - 1)

      // check if question is already included
      if (randomQuestions.includes(questions[randomIndex])) {
        i--
        continue
      }

      randomQuestions.push(questions[randomIndex])
    }

    return randomQuestions
  }

  return []
}

export const fbPageview = () => {
  window.fbq('track', 'PageView')
}

// https://developers.facebook.com/docs/facebook-pixel/advanced/
export const fbEvent = (name, options = {}) => {
  window.fbq('track', name, options)
}

export const getNeededStripeProduct = (team) => {
  const plans = JSON.parse(process.env.NEXT_PUBLIC_STRIPE_PLANS)

  if (team) {
    const hobbyPlanLimit = plans['hobby']
    const powerPlanLimit = plans['power']
    const proPlanLimit = plans['pro']
    const businessPlanLimit = plans['business']

    const plansArray = Object.values(plans)


    if (hobbyPlanLimit.bots >= team?.botCount && hobbyPlanLimit.pages >= team?.pageCount && hobbyPlanLimit.questions >= team?.questionCount) {
      return ""
    }

    else if (powerPlanLimit.bots >= team?.botCount && powerPlanLimit.pages >= team?.pageCount && powerPlanLimit.questions >= team?.questionCount) {
      const prices = []
      plansArray.map(item => {
        if (item.name?.toLowerCase() !== 'hobby') {
          const priceList = Object.values(item?.prices?.current)
          prices.push(priceList)
        }
      })
      return prices
    }

    else if (proPlanLimit.bots >= team?.botCount && proPlanLimit.pages >= team?.pageCount && proPlanLimit.questions >= team?.questionCount) {
      const prices = []
      plansArray.map(item => {
        if (item.name?.toLowerCase() !== 'hobby' && item.name?.toLowerCase() !== 'power') {
          const priceList = Object.values(item?.prices?.current)
          prices.push(priceList)
        }
      })
      return prices
    }

    else if (businessPlanLimit.bots >= team?.botCount && businessPlanLimit.pages >= team?.pageCount && businessPlanLimit.questions >= team?.questionCount) {
      const prices = []
      plansArray.map(item => {
        if (item.name?.toLowerCase() !== 'hobby' && item.name?.toLowerCase() !== 'power' && item.name?.toLowerCase() !== 'pro') {
          const priceList = Object.values(item?.prices?.current)
          prices.push(priceList)
        }
      })
      return prices
    }
    else return ""
  }
  return ""
}
