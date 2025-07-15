'use strict';
module.exports = {
  apps: [
    {
      name: 'zenithly-server',
      script: 'src/server.ts',
      interpreter: 'node',
      interpreter_args:
        '--env-file .env --experimental-strip-types --no-warnings',
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3000,
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      // Health check
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
      // Monitoring
      pmx: true,
      // Advanced PM2 features
      kill_timeout: 5000,
      listen_timeout: 8000,
      // Environment variables for the app
      env_file: '.env',
    },
  ],

  deploy: {
    production: {
      user: 'ubuntu',
      host: 'ec2-3-22-100-220.us-east-2.compute.amazonaws.com',
      ref: 'origin/master',
      repo: 'https://github.com/Diottodev/zenithly-server.git',
      path: 'zenithly-server',
      'pre-deploy-local': '',
      'post-deploy':
        'pnpm install --frozen-lockfile && pnpm db:migrate && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },
};
