
const ecc = require('eosjs-ecc')
const db = require('../../db')
const ms = require('human-interval')
const logger = require('logging').default('handleDevicePowerReport')

ecc.initialize()

async function getPowerRound (globals) {
  const existingPowerRound = (await db.gql(`{powerRounds(where:{startTime:"${globals.round.start}" endTime:"${globals.round.end}"}){id}}`))[0]
  if (existingPowerRound) return existingPowerRound
  const newPowerRound = await db.gql(`mutation{createPowerRound(data:{startTime:"${globals.round.start}" endTime:"${globals.round.end}"}){id}}`)
  if (newPowerRound) return newPowerRound
  else return false
}

async function injestPowerReport (data, pubKey) {
  try {
    const powerRound = await getPowerRound(data.globals)
    if (!powerRound) throw ('invalid PowerRound Data')
    for (report of data.powerReports) {
      try {
        const deleteExisting = await db.gql(`mutation {deleteManyPowerReports(
        where:{
          validator:{key:"${pubKey}"} 
          device:{rvnid:"${report.rvnid}"} 
          powerRound:{
            endTime:"${data.globals.round.end}" 
            startTime:"${data.globals.round.start}"}
        }){count}}`)
        if (deleteExisting && deleteExisting.count > 0) logger.info('Deleted Existing:', deleteExisting)
        const newReport = await db.gql(`mutation{createPowerReport(data:{
          power:${report.totalPower} 
          device:{connect:{rvnid:"${report.rvnid}"}} 
          rvnPower:${report.rvnPower} 
          boincPower:${report.boincPower}
          powerRound:{connect:{id:"${powerRound.id}"}} 
          validator:{connect:{key:"${pubKey}"}} 
        }){id}}`)
        logger.info('New report', newReport)
      } catch (error) {
        if (!error.message) error = { message: error }
        logger.error('Error caused by pubkey:', pubKey)
        logger.error('Error caused by this report:', report)
        logger.error(error.message)
        continue
      }
    }
    return {}
  } catch (error) {
    if (!error.message) error = { message: error }
    logger.error('Error caused by pubkey:', pubKey)
    logger.error(error.message)
    throw (error)
  }
}

async function init (data, auth) {
  try {
    const validatorKeys = (await db.gql('{validators{key}}')).map(el => el.key)
    const pubKey = await ecc.recoverHash(auth, ecc.sha256(JSON.stringify(data)))
    logger.info('Validator pubkey:', pubKey)
    if (!validatorKeys.find(el => el == pubKey)) return { error: 'Authentication Failed', code: 401 }
    logger.info('Data Signature Validated')
    const result = await injestPowerReport(data, pubKey)
    return result
  } catch (error) {
    logger.error(error)
    return { error: 'Internal server error', code: 500 }
  }
}
module.exports = init
