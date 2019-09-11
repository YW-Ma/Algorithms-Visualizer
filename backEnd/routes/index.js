const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const encoding = require('encoding');
const iconv = require('iconv-lite');
const { exec } = require('child_process');

const Authorize = require('../modules/Authorize');
const logger = require('../modules/Logger');
const User = require('../modules/User');
const Algo = require('../modules/Algo');


/* GET home page. */　　　　//先取消Authorize验证，方便调试！
router.get('/', Authorize, (req, res, next) => {
  logger.info(`get index from ${process.pid}`);
  const userid = req.session.userID;
  Algo.getAlgos().then(algos => {                //getAlgos()查询结果作为参数给index_vc
      //res.render('index_vc', { userid, algos});   //渲染index_vc界面
      logger.info('alogs:');
      logger.info(algos);
      res.render('interface', { userid, algos});
  }).catch(err => next(new Error(err)));
});


//返回最大的访问编号
router.get('/getVisitID',Authorize,(req,res,next)=>{
    const userid = req.session.userID;
    User.getMaxVisitID(userid).then((data)=>{
    res.json({visitID:data});
    }).catch(()=>{});
});


//返回动作信息（访问记录，而不是具体的动作表）
router.get('/actions',Authorize, (req,res,next)=>{
    const userid = req.session.userID;
    User.getActions(userid).then((data)=>{
        //logger.info(data);
        res.json({actions:data});
    }).catch(()=>{});
});


//返回问题表中的全部内容
router.get('/getQues',Authorize,(req,res,next)=>{
    const userid = req.session.userID;
    User.getQues(userid).then((data)=>{
        //logger.info(data);
        res.json({ques:data});           //返回问题数据
    }).catch(()=>{});
});

//创建EdgeIn,保存到data中(edgeIn.txt)
function createEdgeIn(edgeIn, path1) {
  let a = JSON.parse(edgeIn);
  a = a.map(v => v.join(' '));
  a = a.join('\r\n');
  a = encoding.convert(a, 'GBK');
  // a = iconv.encode(a, 'ascii').toString('ascii');
  console.log('createEdgeIn', a);
  fs.writeFileSync(path1, a);
}
function createPointIn(pointIn, path1) {
  let a = JSON.parse(pointIn);
  a = a.map(v => v.join(' '));
  a = a.join('\r\n');
  a = encoding.convert(a, 'GBK');
  // a = iconv.encode(a, 'us-ascii').toString('ascii');
  console.log('createPointIn', a);

  fs.writeFileSync(path1, a);
}
function createGlobalIn(globalIn, path1) {
  let a = JSON.parse(globalIn);
  a = a.map(v => v.join(' '));
  a = a.join('\r\n');
  a = encoding.convert(a, 'GBK');
  // a = iconv.encode(a, 'ascii').toString('ascii');
  console.log('createGlobalIn', a);

  fs.writeFileSync(path1, a);
}


/* 保存回答的题目 */     //注意，取消回调函数Authorize,否则需要跳转登录不好调试!!!!
router.post('/collectQue', Authorize, (req, res, next) => {
  const userid = req.session.userID;
  var { que, ans, msg,type,visitID,actionID} = req.body;
  type=parseInt(type);
  visitID=parseInt(visitID);
  actionID=parseInt(actionID);
  //const { userid } = req.session;
  //logger.info(usid);
  //logger.info(que);
  //logger.info(ans);
  //logger.info(msg);
  //const userid='123';
  User.saveQue({ que, ans, msg,type,visitID,actionID,userid}).then(() => {
      res.end();
  }).catch(err => next(new Error(`error ${err}`)));
});


/*1.保存动作数据  data */    //注意，取消回调函数Authorize,否则需要跳转登录不好调试!!!!
/*2.保存每一次调用算法时的信息：访问id,输入的所有地点名，在links中设置为不可见的边的id */
//!!!!!!!!!!!!!!!!!!!!!!!!
router.post('/data',Authorize, (req, res, next) => {
  const userid = req.session.userID;
  //const { usid } = req.session;  取消登录，注释此项
  const { edgeIn, pointIn, globalIn, sName, eName, algo,placesName,unvisiableID,repaint } = req.body;
  logger.info(edgeIn);
  logger.info(pointIn);
  logger.info(globalIn);
  logger.info(sName);                    //这个sName只是起点的编号
  logger.info(eName);
  logger.info(algo);
  logger.info(placesName);
  logger.info(unvisiableID);
  logger.info(repaint);

  //const p = path.resolve(__dirname, '../data/', usid);
  const p = path.resolve(__dirname, '../data/', userid);  //临时使用123456代替usid
  if (!fs.existsSync(p)) {
      fs.mkdirSync(p);
  }

  //这几个实际上用不上!!
  createGlobalIn(globalIn, path.resolve(p, 'globalIn.txt'));
  createEdgeIn(edgeIn, path.resolve(p, 'edgeIn.txt'));
  createPointIn(pointIn, path.resolve(p, 'pointIn.txt'));

  //以下直接写edge.txt 和point.txt实际上这样就够了（对于我的DJ算法,by cdz）
  createEdgeIn(edgeIn, path.resolve(p, 'edge.txt'));
  createPointIn(pointIn, path.resolve(p, 'point.txt'));

  const exe = path.resolve(__dirname, '../bin/exe/'+algo);
  const str = `${exe} ${p}/  ${sName}`;   //exe是指定C++程序的位置， p指定文件路径、sName指定起点名字
  logger.info(str);
  //const encodingStr = 'gb2312';   //在linux下cout的编码为utf-8,在wondows下为gbk，没搞懂之前的ＤＦＳ为什么可以使用cp936?????
  var encodingStr='utf-8';
  
  //调用C++程序执行;   exec() 方法用于检索字符串中的正则表达式的匹配
  exec(str, { encoding: 'buffer' }, (error, stdout, stderr) => {
      if (error === null) {
          const resStr = iconv.decode(stdout, encodingStr);
          logger.info(resStr);
          const stepsArray = resStr.split('\n');
          stepsArray.filter(v => v.length > 0);

          //动作数据存入数据库动作表
         /* User.getMaxVisitID('123').then((data)=>{
                let visitID;
                if(!data)
                    visitID=1;
                else   
                    visitID=parseInt(data)+1;
                for(var i=0;i<stepsArray.length-1;i++)           //最后一条数据是空的（不知道为什么）
                {
                    var tmpAction=stepsArray[i].split('\t'); //动作编号　　动作内容　动作类型　　帧编号
                    User.insertAction('123',parseInt(tmpAction[0]),tmpAction[1],tmpAction[2],parseInt(tmpAction[3]),visitID,algo);
                }
          }).catch(()=>{});*/
          //使用批量插入的方式解决单条插入带来的异步问题！！！
          User.getMaxVisitID(userid).then((data)=>{
            let visitID;
            if(!data)
                visitID=1;
            else   
                visitID=parseInt(data)+1;
            var insertVal=new Array();
            for(var i=0;i<stepsArray.length-1;i++)
            {
                var tmpAction=stepsArray[i].split('\t'); //动作编号　　动作内容　动作类型　　帧编号
                insertVal[i]=new Array();
                insertVal[i].push(parseInt(tmpAction[0]));
                insertVal[i].push(tmpAction[1]);
                insertVal[i].push(tmpAction[2]);
                insertVal[i].push(parseInt(tmpAction[3]));
                insertVal[i].push(visitID);
                insertVal[i].push(algo);
            }
            
            if(!repaint)                              //如果不是重绘，才会将访问记录存入数据库
            {
                User.insertAction(userid,insertVal);
                User.saveVisitInfo(userid,visitID,placesName,sName[1],unvisiableID);   //sName:*2*类型
            }
       }).catch(()=>{});

        res.json({ code: 1, steps: stepsArray });
      } 
      else {
          logger.info(`exec error: ${stderr}`);
          next(new Error('error'));
      }
  });
});

/*保存每一次调用算法时的信息：访问id,输入的所有地点名，在links中设置为不可见的边的id */
/*router.post('/visitInfo',(req,res,next)=>{            //移到了post  /data中
    var {visitID,placeName,unvisiableID} = req.body;
    visitID=parseInt(visitID);
    const userid='123';
    User.saveVisitInfo({ userid,visitID,placeName,unvisiableEdgeID}).then(() => {
        res.end();
    }).catch(err => next(new Error(`error ${err}`)));
});*/


//读取代码文件并返回给前端显示
router.post('/code',Authorize, (req,res,next)=>{
   var {codeName}=req.body;
   //console.log("codeName:"+codeName);
   const codePath=path.resolve(__dirname, '../data/','123456',codeName);
   var code=fs.readFileSync(codePath,'utf-8');
   //console.log(code);
   res.send(code);  //返回响应数据
});


//返回某个特定visitID下的全部动作信息
router.post('/actionDetails',Authorize, (req,res,next)=>{
    const userid = req.session.userID;
    var {visitID}=req.body;
    visitID=parseInt(visitID);
    User.getActionDetails(userid,visitID).then((data)=>{
        //logger.info(data);
        res.json({actionDetails:data});
    }).catch(()=>{});
});


//重绘时返回该次算法访问相关数据：搜索的地点、设置为不可见边的编号、起点
router.post('/getVisitInfo',Authorize, (req,res,next)=>{
    const userid = req.session.userID;
    var {visitID}=req.body;
    visitID=parseInt(visitID);
    User.getVisitInfo(userid,visitID).then((data)=>{
        //logger.info(data);
        //logger.info(data);
        res.json({VisitInfo:data[0]});
    }).catch(()=>{});
});


module.exports = router;
