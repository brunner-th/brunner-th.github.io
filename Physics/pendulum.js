

const canvas = document.getElementById('pendulumCanvas');
const ctx = canvas.getContext('2d');


const g = 9.81;
const length = 1;
let lastTime = performance.now();

// Initial conditions
let theta = Math.PI / 4;
let omega = 0;

const originX = canvas.width / 2;
const originY = 100;

// Scale factor
const scale = 150;

// Pendulum head position
function getPosition(theta) {
    const x = originX + scale * length * Math.sin(theta);
    const y = originY + scale * length * Math.cos(theta);
    return { x, y };
}

// Update pendulum state using Forward Euler
function updatePendulum() {
    const alpha = -(g / length) * Math.sin(theta);

    const currentTime = performance.now();
    const dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    omega += alpha * dt;
    theta += omega * dt; 
}

// Draw the pendulum
function drawPendulum() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { x, y } = getPosition(theta);

    // Draw stuff
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.stroke();
}

// Animation loop
function animate() {
    updatePendulum();
    drawPendulum();
    requestAnimationFrame(animate);
}

// Start the animation
animate();