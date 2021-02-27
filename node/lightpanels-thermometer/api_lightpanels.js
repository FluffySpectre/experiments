const fetch = require('node-fetch');

class LightpanelAPI {
    constructor(apiUrl) {
        this.lightPanelLayout = null;
        this.lightPanelAPIUrl = apiUrl;
    }

    async init() {
        this.lightPanelLayout = await this.getLightPanelLayout();
    }

    getLightPanelLayout() {
        return fetch(this.lightPanelAPIUrl + '/panelLayout/layout')
            .then(res => res.json());
    }

    isLightpanelOn() {
        return fetch(this.lightPanelAPIUrl + '/state/on')
            .then(res => res.json())
            .then(json => json.value);
    }

    setLightpanelBrightness(brightness) {
        const body =  {
            brightness: {
                value: brightness
            }
        };
        return fetch(this.lightPanelAPIUrl + '/state', {
            method: 'put',
            body:    JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        });
    }

    getActiveEffect() {
        return fetch(this.lightPanelAPIUrl + '/effects/select')
            .then(res => res.json());
    }

    setLightpanelEffect(effect) {
        const body =  {
            select: effect 
        };
        return fetch(this.lightPanelAPIUrl + '/effects', {
            method: 'put',
            body:    JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        });
    }

    setLightpanelColors(ids, cols) {
        let animData = ids.length + ' ';
        for (let i = 0; i < ids.length; i++) {
            animData += this.lightPanelLayout.positionData[ids[i]].panelId + ' 1 ' + cols[i] + ' 0 1 ';
        }
        const body =  {
            write: {
                command: 'display',
                animType: 'static',
                animData: animData,
                loop: false,
                palette: [],
            } 
        };
        return fetch(this.lightPanelAPIUrl + '/effects', {
            method: 'put',
            body:    JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

module.exports = LightpanelAPI;
