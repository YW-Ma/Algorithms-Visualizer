const Logger = require('../modules/Logger');

module.exports = (req, res, next) => {
    //Logger.info(req);
    if (req.session.userType==0 || req.session.userType==1) {   //req.session中含有userType时才继续执行
        next();                                                 //执行Authorize后面的函数
    } else {
        Logger.info("Authorize授权未通过，重定向到登录界面");
        res.redirect('/users/login');
    }
};