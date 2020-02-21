module.exports = {
  apps: [
    {
      name: 'server',
      script: 'server/server.js'
    },
    {
      name: 'cron1',
      script: 'cron/runCronGroup.js',
      args: '1',
      restart_delay: 1200000
    }
  ]
}
