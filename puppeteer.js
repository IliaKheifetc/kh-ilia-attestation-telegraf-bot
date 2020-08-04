const puppeteer = require("puppeteer");
const { DOMAIN_NAME_URL } = require("./constants/index");

module.exports = {
  createScreenshot: async screenShotFileName => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`${DOMAIN_NAME_URL}reportTable`);
    await page.screenshot({ path: screenShotFileName });

    return browser.close();
  }
};
