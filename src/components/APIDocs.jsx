import Link from 'next/link'

export default function APIDocs({ team, bot }) {
  const botId = bot ? bot.id : '[botId]'
  const example1 = `curl --request POST 'https://api.docsbot.ai/teams/${team.id}/bots/${botId}/ask' \\
    --header 'Content-Type: application/json' \\
    --data-raw '{
        "question": "Do you offer refunds?",
        "markdown": true,
        "full_source": false
    }'`
  const response1 = `{
        "answer": "Yes, we offer refunds within 30 days of purchase if you are not satisfied with our service. Please contact our support team to initiate the refund process.",
        "sources": [
            {
                "type": "csv",
                "title": "Source Name",
                "url": "https://yourdomain.com",
                "page": 1,
                "content": null
            },
            {
                "type": "csv",
                "title": "Source Name",
                "url": "https://yourdomain.com",
                "page": 1,
                "content": null
            },
            {
                "type": "url",
                "title": "Infinite Uploads – Your WordPress Media Cloud Library",
                "url": "https://infiniteuploads.com/",
                "page": null,
                "content": null
            }
        ],
        "id": "78XvRoyYPcPsKVqoXjEj"
    }`

  const example2 = `curl --request PUT 'https://api.docsbot.ai/teams/${team.id}/bots/${botId}/rate/78XvRoyYPcPsKVqoXjEj' \\
      --header 'Content-Type: application/json' \\
      --data-raw '{
          "rating": -1
      }'`

  const response2 = `true`

  return (
    <div className="prose w-full max-w-full p-6">
      <p>For Question / Answer bots, use the following endpoint:</p>
      <p>
        <code>
          https://api.docsbot.ai/teams/{team.id}/bots/{botId}/ask
        </code>
      </p>
      <h3 className="text-lg font-medium text-gray-900">Example Request</h3>

      <pre>{example1}</pre>
      <h3 className="text-lg font-medium text-gray-900">Response</h3>
      <pre>{response1}</pre>

      <h3 className="text-lg font-medium text-gray-900">Example Rating an Answer</h3>
      <pre>{example2}</pre>
      <h3 className="text-lg font-medium text-gray-900">Response</h3>
      <pre>{response2}</pre>

      <p>
        You can view the current API documentation{' '}
        <Link href="https://api.docsbot.ai/docs" target="_blank" className="underline">
          here
        </Link>
        .
      </p>
      <p>
        Full documentation and code examples for our streaming websocket and chat APIs are coming
        soon!
      </p>
    </div>
  )
}
