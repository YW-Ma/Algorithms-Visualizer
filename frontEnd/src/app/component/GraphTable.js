import eventProxy from "../eventProxy.js"
let React = require('react');


//let node = [], link = [];  用不上
//let selectLink;


//关于显示代码：此组件作为消息订阅者!
class GraphTable extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            tab: 1,
            code:'',
            actions:[]
        };
        this.SELECTED_LINK_COLOR = "#ff0000";
        this.DEFAULT_LINK_COLOR = "#3a6bdb";
        this.onShowCode=this.onShowCode.bind(this);  //绑定消息监听函数
        this.onShowAction=this.onShowAction.bind(this);  //如果你不绑定方法，那么在事件发生并且精确调用这个方法时，方法内部的this会丢失指向。
    }
   
    render(){
        let content = this.setContent(this.props); //props继承自panel，而panel的props来自App
        return ( 
            <div style={{width: '100%', height:'100%'}}>
                <div id="tab">
                    <div style={{backgroundColor:this.state.tab===1?"#999":"#CCC"}} onClick={this.setPTab.bind(this)}>Vertex</div>
                    <div style={{backgroundColor:this.state.tab===2?"#999":"#CCC"}} id="edge" onClick={this.setLTab.bind(this)}>Edge</div>
                    <div style={{backgroundColor:this.state.tab===3?"#999":"#CCC"}} onClick={this.setMatrixTab.bind(this)}>Matrix</div>
                    <div style={{backgroundColor:this.state.tab===4?"#999":"#CCC"}} onClick={this.setCodeTab.bind(this)}>Codes</div>
                    <div style={{backgroundColor:this.state.tab===5?"#999":"#CCC"}} onClick={this.setActionTab.bind(this)}>Steps</div>
                </div>
                <div id="tabContent">{content}</div>
            </div>
        );
    }

    ///当GraphSVG组件传递代码过来时，调整tab状态，使其处于代码显示栏，同时更新代码
    onShowCode(code){  
        //this.setState({tab:4});  //更新tab状态则会自动跳转到代码栏
        this.setState({code:code});
    }

    onShowAction(actions)
    {
        //this.setState({tab:5});
        this.setState({actions:actions});
    }
    
    componentDidMount(){
        eventProxy.on(window.showCode,this.onShowCode);     //window.showCode见index.js
        eventProxy.on(window.showAction,this.onShowAction);  
    }

    //点击“顶点”
    setPTab(){
        this.setState({
            tab: 1
        });
    }
    //点击“边”
    setLTab(){
        this.setState({
            tab: 2
        });
    }

    //点击"矩阵"
    setMatrixTab()
    {
        this.setState({
            tab:3
        });
    }

    //点击“代码”
    setCodeTab(){
        this.setState({
            tab:4
        });
    }

    //点击"动作"
    setActionTab()
    {
        this.setState({
            tab:5
        });
    }

    //点击菜单后渲染
    setContent( {node, link} ){
        switch(this.state.tab){
            case 1:
                //顶点
                return this.renderPoint(node);
                break;
            case 2:
                //边
                return this.renderLink(link);
                break;
            case 3:
                return this.renderMatrix(node,link);
                break;
            case 4:
                return this.renderCode();
                break;
            case 5:
                return this.renderAction();
                break;
        }
        return "ERROR";
    }

    renderPoint(nodes){
        let td = nodes.map(node=>{
            return (
                <tr key={node.name}>
                    <td>{node.name}</td>
                    <td>{node.lng}</td>
                    <td>{node.lat}</td>
                </tr>
            );
        });
        return (
            <table>
                <thead>
                    <tr>
                        <th>VertexName</th>
                        <th>Longitude</th>
                        <th>Latitude</th>
                    </tr>
                </thead>
                <tbody>
                    {td}
                </tbody>
            </table>
        );
    }
    renderLink(links){     //index应该是link元素在links中的索引
        let td = links.map((link, index)=>{
            let ifVisible = link.polyline.isVisible();
            let color = link.polyline.getStrokeColor();
            let ifHighlight = color === this.SELECTED_LINK_COLOR;

            return (
                <tr key={link+"-"+index} onClick={this.highlightLink(link).bind(this)} style={{backgroundColor:ifHighlight?"#DDD":"#FFF"}}>
                    <td>{link.node1.name+" -> "+link.node2.name}</td>
                    <td>{link.dis}</td>
                    <td id={"link_"+index} onClick={this.setLink(link).bind(this)}>{ifVisible?"Yes":"No"}</td>
                </tr>
            );
        });

        return (
            <table>
                <thead>
                    <tr>
                        <th>Route</th>
                        <th>Distance</th>
                        <th>Select (Y/N)</th>
                    </tr> 
                </thead>
                <tbody>
                    {td}
                </tbody>
            </table>
        );
    }
   

    renderMatrix(nodes,links)
    {
        const nodataGrid=<th></th>;               //空格
        let horizonMatrxHead=nodes.map(node=>{　　//第一排表头
                return(
                    <th>{node.name}</th>
                );
        });
        let maxtrixContent=nodes.map(node=>{     //表格内容
            let headName=<th>{node.name}</th>;
        
            let name1=node.name;
            let dists=nodes.map(node=>{
                let dist;
                let flag=0;
                for(var i=0;i<links.length;i++)
                {
                    if(links[i].polyline.isVisible() && (name1==links[i].node1.name && node.name==links[i].node2.name)||(name1==links[i].node2.name && node.name==links[i].node1.name))
                    {
                        dist=links[i].dis;
                        flag=1;
                    }
                }
                if(flag==1)                //两个点相连
                    return(
                        <td align="center">{dist}</td>
                    );
                else
                        return(
                            <td align="center">∞</td>
                        );
            });
            return(
                <tr>
                {headName}
                {dists}
                </tr>
            );
        });

        return(
            <table>
              {nodataGrid} 
              {horizonMatrxHead}
              {maxtrixContent}
            </table>
        );
    }

    renderCode(){     //渲染代码，使用layer  (iframe高度无法使用相对高度，应为tabContent的限制)
        return(
            <textarea   cols="80" rows="30" value={this.state.code} autoFocus readOnly></textarea>
        );
    }
   
    //渲染动作表
    renderAction()
    {
        let actions=this.state.actions;           //因为actions中有重复的动作，因此下面需要key(index)加以区分！
        console.log(actions);
        let actionContent=actions.map((action,index)=>{
            return(
               <tr key={index}>
                   <td align="center">
                    {action}
                   </td>
               </tr>
            );
        });
        return(
            <table >
                {actionContent}
            </table>
        );
    }

    highlightLink(link){
        return function(event){
            let links = this.props.link;
            links.forEach(l=>{
                l.polyline.setStrokeColor(this.DEFAULT_LINK_COLOR);
            });
            link.polyline.setStrokeColor(this.SELECTED_LINK_COLOR);
            this.props.updateState(null, links);
        }
    }

    setLink(link){
        return function(event){
            let links = this.props.link;
            let visible = link.polyline.isVisible();

            if(visible)
                link.polyline.hide();
            else 
                link.polyline.show();

            this.props.updateState(null, links);
        }
    }
}

export default GraphTable;