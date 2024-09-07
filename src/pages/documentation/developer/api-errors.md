---
title: API Errors
description: Learn about the errors you might encounter when using our APIs.
---

Learn about the errors you might encounter when using our APIs. {% .lead %}

---

## Introduction

When you use our APIs, you might encounter errors. This page describes the errors you might encounter and how to handle them.

## Error codes

We use standard HTTP status codes to indicate the success or failure of an API request. In general: Codes in the `2xx` range indicate success. Codes in the `4xx` range indicate an error that failed given the information provided (e.g., a required parameter was omitted, a charge failed, etc.). Codes in the `5xx` range indicate an error with our servers (these are rare).

## Example error response

HTTP 400 Bad Request

```json
{
    "message": "Invalid param \"privacy\"."
}
```