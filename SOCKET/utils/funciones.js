const log = require('simple-node-logger').createSimpleFileLogger({
  logFilePath: '../Logs/errorLog.log'
})

export const writeError = (content) => {
  log.info(content);
}