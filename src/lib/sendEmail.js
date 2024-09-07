import { getAuth } from 'firebase-admin/auth'
import Mailjet from 'node-mailjet'
const mailjet = Mailjet.apiConnect(process.env.MAILJET_KEY, process.env.MAILJET_SECRET)

export default async function sendEmail(userId, subject, htmlBody, id = 'Generic') {
  //get user email from firebase auth
  let retries = 4;
  do {
    try {
      let email = ''
      //check if userId is an email
      if (userId.includes('@')) {
        email = userId
      } else {
        const auth = getAuth()
        const user = await auth.getUser(userId)
        email = user.email
      }
  
      if (email) {
        const request = await mailjet.post('send', { version: 'v3.1' }).request({
          Messages: [
            {
              From: {
                Email: 'noreply@docsbot.ai',
                Name: 'DocsBot AI',
              },
              To: [
                {
                  Email: email,
                },
              ],
              Subject: subject,
              HTMLPart: htmlBody,
              CustomID: id,
            },
          ],
        })
        console.log('Email sent:', email)
      } else {
        console.error('No user found for email')
      }
      return;
    } catch (error) {
      console.error(error)
    }
    retries -= 1;
  } while (retries > 0);
}
