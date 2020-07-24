const express = require('express')
const app = express()
const port = process.env.PORT || 3131
const playr = require('./playr');

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/screenshot', (req, res) => {
  const url = req.query.url
    ; (async () => {

      const buffer = await playr(url)
      res.setHeader('Content-Disposition', 'attachment; filename="screenshot.png"')
      res.setHeader('Content-Type', 'image/png')
      res.send(buffer)

    })()
})

app.listen(port, () => console.log(`app listening on port ${port}!`))