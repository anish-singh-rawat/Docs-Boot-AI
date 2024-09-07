---
title: Zendesk AI Chat Widget Integration
description: Learn how to embed and integrate our AI chat widget with Zendesk.
---

Learn how to embed and integrate our AI chat widget with Zendesk. {% .lead %}

---

## Overview

[Zendesk](https://zendesk.com) is a popular support software used by many businesses to provide a support widget in their website. But with DocsBot you can first display our widget to privide an AI frontline support agent that can answer the most common questions about your product or service in any language! If the user still needs help, they can click the support link in the widget to open your Zendesk Web Widget to talk to a human.

## Zendesk Web Widget (classic) Integration

If your business uses [Zendesk](https://zendesk.com) Web Widget (classic) for support tickets or live chat, here's an example of how you could use the `supportCallback` argument to open the Web Widget if the user clicks the get support link in the DocsBot Widget.

Your existing Web Widget embed code may look something like this:

```html
<!-- Start of Zendesk Widget script -->
<script id="ze-snippet" src="https://static.zdassets.com/ekr/snippet.js?key=YOUR_SNIPPET_KEY"></script>
<!-- End of Zendesk Widget script -->
```

To keep your Widget from showing by default, add the following code to your website:

```html
<script type="text/javascript">
  zE(function() {
    zE.hide();
  });
</script>
```

Then you'll need to add the DocsBot widget embed code to your website. You can find the embed code by clicking the "Widget Embed" link on your bot. You can find more information about the widget embed code [here](/documentation/developer/embeddable-chat-widget).

Finally adjust the DocsBoc initialization code to open the Zendesk Web Widget when the user clicks the support link in the DocsBot widget:

```js
<script type="text/javascript">
DocsBotAI.init({
    id: "YOUR_ID_HERE",
    supportCallback: function (event, history) {
        event.preventDefault(); // Prevent default behavior opening the url.
        DocsBotAI.unmount(); // Hide the widget.
        // Open the Zendesk Web Widget (classic).
        zE.activate()
    },
})
</script>
```

## Zendesk Web Widget (messaging) Integration

If your business uses the newer [Zendesk](https://zendesk.com) Web Widget (messaging) for support tickets or live chat, here's an example of how you could use the `supportCallback` argument to open the Web Widget if the user clicks the get support link in the DocsBot Widget.

Your existing Web Widget embed code may look something like this:

```html
<!-- Start of Zendesk Widget script -->
<script id="ze-snippet" src="https://static.zdassets.com/ekr/snippet.js?key=YOUR_SNIPPET_KEY"></script>
<!-- End of Zendesk Widget script -->
```

To keep your Widget from showing by default, add the following code to your website:

```html
<script type="text/javascript">
// on page load always close widget
zE('messenger', 'close');
</script>
```

Then you'll need to add the DocsBot widget embed code to your website. You can find the embed code by clicking the "Widget Embed" link on your bot. You can find more information about the widget embed code [here](/documentation/developer/embeddable-chat-widget).

Finally adjust the DocsBoc initialization code to open the Zendesk Web Widget when the user clicks the support link in the DocsBot widget:

```js
<script type="text/javascript">
DocsBotAI.init({
    id: "YOUR_ID_HERE",
    supportCallback: function (event, history) {
        event.preventDefault(); // Prevent default behavior opening the url.
        DocsBotAI.unmount(); // Hide the widget.
        // Open the Zendesk Web Widget.
        zE('messenger', 'open');
    },
})
</script>
```

{% callout type="warning" title="Make sure to add a support url!" %}
For any of these integrations to work you must add a support url to your bot settings so that it will show the support link in the widget. If you don't want to use the support link, you can simply add a `#` to the url field.
{% /callout %}

That's it! Now when the user clicks the support link in the DocsBot widget, the Zendesk Web Widget will open so they can start a live chat or ticket with a human support agent.

If you need additional help getting started integrating with Zendesk, feel free to contact our team!