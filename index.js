const express = require('express');
const app = express();
const port = process.env.PORT || 3131;
const chromium = require("puppeteer");

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/screenshot', async (req, res) => {

  try {
    let browser = await chromium.launch({ args: ['--no-sandbox'] })
    let page = await browser.newPage()
    await page.goto(req.query.url || 'https://reactjs.org', { waitUntil: 'networkidle0' });

    await page.waitFor(1000);

    let dimensions = await page.evaluate(() => {
      return {
        width: document.documentElement.offsetWidth,
        height: document.documentElement.offsetHeight,
        deviceScaleFactor: window.devicePixelRatio
      }
    });

    await page.setViewport({
      width: parseInt(req.query.width, 10) || dimensions.width,
      height: parseInt(req.query.height, 10) || dimensions.height
    });

    let buffer = await page.screenshot({ fullPage: true, type: "png" })
    await browser.close();

    res.setHeader('Content-Disposition', 'attachment; filename="screenshot.png"')
    res.setHeader('Content-Type', 'image/png')
    res.send(buffer)
  } catch (err) {
    res.status(500).send(`Something went wrong: ${err}`)
  }

})

app.listen(port, () => console.log(`app listening on port ${port}!`))