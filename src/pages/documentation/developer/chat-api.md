---
title: Chat API
description: The chat API is used to create Q/A or chat interface in your product.
---

The chat API is used to create a Question/Answer and chat bots in your product. You pass it a question plus optional chat history, and it returns the next answer along with its sources. It also returns the new chat history array to pass back with the next response. This is the endpoint you should use if you want to create any Q/A or chat interface in your product.

---

## Request

This endpoint accepts a POST request with the following parameters:

`POST https://api.docsbot.ai/teams/[teamId]/bots/[botId]/chat`

### Parameters

| Parameter       | Type    | Description                                                                                                                                                                                                               |
| --------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **question**    | string  | The question to ask the bot. 2 to 2000 characters.                                                                                                                                                                        |
| **full_source** | boolean | Whether the full source content should be returned. Optional, defaults to `false`                                                                                                                                         |
| **format**      | string  | How to format the answer. Can be `markdown` or `text`. Optional, defaults to `markdown`                                                                                                                                   |
| **history**     | array   | The chat history array. Optional, defaults to `[]`                                                                                                                                                                        |
| **metadata**    | object  | A user identification object with arbitrary metadata about the the user. Will be saved to the question history log. Keys `referrer`, `email`, and `name` are shown in question history logs. Optional, defaults to `null` |
| **testing**     | boolean | Whether to mark question logs as by staff. Optional, defaults to `false`                                                                                                                                                  |

{% callout title="full_source behavior" %}
If `full_source` is set to `true`, the `content` property of each source will be populated with the full source content. This can be useful if you want to display the full source content in your interface. As source pages are divided into chunks, we normally only return unique source title/urls. But if this parameter is set to true multiple sources may be returned with the same title/url but different content.
{% /callout %}

## Examples

### cURL

```bash
curl --request POST 'https://api.docsbot.ai/teams/ZrbLG98bbxZ9EFqiPvyl/bots/oFFiXuQsakcqyEdpLvCB/chat' \
--header 'Content-Type: application/json' \
--data-raw '{
    "question": "What is WordPress?",
    "full_source": false,
    "metadata": {
        "referrer": "https://example.com",
        "email": "john@doe.com",
        "name": "John Doe"
    }
}'
```

### JavaScript (Fetch)

```js
var myHeaders = new Headers()
myHeaders.append('Content-Type', 'application/json')

var raw = JSON.stringify({
  question: 'What is WordPress?',
  full_source: false,
})

var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: raw,
  redirect: 'follow',
}

fetch(
  'https://api.docsbot.ai/teams/ZrbLG98bbxZ9EFqiPvyl/bots/oFFiXuQsakcqyEdpLvCB/chat',
  requestOptions
)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.log('error', error))
```

### PHP (cURL)

```php
<?php

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => 'https://api.docsbot.ai/teams/ZrbLG98bbxZ9EFqiPvyl/bots/oFFiXuQsakcqyEdpLvCB/chat',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 1,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'POST',
  CURLOPT_POSTFIELDS =>'{
    "question": "What is WordPress?",
    "full_source": false
}',
  CURLOPT_HTTPHEADER => array(
    'Content-Type: application/json'
  ),
));

$response = curl_exec($curl);

curl_close($curl);
echo $response;
```

## Response

Response is a JSON object with the following properties:

| Property    | Type   | Description                                                                                                                                      |
| ----------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **answer**  | string | The answer to the question in Markdown format.                                                                                                   |
| **sources** | array  | An array of source objects. Each source object contains the source type, title and optionally url, page, or content if `full_source` was `true`. |
| **history** | array  | The new chat history array to pass back with the next response.                                                                                  |
| **id**      | string | The unique ID of the answer. Use for the rating API.                                                                                             |

## The Source object

Source objects found in the `sources` array have the following properties:

| Property    | Type        | Description                                                                                                 |
| ----------- | ----------- | ----------------------------------------------------------------------------------------------------------- |
| **type**    | string      | Can be `url`, `document`, `sitemap`, `wp`, `urls`, `csv`, etc.                                              |
| **title**   | string      | The source title.                                                                                           |
| **url**     | string/null | The url for the source as set during indexing. May be null.                                                 |
| **page**    | string/null | The page for the source as set during indexing. May be null.                                                |
| **content** | string/null | The full source tex content for the source as set during indexing if `full_source` was `true`. May be null. |

```json
{
  "answer": "WordPress is an open source free software distributed under the GPL license. It is a self-hosted content management system that enables users to create and manage websites.",
  "sources": [
    {
      "type": "urls",
      "title": "Introduction to Open-Source | Learn WordPress ",
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
  "history": [
    [
      "What is WordPress?",
      "WordPress is an open source free software distributed under the GPL license. It is a self-hosted content management system that enables users to create and manage websites."
    ]
  ],
  "id": "O0avZ8ffTiAMRyjNrZpU"
}
```

---

## Follow-up questions

If you want to create a true chat experience, you can send follow-up questions to the API so that it remembers what was discussed previously in the conversation.

The Chat API is stateless, meaning we don't track chat sessions between requests via a cookie or any other method. It's the responsibility of your code to do any session tracking by saving the returned chat `history` parameter to send with the next request. This makes it a bit more complex to implement, but it also makes it more flexible and allows you to use the API in any way you want.

Given the reponse above, you can send a follow-up question that includes the returned history like this:

```bash
curl --request POST 'https://api.docsbot.ai/teams/ZrbLG98bbxZ9EFqiPvyl/bots/oFFiXuQsakcqyEdpLvCB/chat' \
--header 'Content-Type: application/json' \
--data-raw '{
    "question": "Who created it?",
    "full_source": false,
    "history": [
        [
            "What is WordPress?",
            "WordPress is an open source free software distributed under the GPL license. It is a self-hosted content management system that enables users to create and manage websites."
        ]
    ],
    "metadata": {
        "referrer": "https://example.com",
        "email": "john@doe.com",
        "name": "John Doe"
    }
}'
```

Now the response obviously understood the context of the conversation from the provided history:

```json
{
  "answer": "WordPress was created by Matt Mullenweg and Mike Little in 2003.",
  "sources": [
    {
      "type": "urls",
      "title": "Introduction to Contributing to WordPress | Learn WordPress ",
      "url": "https://learn.wordpress.org/tutorial/an-introduction-to-contributing/",
      "page": null,
      "content": null
    },
    {
      "type": "urls",
      "title": "General History Of WordPress | Learn WordPress ",
      "url": "https://learn.wordpress.org/lesson-plan/general-history-of-wordpress/",
      "page": null,
      "content": null
    },
    {
      "type": "urls",
      "title": "Learn about WordPress origins and version history – WordPress.org Documentation",
      "url": "https://wordpress.org/documentation/article/learn-about-wordpress-and-version-history/",
      "page": null,
      "content": null
    },
    {
      "type": "urls",
      "title": "Introduction to Open-Source | Learn WordPress ",
      "url": "https://learn.wordpress.org/tutorial/introduction-to-open-source/",
      "page": null,
      "content": null
    }
  ],
  "history": [
    [
      "What is WordPress?",
      "WordPress is an open source free software distributed under the GPL license. It is a self-hosted content management system that enables users to create and manage websites."
    ],
    ["Who created it?", "WordPress was created by Matt Mullenweg and Mike Little in 2003."]
  ],
  "id": "FFssbdOYB9VcEroEKM59"
}
```
