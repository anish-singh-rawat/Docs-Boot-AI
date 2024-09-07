import * as firebaseAdmin from 'firebase-admin'
import { initializeApp } from 'firebase-admin/app'

export const configureFirebaseApp = () => {
  if (!firebaseAdmin.apps.length) {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    );

    return initializeApp({
      credential: firebaseAdmin.credential.cert(serviceAccount),
    })
  }
}
