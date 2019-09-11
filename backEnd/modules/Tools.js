
// 设置session字段信息
const setSession = (req, key, value) => {
    req.session[key] = value;
};

// 删除session字段信息
const delSession = (req, key) => {
    delete req.session[key];
};
// 设置 cookie
const setCookie = (res, key, value) => {
    res.cookie(key, value, { signed: true, maxAge: 3600 * 1000, httpOnly: true });
};

// 删除token cookie
const delCookie = (res, key) => {
    res.clearCookie(key);
};
// 登录后保存会话
const saveUserSession = (req, { userid,userType }) => {
    setSession(req, 'userID', userid);
    setSession(req, 'userType', userType);
};
// 退出后删除会话
const delUserSession = (req) => {
    delSession(req, 'userID');
    delSession(req, 'userType');
};

exports.setSession = setSession;
exports.delSession = delSession;
exports.setCookie = setCookie;
exports.delCookie = delCookie;
exports.saveUserSession = saveUserSession;
exports.delUserSession = delUserSession;