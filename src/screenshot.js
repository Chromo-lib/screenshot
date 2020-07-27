const chromium = require("puppeteer");

module.exports = async ({ url, width, height }) => {
  let browser = await chromium.launch({
    args: ['--no-sandbox']
  });

  let page = await browser.newPage()
  await page.goto(url || 'https://reactjs.org', { waitUntil: 'networkidle0' });

  await page.waitFor(1000);

  let dimensions = await page.evaluate(() => {
    return {
      width: document.documentElement.offsetWidth,
      height: document.documentElement.offsetHeight,
      deviceScaleFactor: window.devicePixelRatio
    }
  });

  await page.setViewport({
    width: parseInt(width, 10) || dimensions.width,
    height: parseInt(height, 10) || dimensions.height
  });

  let buffer = await page.screenshot({ fullPage: true, type: "png" })
  await browser.close();

  return buffer;
}