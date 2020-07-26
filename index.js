const express = require('express');
const app = express();
const port = process.env.PORT || 3131;
const shot = require('./shot');

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/screenshot', async (req, res) => {

  try {
    let buffer = await shot(req.query)
    res.setHeader('Content-Disposition', 'attachment; filename="screenshot.png"')
    res.setHeader('Content-Type', 'image/png')
    res.send(buffer)
  } catch (error) {
    res.json({ success: false, e: error.message })
  }
})

app.listen(port, () => console.log(`app listening on port ${port}!`))