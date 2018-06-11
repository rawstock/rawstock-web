module.exports = {
  apps: [
    {
      name: 'fe-commission',
      script: './dist/server',
      instances: 1,
      exec_mode: 'cluster',
      max_memory_restart: '600M',
      watch: false,
      log_date_format: 'YYYY/MM/DD HH:mm:ss.SSS',
      error_file: '/Users/yexiaohui/rawstock-web/logs/error.log',
      out_file: '/Users/yexiaohui/rawstock-web/logs/out.log',
      pid_file: '/Users/yexiaohui/rawstock-web/logs/pid.log',
      combine_logs: true,
      env: {
        COMMON_VARIABLE: "true",
        BABEL_DISABLE_CACHE: 1
      }
    },
  ],
};
