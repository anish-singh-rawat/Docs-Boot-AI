---
title: Question and Answer (Q/A) API
description: The Q/A API is the simplest and is used to get answers to questions.
---

The Q/A API is the simplest and is used to get answers to questions. You pass it one question, and it returns one answer along with its sources. This is the endpoint you should use if you want to create a simple Q/A interface in your product. {% .lead %}

---

{% callout type="warning" title="This endpoint is Deprecated" %}
This is an older endpoint that still works, but we recommend using the [Chat API](/documentation/developer/chat-api) instead. The Chat API is more flexible and allows you to create Q/A interfaces as well as full chat interfaces.
{% /callout %}

## Request

This endpoint accepts a POST request with the following parameters:

`POST https://api.docsbot.ai/teams/[teamId]/bots/[botId]/ask`

### Parameters

| Parameter   | Type    | Description                                                                       |
| ----------- | ------- | --------------------------------------------------------------------------------- |
| **question**    | string  | The question to ask the bot. 5 to 2000 characters.                                |
| **full_source** | boolean | Whether the full source content should be returned. Optional, defaults to `false` |

{% callout title="full_source behavior" %}
If `full_source` is set to `true`, the `content` property of each source will be populated with the full source content. This can be useful if you want to display the full source content in your interface. As source pages are divided into chunks, we normally only return unique source title/urls. But if this parameter is set to true multiple sources may be returned with the same title/url but different content.
{% /callout %}

## Examples

### cURL

```bash
curl --request POST 'https://api.docsbot.ai/teams/ZrbLG98bbxZ9EFqiPvyl/bots/oFFiXuQsakcqyEdpLvCB/ask' \
--header 'Content-Type: application/json' \
--data-raw '{
    "question": "What is WordPress?",
    "full_source": false
}'
```

### JavaScript (Fetch)

```js
var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

var raw = JSON.stringify({
  "question": "What is WordPress?",
  "full_source": false
});

var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: raw,
  redirect: 'follow'
};

fetch("https://api.docsbot.ai/teams/ZrbLG98bbxZ9EFqiPvyl/bots/oFFiXuQsakcqyEdpLvCB/ask", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));
```

### PHP (cURL)

```php
<?php

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => 'https://api.docsbot.ai/teams/ZrbLG98bbxZ9EFqiPvyl/bots/oFFiXuQsakcqyEdpLvCB/ask',
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

| Property | Type   | Description                                                                 |
| -------- | ------ | --------------------------------------------------------------------------- |
| **answer**   | string | The answer to the question in Markdown format.                               |
| **sources**  | array  | An array of source objects. Each source object contains the source type, title and optionally url, page, or content if `full_source` was `true`. |
| **id**       | string | The unique ID of the answer. Use for the rating API.                                              |

## The Source object

Source objects found in the `sources` array have the following properties:

| Property       | Type   | Description                                                                                                           |
| -------------- | ------ | --------------------------------------------------------------------------------------------------------------------- |
| **type**       | string | Can be `url`, `document`, `sitemap`, `wp`, `urls`, `csv`, etc.                                                        |
| **title**      | string | The source title.                                                                                                     |
| **url**        | string/null | The url for the source as set during indexing. May be null.                                                        |
| **page**       | string/null | The page for the source as set during indexing. May be null.                                                       |
| **content**    | string/null | The full source tex content for the source as set during indexing  if `full_source` was `true`. May be null.   |

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
    "id": "O0avZ8ffTiAMRyjNrZpU"
}
```
