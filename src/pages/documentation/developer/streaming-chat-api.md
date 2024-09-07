---
title: Streaming Chat API
description: The chat API is used to create a full chat interface in your product.
---

The chat API is used to create a full chat interface in your product. You pass it a question plus chat history, and it returns the next answer along with its sources. It also returns the new chat history array to pass back with the next response. This is the endpoint you should use if you want to create a full chat interface in your product.

---

{% callout title="Streaming Q/A Ask" %}
You can also use this API for simpler Q/A bots, just omit the `history` parameter. This will return a single answer and source. This is the endpoint you should use if you want to create a simple Q/A interface in your product where you can stream the reply back to the user as soon as it is available.
{% /callout %}

## Request

This endpoint accepts a websocket request with the following parameters in the initial message on the open socket:

`wss://api.docsbot.ai/teams/[teamId]/bots/[botId]/chat`

### Parameters

| Parameter       | Type    | Description                                                                             |
| --------------- | ------- | --------------------------------------------------------------------------------------- |
| **question**    | string  | The question to ask the bot. 2 to 2000 characters.                                      |
| **full_source** | boolean | Whether the full source content should be returned. Optional, defaults to `false`       |
| **format**      | string  | How to format the answer. Can be `markdown` or `text`. Optional, defaults to `markdown` |
| **history**     | array   | The chat history array. Optional, defaults to `[]`                                      |
| **auth**        | string  | The API key. Required only for private bots.                                            |

{% callout title="full_source behavior" %}
If `full_source` is set to `true`, the `content` property of each source will be populated with the full source content. This can be useful if you want to display the full source content in your interface. As source pages are divided into chunks, we normally only return unique source title/urls. But if this parameter is set to true multiple sources may be returned with the same title/url but different content.
{% /callout %}

{% callout type="warning" title="Do not expose your API key!" %}
API keys are meant to be used server-side, and should never be exposed to the public in JavaScript. If you are using a client-side library, make sure you are not exposing your API key to the public by proxying requests through your own server.
{% /callout %}

## Responses

### Messages

WebSocket messages are received as a JSON string formatted like this:

```json
{
  "sender": "bot",
  "message": "",
  "type": "start"
}
```

They can be of type `start`, `stream`, `info`, or `end`. The `message` property is the actual message. The `sender` property is either `bot` or `user`. The `start` and `end` types are only sent once. The `stream` type is sent many times. The `info` type is not generally used.

### The `end` message type

The `end` type is the last message before the API closes the websocket (except for errors). It contains the answer and sources and is formatted like this:

```json
{
  "sender": "bot",
  "message": "{\"answer\":\"WordPress is an open source free software distributed under the GPL license. It is a self-hosted content management system that enables users to create and manage websites.\",\"sources\":[{\"type\":\"urls\",\"title\":\"Introduction to Open-Source | Learn WordPress\",\"url\":\"https://learn.wordpress.org/tutorial/introduction-to-open-source/\",\"page\":null,\"content\":null},{\"type\":\"urls\",\"title\":\"WordPress.org and WordPress.com \u2013 WordPress.org Documentation\",\"url\":\"https://wordpress.org/documentation/article/wordpress-org-and-wordpress-com/\",\"page\":null,\"content\":null},{\"type\":\"urls\",\"title\":\"What is Open Source? | Learn WordPress \",\"url\":\"https://learn.wordpress.org/lesson-plan/what-is-open-source/\",\"page\":null,\"content\":null},{\"type\":\"urls\",\"title\":\"High-Level Overview | Learn WordPress \",\"url\":\"https://learn.wordpress.org/lesson-plan/high-level-overview/\",\"page\":null,\"content\":null}],\"id\":\"O0avZ8ffTiAMRyjNrZpU\",\"history\":[]}",
  "type": "end"
}
```

When the `message` property JSON is parsed, the result is an object like:

```json
{
  "answer": "WordPress is an open source free software distributed under the GPL license. It is a self-hosted content management system that enables users to create and manage websites.",
  "sources": [
    {
      "type": "urls",
      "title": "Introduction to Open-Source | Learn WordPress",
      "url": "https://learn.wordpress.org/tutorial/introduction-to-open-source/",
      "page": null,
      "content": null
    },
    {
      "type": "urls",
      "title": "WordPress.org and WordPress.com – WordPress.org Documentation",
      "url": "https://wordpress.org/documentation/article/wordpress-org-and-wordpress-com/",
      "page": null,
      "content": null
    },
    {
      "type": "urls",
      "title": "What is Open Source? | Learn WordPress ",
      "url": "https://learn.wordpress.org/lesson-plan/what-is-open-source/",
      "page": null,
      "content": null
    },
    {
      "type": "urls",
      "title": "High-Level Overview | Learn WordPress ",
      "url": "https://learn.wordpress.org/lesson-plan/high-level-overview/",
      "page": null,
      "content": null
    }
  ],
  "id": "O0avZ8ffTiAMRyjNrZpU",
  "history": []
}
```

The message is a JSON string with the following properties:

| Property    | Type   | Description                                                                                                                                      |
| ----------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **answer**  | string | The answer to the question in Markdown format.                                                                                                   |
| **sources** | array  | An array of source objects. Each source object contains the source type, title and optionally url, page, or content if `full_source` was `true`. |
| **id**      | string | The unique ID of the answer. Use for the rating API.                                                                                             |
| **history** | array  | The chat history array. Save this and send it with the next question to continue the conversation.                                               |

## Example

### Open a websocket connection

```javascript
const apiUrl = `wss://api.docsbot.ai/teams/ZrbLG98bbxZ9EFqiPvyl/bots/oFFiXuQsakcqyEdpLvCB/chat`
const ws = new WebSocket(apiUrl)
```

### Send the question as the first message

```javascript
// Send message to server when connection is established
ws.onopen = function (event) {
  const question = 'What is WordPress?'
  const req = { question: question, full_source: false, history: [] }
  ws.send(JSON.stringify(req))
}
```

### Handle the response messages

```javascript
// Receive message from server word by word. Display the words as they are received.
ws.onmessage = function (event) {
  const data = JSON.parse(event.data)
  if (data.sender === 'bot') {
    if (data.type === 'start') {
      //start a new answer, streaming will follow
      //start response looks like this JSON:
      /*
        {
            sender="bot",
            message="",
            type="start"
        }
        */
    } else if (data.type === 'stream') {
      //this is a streaming response word by word, it will be sent many times. Update the UI by appending these messages to the current answer.
      //stream response looks like this JSON:
      /*
        {
            sender="bot",
            message="Word1",
            type="stream"
        }
        */
    } else if (data.type === 'info') {
      //info response not generally used, looks like this JSON:
      /*
        {
            sender="bot",
            message="Synthesizing question...",
            type="info"
        }
        */
    } else if (data.type === 'end') {
      //this is the final response containing all data, it will be sent once after streaming completes. Update the UI with the final answer and sources.

      //parse the message property which is a JSON string
      const endData = JSON.parse(data.message)
      const history = endData.history //this is the new chat history array to pass back with the next question
      const finalAnswer = endData.answer // this is the final full answer in Markdown format
      const sources = endData.sources //this is an array of source objects
      const id = endData.id //this is the unique ID of the answer. Use for the rating API.

      ws.close()
    } else if (data.type === 'error') {
      alert(data.message)
      //error response looks like this JSON:
      /*
        {
            sender="bot",
            message="Please enter a question between 10 and 200 characters.",
            type="error"
        }
        */
      ws.close()
    }
  }
}
```

### Handle errors

```javascript
ws.onerror = function (event) {
  console.warn(event)
  alert('There was a connection error. Please try again.')
}

//The API will close the connection when it is done sending the response. If the connection closes before the API is done, it was an error.
ws.onclose = function (event) {
  if (!event.wasClean) {
    console.warn(event)
    alert('Network error, please try again.')
  }
}
```
