import { createScene, setupResize } from './scene-setup.js';
import { Player } from './player.js';
import { createCamera, updateCamera } from './camera.js';
import { createGameArea } from './game-area.js';
import { setupControls } from './controls.js';
import { createUI, loadSettings, useDefaults, updateUI } from './ui.js';

let sceneData, player, cameraData, gameArea;

function init() {
    sceneData = createScene();
    player = new Player(sceneData.scene);
    cameraData = createCamera(sceneData.renderer);
    gameArea = createGameArea(sceneData.scene, sceneData.dirLight);
    loadSettings(player, cameraData); // Load settings first
    updateUI(player, cameraData); // Ensure UI reflects loaded settings
    createUI(player, sceneData.scene, gameArea.floor, gameArea.lines, gameArea, cameraData, sceneData.dirLight);
    setupControls(player, cameraData.camera, cameraData.orbitControls, gameArea.floor, cameraData);
    setupResize(cameraData.camera, sceneData.renderer);
    updateCamera(cameraData.camera, cameraData.orbitControls, player.position, cameraData.cameraDistance);
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    const delta = sceneData.clock.getDelta();
    player.update(delta, cameraData.camera, cameraData.orbitControls, cameraData.cameraDistance);
    sceneData.renderer.render(sceneData.scene, cameraData.camera);
}

init();