/////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                          //
//    Slider handler                                                                        //
//                                                                                          //
//       Job: builds and generates sliders then updates socket with slider value changes    //
//                                                                                          //
//       What it needs to do: settings gear to allow specification for:                     //
//             * sin wave generation                                                        //
//             * square wave generation                                                     //
//             * amplitude                                                                  //
//			   * offset                                                                     //
//			   * frequency                                                                  //
//			   * resolution                                                                 //
//                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////

// Define to socket
var socket = io('http://localhost:3000');

// Function that generates sliders and stores them into an array
var sliders = new Array();

// Generate html for sliders
function slider_generate(name,min,max,resolution){
	var time = new Date();
	var newb = document.createElement("div");
	$(newb).addClass("slider-container draggable");
	$(newb).attr('id',name+'_div');
	$(newb).append('<label class="slider-item" style="border:0px solid red" for="'+name+'">'+name+':</label>'); // label as slider item
	var slider = document.createElement("div");
	$(slider).addClass("ui-slider slider-item"); // slider as slider item
	$(slider).append('<input type="number" data-type="range" name="'+name // create the name
		+'" id="'+name+"_slider_input" // create the id
		+'" value="0" min="'+min // define the min
		+'" max="'+max // define the max
		+'" step='+resolution // define the resolution (step)
		+' class="_slider">'); // finish specifying everything...
	var animated_slider = document.createElement("div");
	$(animated_slider).attr("role","application");
	$(animated_slider).attr("id",name+"_slider");
	$(animated_slider).addClass("ui-slider-track ui-shadow-inset ui-bar-inherit ui-corner-all");
	var slider_dial = document.createElement("a");
	$(slider_dial).addClass("ui-slider-handle ui-btn ui-shadow");
	$(slider_dial).attr({
		"role":"slider",
		"type":"number",
		"aria-valuemin":min,
		"aria-valuemax":max,
		"aria-valuenow":"0",
		"aria-valuetext":"0",
		"title":"0",
		"aria-labelledby":name+"-label"
	});
	$(animated_slider).append(slider_dial);
	$(slider).append(animated_slider);
	$(newb).append(slider);
	$(newb).append('<i class="fa fa-cog fa-2x slider-item slider-settings cogfor-'+name+'" aria-hidden="true" id="' + name + '"></i>');
	$(newb).append('<div id="'+ name +'_autopilot"></div>');
	sliders.push({'name': name, 'obj':newb});
};

// Function that builds the sliders
function build_sliders(){
	for (var i = 0; i < sliders.length; i++){
		var slider_div = document.getElementById("drag_container");	
		$(sliders[i]['obj']).appendTo($(slider_div));
		$(sliders[i]['obj']).children().children().eq(1).remove("div"); // removing extra input field
		$(slider_div).appendTo($("#drag_container")).trigger("create");	
    }
};

// Function that builds/hides the autopilot for a selected div
function build_slider_autopilot(div_id){
	var socket = io('http://localhost:3000');

	var autopilot = div_id+'_autopilot';
	// Sets up everything......
	var setup = function(){ // Build for that div the first time.
		$('#' + autopilot).append('<div class="autopilot-container" id="'+autopilot+'_holder"></div>');
		var alternator = new Toggle(autopilot,"alternate?",["no","yes"],'1069',socket);
		$('#'+autopilot+'_holder').append(alternator);
		$('#'+autopilot+'_holder').append('Wave Type:<select name="waves"'
			+ 'style="background-color:#f6f6f6;display:table-cell;width:100%;">'
			+ ' <option selected="selected" value="default">Default</option>'
			+ ' <option value="sin">Sin</option>'
			+ ' <option value="square">Square</option>'
			+ ' <option value="triangle">Triangle</option>'
			+ ' <option value="sawtooth">Sawtooth</option></select><br>');
		$('#'+autopilot+'_holder').append('Frequency (hz):<input alight="right" type="number" data-type="range"' // Attach Frequency Field
			+ 'name="'+div_id+'_frequency' // create the name
			+'" id="'+div_id+'_autopilot_holder_frequency' // create the id
			+'" value="0"' // define the value
			+'" class="autopilot_frequency"'
			+ ' style="background-color:#f6f6f6;display:table-cell;width:100%"><br>');	// define the frequency type
		$('#'+autopilot+'_holder').append('Amplitude (unit):<input alight="right" type="number" data-type="range"' // Attach Frequency Field
			+ 'name="'+div_id+'_amplitude' // create the name
			+'" id="'+div_id+'_autopilot_holder_amplitude' // create the id
			+'" value="0" ' // define the value
			+'" class="autopilot_amplitude"'
			+ ' style="background-color:#f6f6f6;display:table-cell;width:100%">');	// define the resolution (step)
		$('#'+autopilot+'_holder').append('Offset (unit):<input alight="right" type="number" data-type="range"' // Attach Frequency Field
			+ 'name="'+div_id+'_offset' // create the name
			+'" id="'+div_id+'_autopilot_holder_offset' // create the id
			+'" value="0" ' // define the value
			+'" class="autopilot_frequency"' // define the class
			+ ' style="background-color:#f6f6f6;display:table-cell;width:100%">');	// define the resolution (step)=
		$('#'+autopilot+'_holder').append('Update Frequency (ms):<input alight="right" type="number" data-type="range"' // Attach Frequency Field
			+ 'name="'+div_id+'_updatefreq' // create the name
			+'" id="'+div_id+'_autopilot_holder_updatefreq' // create the id
			+'" value="0" ' // define the value
			+'" class="autopilot_frequency"' // define the class
			+ ' style="background-color:#f6f6f6;display:table-cell;width:100%">');	// define the resolution (step)=
		$('#'+autopilot).hide(); // Hides it so that you don't have to press the gear button twice to make stuff happen.
	}
	
	// Checks if the autopilot fOR THAT SLIDER has already been built.
	if ( $('#'+autopilot).is(':empty')) { // Build the first time, then don't touch it....
		setup();

		d3.select("#drag_container").select("#"+autopilot)
		.style("top","110px").style("position","absolute")
		.style("z-index","999999")
		.style("background-color",("#f4f4f4"));

		d3.select("#" + div_id).append("div").style("height","0px")
		.style("width","0px")
		.style("position","relative")
		// .style("bottom","100px")
		.style("bottom","10px")
		.style("border-width", "10px")
		.style("border-color", "transparent transparent black transparent")
		.style("border-style", "solid")
		// .style("bottom","7px")
		// .style("left", "6px")
		.attr("id",autopilot+"_triangle");
	}
	// Deals with making the thingy dissapear/appear
	if ( $('#'+autopilot).is(':visible') ){
		$('#'+autopilot).hide();
		$('#'+autopilot+'_triangle').hide();
	} else {
		$('#'+autopilot).show();
		$('#'+autopilot+'_triangle').show();
	}

    var thing = new alternate(div_id); 

    if (socket != null){ // Whenever an on,off toggle for an alternator has been toggled, this gets triggered
        socket.on("autopilot_1069",function(div,command){
            thing.update(div,command);
		}); 
    };
};

// Array to store intervals in for purposes of clearing later.
var intervals = [];
// Handles the alternators.
function alternate(div_id){
	var label_id = String(div_id + '_slider_input'); // Unique ID for the slider value that is being updated
	var slider_id = String(div_id + '_slider')
	var gear = '.cogfor-' + div_id;
    var time = new Date();
    time.getTime();
    // Do the stuff with the stuff.
    this.update = function(div_id,command){
        // Define values!!!!!!!!!!!!!!!!!
        var wave_type = $( '#'  + div_id + ' > select[name=waves] > option:selected' ).val(); // Wave type for toggled alternator
        var frequency = $( '#' + div_id + '_frequency' ).attr( 'value' ); // Frequency for toggled alternator
        var amplitude = $( '#' + div_id + '_amplitude' ).attr( 'value' ); // Amplitude for toggled alternator
        var offset = $( '#'+ div_id +'_offset' ).attr( 'value' ); // Offset for toggled alternator
        var update_freq = $( '#' + div_id + '_updatefreq' ).attr( 'value' ); // Update Frequency for toggled alternator
        // Determines which wave type the alternator object will be using
    	if ( command == "yes" ){
    		switch(wave_type){
    			case "default": // Alternate at standards rate
    				var intervalId = setInterval(function(){standard(label_id,div_id)}, Number(update_freq));
    				intervals[div_id] = intervalId;
    				$(gear).css('color','green');
    				break;
    			case "sin": // Alternate as sin wave
    				var intervalId = setInterval(function(){sin(label_id,div_id,frequency,amplitude,offset)}, Number(update_freq));
    				intervals[div_id] = intervalId;
    				$(gear).css('color','green');
    				break;
    			case "square": // Alternate as square wave
    				var intervalId = setInterval(function(){square(label_id,div_id,frequency,amplitude,offset)}, Number(update_freq));
    				intervals[div_id] = intervalId;
    				$(gear).css('color','green');
    				break;
    			case "triangle": // Alternate as triangle wave
    				var intervalId = setInterval(function(){triangle(label_id,div_id,frequency,amplitude,offset)}, Number(update_freq));
    				intervals[div_id] = intervalId;
    				$(gear).css('color','green');
    				break;
    			case "sawtooth": // Alternate as sawtooth wave
    				var intervalId = setInterval(function(){sawtooth(label_id,div_id,frequency,amplitude,offset)}, Number(update_freq));
    				intervals[div_id] = intervalId;
    				$(gear).css('color','green');
    				break;
    		}
    	} else if ( command == "no" ) {
    		clearInterval(intervals[div_id]);
    		$(gear).css('color','black');
    	}
    }
    // For standard alternation
	function standard(label_id,div_id){ // Just alterantes the value by changing the sign
        var updated_val = - Number($( '#' + label_id ).val());
        $( '#' + label_id ).val( updated_val );
    }
    // For sin waves
	function sin(label_id,div_id,frequency,amplitude,offset){
        var updated_val = Number(amplitude) * toDegrees(Math.sin(2*(Math.PI)*Number(frequency)*Date.now()+Number(offset)));
        $( '#' + label_id ).val( updated_val );
    }
    // For square  waves
	function square(label_id,div_id,frequency,amplitude,offset){
		///////Erm I'm not sure how square wave math works so///////
		//return function (t) {
		//  return square(440);
		//  function sin (x) { return Math.sin(2 * Math.PI * t * x) }
		//  function square (x) { return sin(x) > 0 ? 1 : -1 }
		//};
		///////////////////////////////////////////////////////////
    }
    // For triangle waves
	function triangle(label_id,div_id,frequency,amplitude,offset){
		// math for this here https://goo.gl/rjTK3Z
    }
    // For sawtooth waves
	function sawtooth(label_id,div_id,frequency,amplitude,offset){
		// math for this here https://goo.gl/rjTK3Z
    }
    // Necessary for wave math since Math.sin() returns a value in radians.
    function toDegrees (angle) {
      return angle * (180 / Math.PI);
    }
}