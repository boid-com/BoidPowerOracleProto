module.exports = {
  apps: [
    {
      name: 'server',
      script: 'server/server.js',
      args: '1',
      restart_delay: 1000
    }
  ]
}
