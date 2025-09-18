import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Verify OrbitControls import
if (!OrbitControls) {
    console.error('OrbitControls failed to load. Check CDN or import path.');
}

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

// Camera offset parameters (spherical coordinates)
let cameraDistance = 5; // Initial distance (5 meters)
let azimuthalAngle = Math.PI / 4; // 45 degrees
let polarAngle = Math.PI / 4; // 45 degrees elevation
const minDistance = 2;
const maxDistance = 15;

// Set up OrbitControls for rotation input only
let controls;
try {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(player.position);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Configure mouse buttons: Right-click to rotate
    controls.mouseButtons = {
        LEFT: null,
        MIDDLE: null,
        RIGHT: THREE.MOUSE.ROTATE
    };
    controls.enableZoom = false; // Handle zoom manually
    controls.enablePan = false;
    // Disable auto-rotation and position updates
    controls.autoRotate = false;
    controls.enableRotate = true;
} catch (e) {
    console.error('Failed to initialize OrbitControls:', e);
}

// Update camera position based on offset
function updateCameraPosition() {
    // Convert spherical coordinates to Cartesian
    const sinPolar = Math.sin(polarAngle);
    const cosPolar = Math.cos(polarAngle);
    const sinAzimuth = Math.sin(azimuthalAngle);
    const cosAzimuth = Math.cos(azimuthalAngle);
    
    const offset = new THREE.Vector3(
        cameraDistance * sinPolar * cosAzimuth,
        cameraDistance * cosPolar,
        cameraDistance * sinPolar * sinAzimuth
    );
    
    // Set camera position: player position + offset
    camera.position.copy(player.position).add(offset);
    
    // Make camera look at player
    camera.lookAt(player.position);
}

// Initial camera position
updateCameraPosition();

// Handle mouse wheel for distance
window.addEventListener('wheel', (e) => {
    const delta = e.deltaY > 0 ? 0.2 : -0.2; // Scroll up: increase, down: decrease
    cameraDistance = Math.max(minDistance, Math.min(maxDistance, cameraDistance + delta));
    updateCameraPosition();
});

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

    if (controls) {
        // Update azimuthal angle based on OrbitControls
        const prevAzimuthalAngle = azimuthalAngle;
        controls.update();
        // Calculate new azimuthal angle from controls
        const deltaX = camera.position.x - player.position.x;
        const deltaZ = camera.position.z - player.position.z;
        azimuthalAngle = Math.atan2(deltaZ, deltaX);

        // Prevent spinning by only updating angle if changed significantly
        if (Math.abs(azimuthalAngle - prevAzimuthalAngle) > 0.0001) {
            updateCameraPosition();
        }

        // Calculate camera direction for player movement (XZ plane)
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0;
        cameraDirection.normalize();

        // Calculate right vector
        const rightVector = new THREE.Vector3();
        rightVector.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0)).normalize();

        // Player movement relative to camera direction
        const speed = 0.1;
        const moveVector = new THREE.Vector3(0, 0, 0);
        if (keys.w) moveVector.add(cameraDirection);
        if (keys.s) moveVector.sub(cameraDirection);
        if (keys.a) moveVector.sub(rightVector);
        if (keys.d) moveVector.add(rightVector);

        // Apply movement
        if (moveVector.lengthSq() > 0) {
            moveVector.normalize().multiplyScalar(speed);
            player.position.add(moveVector);
            // Update camera position instantly with player
            updateCameraPosition();
        }

        // Update controls target
        controls.target.copy(player.position);
    }

    renderer.render(scene, camera);
}
animate();