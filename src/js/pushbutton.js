function PushButton(div_id,unique,label,color=null,bg_color=null,socket=null){
    var div_id = String(div_id);
    var label = String(label);
    var color = color;
    var bg_color = bg_color;
    var value; //holds toggle value right now
    var unique = String(unique); //unique identifying number
    var socket = socket;
    var overall_div = document.getElementById(div_id);
    var holder;
    var button_element;
    var setup = function(){
        holder = document.createElement("div");
        holder.setAttribute("id", div_id+unique+"_holder");
        holder.setAttribute("class", "button_holder");
        overall_div.appendChild(holder);
        button_element = document.createElement("button");
        button_element.setAttribute("class","gui_button");
        button_element.setAttribute("id",div_id+unique+"button");
        button_element.innerHTML = label;
        holder.appendChild(button_element);
           
        if (bg_color===null || color===null){
            console.log("no color");
        }else{
            button_element.setAttribute("style","background-color:"+bg_color+";color: "+color);
        }
        //$("#"+div_id+unique+"_holder").trigger("create");
    }
    setup();

    if (socket != null){
        button_element.addEventListener("mousedown",function(){
            console.log("PUSH");
            socket.emit('reporting', {'unique':unique, 'data':"Push"});
        });
        //off(clicking not working...is fine for now')
        button_element.addEventListener('mouseup',function(){
            console.log("UNPUSH");
            socket.emit('reporting', {'unique':unique, 'data':"Unpush"});
            socket.emit("THING");
        });
        socket.on("update_"+unique,function(val){
            button_element.style.backgroundColor = val['bgcolor'];
            button_element.style.color = val['color'];
            button_element.innerHTML = val['text'];
            console.log(val)


        });
    };
};
