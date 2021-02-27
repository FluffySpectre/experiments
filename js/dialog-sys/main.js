const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let scriptedVars = {};
let currentDialogue;

function startDialogue(dialogueId, sectionId = '000') {
    try {
        const dialogueJSON = fs.readFileSync('dialogue/' + dialogueId + '.json');
        currentDialogue = JSON.parse(dialogueJSON);

        playSection(sectionId);
    } catch (e) {
        console.log('startDialogue:', e);
    }
}

function playSection(sectionId) {
    const section = currentDialogue[sectionId];

    console.log(section.speaker_id + ':', section.text);

    if (Array.isArray(section.commands)) {
        for (let c of section.commands) {
            executeCommand(c);
        }
    }

    if (section.next) {
        playSection(section.next);

    } else if (Array.isArray(section.responses)) {
        let index = 1;
        for (let r of section.responses) {
            if (Array.isArray(r.commands)) {
                for (let c of r.commands) {
                    executeCommand(c);
                }
            }

            console.log('(' + index + ')', r.text);
            index++;
        }

        rl.question('Choice: ', (answer) => {
            const resIndex = parseInt(answer);
            if (typeof resIndex === 'number' && section.responses[resIndex-1]) {
                playSection(section.responses[resIndex-1].next);
            }
            rl.close();
        });
    }
}

function executeCommand(commandLine) {
    const args = commandLine.split(' ');
    if (args.length > 0) {
        const command = args[0];
        args.splice(0, 1);

        if (command === 'set') {
            if (args.length >= 2) {
                const varName = args[0];
                const varValue = str2var(args[1]);
                scriptedVars[varName] = varValue;
            }
        } else if (command === 'modify') {
            if (args.length >= 2) {
                const varName = args[0];
                const varValue = str2var(args[1]);
                scriptedVars.hasOwnProperty(varName) ? scriptedVars[varName] += varValue : scriptedVars[varName] = varValue;
            }
        }

        console.log('ScriptedVars', scriptedVars);
    }
}

function str2var(val) {
    let convertedValue = (val === 'true');
    if (convertedValue) return true;
    convertedValue = (val === 'false');
    if (convertedValue) return false;
    convertedValue = parseInt(val);
    if (!isNaN(convertedValue)) return convertedValue;
    return null;
}

// process.stdin.on('keypress', (c, k) => {
//     console.log(c);
// });

console.clear();
startDialogue('teddy_offer');