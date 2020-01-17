1. layer.js改用了cdn引入，尚不知道为什么之前本地引入总是报错(使用时加上注释表示全局变量)
2. 必须在layer.js引入之前引入jquery!!!!!
3. 想配置跨域时在package.json设置了proxy不知道为什么没有作用
4. 注意node和link是全局的，详见index.js
5. 疑惑： that.animate();为什么渲染出来的还是同一个对象的东西（this）(var that=this; that改变后this为什么也变了？？)
6. setTimeout()需要深入理解！！！


讨论：
１．麻动作表的question少输出了一个字段
