const db = require('../db')
function pq (query) {
  return query.replace(/"/g, '\\"').replace(/\n/g, ' ').replace(/\s+/g, ' ')
}
const queries = [
  'CREATE INDEX "pr_index" ON "default$default"."PowerReport" USING BTREE ("id")'
]

for (query of queries) {
  db.gql(`mutation{executeRaw(query:"${pq(query)}")}`).then(el => console.log('success', el)).catch(console.log)
}
