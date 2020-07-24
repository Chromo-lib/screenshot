const pw = require('playwright');

module.exports = async (url) => {
  const browser = await pw.chromium.launch({
    headless: false,
    args: ['--start-fullscreen', '--no-sandbox']
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(url, { waitUntil: 'networkidle0' });

  //await scrollFullPage(page);  

  // const dimensions = await page.evaluate(() => {
  //   return {
  //     width: document.documentElement.clientWidth,
  //     height: document.documentElement.clientHeight,
  //     deviceScaleFactor: window.devicePixelRatio
  //   }
  // });

  // // await page.evaluate(() => {
  // //   window.scrollTo(0, dimensions.height)
  // // })

  // await page.setViewportSize(dimensions);

  const buffer = await page.screenshot({ fullPage: true, type: 'png' });

  await browser.close();

  return buffer;
};

async function scrollFullPage (page) {
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}