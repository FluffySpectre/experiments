require('dotenv').config();
const fetch = require('node-fetch');

const LightpanelAPI = require('./api_lightpanels');

// config stuff
const refreshTime = 60 * 5;
const shortDisplayDuration = 10;

// color paletts
const colorsWarm = [
    { temperature: 15, color: '102 255 0' },
    { temperature: 20, color: '153 255 0' },
    { temperature: 22, color: '204 255 0' },
    { temperature: 24, color: '255 255 0' },
    { temperature: 26, color: '255 204 0' },
    { temperature: 28, color: '255 153 0' },
    { temperature: 30, color: '255 102 0' },
    { temperature: 32, color: '255 51 0' },
    { temperature: 36, color: '255 0 0' },
];
const colorsCold = [
    { temperature: 15, color: '129 231 254' },
    { temperature: 10, color: '144 234 254' },
    { temperature: 5, color: '160 237 254' },
    { temperature: 2, color: '176 240 254' },
    { temperature: 0, color: '192 243 254' },
    { temperature: -2, color: '207 246 254' },
    { temperature: -5, color: '223 249 254' },
    { temperature: -8, color: '239 252 254' },
    { temperature: -10, color: '255 255 255' },
];

const brightnessDay = 100;
const brightnessNight = 20;

let lightpanelAPI;
let weatherData;

let isActive = false;
let lastRealScene;

let isUpdatingLightpanels = false;
let itIsDay = false;

let dimmColorFactor = 0.1;

let numActiveLightpanels = 0;

async function init() {
    lightpanelAPI = new LightpanelAPI(process.env.LIGHTPANELS_API);
    await lightpanelAPI.init();

    logInfo('Lightpanel API initialized!');

    await toggleActivation();
    updateLightpanels();

    setInterval(updateLightpanels, refreshTime * 1000);
    setInterval(toggleDimm, 30000);
    setTimeout(timerToggleActivation, 5000);
}
init();

function toggleDimm() {
    if (!isActive) return;

    const now = Math.floor(Date.now() / 1000);
    if (weatherData) {
        let day = false;
        if (now > weatherData.sys.sunrise && now < weatherData.sys.sunset) {
            // day
            day = true;
        }

        if (day !== itIsDay) {
            lightpanelAPI.setLightpanelBrightness(day ? brightnessDay : brightnessNight);
            itIsDay = day;

            logInfo('Brightness changed:', day ? brightnessDay : brightnessNight);
        }
    }
}

async function timerToggleActivation() {
    await toggleActivation();

    setTimeout(timerToggleActivation, 5000);
}

async function toggleActivation() {
    return new Promise(async resolve => {
        const isOn = await lightpanelAPI.isLightpanelOn().catch(e => {});
        if (!isOn) {
            if (isActive) {
                isActive = false;

                logInfo('Activation changed:', false);
            }

            resolve();
            return;
        }

        const activeEffect = await lightpanelAPI.getActiveEffect().catch(e => {});

        const newActive = activeEffect !== 'ThermoAus' && activeEffect === '*Static*' || activeEffect === 'Thermo' || activeEffect === 'ThermoKurz';
        let activationChanged = false;

        if (!newActive && activeEffect !== lastRealScene && activeEffect !== 'ThermoAus') {
            lastRealScene = activeEffect;
            logInfo('Last active scene:', lastRealScene);
        }

        if (isActive !== newActive) {
            logInfo('Activation changed:', newActive);
            activationChanged = true;

            if (newActive)
                activationTimeMs = activeEffect === 'ThermoKurz' ? new Date().getTime() : -1;
        }

        if (activeEffect === 'ThermoAus' && lastRealScene) {
            activationTimeMs = -1;
            lightpanelAPI.setLightpanelEffect(lastRealScene).catch(e => {});
            isActive = false;

            logInfo('Switched back to scene:', lastRealScene);

            logInfo('Activation changed:', false);
            resolve();
            return;
        }

        isActive = newActive;

        if (isActive && activationTimeMs > -1 && new Date().getTime() > activationTimeMs + (shortDisplayDuration * 1000) && lastRealScene) {
            activationTimeMs = -1;
            lightpanelAPI.setLightpanelEffect(lastRealScene).catch(e => {});
            isActive = false;

            logInfo('Switched back to scene:', lastRealScene);

            logInfo('Activation changed:', false);
            activationChanged = true;
        }

        if (isActive && activationChanged) {
            updateLightpanels();
        }

        resolve();
    });
}



async function updateLightpanels() {
    if (!isActive || isUpdatingLightpanels) return;
    isUpdatingLightpanels = true;

    weatherData = await getWeatherData();

    // DEBUG
    // weatherData.main.temp = -15 + Math.random() * 15;

    if (isActive && weatherData) {
        // check which color scale we have to use (cold or warm)
        const temp = weatherData.main.temp;

        let numActive = 0;
        let indices = [];
        let cols = [];
        let colorsToUse = colorsWarm;
        let dir = 1;

        if (temp < colorsWarm[0].temperature) {
            colorsToUse = colorsCold;
            dir = -1;
        }

        for (let i = 0; i < colorsToUse.length; i++) {
            indices.push(dir < 0 ? 8-i : i);

            if ((dir === -1 && weatherData.main.temp < colorsToUse[i].temperature) || 
                (dir === 1 && weatherData.main.temp >= colorsToUse[i].temperature)) {
                cols.push(colorsToUse[i].color);
                numActive++;
            } else {
                const dimmedColor = colorsToUse[i].color.split(' ').map(c => Math.floor(Number.parseInt(c) * dimmColorFactor));                
                cols.push(dimmedColor.join(' '));
            }
        }

        await lightpanelAPI.setLightpanelColors(indices, cols).catch(e => {});

        if (numActive !== numActiveLightpanels) {
            numActiveLightpanels = numActive;
            logInfo('Temperature changed:', temp + '°');
        }
    }

    isUpdatingLightpanels = false;
}

// weather api
function getWeatherData() {
    return new Promise(async (resolve) => {
        try {
            const res = await fetch(process.env.WEATHER_API);
            resolve(res.ok ? res.json() : null);
        } catch(e) {
            logInfo('ERROR: Weather could not be fetched!');
            resolve(null);
        }
    });
}

// utilities
function logInfo(...p) {
    const dateTimeString = new Date().toLocaleString();
    console.log(dateTimeString, ...p);
}
