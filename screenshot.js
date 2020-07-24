const pw = require('playwright');

module.exports = function (url) {

  return new Promise(async (resolve, reject) => {
    try {
      const browser = await pw.chromium.launch({
        args: ['--start-fullscreen', '--start-maximized']
      }); // or 'chromium', 'firefox'

      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto(url, { 
        waitUntil: ['load', 'networkidle0', 'domcontentloaded'] 
      });
      
      const buffer = await page.screenshot({ fullPage: true, type: 'png' });

      await browser.close();

      resolve(buffer);
    } catch (error) {
      reject(error);
    }
  })();
}