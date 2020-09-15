const log = require('simple-node-logger').createSimpleFileLogger({
  logFilePath: 'errorLog.log'
})

exports.writeError = (content) => {
  log.info(content);
}