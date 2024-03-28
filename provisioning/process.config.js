module.exports = {
  apps: [
    {
      name: "CBS_MICRO_STAGING",
      script: "./node_modules/.bin/moleculer-runner --repl --hot services/**/*.service.js",
      //max_memory_restart: "400M", // cho mỗi process
      log_date_format : "YYYY-MM-DD HH:mm Z",
      ignore_watch: ["node_modules"],
      watch_options: {
        followSymlinks: false,
      },
      env_production: {
          "NODE_ENV": "production",
      },
      "node_args": ["--max_old_space_size=23552", "--max-semi-space-size=128"]
      }
    ],
};
