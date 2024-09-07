---
title: Admin API Overview
description: Use the admin API to perform any action you find in our dashboard programatically.
---

Use the admin API to perform any action you find in our dashboard programatically. {% .lead %}

---

## Introduction

If you want to create and edit bots and their sources programmatically, you can use our admin API for that. All admin API requests must be authenticated with a valid API key. You can read more about API authentication in the [Authentication](/documentation/developer/authentication) section.

## Teams

The admin API is organized around teams. When you signup for DocsBot it creates a team and then you can create bots and sources for that team.

Read more about the [Teams API](/documentation/developer/team-api) endpoints.

## Bots

You can create bots for your team. Each bot has a name and a description and various settings. You can create as many bots as you want for your team depending on the team plan, and you can also delete bots.

Read more about the [Bots API](/documentation/developer/bot-api) endpoints.

## Sources

You can add sources to train your bots. This could be a url, a document file, a sitemap, etc. The source API alows you to programatically add new content to your bots.

Read more about the [Sources API](/documentation/developer/source-api) endpoints.

## Question / Answer History

Once you've deployed your bot to production, you can view the questions and answers that your users are asking. This is a great way to see how your bot is performing and to see what questions your users are asking. You can also use this data to improve your bot.

Read more about the [Questions API](/documentation/developer/questions-api) endpoint.