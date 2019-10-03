const db = require('../../db')
const ax = require('axios')
ax.defaults.timeout = 30000
const env = require('../../.env.json')
const logger = require('logging').default('getDevices')

async function checkExistingDevice(device){
  const existingDevice = await db.gql(`{device(where:{wcgid:"${device.wcgid}"}){id rvnid wcgid}}`)
  if (!existingDevice) return false
  if (existingDevice.rvnid === device.id) return true
  await db.gql(`mutation{deleteDevice(where:{id:"${existingDevice.id}"}) {id} }`)
  return false
}

async function addDevice(device){
  try {
    await checkExistingDevice(device)
    function checkWCGID(){
      if (!device.wcgid) return ''
      else return `wcgid:"${device.wcgid}"`
    }
    const result = await db.gql(`
      mutation{upsertDevice(
        where:{rvnid:"${device.id}"} 
        update:{ key:"${device.owner.payoutAccount}" ${checkWCGID()}}
        create:{ key:"${device.owner.payoutAccount}" ${checkWCGID()} rvnid:"${device.id}"}
      ){id}}`)
    return result
  } catch (error) {
    logger.error(error)
  }
}
async function init(){
  const devices = (await ax.post(env.boidAPI+'getDevices')).data
  logger.info('')
  logger.info('Found',devices.length,'registered devices')
  logger.info('Upserting devices into DB...')
  console.log(devices)
  for (device of devices){await addDevice(device)}
  logger.info('finished upserting devices')
  return {results:{deviceCount:devices.length}}
}
if (require.main === module && process.argv[2] === 'dev') init().catch(logger.info)
module.exports = init