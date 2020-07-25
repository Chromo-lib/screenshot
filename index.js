const express = require('express');
const app = express();
const port = process.env.PORT || 3131;
const shot = require('./shot');

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/screenshot', (req, res) => {
    ; (async () => {

      const buffer = await shot(req.query)
      res.setHeader('Content-Disposition', 'attachment; filename="screenshot.png"')
      res.setHeader('Content-Type', 'image/png')
      res.send(buffer)

    })()
})

app.listen(port, () => console.log(`app listening on port ${port}!`))