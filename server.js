const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const STATUS_FILE = 'status.json';
const CHECK_INTERVAL = 2 * 60 * 1000; // 2 minutes

async function checkService(url) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    const start = Date.now();

    try {
        const res = await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
        const latency = Date.now() - start;

        const bodyText = await page.evaluate(() => document.body.innerText);

        let status = 'up';
        let errorMsg = null;

        if (!res || res.status() < 200 || res.status() >= 400) {
            status = 'down';
            errorMsg = res ? `HTTP ${res.status()}` : 'No response';
        }

        if (/Error\s+\d+/i.test(bodyText.trim())) {
            status = 'down';
            const match = bodyText.match(/Error\s+\d+/i);
            if (match) errorMsg = match[0];
        }

        await browser.close();
        return { status, latency_ms: latency, error: errorMsg };

    } catch (e) {
        await browser.close();
        return { status: 'down', latency_ms: null, error: e.message };
    }
}

async function checkAll() {
    console.log('Checking services...');
    const frontend = await checkService('https://wplace.live');
    const backend = await checkService('https://backend.wplace.live');

    const result = {
        last_checked: new Date().toISOString(),
        services: { frontend, backend }
    };

    fs.writeFileSync(STATUS_FILE, JSON.stringify(result, null, 2));
    console.log('Status updated at', result.last_checked);
}

async function main() {
    while (true) {
        try {
            await checkAll();
        } catch (e) {
            console.error('Error during check:', e);
        }
        await new Promise(r => setTimeout(r, CHECK_INTERVAL));
    }
}

main();

