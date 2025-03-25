const puppeteer = require('puppeteer');

let browser;

// Reuse the same browser instance for all extractions
async function getBrowser() {
    if (!browser) {
        browser = await puppeteer.launch({
            headless: true
        });
    }
    return browser;
}

function isHebrew(url) {
    try {
        const decodedUrl = decodeURIComponent(url);
        return /[\u0590-\u05FF]/.test(decodedUrl);
    } catch (error) {
        return false;
    }
}

async function extractChordsEnglish(url) {
    const browser = await getBrowser();
    const page = await browser.newPage();

    // Disable unneeded resources to speed up loading
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['image', 'stylesheet', 'font'].includes(resourceType)) {
            req.abort();
        } else {
            req.continue();
        }
    });

    await page.goto(url);

    // Use waitForSelector with a short timeout (adjust as needed)
    const el = await page.waitForSelector(
        '::-p-xpath(/html/body/div/div[3]/main/div[3]/article[1]/section[2]/article/div/section)',
        { timeout: 5000 }
    );

    const src = await el.getProperty('innerText');
    const chordsText = await src.jsonValue();

    // Close the page to free resources, but keep browser alive
    await page.close();
    return chordsText;
}

async function extractChordsHebrew(url) {
    const browser = await getBrowser();
    const page = await browser.newPage();

    // Disable unneeded resources to speed up loading
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['image', 'stylesheet', 'font'].includes(resourceType)) {
            req.abort();
        } else {
            req.continue();
        }
    });

    await page.goto(url);

    // Use waitForSelector with a short timeout (adjust as needed)
    const el = await page.waitForSelector(
        '::-p-xpath(//*[@id="songContentTPL"])',
        { timeout: 5000 }
    );

    const src = await el.getProperty('innerText');
    const chordsText = await src.jsonValue();

    // Close the page to free resources, but keep browser alive
    await page.close();
    return chordsText;
}

async function extractChords(url) {
    if (isHebrew(url)) {
        return extractChordsHebrew(url);
    } else {
        return extractChordsEnglish(url);
    }
}

// This function filters out chords from the song text, leaving just lyrics
async function extractLyrics(songWithChords) {
    const chordRegex = new RegExp(
        "^(?:(?:N\\.C|n\\.c|[xX]\\d+|[A-G](?:#|b)?(?:(?:maj(?:7|9|11|13)?)|(?:m(?:in)?(?:7|9|11|13)?)|(?:dim(?:7)?)|(?:aug(?:7)?|\\+)|(?:sus(?:2|4)?)|(?:add(?:9|11|13))|(?:6|7|9|11|13)|(?:[b#](?:5|9|11|13))|(?:\\([#b]?\\d+\\)))*)(?:/(?:N\\.C|n\\.c|[xX]\\d+|[A-G](?:#|b)?(?:(?:maj(?:7|9|11|13)?)|(?:m(?:in)?(?:7|9|11|13)?)|(?:dim(?:7)?)|(?:aug(?:7)?|\\+)|(?:sus(?:2|4)?)|(?:add(?:9|11|13))|(?:6|7|9|11|13)|(?:[b#](?:5|9|11|13))|(?:\\([#b]?\\d+\\)))*))?)$"
    );

    const lines = songWithChords.split('\n');
    const filteredLines = lines.filter(line => {
        const trimmed = line.trim();
        // Keep empty lines
        if (trimmed === "") {
            return true;
        }

        // If any "word" in the line is a chord, remove the line
        const words = trimmed.split(/\s+/);
        if (words.some(word => chordRegex.test(word))) {
            return false;
        }

        // If the line contains >= 5 tab-related characters (-, digits, or |), remove it
        const tabChars = trimmed.match(/[0-9\-|]/g) || [];
        if (tabChars.length >= 5) {
            return false;
        }

        // Otherwise keep the line
        return true;
    });

    return filteredLines.join('\n');
}

module.exports = { extractChords, extractLyrics };
