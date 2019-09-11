const mysql = require('mysql');
const configure = require('./Configure');
const logger = require('./Logger');

const pool = mysql.createPool(configure.dbOptions);

const query = sql => new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
        if (err) {
            reject(err);
            logger.info('db query err!');
            return;
        }
        connection.query(sql, (error, results, fields) => {
            //logger.info(sql);
            connection.release();
            if (err) {
                reject(err);
                logger.error('DB Error', err);
            } else {
                resolve({ results, fields });
            }
        });
    });
});

exports.query = query;