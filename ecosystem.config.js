module.exports = {
  apps: [
    {
      name: "bigcommerce-api",
      script: "npm",
      args: "start",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
        // Example env keys — DO NOT PUT SECRETS HERE. Use your API.env or system env instead.
        // PORT: "3000",
        // CORS_ORIGIN: "*",
        // BIGCOMMERCE_SOME_KEY: "placeholder"
      },
    },
  ],
};
