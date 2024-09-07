---
title: Sources - Admin API
description: How to manage sources with the admin API.
---

Sources are how your train your bots. They can be urls, files, sitemaps, and many other types. You can create as many sources as your team plan allows. You can also edit source settings and delete sources with these API endpoints. {% .lead %}

---

## The Source object

Source objects have the following properties:

| Property             | Type   | Description                                                                                                                                                            |
| -------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **id**               | string | The source id.                                                                                                                                                         |
| **type**             | string | Can be `url`, `document`, `sitemap`, `wp`, `urls`, `csv`, `rss`, `qa`. All but url and sitemap require uploading a formatted file.                                     |
| **status**           | string | The source status. Can be `pending`, `indexing`, `processing`, `ready`, or `failed`.                                                                                   |
| **title**            | string | The source title. Required only for `document` type.                                                                                                                   |
| **url**              | string | The source url. Optional except for `url`, `sitemap`, and `rss` types.                                                                                                 |
| **file**             | string | The source file path. Required if type is `urls`, `csv`, `document`, or `wp`. The is usually the cloud storage path from the GET /upload-url API response.             |
| **createdAt**        | string | The source creation date.                                                                                                                                              |
| **pageCount**        | number | The number of pages indexed from the source.                                                                                                                           |
| **chunkCount**       | number | The number of chunks indexed from the source.                                                                                                                          |
| **scheduleInterval** | string | The source schedule interval. Can be `daily`, `weekly`, `monthly`, or `none`.                                                                                          |
| **faqs**             | array  | Required if type is `qa`. An array of objects like `[{"question":"Question text", "answer":"The answer."}]`. Ommitted when listing sources.                            |
| **indexedUrls**      | array  | An array of indexed url objects `[{"source":"https://url.com", "title":"Page title"}]` for some source types like `urls` and `sitemap`. Ommitted when listing sources. |
| **warnsList**        | array  | An array of warning strings encountered when training.                                                                                  |
| **carbonFiles**      | array  | An array of file objects for cloud source types. May include `id`, `type`, `name`, `url`. Ommitted when listing sources.                                               |

---

## List Sources

This endpoint lists all sources for the given team and bot. It accepts a GET request with the following parameters:

`GET https://docsbot.ai/api/teams/:teamId/bots/:botId/sources`

### Examples

#### cURL

```bash
curl --request GET 'https://docsbot.ai/api/teams/FOX1XkWo8VMx3hp6Zjkb/bots/SQMV36O8xi43xbZRzYLy/sources' \
--header 'Authorization: Bearer c0f5c347f0138f76a005921ec723f38185554327f69349dcf220a6f6531ab673'
```

#### JavaScript (Fetch)

```js
var myHeaders = new Headers()
myHeaders.append(
  'Authorization',
  'Bearer c0f5c347f0138f76a005921ec723f38185554327f69349dcf220a6f6531ab673'
)

var requestOptions = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow',
}

fetch(
  'https://docsbot.ai/api/teams/FOX1XkWo8VMx3hp6Zjkb/bots/SQMV36O8xi43xbZRzYLy/sources',
  requestOptions
)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.log('error', error))
```

### Response

Response is a JSON array of partial source objects. The full source object containing parameters like `faqs`, `indexedUrls`, `warnsList`, `carbonFiles`, etc, can be fetched with the get source endpoint using the returned `id`s.

```json
[
  {
    "id": "qGDSDhbdxtqmifTZQrYs",
    "file": null,
    "type": "url",
    "url": "https://wordpress.org/plugins/infinite-uploads/",
    "createdAt": "2023-03-09T22:07:24.442Z",
    "pageCount": 3,
    "chunkCount": 10,
    "title": "Infinite Uploads – Offload Media and Video to Cloud Storage – WordPress plugin | WordPress.org",
    "status": "ready"
  }
]
```

---

## Get Source

This endpoint fetches a specific source by its ID. This will return the full source object unlike listing. It accepts a GET request with the following parameters:

`GET https://docsbot.ai/api/teams/:teamId/bots/:botId/sources/:sourceId`

### Examples

#### cURL

```bash
curl --request GET 'https://docsbot.ai/api/teams/FOX1XkWo8VMx3hp6Zjkb/bots/SQMV36O8xi43xbZRzYLy/sources/qGDSDhbdxtqmifTZQrYs' \
--header 'Authorization: Bearer 2e9fd6965890e80b9a7bb271900ab859e199a5778f851b73d97136d3495849ef'
```

#### JavaScript (Fetch)

```js
var myHeaders = new Headers()
myHeaders.append(
  'Authorization',
  'Bearer c0f5c347f0138f76a005921ec723f38185554327f69349dcf220a6f6531ab673'
)

var requestOptions = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow',
}

fetch(
  'https://docsbot.ai/api/teams/FOX1XkWo8VMx3hp6Zjkb/bots/SQMV36O8xi43xbZRzYLy/sources/qGDSDhbdxtqmifTZQrYs',
  requestOptions
)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.log('error', error))
```

### Response

Response is a JSON source object:

```json
{
  "id": "qGDSDhbdxtqmifTZQrYs",
  "file": null,
  "type": "url",
  "url": "https://wordpress.org/plugins/infinite-uploads/",
  "createdAt": "2023-03-09T22:07:24.442Z",
  "pageCount": 3,
  "chunkCount": 10,
  "title": "Infinite Uploads – Offload Media and Video to Cloud Storage – WordPress plugin | WordPress.org",
  "status": "ready"
}
```

---

## Create Source

This endpoint creates a new source for a bot. It accepts a POST request with the following parameters:

`POST https://docsbot.ai/api/teams/:teamId/bots/:botId/sources`

### Parameters

| Property             | Type   | Description                                                                                                                                                |
| -------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **type**             | string | The source type. Can be `url`, `rss`,`sitemap`, `urls`, `csv`, `document`, `qa` or `wp`.                                                                   |
| **title**            | string | The source title. Optional except for `document`.                                                                                                          |
| **url**              | string | The source URL. Required if type is `url`, `sitemap`, or `rss`.                                                                                            |
| **file**             | string | The source file path. Required if type is `urls`, `csv`, `document`, or `wp`. The is usually the cloud storage path from the GET /upload-url API response. |
| **faqs**             | array  | Required if type is `qa`. An array of objects like `[{"question":"Question text", "answer":"The answer."}]`                                                |
| **scheduleInterval** | string | The source refresh scheduled interval. Can be `daily`, `weekly`, `monthly`, or `none` depending on your plan. Optional, defaults to `none`.                |

### Examples

#### cURL

```bash
curl --request POST 'https://docsbot.ai/api/teams/FOX1XkWo8VMx3hp6Zjkb/bots/SQMV36O8xi43xbZRzYLy/sources' \
--header 'Authorization: Bearer c0f5c347f0138f76a005921ec723f38185554327f69349dcf220a6f6531ab673' \
--header 'Content-Type: application/json' \
--data-raw '{
    "type": "url",
    "title": "Infinite Uploads",
    "url": "https://infiniteuploads.com"
}'
```

#### JavaScript (Fetch)

```js
var myHeaders = new Headers()
myHeaders.append(
  'Authorization',
  'Bearer c0f5c347f0138f76a005921ec723f38185554327f69349dcf220a6f6531ab673'
)
myHeaders.append('Content-Type', 'application/json')

var raw = JSON.stringify({
  type: 'url',
  title: 'Infinite Uploads',
  url: 'https://infiniteuploads.com',
})

var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: raw,
  redirect: 'follow',
}

fetch(
  'https://docsbot.ai/api/teams/FOX1XkWo8VMx3hp6Zjkb/bots/SQMV36O8xi43xbZRzYLy/sources',
  requestOptions
)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.log('error', error))
```

### Response

Response is a HTTP 201 with a JSON source object:

```json
{
  "id": "qGDSDhbdxtqmifTZQrYs",
  "file": null,
  "type": "url",
  "title": "Infinite Uploads",
  "url": "https://infiniteuploads.com",
  "createdAt": "2023-03-09T22:07:24.442Z",
  "pageCount": 0,
  "chunkCount": 0,
  "status": "pending"
}
```

## Source File Uploads

We do not support POSTing binary files directly with the create source endpoint. Instead you can upload even very large files directly to our temporary cloud storage then provide that path to the create source API call.

### Create a Presigned Upload URL

You'll first need to request a presigned upload URL from the upload-url endpoint.

`GET https://docsbot.ai/api/teams/:teamId/bots/:botId/upload-url?fileName=FILENAME`

The endpoint returns the following response:

```json
{
  "url": "https://storage.googleapis.com/docsbot-test-c2482.appspot.com/user/14D4jUo51sMuSjWQg9MDe5naM9i2/team/0NZfVRlrjJ6d4YdwUGHt/bot/yR5EwAGpINpmp7XzT9qL/test.csv?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=firebase-adminsdk-74lpp%40docsbot-test-c2482.iam.gserviceaccount.com%2F20230627%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20230627T205900Z&X-Goog-Expires=1801&X-Goog-SignedHeaders=content-type%3Bhost&X-Goog-Signature=66a8d1eaa398a0bc404a0a67f3c608003279fb5fa2ag5f89b344b359b7ecf6fd132665ce736e3070d9701c66c8f825aa3c7823b93fe82c203d9a6b8fd119d6c3dce0e51df08d41690c007ba0be44e37b25d9f7c5fcde3bca34d388b6263ebe0b04dd84765b5d9ca35af0688d2f2c4e3edba906399e6b44f8d1526d0f89c89b4de70d2e1b581cfe880eb0ddb571dd0d618a7e6f87966137c773dd6853d36f501251a1f8179a729c5a3bde9a324103e4de625cfe9615c18cdcf4576c8e0ce092fc0a58d8e8297a5f767999f9f0ee06c34ace8386bec13eb5cc26a4e259b022f9c2b53d7468669c53328aa8c8d69962f0a8632a0a8c7db68e3ad9fd15045c70e6e9",
  "file": "user/14D4jUo51sMuSjWQg9MDe5naM9i2/team/0NZfVRlrjJ6d4YdwUGHt/bot/yR5EwAGpINpmp7XzT9qL/test.csv"
}
```

### Upload File to Cloud Storage

Now, you'll be able to PUT to the sent url the file you want to upload:

#### cURL

```bash
curl -X PUT -H 'Content-Type: application/octet-stream' --upload-file test.csv https://storage.googleapis.com/docsbot-test-c2482.appspot.com/user/14D4jUo51sMuSjWQg9MDe5naM9i2/team/0NZfVRlrjJ6d4YdwUGHt/bot/yR5EwAGpINpmp7XzT9qL/test.csv?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=firebase-adminsdk-74lpp%40docsbot-test-c2482.iam.gserviceaccount.com%2F20230627%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20230627T205900Z&X-Goog-Expires=1801&X-Goog-SignedHeaders=content-type%3Bhost&X-Goog-Signature=66a8d...
```

#### JavaScript (NodeJS Fetch)

```js
const fetch = require('node-fetch')
const fs = require('fs')

const file = fs.readFileSync('test.csv')

const url =
  'https://storage.googleapis.com/docsbot-test-c2482.appspot.com/user/14D4jUo51sMuSjWQg9MDe5naM9i2/team/0NZfVRlrjJ6d4YdwUGHt/bot/yR5EwAGpINpmp7XzT9qL/test.csv?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=firebase-adminsdk-74lpp%40docsbot-test-c2482.iam.gserviceaccount.com%2F20230627%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20230627T205900Z&X-Goog-Expires=1801&X-Goog-SignedHeaders=content-type%3Bhost&X-Goog-Signature=66...'

fetch(url, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/octet-stream',
  },
  body: file,
})
  .then(() => {
    console.log('File uploaded successfully')
  })
  .catch((error) => {
    console.error('Error uploading file:', error)
  })
```

### Create Source with the File Path

Then finally, you can create your source using the normal source API. A full example of this looks like:

```js
const teamId = '0NZfVRlrjJ6d4YdwUGHt'
const botId = 'yR5EwAGpINpmp7XzT9qL'
const authToken = '8656f848949372c090cd455cc39c158b5b8bd9a00d0c9807f832bec30b1735a1'

// Get upload URL
fetch(`https://docsbot.ai/api/teams/${teamId}/bots/${botId}/upload-url?fileName=test.csv`, {
  headers: {
    Authorization: `Bearer ${authToken}`,
  },
})
  .then((response) => response.json())
  .then((data) => {
    const url = data.url
    const file = data.file

    console.log('Uploading to ', url)

    // Upload file to URL
    fetch(url, {
      method: 'PUT',
      body: require('fs').createReadStream('test.csv'),
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    })

    console.log('Creating source...')

    // Upload source
    fetch(`https://docsbot.ai/api/teams/${teamId}/bots/${botId}/sources`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'csv',
        title: 'test',
        file: file,
        url: 'https://www.google.com',
      }),
    })
  })
```

---

## Retry Source

If a source fails or is status indexed it is possible to trigger an index retry. It accepts a PUT request with no parameters:

`PUT https://docsbot.ai/api/teams/:teamId/bots/:botId/sources/:sourceId`

### Examples

#### cURL

```bash
curl --request PUT 'https://docsbot.ai/api/teams/FOX1XkWo8VMx3hp6Zjkb/bots/SQMV36O8xi43xbZRzYLy/sources/qGDSDhbdxtqmifTZQrYs' \
--header 'Authorization: Bearer c0f5c347f0138f76a005921ec723f38185554327f69349dcf220a6f6531ab673'
```

### Response

Response is am HTTP 201 with the new JSON source object:

```json
{
  "id": "qGDSDhbdxtqmifTZQrYs",
  "file": null,
  "type": "url",
  "url": "https://wordpress.org/plugins/infinite-uploads/",
  "createdAt": "2023-03-09T22:07:24.442Z",
  "pageCount": 3,
  "chunkCount": 10,
  "title": "Infinite Uploads – Offload Media and Video to Cloud Storage – WordPress plugin | WordPress.org",
  "status": "ready"
}
```

---

## Delete Source

This endpoint deletes a specific source by its ID. Please note however, that it may take several minutes for the sources to be completely removed from our services, meaning that sources may still be recommended in chat results for several minutes after deleting. It accepts a DELETE request with the following parameters:

`DELETE https://docsbot.ai/api/teams/:teamId/bots/:botId/sources/:sourceId`

### Examples

#### cURL

```bash
curl --request DELETE 'https://docsbot.ai/api/teams/FOX1XkWo8VMx3hp6Zjkb/bots/SQMV36O8xi43xbZRzYLy/sources/qGDSDhbdxtqmifTZQrYs' \
--header 'Authorization: Bearer 2e9fd6965890e80b9a7bb271900ab859e199a5778f851b73d97136d3495849ef'
```

#### JavaScript (Fetch)

```js
var myHeaders = new Headers()
myHeaders.append(
  'Authorization',
  'Bearer c0f5c347f0138f76a005921ec723f38185554327f69349dcf220a6f6531ab673'
)

var requestOptions = {
  method: 'DELETE',
  headers: myHeaders,
  redirect: 'follow',
}

fetch(
  'https://docsbot.ai/api/teams/FOX1XkWo8VMx3hp6Zjkb/bots/SQMV36O8xi43xbZRzYLy/sources/qGDSDhbdxtqmifTZQrYs',
  requestOptions
)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.log('error', error))
```

### Response

Response is a 200 OK response with message:

```json
{
  "message": "Source deleted successfully"
}
```
