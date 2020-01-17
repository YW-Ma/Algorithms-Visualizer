import MyMenu from "./MyMenu.js";
import {Link} from 'react-router-dom';

//let layer = require("./app/layer/layer.js");
let $=window.jQuery;

let React = require("react");

window.algo = "DFS";  //保存选择的方法

if(!window.algos)
	window.algos = ["DFS","dijkstra"];




class Sidebar extends React.Component{

	//它的属性来自APP类，见index.js
    constructor(props){
        super(props);

        this.MARGIN_LEFT = 150;
        this.RIGHT = 10;

        this.state = {
            right: 0,
            marginLeft: 0,
            search: ""
		};
		
    }
    render(){
        let nodes = this.props.node.map(node=>{
            let v = node.name;
            return <p key={v} onClick={this.nodeClick.bind(this)} onContextMenu={this.ndoeMenuClick.bind(this)}>{v}</p>
		});
		let algoDOM = window.algos.map((v, index)=>{
			//if(index===0)window.algo = v;   注销此句，否则window.algo始终是window.algos的第一个算法
			return <option key={"algo_"+v} value={v}>{v+" Algo"}</option>;
		});

        return (
            <div id="sidebar" style={{marginLeft: this.state.marginLeft+"px"}}>
                <div id="search">
						<input type="text" id="input" value={this.state.search} onChange={this.inputChange.bind(this)}/>
						<button id="searchOK" onClick={this.searchClick.bind(this)}>Query</button>
				</div>
				<div id="nodeList">
                        {nodes}
					</div>
				<div id="algos">
						<select onChange={this.handleSelect.bind(this)}>
							{algoDOM}
						</select>
					</div>
				<div id="confirm">
						<button id="confirmBtn" onClick={this.confirmClick.bind(this)}>Confirm</button>
					</div>
				<div id="reports">
					<Link id="mlink" to="reports">
					<button onClick={()=>{}}>Reports</button>
					</Link>
						
					</div>
				<div id="info">
						<button >Exit</button>
					</div>
                <div className="drawer" style={{right: this.state.right+"px"}} onClick={this.close.bind(this)}></div>
            </div>
        );
	}

	// 选择算法
	handleSelect(event){
		console.log(event.target.value);
		window.algo = event.target.value;
		if(Object.is(window.algo,"dijkstra"))  //dj算法需要显示距离(直接用等号判断相等存在问题，详见http://www.cnblogs.com/liaokaichang/p/7567433.html)
				window.showDis=true;		
	}

    //关闭左栏
    close(){
        if(this.state.right!==0){
            this.setState({
                right: 0,
                marginLeft: 0
            });
        }else{
            this.setState({
                right: -this.RIGHT,
                marginLeft: -this.MARGIN_LEFT
            });
        }
	}
	
    //监听输入框变换
    inputChange(event){
		this.setState({search: event.target.value});
	}
	
    //点击查询按钮
    searchClick(){
        window.map.clearOverlays();
		//let str = this.state.search;   //注：jquery模拟鼠标点击时，不知道为什么无法更新输入框对应的状态(this.state.search)
		let str=$("#input").val();       //为了方便，只好直接使用jquery操作dom
		window.localSearch.search(str);  //百度地图查询的api见Map.js
    }
    //左击 节点
    nodeClick(){

    }
    //右击 节点
    ndoeMenuClick(event){
		event.preventDefault();
		/*
		let nodeTitle = event.target.innerText;
		let that = this;
		let menu = new nw.Menu();
		menu.append(new nw.MenuItem({
			label: '移除',
			click: function(){
                let nodes = that.props.node;
                let index = nodes.findIndex(n=>{
                    return n.name === nodeTitle;
                });
                if(index<0)return;

                nodes.splice(index, 1);
                that.props.updateState(nodes);
			}
		}));
		menu.popup(event.clientX, event.clientY);*/
		
		let nodeTitle = event.target.innerText;
		let that = this;
		let menu = new MyMenu("MyMenu_Node");
		menu.append([{
			label: 'Remove',
			click: function(){
                let nodes = that.props.node;
                let index = nodes.findIndex(n=>{
                    return n.name === nodeTitle;
                });
                if(index<0)return;

                nodes.splice(index, 1);
                that.props.updateState(nodes);
			}
		}]);
		menu.popup(event.clientX, event.clientY);
		
		return false;
	}
	
    //确认节点，点击后要开始搜索路径
    confirmClick(event){
		window.map.clearOverlays();
        window.layer.load(1, {shade: [0.2,'#fff']});
        //清空
        this.props.link.splice(0);
		this.loadLinks();
		setTimeout(()=>this.autoViewport(), 600);
	}
	
	// 导入全部路线
	loadLinks(){
		let that = this;
		async function load(){
			let nodes = Array.from(that.props.node);
			for(let i=0;i<nodes.length;i++){
				let node1 = nodes[i];
				for(let j=i+1;j<nodes.length;j++){
					let node2 = nodes[j];
	
					console.log(node1.name+"--->"+node2.name);
	
					let results = await that.loadLink(node1,node2);
					that.onSearchComplete(results);
				}
			}
		}
		load()
		.then(()=>{
			if(!window.repaint)                      //主注意需要重绘的时候，不要删除弹出层(在自动取消边后会删除)
				window.layer.closeAll();
		})
		.catch(err=>{
			 /* global layer */
            layer.closeAll();
            console.log(err);
			alert(err);
		});
	}
	// 导入路线数据
	loadLink(node1, node2){
		var BMap = window.BMap;    //add my me
		var p1 = new BMap.Point(node1.lng, node1.lat);
		var p2 = new BMap.Point(node2.lng, node2.lat);

		return new Promise((resolve, reject)=>{
			let drivingRoute = new BMap.DrivingRoute(window.map, {renderOptions:{map: null, autoViewport: false}, onSearchComplete:(results)=>{
				//if(drivingRoute.getStatus()!==BMap.BMAP_STATUS_SUCCESS){
					//reject("导入失败");
				//};      getStatus返回状态不正确，尚不知原因，暂时注释此部分
				resolve({results, node1, node2});
			}});
			drivingRoute.search(p1, p2);
		});
	}

	//重写searchRout，使其线性化
	searchRoute(point1, point2){
	}

	// 搜索路线回调函数
	onSearchComplete(resultsObj){
        let results = resultsObj.results;
        let node1 = resultsObj.node1;
        let node2 = resultsObj.node2;
        
		let plan = results.getPlan(0);
		let dis = plan.getDistance(true);
		let route = plan.getRoute(0);
		let path = route.getPath();
		var BMap = window.BMap;    //add my me
		let polyline = new BMap.Polyline(path);
		window.map.addOverlay(polyline);
		
		this.setLink(node1, node2, dis, polyline);
	}

	// 设置路线到 main 的 state
	setLink(node1, node2, dis, polyline){
        let link = this.props.link;
        link.push({node1, node2, dis, polyline});
        this.props.updateState(null, link);
	}
	
	//根据所选node设置最佳视图
	autoViewport(){
		let ndoes = this.props.node;
		//console.log('nodes'+nodes);
		let points = [];
		ndoes.forEach(node=>{
			var BMap = window.BMap;    //add my me
			let point = new BMap.Point(node.lng, node.lat);
			points.push(point);
			//添加marker
			let marker = new BMap.Marker(point, {title: node.name}); 	
			let label = new BMap.Label(node.name, {offset:new BMap.Size(20,-10)});
			marker.setLabel(label);
			window.map.addOverlay(marker);
		});
		let viewport = window.map.getViewport(points);
		window.map.centerAndZoom(viewport.center, viewport.zoom);
	}
}

export default Sidebar;