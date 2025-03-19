const puppeteer = require("puppeteer");
const fs = require("fs");

async function getSongResults(songName) {
    // Decide on browser options based on the language
    let browserOptions = {};
    if (/[\u0590-\u05FF]/.test(songName)) {
        // Hebrew: regular headless mode is fine
        browserOptions = { headless: true };
    } else {
        // English: run headless but mimic headful behavior
        browserOptions = {
            headless: true,  // keep headless but with stealth settings
            args: ['--disable-blink-features=AutomationControlled']
        };
    }

    const browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();

    // Use stealth modifications to avoid detection
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });
    // Set a typical desktop user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36');
    // Set a common viewport size
    await page.setViewport({ width: 1280, height: 800 });

    let jsonResults;
    if (/[\u0590-\u05FF]/.test(songName)) {
        // Hebrew branch from tab4u.com remains unchanged.
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
                const songName = row.querySelector("div.sNameI19")?.innerText.trim();
                const artist = row.querySelector("div.aNameI19")?.innerText.trim();
                const href = a.getAttribute("href");
                return { image, songName, artist, href };
            }).filter(item => item !== null);
        });
    } else {
        // English branch from ultimate-guitar.com
        const url = `https://www.ultimate-guitar.com/search.php?title=${encodeURIComponent(songName)}&type=300&rating%5B0%5D=4&rating%5B1%5D=5&page=1&order=myweight`;
        // Wait until the network is idle to ensure all elements have loaded
        await page.goto(url, { waitUntil: 'networkidle0' });
        // Optionally, wait for a specific element that signals the page is fully rendered:
        // await page.waitForSelector("a.WfRYb.OtmaM.YD9Tl");

        jsonResults = await page.evaluate(() => {
            const results = [];
            // Filter only <a> elements that start with "<a tabindex"
            const links = Array.from(document.querySelectorAll("a"))
                .filter(a => a.outerHTML.trim().startsWith("<a tabindex"));
            links.forEach(a => {
                const href = a.getAttribute("href");
                // Extract artist from the href by matching the pattern "tab/artistName/"
                let artist = "";
                const match = href.match(/tab\/([^\/]+)/);
                if (match) {
                    artist = match[1];
                }
                // Build the song name by concatenating all <b> tag texts
                const songName = Array.from(a.querySelectorAll("b"))
                    .map(b => b.innerText.trim())
                    .join(" ");
                const tabindex = a.getAttribute("tabindex");
                results.push({ artist, songName, tabindex, href });
            });
            return results;
        });
    }

    await browser.close();
    // Save results locally as a JSON file
    fs.writeFileSync("results.json", JSON.stringify(jsonResults, null, 2));
    return jsonResults;
}

module.exports = { getSongResults };
