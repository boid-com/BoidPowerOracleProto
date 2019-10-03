var app = require('express')()
const ms = require('human-interval')
const cors = require('cors')
// app.enable("trust proxy")
app.use(cors())
app.options('*', cors())
app.use(require('body-parser').json())
app.use(require("express-slow-down")({windowMs: ms('10 minutes'), delayAfter: 100, delayMs: 15000}))
app.use(require("express-rate-limit")({windowMs: ms('10 minutes'), max: 500}))


async function init () {
  Object.entries(require('./get')).forEach( el => app.get('/*'+el[0]+'/:var1?',el[1]))
  Object.entries(require('./post')).forEach( el => app.post('/*'+el[0]+'/:var1?',el[1]))
  app.listen(4444,function(){console.log('app listening on port 4444')})
}

init().catch((err)=>{console.error(err),process.exit()})