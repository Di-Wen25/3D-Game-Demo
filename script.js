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
const floorGeometry = new THREE.CircleGeometry(20, 32);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Add grid texture to floor
const gridTexture = new THREE.GridHelper(40, 40, 0x000000, 0x000000);
gridTexture.position.y = 0.01;
scene.add(gridTexture);

// Create player (a red box)
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.y = 0.5;
scene.add(player);

// Set up OrbitControls for third-person camera
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.copy(player.position);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Configure mouse buttons: Right-click to rotate, wheel to zoom
controls.mouseButtons = {
    LEFT: null,
    MIDDLE: null,
    RIGHT: THREE.MOUSE.ROTATE
};
controls.enableZoom = true; // Wheel controls distance
controls.zoomSpeed = 1.0;
controls.minDistance = 2; // Minimum camera distance
controls.maxDistance = 15; // Maximum camera distance

// Initial camera position (behind player)
camera.position.set(0, 5, 10);

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

    // Calculate camera direction (projected on XZ plane for movement)
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0; // Ignore vertical component
    cameraDirection.normalize();

    // Calculate right vector (perpendicular to camera direction)
    const rightVector = new THREE.Vector3();
    rightVector.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0)).normalize();

    // Player movement relative to camera direction
    const speed = 0.1;
    const moveVector = new THREE.Vector3(0, 0, 0);
    if (keys.w) moveVector.add(cameraDirection);
    if (keys.s) moveVector.sub(cameraDirection);
    if (keys.a) moveVector.sub(rightVector);
    if (keys.d) moveVector.add(rightVector);

    // Apply movement if any key is pressed
    if (moveVector.lengthSq() > 0) {
        moveVector.normalize().multiplyScalar(speed);
        player.position.add(moveVector);
    }

    // Update camera to follow player
    controls.target.copy(player.position);
    controls.update();

    renderer.render(scene, camera);
}
animate();