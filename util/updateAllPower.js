const eosjs = require('../eosjs')
const ax = require('axios')
const env = require('../.env.json')

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

async function doTx (user) {
  const result = await eosjs().api.transact(
    {
      actions: [{
        account: 'boidcomtoken',
        name: 'setpower',
        authorization: [{
          actor: 'boidcomtoken',
          permission: 'poweroracle'
        }],
        data: {
          acct: user.payoutAccount,
          boidpower: user.dPower,
          reset_claim_time: false
        }
      }]
    },
    { blocksBehind: 6, expireSeconds: 30 }
  )
  return result
}

async function init () {
  const users = (await ax.post(env.boidAPI + 'getUsers')).data.filter(el => el.dPower > 10).shuffle()
  console.log('found users:', users.length)
  for (user of users) {
    try {
      const result = await doTx(user)
      console.log(result.transaction_id)
    } catch (error) {
      console.error(error)
      const result = await doTx(user)
      console.log(result.transaction_id)
    }
  }
}

init().catch(console.log)
