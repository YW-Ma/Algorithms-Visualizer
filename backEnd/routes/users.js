var express = require('express');
var router = express.Router();

const Tools = require('../modules/Tools');
const Logger = require('../modules/Logger');
const Authorize = require('../modules/Authorize');
const User = require('../modules/User');


//下面所有的'/'应该是指/users/

/* GET users listing. */   //这里get的'/'应该是指/users/
router.get('/', Authorize, (req, res) => {
  // const { username } = req.session;
  // res.render('index_vc', { title: `用户 ${username}` });
  Logger.info("执行到了/users/");
  res.redirect('/');                    //再重定向到/,由index.js处理
});

/* GET 用户注册 */
router.get('/reg', (req, res) => {    //   /users/reg
  Tools.delUserSession(req);
  res.render('register');
});

/* POST 用户注册 */
router.post('/reg', (req, res) => {    
  const { userid, password1, password } = req.body;
  if (password1 !== password) {
      res.render('register', { info: '密码不一致' });
      return;
  }
  //const name = 'user';
  const userType=0;              //测试阶段默认为学生（０），按理应该从req获取
  User.addUser({userid, password,userType}).then(() => {
      // 成功后保存session即可
      Tools.saveUserSession(req, { userid, userType});
      Logger.info('用户登记成功!');

      //为注册成功的用户创建数据库表
      User.createUserActionTable(userid);
      User.createUserQuestionTable(userid);
      User.createUserVisitInfoTable(userid);

      Logger.info('用户相关表格创建成功!');
      res.redirect('/users');
  }).catch(() => {
      res.render('register', { info: '注册失败' });
  });
});


/* GET 用户登录*/
router.get('/login', (req, res) => {
  Tools.delUserSession(req);
  res.render('login');
});


/* POST 用户登录,对login.pug里面form的响应*/
router.post('/login', (req, res) => {
  const { userid, password } = req.body;
  User.getUserTypeByUsidAndPass(userid, password).then((data) => {
      // 登陆成功后保存session即可
      const userType = data;
      Tools.saveUserSession(req, { userid, userType });        //session会保存到数据库中
      Logger.info('用户登陆成功');
      res.redirect('/users');
  }).catch(() => res.render('login', { info: 'fail' }));
});


/* GET 用户退出 */
router.get('/logout', (req, res) => {
  Tools.delUserSession(req);
  res.redirect('/users/login');
});


module.exports = router;
