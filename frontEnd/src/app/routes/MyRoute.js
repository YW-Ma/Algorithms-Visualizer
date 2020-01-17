import {BrowserRouter,Switch,Route,Link} from 'react-router-dom';
import MainInterface from './MainInterface';
import Reports from './Reports';
let React=require('react');


//加括号的函数体返回对象字面表达式
const MyRoute=()=>(  
    <BrowserRouter>
        <Switch>
            <Route exact path="/" component={MainInterface}/>
            <Route exact path="/reports" component={Reports}/>
        </Switch>
    </BrowserRouter>
);   


export default MyRoute;

