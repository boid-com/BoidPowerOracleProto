const db = require('../db')

const validators = [
  {
    name:"animusvalid3",
    key:"EOS7ZfKDHoonx4gh1QSMacp2Fa5QT7F8dJUSEBAVwmESwe1tcNufw"
  },
  {
    name:"boid1metrics",
    key:"EOS5gvHQg4ZS8NtCvHDBURm7db1UZKSzL5Wy46H1nWZVjaKiSndAE"
  },
  {
    name:"boidcomnodes",
    key:"EOS7SVKEaCXJPXmee4kpgHm9cdFRVdwK4EthwFyiDUraSVfWmaPgM"
  },
  {
    name:"onlyforgames",
    key:"EOS8KBYNo9wgw1HAvVE2EAC3BKGuNjGYdehJpB4NNpMRzNM1ZoK19"
  },
  {
    name:"perchitsboid",
    key:"EOS6BoidNsuCSLcbULHZ9m9gqJbHTJB24asPR9JVVfMku8cpzaQGc"
  },
  {
    name:"rocknrolla22",
    key:"EOS5hhrTPy7hyTp3J91orr7Dn3rQezhrNmvpskaRvin3XVwJcAvDP"
  },
  {
    name:"stakingwhale",
    key:"EOS85Aov8xJPx2PEDYmntGbzHXgZDd4aj8tJHiYsnAPtQXmuedqQP"
  },
  {
    name:"tjkgaming123",
    key:"EOS76pPUoycQqwa3disp3FAY3vtoG7FVAiFGTMLMn4X3Ym2g9B4gH"
  },
  {
    name:"usavalidator",
    key:"EOS7CSQqGH6LTi4FW8Z7BTCnAJtAFmRpEbUqGeD4MDvFRMwRvAVbm"
  },
  {
    name:"xya12cvx1m42",
    key:"EOS5uzjAjZ8KQwWTFUme35dMrZK7j4JQaSJ7rP8xbqCRsshd46zQn"
  }
]

async function init () {
  var mutation = 'mutation{'
  for (validator of validators){
    mutation += `l${validator.name}:createValidator(data:{name:"${validator.name}",key:"${validator.key}",weight:1,stake:0}){id} `
  }
  mutation += '}'

  const result = await db.client.request(mutation)
  console.log(result)
}

init().catch(console.log)
