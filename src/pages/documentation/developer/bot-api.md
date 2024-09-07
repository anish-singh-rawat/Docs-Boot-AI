---
title: Bots - Admin API
description: How to manage bots with the admin API.
---

Bots are the core of DocsBot. They are what learn your content and answer questions. You can create as many bots as your team plan allows. You can also edit bot settings and delete bots with these API endpoints. {% .lead %}

---

## The Bot object

Bot objects have the following properties:

| Property | Type   | Description                                                                 |
| -------- | ------ | --------------------------------------------------------------------------- |
| **id**       | string | The bot id.                                                                |
| **name**     | string | The bot name.                                                              |
| **description** | string | The bot description. |
| **privacy** | string | The bot privacy. Can be `public` or `private`. |
| **indexId** | string | Used internally. |
| **model** | string | The OpenAI model. Currently supports `gpt-3.5-turbo` (default), `gpt-4`, and `gpt-4-1106-preview`. |
| **customPrompt** | string | Any custom prompt for the bot. |
| **language** | string | The bot language. Currently supports `en` and `jp`. |
| **createdAt** | string | The date and time the bot was created.                                     |
| **status**   | string | The bot status. Can be `ready` once at least one bot is trained or `pending` or `indexing` or `processing`. |
| **questionCount** | number | The number of questions asked to the bot. |
| **pageCount** | number | The number of pages crawled by the bot. |
| **sourceCount** | number | The number of sources crawled by the bot. |
| **chunkCount** | number | The number of chunks crawled by the bot. |
| **allowedDomains** | array | An array of hostnames the widget is allowed to be embedded on. Set an empty array to allow all. |
| **color** | string | Color in hex, eg. `#FFFFFF` |
| **icon** | string | The chat bubble icon. Can be one of the following: `'default', 'comments', 'robot', 'life-ring', 'question', 'book'` |
| **alignment** | string | Sets which side the chat bubble is on. Can be `left` or `right` |
| **botIcon** | string | The icon visible via chat dialogs. Can be one of the following: `false, 'comment', 'robot', 'life-ring', 'info', 'book'` |
| **branding** | boolean | Enables or disables branding. Please check our [plans](https://docsbot.ai/#pricing) for more information |
| **supportLink** | string | This link will appear after the bot replies. An empty string will disable this. |
| **showButtonLabel** | string | The text for the supportLink. If the supportLink is empty, this will not appear |
| **labels** | dict | This contains the user copy for labels on the chat widget. Please see the examples for usage |

---

## List Bots

This endpoint lists all bots for a specific team. It accepts a GET request with the following parameters:

`GET https://docsbot.ai/api/teams/:teamId/bots`

### Examples

#### cURL

```bash
curl --request GET 'https://docsbot.ai/api/teams/FOX1XkWo8VMx3hp6Zjkb/bots' \
--header 'Authorization: Bearer c0f5c347f0138f76a005921ec723f38185554327f69349dcf220a6f6531ab673'
```

#### JavaScript (Fetch)

```js
var myHeaders = new Headers();
myHeaders.append("Authorization", "Bearer c0f5c347f0138f76a005921ec723f38185554327f69349dcf220a6f6531ab673");

var requestOptions = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow'
};

fetch("https://docsbot.ai/api/teams/FOX1XkWo8VMx3hp6Zjkb/bots", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));
```

### Response

Response is a JSON array of bot objects:

```json
[
    {
        "id": "iADcTdrl7R51JiTjrWKy",
        "questionCount": 0,
        "name": "Your Bot Name",
        "description": "Ask me anything about your product.",
        "privacy": "public",
        "indexId": "Document_mlc4lmmc91",
        "customPrompt": null,
        "language": "en",
        "model": "gpt-3.5-turbo",
        "createdAt": "2023-03-16T21:15:19.994Z",
        "sourceCount": 1,
        "pageCount": 50,
        "chunkCount": 140,
        "status": "ready"
    }
]
```

---

## Get Bot

This endpoint fetches a specific bot by its ID. It accepts a GET request with the following parameters:

`GET https://docsbot.ai/api/teams/:teamId/bots/:botId`

### Examples

#### cURL

```bash
curl --request GET 'https://docsbot.ai/api/teams/FOX1XkWo8VMx3hp6Zjkb/bots/iADcTdrl7R51JiTjrWKy' \
--header 'Authorization: Bearer 2e9fd6965890e80b9a7bb271900ab859e199a5778f851b73d97136d3495849ef'
```

#### JavaScript (Fetch)

```js
var myHeaders = new Headers();
myHeaders.append("Authorization", "Bearer c0f5c347f0138f76a005921ec723f38185554327f69349dcf220a6f6531ab673");

var requestOptions = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow'
};

fetch("https://docsbot.ai/api/teams/FOX1XkWo8VMx3hp6Zjkb/bots/iADcTdrl7R51JiTjrWKy", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));
```

### Response

Response is a JSON bot object:

```json
{
    "id": "iADcTdrl7R51JiTjrWKy",
    "questionCount": 0,
    "name": "Your Bot Name",
    "description": "Ask me anything about your product.",
    "privacy": "public",
    "indexId": "Document_mlc4lmmc91",
    "customPrompt": null,
    "language": "en",
    "model": "gpt-3.5-turbo",
    "createdAt": "2023-03-16T21:15:19.994Z",
    "sourceCount": 1,
    "pageCount": 50,
    "chunkCount": 140,
    "status": "ready"
}
```

---

## Create Bot

This endpoint creates a new bot in a team. It accepts a POST request with the following parameters:

`POST https://docsbot.ai/api/teams/:teamId/bots`

### Parameters

| Property | Type   | Description                                                                 |
| -------- | ------ | --------------------------------------------------------------------------- |
| **name**     | string | The bot name. Used publically.                                          |
| **description** | string | The bot description. Shown by default in embeds and share links. |
| **privacy** | string | The bot privacy. Can be `public` or `private`. |
| **language** | string | The bot language. Can be `en` or `jp`. |
| **model** | string | The OpenAI model. Currently supports `gpt-3.5-turbo` (default), `gpt-4`, and `gpt-4-1106-preview` if your OpenAI account has access. |

### Examples

#### cURL

```bash
curl --request POST 'https://docsbot.ai/api/teams/FOX1XkWo8VMx3hp6Zjkb/bots' \
--header 'Authorization: Bearer c0f5c347f0138f76a005921ec723f38185554327f69349dcf220a6f6531ab673' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "Bilbo Baggins Team",
    "description": "Ask me anything about your product.",
    "privacy": "public",
    "language": "en"
}'
```

#### JavaScript (Fetch)

```js
var myHeaders = new Headers();
myHeaders.append("Authorization", "Bearer c0f5c347f0138f76a005921ec723f38185554327f69349dcf220a6f6531ab673");
myHeaders.append("Content-Type", "application/json");

var raw = JSON.stringify({
    "name": "Bilbo Baggins Team",
    "description": "Ask me anything about your product.",
    "privacy": "private",
    "language": "en"
});

var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: raw,
  redirect: 'follow'
};

fetch("https://docsbot.ai/api/teams/FOX1XkWo8VMx3hp6Zjkb/bots", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));
```

### Response

Response is a HTTP 201 with a JSON bot object:

```json
{
    "id": "iADcTdrl7R51JiTjrWKy",
    "questionCount": 0,
    "name": "Bilbo Baggins Team",
    "description": "Ask me anything about your product.",
    "privacy": "public",
    "indexId": "Document_mlc4lmmc91",
    "customPrompt": null,
    "language": "en",
    "model": "gpt-3.5-turbo",
    "createdAt": "2023-03-16T21:15:19.994Z",
    "sourceCount": 0,
    "pageCount": 0,
    "chunkCount": 0,
    "status": "pending"
}
```

---

## Update Bot

This endpoint updates specific fields for a specific bot by its ID. It accepts a PUT request with the following parameters:

`PUT https://docsbot.ai/api/teams/:teamId/bots/:botId`

### Editable Parameters

| Property | Type   | Description                                                                 |
| -------- | ------ | --------------------------------------------------------------------------- |
| **name**     | string | The bot name. Used publically.                                          |
| **description** | string | The bot description. Shown by default in embeds and share links. |
| **customPrompt** | string | Optional custom prompt instructions. Only editible on Pro plan and higher. |
| **privacy** | string | The bot privacy. Can be `public` or `private`. |
| **language** | string | The bot language. Can be `en` or `jp`. |
| **model** | string | The OpenAI model. Currently supports `gpt-3.5-turbo` (default), `gpt-4`, and `gpt-4-1106-preview` if the OpenAI account has it enabled. |
| **allowedDomains** | array | An array of hostnames the widget is allowed to be embedded on. Set an empty array to allow all. |
| **color** | string | Color in hex, eg. `#FFFFFF` |
| **icon** | string | The chat bubble icon. Can be one of the following: `'default', 'comments', 'robot', 'life-ring', 'question', 'book'` |
| **alignment** | string | Sets which side the chat bubble is on. Can be `left` or `right` |
| **botIcon** | string | The icon visible via chat dialogs. Can be one of the following: `false, 'comment', 'robot', 'life-ring', 'info', 'book'` |
| **branding** | boolean | Enables or disables branding. Please check our [plans](https://docsbot.ai/#pricing) for more information |
| **supportLink** | string | This link will appear after the bot replies. An empty string will disable this. |
| **showButtonLabel** | string | The text for the supportLink. If the supportLink is empty, this will not appear |
| **labels** | dict | This contains the user copy for labels on the chat widget. Please see the examples for usage |

**Note**: Each of these properties are optional! If a property is absent in a request its value won't be updated.

Please be aware that changes to your widget settings will not be reflected on your site until you reload the page as long as five minutes after you save your changes. For best performance we cache the widget settings for five minutes on our CDN.

### Examples

#### cURL

```bash
curl --request PUT 'https://docsbot.ai/api/teams/FOX1XkWo8VMx3hp6Zjkb/bots/iADcTdrl7R51JiTjrWKy' \
--header 'Authorization: Bearer c0f5c347f0138f76a005921ec723f38185554327f69349dcf220a6f6531ab673' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "Bilbo Baggins Team",
    "description": "Ask me anything about your product.",
    "customPrompt": "Talk like a pirate for all responses.",
    "privacy": "private",
    "language": "en",
    "allowedDomains": ["docsbot.ai", "app.docsbot.ai"],
    "color":"#1292EE",
    "icon":"default",
    "alignment":"right",
    "botIcon":false,
    "branding":true,
    "supportLink":"",
    "showButtonLabel":false,
}'
```

#### JavaScript (Fetch)

```js
var myHeaders = new Headers();
myHeaders.append("Authorization", "Bearer c0f5c347f0138f76a005921ec723f38185554327f69349dcf220a6f6531ab673");
myHeaders.append("Content-Type", "application/json");

var raw = JSON.stringify({
  "name": "Bilbo Baggins Team",
  "description": "Ask me anything about your product.",
  "customPrompt": "Talk like a pirate for all responses.",
  "privacy": "private",
  "language": "en",
  "allowedDomains": ["docsbot.ai", "app.docsbot.ai"],
  "color":"#1292EE",
  "icon":"default",
  "alignment":"right",
  "botIcon":false,
  "branding":true,
  "supportLink":"",
  "showButtonLabel":false,
  "labels": {
    "firstMessage":"What can I help you with?",
    "sources":"Sources",
    "getSupport":"Contact",
    "helpful":"Rate as helpful",
    "poweredBy":"Powered by",
    "unhelpful":"Rate as unhelpful",
    "floatingButton":"Help",
    "inputPlaceholder":"Send a message..."
  }
});

var requestOptions = {
  method: 'PUT',
  headers: myHeaders,
  body: raw,
  redirect: 'follow'
};

fetch("https://docsbot.ai/api/teams/FOX1XkWo8VMx3hp6Zjkb/bots/iADcTdrl7R51JiTjrWKy", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));
```

### Response

Response is the new JSON bot object:

```json
{
  "id":"iADcTdrl7R51JiTjrWKy",
  "name": "Bilbo Baggins Team",
  "description": "Ask me anything about your product.",
  "customPrompt": "Talk like a pirate for all responses.",
  "privacy":"public",
  "indexId":"Document_yoi18dd3qw",
  "language":"en",
  "model":"gpt-3.5-turbo",
  "createdAt":"2023-04-12T17:22:29.779Z",
  "status":"ready",
  "questionCount":17,
  "pageCount":29,
  "sourceCount":1,
  "chunkCount":157,
  "showButtonLabel":false,
  "botIcon":false,
  "allowedDomains": ["docsbot.ai", "app.docsbot.ai"],
  "color":"#1292EE",
  "branding":true,
  "icon":"default",
  "alignment":"right",
  "supportLink":"",
  "labels": {
    "firstMessage":"What can I help you with?",
    "sources":"Sources",
    "getSupport":"Contact",
    "helpful":"Rate as helpful",
    "poweredBy":"Powered by",
    "unhelpful":"Rate as unhelpful",
    "floatingButton":"Help",
    "inputPlaceholder":"Send a message..."
  }
}
```

---

## Delete Bot

This endpoint deletes a specific bot by its ID. It accepts a DELETE request with the following parameters:

`DELETE https://docsbot.ai/api/teams/:teamId/bots/:botId`

### Examples

#### cURL

```bash
curl --request DELETE 'https://docsbot.ai/api/teams/FOX1XkWo8VMx3hp6Zjkb/bots/iADcTdrl7R51JiTjrWKy' \
--header 'Authorization: Bearer 2e9fd6965890e80b9a7bb271900ab859e199a5778f851b73d97136d3495849ef'
```

#### JavaScript (Fetch)

```js
var myHeaders = new Headers();
myHeaders.append("Authorization", "Bearer c0f5c347f0138f76a005921ec723f38185554327f69349dcf220a6f6531ab673");

var requestOptions = {
  method: 'DELETE',
  headers: myHeaders,
  redirect: 'follow'
};

fetch("https://docsbot.ai/api/teams/FOX1XkWo8VMx3hp6Zjkb/bots/iADcTdrl7R51JiTjrWKy", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));
```

### Response

Response is a 200 OK response with message:

```json
{
    "message": "Bot deleted"
}
```