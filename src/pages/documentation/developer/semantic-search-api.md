---
title: Semantic Search API
description: The Semantic Search API can be used as a search engine for your documentation.
---

The Semantic Search API can be used as a search engine for your documentation. It returns the most relevant source chunks for a given query. It can be used to create a search interface for your trained content and documentation, or to power your own custom AI creations.

---

## Request

This endpoint accepts a POST request with the following parameters:

`POST https://api.docsbot.ai/teams/[teamId]/bots/[botId]/search`

### Parameters

| Parameter | Type    | Description                                                    |
| --------- | ------- | -------------------------------------------------------------- |
| **query** | string  | The query to search for.                                       |
| **top_k** | integer | The number of source chunks to return. Optional, default is 4. |

## Examples

### cURL

```bash
curl --request POST 'https://api.docsbot.ai/teams/ZrbLG98bbxZ9EFqiPvyl/bots/oFFiXuQsakcqyEdpLvCB/search' \
--header 'Content-Type: application/json' \
--data-raw '{
    "query": "What is WordPress?",
    "top_k": 4
}'
```

### JavaScript (Fetch)

```js
var myHeaders = new Headers()
myHeaders.append('Content-Type', 'application/json')

var raw = JSON.stringify({
  query: 'What is WordPress?',
})

var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: raw,
  redirect: 'follow',
}

fetch(
  'https://api.docsbot.ai/teams/ZrbLG98bbxZ9EFqiPvyl/bots/oFFiXuQsakcqyEdpLvCB/search',
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
  CURLOPT_URL => 'https://api.docsbot.ai/teams/ZrbLG98bbxZ9EFqiPvyl/bots/oFFiXuQsakcqyEdpLvCB/search',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 1,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'POST',
  CURLOPT_POSTFIELDS =>'{
    "query": "What is WordPress?",
    "top_k": 4
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

| Type  | Description                                                                                             |
| ----- | ------------------------------------------------------------------------------------------------------- |
| array | An array of source objects. Each source object contains the source type, title, url, page, and content. |

### The Source object

Source objects found in the `sources` array have the following properties:

| Property    | Type        | Description                                                                                             |
| ----------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| **type**    | string      | Can be `url`, `document`, `sitemap`, `wp`, `urls`, `csv`, etc.                                          |
| **title**   | string      | The source title.                                                                                       |
| **url**     | string/null | The url for the source as set during indexing. May be null.                                             |
| **page**    | string/null | The page for the source as set during indexing. May be null.                                            |
| **content** | string/null | The full source text chunk content for the source as set during indexing. It may be in markdown format. |

```json
[
  {
    "title": "High-Level Overview | Learn WordPress ",
    "url": "https://learn.wordpress.org/lesson-plan/high-level-overview/",
    "page": null,
    "content": "Title: High-Level Overview | Learn WordPress \nURL: https://learn.wordpress.org/lesson-plan/high-level-overview/\n\nDescription\nThis lesson is an introduction to WordPress for people who have heard of it, but are not quite sure what it does or if it is the right tool for them. You will learn about the origins of WordPress and its evolution from a blogging platform to a full-fledged content management system. We will also look at some of its components and how they are used to build a functional website. Finally, we will talk about the third party services you will need to operate a self-hosted WordPress site.  \nObjectives\nAt the end of this lesson, you will be able to:\nOutline and describe the basic history of WordPress.Identify the differences between WordPress.com and WordPress."
  },
  {
    "title": "How to do triage on GitHub | Learn WordPress ",
    "url": "https://learn.wordpress.org/tutorial/how-to-do-triage-on-github/",
    "page": null,
    "content": "Title: How to do triage on GitHub | Learn WordPress \nURL: https://learn.wordpress.org/tutorial/how-to-do-triage-on-github/\n\nWordPress.org\n\n\n \n\n\n\n\nWordPress.org\n\n\n\n \n\n\n\nVisit our Facebook page\nVisit our Twitter account\nVisit our Instagram account\nVisit our LinkedIn account\nVisit our YouTube channel"
  },
  {
    "title": "How WordPress processes Post Content – WordPress.org Documentation",
    "url": "https://wordpress.org/documentation/article/how-wordpress-processes-post-content/",
    "page": null,
    "content": "Title: How WordPress processes Post Content – WordPress.org Documentation\nURL: https://wordpress.org/documentation/article/how-wordpress-processes-post-content/\n\nWordPress.org\n\n\n \n\n\n\n\nWordPress.org\n\n\n\n \n\n\n\nVisit our Facebook page\nVisit our Twitter account\nVisit our Instagram account\nVisit our LinkedIn account\nVisit our YouTube channel"
  },
  {
    "title": "WordPress Block Editor – WordPress.org Documentation",
    "url": "https://wordpress.org/documentation/article/wordpress-block-editor/",
    "page": null,
    "content": "Title: WordPress Block Editor – WordPress.org Documentation\nURL: https://wordpress.org/documentation/article/wordpress-block-editor/\n\nWordPress.org\n\n\n \n\n\n\n\nWordPress.org\n\n\n\n \n\n\n\nVisit our Facebook page\nVisit our Twitter account\nVisit our Instagram account\nVisit our LinkedIn account\nVisit our YouTube channel"
  }
]
```
