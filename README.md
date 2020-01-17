Algorithms Visualizer
====
An Alogithm Visualization tool for the graph algorithms.

Online Demonstration Platform
----
[Visualization Platform](http://39.108.177.106/)

Usage
-----
1. Registration
2. Login
3. Search & Select the locations you interested in
4. Select an algorithm and right click the vertex of the abstract graph to select special vertex(e.g. starting vertex)
5. Left click the `Confirm` (`确定`) button, and watch the demonstration.
6. Answer questions during the demonstration, use control panel to adjust it
7. Use the `Report` function to review your learning history
8. Contact me if you have questions. [e-mail: ma_yaowei@yahoo.com]


Meanings
----
* Remembering 
  * Help users recognize specific concepts in the graph algorithm by showing tips and pseudocodes.
* Understanding
  * Help users understand the general principle behind a graph algorithm, like the meanning of the iteration operations of a graph algorithm, and explain how it works using words and ﬁgures. 
  * Enable users to test that the implementation of algorithms
* Application
  * Enable users to implement the graph algorithms for some specific application.
* Analysis
  * Help users understands the relation of the algorithm with other algorithms that can solve the same or related problems by exeuting different algorithms and demonstrate them in a unified UI
  * Simultaneously display the pseudo code and the analysis of the current step while demonstrating the algorithm
  * Demonstrate the algorithm step by step.

Demo
-----
![](https://github.com/YW-Ma/Algorithms-Visualizer/blob/master/Images/sample2.jpg)

Architecutres
-----
![](https://github.com/YW-Ma/Algorithms-Visualizer/blob/master/Images/architecture.jpg)

-----
Note
要点：
1. backEnd自身就是完整的工程，每次把frontEnd编译后放置在backEnd的Public里面作为资源被调用。
2. 需要使用3001端口，每次运行结束后记得用ctrl+c关闭程序以释放。不可以直接关exe。
3. 编译产生的build文件夹里有index.html，将其转换为pug格式后，需要修改目录“static为/build/static”

使用说明：
进入backEnd后在控制台运行 node ./bin/www

编译说明：
进入frontEnd后，运行npm run-script build
进入build后，将index.html变为pug格式，复制到backEnd的viewers内的interface.pug里，覆盖删除按钮以外的部分。注意修改目录，添加'build'在三处
复制build到backEnd的public里面。

问题解决：
1. 端口被占用会报错，利用lsof查询占用的进程并kill
2. mysql链接数太多会报错，需要注销当前系统
3. 不修改目录会报错，说找不到static文件夹

未解决的问题：
放到服务器后，在选好开始和结束点，运行动画时，在GraphSVG.js的对应部分报错“提交出错”。
原因是浏览器的安全设置，没能把我们选择的起止点数据反馈到服务器端。
