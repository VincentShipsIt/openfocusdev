module.exports = {
  apps: [{
    name: 'taskflow-api',
    script: 'dist/main.js',
    cwd: '/home/openclaw/www/shipshitdev/vincentshipsit/todo/core/apps/api',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
    },
    error_file: '/var/log/taskflow-api/error.log',
    out_file: '/var/log/taskflow-api/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }]
}
