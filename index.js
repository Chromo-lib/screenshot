const express = require('express');
const app = express();
const port = process.env.PORT || 3131;
const screenshot = require('./screenshot');

app.get('/', (req, res) => res.status(200).json({ status: 'ok' }));

app.get('/screenshot', async (req, res) => {
  const url = req.query.url;
  try {
    const buffer = await screenshot(url)
    res.setHeader('Content-Disposition', 'attachment; filename="screenshot.png"');
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  } catch (error) {
    res.send(error.message);
  };
});

app.listen(port, () => console.log(`app listening on port ${port}!`))
