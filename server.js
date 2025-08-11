const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fetch = require('node-fetch').default;

puppeteer.use(StealthPlugin());

const STATUS_FILE = 'status.json';
const CHECK_INTERVAL = 2 * 60 * 1000; // 2 minutes

async function checkFileService(url) {
    const start = Date.now();
    try {
        const res = await fetch(url, { timeout: 15000 });
        const latency = Date.now() - start;

        if (!res.ok) {
            return { status: 'down', latency_ms: latency, error: `HTTP ${res.status}`};
        }

        return { status: 'up', latency_ms: latency, error: null };
    } catch (e) {
        return { status: 'down', latency_ms: null, error: e.message };
    }
}

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

    const maps = await checkFileService('https://maps.wplace.live/planet/20250806_001001_pt/14/9784/5655.pbf');
    const tiles = await checkFileService('https://backend.wplace.live/files/s0/tiles/1223/707.png');

    const result = {
        last_checked: new Date().toISOString(),
        services: { frontend, backend, maps, tiles }
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

