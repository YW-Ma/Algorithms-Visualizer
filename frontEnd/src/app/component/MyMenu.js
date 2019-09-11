var MyMenu = function(id){
    if(!document.querySelector("#"+id)){
        var menu = document.createElement("div");
        menu.id = id;
        menu.className = "mymenu";
        document.body.appendChild(menu);
    }
    this.menu = document.querySelector("#"+id);
    this.menu.innerHTML = "";
};
MyMenu.prototype.append = function(items){
    var t = this;
    items.forEach(item => {
        var dom = document.createElement("div");
        dom.className = "myitem";
        dom.innerHTML = item.label;
        dom.addEventListener("click", function(){
            item.click();
            t.menu.style.display = "none";
            return false;
        } ,true);
        t.menu.appendChild(dom);
    });
}
MyMenu.prototype.popup = function(x, y){
    this.menu.style.display = "block";
    this.menu.style.top = y+"px";
    this.menu.style.left = x+"px";
}
document.body.addEventListener('click', function(){
    document.querySelectorAll(".mymenu").forEach(v => v.style.display = "none");
} ,true);


export default MyMenu;