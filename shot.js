const { chromium } = require("playwright-chromium");
const waitFor = require('./utils/waitFor');

module.exports = async function (reqQuery) {

  const { url, width, height } = reqQuery;

  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox']
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(url || 'https://reactjs.org', { waitUntil: 'networkidle0' });

  const dimensions = await page.evaluate(() => {
    return {
      width: document.documentElement.offsetWidth,
      height: document.documentElement.offsetHeight,
      deviceScaleFactor: window.devicePixelRatio
    }
  });

  await page.setViewportSize({
    width: parseInt(width, 10) || dimensions.width,
    height: parseInt(height, 10) || dimensions.height
  });

  const buffer = await page.screenshot({ fullPage: true, type: 'png' });
  await browser.close();

  return buffer;
}