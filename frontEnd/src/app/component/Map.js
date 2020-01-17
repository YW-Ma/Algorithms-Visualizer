let React = require("react");

class Map extends React.Component{
    render(){
        return (
            <div id="map">
            </div>
        );
    }
    //组件挂载后创建地图
	componentDidMount() {
		// 创建地图实例  
		var BMap = window.BMap;    //add by me（不知道为什么，学长那个不用添加全局变量，到这里却不行）
	    let map = new BMap.Map("map");
		window.map = map;  //commented by me
		// 创建点坐标  
		let point = new BMap.Point(114.3576, 30.5289);
		// 初始化地图，设置中心点坐标和地图级别 
		map.centerAndZoom(point, 13);
		//开启鼠标滚轮缩放
		map.enableScrollWheelZoom(true);
		map.addControl(new BMap.NavigationControl());    
		map.addControl(new BMap.ScaleControl());    
		map.addControl(new BMap.OverviewMapControl());    
		map.addControl(new BMap.MapTypeControl());    
		map.setCurrentCity("大学");
		let localSearch = new BMap.LocalSearch(map, {
			renderOptions: {map: map,panel: "results"},
			onInfoHtmlSet: this.onInfoHtmlSet.bind(this) //如何获得参数的??
        }); 
        window.localSearch = localSearch;
	}

	//marker设置添加按钮
	onInfoHtmlSet(poi, dom){
		console.log(poi);
		let title = poi.title;
		let point = poi.point;
		let node = dom.parentNode.parentNode;
		let anchor = node.querySelector("a");
		if(anchor)anchor.remove();

		let onClick = ()=>{
			this.addNode(title, point);
		}

		if(node.querySelectorAll("button").length<=0){
			let btn = document.createElement("button");
			let str = document.createTextNode("Add");
			btn.className = "add";
			btn.id="addCity";
			btn.appendChild(str); 
			btn.onclick = onClick;
			node.appendChild(btn);
			return;
		}
		node.querySelector("button").onclick = onClick;
	}
	//add mark point
	addNode(title, point){
        console.log("添加："+title+point);
        let node = {
            name: title,
            lng: point.lng,
            lat: point.lat
        }
        let nodes = this.props.node;
        let index = nodes.findIndex(n=>{
            return n.name === node.name;  //n就代表nodes
        });
        if(index<0){                      //添加结点
            nodes.push(node);
            this.props.updateState(nodes);
        }
	}
}

export default Map;
