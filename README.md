# wplace Unofficial Status Page

We've all seen how frequently wplace's infrastructure is going down, and thus, I've decided to make a webpage where you could see it's status without going on the website itself.

## How does it work?

It works by using a headless browser bot, which goes to the https://wplace.live and https://backend.wplace.live

Why headless browser? Cause wplace owners set up an Cloudflare rule, which blocks every non-browser request, and that's respectable, though, as we need to check the server's status - we circumvent the Cloudflare's protection, as to check if it send back some type of response.

Also, for some reason - Cloudflare error pages **don't** return error codes, so if we check only the response codes, then we won't get much, so we also check the page for any mention of "Error". If there is one - we declare that endpoint down.

And if there's no errors - we just return that everything's fine.

## Aren't bots prohibited?

**Yes, they are.** Though, I'm not doing anything malicious, nor interacting with the game itself.

## Contributing

If you want to improve the code or add something new - you're free to do so!