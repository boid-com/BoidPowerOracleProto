
const ecc = require('eosjs-ecc')
const validatorKeys = ['EOS7amPpRPLe3F2k6D3ctiS9uoa3XpeB4ePPYXtY7bsqkzDuV4tF8','EOS5gvHQg4ZS8NtCvHDBURm7db1UZKSzL5Wy46H1nWZVjaKiSndAE']
ecc.initialize()

async function injestPowerReport(data,pubKey){
  // do something important here //
  console.log(data,pubkey)
}


async function init(data,auth){
  try {
    const pubKey = await ecc.recoverHash(auth,ecc.sha256(JSON.stringify(data)))
    console.log('Validator pubkey:',pubKey)
    if (!validatorKeys.find(el => el == pubKey)) return {error:'Authentication Failed',code:401}
    console.log('Data Signature Validated')
    const result = await injestPowerReport(data,pubKey)
  } catch (error) {
    console.log(error)
    return {error:"Internal server error",code:500}
  }

}
module.exports = init