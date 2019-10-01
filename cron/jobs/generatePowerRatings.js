const db = require('../../db')
const logger = require('logging').default('genPowerRatings')
const ax = require('axios')
const env = require('../../.env.json')
const ms = require('human-interval')
const eosjs = require('../../eosjs')
Array.prototype.shuffle = function() {
  var i = this.length, j, temp;
  if ( i == 0 ) return this;
  while ( --i ) {
     j = Math.floor( Math.random() * ( i + 1 ) );
     temp = this[i];
     this[i] = this[j];
     this[j] = temp;
  }
  return this;
}

const findAverage = (arr) => arr.reduce((acc,el)=> el + acc ,0) / arr.length
const findMedian = arr => {
  const mid = Math.floor(arr.length / 2),
    nums = [...arr].sort((a, b) => a - b)
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2
};

async function getFinishedRound(){
  var round = {}
  var now = new Date(Date.now() - ms('one hour'))
  now.setUTCMinutes(0,0,0)
  round.end = now.toISOString()
  round.start = new Date(Date.parse(round.end) - ms('one hour')).toISOString()
  logger.info(round)
  return (await db.gql(`{powerRounds(where:{startTime:"${round.start}" endTime:"${round.end}"}){id}}`))[0]
  
}

async function generatePowerRating(device,finishedRound){
  const powerReports = await db.gql(`{powerReports(where:{device:{id:"${device.id}"} powerRound:{id:"${finishedRound.id}"}}){power rvnPower boincPower validator{name key weight stake}}}`)
  const pr = {
    rvnPower: findMedian(powerReports.map(el => el.rvnPower)),
    boincPower: findMedian(powerReports.map(el => el.boincPower)),
    weight: powerReports.reduce((acc,el) => el.validator.weight + acc,0),
    stake: powerReports.reduce((acc,el) => el.validator.stake + acc,0)
  }
  pr.power = pr.rvnPower + pr.boincPower
  const powerRating = await db.gql(`mutation($meta:Json){createPowerRating(data:{ 
  power:${pr.power} rvnPower:${pr.rvnPower}  boincPower:${pr.boincPower} 
  device:{connect:{id:"${device.id}"}} powerRound:{connect:{id:"${finishedRound.id}"}} 
  consensusDetails:$meta totalWeight:${pr.weight} totalStake:${pr.stake}}){id power rvnPower boincPower device{rvnid}}}`,{meta:powerReports})
  return powerRating
}

async function broadcastPowerRating(){

}

async function init(){
  try {
    const finishedRound = await getFinishedRound()
    if (!finishedRound) throw('No valid round found')
    const roundDevices = (await db.gql(`{devices(where:{powerReports_some:{powerRound:{id:"${finishedRound.id}"}}}){id}}`)).shuffle()
    logger.info('round devices',roundDevices.length)
    for (device of roundDevices){
      const powerRating = await generatePowerRating(device,finishedRound)
      console.log(powerRating)
      const txid = await broadcastPowerRating(powerRating)
      console.log(txid)
      return
    }
  } catch (error) {
    if (!error.message) error = {message:error}
    logger.error(error.message)
  }

}

if (require.main === module && process.argv[2] === 'dev') init().catch(logger.info)
