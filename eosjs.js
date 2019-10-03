const { Api, JsonRpc } = require('eosjs')
var url = require('url')
var env = require('./.env.json')
const {JsSignatureProvider} = require('eosjs/dist/eosjs-jssig')
const fetch = require('node-fetch')
const { TextEncoder, TextDecoder } = require('util')
var api
var rpc

function rand (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const endpoints = [
  'https://api.eosnewyork.io',
  'https://eos.greymass.com:443',
  'https://api.eossweden.org',
  'https://api.eosn.io',
  'https://api.cypherglass.com'
]

function pickEndpoint (override) {
  if (env.stage === 'prod' || override === true) {
    return endpoints[rand(0, endpoints.length - 1)]
  }
  else return 'https://kylin.eoscanada.com'
}

// const endpoint = 'https://api.eosnewyork.io'

async function sendTokens(to,amount,from,memo,tokenacct,tokenName){
  // if (process.env.USER === 'boid') return console.log({to,from,amount,memo,tokenacct,tokenName})
  try {
    const result = await api.transact({
      actions: [{
        account: tokenacct,
        name: 'transfer',
        authorization: [{
          actor:from,
          permission: 'active',
        }],
        data: {
          from,
          to,
          quantity: amount + ' ' + tokenName,
          memo,
        },
      }]
    }, {
      blocksBehind: 6,
      expireSeconds: 10,
    });
    // console.log(result)
    return result.transaction_id
  } catch (e) {
    console.error('Caught exception: ' + e.message)
    // if (e.json) console.log(JSON.stringify(e.json, null, 2))
    return 
  }
}
async function getStake(account) {
try {
  let res = await rpc.get_table_rows({
      json: true,
      code: 'boidcomtoken',
      scope: account,
      table: "staked",
      limit: 10000
    });
    return res.rows
  } catch(error) {
    console.error(error)
    return undefined
  }
}

function init(keys,override,endpoint){
  if (!keys) keys = env.keys
  if (!endpoint) endpoint = pickEndpoint(override)
  console.log(endpoint)
  const signatureProvider = new JsSignatureProvider(keys)
  rpc = new JsonRpc(endpoint, { fetch })
  api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder()})
  return {rpc,api,sendTokens,getStake}
}

module.exports = init


// init().getStake('johnatboid11')