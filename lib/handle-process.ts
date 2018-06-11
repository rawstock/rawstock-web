// tslint:disable
// 监听SIGINT事件，graceful shutdown
process.on('SIGINT', function() {
  console.info('Receive SIGINT, exit in 300ms');
  setTimeout(() => {
    console.info('exit');
    process.exit(0);
  }, 300);
});

// 监听message事件，一旦发现内容是shutdown，就退出
process.on('message', function(msg) {
  if (msg === 'shutdown') {
    console.info('Receive message shutdown, exit in 1000ms');
    setTimeout(() => {
      console.info('exit');
      process.exit(0);
    }, 1000);
  }
});

// https://github.com/iojs/io.js/pull/758
// https://gist.github.com/benjamingr/0237932cee84712951a2
// 监听无法处理的Promis异常
process.on('unhandledRejection', function(reason, p) {
  console.log(
    'Possibly Unhandled Rejection at: Promise ',
    p,
    ' reason: ',
    reason
  );
});

// 监听未捕获异常事件
process.on('uncaughtException', function(err) {
  console.log('Catch Uncaught Exception: ', err);
});