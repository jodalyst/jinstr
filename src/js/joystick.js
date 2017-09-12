// Storage array for joysticks
var options = new Array();
var joysticks = new Array();

function Joystick(div_id,name,mode,size,color,catchdistance=null,config=false,static=false){
	if ( config ) {
		var container = document.createElement("div");
		$(container).addClass('draggable joystick-container sbs');
		// $(container).addClass('sbs');
		$(container).css({
			height: size,
			width: size,
			border: '1px dashed #CCC',
			padding: '0.5em',
		});
		var package = document.createElement("div");
		$(package).addClass('joystick-item');
		$(package).attr('id',div_id);
		$(package).css({
			top: 0,
			left: 0,
			position:'relative',
			height: size,
			width: size,
		});
		$(package).appendTo(container);
		$(container).appendTo($("#drag_container")).trigger("create");	
	};
	
	// Compile the options	
	switch (mode) {
		case 'dynamic':
			var option = {
				zone: document.getElementById(div_id),
				color: color,
				size: size,
			};
			break;
		case 'semi':
			var option = {
				zone: document.getElementById(div_id),
				mode: 'semi',
				catchdistance: catchdistance,
				color: color,
				size: size,
			};
			break;
		case 'static':
			var option = {
				zone: document.getElementById(div_id),
				mode: 'static',
				position: {left: '50%', top: '50%'},
				color: color,
				size: size,
			};
			break;
	};
	// If the joystick is going to be built for a static page (i.e. not shape-shifted)
	if ( static ) {
		// var joystick = nipplejs.create(option);
		// joysticks.push(joystick);
	}
	// Add joystick configuration to array for buildJoysticks()
	options.push(option);
};

function buildJoysticks(){
	for(var i = 0; i < options.length; i++){
		var joystick = nipplejs.create(options[i]);
		joysticks.push(joystick);
	};
};

function clearJoysticks(){
	for(var i = 0; i < joysticks.length; i++){
		joysticks[i].destroy();
	};
};

function fixJoysticks(){
	clearJoysticks();
	buildJoysticks();
}

// {
//   "color": "red",
//   "div_id": "rod",
//   "mode": "dynamic",
//   "name": "lulz",
//   "size": 200,
//   "unique": 899
// },
// {
//   "catchdistance": 150,
//   "div_id": "kat",
//   "mode": "semi",
//   "name": "kittykat",
//   "size": 200,
//   "unique": 446
// },
// {
//   "color": "blue",
//   "div_id": "gonzo",
//   "mode": "static",
//   "name": "lit",
//   "size": 200,
//   "unique": 127
// }

// {
//   "color": "green",
//   "div_id": "rod",
//   "mode": "static",
//   "name": "jesus",
//   "size": 200,
//   "unique": 120
// },
// {
//   "color": "orange",
//   "div_id": "kat",
//   "mode": "static",
//   "name": "kittykat",
//   "size": 200,
//   "unique": 128
// },
// {
//   "color": "blue",
//   "div_id": "gonzo",
//   "mode": "static",
//   "name": "lit",
//   "size": 200,
//   "unique": 127
// }


// {
//   "color": "red",
//   "div_id": "kat",
//   "mode": "static",
//   "name": "jesus",
//   "size": 200,
//   "unique": 243
// }