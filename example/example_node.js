const THREE = require( 'three' );
const VRViewer = require( '../three-vr-viewer' );
window.v = VRViewer;

const { scene, camera, renderer, events, toggleVR, controllers } = VRViewer({
  THREE,

  //  triggers entering vr without any input
  autoEnter: true,

  //  create an empty room with two lights
  emptyRoom: true
});

console.log( scene, camera, renderer, controllers );

//  controller not showing? click any button on the controller!

const box = new THREE.Mesh(
  new THREE.BoxGeometry( 0.5, 0.5, 0.5),
  new THREE.MeshStandardMaterial({ color: 0xff0066 })
);
box.position.y = 1.2;

scene.add( box );
events.on( 'tick', function( dt ){
  box.rotation.x += 0.4 * dt;
  box.rotation.y -= 0.2 * dt;
  box.rotation.z += 0.3 * dt;
});

//  move the box to the controller when trigger is held
controllers[0].addEventListener('triggerdown', function(){
  controllers[ 0 ].add( box );
  box.position.set( 0, 0, -1.0 );
});

//  move the box back on release
controllers[0].addEventListener('triggerup', function(){
  scene.add( box );
  box.position.set( 0, 1.2, 0 );
});