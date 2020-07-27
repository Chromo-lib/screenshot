const screenshot = require('./src/screenshot')
const fs = require('fs')

  ; (async () => {
    const buffer = await screenshot({ url: 'https://picode.tk' })
    fs.writeFileSync('wshot.png', buffer.toString('binary'), 'binary')
  })()
