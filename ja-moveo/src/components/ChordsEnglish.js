const puppeteer = require('puppeteer');

async function extractChords(url){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const el = await page.waitForSelector('::-p-xpath(/html/body/div/div[3]/main/div[3]/article[1]/section[2]/article/div/section)');
    const src = await el.getProperty('innerText');
    await browser.close();
    return src.jsonValue();

}

async function extractLyrics(songWithChords) {
    // Regex to match a chord (e.g., "C", "G/B", "Am", "F#m7", etc.)
    const chordRegex = /^[A-G](?:[#b])?(?:(?:maj|min|m|sus|dim|aug|add)?\d*)?(?:\/[A-G](?:[#b])?(?:(?:maj|min|m|sus|dim|aug|add)?\d*)?)?$/;

    // Split the song text into individual lines.
    const lines = songWithChords.split('\n');

    // Filter out lines that are exclusively chords.
    const filteredLines = lines.filter(line => {
        const trimmedLine = line.trim();
        if (trimmedLine === "") {
            // Keep blank lines to preserve stanza formatting.
            return true;
        }
        // Split the line into words based on whitespace.
        const words = trimmedLine.split(/\s+/);
        // If every word in the line matches the chord regex, exclude the line.
        const isChordLine = words.every(word => chordRegex.test(word));
        return !isChordLine;
    });

    // Reassemble the remaining lines into a single string.
    return filteredLines.join('\n');
}
//example with Love Yourself by Justin Bieber:
/*extractChords('https://tabs.ultimate-guitar.com/tab/justin-bieber/love-yourself-chords-1780199')
    .then(chordsText => {
        return extractLyrics(chordsText);
    })
    .then(lyrics => {
        console.log(lyrics);
    })
    .catch(err => console.error(err));*/