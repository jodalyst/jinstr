function PushButton(div_id,unique,label,color=null,bg_color=null,socket=null){
    var div_id = String(div_id);
    var label = String(label);
    var color = color;
    var bg_color = bg_color;
    var value; //holds toggle value right now
    var unique = String(unique); //unique identifying number
    var socket = socket;
    var setup = function(){
        $("#"+div_id).append("<div class ='button_holder' id=\""+div_id+unique+"_holder\"></div>");
        if (bg_color===null || color===null){
            $("#"+div_id+unique+"_holder").append("<button class=\"ui-button gui_button\" id=\""+ div_id+unique+"button" +"\">"+label+"</button>");
        }else{
            $("#"+div_id+unique+"_holder").append("<button class=\"ui-button gui_button\" id=\""+ div_id+unique+"button" +"\" style=\"background-color:" + bg_color+";color: " + color +"\">"+label+"</button>");
        }
        $("#"+div_id+unique+"_holder").trigger("create");
    }
    setup();
    if (socket != null){
        $('#'+div_id+unique+"button").on('click',function(){
            console.log("PUSH");
            socket.emit('reporting', {'unique':unique, 'data':"Push"});
        });
        //off(clicking not working...is fine for now')
        $('#'+div_id+unique+"button").off('click',function(){
            console.log("UNPUSH");
            socket.emit('reporting', {'unique':unique, 'data':"Unpush"});
        });
        socket.on("update_"+unique,function(val){
            var element = document.getElementById(div_id+unique+"button");
            element.style.backgroundColor = val['bgcolor'];
            element.style.color = val['color'];
            element.innerHTML = val['text'];
            console.log(val)


        });
    };
};
