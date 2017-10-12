function Toggle(div_id,title,names,unique,socket=null){
    var div_id = String(div_id);
    var title = String(title);
    var names = names; //should be 2-long array of values for when switch is low or high
    var value; //holds toggle value right now
    var unique = String(unique); //unique identifying number
    var socket = socket;
    var built = false;
    var setup = function(){
        var overall_div = document.getElementById(div_id);
        var holder = document.createElement('div');
        holder.setAttribute("id", div_id+unique+"_holder");
        holder.setAttribute("class", "toggle_holder");
        overall_div.appendChild(holder);
        var slider = document.createElement('div');
        holder.setAttribute("class", "toggle");
        holder.appendChild(slider);
        //$("#"+div_id).append("<div class ='toggle_holder' id=\""+div_id+unique+"_holder\"></div>");
        //$("#"+div_id+unique+"_holder").append("<label for =\"" + div_id+unique+"toggler"+"\">"+title+": </label>");
        //$("#"+div_id+unique+"_holder").append("<select name=\""+ div_id+unique+"toggler" +"\" id=\""+div_id+unique+"toggle"+"\" data-role=\"slider\"><option value=\""+names[0]+"\">"+names[0]+"</option><option value=\""+names[1]+"\">"+names[1]+" </option></select>");
        built = true;
        //$("#"+div_id+unique+"_holder").trigger("create");
        noUiSlider.create(slider, {
            orientation: "vertical",
            start: 0,
            range: {
                'min': [0, 1],
                'max': 1
            },
            format: wNumb({
                decimals: 0
            })
        })
        
        slider.noUiSlider.on('update', function( values, handle ){
            if ( values[handle] === '1' ) {
                slider.classList.add('off');
            } else {
                slider.classList.remove('off');
            }
            if (socket != null){
                console.log('reporting', {'unique':unique, 'data':slider.noUiSlider.get()});
                socket.emit('reporting', {'unique':unique, 'data':slider.noUiSlider.get()});
            }
        });
    }
    setup();
    if (socket != null){
        socket.on("update_"+unique,function(va){console.log("hit");if (built){slider.noUiSlider.set(va);}});
    };
};
