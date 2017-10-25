// external js: packery.pkgd.js, draggabilly.pkgd.js

window.addEventListener("load", function(){
    console.log("event!");
//document.addEventListener("load", function(){

// external js: packery.pkgd.js, draggabilly.pkgd.js
pckry = new Packery( '.cp', {
  itemSelector: '.cp-item',
  columnWidth: 1
});
// collection of Draggabillies
pckry.getItemElements().forEach( function( itemElem ) {
  var draggie = new Draggabilly( itemElem );
  draggies.push(draggie);
  pckry.bindDraggabillyEvents( draggie );
  draggie['disable']();
});

console.log(draggies);

});

var pckry;
var draggies = [];
var isDrag = false;
function LockToggle() {
    // check if checkbox is checked
    console.log(pckry);
    console.log(draggies);
    var method = isDrag ? 'disable' : 'enable';
    draggies.forEach( function( draggie ) {
        draggie[ method ]();
    });
    // switch flag
    isDrag = !isDrag;
    /*if (document.querySelector('#my-checkbox').checked) {
      // if checked
      console.log('checked');
    } else {
      // if unchecked
      console.log('unchecked');
    }*/
  }

