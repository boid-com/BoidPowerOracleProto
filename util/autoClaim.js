const eosjs = require('../eosjs')
const ax = require('axios')
const env = require('../.env.json')

async function init () {
  const users = (await ax.post(env.boidAPI + 'getUsers')).data.filter(el => el.dPower > 0).shuffle()
  console.log('found users:', users.length)

  for (user of users) {
    if (!user.payoutAccount) continue
    try {
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
              stake_account: user.payoutAccount,
              percentage_to_stake: 0,
              issuer_claim: true
            }
          }]
        },
        { blocksBehind: 6, expireSeconds: 30 }
      )
    } catch (error) {
      console.log(error)
      continue
    }
  }
}
// pastatuin34d

// lonewolf1111
// 14,904.691 16,988.129
// PercentDifferent: 13.98
// PointDifference: 2083.44

// lonewolf1111
// 15,896.202 17,232.014
// PercentDifferent: 8.40
// PointDifference: 1335.81

// touchman1313
// 14,157.984 17,551.681
// PercentDifferent: 23.97
// PointDifference: 3393.70

// davidbeidle2
// 60,232.078 66,553.291
// PercentDifferent: 10.49
// PointDifference: 6321.21

init().catch(console.log)
