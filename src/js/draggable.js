// external js: packery.pkgd.js, draggabilly.pkgd.js

document.addEventListener("DOMContentLoaded", function(){
//document.addEventListener("load", function(){

// external js: packery.pkgd.js, draggabilly.pkgd.js

var pckry = new Packery( '.grid', {
  itemSelector: '.grid-item',
  columnWidth: 100
});


document.addEventListener("DOMContentLoaded", function(){
// collection of Draggabillies
pckry.getItemElements().forEach( function( itemElem ) {
  var draggie = new Draggabilly( itemElem );
  draggies.push(draggie);
  pckry.bindDraggabillyEvents( draggie );
  draggie['disable']();
});




});

var draggies = [];
var isDrag = false;
function LockToggle() {
    // check if checkbox is checked
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

