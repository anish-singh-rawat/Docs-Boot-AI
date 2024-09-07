import Cors from 'cors'
import { configureFirebaseApp } from '@/config/firebase-server.config'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
configureFirebaseApp()
const firestore = getFirestore()

// Initializing the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
const cors = Cors({
  methods: ['GET'],
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

export default async function handler(req, res) {
  // Run the middleware
  await runMiddleware(req, res, cors)
  const { visitorId } = req.query

  res.setHeader(
    'Cache-Control',
    'public, s-maxage=3000, stale-while-revalidate=359'
  )

  if (req.method === 'GET') {
    try {
      const docRef = await firestore.collection('emails').doc(visitorId).get()
      if (docRef.exists) {
        return res.json(docRef.data())
      } else {
        return res.status(404).json({ message: "visitortId doesn't exist." })
      }
    } catch (error) {
      console.warn('Error getting document:', error)
      return res.status(500).json({ message: error })
    }
  } else {
    return res.status(400).json({ message: 'Invalid HTTP method' })
  }
}
