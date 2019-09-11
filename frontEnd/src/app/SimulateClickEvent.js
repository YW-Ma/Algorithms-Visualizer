
let $=window.jQuery;
let sleep=require('sleep')

/*function sleep(d){                                  //暴力暂停
    for(var t = Date.now();Date.now() - t <= d;);
}*/


//const cities=["成都","广州","上海","大连"];
//const start="成都市";
//const end="上海";
let cities=[];
let start;
let unvisiableEdgeIdx=[];

function unVisiEdge(edgeIdx,index)　　　　　　　　　　//删除边
{
    setTimeout(()=>{
        $("#link_"+edgeIdx).click();
        if(index==unvisiableEdgeIdx.length)
            window.layer.closeAll();
    },1000*index); 
}


function addCity(val,index,length)                  //添加结点并渲染边
{
    //搜索地点
    setTimeout(()=>{
        $("#input").val(val);
    },3000*index-2800);
    
    setTimeout(()=>{
        $('#searchOK').click();
    },3000*index-2000);

    //添加
    setTimeout(()=>{
        let addCityBtn=$("#addCity");
        if(addCityBtn.length>0){                 //添加按钮加载完成后再点击
            addCityBtn.click();
        }
        else{  
             alert("尚未加载添加城市的组件");
        }

        if(index==length){
            $("#confirmBtn").click();
            /*setTimeout(()=>{                               //尝试自动触发右击事件选择起点，但是都不行!　=>　只好采用手动点击
                /*$("#sidebar").trigger("contextmenu");
                $('#node_成都市').trigger({
                    type: 'mouseup',
                    which: 3
                });
                alert("点击了");
            },25000);*/
            //setTimeout(()=>{document.getElementById("node_成都市").contextmenu()},25000);
            //$("#node_成都市").mousedown();
            //window.layer.closeAll();
            /*$(document).ready(()=>{
                $("#node_成都市").contextmenu();
                alert("执行了右击");
            });*/
            window.layer.msg("加载完成后，右键选择起点："+start,{time:300000});
            setTimeout(()=>{                                                 //删除部分边
                window.layer.load(1, {shade: [0.2,'#fff']});
                $("#edge").click();
                unvisiableEdgeIdx.map((edgeIdx,index)=>{
                    unVisiEdge(edgeIdx,index+1);
                });
            },25000);
        }
           
    }
    ,3000*index-800);  
}

export function Repaint()
{
    /*cities.map((val,index)=>{
        $("#input").val(val);
        //alert(val);
        $('#searchOK').click();
        setTimeout(()=>{
            let addCityBtn=$("#addCity");
            if(addCityBtn.length>0){                 //添加按钮加载完成后再点击
                addCityBtn.click();
            }
             else{  
                 alert("尚未加载添加城市的组件");
            }   
        }
        ,1000*index);  
    });*/    //参考:https://blog.csdn.net/strdhgthbbh/article/details/92837282 


   
    $.ajax({                      //获取需要重绘的算法的信息:搜索的地点、起点、不可见的边
        type:"POST",
        url:'http://localhost:3001/getVisitInfo',
        //url:"/collect",
        data:{visitID:window.repaintVisitID},
        success: function(json){
            let visitInfo=json.VisitInfo;
            //alert(visitInfo.placesName);
            cities=visitInfo.placesName.split(" ");
            let startIdx=parseInt(visitInfo.seID);
            start=cities[startIdx];
            let idxtmp=visitInfo.unvisiableEdgeID.split(" ");         //得到不可见边的编号
            idxtmp.map((tmp,index)=>{
                unvisiableEdgeIdx.push(parseInt(tmp));
            });

            //返回结果后，进入自动模拟
            window.layer.load(1, {shade: [0.2,'#fff']});
            $("#panel>.drawer").click();
            let length=cities.length;
            cities.map((val,index)=>{
                addCity(val,index+1,length);
            });
        },
        error: function(){
            alert("重绘时获取信息出错!");
        }
    });
    
}


