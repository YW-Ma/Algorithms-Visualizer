import MyRoute from './app/routes/MyRoute';

//引入React
let React = require("react");
let ReactDOM = require("react-dom");

window.showCode="showCode";          //组件间消息传递的标志
window.showAction="showAction";



ReactDOM.render(<MyRoute />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
