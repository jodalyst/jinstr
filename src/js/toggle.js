function Toggle(div_id,title,names,unique,socket=null){
    var div_id = String(div_id);
    var title = String(title);
    var names = names; //should be 2-long array of values for when switch is low or high
    var value; //holds toggle value right now
    var unique = String(unique); //unique identifying number
    var socket = socket;
    var built = false;
    var title;
    var slider;
    var holder;
    var slider_input;
    var value;
    var label;
    var setup = function(){
        var overall_div = document.getElementById(div_id);
        holder = document.createElement('div');
        holder.setAttribute("id", div_id+unique+"_holder");
        holder.setAttribute("class", "toggle_holder");
        overall_div.appendChild(holder);
        title = document.createElement('div');
        value = document.createElement('div');
        title.setAttribute("id",div_id+unique+"_title");
        value.setAttribute("id",div_id+unique+"_value");
        title.setAttribute("class","toggle_title");
        value.setAttribute("class","toggle_val");
        slider = document.createElement('div');
        slider.setAttribute("class","ckbx-style-8");
        slider_input = document.createElement('input');
        slider_input.setAttribute("type","checkbox");
        slider_input.setAttribute("name",div_id+unique+"_checkbox");
        slider_input.setAttribute("id","ckbx-style-8-1");
        slider_input.setAttribute("value",1);
        slider_input.setAttribute("name", div_id+unique+"_checkbox");
        
        label = document.createElement("label");
        label.setAttribute("for","ckbx-style-8-1"); 
        holder.setAttribute("class", "toggle");
        holder.appendChild(slider);
        slider.appendChild(title);
        slider.appendChild(value);
        slider.appendChild(slider_input);
        slider.appendChild(label);
        built = true;
         
    }
    setup();
    var checko = function(element){
        if (element.checked){
            console.log("on");
        }else{
            console.log("off");
        }
        if (socket != null){
            console.log('reporting', {'unique':unique, 'data':slider_input.checked});
            socket.emit('reporting', {'unique':unique, 'data':slider_input.checked});
        }
    }     
    window.onload = function() {
        var input = document.getElementsByName(div_id+unique+"_checkbox");
        if (input) {   
            input.addEventListener('change', checko, false);
        }
    }
    if (socket != null){
        socket.on("update_"+unique,function(va){console.log("hit");if (built){slider_input.checked=va?true:false;}});
    };
};
