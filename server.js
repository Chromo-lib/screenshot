const express = require('express');
const app = express();
let cors = require('cors');
let screenshot = require('./src/screenshot');

app.use(cors("*"));

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/screenshot', async (req, res) => {

  try {
    let buffer = await screenshot(req.query);

    res.setHeader('Content-Disposition', 'attachment; filename="wshot.png"')
    res.setHeader('Content-Type', 'image/png')
    res.send(buffer)
  } catch (err) {
    res.status(500).send(`Something went wrong: ${err}`)
  }
});

const port = process.env.PORT || 3131;
app.listen(port, () => console.log(`app listening on port ${port}!`));