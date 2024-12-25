import * as THREE from 'three';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 1, 1, 1 );


const material = new THREE.MeshStandardMaterial({
	color: 0x00ff00,  // Green color
	metalness: 0.8,   // High metallic property for a shiny surface
	roughness: 0.2,   // Low roughness for smoothness
	envMapIntensity: 1.0 // Reflects the environment map (if used)
});

const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

const ambientLight = new THREE.AmbientLight(0x404040, 100); // Soft white light with lower intensity
        scene.add(ambientLight);

function animate() {

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;

	renderer.render( scene, camera );

}