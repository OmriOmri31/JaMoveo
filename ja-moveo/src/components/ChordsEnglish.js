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
    //Regex breakdown at EOF
    const chordRegex = /^(?:(?:[A-G](?:[#b])?(?:(?:maj|min|m|sus|dim|aug|add))?(?:\d+(?:[b#]\d+)?)*(?:[xX]\d+)?(?:\/[A-G](?:[#b])?(?:(?:maj|min|m|sus|dim|aug|add))?(?:\d+(?:[b#]\d+)?)*(?:[xX]\d+)?){0,1})|(?:[xX]\d+))$/;    // Split the song text into individual lines.

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
//Both chords and lyrics:
/*
extractChords('https://tabs.ultimate-guitar.com/tab/justin-bieber/love-yourself-chords-1780199')
    .then(chordsText => {
        console.log(chordsText)
    })
    .catch(err => console.error(err));


//Only Lyrics
extractChords('https://tabs.ultimate-guitar.com/tab/justin-bieber/love-yourself-chords-1780199')
    .then(chordsText => {
        return extractLyrics(chordsText);
    })
    .then(lyrics => {
        console.log(lyrics);
    })
    .catch(err => console.error(err));*/

// Regex explanation:
// ^                             : Start of string.
// (?:
//   (?:                         : Begin chord pattern.
//     [A-G]                    // Base note (A to G).
//     (?:[#b])?                // Optional accidental: '#' or 'b'.
//     (?:(?:maj|min|m|sus|dim|aug|add))?
//                               // Optional chord quality.
//     (?:\d+(?:[b#]\d+)?)*      // Zero or more chord extensions (e.g., "7" or "7b5").
//     (?:[xX]\d+)?             // Optional multiplier (e.g., "x2" or "X3").
//     (?:                      // Begin optional slash chord:
//       \/                     // Slash separator.
//       [A-G]                  // Base note for the slash chord.
//       (?:[#b])?              // Optional accidental for the slash chord.
//       (?:(?:maj|min|m|sus|dim|aug|add))?
//                              // Optional chord quality for the slash chord.
//       (?:\d+(?:[b#]\d+)?)*    // Zero or more chord extensions for the slash chord.
//       (?:[xX]\d+)?           // Optional multiplier for the slash chord.
//     ){0,1}                   // End optional slash chord (occurs 0 or 1 time).
//   )                           // End chord pattern.
//   |                           // OR
//   (?:[xX]\d+)                // Standalone multiplier (e.g., "x2" or "X2").
// )                             // End non-capturing group for the alternatives.
// $                             : End of string.
///^(?:(?:[A-G](?:[#b])?(?:(?:maj|min|m|sus|dim|aug|add))?(?:\d+(?:[b#]\d+)?)*(?:[xX]\d+)?(?:\/[A-G](?:[#b])?(?:(?:maj|min|m|sus|dim|aug|add))?(?:\d+(?:[b#]\d+)?)*(?:[xX]\d+)?){0,1})|(?:[xX]\d+))$/