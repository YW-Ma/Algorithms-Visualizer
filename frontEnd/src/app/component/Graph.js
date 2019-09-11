class Graph{
    constructor(){
        this.vertices = [];
        this.adjList = new Map();
    }
    addVertex(v){
        this.vertices.push(v);
        this.adjList.set(v, []);
    }
    addEdge(v1, v2, w=1){
        this.adjList.get(v1).push({v:v2, w:w});
        this.adjList.get(v2).push({v:v1, w:w});
    }
    getEdgeWeight(index1, index2){
        let v1 = this.vertices[index1];
        let v2 = this.vertices[index2];
        let vs = this.adjList.get(v1);
        let index = vs.findIndex(edge=>{
            return edge.v===v2;
        });
        if(index<0)return Infinity;
        return vs[index].w;
    }
    getIndex(v){
        let index = this.vertices.findIndex(V=>{
            return V===v;
        });
        return index;
    }
    dijkstra(start, end){
        start = this.getIndex(start);
        end = this.getIndex(end);
        let S = [start];
        let U = [];
        let D = [];
        D[start] = {path:[start], dis:0, inS:true};

        let minIndex = start;
        let disTemp = Infinity;

        for(let i=0; i<this.vertices.length; i++){
            if(i===start)continue;
            U.push(i);
            let dis = this.getEdgeWeight(start, i);
            D[i]= {path:[start, i], dis: dis, inS: false};
            if(disTemp>dis){
                disTemp = dis;
                minIndex = i;
            }
        }

        while(U.length>0){
            
            console.log(minIndex, minIndex);
            
            S.push(minIndex);
            D[minIndex].inS = true;
            U.splice(U.findIndex(v=>v===minIndex), 1);
            let dis = D[minIndex].dis;

            let disTemp = Infinity;
            let index = -1;

            for(let i=0; i<U.length; i++){
                let curIndex = U[i];
                let newDis = dis +this.getEdgeWeight(minIndex, curIndex);
                if(newDis === Infinity)continue;
                if(newDis<D[curIndex].dis){
                    D[curIndex].path = [].concat(D[minIndex].path, curIndex);
                    D[curIndex].dis = newDis;
                }
                if(disTemp>newDis){
                    disTemp = newDis;
                    index = curIndex;
                }
            }
            minIndex = index;
        }

        let path ={path:D[end].path.slice(0), dis:D[end].dis};
        path.path = path.path.map(index=>{
            return this.vertices[index];
        });
        return path;
    }
}
export default Graph;
/*
let graph = new Graph();

graph.addVertex("wh");
graph.addVertex("cs");
graph.addVertex("gy");
graph.addVertex("nc");

graph.addEdge("wh", "cs", 1);
graph.addEdge("wh", "nc", 6);
graph.addEdge("wh", "gy", 3);
graph.addEdge("cs", "gy", 1);
graph.addEdge("gy", "nc", 3);

let path = graph.dijkstra("wh", "gy");
console.log(path);
*/