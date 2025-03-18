const puppeteer = require("puppeteer");

async function getSongResults(songName) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    let el;
    // Check if the song name contains any Hebrew letters
    if (/[\u0590-\u05FF]/.test(songName)) {
        await page.goto(`https://www.tab4u.com/resultsSimple?tab=songs&q=${encodeURIComponent(songName)}`);
        el = await page.waitForSelector('::-p-xpath(//*[@id="resultsPage"]/div[2]/table)');
    } else {
        await page.goto(`https://www.ultimate-guitar.com/search.php?title=${encodeURIComponent(songName)}&type=300&rating%5B0%5D=4&rating%5B1%5D=5&page=1&order=myweight`);
        el = await page.waitForSelector('::-p-xpath(/html/body/div/div[3]/main/div[3]/div/section/article)');
    }

    // Extract table data from the element
    const jsonResults = await page.evaluate(el => {
        // For example, return the element's innerText (adjust as needed to extract table data)
        return el.innerText;
    }, el);

    await browser.close();
    return jsonResults;
}

module.exports = { getSongResults };