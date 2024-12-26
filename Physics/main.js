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
  //scene.add(mesh);
});





let posArray = []; // Global variable to store the file content
let connecArray = [];
let eigenvecsArray = [];
const posfilePath = '/Physics/DNA_Eigen/positions.txt';
const connecfilePath = '/Physics/DNA_Eigen/connectivity.txt';
const eigenvecsfilePath = '/Physics/DNA_Eigen/eigenvectors.txt';
let eigenvecs_loaded = false;

// Fetch the file and process it
fetch(posfilePath)
	.then(response => {
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return response.text();
	})
	.then(text => {
		// Parse the file content and store in the global variable
		posArray = text.split(/\s+/);
		console.log('File content loaded:', posArray);

		// Now you can call a function to handle the data
		createAtoms(posArray);
	})
	.catch(error => {
		console.error('Error fetching the file:', error);
	});


  fetch(connecfilePath)
	.then(response => {
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return response.text();
	})
	.then(text => {
		// Parse the file content and store in the global variable
		connecArray = text.split(/\s+/);
		console.log('File content loaded:', connecArray);

		// Now you can call a function to handle the data
		createBindings(posArray, connecArray);
	})
	.catch(error => {
		console.error('Error fetching the file:', error);
	});


  fetch(eigenvecsfilePath)
	.then(response => {
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return response.text();
	})
	.then(text => {
		// Parse the file content and store in the global variable
		eigenvecsArray = text.split(/\s+/);
		console.log('File content loaded:', eigenvecsArray);

		// Now you can call a function to handle the data
    eigenvecs_loaded = true;
	})
	.catch(error => {
		console.error('Error fetching the file:', error);
	});



// Function to create cubes based on dataArray
function createAtoms(dataArray) {
	for (let i = 0; i < dataArray.length / 3; i++) {
		const x = parseFloat(dataArray[i * 3])-10;
		const y = parseFloat(dataArray[i * 3 + 1])-15;
		const z = parseFloat(dataArray[i * 3 + 2]);

		// Create geometry for each position
		const geometry = new THREE.SphereGeometry(0.3, 15, 10);
		const material = new THREE.MeshStandardMaterial({
			color: 0xC34949,
			metalness: 0.8,
			roughness: 0.2,
			envMapIntensity: 1.0,
		});
		const cube = new THREE.Mesh(geometry, material);

		// Set position from the array
		cube.position.set(x, y, z);

		// Add the cube to the scene
		scene.add(cube);
	}
}

function createBindings(posArray, connecArray) {
  for (let i = 0; i < connecArray.length / 2; i++) {
    const a = parseInt(connecArray[i * 2]);
    const b = parseInt(connecArray[i * 2 + 1]);

    const x1 = parseFloat(posArray[a * 3]-15);
    const y1 = parseFloat(posArray[a * 3 + 1]-15);
    const z1 = parseFloat(posArray[a * 3 + 2]);

    const x2 = parseFloat(posArray[b * 3]-15);
    const y2 = parseFloat(posArray[b * 3 + 1]-15);
    const z2 = parseFloat(posArray[b * 3 + 2]);

    const points = [];
    points.push( new THREE.Vector3( x1, y1, z1 ) );
    points.push( new THREE.Vector3( x2, y2, z2 ) );

    const material = new THREE.LineBasicMaterial( { color: 0x000000 } );
    const geometry = new THREE.BufferGeometry().setFromPoints( points );
    const line = new THREE.Line( geometry, material );
    scene.add( line );
  }
}




camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 50;

const ambientLight = new THREE.AmbientLight(0x404040, 10); // Soft white light with lower intensity
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 100); // Bright white light
pointLight.position.set(5, 5, 5); // Set the position of the light
scene.add(pointLight);


const controls = new OrbitControls( camera, renderer.domElement );

var axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

let time = 0;
let lastTime = 0;
let thisTime = 0;
let deltaTime = 0;

function animate() {

	controls.update();
  
  thisTime = Date.now();
  deltaTime = thisTime - lastTime;
  time += deltaTime;

  
  scene.children = scene.children.filter((child) => child.type === 'Mesh' || child.type === 'Line' || child.type === 'AxesHelper' || child.type === 'PointLight' || child.type === 'AmbientLight');
  
  for (let i=0; i<scene.children.length; i++){
    scene.remove(scene.children[i]);
  }

  if (eigenvecs_loaded){

    console.log("loaded");

    for (let i = 0; i < posArray.length / 3; i++) {
      const x = parseFloat(posArray[i * 3]-15);
      const y = parseFloat(posArray[i * 3 + 1]-15);
      const z = parseFloat(posArray[i * 3 + 2]);

      const dx = parseFloat(eigenvecsArray[i * 3]);
      const dy = parseFloat(eigenvecsArray[i * 3 + 1]);
      const dz = parseFloat(eigenvecsArray[i * 3 + 2]);

      const factor = 20;

      let x_new = x + dx * Math.sin(time*0.001)*factor;
      let y_new = y + dy * Math.sin(time*0.001)*factor;
      let z_new = z + dz * Math.sin(time*0.001)*factor;

      const geometry = new THREE.SphereGeometry(0.3, 6, 4);
		const material = new THREE.MeshStandardMaterial({
			color: 0xC34949,
			metalness: 0.8,
			roughness: 0.2,
			envMapIntensity: 1.0,
		});
		const cube = new THREE.Mesh(geometry, material);

		// Set position from the array
		cube.position.set(x_new, y_new, z_new);

		// Add the cube to the scene
		scene.add(cube);
    }
	lastTime = thisTime;


  }

  const ambientLight = new THREE.AmbientLight(0x404040, 100); // Soft white light with lower intensity
  scene.add(ambientLight);
  const pointLight = new THREE.PointLight(0xffffff, 400); // Bright white light
  pointLight.position.set(5, 5, 5); // Set the position of the light
  scene.add(pointLight);
  var axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

	renderer.render( scene, camera );

}