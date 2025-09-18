import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Create floor (a circle on the ground)
const floorGeometry = new THREE.CircleGeometry(20, 32); // Radius 20, 32 segments
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2; // Lay flat on XZ plane
scene.add(floor);

// Add grid texture to floor for better visibility (optional)
const gridTexture = new THREE.GridHelper(40, 40, 0x000000, 0x000000);
gridTexture.position.y = 0.01; // Slightly above floor to avoid z-fighting
scene.add(gridTexture);

// Create player (a red box)
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.y = 0.5; // Above floor
scene.add(player);

// Set up third-person camera with OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(player.position); // Center on player
controls.enableDamping = true; // Smooth movement
controls.dampingFactor = 0.05;

// Configure mouse buttons: Right-click for orbit (rotate), disable others
controls.mouseButtons = {
    LEFT: null,    // Disable left-click
    MIDDLE: THREE.MOUSE.DOLLY, // Zoom with middle
    RIGHT: THREE.MOUSE.ROTATE // Rotate with right-click
};

// Initial camera position (behind player)
camera.position.set(0, 5, 10); // Elevated and back for third-person view

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Keyboard controls for player movement
const keys = { w: false, a: false, s: false, d: false };
window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (['w', 'a', 's', 'd'].includes(key)) keys[key] = true;
});
window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (['w', 'a', 's', 'd'].includes(key)) keys[key] = false;
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Player movement (simple velocity, adjust speed as needed)
    const speed = 0.1;
    if (keys.w) player.position.z -= speed;
    if (keys.s) player.position.z += speed;
    if (keys.a) player.position.x -= speed;
    if (keys.d) player.position.x += speed;

    // Update camera target to follow player
    controls.target.copy(player.position);
    controls.update();

    renderer.render(scene, camera);
}
animate();