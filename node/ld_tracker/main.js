const fetch = require('node-fetch');
const fs = require('fs');

const myGameId = 225498;
const apiUrl = 'https://api.ldjam.com/vx';
const checkInterval = 60000 * 10;

// state variables
const dataLast = {
    Smart: null,
    Classic: null,
    Danger: null,
    Grade: null
};
let minMax = {
    SmartPositionMin: Number.MAX_SAFE_INTEGER,
    ClassicPositionMin: Number.MAX_SAFE_INTEGER,
    DangerPositionMin: Number.MAX_SAFE_INTEGER,
    GradePositionMin: Number.MAX_SAFE_INTEGER,
    SmartPositionMax: 0,
    ClassicPositionMax: 0,
    DangerPositionMax: 0,
    GradePositionMax: 0,
};

// utilities
function logInfo(...p) {
    const dateTimeString = new Date().toLocaleString();
    console.log(dateTimeString, ...p, '\x1b[0m');
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
} 

function checkStatus(res) {
    if (res.ok) { // res.status >= 200 && res.status < 300
        return res;
    } else {
        throw 'API ERROR: ' + res.statusText;
    }
}

function loadSaves() {
    try {
        const saveJSON = JSON.parse(fs.readFileSync('save.json'));
        if (saveJSON) {
            minMax = saveJSON.minMax;
        }
    } catch (e) {}
}

function saveSaves() {
    const saveJSON = JSON.stringify({ minMax }, null, 2);
    if (saveJSON) {
        fs.writeFileSync('save.json', saveJSON);
    }
}

function getGames(offset, limit, filter) {
    return fetch(apiUrl + '/node/feed/212256/' + filter + '+parent/item/game/compo+jam?offset=' + offset + '&limit=' + limit)
        .then(checkStatus)
        .then(res => res.json());
}

async function getRankInFilter(filter) {
    let offset = 0;
    let limit = 250;
    let games = null;

    let data = { position: 0, score: 0, total: 0 };

    while (games == null || (games.feed && games.feed.length > 0)) {
        const games = await getGames(offset, limit, filter).catch(e => {
            logInfo(e);
        });
    
        if (!games || games.feed.length === 0) break;

        // find my game
        for (let i=0; i<games.feed.length; i++) {
            if (games.feed[i].id == myGameId) {
                data.position = (offset + i) + 1;
                data.score = games.feed[i].score;
                break;
            }
        }

        offset += games.feed.length;

        await sleep(50);
    }

    data.total = offset;

    return data;
}

function getDiffs(data, filterName) {
    let posDiff = 0, scoreDiff = 0;
    
    if (dataLast[filterName]) {
        posDiff = dataLast[filterName].position - data.position;
        scoreDiff = dataLast[filterName].score - data.score;
    }

    return { posDiff, scoreDiff };
}

async function doStuff() {
    const dataSmart = await getRankInFilter('smart');
    const dataClassic = await getRankInFilter('cool');
    const dataDanger = await getRankInFilter('danger');
    const dataGrade = await getRankInFilter('grade');

    // calculate diffs
    const smartDiff = getDiffs(dataSmart, 'Smart');
    const classicDiff = getDiffs(dataClassic, 'Classic');
    const dangerDiff = getDiffs(dataDanger, 'Danger');
    const gradeDiff = getDiffs(dataGrade, 'Grade');

    const somethingChanged = smartDiff.posDiff !== 0 || classicDiff.posDiff !== 0 || dangerDiff.posDiff !== 0 || gradeDiff.posDiff !== 0;

    // save min max
    minMax.SmartPositionMin = dataSmart.position < minMax.SmartPositionMin ? dataSmart.position : minMax.SmartPositionMin;
    minMax.SmartPositionMax = dataSmart.position > minMax.SmartPositionMax ? dataSmart.position : minMax.SmartPositionMax;
    minMax.ClassicPositionMin = dataClassic.position < minMax.ClassicPositionMin ? dataClassic.position : minMax.ClassicPositionMin;
    minMax.ClassicPositionMax = dataClassic.position > minMax.ClassicPositionMax ? dataClassic.position : minMax.ClassicPositionMax;
    minMax.DangerPositionMin = dataDanger.position < minMax.DangerPositionMin ? dataDanger.position : minMax.DangerPositionMin;
    minMax.DangerPositionMax = dataDanger.position > minMax.DangerPositionMax ? dataDanger.position : minMax.DangerPositionMax;
    minMax.GradePositionMin = dataGrade.position < minMax.GradePositionMin ? dataGrade.position : minMax.GradePositionMin;
    minMax.GradePositionMax = dataGrade.position > minMax.GradePositionMax ? dataGrade.position : minMax.GradePositionMax;

    const fontColorRed = '\x1b[31m';
    const fontColorGreen = '\x1b[32m';
    let fontColor = null;

    if (somethingChanged) {
        if (smartDiff.posDiff !== 0) {
            if (smartDiff.posDiff > 0) fontColor = fontColorGreen;
            else fontColor = fontColorRed;
            logInfo(fontColor, 'SMART rank: ' + dataLast.Smart.position + ' -> ' + dataSmart.position + ' of ' + dataSmart.total + ' (Highest: ' + minMax.SmartPositionMin + ' - Lowest: ' + minMax.SmartPositionMax + ')');
        }
        if (classicDiff.posDiff !== 0) {
            if (classicDiff.posDiff > 0) fontColor = fontColorGreen;
            else fontColor = fontColorRed;
            logInfo(fontColor, 'CLASSIC rank: ' + dataLast.Classic.position + ' -> ' + dataClassic.position + ' of ' + dataClassic.total + ' (Highest: ' + minMax.ClassicPositionMin + ' - Lowest: ' + minMax.ClassicPositionMax + ')');
        }
        if (dangerDiff.posDiff !== 0) {
            if (dangerDiff.posDiff > 0) fontColor = fontColorGreen;
            else fontColor = fontColorRed;
            logInfo(fontColor, 'DANGER rank: ' + dataLast.Danger.position + ' -> ' + dataDanger.position + ' of ' + dataDanger.total + ' (Highest: ' + minMax.DangerPositionMin + ' - Lowest: ' + minMax.DangerPositionMax + ')');
        }
        if (gradeDiff.posDiff !== 0) {
            if (gradeDiff.posDiff > 0) fontColor = fontColorGreen;
            else fontColor = fontColorRed;
            logInfo(fontColor, 'GRADE rank: ' + dataLast.Grade.position + ' -> ' + dataGrade.position + ' of ' + dataGrade.total + ' (Highest: ' + minMax.GradePositionMin + ' - Lowest: ' + minMax.GradePositionMax + ')');
        }
    }

    dataLast.Smart = dataSmart;
    dataLast.Classic = dataClassic;
    dataLast.Danger = dataDanger;
    dataLast.Grade = dataGrade;

    saveSaves();
}

loadSaves();

setInterval(() => doStuff(), checkInterval);
doStuff();

logInfo('LD Game rank tracking started');
