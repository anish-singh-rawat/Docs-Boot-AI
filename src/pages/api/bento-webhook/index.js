import { Configuration, OpenAIApi } from 'openai'
import { configureFirebaseApp } from '@/config/firebase-server.config'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
configureFirebaseApp()
const firestore = getFirestore()

export default async function handler(req, res) {
  try {
    //check that the request is coming from bento via Auth header
    const key = req.headers.authorization
    if (key !== process.env.BENTO_SECRET_KEY) {
      return res.status(403).json({ message: 'Invalid key.' })
    }

    const { event_type, visitor_id, website, name, usage_type } = req.body

    if (!event_type || !visitor_id) {
      return res.status(400).json({ message: 'Invalid parameters.' })
    }

    if (event_type === 'welcome_email') {
      // fetch the website html via crawler
      const crawlResponse = await fetch(
        'https://api.apify.com/v2/actor-tasks/uglyrobot~website-content-crawler-marketing/run-sync-get-dataset-items?token=' +
          process.env.APIFY_TOKEN,
        {
          method: 'POST',
          body: JSON.stringify({
            startUrls: [{ url: website }],
          }),
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      )
      //log the response body content
      const crawlData = await crawlResponse.json()
      let scrape = ''
      let languageCode = 'en'
      if (crawlData[0]?.text) {
        scrape = crawlData[0].metadata.title
        languageCode = crawlData[0].metadata.languageCode || 'en'
        if (crawlData[0].metadata.description) {
          scrape += '\n' + crawlData[0].metadata.description
        }
        scrape += '\n\n' + crawlData[0].text

        //crop to max 30k characters around 6k tokens
        if (scrape.length > 30000) {
          scrape = scrape.substring(0, 30000)
        }
      } else {
        console.warn('Crawl data error:', crawlData)
        res.status(503).json({ message: 'No text found on website.' })
        return
      }
      console.log('Website scrape for url:', website, scrape)

      const docsbot = `
DocsBot AI
ChatGPT for your docs
Get instant answers for you, your customers, or your team with AI powered chatbots trained with your content and documentation. Save money and improve the support experience for your customers, the productivity of your team, and AI copywriting with existing knowledge of your business!

ChatGPT-powered customer support
Train and deploy custom chatbots in minutes!

Are you tired of answering the same questions over and over again? Do you wish you had a way to automate your customer support and give your team more time to focus on other tasks? With DocsBot, you can do just that. We make it simple to build ChatGPT-powered bots that are trained with your content and documentation, so they can provide instant answers to your customers' most detailed questions.

Question/Answer Bots

Make your documentation interactive with our Q/A bot. Get detailed and direct answers about your product, including code examples and formatted output.

Embeddable Widgets

We make it simple to add DocsBot to your website in minute with fully customizable widgets. Just add a script tag or WordPress plugin (coming soon) and you are ready to go.

Custom Copywriting

Need help writing marketing copy and blog posts? With DocsBot, you can do that too. Use a customized ChatGPT that knows everything about your product, so it can help you generate high-quality content in no time.

Reply to Support Tickets

Tired of writing the same responses to support tickets over and over again? Train your DocBot on your support history and docs so it can reply to new tickets automatically, saving you time and money!

Internal Knowledge Bots

Employees spend too much time just searching for what they need. DocsBot can help them find answers instantly by indexing your internal knowledge base and documentation.

Powerful API

Our API allows you to integrate AI chat into your own products. Provide answers to your users from your site, app, or WordPress plugin.

A simple managed chatbot service
Powerful integrations and API

Our intuitive interface makes it easy to index your documentation, blog posts, or any other content with just a few clicks. Then use our simple API and embeddable widgets to integrate your custom DocsBot into your website, WordPress, app/plugin, Slack, or anywhere else you want to use it!

URL & Sitemaps
Index a webpage, your support docs, or an entire website in minutes with our url and sitemap importers. Simply add a link and we take care of the rest. Schedule regular updates to keep your content fresh.

Document Files
Upload any files in TXT, DOC, PPT, EML, HTML, PDF, MD format, or in bulk via ZIP. We will index your content and turn it into a ChatGPT-powered bot for you or your users.

Blog Posts
Quickly train your DocsBot on your blog content via WordPress export files or RSS feeds. It's a simple way to surface your best content to those looking for answers.

CSV Import
Add your content in bulk by uploading a specially formatted CSV file containing text blocks and sources to index.

Zapier Integration
Connect DocsBot to thousands of apps via Zapier. Pass your trained bots questions and route answers to your favorite apps.

API
Build your own data ingestion pipelines for any use case with our powerful admin API.

## Plans

Plans for any size business

[Plan pricing details](https://docsbot.ai/#pricing)

Save money and time with DocsBot. We offer a variety of plans to fit your needs. Need a custom plan?

14-day money-back guarantee!

Payment frequency

Monthly

Annual

Two months free with annual plans!

### Hobby

Create your own basic DocsBot for quick answers and copywriting.

*   1 DocsBot
*   1k Source Pages
*   Unlock all source types
*   1k questions/mo
*   Private bot
*   GPT-4 support
*   1 user

### Power

For power users and small businesses just getting started.

*   3 DocsBots
*   5k Source Pages
*   Unlock all source types
*   Monthly source refresh
*   5k questions/mo
*   Private bots
*   GPT-4 support
*   1 user
*   Basic Analytics
*   Zapier integration
*   Chat history

### Pro

Most popular

For businesses who want to save time and money on support and copywriting.

*   10 DocsBots
*   10k Source Pages
*   Unlock all source types
*   Weekly source refresh
*   10k questions/mo
*   Private bots
*   GPT-4 support
*   5 team users
*   Advanced Analytics
*   Zapier integration
*   Chat history
*   Unbranded chat widgets
*   Prompt customization

Does not include OpenAI API costs (roughly $0.003/question)

### Personal

Try DocsBot free for personal use. No credit card required. Import document files or urls with up to 50 pages of content and start chatting with your bot. Free bots will be deleted after 30 days.

### Enterprise

For serious traffic and custom integrations. Identify problem areas in your product and gaps in your documentation with automated AI analysis of user questions. Get priority support & integration help to create specialized bots for your unique business needs. Use the Microsoft Azure OpenAI Service for Enterprise-grade security with role-based access control (RBAC), private networks, and region restrictions. Self-hosted options are available to satisfy any data protection requirements.

#### What’s included

*   100+ DocsBots
*   100k+ Source Pages
*   Unlock all source types
*   Daily source refresh
*   100k+ questions/mo
*   Private bots
*   GPT-4 support
*   50+ team users
*   Advanced Analytics
*   Zapier integration
*   Chat history
*   Unbranded chat widgets
*   AI question reports
*   Prompt customization
*   Azure OpenAI Service
*   Self-hosted options
`

      const usageTypes = {
        support: 'Support & Presales - Customer support & presales, 24/7 in 95 languages.',
        internal: 'Internal Knowledge - Give your team answers from your company knowledge base.',
        research: 'Document Q&A - Chat with your docs & files for research or education.',
        content: 'Content Creation - Generate custom content for your blog or social media.',
      };

      const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
      })
      const openai = new OpenAIApi(configuration)
      const chat_completion = await openai.createChatCompletion({
        model: 'gpt-4-1106-preview',
        messages: [
          {
            role: 'system',
            content:
              'Write a custom welcome to DocsBot AI email from Aaron the founder to a new potential customer. It should be friendly and informal, and not too wordy. Make it seem like it was typed by hand with one emoji in the subject and body signature. Mention that I just looked at their company website. Make sure to give some ideas how our product DocsBot as described in the provided context could be specifically used for their business based on the provided company information gathered from their website. Invite them to reply with any questions or to book a meeting via https://tidycal.com/docsbot/onboarding.',
          },
          { role: 'system', content: `DocsBot AI context:\n${docsbot}` },
          { role: 'user', content: `Customer name: ${name}\nWebsite: ${website}` },
          { role: 'user', content: `Company information from website:\n${scrape}` },
          { role: 'user', content: `They are most interested in using DocsBot for: ${usageTypes[usage_type] || 'whatever you suggest'}` },
        ],
        functions: [
          {
            name: 'email_content',
            description:
              'Extracts the email subject and body as valid JSON.',
            parameters: {
              type: 'object',
              properties: {
                subject: {
                  type: 'string',
                  description: 'The plaintext subject of the email.',
                },
                body: {
                  type: 'string',
                  description:
                    'The HTML body of the email content, properly formatted with paragraph and other tags.',
                },
              },
              required: ['subject', 'body'],
            },
          },
        ],
        function_call: { name: 'email_content' },
      })

      console.log(
        'Chat completion:',
        chat_completion.data.choices[0].message.function_call.arguments
      )
      let emailContent = null

      try {
        emailContent = JSON.parse(chat_completion.data.choices[0].message.function_call.arguments)
      } catch (error) {
        res.status(500).json({ message: 'Invalid JSON response from OpenAI. Please try again.' })
      }

      console.log('Email content:', emailContent)

      //save to firestore using the visitor_id as the doc id
      const docRef = await firestore.collection('emails').doc(visitor_id).set({
        created: new Date(),
        website: website,
        name: name,
        subject: emailContent.subject,
        body: emailContent.body,
      })

      return res.status(200).end()

      /*
      // You can send an array of emails.
      // MAX 100 per request.
      const import_data = [
        {
          to: email, // required — if no user with this email exists in your account they will be created.
          from: 'human@docsbot.ai', // required — must be an email author in your account.
          subject: emailContent.subject, // required
          //html_body: emailContent.body, // required - can also use text_body if you want to use our plain text theme.
          text_body: emailContent.body, // required - can also use html_body if you want to use our default theme.
          transactional: false, // IMPORTANT — this bypasses the subscription status of a user. Abuse will lead to account shutdown.
        },
      ]
      console.log('Import data:', import_data)
      const auth =
        'Basic ' +
        Buffer.from(process.env.BENTO_PUB_KEY + ':' + process.env.BENTO_SECRET_KEY).toString(
          'base64'
        )

      const response = await fetch('https://app.bentonow.com/api/v1/batch/emails', {
        method: 'POST',
        body: JSON.stringify({
          site_uuid: process.env.NEXT_PUBLIC_BENTO_SITE,
          emails: import_data,
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: auth,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Welcome email sent:', data)
        return res.status(200).end()
      } else {
        try {
          const data = await response.json()
          console.log('Welcome email error:', data)
          return res.status(response.status).json(data)
        } catch (e) {
          return res.status(response.status).end({ message: 'Error sending welcome email' })
        }
      }
      */
    }
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}
