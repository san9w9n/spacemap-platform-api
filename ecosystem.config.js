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
      env_production: {
        NODE_ENV: 'production',
      },
      watch: true,
    },
    {
      name: 'spacemap-platform-api-services-tasks',
      script: './src/server.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'deployment',
        SPACEMAP_NODE_ENV: 'deployment',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      watch: true,
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
      env_production: {
        NODE_ENV: 'production',
      },
      watch: true,
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
