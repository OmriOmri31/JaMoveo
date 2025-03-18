const puppeteer = require("puppeteer");
const fs = require("fs");

async function getSongResults(songName) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    let jsonResults;
    if (/[\u0590-\u05FF]/.test(songName)) {
        // Hebrew results from tab4u.com
        await page.goto(`https://www.tab4u.com/resultsSimple?tab=songs&q=${encodeURIComponent(songName)}`);
        // Wait for the table to load
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
        // English results from ultimate-guitar.com
        await page.goto(`https://www.ultimate-guitar.com/search.php?title=${encodeURIComponent(songName)}&type=300&rating%5B0%5D=4&rating%5B1%5D=5&page=1&order=myweight`);
        await page.waitForSelector('::-p-xpath(/html/body/div/div[3]/main/div[3]/div/section/article)');
        jsonResults = await page.evaluate(() => {
            const results = [];
            // Grab all result links using their common classes
            const links = Array.from(document.querySelectorAll("a.WfRYb.OtmaM.YD9Tl"));
            links.forEach(link => {
                const name = link.innerText.trim();
                const href = link.getAttribute("href");
                // Determine type from href
                const type = href.includes("chords")
                    ? "chords"
                    : href.includes("tabs")
                        ? "tabs"
                        : "unknown";
                // Attempt to extract the artist from the URL path
                const parts = href.split("/");
                const artist = parts.length > 4 ? parts[4].replace(/_/g, " ") : "";
                results.push({ artist, name, href, type });
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
