
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


function getMagneticFieldStrength(x, y, z) {
    const B0 = 3.07 * 10 ** -5;
    const Re = 6.371 * 10 ** 6;
    const r = Math.sqrt(x ** 2 + y ** 2 + z ** 2);

    let B = -1.0 * B0 * Re ** 3 / (r ** 5);

    const Bx = B * (3 * x * z);
    const By = B * (3 * y * z);
    const Bz = B * (2 * z ** 2 - x ** 2 - y ** 2);

    return { Bx, By, Bz };
}

function equationsOfMotion(t, y_vec) {
    const [x, y, z, vx, vy, vz] = y_vec;
    const q = 1.6 * 10 ** -19;
    const m0 = 1.67 * 10 ** -27;
    const c = 3 * 10 ** 8;
    const gamma = 1 / Math.sqrt(1 - (vx ** 2 + vy ** 2 + vz ** 2) / c**2);
    const m = m0 * gamma;

    const B = getMagneticFieldStrength(x, y, z);

    const ax = (q / m) * (vy * B.Bz - vz * B.By);
    const ay = (q / m) * (vz * B.Bx - vx * B.Bz);
    const az = (q / m) * (vx * B.By - vy * B.Bx);

    return [vx, vy, vz, ax, ay, az];
}

function rk6Integrator(f, y0, t0, tEnd, dt) {
    const steps = Math.ceil((tEnd - t0) / dt);
    const results = [];

    let t = t0;
    let y = [...y0]; // Ensure y is a copy of the initial vector

    for (let step = 0; step < steps; step++) {
        results.push({ t, y: [...y] }); // Save the current state

        const k1 = f(t, y).map(v => dt * v);
        const k2 = f(t + dt / 4, y.map((yi, i) => yi + k1[i] / 4)).map(v => dt * v);
        const k3 = f(t + dt / 4, y.map((yi, i) => yi + (k1[i] + k2[i]) / 8)).map(v => dt * v);
        const k4 = f(t + dt / 2, y.map((yi, i) => yi - k2[i] / 2 + k3[i])).map(v => dt * v);
        const k5 = f(t + (3 * dt) / 4, y.map((yi, i) => yi + (3 * k1[i] / 16) + (9 * k4[i] / 16))).map(v => dt * v);
        const k6 = f(t + dt, y.map((yi, i) => yi - (3 * k1[i] / 7) + (2 * k2[i] / 7) + (12 * k3[i] / 7) - (12 * k4[i] / 7) + (8 * k5[i] / 7))).map(v => dt * v);

        // Combine to get the next state
        y = y.map((yi, i) => yi + (k1[i] + 2 * k2[i] + 2 * k3[i] + 2 * k4[i] + k5[i] + k6[i]) / 9);
        t += dt;
    }

    return results;
}

function initialConditions() {
    const alphaeq = (30 / 180) * Math.PI; // equatorial pitch angle
    const psi = 0; // gyro phase from 0 to 2pi
    const c = 3 * 10 ** 8; // speed of light in m/s
    const Ek = 0.001 * 10 ** 6; // kinetic energy in eV
    const m0 = 1.67 * 10 ** -27; // mass of proton in kg
    const v = 10000000 //c*Math.sqrt(1-(m0*c**2/(m0*c**2+Ek)**2)); // velocity in m/s
    const Re = 6.371 * 10 ** 6; // Earth radius in m
    const L = 4*Re; // L-shell

    return [L, 0, 0, v * Math.sin(alphaeq) * Math.cos(psi), v * Math.sin(alphaeq) * Math.sin(psi), v * Math.cos(alphaeq)];
}

const y0 = initialConditions();
const t0 = 0;
const tEnd = 93;
const dt = 0.00005;
const results = rk6Integrator(equationsOfMotion, y0, t0, tEnd, dt);

console.log(results);





const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
renderer.setClearColor(0xffffff, 1);
document.body.appendChild( renderer.domElement );

const geometry = new THREE.SphereGeometry( 0.04, 32, 16 );
const material = new THREE.MeshStandardMaterial({
	color: 0xfe471f,  // Green color
	metalness: 0.8,   // High metallic property for a shiny surface
	roughness: 0.2,   // Low roughness for smoothness
	envMapIntensity: 1.0 // Reflects the environment map (if used)
});
const particle = new THREE.Mesh( geometry, material );
scene.add( particle );


const points = [];
const Rearth = 6.371 * 10 ** 6;
for (let i = 0; i < results.length; i++) {
    points.push( new THREE.Vector3( results[i].y[1]/Rearth, results[i].y[2]/Rearth, results[i].y[0]/Rearth ) );
}

console.log(points);

const material_line = new THREE.LineBasicMaterial( { color: 0x253000 } );
const geometry_line = new THREE.BufferGeometry().setFromPoints( points );
const line = new THREE.Line( geometry_line, material_line );
scene.add( line );





const geometry_earth = new THREE.SphereGeometry( 1, 32, 16 );
const texture_earth = new THREE.TextureLoader().load('earth_texture.jpeg');
const material_earth = new THREE.MeshBasicMaterial({
    map: texture_earth
  });
const earth = new THREE.Mesh( geometry_earth, material_earth );
scene.add( earth );






camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 7;

const ambientLight = new THREE.AmbientLight(0x404040, 10); // Soft white light with lower intensity
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 50); // Bright white light
pointLight.position.set(5, 5, 5); // Set the position of the light
scene.add(pointLight);


const controls = new OrbitControls( camera, renderer.domElement );

var axesHelper = new THREE.AxesHelper( 2 );
scene.add( axesHelper );



let i = 0;
const Re = 6.371 * 10 ** 6;

function animate() {
    controls.update();

    

    particle.position.x = results[i].y[1]/Re;
    particle.position.y = results[i].y[2]/Re;
    particle.position.z = results[i].y[0]/Re;
    


    var axesHelper = new THREE.AxesHelper( 5 );
    scene.add( axesHelper );

	renderer.render( scene, camera );

    const ani_stepsize = 200;

    if (i >= results.length - 2*ani_stepsize) {
        i = 0;
    }
    i = i + ani_stepsize;
}




