import { defaults, settings } from './constants.js';
import { updateGameArea } from './game-area.js';
import { updateCamera, updateCameraSettings } from './camera.js';

export function createUI(player, scene, floor, lines, cylinders, cameraData, dirLight) {
    // Initialize settings to prevent NaN
    player.skillSpeed = player.skillSpeed || defaults.skillSpeed;
    player.skillRadius = player.skillRadius || defaults.skillRadius;
    cameraData.cameraDistance = cameraData.cameraDistance || defaults.cameraDistance;
    cameraData.cameraFov = cameraData.cameraFov || defaults.cameraFov;
    cameraData.renderDistance = cameraData.renderDistance || defaults.renderDistance;
    settings.moveSpeed = settings.moveSpeed || defaults.moveSpeed;
    settings.circleRadius = settings.circleRadius || defaults.circleRadius;

    const uiPanel = document.createElement('div');
    uiPanel.id = 'ui-panel';
    uiPanel.style.position = 'absolute';
    uiPanel.style.top = '0';
    uiPanel.style.left = '0';
    uiPanel.style.width = '200px';
    uiPanel.style.backgroundColor = '#333';
    uiPanel.style.color = '#fff';
    uiPanel.style.padding = '10px';
    uiPanel.style.zIndex = '10';
    uiPanel.style.overflowY = 'auto';
    uiPanel.style.maxHeight = '100vh';
    uiPanel.style.borderRadius = '0';
    uiPanel.style.display = 'block';
    document.body.appendChild(uiPanel);

    uiPanel.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });

    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Hide Settings';
    toggleBtn.style.position = 'absolute';
    toggleBtn.style.top = '10px';
    toggleBtn.style.left = '10px';
    toggleBtn.style.backgroundColor = '#555';
    toggleBtn.style.border = 'none';
    toggleBtn.style.color = '#fff';
    toggleBtn.style.padding = '5px 10px';
    toggleBtn.style.cursor = 'pointer';
    toggleBtn.style.borderRadius = '0';
    toggleBtn.style.zIndex = '11';
    toggleBtn.onclick = () => {
        uiPanel.style.display = uiPanel.style.display === 'none' ? 'block' : 'none';
        toggleBtn.textContent = uiPanel.style.display === 'none' ? 'Show Settings' : 'Hide Settings';
    };
    document.body.appendChild(toggleBtn);

    function createSlider(labelText, id, min, max, step, value, onChange) {
        const div = document.createElement('div');
        div.style.marginBottom = '15px';

        const label = document.createElement('label');
        label.textContent = labelText;
        label.htmlFor = id;
        label.style.display = 'block';
        label.style.marginBottom = '5px';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = id;
        slider.min = min;
        slider.max = max;
        slider.step = step;
        slider.value = value || min;
        slider.style.width = '100%';
        slider.oninput = (e) => {
            const val = parseFloat(e.target.value);
            onChange(val);
            valueDisplay.textContent = val.toFixed(id === 'player-speed' || id === 'skill-speed' || id === 'render-distance' || id === 'cam-fov' ? 0 : 2);
        };

        const valueDisplay = document.createElement('span');
        valueDisplay.id = id + '-value';
        valueDisplay.textContent = parseFloat(slider.value).toFixed(id === 'player-speed' || id === 'skill-speed' || id === 'render-distance' || id === 'cam-fov' ? 0 : 2);
        valueDisplay.style.marginLeft = '10px';

        const sliderContainer = document.createElement('div');
        sliderContainer.style.display = 'flex';
        sliderContainer.style.alignItems = 'center';
        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(valueDisplay);

        div.appendChild(label);
        div.appendChild(sliderContainer);
        return div;
    }

    const playerSection = document.createElement('div');
    playerSection.className = 'ui-section';
    playerSection.innerHTML = '<h3>Player</h3>';
    playerSection.appendChild(createSlider('Player Speed', 'player-speed', 80, 200, 1, settings.moveSpeed, (val) => {
        settings.moveSpeed = val;
        player.currentMoveSpeed = val / 10;
    }));
    playerSection.appendChild(createSlider('Skill Speed', 'skill-speed', 80, 400, 1, player.skillSpeed, (val) => {
        player.skillSpeed = val;
    }));
    playerSection.appendChild(createSlider('Skill Circle Size', 'skill-radius', 1, 40, 0.5, player.skillRadius, (val) => {
        player.skillRadius = val;
        player.updateSkillRadius();
    }));
    uiPanel.appendChild(playerSection);

    const cameraSection = document.createElement('div');
    cameraSection.className = 'ui-section';
    cameraSection.innerHTML = '<h3>Camera</h3>';
    cameraSection.appendChild(createSlider('Camera Distance', 'cam-dist', 10, 50, 0.1, cameraData.cameraDistance, (val) => {
        cameraData.cameraDistance = val;
        updateCamera(cameraData.camera, cameraData.orbitControls, player.position, cameraData.cameraDistance);
    }));
    cameraSection.appendChild(createSlider('Camera FOV', 'cam-fov', 30, 120, 1, cameraData.cameraFov, (val) => {
        cameraData.cameraFov = val;
        updateCameraSettings(cameraData.camera, cameraData.cameraFov, cameraData.renderDistance);
    }));
    uiPanel.appendChild(cameraSection);

    const areaSection = document.createElement('div');
    areaSection.className = 'ui-section';
    areaSection.innerHTML = '<h3>Area</h3>';
    areaSection.appendChild(createSlider('Circle Radius', 'circle-radius', 10, 100, 1, settings.circleRadius, (val) => {
        settings.circleRadius = val;
        updateGameArea(scene, floor, lines, cylinders.northCylinder, cylinders.eastCylinder, cylinders.southCylinder, cylinders.westCylinder, dirLight);
        updateCamera(cameraData.camera, cameraData.orbitControls, player.position, cameraData.cameraDistance);
    }));
    uiPanel.appendChild(areaSection);

    const debugSection = document.createElement('div');
    debugSection.className = 'ui-section';
    debugSection.innerHTML = '<h3>Debug</h3>';
    debugSection.appendChild(createSlider('Render Distance', 'render-distance', 10, 500, 1, cameraData.renderDistance, (val) => {
        cameraData.renderDistance = val;
        updateCameraSettings(cameraData.camera, cameraData.cameraFov, cameraData.renderDistance);
    }));
    uiPanel.appendChild(debugSection);

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save Settings';
    saveBtn.style.width = '100%';
    saveBtn.style.backgroundColor = '#4CAF50';
    saveBtn.style.border = 'none';
    saveBtn.style.color = '#fff';
    saveBtn.style.padding = '5px';
    saveBtn.style.marginBottom = '5px';
    saveBtn.style.cursor = 'pointer';
    saveBtn.style.borderRadius = '0';
    saveBtn.onclick = () => saveSettings(player, cameraData);
    uiPanel.appendChild(saveBtn);

    const loadBtn = document.createElement('button');
    loadBtn.textContent = 'Load Settings';
    loadBtn.style.width = '100%';
    loadBtn.style.backgroundColor = '#2196F3';
    loadBtn.style.border = 'none';
    loadBtn.style.color = '#fff';
    loadBtn.style.padding = '5px';
    loadBtn.style.marginBottom = '5px';
    loadBtn.style.cursor = 'pointer';
    loadBtn.style.borderRadius = '0';
    loadBtn.onclick = () => {
        loadSettings(player, cameraData);
        updateUI(player, cameraData);
        updateGameArea(scene, floor, lines, cylinders.northCylinder, cylinders.eastCylinder, cylinders.southCylinder, cylinders.westCylinder, dirLight);
        updateCameraSettings(cameraData.camera, cameraData.cameraFov, cameraData.renderDistance);
        updateCamera(cameraData.camera, cameraData.orbitControls, player.position, cameraData.cameraDistance);
    };
    uiPanel.appendChild(loadBtn);

    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset Settings';
    resetBtn.style.width = '100%';
    resetBtn.style.backgroundColor = '#f44336';
    resetBtn.style.border = 'none';
    resetBtn.style.color = '#fff';
    resetBtn.style.padding = '5px';
    resetBtn.style.cursor = 'pointer';
    resetBtn.style.borderRadius = '0';
    resetBtn.onclick = () => {
        useDefaults(player, cameraData);
        updateUI(player, cameraData);
        updateGameArea(scene, floor, lines, cylinders.northCylinder, cylinders.eastCylinder, cylinders.southCylinder, cylinders.westCylinder, dirLight);
        updateCameraSettings(cameraData.camera, cameraData.cameraFov, cameraData.renderDistance);
        updateCamera(cameraData.camera, cameraData.orbitControls, player.position, cameraData.cameraDistance);
    };
    uiPanel.appendChild(resetBtn);

    updateUI(player, cameraData);
}

export function saveSettings(player, cameraData) {
    const savedSettings = {
        moveSpeed: settings.moveSpeed,
        skillSpeed: player.skillSpeed,
        skillRadius: player.skillRadius,
        cameraDistance: cameraData.cameraDistance,
        cameraFov: cameraData.cameraFov,
        circleRadius: settings.circleRadius,
        renderDistance: cameraData.renderDistance
    };
    localStorage.setItem('gameSettings', JSON.stringify(savedSettings));
}

export function loadSettings(player, cameraData) {
    const saved = localStorage.getItem('gameSettings');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (typeof parsed !== 'object' || parsed === null) {
                throw new Error('Invalid settings format');
            }
            settings.moveSpeed = Math.max(80, Math.min(200, parsed.moveSpeed || defaults.moveSpeed));
            player.skillSpeed = Math.max(80, Math.min(400, parsed.skillSpeed || defaults.skillSpeed));
            player.skillRadius = Math.max(1, Math.min(40, parsed.skillRadius || defaults.skillRadius));
            cameraData.cameraDistance = Math.max(10, Math.min(50, parsed.cameraDistance || defaults.cameraDistance));
            cameraData.cameraFov = Math.max(30, Math.min(120, parsed.cameraFov || defaults.cameraFov));
            settings.circleRadius = Math.max(10, Math.min(100, parsed.circleRadius || defaults.circleRadius));
            cameraData.renderDistance = Math.max(10, Math.min(500, parsed.renderDistance || defaults.renderDistance));
            player.currentMoveSpeed = settings.moveSpeed / 10;
            player.updateSkillRadius();
        } catch (error) {
            console.warn('Invalid localStorage data, using defaults:', error);
            useDefaults(player, cameraData);
        }
    } else {
        useDefaults(player, cameraData);
    }
}

export function useDefaults(player, cameraData) {
    settings.moveSpeed = defaults.moveSpeed;
    player.skillSpeed = defaults.skillSpeed;
    player.skillRadius = defaults.skillRadius;
    cameraData.cameraDistance = defaults.cameraDistance;
    cameraData.cameraFov = defaults.cameraFov;
    settings.circleRadius = defaults.circleRadius;
    cameraData.renderDistance = defaults.renderDistance;
    player.currentMoveSpeed = settings.moveSpeed / 10;
    player.updateSkillRadius();
}

export function updateUI(player, cameraData) {
    const sliders = [
        { id: 'player-speed', value: settings.moveSpeed, decimals: 0 },
        { id: 'skill-speed', value: player.skillSpeed, decimals: 0 },
        { id: 'skill-radius', value: player.skillRadius, decimals: 2 },
        { id: 'cam-dist', value: cameraData.cameraDistance, decimals: 2 },
        { id: 'cam-fov', value: cameraData.cameraFov, decimals: 0 },
        { id: 'circle-radius', value: settings.circleRadius, decimals: 0 },
        { id: 'render-distance', value: cameraData.renderDistance, decimals: 0 }
    ];

    sliders.forEach(({ id, value, decimals }) => {
        const slider = document.getElementById(id);
        const valueDisplay = document.getElementById(`${id}-value`);
        if (slider && valueDisplay) {
            slider.value = value || defaults[id.replace('-', '')] || 0;
            valueDisplay.textContent = parseFloat(slider.value).toFixed(decimals);
        }
    });
}