const puppeteer = require("puppeteer");

async function getSongResults(songName) {
    // Decide on browser options based on the language
    let browserOptions = {};
    if (/[\u0590-\u05FF]/.test(songName)) {
        // Hebrew: regular headless mode is fine
        browserOptions = {
            headless: true,
            args: ['--disable-blink-features=AutomationControlled','--no-sandbox', '--disable-setuid-sandbox']
        };

    } else {
        // English: run headless but mimic headful behavior
        browserOptions = {
            headless: true,
            args: [
                '--disable-blink-features=AutomationControlled',
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        };
    }

    const browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();

    // Use stealth modifications to avoid detection
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });
    // Set a typical desktop user agent and viewport
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });

    let jsonResults;
    if (/[\u0590-\u05FF]/.test(songName)) {
        await page.goto(`https://www.tab4u.com/resultsSimple?tab=songs&q=${encodeURIComponent(songName)}`);
        await page.waitForSelector('::-p-xpath(//*[@id="resultsPage"]/div[2]/table)');
        jsonResults = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll("table tr"));
            return rows.map(row => {
                const a = row.querySelector("a.ruSongLink");
                if (!a) return null;
                const imageStyle = a.querySelector("span.ruArtPhoto")?.getAttribute("style");
                const imageMatch = imageStyle && imageStyle.match(/url\((.*?)\)/);
                const image = imageMatch ? imageMatch[1].replace(/['"]/g, "") : null;
                const songName = row.querySelector("div.sNameI19")?.innerText.slice(0,-1).trimEnd(); // removes unnecessary '/' and white spaces in the end of the name
                const artist = row.querySelector("div.aNameI19")?.innerText.trim();
                const href = "https://tab4u.com/" + a.getAttribute("href");
                return { image, songName, artist, href };
            }).filter(item => item !== null);
        });
    } else {
        // English branch from ultimate-guitar.com
        const url = `https://www.ultimate-guitar.com/search.php?title=${encodeURIComponent(songName)}&type=300&rating%5B0%5D=4&rating%5B1%5D=5&page=1&order=myweight`;
        await page.goto(url, { waitUntil: 'networkidle0' });

        jsonResults = await page.evaluate(() => {
            const results = [];
            // Filter only <a> elements whose outer HTML starts with "<a tabindex"
            const links = Array.from(document.querySelectorAll("a"))
                .filter(a => a.outerHTML.trim().startsWith("<a tabindex"));
            links.forEach(a => {
                const href = a.getAttribute("href");
                // Skip if href is missing or shorter than 5 characters
                if (!href || href.length < 5) return;

                // Extract the artist using regex matching "tab/artistName/"
                let artist = "";
                const artistMatch = href.match(/tab\/([^\/]+)/);// eslint-disable-line

                if (artistMatch) {
                    artist = artistMatch[1]
                        .split('-')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                }

                // Extract the song name from the href by capturing the text between the artist part and "-chords"
                let songName = "";// eslint-disable-line

                const songMatch = href.match(/\/tab\/[^\/]+\/(.*?)-chords/);// eslint-disable-line

                if (songMatch) {
                    songName = songMatch[1]
                        .split('-')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                }

                results.push({ artist, songName, href });
            });
            return results;
        });
    }

    await browser.close();
    // Save results locally as a JSON file
    return jsonResults;
}

module.exports = { getSongResults };
