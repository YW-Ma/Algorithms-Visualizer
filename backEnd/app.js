//*****************************app.js是整个网站的入口文件*****/
//express流程:
//1. 导入相关模块 
//2. 执行过 var app = express() 后 
//使用app.set 设置express内部的一些参数（options） 
//使用app.use 来注册函数，可以简单的认为是向那个tasks的数组进行push操作 
//3. 通过http.createServer 用app来处理请求(此步骤在www中)



//引入模块
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const { Writable } = require('stream');
const app = express(); 

const logger = require('./modules/Logger');
const Configure = require('./modules/Configure'); 
const index = require('./routes/index');
const users = require('./routes/users');

 //压缩响应数据
 app.use(compression());     //此文件中app是express的实例

// 结合morgan和log4js的日志功能
const logStream = new Writable({
    write(chunk) {
        logger.info(chunk.toString());
    },
});

// 设置模板、引擎
//补充：app.set用来设置内部参数
app.set('views', path.join(__dirname, 'views')); // 指定模板文件存放位置(_dirname是当前js文件的路径)
//app.set('views', path.join(__dirname, 'public/build'));          //
app.set('view engine', 'pug');                   // 设置默认的模板引擎
//app.engine('html', require('ejs').renderFile);
//app.set('view engine', 'html');



//临时补充，用来配置跨域
app.all('*', function (req, res, next) {
    //响应头指定了该响应的资源是否被允许与给定的origin共享。*表示所有域都可以访问，同时可以将*改为指定的url，表示只有指定的url可以访问到资源 
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      //允许请求资源的方式
      res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
      res.header("X-Powered-By", ' 3.2.1');
      //res.header("Content-Type", "application/json;charset=utf-8");  //取消此句，否则无法渲染
      next();
    });

// uncomment after placing your favicon in /public  ???
//补充：app.use 可简单认为用来注册回调函数
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(morgan('short', { stream: logStream }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(Configure.secret));



// 根据进程数量决定是否使用数据库保存会话(此项目使用多进程)
if (process.env.multi) {
  // 多进程
  const pool = mysql.createPool(Configure.dbOptions);
  // checkExpirationInterval : How frequently expired sessions will be cleared; milliseconds.
  // expiration: The maximum age of a valid session; milliseconds
  const sessionStore = new MySQLStore({
      checkExpirationInterval: 1 * 1 * 3600 * 1000,
      expiration: 1 * 1 * 3600 * 1000,
  }, pool);

  app.use(session({
      name: 'sid',
      secret: Configure.secret,
      store: sessionStore,
      resave: false,
      saveUninitialized: true,
      // 将会话id保存到浏览器的cookie上
      // maxAge: null 表示关闭浏览器该session就失效
      cookie: {
          httpOnly: true,
          maxAge: null,
      },
  }));
} else {
  // 单进程
  app.use(session({
      name: 'sid',
      resave: false,
      secret: Configure.secret,
      saveUninitialized: true,
      cookie: {
          httpOnly: true,
          maxAge: null,
      },
  }));
}


//应该是把public目录下的文件夹全部暴露到根目录下！！？
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 1 * 24 * 60 * 60 * 1000 }));  //将public下的静态文件暴露给用户
//app.use(express.static(path.join(__dirname, 'public/build')))


app.use('/', index);       //只要与'/'匹配的请求就转由index路由处理
app.use('/users', users);  //由users处理



// catch 404 and forward to error handler
app.use((req, res) => {
    logger.error('Not Found', req.url);
    const err = new Error('Not Found');
    err.status = 404;
    res.statusCode = 404;
    res.render('404');
});

// error handler
app.use((err, req, res, next) => {
    logger.error('ERROR', err);
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
    next();
});

// 处理未捕获异常
process.on('uncaughtException', (err) => {
  logger.fatal('ERROR UNCAUTCH', err);
});

//向外暴露对象app
module.exports = app;







