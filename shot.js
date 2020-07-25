const pw = require('playwright');
const waitFor = require('./utils/waitFor');

module.exports = async function (reqQuery) {

  const { url, width, height } = reqQuery;

  const browser = await pw.chromium.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-fullscreen', '--no-sandbox', "--disable-gpu"]
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(url || 'https://reactjs.org', { waitUntil: 'networkidle0' });

  await waitFor(1000);

  const dimensions = await page.evaluate(() => {
    return {
      width: document.documentElement.offsetWidth,
      height: document.documentElement.offsetHeight,
      deviceScaleFactor: window.devicePixelRatio
    }
  });

  await waitFor(1000);

  await page.setViewportSize({
    width: parseInt(width, 10) || dimensions.width,
    height: parseInt(height, 10) || dimensions.height
  });

  await waitFor(1000);

  const buffer = await page.screenshot({ fullPage: true, type: 'png' });
  await browser.close();

  return buffer;
}