const fetch = require('node-fetch');
const Table = require('cli-table');

const myGameId = 225498;
const apiUrl = 'https://api.ldjam.com/vx';
const checkInterval = 60000;

// state variables
const dataLast = {
    Smart: null,
    Classic: null,
    Danger: null,
    Grade: null
};

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
} 

function getGames(offset, limit, filter) {
    return fetch(apiUrl + '/node/feed/212256/' + filter + '+parent/item/game/compo+jam?offset=' + offset + '&limit=' + limit).then(res => res.json());
}

async function getRankInFilter(filter) {
    let offset = 0;
    let limit = 250;
    let games = null;

    while (games == null || (games.feed && games.feed.length > 0)) {
        const games = await getGames(offset, limit, filter);

        // find my game
        let gameFound = false;
        let data = { position: 0, score: 0 };
        for (let i=0; i<games.feed.length; i++) {
            if (games.feed[i].id == myGameId) {
                data.position = (offset + i) + 1;
                data.score = games.feed[i].score;
                gameFound = true;
                break;
            }
        }

        if (gameFound) {
            return data;
        }

        offset += limit;

        await sleep(250);
    }

    return null;
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

    const dateTimeString = new Date().toLocaleString();
    console.log('Ranks at ' + dateTimeString);
    console.log(' ');

    // calculate diffs
    let smartDiff = getDiffs(dataSmart, 'Smart');
    let classicDiff = getDiffs(dataClassic, 'Classic');
    let dangerDiff = getDiffs(dataDanger, 'Danger');
    let gradeDiff = getDiffs(dataGrade, 'Grade');

    const tableData = new Table({
            head: ['Filter', 'Position', 'Score'] ,
        }
    );
    tableData.push(['Smart',  dataSmart.position + ' (' + smartDiff.posDiff + ')', dataSmart.score + ' (' + smartDiff.scoreDiff + ')' ],
    ['Classic',  dataClassic.position + ' (' + classicDiff.posDiff + ')', dataClassic.score + ' (' + classicDiff.scoreDiff + ')' ],
    ['Danger', dataDanger.position + ' (' + dangerDiff.posDiff + ')', dataDanger.score + ' (' + dangerDiff.scoreDiff + ')' ],
    ['Grade', dataGrade.position + ' (' + gradeDiff.posDiff + ')', dataGrade.score + ' (' + gradeDiff.scoreDiff + ')' ]);

    dataLast.Smart = dataSmart;
    dataLast.Classic = dataClassic;
    dataLast.Danger = dataDanger;
    dataLast.Grade = dataGrade;

    console.log(tableData.toString());

    console.log(' ');
    console.log('--------------------------------------');
    console.log(' ');

    setTimeout(() => doStuff(), checkInterval);
}

doStuff();
