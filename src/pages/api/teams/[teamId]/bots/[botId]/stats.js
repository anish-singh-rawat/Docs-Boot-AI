import { configureFirebaseApp } from '@/config/firebase-server.config'
import { getFirestore } from 'firebase-admin/firestore'
import { getBot, getQuestionCount } from '@/lib/dbQueries'
import userTeamCheck from '@/lib/userTeamCheck'

export default async function handler(req, res) {
  configureFirebaseApp()
  const firestore = getFirestore()

  //check if user has access to team
  let check = null
  try {
    check = await userTeamCheck(req, res)
  } catch (error) {
    return res.status(403).json({ message: error?.message })
  }
  const { userId, team } = check
  const { botId } = req.query

  if (req.method === 'GET') {
    let { timeDelta } = req.query

    // check if timeDelta is valid and a number
    if (!timeDelta || isNaN(timeDelta) || timeDelta < 0 || timeDelta > 90) {
      timeDelta = 30
    }

    try {
      const bot = await getBot(team.id, botId)
      if (!bot) {
        // doc.data() will be undefined in this case
        return res.status(404).json({ message: "botId doesn't exist." })
      }

      let dateCounts = {}
      const currDate = new Date()
      // grab questions within the last week
      const questions = await firestore
        .collection('teams')
        .doc(team.id)
        .collection('bots')
        .doc(botId)
        .collection('questions')
        .where('createdAt', '>', new Date(currDate - timeDelta * 24 * 60 * 60 * 1000))
        .select('createdAt', 'rating', 'escalation')
        .get()

      questions.docs.map((question) => {
        const data = question.data()
        const date = data.createdAt.toDate()
        const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`

        if (dateCounts[dateKey]) {
          dateCounts[dateKey].count++
        } else {
          dateCounts[dateKey] = { count: 1, negative: 0, escalated: 0 }
        }

        if (data.rating < 0) {
          dateCounts[dateKey].negative++
        }

        if (data?.escalation) {
          dateCounts[dateKey].escalated++
        }
      })

      // fill in missing dates
      for (let i = 0; i < timeDelta; i++) {
        const date = new Date(currDate - i * 24 * 60 * 60 * 1000)
        const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
        if (!dateCounts[dateKey]) {
          dateCounts[dateKey] = { count: 0, negative: 0, escalated: 0 }
        }
      }

      // split data and labels
      let totalCount = 0,
        totalNegative = 0,
        totalEscalated = 0
      let countData = [],
        negativeData = [],
        escalatedData = [],
        labels = []
      for (let i = timeDelta - 1; i >= 0; i--) {
        const date = new Date(currDate - i * 24 * 60 * 60 * 1000)
        const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
        countData.push(dateCounts[dateKey].count)
        negativeData.push(dateCounts[dateKey].negative)
        escalatedData.push(dateCounts[dateKey].escalated)

        totalCount += dateCounts[dateKey].count
        totalNegative += dateCounts[dateKey].negative
        totalEscalated += dateCounts[dateKey].escalated

        labels.push(`${date.getMonth() + 1}/${date.getDate()}`)
      }

      // calculate percentages
      let percentageData = [
        Math.round(((totalCount - (totalNegative + totalEscalated)) / totalCount) * 100),
        Math.round((totalNegative / totalCount) * 100),
        Math.round((totalEscalated / totalCount) * 100),
      ]

      let percentageLabels = [
        `${percentageData[0]}% Answered`,
        `${percentageData[1]}% Inaccurate`,
        `${percentageData[1]}% Escalated`,
      ]

      const resolutionRate = ((totalCount - (totalNegative + totalEscalated)) / totalCount * 100).toFixed((totalCount - (totalNegative + totalEscalated)) / totalCount * 100 % 1 === 0 ? 0 : 1);
      const deflectionRate = ((totalCount - totalEscalated) / totalCount * 100).toFixed((totalCount - totalEscalated) / totalCount * 100 % 1 === 0 ? 0 : 1);
      const timeSaved = Math.round((totalCount - totalEscalated) * 5)

      return res
        .status(200)
        .json({
          countData,
          negativeData,
          escalatedData,
          labels,
          percentageData,
          percentageLabels,
          totalCount,
          resolutionRate,
          deflectionRate,
          timeSaved,
        })
    } catch (error) {
      console.warn('Error getting document:', error)
      return res.status(500).json({ message: error })
    }
  } else {
    return res.status(400).json({ message: 'Invalid HTTP method' })
  }
}
