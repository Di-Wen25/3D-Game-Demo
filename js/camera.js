import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { defaults } from './constants.js';

export function createCamera(renderer) {
    const camera = new THREE.PerspectiveCamera(
        defaults.cameraFov,
        window.innerWidth / window.innerHeight,
        0.1,
        defaults.renderDistance
    );
    camera.position.set(0, 2.5, -defaults.cameraDistance);

    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.target.set(0, 0.5, 0);
    orbitControls.enableDamping = false;
    orbitControls.enablePan = false;
    orbitControls.maxPolarAngle = Math.PI / 2 - 0.05;
    orbitControls.mouseButtons = {
        LEFT: null,
        MIDDLE: null,
        RIGHT: THREE.MOUSE.ROTATE
    };
    orbitControls.enableZoom = false;
    orbitControls.update();

    return {
        camera,
        orbitControls,
        cameraDistance: defaults.cameraDistance,
        cameraFov: defaults.cameraFov,
        renderDistance: defaults.renderDistance
    };
}

export function updateCamera(camera, orbitControls, playerPosition, cameraDistance) {
    const direction = camera.position.clone().sub(playerPosition).normalize();
    const newPos = playerPosition.clone().add(direction.multiplyScalar(cameraDistance));
    camera.position.copy(newPos);
    orbitControls.target.copy(playerPosition);
    orbitControls.update();
}

export function updateCameraSettings(camera, cameraFov, renderDistance) {
    camera.fov = cameraFov;
    camera.far = renderDistance;
    camera.updateProjectionMatrix();
}