const eosjs = require('../eosjs')
const ax = require('axios')
const env = require('../.env.json')
const fs = require('fs-extra')

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

async function getPower (account) {
  try {
    const res = await eosjs().rpc.get_table_rows({
      json: true,
      code: 'boidcomtoken',
      scope: account,
      table: 'powers',
      limit: 1
    })
    return res.rows[0]
  } catch (error) {
    return undefined
  }
}

async function init () {
  const users = (await ax.post(env.boidAPI + 'getUsers')).data.filter(el => el.dPower > 100).shuffle()
  console.log('found users:', users.length)
  var differences = []
  var pointDifferences = []
  var userLog = []
  for (user of users) {
    try {
      console.log(user.payoutAccount)
      const chainPower = parseFloat((await getPower(user.payoutAccount)).quantity)
      console.log(chainPower.toLocaleString(), user.dPower.toLocaleString())
      var percentDiff = (chainPower - user.dPower) / chainPower * 100.0
      if (percentDiff < 0) percentDiff = Math.abs(percentDiff)
      if (percentDiff > 0 && isFinite(percentDiff)) differences.push(percentDiff)
      var pointDiff = Math.abs(chainPower - user.dPower)
      if (pointDiff < 0) pointDiff = Math.abs(pointDiff)
      if (pointDiff > 0 && isFinite(pointDiff)) pointDifferences.push(pointDiff)
      user.chainPower = chainPower
      user.percentDiff = percentDiff
      // userLog.push(user)
      // fs.writeJSONSync('./userLog.json',userLog)
      console.log('PercentDifferent:', percentDiff.toFixed(2))
      console.log('PointDifference:', pointDiff.toFixed(2))
      console.log('')
    } catch (error) {
      console.log(error)
      continue
    }
  }
  const medianDiff = findMedian(differences)
  const avgDiff = findAverage(differences)
  const avgPointDiff = findAverage(pointDifferences)
  const medPointDiff = findMedian(pointDifferences)
  // console.log(differences.sort())
  console.log('Average Difference:', avgDiff.toFixed(0), '%')
  console.log('Median Difference:', medianDiff.toFixed(0), '%')
  console.log('Average Point Diff', avgPointDiff.toFixed(0))
  console.log('Median Point Diff', medPointDiff.toFixed(0))
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
