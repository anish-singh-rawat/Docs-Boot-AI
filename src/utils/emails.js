import sendEmail from '@/lib/sendEmail'

export const sendInviteEmail = async (user, inviter, team) => {
  const name = inviter.name || inviter.email
  const emailBody = `You have been invited by ${name} to join ${team.name} on DocsBot AI, a powerful platform for managing custom-trained AI chatbots!
  To get started, please follow these simple steps:
  <ol>
    <li>Click on the following link to accept your invitation and create your DocsBot account if you don't already have one: <a href="https://docsbot.ai/register?redirect=/app/team">https://docsbot.ai/register?redirect=/app/team</a></li>
    <li>Once you've created your account, you'll be directed to your team workspace on DocsBot where you can accept the invitation.</li>
    <li>Feel free to explore the platform and familiarize yourself with its features. If you have any questions or need assistance, you can reach out to our support by clicking on 'help' <a href="https://docsbot.ai/">here</a>.</li>
  </ol>`
  await sendEmail(user, `You've been invited to ${team.name} on DocsBot AI`, emailBody)
}

export const sendReportEmail = async (userId, reportName, report) => {
  let emailBody = `<p>We're delighted to present your monthly AI Question Insights Reports for ${reportName}. As an <strong>exclusive feature of your ${report.plan} subscription</strong> for ${report.name} with DocsBot AI, this report aims to provide actionable insights to optimize your user experience and fine-tune your documentation.</p>
  
  <h2>Why are these reports important?</h2>

  <p>By leveraging advanced Natural Language Processing (NLP) technology, we analyze every question asked by your users, using topic clustering to group similar questions together and identify the main themes and their sub-topics. The goal is to categorize the most common queries, providing invaluable information for making data-driven decisions to better meet your users' needs and improve your bots.</p>

  <h2>What's included in these reports?</h2>

  <ul>
  <li><strong>All Questions:</strong> We generate a report from all user questions by default. This report is useful for identifying the most common questions asked by users and improving the user experience for these parts of your product or business.</li>
  <li><strong>Problem Questions:</strong> If there is enough data we also create a report variation highlighting poorly rated questions or ones that led to a support escalation. This can help you identify gaps in your documentation and improve your bot's ability to answer questions.</li>
  </ul>

  <p><strong>Note:</strong> <em>Reports are generated only for bots that have at least 100 user queries during the specified month and are generated on the 1st of the subsequent month.</em></p>

  <h2>How to access your reports</h2>
  
  <p>You can easily access your reports by clicking the "Reports" button <a href="https://docsbot.ai/app/bots">in the dashboard</a> for any of your bots, or you may use any of the direct links below:</p>
  <ul>`

  for (const bot of report.reports) {
    emailBody += `<li><a href="https://docsbot.ai/app/bots/${bot.botId}/reports">${bot.name}</a></li>`
  }

  emailBody += `</ul>
  <p>We appreciate your continued partnership as a ${report.plan} subscriber. If you have any questions or need further guidance, feel free to contact us at human@docsbot.ai for prompt assistance from our support team.</p>

  <p>Best regards,</p>
  <p>The DocsBot AI Team</p>`

  await sendEmail(
    userId,
    `Your ${reportName} AI Question Insight Reports for ${report.name} are ready!`,
    emailBody
  )
}
