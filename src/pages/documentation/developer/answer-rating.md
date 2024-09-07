---
title: Answer Rating & Escalation APIs
description: The answer rating and support escalation APIs are used to mark answers from the chat APIs.
---

The answer rating and support escalation APIs are used to record statistics for the answers from the chat APIs. These are the endpoints you should use if you want to allow your users to rate answers, or to record statistics on support escalations.

---

## Answer Rating

Allows users to rate answers from the chat APIs either positive, negative, or neutral (resetting the rating). This is useful for recording statistics on the answers from the chat APIs that are shown in your chat logs.

### Request

This endpoint accepts a PUT request with the following parameters:

`PUT https://api.docsbot.ai/teams/[teamId]/bots/[botId]/rate/[answerId]`

#### Parameters

| Parameter   | Type    | Description                                                                       |
| ----------- | ------- | --------------------------------------------------------------------------------- |
| **rating**    | integer  | -1, 0, or 1 for rating up, neutral, or down.                               |

### Examples

#### cURL

```bash
curl --request PUT 'https://api.docsbot.ai/teams/ZrbLG98bbxZ9EFqiPvyl/bots/oFFiXuQsakcqyEdpLvCB/rate/O0avZ8ffTiAMRyjNrZpU' \
--header 'Content-Type: application/json' \
--data-raw '{
    "rating": -1
}'
```

### Response

Response is a JSON object with the following properties:

```json
true
```

## Support Escalations

When a user escalates a chat to human support it is best practice to record that using this API call. This is useful for recording statistics on the answers from the chat APIs that are shown in your chat logs.

### Request

This endpoint accepts a PUT request with the following parameters and no body:

`PUT https://api.docsbot.ai/teams/[teamId]/bots/[botId]/support/[answerId]`

### Examples

#### cURL

```bash
curl --request PUT 'https://api.docsbot.ai/teams/ZrbLG98bbxZ9EFqiPvyl/bots/oFFiXuQsakcqyEdpLvCB/support/O0avZ8ffTiAMRyjNrZpU' \
--header 'Content-Type: application/json'
```

### Response

Response is a JSON object with the following properties:

```json
true
```