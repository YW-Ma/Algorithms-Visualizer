import GraphTable from "./GraphTable.js";
import GraphSVG from "./GraphSVG.js";

let React = require("react");
class Panel extends React.Component{

    //参考index.js知Panel的属性包括updataState、node、link
    //由render中...this.props知，这几个属性还会传递给GraphSVG   GraphTable
    constructor(props){
        super(props);
        
        this.MARGIN_RIGHT = 600;
        this.LEFT = 10;

        this.state = {
            left: -this.LEFT,
            marginRight: -this.MARGIN_RIGHT
        };
    }

    
    //注：　...this.props，props提供的语法糖，可以将父组件中的所有属性复制给子组件
    render(){
        return (
            <div id="panel" style={{marginRight: this.state.marginRight+"px"}}>
                <div id="graph"> 
                    <GraphSVG {...this.props}/>
                </div>  
                <div id="table">
                    <GraphTable {...this.props}/>
                </div>
                <div className="drawer" style={{left: this.state.left+"px"}} onClick={this.close.bind(this)}></div>
            </div>
        );
    }
    //关闭右栏
    close(){
        if(this.state.left!==0){
            this.setState({
                left: 0,
                marginRight: 0
            });
        }else{
            this.setState({
                left: -this.LEFT,
                marginRight: -this.MARGIN_RIGHT
            });
        }
    }
}

export default Panel;