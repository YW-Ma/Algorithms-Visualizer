/*****************  此模块的任务是写日志******************/

const log4js=require('log4js');
const path=require('path');

const logPath=path.resolve(__dirname,'../data/log-data.log');

log4js.configure({
    appenders: {
        cheese: { type: 'file', filename: logPath },
        console: { type: 'console' },
    },
    categories: { default: { appenders: ['cheese', 'console'], level: 'debug' } },
});

const logger = log4js.getLogger('LOG');

//导出模块logger
module.exports = logger;