const DB = require('./DB');
const logger = require('../modules/Logger');

const getAlgos = () => new Promise((resolve, reject) => DB.query({
    sql: 'SELECT algorithm FROM algo;',
    timeout: 10000,
}).then((data) => {
    if (!data.results || data.results.length < 1) {
        reject(new Error('查询失败'));
    } else {
        resolve(data.results);
    }
}).catch(err => reject(err)));


exports.getAlgos = getAlgos;