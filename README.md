# wplace Unofficial Status Page

We've all seen how frequently wplace's infrastructure is going down, and thus, I've decided to make a webpage where you could see it's status without going on the website itself.

## How does it work?

It works by using a headless browser bot, which goes to the https://wplace.live and https://backend.wplace.live

Why headless browser? Cause wplace owners set up an Cloudflare rule, which blocks every non-browser request, and that's respectable, though, as we need to check the server's status - we circumvent the Cloudflare's protection, as to check if it send back some type of response.

Also, for some reason - Cloudflare error pages **don't** return error codes, so if we check only the response codes, then we won't get much, so we also check the page for any mention of "Error". If there is one - we declare that endpoint down.

And if there's no errors - we just return that everything's fine.

## What NodeJS versions does the server.js support?

It supports NodeJS 20.x and 22.x; Due to the node-fetch, it just doesn't work out of box with NodeJS 18.x.

Though, if you **really** need support for NodeJS 18.x, then [there's a branch for it](https://github.com/Iced-Coded/wplace-status/tree/node18). But really, consider upgrading your NodeJS.

## Can I use your work?

Sure, you can, as the license doesn't prohibit so, nor can I.

Also, if you only need to know endpoint's status - you don't need to host your own instance of the bot, as I already provide a [public JSON file](https://alexvolkov.envs.net/wplace/status.json) with all the statuses, which is updated once every 2 minutes.

## Aren't bots prohibited?

**Yes, they are.** Though, I'm not doing anything malicious, nor interacting with the game itself.

## Contributing

If you want to improve the code or add something new - you're free to do so!
