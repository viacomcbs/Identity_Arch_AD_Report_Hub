module.exports = {
  apps: [
    {
      name: 'ad-report-hub',
      script: 'server/index.js',

      // Production environment — React build is served statically by Express
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },

      // Development environment — use npm start instead (see START_DEV.bat)
      env_development: {
        NODE_ENV: 'development',
        PORT: 5000,
      },

      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',

      // Log output
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      out_file: 'logs/pm2-out.log',
      error_file: 'logs/pm2-error.log',
      merge_logs: true,

      // Wait for the server to be fully up before declaring healthy
      listen_timeout: 10000,

      // Give the app up to 5 s to shut down gracefully before PM2 force-kills
      kill_timeout: 5000,

      // Signals used for graceful stop/restart
      stop_exit_codes: [0],
    },
  ],
};
