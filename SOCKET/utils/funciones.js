const log = require('simple-node-logger').createSimpleFileLogger({
  logFilePath: '../Logs/errorLog.log'
})

exports.writeError = (content) => {
  log.info(content);
}