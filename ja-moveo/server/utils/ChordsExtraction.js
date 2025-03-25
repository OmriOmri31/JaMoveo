const puppeteer = require('puppeteer');

let browser;

// Reuse the same browser instance for all extractions
async function getBrowser() {
    console.log('[getBrowser] Checking if browser is already launched...');
    if (!browser) {
        console.log('[getBrowser] Browser not found. Launching a new one...');
        browser = await puppeteer.launch({
            headless: true
        });
        console.log('[getBrowser] Browser launched successfully.');
    } else {
        console.log('[getBrowser] Reusing existing browser instance.');
    }
    return browser;
}

function isHebrew(url) {
    console.log('[isHebrew] Checking if URL contains Hebrew characters...');
    try {
        const decodedUrl = decodeURIComponent(url);
        const hasHebrew = /[\u0590-\u05FF]/.test(decodedUrl);
        console.log(`[isHebrew] Decoded URL: ${decodedUrl} | Hebrew found: ${hasHebrew}`);
        return hasHebrew;
    } catch (error) {
        console.error('[isHebrew] Error decoding URL:', error);
        return false;
    }
}

async function extractChordsEnglish(url) {
    console.log('[extractChordsEnglish] Called with URL:', url);

    const browser = await getBrowser();
    const page = await browser.newPage();
    console.log('[extractChordsEnglish] New page created. Setting request interception...');

    await page.setRequestInterception(true);
    page.on('request', (req) => {
        const resourceType = req.resourceType();
        // Debug each request before deciding what to do
        console.log('[extractChordsEnglish][Request Interception] Resource type:', resourceType, 'URL:', req.url());
        if (['image', 'stylesheet', 'font'].includes(resourceType)) {
            console.log('[extractChordsEnglish][Request Interception] Aborting resource:', resourceType);
            req.abort();
        } else {
            req.continue();
        }
    });

    console.log('[extractChordsEnglish] Navigating to URL...');
    await page.goto(url);
    console.log('[extractChordsEnglish] Page loaded. Waiting for selector...');

    const el = await page.waitForSelector(
        '::-p-xpath(/html/body/div/div[3]/main/div[3]/article[1]/section[2]/article/div/section)',
        { timeout: 5000 }
    );
    console.log('[extractChordsEnglish] Selector found. Getting element property...');

    const src = await el.getProperty('innerText');
    const chordsText = await src.jsonValue();
    console.log('[extractChordsEnglish] Successfully got chordsText of length:', chordsText.length);

    console.log('[extractChordsEnglish] Closing page...');
    await page.close();
    console.log('[extractChordsEnglish] Page closed. Returning result.');
    return chordsText;
}

async function extractChordsHebrew(url) {
    console.log('[extractChordsHebrew] Called with URL:', url);

    const browser = await getBrowser();
    const page = await browser.newPage();
    console.log('[extractChordsHebrew] New page created. Setting request interception...');

    await page.setRequestInterception(true);
    page.on('request', (req) => {
        const resourceType = req.resourceType();
        // Debug each request before deciding what to do
        console.log('[extractChordsHebrew][Request Interception] Resource type:', resourceType, 'URL:', req.url());
        if (['image', 'stylesheet', 'font'].includes(resourceType)) {
            console.log('[extractChordsHebrew][Request Interception] Aborting resource:', resourceType);
            req.abort();
        } else {
            req.continue();
        }
    });

    console.log('[extractChordsHebrew] Navigating to URL...');
    await page.goto(url);
    console.log('[extractChordsHebrew] Page loaded. Waiting for selector...');

    const el = await page.waitForSelector(
        '::-p-xpath(//*[@id="songContentTPL"])',
        { timeout: 5000 }
    );
    console.log('[extractChordsHebrew] Selector found. Getting element property...');

    const src = await el.getProperty('innerText');
    const chordsText = await src.jsonValue();
    console.log('[extractChordsHebrew] Successfully got chordsText of length:', chordsText.length);

    console.log('[extractChordsHebrew] Closing page...');
    await page.close();
    console.log('[extractChordsHebrew] Page closed. Returning result.');
    return chordsText;
}

async function extractChords(url) {
    console.log('[extractChords] Checking if URL is Hebrew or English...');
    if (isHebrew(url)) {
        console.log('[extractChords] URL is Hebrew. Using extractChordsHebrew.');
        return extractChordsHebrew(url);
    } else {
        console.log('[extractChords] URL is English. Using extractChordsEnglish.');
        return extractChordsEnglish(url);
    }
}

async function extractLyrics(songWithChords) {
    console.log('[extractLyrics] Called. Splitting and filtering chords/lyrics...');
    const chordRegex = new RegExp(
        "^(?:(?:N\\.C|n\\.c|[xX]\\d+|[A-G](?:#|b)?(?:(?:maj(?:7|9|11|13)?)|(?:m(?:in)?(?:7|9|11|13)?)|(?:dim(?:7)?)|(?:aug(?:7)?|\\+)|(?:sus(?:2|4)?)|(?:add(?:9|11|13))|(?:6|7|9|11|13)|(?:[b#](?:5|9|11|13))|(?:\\([#b]?\\d+\\)))*)(?:/(?:N\\.C|n\\.c|[xX]\\d+|[A-G](?:#|b)?(?:(?:maj(?:7|9|11|13)?)|(?:m(?:in)?(?:7|9|11|13)?)|(?:dim(?:7)?)|(?:aug(?:7)?|\\+)|(?:sus(?:2|4)?)|(?:add(?:9|11|13))|(?:6|7|9|11|13)|(?:[b#](?:5|9|11|13))|(?:\\([#b]?\\d+\\)))*))?)$"
    );

    const lines = songWithChords.split('\n');
    const filteredLines = lines.filter(line => {
        const trimmed = line.trim();
        if (trimmed === "") {
            // Debug: empty line
            console.log('[extractLyrics] Keeping empty line.');
            return true;
        }

        const words = trimmed.split(/\s+/);
        if (words.some(word => chordRegex.test(word))) {
            console.log('[extractLyrics] Found chord in line, removing:', trimmed);
            return false;
        }

        const tabChars = trimmed.match(/[0-9\-|]/g) || [];
        if (tabChars.length >= 5) {
            console.log('[extractLyrics] Found tab-like line, removing:', trimmed);
            return false;
        }

        // Otherwise keep the line
        return true;
    });

    const result = filteredLines.join('\n');
    console.log('[extractLyrics] Filtered lyrics completed. Total lines:', filteredLines.length);
    return result;
}

module.exports = { extractChords, extractLyrics };
