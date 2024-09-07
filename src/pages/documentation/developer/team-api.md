---
title: Teams - Admin API
description: How to manage teams with the admin API.
---

The admin API is organized around teams. When you signup for DocsBot it creates a team and then you can create bots and sources for that team. You can find your team id in the [dashboard API page](/app/api).

---

## The Team Object

Team objects have the following properties:

| Property | Type   | Description                                                                 |
| -------- | ------ | --------------------------------------------------------------------------- |
| **id**       | string | The team id.                                                                |
| **name**     | string | The team name.                                                              |
| **createdAt** | string | The date and time the team was created.                                     |
| **status**   | string | The team status. Can be `ready` once at least one bot is trained or `pending`. |
| **questionCount** | number | The number of questions asked to the team's bots. |
| **pageCount** | number | The number of pages crawled by the team's bots. |
| **sourceCount** | number | The number of sources crawled by the team's bots. |
| **chunkCount** | number | The number of chunks crawled by the team's bots. |
| **openAIKey** | string | The partial OpenAI API key used by the team's bots. |
| **botCount** | number | The number of bots in the team. |
| **plan** | object | The team plan and its limits. |

---

## List Teams

This endpoint lists all teams that the API key user has a role for. It accepts a GET request with the following parameters:

`GET https://docsbot.ai/api/teams`

### Examples

#### cURL

```bash
curl --request GET 'https://docsbot.ai/api/teams' \
--header 'Authorization: Bearer 2e9fd6965890e80b9a7bb271900ab859e199a5778f851b73d97136d3495849ef'
```

#### JavaScript (Fetch)

```js
var myHeaders = new Headers();
myHeaders.append("Authorization", "Bearer 2e9fd6965890e80b9a7bb271900ab859e199a5778f851b73d97136d3495849ef");

var requestOptions = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow'
};

fetch("https://docsbot.ai/api/teams", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));
```

### Response

Response is a JSON array of team objects:

```json
[
    {
        "id": "FOX1XkWo8VMl3hp6Zjkb",
        "roles": {
            "L0TIShBCuYM3iOP25MgiSdZFYtZ2": "owner"
        },
        "name": "Bilbo Baggin's Team",
        "createdAt": "2023-03-14T14:18:54.869Z",
        "status": "ready",
        "questionCount": 10,
        "pageCount": 0,
        "sourceCount": 0,
        "chunkCount": 0,
        "openAIKey": "sk-W...iRpT",
        "botCount": 1,
        "plan": {
            "name": "Free",
            "bots": 1,
            "sources": 3,
            "pages": 50,
            "questions": 100
        }
    },
    {
        "id": "ZrbKG98baxZ9EFqiPvyc",
        "roles": {
            "L0TIShBCuYM3iOP25MgiSdZFYtZ2": "owner"
        },
        "name": "Bubba Gump's Team",
        "createdAt": "2023-03-06T19:56:53.639Z",
        "status": "ready",
        "openAIKey": "sk-W...iRpT",
        "botCount": 5,
        "sourceCount": 19,
        "pageCount": 11318,
        "chunkCount": 46175,
        "questionCount": 654,
        "plan": {
            "name": "Free",
            "bots": 1,
            "sources": 3,
            "pages": 50,
            "questions": 100
        }
    }
]
```

---

## Get Team

This endpoint fetches a specific team by its ID. It accepts a GET request with the following parameters:

`GET https://docsbot.ai/api/teams/:teamId`

### Examples

#### cURL

```bash
curl --request GET 'https://docsbot.ai/api/teams/FOX1XkWo8VMx3hp6Zjkb' \
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

fetch("https://docsbot.ai/api/teams/FOX1XkWo8VMx3hp6Zjkb", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));
```

### Response

Response is a JSON team object:

```json
{
    "id": "FOX1XkWo8VMx3hp6Zjkb",
    "roles": {
        "L0TIShBCuYM3iOP25MgiSdZFYtZ2": "owner"
    },
    "name": "Bubba Gump's Team",
    "createdAt": "2023-03-14T14:18:54.869Z",
    "status": "ready",
    "questionCount": 10,
    "pageCount": 0,
    "sourceCount": 0,
    "chunkCount": 0,
    "openAIKey": "sk-W...iRpT",
    "botCount": 1,
    "plan": {
        "name": "Free",
        "bots": 1,
        "sources": 3,
        "pages": 50,
        "questions": 100
    }
}
```

---

## Update Team

This endpoint updates specific fields for a specific team by its ID. It accepts a PUT request with the following parameters:

`PUT https://docsbot.ai/api/teams/:teamId`

### Editable Parameters

| Property | Type   | Description                                                                 |
| -------- | ------ | --------------------------------------------------------------------------- |
| **name**     | string | The team name.                                                              |
| **openAIKey** | string | The partial OpenAI API key used by the team's bots. |

### Examples

#### cURL

```bash
curl --request PUT 'https://docsbot.ai/api/teams/FOX1XkWo8VMx3hp6Zjkb' \
--header 'Authorization: Bearer c0f5c347f0138f76a005921ec723f38185554327f69349dcf220a6f6531ab673' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "Bilbo Baggins Team",
    "openAIKey": "sk-WxxxxxxxxxxxxxxxxxxxiRpT"
}'
```

#### JavaScript (Fetch)

```js
var myHeaders = new Headers();
myHeaders.append("Authorization", "Bearer c0f5c347f0138f76a005921ec723f38185554327f69349dcf220a6f6531ab673");
myHeaders.append("Content-Type", "application/json");

var raw = JSON.stringify({
  "name": "Bilbo Baggins Team",
  "openAIKey": "sk-WxxxxxxxxxxxxxxxxxxxiRpT"
});

var requestOptions = {
  method: 'PUT',
  headers: myHeaders,
  body: raw,
  redirect: 'follow'
};

fetch("https://docsbot.ai/api/teams/FOX1XkWo8VMx3hp6Zjkb", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));
```

### Response

Response is the new JSON team object:

```json
{
    "id": "FOX1XkWo8VMx3hp6Zjkb",
    "roles": {
        "L0TIShBCuYM3iOP25MgiSdZFYtZ2": "owner"
    },
    "name": "Bilbo Baggins Team",
    "createdAt": "2023-03-14T14:18:54.869Z",
    "status": "ready",
    "questionCount": 10,
    "pageCount": 0,
    "sourceCount": 0,
    "chunkCount": 0,
    "openAIKey": "sk-W...iRpT",
    "botCount": 1,
    "plan": {
        "name": "Free",
        "bots": 1,
        "sources": 3,
        "pages": 50,
        "questions": 100
    }
}
```