import * as THREE from 'three';
import { defaults, settings } from './constants.js';
import { updateCamera } from './camera.js';

export class Player {
    constructor(scene) {
        this.position = new THREE.Vector3(0, 0.5, 0);
        this.targetPosition = null;
        this.isSkillMode = false;
        this.isSkillMoving = false;
        this.skillSpeed = defaults.skillSpeed;
        this.skillRadius = defaults.skillRadius;
        this.currentMoveSpeed = settings.moveSpeed / 10;
        this.keys = { w: false, a: false, s: false, d: false, '1': false };
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.playerGroup = new THREE.Group();
        this.playerGroup.position.copy(this.position);
        scene.add(this.playerGroup);

        const playerGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
        playerMesh.position.y = 0.5;
        playerMesh.castShadow = true;
        this.playerGroup.add(playerMesh);

        this.skillCircle = new THREE.Mesh(
            new THREE.CircleGeometry(this.skillRadius, 32),
            new THREE.MeshBasicMaterial({ color: 0x0000ff, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
        );
        this.skillCircle.rotation.x = -Math.PI / 2;
        this.skillCircle.position.y = 0.01;
        this.skillCircle.visible = false;
        scene.add(this.skillCircle);
    }

    handleMouseDown(event, camera, floor, orbitControls, cameraDistance) {
        if (event.target.closest('#ui-panel')) return;
        if (event.button !== 0) return;

        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, camera);
        const intersects = this.raycaster.intersectObject(floor);

        if (intersects.length > 0) {
            const point = intersects[0].point;
            const distFromCenter = Math.sqrt(point.x ** 2 + point.z ** 2);
            if (distFromCenter > settings.circleRadius - 0.5) return;

            if (this.isSkillMode && !this.isSkillMoving) {
                const distFromPlayer = Math.sqrt((point.x - this.position.x) ** 2 + (point.z - this.position.z) ** 2);
                if (distFromPlayer <= this.skillRadius) {
                    this.targetPosition = point.clone();
                    this.targetPosition.y = 0.5;
                    this.isSkillMoving = true;
                    this.isSkillMode = false;
                    this.skillCircle.visible = false;
                    this.currentMoveSpeed = this.skillSpeed / 10;
                }
            } else if (!this.isSkillMoving) {
                this.targetPosition = point.clone();
                this.targetPosition.y = 0.5;
                this.currentMoveSpeed = settings.moveSpeed / 10;
            }
            updateCamera(camera, orbitControls, this.position, cameraDistance);
        }
    }

    handleKeyDown(event) {
        const key = event.key.toLowerCase();
        if (['w', 'a', 's', 'd'].includes(key)) {
            if (!this.isSkillMoving && !this.isSkillMode) {
                this.keys[key] = true;
                this.targetPosition = null;
            }
        }
        if (key === '1' && !this.keys['1'] && !this.isSkillMoving) {
            this.keys['1'] = true;
            this.isSkillMode = !this.isSkillMode;
            this.skillCircle.visible = this.isSkillMode;
            if (this.isSkillMode) {
                this.targetPosition = null;
                this.keys.w = this.keys.a = this.keys.s = this.keys.d = false;
            }
        }
    }

    handleKeyUp(event) {
        const key = event.key.toLowerCase();
        if (['w', 'a', 's', 'd', '1'].includes(key)) {
            this.keys[key] = false;
        }
    }

    restrictToCircle(camera, orbitControls, cameraDistance) {
        const distance = Math.sqrt(this.position.x ** 2 + this.position.z ** 2);
        if (distance > settings.circleRadius - 0.5) {
            const scale = (settings.circleRadius - 0.5) / distance;
            const oldX = this.position.x;
            const oldZ = this.position.z;
            this.position.x *= scale;
            this.position.z *= scale;
            this.position.y = 0.5;
            this.playerGroup.position.copy(this.position);
            camera.position.x += this.position.x - oldX;
            camera.position.z += this.position.z - oldZ;
            if (this.isSkillMoving) {
                this.targetPosition = null;
                this.isSkillMoving = false;
            }
            updateCamera(camera, orbitControls, this.position, cameraDistance);
        }
    }

    update(delta, camera, orbitControls, cameraDistance) {
        const azimuth = orbitControls.getAzimuthalAngle();
        const ease = new THREE.Vector3();
        const up = new THREE.Vector3(0, 1, 0);
        let rotate = new THREE.Quaternion();

        if (this.targetPosition) {
            const moveSpeed = this.currentMoveSpeed * delta;
            const direction = this.targetPosition.clone().sub(this.position).normalize();
            const step = direction.clone().multiplyScalar(moveSpeed);
            const oldX = this.position.x;
            const oldZ = this.position.z;
            if (step.length() >= this.position.distanceTo(this.targetPosition)) {
                this.position.copy(this.targetPosition);
                camera.position.x += this.targetPosition.x - oldX;
                camera.position.z += this.targetPosition.z - oldZ;
                this.playerGroup.position.copy(this.position);
                this.targetPosition = null;
                this.isSkillMoving = false;
            } else {
                this.position.add(step);
                camera.position.x += step.x;
                camera.position.z += step.z;
                this.playerGroup.position.copy(this.position);
            }
            this.restrictToCircle(camera, orbitControls, cameraDistance);
            updateCamera(camera, orbitControls, this.position, cameraDistance);
            return;
        }

        if (!this.isSkillMoving && !this.isSkillMode) {
            let forward = 0;
            if (this.keys.w) forward = -1;
            if (this.keys.s) forward = 1;
            let strafe = 0;
            if (this.keys.a) strafe = -1;
            if (this.keys.d) strafe = 1;

            if (forward !== 0 || strafe !== 0) {
                ease.set(strafe, 0, forward).multiplyScalar((settings.moveSpeed / 10) * delta);
                const angle = Math.atan2(ease.x, ease.z) + azimuth;
                rotate.setFromAxisAngle(up, angle);
                const oldX = this.position.x;
                const oldZ = this.position.z;
                this.position.add(ease.applyAxisAngle(up, azimuth));
                camera.position.x += this.position.x - oldX;
                camera.position.z += this.position.z - oldZ;
                this.playerGroup.position.copy(this.position);
                this.playerGroup.quaternion.rotateTowards(rotate, settings.rotateSpeed);
                this.restrictToCircle(camera, orbitControls, cameraDistance);
                updateCamera(camera, orbitControls, this.position, cameraDistance);
            }
        }

        if (this.isSkillMode) {
            this.skillCircle.position.x = this.position.x;
            this.skillCircle.position.z = this.position.z;
        }
    }

    updateSkillRadius() {
        const newSkillGeometry = new THREE.CircleGeometry(this.skillRadius, 32);
        this.skillCircle.geometry.dispose();
        this.skillCircle.geometry = newSkillGeometry;
    }
}