const db = require('../../../db')
const env = require('../../../.env.json')
const eosjs = require('../../../eosjs')
const logger = require('logging').default('broadcastPowerRating')

async function init (account, power) {
  try {
    const result = await eosjs().api.transact(
      {
        actions: [{
          account: 'boidcomtoken',
          name: 'updatepower',
          authorization: [{
            actor: 'boidcomtoken',
            permission: 'poweroracle'
          }],
          data: {
            acct: account,
            boidpower: power
          }
        }]
      },
      {
        blocksBehind: 6,
        expireSeconds: 30
      }
    )
    // console.log(result)
    return result.transaction_id
  } catch (error) {
    console.error(error)
  }

  console.log(result)
}

module.exports = init

if (require.main === module && process.argv[2] === 'dev') init().catch(logger.info)
