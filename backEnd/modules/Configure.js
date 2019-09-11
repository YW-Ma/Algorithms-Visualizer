//*************此模块负责配置数据库************* */

module.exports = {
    // 数据库
    dbOptions: {
        connectionLimit: 25,
        host: '47.100.30.165',
        port: 3306,
        user: 'root',
        password: 'asdf',
        database: 'algoVisual',
    },
    secret: 'asdf',     //这个secret是干嘛的？？
};
