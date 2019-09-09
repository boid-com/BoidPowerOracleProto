const ax = require('axios')
ax.defaults.timeout = 20000
const logger = require('logging').default('server.get')

function eC(error,res){
  if (!error.message) error = {message:error}
  logger.error(error.message)
  res.statusCode = 500
  res.json({error:error.message})
}

var deviceCache = []
async function updateDeviceCache() {
  deviceCache = (await ax.post('https://api.boid.com/getDevices')).data
}

updateDeviceCache()

setInterval(el => {
  updateDeviceCache()
},120000)


module.exports = {
  getDevices: async (req,res) => {
    try {
      return res.json(deviceCache)
    } catch (error) {eC(error,res)}
  }
}
