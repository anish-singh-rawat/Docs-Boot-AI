---
title: Freshdesk AI Chat Widget Integration
description: Learn how to embed and integrate our AI chat widget with Freshdesk.
---

Learn how to embed and integrate our AI chat widget with Freshdesk. {% .lead %}

---

## Overview

[Freshworks' Freshdesk](https://affiliatepartner.freshdesk.com/docsbot) is a widely used support desk software that businesses may embed via a support widget on their websites. With DocsBot you can add an AI frontline support agent via our widget. This agent can answer common questions about your product or service in any language. Then if users require further assistance, they can simply click the support link within the widget to access your [Freshdesk Help Widget](https://affiliatepartner.freshdesk.com/docsbot-widget) contact form and connect with a human representative.

## Freshdesk Help Widget Integration

If your business uses the [Freshdesk Help Widget](https://affiliatepartner.freshdesk.com/docsbot-widget) for support tickets or live chat, here's an example of how you could use the `supportCallback` argument to open the Web Widget if the user clicks the get support link in the DocsBot Widget.

Your existing Web Widget embed code may look something like this:

```html
<script>
  window.fwSettings={
    'widget_id':12000000025,
    'locale': 'en'
  };
  !function(){if("function"!=typeof window.FreshworksWidget){var n=function(){n.q.push(arguments)};n.q=[],window.FreshworksWidget=n}}()
</script>
<script type='text/javascript' src='https://widget.freshworks.com/widgets/12000000025.js' async defer />
```

To keep your Widget from showing by default, add the following code to your website after the Freshdesk embed code:

```html
<script type="text/javascript">
  FreshworksWidget('hide', 'launcher');
</script>
```

Then you'll need to add the DocsBot widget embed code to your website. You can find the embed code by clicking the "Widget Embed" link on your bot. You can find more information about the widget embed code [here](/documentation/developer/embeddable-chat-widget).

Finally adjust the DocsBoc initialization code to open the Freshdesk Web Widget when the user clicks the support link in the DocsBot widget:

```js
<script type="text/javascript">
DocsBotAI.init({
    id: "YOUR_ID_HERE",
    supportCallback: function (event, history) {
        event.preventDefault(); // Prevent default behavior opening the url.
        DocsBotAI.unmount(); // Hide the widget.
        // Open the Freshdesk widget form https://developers.freshdesk.com/widget-api/#open-contact-form
        FreshworksWidget('open', 'ticketForm');
    },
})
</script>
```

### Prefilling the Contact Form with Chat History

If you want to prefill the contact form with the chat history as a conversation, you can use the `history` argument to pass the chat history to the Freshdesk widget. Here's an example of how you could do that:

```js
<script type="text/javascript">
DocsBotAI.init({
    id: "YOUR_ID_HERE",
    supportCallback: function (event, history) {
        event.preventDefault(); // Prevent default behavior opening the url.
        DocsBotAI.unmount(); // Hide the widget.
        // Open the Freshdesk widget form https://developers.freshdesk.com/widget-api/#prefill-fields
        FreshworksWidget('prefill', 'ticketForm', {
          subject: history[0][0], // Use the first user message as the subject.
          description: history.map((item) => 'User: ' + item[0] + '\nBot: ' + item[1]).join('\n'), // Join all messages into one conversation string.
        });
    },
})
</script>
```

{% callout type="warning" title="Make sure to add a support url!" %}
For any of these integrations to work you must add a support url to your bot settings so that it will show the support link in the widget. If you don't want to use the support link, you can simply add a `#` to the url field.
{% /callout %}

That's it! Now when the user clicks the support link in the DocsBot widget, the Freshdesk Help Widget will open in the contact from so they can start a ticket with a human support agent.

If you need additional help getting started integrating with Freshdesk, feel free to contact our team!