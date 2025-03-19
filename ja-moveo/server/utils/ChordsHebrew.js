const puppeteer = require('puppeteer');

async function extractChords(url){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const el = await page.waitForSelector('::-p-xpath(//*[@id="songContentTPL"])');
    const src = await el.getProperty('innerText');
    await browser.close();
    return src.jsonValue();

}

async function extractLyrics(songWithChords) {
    // Regex to match a chord (e.g., "C", "G/B", "Am", "F#m7", etc.)
    const chordRegex = /^(?:(?:[A-G](?:[#b])?(?:(?:maj|min|m|sus|dim|aug|add))?(?:\d+(?:[b#]\d+)?)*(?:[xX]\d+)?(?:\/[A-G](?:[#b])?(?:(?:maj|min|m|sus|dim|aug|add))?(?:\d+(?:[b#]\d+)?)*(?:[xX]\d+)?){0,1})|(?:[xX]\d+))$/;    // Split the song text into individual lines.
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
/*
//example with אני לא מפסיק להתרגש ממך של דני רובס:
//Both chords and lyrics:
extractChords('https://www.tab4u.com/tabs/songs/5063_%D7%93%D7%A0%D7%99_%D7%A8%D7%95%D7%91%D7%A1_-_%D7%90%D7%A0%D7%99_%D7%9C%D7%90_%D7%9E%D7%A4%D7%A1%D7%99%D7%A7_%D7%9C%D7%94%D7%AA%D7%A8%D7%92%D7%A9.html')
    .then(chordsText => {
        console.log(chordsText)
    })
    .catch(err => console.error(err));


//Only Lyrics
extractChords('https://www.tab4u.com/tabs/songs/5063_%D7%93%D7%A0%D7%99_%D7%A8%D7%95%D7%91%D7%A1_-_%D7%90%D7%A0%D7%99_%D7%9C%D7%90_%D7%9E%D7%A4%D7%A1%D7%99%D7%A7_%D7%9C%D7%94%D7%AA%D7%A8%D7%92%D7%A9.html')
    .then(chordsText => {
        return extractLyrics(chordsText);
    })
    .then(lyrics => {
        console.log(lyrics);
    })
    .catch(err => console.error(err));*/