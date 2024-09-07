---
title: Intercom AI Chat Widget Integration
description: Learn how to embed and integrate our AI chat widget with Intercom.
---

Learn how to embed and integrate our AI chat widget with Intercom. {% .lead %}

---

## Overview

[Intercom](https://intercom.com) is a popular support software used by many businesses to provide a support widget in their website. But with DocsBot you can first display our widget to privide an AI frontline support agent that can answer the most common questions about your product or service in any language! If the user still needs help, they can click the support link in the widget to open your Intercom Messenger to talk to a human.

## Intercom Messenger Integration

If your business uses [Intercom](https://intercom.com) Messenger for support tickets or live chat, here's an example of how you could use the `supportCallback` argument to open the Messenger if the user clicks the get support link in the DocsBot Widget.

Your existing Messenger embed code may look something like this:

```html
<script>
//Set your APP_ID
var APP_ID = "APP_ID";

window.intercomSettings = {
  app_id: APP_ID
};
</script>
<script>(function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');...</script>
```

To keep your Widget from showing by default, remove the following code from the embed:

```js
window.intercomSettings = {
  app_id: APP_ID
};
```

Then you'll need to add the DocsBot widget embed code to your website. You can find the embed code by clicking the "Widget Embed" link on your bot. You can find more information about the widget embed code [here](/documentation/developer/embeddable-chat-widget).

Finally adjust the DocsBoc initialization code to open the Intercom Messenger when the user clicks the support link in the DocsBot widget:

```js
<script type="text/javascript">
DocsBotAI.init({
  id: "YOUR_ID_HERE",
  supportCallback: function (event, history) {
    event.preventDefault(); // Prevent default behavior opening the url.
    DocsBotAI.unmount(); // Hide the widget.
    // Open the Intercom Messenger.
    window.Intercom('boot', {
      app_id: APP_ID,
    });
  },
})
</script>
```

{% callout type="warning" title="Make sure to add a support url!" %}
For any of these integrations to work you must add a support url to your bot settings so that it will show the support link in the widget. If you don't want to use the support link, you can simply add a `#` to the url field.
{% /callout %}

That's it! Now when the user clicks the support link in the DocsBot widget, the Intercom Messenger will open so they can start a live chat or ticket with a human support agent.

If you need additional help getting started integrating with Intercom, feel free to contact our team!