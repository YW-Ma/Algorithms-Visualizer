const DB = require('./DB');
const Logger = require('./Logger');


//添加用户
const addUser = ({userid, password,userType }) => new Promise((resolve, reject) => DB.query({
    sql: 'INSERT INTO user(userID, password, userType) VALUES(?, ?, ?);',
    timeout: 10000,
    values: [userid, password, userType],
}).then((data) => {
    if (!data.results || !data.results.affectedRows || data.results.affectedRows !== 1) {
        Logger.info('添加失败！！');
        reject(new Error('失败'));
    } else {
        resolve();
    }
}).catch(err => reject(err)));


//为新用户创建对应的表格
const createUserActionTable=(userid)=>new Promise((resolve,reject)=>DB.query({
    sql:'CREATE TABLE '+'action_'+userid+' (id int(11) NOT NULL AUTO_INCREMENT,actionID int(11) NOT NULL, content varchar(512), type varchar(32),stepID int(11) NOT NULL, visitID int(11) NOT NULL, algorithm varchar(32) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARSET=utf8;',
    timeout:10000,
    //values:['action_'+userid],     为什么这里使用问号替代参数不行？？->只好用参数拼接成sql！！！
}).then((data)=>{
    resolve();                     //不做任何操作
}).catch(err=>reject(err)));


const createUserQuestionTable=(userid)=>new Promise((resolve,reject)=>DB.query({
    sql:'CREATE TABLE '+'que_'+userid+' (id int(11) NOT NULL AUTO_INCREMENT,que varchar(512), ans varchar(512), msg varchar(512),type int(11),visitID int(11) not null,actionID int(11) not null,PRIMARY KEY(id)) DEFAULT CHARSET=utf8;',
    timeout:10000,
    //values:['que_'+userid],     为什么这里使用问号替代参数不行？？->只好用参数拼接成sql！！！
}).then((data)=>{
    resolve();                       //不做任何操作
}).catch(err=>reject(err)));

const createUserVisitInfoTable=(userid)=>new Promise((resolve,reject)=>DB.query({
    sql:'CREATE TABLE '+'visitInfo_'+userid+' (visitID int(11) NOT NULL,placesName varchar(1024), seID varchar(512), unvisiableEdgeID varchar(512), PRIMARY KEY(visitID)) DEFAULT CHARSET=utf8;',
    timeout:10000,
}).then((data)=>{
    Logger.info("创建访问信息表返回的结果:"+data);
    resolve();
}).catch(err=>reject(err)));

const saveQue = ({ que, ans, msg,type,visitID,actionID,userid }) => new Promise((resolve, reject) => DB.query({
    sql: 'INSERT INTO que_'+userid+' (que, ans, msg,type,visitID,actionID) VALUES(?, ?, ?, ?, ?, ?);',
    timeout: 10000,
    values: [que, ans, msg, type,visitID,actionID],
}).then((data) => {
    //Logger.info(data);
    if (!data.results || !data.results.affectedRows || data.results.affectedRows !== 1) {
        reject(new Error('失败'));
    } else {
        resolve();
    }
}).catch(err => reject(err)));

//向动作表中插入动作
/*const insertACtion=(userid,actionID,content,type,stepID,visitID,algorithm)=>new Promise((resolve,reject)=>DB.query({
    //sql:'insert into action_'+userid+' (actionID,content,type,stepID,visitID,algorithm) '+'values('+actionID+',\''+content+'\',\''+type+'\','+stepID+','+visitID+',\''+algorithm+'\');',
    sql:'insert into action_'+userid+' (actionID,content,type,stepID,visitID,algorithm) values(?, ?, ?, ?, ?, ?);',
    timeout:10000,
    values:[actionID,content,type,stepID,visitID,algorithm],
}).then((data)=>{
    if (!data.results || !data.results.affectedRows || data.results.affectedRows !== 1) {
        reject(new Error('失败'));
    } else {
        resolve();
    }
}).catch(err=>reject(err)));*/

//使用批量插入解决单条数据插入带来的异步问题
const insertACtion=(userid,values)=>new Promise((resolve,reject)=>DB.query({
    //sql:'insert into action_'+userid+' (actionID,content,type,stepID,visitID,algorithm) '+'values('+actionID+',\''+content+'\',\''+type+'\','+stepID+','+visitID+',\''+algorithm+'\');',
    sql:'insert into action_'+userid+' (actionID,content,type,stepID,visitID,algorithm) values ? ;',
    timeout:10000,
    values:[values],
}).then((data)=>{
    if (!data.results) {
        reject(new Error('失败'));
    } else {
        resolve();
    }
}).catch(err=>reject(err)));


const saveVisitInfo=(userid,visitID,placesName,seID,unvisiableEdgeID)=>new Promise((resolve,reject)=>DB.query({
    sql:'insert into visitInfo_'+userid+' (visitID,placesName,seID,unvisiableEdgeID) values(?, ?, ?, ?) ;',
    timeout:10000,
    values:[visitID,placesName,seID,unvisiableEdgeID],
}).then((data)=>{
    if (!data.results) {
        reject(new Error('失败'));
    } else {
        resolve();
    }
}).catch(err=>reject(err)));


/********************************************************************************** */
//获取用户类型
const getUserTypeByUsidAndPass = (userid, password) => new Promise((resolve, reject) => DB.query({
    sql: 'SELECT * FROM user WHERE userID = ? AND password = ? LIMIT 1;',   //sha1（）用于计算散列值
    timeout: 10000,
    values: [userid, password],
}).then((data) => {
    if (!data.results || data.results.length !== 1) {
        reject(new Error('查询失败'));
    } else {
        resolve(data.results[0].userType);    
    }
}).catch(err => reject(err)));

//找出动作表中最大的visitID
const getMaxVisitID=(userid)=>new Promise((resolve,reject)=>DB.query({
    sql:'select max(visitID) as mMax from action_'+userid,
    timeout:10000,
}).then((data)=>{
   resolve(data.results[0].mMax);   
}).catch(err=>reject(err)));

//获取动作表中的数据（访问数据，而不是具体的动作）
const getActions=(userid)=>new Promise((resolve,reject)=>DB.query({
    sql:'select distinct visitID,algorithm from action_'+userid,
    timeout:10000,
}).then((data)=>{
    resolve(data.results);
}).catch(err=>reject(err)));


//获取全部问题数据
const getQues=(userid)=>new Promise((resolve,reject)=>DB.query({
    sql:'select id,que,ans,msg,type,visitID from que_'+userid,
    timeout:10000,
}).then((data)=>{
   // Logger.info(data);
    resolve(data.results);
}).catch(err=>reject(err)));


const getActionDetails=(userid,visitID)=>new Promise((resolve,reject)=>DB.query({
    sql:'select actionID,content,type,stepID from action_'+userid+' where visitID = ? ;',
    timeout:10000,
    values:[visitID]
}).then((data)=>{
   // Logger.info(data);
    resolve(data.results);
}).catch((err)=>reject(err))); 

const getVisitInfo=(userid,visitID)=>new Promise((resolve,reject)=>DB.query({
    sql:'select placesName,seID,unvisiableEdgeID from visitInfo_'+userid+' where visitID=?',
    timeout:10000,
    values:[visitID]
}).then((data)=>{
    resolve(data.results);
}).catch((err)=>reject(err)));


// exports.getUserByUsid = getUserByUsid;
exports.addUser = addUser;
exports.saveQue = saveQue;
exports.insertAction= insertACtion;
exports.saveVisitInfo= saveVisitInfo;
exports.createUserActionTable=createUserActionTable;
exports.createUserQuestionTable=createUserQuestionTable;
exports.createUserVisitInfoTable=createUserVisitInfoTable;

exports.getUserTypeByUsidAndPass = getUserTypeByUsidAndPass;
exports. getMaxVisitID= getMaxVisitID;
exports.getActions= getActions;
exports.getQues=getQues;
exports.getActionDetails=getActionDetails;
exports.getVisitInfo=getVisitInfo;                     //重绘时使用