import * as THREE from 'three';
import { defaults, settings } from './constants.js';

export function createGameArea(scene, dirLight) {
    const floorGeometry = new THREE.CircleGeometry(settings.circleRadius, 32);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const lines = [];
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI / 4) + (Math.PI / 8);
        const points = [
            new THREE.Vector3(0, 0.01, 0),
            new THREE.Vector3(Math.cos(angle) * settings.circleRadius, 0.01, Math.sin(angle) * settings.circleRadius)
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial);
        scene.add(line);
        lines.push(line);
    }

    const cylinderGeometry = new THREE.CylinderGeometry(1.0, 1.0, 10, 32);
    const northCylinder = new THREE.Mesh(cylinderGeometry, new THREE.MeshStandardMaterial({ color: 0xFF6600 }));
    northCylinder.position.set(0, 5, settings.circleRadius + 0.5);
    northCylinder.castShadow = true;
    scene.add(northCylinder);

    const eastCylinder = new THREE.Mesh(cylinderGeometry, new THREE.MeshStandardMaterial({ color: 0xffffff }));
    eastCylinder.position.set(settings.circleRadius + 0.5, 5, 0);
    eastCylinder.castShadow = true;
    scene.add(eastCylinder);

    const southCylinder = new THREE.Mesh(cylinderGeometry, new THREE.MeshStandardMaterial({ color: 0xffffff }));
    southCylinder.position.set(0, 5, -(settings.circleRadius + 0.5));
    southCylinder.castShadow = true;
    scene.add(southCylinder);

    const westCylinder = new THREE.Mesh(cylinderGeometry, new THREE.MeshStandardMaterial({ color: 0xffffff }));
    westCylinder.position.set(-(settings.circleRadius + 0.5), 5, 0);
    westCylinder.castShadow = true;
    scene.add(westCylinder);

    updateShadowCamera(dirLight, settings.circleRadius);

    return { floor, lines, northCylinder, eastCylinder, southCylinder, westCylinder };
}

export function updateGameArea(scene, floor, lines, northCylinder, eastCylinder, southCylinder, westCylinder, dirLight) {
    const newGeometry = new THREE.CircleGeometry(settings.circleRadius, 32);
    floor.geometry.dispose();
    floor.geometry = newGeometry;

    lines.forEach(line => {
        line.geometry.dispose();
        scene.remove(line);
    });
    lines.length = 0;

    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI / 4) + (Math.PI / 8);
        const points = [
            new THREE.Vector3(0, 0.01, 0),
            new THREE.Vector3(Math.cos(angle) * settings.circleRadius, 0.01, Math.sin(angle) * settings.circleRadius)
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial);
        scene.add(line);
        lines.push(line);
    }

    northCylinder.position.set(0, 5, settings.circleRadius + 0.5);
    eastCylinder.position.set(settings.circleRadius + 0.5, 5, 0);
    southCylinder.position.set(0, 5, -(settings.circleRadius + 0.5));
    westCylinder.position.set(-(settings.circleRadius + 0.5), 5, 0);

    updateShadowCamera(dirLight, settings.circleRadius);
}

function updateShadowCamera(dirLight, circleRadius) {
    const shadowSize = circleRadius * 1.2;
    dirLight.shadow.camera.top = shadowSize;
    dirLight.shadow.camera.right = shadowSize;
    dirLight.shadow.camera.bottom = -shadowSize;
    dirLight.shadow.camera.left = -shadowSize;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 50;
    dirLight.shadow.camera.updateProjectionMatrix();
}