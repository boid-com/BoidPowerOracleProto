const db = require('../../db')
const logger = require('logging').default('genPowerRatings')
const ax = require('axios')
const env = require('../../.env.json')
const ms = require('human-interval')
const broadcastPowerRating = require('./util/broadcastPowerRating')

Array.prototype.shuffle = function () {
  var i = this.length; var j; var temp
  if (i == 0) return this
  while (--i) {
    j = Math.floor(Math.random() * (i + 1))
    temp = this[i]
    this[i] = this[j]
    this[j] = temp
  }
  return this
}

const findAverage = (arr) => arr.reduce((acc, el) => el + acc, 0) / arr.length
const findMedian = arr => {
  const mid = Math.floor(arr.length / 2)
  const nums = [...arr].sort((a, b) => a - b)
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2
}

async function getFinishedRound () {
  var round = {}
  var now = new Date(Date.now() - ms('one hour'))
  now.setUTCMinutes(0, 0, 0)
  now.setUTCHours(0)
  round.end = now.toISOString()
  round.start = new Date(Date.parse(round.end) - ms('24 hours')).toISOString()
  logger.info(round)
  const foundRound = (await db.gql(`{powerRounds(where:{startTime:"${round.start}" endTime:"${round.end}"}){id executed}}`))[0]
  if (!foundRound) { if (foundRound && foundRound.executed) console.log('Round is already executed!'), process.exit() }
  return foundRound
}

async function generatePowerRating (device, finishedRound) {
  const powerReports = await db.gql(`
    {powerReports(where:{
    device:{id:"${device.id}"} powerRound:{id:"${finishedRound.id}"}})
    {power rvnPower boincPower validator{name key weight stake}}}`)
  const pr = {
    rvnPower: findMedian(powerReports.map(el => el.rvnPower)),
    boincPower: findMedian(powerReports.map(el => el.boincPower)),
    weight: powerReports.reduce((acc, el) => el.validator.weight + acc, 0),
    stake: powerReports.reduce((acc, el) => el.validator.stake + acc, 0)
  }
  pr.power = pr.rvnPower + pr.boincPower
  const powerRating = await db.gql(`mutation($meta:Json){createPowerRating(data:{ 
  power:${pr.power} rvnPower:${pr.rvnPower}  boincPower:${pr.boincPower} 
  device:{connect:{id:"${device.id}"}} powerRound:{connect:{id:"${finishedRound.id}"}} 
  consensusDetails:$meta totalWeight:${pr.weight} totalStake:${pr.stake}}){id power rvnPower boincPower device{rvnid}}}`, { meta: powerReports })
  return powerRating
}

async function init () {
  try {
    const finishedRound = await getFinishedRound()
    if (!finishedRound) throw ('No valid round found')
    const roundDevices = (await db.gql(`{devices(where:{ key_not:null powerReports_some:{powerRound:{id:"${finishedRound.id}"}}}){id key}}`))
    logger.info('round devices', roundDevices.length)
    const accounts = [...new Set(roundDevices.map(el => el.key))].shuffle()
    logger.info('accounts Length', accounts.length)
    for (account of accounts) {
      if (!account) continue
      const accountDevices = roundDevices.filter(el => el.key === account)
      var accountPower = 0
      for (device of accountDevices) {
        const powerRating = await generatePowerRating(device, finishedRound)
        accountPower += powerRating.power
        logger.info('DevicePower:', device.wcgid, powerRating.power)
      }
      if (accountPower === 0) continue
      logger.info(account, accountPower)
      const txid = await broadcastPowerRating(account, accountPower)
      logger.info(txid)
    }
    const executed = await db.gql(`mutation{updatePowerRound(where:{id:"${finishedRound.id}"} data:{executed:true} ) {id executed} }`)
    logger.info(executed)
    const deleteSince = (new Date(Date.now() - ms('6 hours'))).toISOString()
    db.gql(`mutation{ deleteManyPowerReports(where:{createdAt_lt:"${deleteSince}"}){count}}`)
  } catch (error) {
    if (!error.message) error = { message: error }
    logger.error(error.message)
  }
}
module.exports = init
if (require.main === module && process.argv[2] === 'dev') init().catch(logger.info)
