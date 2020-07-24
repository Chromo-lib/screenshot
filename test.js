const screenshot = require('./screenshot')
const fs = require('fs')

;(async () => {
  const buffer = await screenshot('https://www.google.com')
  fs.writeFileSync('screenshot.png', buffer.toString('binary'), 'binary')
})()
