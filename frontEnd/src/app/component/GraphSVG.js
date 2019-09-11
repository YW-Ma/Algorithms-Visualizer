//import d3 from './d3.v4.min.js';
//window.d3 = d3;
//import $ from 'jquery';  //引入jquery
import Graph from "./Graph.js";
import MyMenu from "./MyMenu.js";
import eventProxy from "../eventProxy.js"
import { assertFunctionParent } from "babel-types";
require('../../assets/play.png');
require('../../assets/pause.png');
let React = require('react');


//readme: 学长的代码中node的改变是通过state.S_NODE实现，edge(颜色)的改变是通过this.props.link实现!!!!!
//经补充修改后，边上路径长度的改变通过state.S_EDGE实现
   
//import stepData from "./testData.js";
let $=window.jQuery;
let stepData = null;
let _name = [];     //存储点名
//let STEP_COUNT = 0;　　　//学长以STEP_COUNT记录每一个动作的编号（是动作不是帧！！）->改为每一帧的编号
let actionStep={};        //用于存储步骤动作信息,eg:   {3:[3,4,5,6]}表示第三帧包含动作3、4、５、６
let STEP_COUNT=1;         //全局记录当前演示的帧数
window.question = true;

class GraphSVG extends React.Component{
    //其属性来自Panel...this.pros的传递,包括updtaState、node、link
    constructor(props){
        super(props);
        this.state = {};

        //注意：关于点、边的颜色
        //ＤＦＳ后台传递的颜色：初始化边表示（１０，１０，１０），初始点表示(91,155,2１3),选中点边表示（255,0,0）
        //DJ后台传递颜色:初始化边（１０，１０，１０），初始化点（９１，１５５，２１３），

        this.DEFAULT_LINK_COLOR = "#3a6bdb";  //默认是(浅蓝色)
        this.INITIAL_LINK_COLOR = "#0a0a0a";   //初始化后边的颜色
        this.INITIAL_NODE_COLOR = "#5B9BD5";  //初始化后点的颜色
        this.SELECTED_LINK_COLOR = "#ff0000";   //选中的边，红色
        this.SELECTED_NODE_COLOR = "#ff0000";   //选中的点     
       
        //this.path = null;

        this.state.speed = 0.5;
        this.state.play = "stop";
        this.state.start = "";
        this.state.end = "";
        this.state.S_NODE = new Map(); //更新点的颜色;　　　　　　　　　Map是一组键值对的结构，具有极快的查找速度(误以为是Map.js导出的Map类)
        this.state.S_EDGE = new Map();  //更新边的距离
        this.state.question= true;
        this.state.S_NODE_DIS=new Map(); //更新点到起点的距离
        this.state.S_NODE_INFO=new Map(); //更新点旁边的其他信息，如显示不等式
    }

    render(){
        this.clcMaxMin();
        let nodes = this.renderNode();
        let links = this.renderLink();

        let controlstate = this.state.play==="play"?"pauseState":"playState";

        return (
            <div id="graphWrap">
                <div id="main">
                    <div style={{width:"100%", height:"100%", backgroundColor:"#FFF"}}>
                        <svg ref="graph" width="100%" height="100%" version="1.1" xmlns="http://www.w3.org/2000/svg" onContextMenu={(e)=>{e.preventDefault();}}>
                            {links}
                            {nodes}
                        </svg>
                    </div>
                </div>
                <div id="tool">
                    <div id="question"> 提问 <input id="question_checkbox" type="checkbox" checked={this.state.question} onChange={this.checkChange.bind(this)}/> </div>
                    <div id="speed" title="速度" onClick={this.changeSpeed.bind(this)}>
                        <div id="speedValue" style={{width: this.state.speed*100+"%"}}></div>
                    </div>
                    <div id="prev" title="上一步" onClick={this.animate_back.bind(this)}></div>
                    <div id="start" title="开始/暂停" className={controlstate} onClick={this.play.bind(this)}></div>
                    <div id="next" title="下一步" onClick={this.animate_forward.bind(this)}></div>
                    <div id="end" title="结束" onClick={this.stop.bind(this)}></div>
                    <div id="reset" title="复位" onClick={this.reSet.bind(this)}></div>
                </div>
            </div>
        );
    }

    //右上角全部复位！
    reSet()
    {    //复位！
        stepData = null;
        _name = [];     //存储点名
        actionStep={};        //用于存储步骤动作信息,eg:   {3:[3,4,5,6]}表示第三帧包含动作3、4、５、６
        STEP_COUNT=1;         //全局记录当前演示的帧数
        window.question = true;

        this.resetColor();

        this.state.speed = 0.5;
        this.state.play = "stop";
        this.state.start = "";
        this.state.end = "";
        this.state.S_NODE = new Map(); //更新点的颜色;　　　　　　　　　Map是一组键值对的结构，具有极快的查找速度(误以为是Map.js导出的Map类)
        this.state.S_EDGE = new Map();  //更新边的距离
        this.state.question= true;
        this.state.S_NODE_DIS=new Map(); //更新点到起点的距离
        this.state.S_NODE_INFO=new Map(); //更新点旁边的其他信息，如显示不等式
    }
    //是否提问状态改变
    checkChange(e){
        window.question = e.target.checked;
        console.log(window.question);
        this.setState({question: !this.state.question});
    }

    clcMaxMin(){
        let max_lng = -Infinity, min_lng = Infinity;
        let max_lat = -Infinity, min_lat = Infinity;

        this.mid_lng = 0;
        this.mid_lat = 0;

        this.props.node.forEach(node=>{
            if(node.lat>max_lat)max_lat = node.lat;
            if(node.lat<min_lat)min_lat = node.lat;

            if(node.lng>max_lng)max_lng = node.lng;
            if(node.lng<min_lng)min_lng = node.lng;
            
            this.mid_lng += node.lng;
            this.mid_lat += node.lat;
        });

        this.max_lng = max_lng;
        this.min_lng = min_lng;

        this.max_lat = max_lat;
        this.min_lat = min_lat;

        this.mid_lng /= this.props.node.length;
        this.mid_lat /= this.props.node.length;
    }

    clcCoordinate(lng, lat){
        let w = this.refs.graph.clientWidth;
        let h = this.refs.graph.clientHeight;

        let margin = 50;

        // w = (w-margin - margin)/(this.max_lat-this.min_lat + 0.001)*(lat-this.min_lat) + margin;
        // h = h - ( (h-margin - margin)/(this.max_lng-this.min_lng + 0.001)*(lng-this.min_lng) + margin ) ;

        w = (w-margin - margin)/(this.max_lng-this.min_lng + 0.001)*(lng-this.min_lng) + margin;
        h = h - ( (h-margin - margin)/(this.max_lat-this.min_lat + 0.001)*(lat-this.min_lat) + margin ) ;

        return [w, h];
    }

    renderNode(){
        let nodes = this.props.node;
        let svg = nodes.map(node=>{
            let [x, y] = this.clcCoordinate(node.lng, node.lat);
            let name = node.name;
            let setSE = this.setSE.bind(this);
            let color = null;
            let distance='';
            let info='';  //显示不等式

            if(this.state.start===node.name){
                color = "#CCFFFF";
            }
             if(this.state.end===node.name){
                color = "#CC6699";
            }
            if(this.state.S_NODE.has(node.name)){
                color = this.state.S_NODE.get(node.name);
            }
            if(this.state.S_NODE_DIS.has(node.name)){
                distance=this.state.S_NODE_DIS.get(node.name);
            }
            if(this.state.S_NODE_INFO.has(node.name)){
                info=this.state.S_NODE_INFO.get(node.name);
            }
            let data = {name, x, y, setSE, color,distance,info};   //把data作为属性传递给Node
            return ( <Node key={"node"+node.name} {...data}/> );   //Node类在此脚本末尾！
            //react利用key来识别组件，它是一种身份标识标识,与props中的属性不同！！！
        });
        return svg;
    }

    renderLink(){
        let links = this.props.link;
        let svg = links.map(link=>{
            if(!link.polyline.isVisible())return;
            let [x1, y1] = this.clcCoordinate(link.node1.lng, link.node1.lat);
            let [x2, y2] = this.clcCoordinate(link.node2.lng, link.node2.lat);
            let s = {
                name: link.node1.name,
                x: x1,
                y: y1,
            };
            let e = {
                name: link.node2.name,
                x: x2,
                y: y2,
            };
            let color = link.polyline.getStrokeColor();
            let dis='';  //边的长度
            for(var edge of this.state.S_EDGE){
                if((link.node1.name===edge[1][0]&&link.node2.name===edge[1][1])||(link.node1.name===edge[1][1]&&link.node2.name===edge[1][0])){
                    dis=edge[0]; //距离赋值
                    break;
                }
            }
           
            console.log(color, link);
            return ( <Link key={"link-"+s.name+"-"+e.name} from={s.name} to={e.name} x1={s.x} y1={s.y} x2={e.x} y2={e.y} color={color} distance={dis}/> );
        });
        return svg;
    }

    changeSpeed(event){
        let p = (event.clientX - this.getLeft(event.target)) / event.target.clientWidth;
        console.log(p);
        this.setState({speed: p});
    }

    play(event){
        if(this.state.play==="stop"){
            this.setState({play: "play"});
            clearTimeout(window.timer);
            this.go();           //go()包含了初始化以及animate
            
        }else if(this.state.play==="pause"){
            this.setState({play: "play"});
            this.animate();     //继续执行

        }else if(this.state.play==="play"){

            this.setState({play: "pause"});
            clearTimeout(window.timer);  //暂停,取消计时器他就不再执行（但是所有状态都保存着<最重要是STEP_COUNT>，下次继续animate即可继续执行）

        }
    }

    stop(){
        clearTimeout(window.timer);
        actionStep.STEP_COUNT = 1;
        this.setState({play: "stop", start: "", end: ""});
         /* global layer */
        layer.msg("结束");
    }

    //消息发布，用于组件间传递代码信息!
    codeChangeHandler(code){
        eventProxy.trigger(window.showCode,code);
    }
    actionGetHandler(actions){
        eventProxy.trigger(window.showAction,actions);
    }

    //执行（包括数据传递给C++以及根据C++回传数据显示），会调用animate
    go(){
        if(!this.state.start || !this.state.end){
            this.setState({play:"stop"});
            return this.stop();
        };

        var that = this;   //this对象在程序中随时会改变，而var that=this之后，that没改变之前仍然是指向当时的this，这样就不会出现找不到原来的对象。

        var edgeIn = [];
        var pointIn = [];
        var globalIn = [];


        _name = [];       //存储点的名字
        var placesName="";

        this.props.node.forEach(node=>{  //提取每个点的经度、维度、编号并存储在pointIn中(C++程序需要输入的点信息)
            _name.push(node.name);
            placesName=placesName+node.name+" ";
            let lng = parseInt(node.lng);
            let lat = parseInt(node.lat);
            let index = '*'+(_name.length-1)+'*'
            pointIn.push([index, lng, lat]);
        });
        pointIn = JSON.stringify(pointIn);

        var start_index = '*'+(_name.findIndex(v=>v===this.state.start))+'*';  //找到起点、终点的编号
        var end_index = '*'+(_name.findIndex(v=>v===this.state.end))+'*';


        globalIn.push([pointIn.length]);     //globalIn代表C++程序输入的参数：点数、？
        globalIn.push([-1000, 1000]);
        globalIn.push([1000, -1000]);
        globalIn = JSON.stringify(globalIn);

        
        that.resetColor();
        let S_NODE = new Map();
        let S_EDGE = new Map();
        let S_NODE_DIS=new Map();
        let S_NODE_INFO=new Map();
        this.setState({S_NODE, S_EDGE,S_NODE_DIS,S_NODE_INFO});  //向 setState() 中传入一个对象来对已有的 state 进行更新。

        var unvisiableID="";                           //记录删除掉的边，用于重绘
        this.props.link.forEach((link,index)=>{        //整理edgeIn(编号、编号、距离),作为C++程序传入参数
            if(!link.polyline.isVisible()){
                unvisiableID=unvisiableID+String(index)+" ";           
                return;
            }
            let n1 = '*'+_name.findIndex(v=>v===link.node1.name)+'*';
            let n2 = '*'+_name.findIndex(v=>v===link.node2.name)+'*';
            edgeIn.push([n1, n2, parseFloat(link.dis, 10)]);
        });
        edgeIn = JSON.stringify(edgeIn);
//////////////////////////////////////////////////////
        window.layer.load(1, {shade: [0.4,'#fff']});
        $.ajax({
            type:"POST",
            url:"http://localhost:3001/data",
            //url:"/data",
            data:{edgeIn:edgeIn,pointIn:pointIn,globalIn:globalIn,sName:start_index,eName:end_index,algo:window.algo,placesName:placesName,unvisiableID:unvisiableID,repaint:window.repaint},
            success: function(json){
                if(window.repaint)                         //如果是重绘,当返回重绘的动作后，置为null，下次才能正常记录访问情况！
                    window.repaint=null;
                //console.log(_name);
                //console.log({start_index, end_index});
                //console.log(json);
                // //stepData包括code、steps  //stepData是C++计算传回的数据,根据stepData,前端做出相应动作
                stepData = json;  //steps的数据是各个动作的含义，比如：	changeNodeColor(2,RGB(255,0,0))	Animation	8
                layer.closeAll();
                
                let actions=[];
                //先读一遍数据，记录每一帧对应的动作编号，便于快进、返回;   同时记录动作内容，用于组件通信
                for(var i=0;i<stepData.steps.length-1;i++){  //暂未搞懂为什么多了一条动作？？？
                    //得到该动作对应帧的编号
                    var stepTemp=stepData.steps[i].split('\t')[3];    
                    //将该动作编号纳入帧编号
                    if(stepTemp in actionStep)
                        actionStep[stepTemp].push(i);
                    else{
                        actionStep[stepTemp]=[];
                        actionStep[stepTemp].push(i);
                    }
                    actions.push(stepData.steps[i].split('\t')[1]);         //存储动作内容
                }
                that.actionGetHandler(actions);                            //动作内容传递给Graphtable组件           

                // 开始动画
                that.animate();   //不能用this，因为ajax中的this已经不在代表外面的组件了!!!
            },
            error: function(){
                layer.closeAll();
                layer.msg("出错, 提交失败");
            }
        });
//////////////////////////////////////////////////////

        // that.animate();

    }

    //执行动画
    //注意：当Question、showHelp、showCode时，之所以return是为了结束当前函数，不再执行当前函数末尾的animate
    //因为在else if中会使用layer，内部接着使用了setTimeout和animate继续下去
    animate(){
        // if(this.state.play!=="play")return;
        //setTimeout(code,millisec), code是要执行的代码，lillisec是遇到setTimer后要等待多少毫秒才执行code!
        //返回数值id，整型，可用于 取消 setTimeout 设置的函数clearTimeout(id)。也就是这个setTimeout的唯一标示符
        window.timer = setTimeout(()=>{

            let step = this.getStep(STEP_COUNT);  //获取一帧的全部数据
            layer.closeAll();
            STEP_COUNT++;
            if(step===null){
                this.stop();
                return;
            }
            let links = this.props.link;  //将要更新的元素
            let S_NODE = this.state.S_NODE;
            let S_EDGE=this.state.S_EDGE;
            let S_NODE_DIS=this.state.S_NODE_DIS;
            let S_NODE_INFO=this.state.S_NODE_INFO;

            for(var i=0;i<step.types.length;i++){
                if(step.types[i]==="changeEdgeColor"){
                    let params = step.infos[i][1].split("(")[1].split(",");
                    params.pop();
                    let color = step.infos[i][1].split("RGB")[1];
                    color = this.chooseColor(color);
                
                    //改变边的颜色
                    let name1 = _name[parseInt(params[0])];
                    let name2 = _name[parseInt(params[1])];
                    links.forEach(link=>{
                        if(link.polyline.isVisible()){
                            if((link.node1.name===name1&&link.node2.name===name2)||(link.node1.name===name2&&link.node2.name===name1)){
                                link.polyline.setStrokeColor(color);
                            }
                        }
                    });
                    //this.props.updateState(null, links);
                }
                else if(step.types[i]==="changeNodeColor"){
                    let idx = step.infos[i][1].split("(")[1].split(",")[0];
                    idx = parseInt(idx);
                    let color = step.infos[i][1].split("RGB")[1];
                    color = this.chooseColor(color);
                    let name = _name[idx];  //找到编号对应的点名
                    S_NODE.set(name,color);  //S_NODE是键值对，改变name对应点的状态
                    //this.setState({S_NODE});
                }
                else if(step.types[i]==="changeEdgeLength"){
                    //"20	changeEdgeLength(0,1,1173)	Animation	2";
                    var params=step.infos[i][1].split('(')[1].split(')')[0].split(','); //获取点编号、边距离
                    let name1 = _name[parseInt(params[0])];  //起点编号
                    let name2 = _name[parseInt(params[1])];　
                   let dis=parseFloat(params[2]);
                   S_EDGE.set(dis,[name1,name2]);
                
                }
                else if(step.types[i]==="changeNodeDist"){
                    var params=step.infos[i][1].split('(')[1].split(')')[0].split(',');
                    let idx=parseInt(params[0]);  //点的编号
                    let distance=parseFloat(params[1]);
                    let name=_name[idx];   //点名
                    S_NODE_DIS.set(name,distance);
                }
                else if(step.types[i]==="showCode"){
                    var that=this;
                    var param=step.infos[i][1].split('(')[1].split(')')[0];
                    var codeName="code"+param+".txt";
                    $.ajax({
                        type:"POST",
                        url:"http://localhost:3001/code",
                        //url:"/code",
                        data:{codeName:codeName},
                        success: function(code){
                        that.codeChangeHandler(code);   //不能用this，因为ajax中的this已经不在代表外面的组件了!!!???
                        },
                        error: function(){
                            console.log('获取代码失败！');
                        }
                    });
                }
                else if(step.types[i]==="showHelp"){
                    let msg = step.infos[i][1].split("(")[1].split(")")[0];
                    layer.msg(msg, {time: this.state.speed *3000 +70});   
                }
                else if(step.types[i]==="Question" && window.question){
                    let actionID=step.infos[i][0];
                    let queType=step.infos[i][1].split('(')[1].split(',')[0];       //问题类型
                    let que=step.infos[i][1].split('(')[1].split(',')[1];        //que对应问题的内容
                    if(que[0]==="*")                    //打个补丁，针对dijkstra提问为：*1*在本次循环后到起点的距离为？　的情况
                    {
                       que=que.replace(/\*/g,"");
                       que=que.replace(que[0],_name[que[0]]);
                    }

                    let ans = step.infos[i][1].split('(')[1].split(',')[2];     //ans对应动作中给出的答案 
                    if(ans[0]==="*"){                    //标准答案，返回的是 *2* 类型
                        ans = ans.replace(/\*/g, "");
                        ans = _name[ans];
                        return this.ask(que, ans, queType,actionID);   
                    }
                    else                                //答案不只一个地点(默认10个和以内),数字转化为文字路径
                    {
                        if(Object.is(window.algo,"dijkstra"))      //dj数字答案直接返回
                            return this.ask(que,ans, queType,actionID);
                        let pathNum=parseInt(ans);
                        let path_num=[];
                        let ans_length=ans.length;
                        while(ans_length>=1)
                        {
                            path_num.push(pathNum%10);
                            pathNum=parseInt(pathNum/10);   //js竟然不能整除!!!
                            ans_length--;
                        }

                        let path_str;
                        for(let i=path_num.length-1;i>=0;i--)
                        {
                            if(i==path_num.length-1)
                                path_str=_name[path_num[i]]+"->";
                            else if(i==0)   
                                path_str=path_str+_name[path_num[i]];
                            else
                                path_str=path_str+_name[path_num[i]]+"->";

                        }
                        return this.ask(que,path_str, queType,actionID);
                    }
                 
                }
                else if(step.types[i]==="showInequality"){
                    var params=step.infos[i][1].split('(')[1].split(')')[0].split(',');
                    let idx=parseInt(params[0]);  //点的编号
                    let info=params[1];
                    let name=_name[idx];   //点名
                    S_NODE_INFO.set(name,info);
                }
                else if(step.types[i]==="InequalityDisapper"){
                    var params=step.infos[i][1].split('(')[1].split(')')[0].split(',');
                    let idx=parseInt(params[0]);  //点的编号
                    let info='';  //将信息（不等式）置空
                    let name=_name[idx];   //点名
                    S_NODE_INFO.set(name,info);
                }     
            }

            //对一帧中的各元素统一进行刷新
            this.props.updateState(null, links);
            //this.setState({S_NODE});
            //this.setState({S_EDGE});
            //this.setState({S_NODE_DIS});
            //this.setState({S_NODE_INFO});
            this.setState({S_NODE,S_EDGE,S_NODE_DIS,S_NODE_INFO});
            this.animate();  //重复执行

        }, this.state.speed *3000 +70);
    
    }

   
    //学长原来是获取每一个动作信息－>此处改为获取每一个步骤(帧)的信息
    getStep(nStep){

        console.log("get step:"+nStep); //读取一帧的数据

        var types=new Array(); //创建数组，用于保存动作信息
        var infos=new Array(); 

        if(nStep in actionStep){
            for(var i=0;i<actionStep[nStep].length;i++){
                let info = stepData.steps[actionStep[nStep][i]].split('\t');  //第ACTION_COUNT条动作信息(作为数组保存在info)                  
                let type = info[1].split('(')[0];   //info[1]代表动作的解释：changeNodeColor(4,RGB(91,155,213))；  则type对应changeNodeColor
                types.push(type);
                infos.push(info);
            }
            return {types, infos};  //返回对象，对象的属性是键值对
        }
        return null;
  
    }

    chooseColor(color){
        switch(color){
            case "(10,10,10))": return this.INITIAL_LINK_COLOR;   //初始化边（接近黑色）
            case "(91,155,213))": return this.INITIAL_NODE_COLOR; //初始化点（接近蓝色)
            case "(255,0,0))": return this.SELECTED_LINK_COLOR;    //选中点、边（红色）
            default: return "#000000";
        }
    }

    checkLink(link, name1, name2){
        let node1 = link.node1;
        let node2 = link.node2;
        if( (node1.name===name1 && node2.name===name2) || (node1.name===name2 && node2.name===name1) ){
            return true;
        }
        return false;
    }

    //重置link颜色
    resetColor(){
        let links = this.props.link;
        links.forEach(link=>{
            if(link.polyline.isVisible())
                link.polyline.setStrokeColor(this.DEFAULT_LINK_COLOR); 
        });
        this.props.updateState(null, links);
    }

    /*获取元素的横坐标*/
    getLeft(e){
        var offset=e.offsetLeft;
        if(e.offsetParent!=null){
        offset+=this.getLeft(e.offsetParent);
        } 
        return offset;
    } 

    //设置起点终点
    setSE(event){
        event.preventDefault();
        event.stopPropagation();
        let that = this;
        let name = event.target.attributes.id.value.split("_").pop();
		/*
		let menu = new nw.Menu();
		menu.append(new nw.MenuItem({
			label: '设为起点',
			click: function(){
                that.setState({start: name});
			}
		}));
		menu.append(new nw.MenuItem({
			label: '设为终点',
			click: function(){
                that.setState({end: name});
			}
		}));
		menu.popup(event.clientX, event.clientY);*/
		let menu = new MyMenu("MyMenu_Node_SVG");
		menu.append([{
			label: '设为起点',
			click: function(){
                that.setState({start: name});
			}
        },{
			label: '设为终点',
			click: function(){
                that.setState({end: name});
			}
        }]);
        menu.popup(event.clientX, event.clientY);
		
		return false;
    }

    //提问
    ask(que, msg,type,actionID){             //msg是标准答案(转换后的)
        clearTimeout(window.timer);
        let that = this;
        window.layer.prompt({title: que}, function(text, index){
            layer.closeAll();
            var visitID=-1;
            //答对答错都要保存结果(不是重绘的时候才保存！！！)
           if(!window.repaint)              
           {
            $.ajax({                      //需要先从动作表获得最大visitID(因为可能取消了问题而不保存在que表中)
                type:"GET",
                url:'http://localhost:3001/getVisitID',
                //url:"/collect",
                data:{},
                success: function(json){
                    visitID=parseInt(json.visitID);
                    $.ajax({                            //ajax是异步的，为了保持同步，保存题目需要写在查询visitID的回调函数中
                        type:"POST",
                        url:'http://localhost:3001/collectQue',
                        //url:"/collect",
                        data:{que:que,ans:text,msg:msg,type:type,visitID:visitID,actionID:actionID},
                        success: function(json){
                        },
                        error: function(){
                        }
                    });
                },
                error: function(){
                }
            });
           }
            if(text!=msg){
                window.layer.msg('正确答案：'+msg, {time: 1000});
                setTimeout(()=>{
                    that.animate();
                }, 1100);
            }else{
                window.layer.msg('答对了！', {time: 1000});
                that.animate();
            }
        } );
    }

  

   //**************************************************** by cdz
    //执行动作：根据STEP_COUNT执行！！！
    //注意：当Question、showHelp、showCode时，之所以return是为了结束当前函数，不再执行当前函数末尾的animate
    //因为在else if中会使用layer，内部接着使用了setTimeout和animate继续下去


   //倒退:为了减少不必要的理解错误，只能倒退到点和边初始化完成以后
   animate_back(){
    //不管处于什么状态，都使其暂停
    this.setState({play: "pause"});
    clearTimeout(window.timer);
    layer.closeAll();
   

    STEP_COUNT--;
    let back_step = this.getStep(STEP_COUNT);              //获取上一帧的信息
    if(back_step===null){
        this.stop();
        return;
    }

    let links = this.props.link;                          //将要更新的元素
    let S_NODE = this.state.S_NODE;
    let S_EDGE=this.state.S_EDGE;
    let S_NODE_DIS=this.state.S_NODE_DIS;
    let S_NODE_INFO=this.state.S_NODE_INFO;

    for(var i=0;i<back_step.types.length;i++){           //扫描一帧的内容
        console.log(back_step.infos[i])
        if(back_step.types[i]==="changeEdgeColor"){
            let params = back_step.infos[i][1].split("(")[1].split(",");
            params.pop();
            //let color =back_step.infos[i][1].split("RGB")[1];
            let color = this.INITIAL_LINK_COLOR;                //状态返回，即后退
            
            //改变边的颜色
            let name1 = _name[parseInt(params[0])];
            let name2 = _name[parseInt(params[1])];
            links.forEach(link=>{
                if(link.polyline.isVisible()){
                    if((link.node1.name===name1&&link.node2.name===name2)||(link.node1.name===name2&&link.node2.name===name1)){
                        link.polyline.setStrokeColor(color);
                    }
                }
             });
                //this.props.updateState(null, links);
            }
        else if(back_step.types[i]==="changeNodeColor"){
            let idx = back_step.infos[i][1].split("(")[1].split(",")[0];
            idx = parseInt(idx);
            //let color = back_step.infos[i][1].split("RGB")[1];
            let color = this.INITIAL_NODE_COLOR;
            let name = _name[idx];  //找到编号对应的点名
            S_NODE.set(name,color);  //S_NODE是键值对，改变name对应点的状态
            //this.setState({S_NODE});
            }

        else if(back_step.types[i]==="changeEdgeLength"){
            //"20	changeEdgeLength(0,1,1173)	Animation	2";
            var params=back_step.infos[i][1].split('(')[1].split(')')[0].split(','); //获取点编号、边距离
            let name1 = _name[parseInt(params[0])];  //起点编号
            let name2 = _name[parseInt(params[1])];　
            let dis=parseFloat(params[2]);
             S_EDGE.set(dis,[name1,name2]); 
        }
         else if(back_step.types[i]==="changeNodeDist"){
            var params=back_step.infos[i][1].split('(')[1].split(')')[0].split(',');
            let idx=parseInt(params[0]);  //点的编号
            let distance=parseFloat(params[1]);
            let name=_name[idx];   //点名
            S_NODE_DIS.set(name,distance);
        }
        else if(back_step.types[i]==="showCode"){
            var that=this;
            var param=back_step.infos[i][1].split('(')[1].split(')')[0];
            var codeName="code"+param+".txt";
            $.ajax({
                    type:"POST",
                    url:"http://localhost:3001/code",
                    //url:"/code",
                    data:{codeName:codeName},
                    success: function(code){
                    that.codeChangeHandler(code);   //不能用this，因为ajax中的this已经不在代表外面的组件了!!!???
                    },
                    error: function(){
                        console.log('获取代码失败！');
                    }
            });
        }
        else if(back_step.types[i]==="showHelp"){
            let msg =back_step.infos[i][1].split("(")[1].split(")")[0];
            layer.msg(msg, {time: this.state.speed *3000000 +70});  //无限停留
        }
        else if(back_step.types[i]==="Question" && window.question){
            let que = back_step.infos[i][2];
             let ans = back_step.infos[i][3];
             if(ans[0]==="*"){
                 ans = ans.replace(/\*/g, "");
                 ans = _name[ans];
             }
            return this.ask(que, ans);   
        }
         else if(back_step.types[i]==="showInequality"){
            var params=back_step.infos[i][1].split('(')[1].split(')')[0].split(',');
            let idx=parseInt(params[0]);  //点的编号
            let info=params[1];
            let name=_name[idx];   //点名
            S_NODE_INFO.set(name,info);
         }
         else if(back_step.types[i]==="InequalityDisapper"){
            var params=back_step.infos[i][1].split('(')[1].split(')')[0].split(',');
            let idx=parseInt(params[0]);  //点的编号
            let info='';  //将信息（不等式）置空
            let name=_name[idx];   //点名
            S_NODE_INFO.set(name,info);
        }
            
    }
    //对一帧中的各元素统一进行刷新
    this.props.updateState(null, links);
    //this.setState({S_NODE});
    //this.setState({S_EDGE});
    //this.setState({S_NODE_DIS});
    //this.setState({S_NODE_INFO});
    this.setState({S_NODE,S_EDGE,S_NODE_DIS,S_NODE_INFO});
}

    
   //前进
   animate_forward(){
        //不管处于什么状态，都使其暂停
    this.setState({play: "pause"});
    clearTimeout(window.timer);
    layer.closeAll();

    STEP_COUNT++;
    let forward_step = this.getStep(STEP_COUNT);
    if(forward_step===null){
        this.stop();
        return;
    }

    let links = this.props.link;  //将要更新的元素
    let S_NODE = this.state.S_NODE;
    let S_EDGE=this.state.S_EDGE;
    let S_NODE_DIS=this.state.S_NODE_DIS;
    let S_NODE_INFO=this.state.S_NODE_INFO;

    for(var i=0;i<forward_step.types.length;i++){
        if(forward_step.types[i]==="changeEdgeColor"){
            let params = forward_step.infos[i][1].split("(")[1].split(",");
            params.pop();
            let color =forward_step.infos[i][1].split("RGB")[1];
            color = this.chooseColor(color);
            
            //改变边的颜色
            let name1 = _name[parseInt(params[0])];
            let name2 = _name[parseInt(params[1])];
            links.forEach(link=>{
                if(link.polyline.isVisible()){
                    if((link.node1.name===name1&&link.node2.name===name2)||(link.node1.name===name2&&link.node2.name===name1)){
                        link.polyline.setStrokeColor(color);
                    }
                }
             });
                //this.props.updateState(null, links);
            }
        else if(forward_step.types[i]==="changeNodeColor"){
            let idx = forward_step.infos[i][1].split("(")[1].split(",")[0];
            idx = parseInt(idx);
            let color =forward_step.infos[i][1].split("RGB")[1];
            color = this.chooseColor(color);
            let name = _name[idx];  //找到编号对应的点名
            S_NODE.set(name,color);  //S_NODE是键值对，改变name对应点的状态
            //this.setState({S_NODE});
            }
        else if(forward_step.types[i]==="changeEdgeLength"){
            //"20	changeEdgeLength(0,1,1173)	Animation	2";
            var params=forward_step.infos[i][1].split('(')[1].split(')')[0].split(','); //获取点编号、边距离
            let name1 = _name[parseInt(params[0])];  //起点编号
            let name2 = _name[parseInt(params[1])];　
            let dis=parseFloat(params[2]);
             S_EDGE.set(dis,[name1,name2]); 
        }
         else if(forward_step.types[i]==="changeNodeDist"){
            var params=forward_step.infos[i][1].split('(')[1].split(')')[0].split(',');
            let idx=parseInt(params[0]);  //点的编号
            let distance=parseFloat(params[1]);
            let name=_name[idx];   //点名
            S_NODE_DIS.set(name,distance);
        }
        else if(forward_step.types[i]==="showCode"){
            var that=this;
            var param=forward_step.infos[i][1].split('(')[1].split(')')[0];
            var codeName="code"+param+".txt";
            $.ajax({
                    type:"POST",
                    url:"http://localhost:3001/code",
                    //url:"/code",
                    data:{codeName:codeName},
                    success: function(code){
                    that.codeChangeHandler(code);   //不能用this，因为ajax中的this已经不在代表外面的组件了!!!???
                    },
                    error: function(){
                        console.log('获取代码失败！');
                    }
            });
        }
        else if(forward_step.types[i]==="showHelp"){
            let msg =forward_step.infos[i][1].split("(")[1].split(")")[0];
            layer.msg(msg, {time: this.state.speed *300000 +70});  //无限停留
        }
        else if(forward_step.types[i]==="Question" && window.question){
            let que = forward_step.infos[i][2];
             let ans = forward_step.infos[i][3];
             if(ans[0]==="*"){
                 ans = ans.replace(/\*/g, "");
                 ans = _name[ans];
             }
            return this.ask(que, ans);   
        }
         else if(forward_step.types[i]==="showInequality"){
            var params=forward_step.infos[i][1].split('(')[1].split(')')[0].split(',');
            let idx=parseInt(params[0]);  //点的编号
            let info=params[1];
            let name=_name[idx];   //点名
            S_NODE_INFO.set(name,info);
         }
         else if(forward_step.types[i]==="InequalityDisapper"){
            var params=forward_step.infos[i][1].split('(')[1].split(')')[0].split(',');
            let idx=parseInt(params[0]);  //点的编号
            let info='';  //将信息（不等式）置空
            let name=_name[idx];   //点名
            S_NODE_INFO.set(name,info);
        }
            
    }
    //对一帧中的各元素统一进行刷新
    this.props.updateState(null, links);
    //this.setState({S_NODE});
    //this.setState({S_EDGE});
    //this.setState({S_NODE_DIS});
    //this.setState({S_NODE_INFO});
    this.setState({S_NODE,S_EDGE,S_NODE_DIS,S_NODE_INFO});


}

}


class Node extends React.Component{
    constructor(props){
        super(props);
        this.SELECT_COLOR = "#300";
        this.DEFAULT_COLOR = "#3C9";
    }

    //<g>元素通常用来对相关图形元素进行分组
    //onContextMenu：对应右击鼠标的响应事件
    render(){
        return (
            <g id={"node_"+this.props.name} onContextMenu={this.props.setSE}>
                <circle id={"node_circle_"+this.props.name} cx={this.props.x} cy={this.props.y} r={this.props.r || 20} fill={this.props.color ||　this.DEFAULT_COLOR}></circle>
                <text id={"node_text_"+this.props.name} x={this.props.x} y={this.props.y} fill="black" textAnchor="middle" dominantBaseline="middle" style={{fontSize: "13px"}}>{this.props.hide || this.props.name}</text>
                <text id={"node_value"+this.props.name} x={this.props.x} y={this.props.y+10} fill="black" textAnchor="middle" dominantBaseline="middle" fontSize='13px' fill='blue'>{this.props.distance}</text>
                <text id={"node_value"+this.props.name} x={this.props.x+40} y={this.props.y-5} fill="black" textAnchor="middle" dominantBaseline="middle" fontSize='13px' fill='black'>{this.props.info}</text>
            </g>
        );
    }
    hover(event){
        console.log(event.target.attributes.fill);
        console.log(event.target.attributes);
        let attributes = event.target.attributes;
    }
}

class Link extends React.Component{

    constructor(props){
        super(props);
        this.SELECT_COLOR = "#900";
        this.DEFAULT_COLOR = this.props.color;
    }
    render(){
        this.DEFAULT_COLOR = this.props.color;
         return (
            <g id={"link_"+this.props.from+"_"+this.props.to}>
                 <line x1={this.props.x1} y1={this.props.y1} x2={this.props.x2} y2={this.props.y2} stroke={this.props.color} strokeWidth="5" style={{cursor: "pointer"}} onMouseEnter={this.hover.bind(this)} onMouseLeave={this.hover.bind(this)}/>
                 <text x={(this.props.x1+this.props.x2)/2} y={(this.props.y1+this.props.y2)/2}  style={{fontSize:"15px"}}>{this.props.distance}</text>
             </g>
        );
    }
    hover(event){
        let attributes = event.target.attributes;
        attributes.stroke.value===this.SELECT_COLOR ? attributes.stroke.value=this.DEFAULT_COLOR : attributes.stroke.value=this.SELECT_COLOR;
    }
}

export default GraphSVG;