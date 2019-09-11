import eventProxy from "../eventProxy.js"
import {Link} from 'react-router-dom';
let React = require("react");
//const $=window. window.jQuery;  
//const jsdom = require('jsdom');          
//const { JSDOM } = jsdom;
//const { document } = (new JSDOM('<!doctype html><html><body></body></html>')).window;
//global.document = document;
//global.window = document.defaultView;
//const $ = require('jquery')(window);
const $=window. window.jQuery;              //node.js添加jquery失败了，改为在index.html中cdn引入

let actions;

class BodyInfo extends React.Component{
    constructor(props){
        super(props);
        this.state={
            content:"action"    
        };   //默认显示动作表
        this.onSelectChange=this.onSelectChange.bind(this);  //如果你不绑定方法，那么在事件发生并且精确调用这个方法时，方法内部的this会丢失指向。
    }

    render()
    {
        let content=this.setContent();
        return(
            <div id="bodyArea">
              {content}
            </div>
        );
    }

    onSelectChange(contentType){  
        this.setState({content:contentType});
    }

    componentDidMount(){                             //挂载时开始监听
        eventProxy.on(window.contentType,this.onSelectChange);  
    }

    setContent(){
        switch(this.state.content){
            case "action":
                return this.renderAction();
                break;
            case "que":
                return this.renderQue();
                break;
        }
        return "ERROR";
    }

    //显示访问记录（每一次的动作只显示一栏!!!!，展开之后才显示详细动作）
    renderAction(){
        //let actions;
        $.ajax({
            url:"http://localhost:3001/actions",
            type:'GET',
            data:{},
            async:false,                         //同步！！
            success:function(json){
                actions=json.actions;
                //alert(actions[0].visitID);
            },
            error:function(){
                alert('获取访问记录信息失败!');
            }
        });
       

        let tableContent=actions.map((action,index)=>{
            return(
                <tr key={index} id={'visit'+index}>
                    <td align="center">{action.visitID}</td>
                    <td align="center">{action.algorithm}</td>
                    <td align="center"><ButtonSpread visitID={action.visitID} trID={'visit'+index}/></td>
                    <td align="center"><ButtonRenew visitID={action.visitID}/></td>
                </tr>
            )
        });

        return(
            <table id="mtable" border="1">
            <thead>
                <tr>
                    <th>访问序号</th>
                    <th>算法</th>
                    <th>展开/收起</th>
                    <th>场景再现</th>
                </tr>
            </thead>
           
            <tbody>
                {tableContent}
            </tbody>
                
            </table>
        );
    }


    renderQue(){
        let ques;
        $.ajax({
            url:"http://localhost:3001/getQues",
            type:'GET',
            data:{},
            async:false,                         //同步！！
            success:function(json){
                ques=json.ques;
            },
            error:function(){
                alert('获取访问记录信息失败!');
            }
        });

        let quesContent=ques.map((que,index)=>{
            var judge="正确";
            if(que.msg!=que.ans)
                judge="错误";
            return(
                <tr key={index}>
                    <td>{que.id}</td>
                    <td>{que.type}</td>
                    <td>{que.que}</td>
                    <td>{que.msg}</td>
                    <td>{que.ans}</td>
                    <td>{judge}</td>
                    <td>{que.visitID}</td>
                    <td><ButtonRenew visitID={que.visitID}/></td>
                </tr>
            );
        });

        return(
            <table id="mtable" border="1">
                <thead>
                    <tr>
                        <th>序号</th>
                        <th>类型</th>
                        <th>问题</th>
                        <th>回答</th>
                        <th>答案</th>
                        <th>正误</th>
                        <th>访问号</th>
                        <th>情景再现</th>
                    </tr>
                </thead>
                <tbody>
                    {quesContent}
                </tbody>
            </table>
        );
    }
}


//点击这个按钮展开动作表
class ButtonSpread extends React.Component{
     //需要有一个属性：visitID,用于查询动作信息
     //需要有一个属性:trID,即该行表格的id，用于在该表格后面添加展开的表格
    constructor(props){  
        super(props);
        this.state={
            isQueryed:false,                  //是否已经查询数据库
            isSpreaded:false,                 //是否已经展开
        }
    }

    render(){
        let text="展开";
        if(this.state.isSpreaded)
            text="收起";
        return(
            <button onClick={this.onClickButton.bind(this)}>{text}</button>
        );
    }

    onClickButton(){
        if(this.state.isQueryed)         //如果已经查询过数据库，直接显示内容
        {
            if(this.state.isSpreaded) //如果已经展开，直接隐藏
            {
                $('#table'+this.props.visitID).hide();
                this.setState({isSpreaded:false});
            }
            else{                    //尚未展开，显示内容
                $('#table'+this.props.visitID).show();
                this.setState({isSpreaded:true});
            }
        }
        else             //尚未查询数据库，查询数据并添加内容
        {
            let visitID=this.props.visitID;
            let actionDetails;
            $.ajax({
                url:'http://localhost:3001/actionDetails',
                type:'POST',
                data:{visitID},
                async:false,
                success:function(json){
                    actionDetails=json.actionDetails;
                },
                error:function(){
                    alert("获取动作表信息失败!");
                }
            });
            //alert(actionDetails[0].content);
            let addTableHead="<thead><tr>  <th>动作号</th> <th>内容</th> <th>动作类型</th> <th>帧号</th>  </tr></thead>";
            let addTableBodyContent='';
            actionDetails.map((action,index)=>{
                let line="<tr key="+index+">";
                line+="<td>"+action.actionID+"</td>";
                line+="<td>"+action.content+"</td>";
                line+="<td>"+action.type+"</td>";
                line+="<td>"+action.stepID+"</td>";
                line+="</tr>";
               addTableBodyContent+=line;
            });
            let addTableBody='<tbody>'+addTableBodyContent+'</tbody>';
            let addTable='<table id=table'+this.props.visitID+' border=1>'+addTableHead+addTableBody+'</table>';
            $('#'+this.props.trID).after(addTable);
            this.setState({isQueryed:true});
            this.setState({isSpreaded:true});
        }
    }


}


//点击按钮跳回算法演示界面
class ButtonRenew extends React.Component{
    constructor(props)
    {
        super(props);
        //this.props.visitID, 含有这个属性，用于传递访问编号，页面跳转后读取数据库，演示动作
    }

    render(){
        //let visitID=this.props.visitID;
        return(
            //<Link to={{pathname:'/',state:{panelState:'open',visitID:visitID}}}><button  onClick={this.onBtnClick.bind(this)}>进入</button></Link>
            <Link to={{pathname:'/'}}><button  onClick={this.onBtnClick.bind(this)}>进入</button></Link>
        );
    }

    onBtnClick()
    {
        window.repaintVisitID=this.props.visitID;            //用于重绘时读取搜索记录
        window.repaint=true;
    }
}

export default BodyInfo;