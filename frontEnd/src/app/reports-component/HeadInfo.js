import eventProxy from "../eventProxy.js";
import {Link} from 'react-router-dom';
let React = require("react");
const $=window.jQuery;  


class HeadInfo extends React.Component{

    render(){
        let username=window.username;
        return(
            <div id="headArea">
                <div id="userInfo">
                    <label className="infoBar">用户名:</label>
                    <label className='infoBar'>{username}</label>
                    <br/>
                    <label className="infoBar">时间:</label>
                    <Clock />
                    <br/>
                    <label className="infoBar">内容：</label>
                    <select id="contentType" onChange={this.onSelectChange.bind(this)}>
                        <option value ="action">动作</option>
                        <option value ="que">问题</option>
                    </select>
                    <br/>
                    <Link className="infoBar" to={{pathname:'/',state:{panel:'open'}}}><button id="retButton">返回主界面</button></Link>
                </div>
            </div>
        );
    }

    onSelectChange(){
        let contentType=$('#contentType option:selected').val();
        this.selectChangeHandler(contentType);
    }
    //组件间通信，发送消息告知选择的类型
    selectChangeHandler(contentType){
        eventProxy.trigger(window.contentType,contentType);
    }
}


class Clock extends React.Component{
    constructor(props){
        super(props);
        this.state={data:new Date()};
    }

    componentDidMount(){        //挂载时设置定时器
        this.timerID=setInterval(
            ()=>this.tick(),
            1000
        );
    }

    componentWillUnmount(){    //卸载
        clearInterval(this.timerID);
    }

    //通过更新状态进行计时
    tick(){
        this.setState({
            data:new Date()
        });
    }

    render(){
        return(
                <label className="infoBar">{this.state.data.toLocaleTimeString()}</label>
        );
    }
}




export default HeadInfo;