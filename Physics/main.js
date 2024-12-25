import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
renderer.setClearColor(0xffffff, 1);
document.body.appendChild( renderer.domElement );

//const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshStandardMaterial({
	color: 0x00ff00,  // Green color
	metalness: 0.8,   // High metallic property for a shiny surface
	roughness: 0.2,   // Low roughness for smoothness
	envMapIntensity: 1.0 // Reflects the environment map (if used)
});
//const cube = new THREE.Mesh( geometry, material );
//scene.add( cube );


const loader = new STLLoader();
loader.load('Fan_Shroud_stl.stl', function (geometry) {
  // Create a material for the STL model
  const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });

  // Create a mesh with the loaded geometry and material
  const mesh = new THREE.Mesh(geometry, material);

  // Optionally, scale and rotate the model if needed
  mesh.scale.set(0.3, 0.3, 0.3);  // Scale down the model if it's too large
  mesh.rotation.x = -Math.PI / 2; // Rotate model if necessary

  // Add to the scene
  scene.add(mesh);
});





camera.position.z = 5;

const ambientLight = new THREE.AmbientLight(0x404040, 10); // Soft white light with lower intensity
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 100); // Bright white light
pointLight.position.set(5, 5, 5); // Set the position of the light
scene.add(pointLight);


const controls = new OrbitControls( camera, renderer.domElement );

function animate() {

	controls.update();

	renderer.render( scene, camera );

}