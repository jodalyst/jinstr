function Slider(div_id,label,min, max, resolution,toggle,unique,color=null,socket=null){
    var div_id = String(div_id);
    var label = String(label);
    var color = color;
    var unique = String(unique); //unique identifying number
    var socket = socket;
    var overall_div = document.getElementById(div_id);
    var holder;
    var slider_element;
    var toggle_element;
    var is_toggling = false;
    var setup = function(){
        holder = document.createElement("div");
        holder.setAttribute("id", div_id+unique+"_holder");
        holder.setAttribute("class", "slider_holder");
        overall_div.appendChild(holder);
        var label_element = document.createElement("div");
        label_element.setAttribute("class","slider_label");
        label_element.innerHTML = label;
        holder.appendChild(label_element);
        slider_element = document.createElement("div");
        slider_element.setAttribute("id", div_id+unique+"slider");
        holder.appendChild(slider_element); 
        var spec_input = document.createElement("input");
        spec_input.setAttribute("type","number");
        spec_input.setAttribute("step",resolution);
        spec_input.setAttribute("min",min);
        spec_input.setAttribute("max",max);
        spec_input.setAttribute("id",div_id+unique+"manual_input");
        holder.appendChild(spec_input); 
        if (toggle){
            noUiSlider.create(html5Slider, {
                start: [min,0,max],
                connect: connect,
                tooltips: [true, false, true],
                range: {
                    'min': min,
                    'max': max
                }
            });
            //Build toggle part
            toggle_element = document.createElement("div");
            toggle_element.setAttribute("id", div_id+unique+"toggler");
            toggle_element.setAttribute("class","ckbx-style-8");
            var toggle_in = document.createElement("div");
            toggle_in.setAttribute("type","checkbox");
            toggle_in.setAttribute("id", div_id+unique+"checkbox");
            toggle_in.setAttribute("value","1");
            var toggle_lab = document.createElement("label");
            toggle_lab.setAttribute("for",div_id+unique+"checkbox");
            toggle_element.appendChild(toggle_in);
            toggle_element.appendChild(toggle_lab);
            holder.appendChild(toggle_element);
            spec_input.addEventListener('change', function(){
                slider_element.noUiSlider.set([null, this.value, null]);
            });
        }
    }
    setup();

};





