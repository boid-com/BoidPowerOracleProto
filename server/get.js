const ax = require('axios')
ax.defaults.timeout = 20000
const logger = require('logging').default('server.get')

function eC (error, res) {
  if (!error.message) error = { message: error }
  logger.error(error.message)
  if (!res) return
  res.statusCode = 500
  res.json({ error: error.message })
}

var deviceCache = []
var globalsCache = {}

async function updateDeviceCache () {
  try {
    deviceCache = (await ax.post('https://api.boid.com/getDevices')).data
  } catch (error) { eC(error) }
}
async function updateGlobalsCache () {
  try {
    globalsCache = (await ax.post('https://api.boid.com/getGlobals')).data
  } catch (error) { eC(error) }
}
updateGlobalsCache()
updateDeviceCache()

setInterval(el => {
  updateDeviceCache()
}, 120000)

setInterval(el => {
  updateGlobalsCache()
}, 12000000)

module.exports = {
  getDevices: async (req, res) => {
    try {
      return res.json(deviceCache)
    } catch (error) { eC(error, res) }
  },

  getGlobals: async (req, res) => {
    try {
      return res.json(globalsCache)
    } catch (error) { eC(error, res) }
  }
}
