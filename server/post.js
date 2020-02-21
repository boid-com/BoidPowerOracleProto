const db = require('../db')
const handleDevicePowerReport = require('./util/handleDevicePowerReport')

function eC (error, res) {
  if (!error.message) error = { message: error }
  console.error(error.message)
  res.statusCode = 500
  res.json({ error: error.message })
}

module.exports = {
  reportDevicePower: async (req, res) => {
    try {
      if (!req.header('auth')) return res.statusCode = 401, res.json()
      const powerReport = await handleDevicePowerReport(req.body, req.header('auth'))
      if (powerReport && powerReport.error) {
        res.statusCode = powerReport.code
        return res.json({ powerReport })
      }
      return res.json({ success: true })
    } catch (error) { eC(error, res) }
  }
}
