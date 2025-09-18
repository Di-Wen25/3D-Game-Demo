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

// Set up OrbitControls for third-person camera
let controls;
try {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(player.position);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Configure mouse buttons: Right-click to rotate, wheel to zoom
    controls.mouseButtons = {
        LEFT: null,
        MIDDLE: null,
        RIGHT: THREE.MOUSE.ROTATE
    };
    controls.enableZoom = true;
    controls.zoomSpeed = 1.0;
    controls.minDistance = 2;
    controls.maxDistance = 15;
} catch (e) {
    console.error('Failed to initialize OrbitControls:', e);
}

// Initial camera position (behind and above player)
camera.position.set(0, 5, 10);
// Calculate initial offset (camera position relative to player)
const cameraOffset = new THREE.Vector3(0, 5, 10); // Relative to player (x:0, y:5, z:10)

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
        // Calculate camera direction (projected on XZ plane for movement)
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0;
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

        // Update camera position to maintain fixed offset
        const rotatedOffset = cameraOffset.clone();
        // Apply the camera's rotation (from OrbitControls) to the offset
        const cameraQuaternion = new THREE.Quaternion();
        camera.getWorldQuaternion(cameraQuaternion);
        rotatedOffset.applyQuaternion(cameraQuaternion);
        // Set camera position: player position + rotated offset
        camera.position.copy(player.position).add(rotatedOffset);

        // Update OrbitControls target to player position
        controls.target.copy(player.position);
        controls.update();
    }

    renderer.render(scene, camera);
}
animate();