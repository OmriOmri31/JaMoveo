const puppeteer = require('puppeteer');

function isHebrew(url) {
    try {
        const decodedUrl = decodeURIComponent(url);
        return /[\u0590-\u05FF]/.test(decodedUrl);
    } catch (error) {
        return false;
    }
}

async function extractChordsEnglish(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const el = await page.waitForSelector('::-p-xpath(/html/body/div/div[3]/main/div[3]/article[1]/section[2]/article/div/section)');
    const src = await el.getProperty('innerText');
    const chordsText = await src.jsonValue();
    await browser.close();
    return chordsText;
}

async function extractChordsHebrew(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const el = await page.waitForSelector('::-p-xpath(//*[@id="songContentTPL"])');
    const src = await el.getProperty('innerText');
    const chordsText = await src.jsonValue();
    await browser.close();
    return chordsText;
}

async function extractChords(url) {
    if (isHebrew(url)) {
        return extractChordsHebrew(url);
    } else {
        return extractChordsEnglish(url);
    }
}

async function extractLyrics(songWithChords) {
    const chordRegex = /^(?:(?:[A-G](?:[#b])?(?:(?:maj|min|m|sus|dim|aug|add))?(?:\d+(?:[b#]\d+)?)*(?:[xX]\d+)?(?:\/[A-G](?:[#b])?(?:(?:maj|min|m|sus|dim|aug|add))?(?:\d+(?:[b#]\d+)?)*(?:[xX]\d+)?){0,1})|(?:[xX]\d+))$/;
    const lines = songWithChords.split('\n');
    const filteredLines = lines.filter(line => {
        const trimmedLine = line.trim();
        if (trimmedLine === "") {
            return true;
        }
        const words = trimmedLine.split(/\s+/);
        const isChordLine = words.every(word => chordRegex.test(word));
        return !isChordLine;
    });
    return filteredLines.join('\n');
}

module.exports = { extractChords, extractLyrics };
