import { updateCamera } from './camera.js';

export function setupControls(player, camera, orbitControls, floor, cameraData) {
    window.addEventListener('keydown', (event) => player.handleKeyDown(event));
    window.addEventListener('keyup', (event) => player.handleKeyUp(event));
    window.addEventListener('mousedown', (event) => player.handleMouseDown(event, camera, floor, orbitControls, cameraData.cameraDistance));
    window.addEventListener('wheel', (event) => {
        if (event.target.closest('#ui-panel')) return;
        const delta = event.deltaY > 0 ? 1.0 : -1.0;
        cameraData.cameraDistance = Math.max(10, Math.min(50, cameraData.cameraDistance + delta));
        updateCamera(camera, orbitControls, player.position, cameraData.cameraDistance);
        const camSlider = document.getElementById('cam-dist');
        if (camSlider) {
            camSlider.value = cameraData.cameraDistance;
            document.getElementById('cam-dist-value').textContent = cameraData.cameraDistance.toFixed(2);
        }
    });
}