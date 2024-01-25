import pageScraper from './pageScraper';
import fs from 'fs';

export async function scrapeAll(browserInstance){
	let browser;
	try{
		browser = await browserInstance;
		//await pageScraper.scraper(browser);	
        let scrapedData = {};
		// Call the scraper for different set of books to be scraped
		scrapedData['Informatique'] = await pageScraper.scraper(browser, 'Informatique');
		scrapedData['Téléphones'] = await pageScraper.scraper(browser, 'Téléphones');
		scrapedData['Multimédia'] = await pageScraper.scraper(browser, 'Multimédia');
        scrapedData['Gaming'] = await pageScraper.scraper(browser, 'Gaming');
		await browser.close();
		//console.log(scrapedData)
        fs.writeFile("data.json", JSON.stringify(scrapedData), 'utf8', function(err) {
		    if(err) {
		        return console.log(err);
		    }
		    console.log("The data has been scraped and saved successfully! View it at './data.json'");
		});
		
	}
	catch(err){
		console.log("Could not resolve the browser instance => ", err);
	}
}

module.exports = (browserInstance) => scrapeAll(browserInstance)