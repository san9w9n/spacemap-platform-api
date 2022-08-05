module.exports = {
  apps: [
    {
      name: 'spacemap-platform-api',
      script: './src/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'deployment',
        SPACEMAP_NODE_ENV: 'deployment',
      },
      watch: false,
    },
    {
      name: 'spacemap-platform-api-daily-tasks',
      script: './src/server.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'deployment',
        SPACEMAP_NODE_ENV: 'deployment',
      },
      watch: false,
    },
    {
      name: 'spacemap-platform-api-local',
      script: './src/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        PORT: 8082,
        NODE_ENV: 'deployment',
        SPACEMAP_NODE_ENV: 'local',
      },
      watch: false,
    },
  ],

  deploy: {
    production: {
      user: 'SSH_USERNAME',
      host: 'SSH_HOSTMACHINE',
      ref: 'origin/master',
      repo: 'GIT_REPOSITORY',
      path: 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy':
        'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },
};
