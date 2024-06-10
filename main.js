import DiceGridDetectorV1 from './engine/dice_grid_detector_v1.js';
import DiceGridDetectorV2 from './engine/dice_grid_detector_v2.js';
import DiceGridDetectorV3 from './engine/dice_grid_detector_v3.js';

import Templater from './engine/templater.js';
import WhiteBalancer from './engine/white_balance.js';
import DiceBoard from './entities/dice_board.js';
import DiceColor from './entities/dice_color.js';

import * as rules from './rules/rules.js';

function runDiceDetection() {
    var startTime = performance.now();

    let src = cv.imread('imageSrc');

    // Draw the template on the src copy
    let template = cv.imread('templateImage');
    let templater = new Templater(template);
    let result = templater.render(src);

    cv.imshow('withTemplate', result.imageWithTemplate);
    // draw dots on gray points to check if they are aligned
    for (let i = 0; i < result.grayPixelCoords.length; i++) {
        let point = result.grayPixelCoords[i];
        console.log('gray point: ' + JSON.stringify(point));
        cv.circle(result.imageWithTemplate, point, 1, new cv.Scalar(0, 0, 255), -1);
    }
    cv.imshow('grayPoints', result.imageWithTemplate);

    result.imageWithTemplate.delete();

    // Get the grid based on template roi
    let grid = src.roi(result.gridRoi);
    cv.imshow('gridOnly', grid);

    // White balance the grid
    let grayPixels = WhiteBalancer.getGrayPixels(src, result.grayPixelCoords);
    let gridWhiteBalanced = WhiteBalancer.balance(grid, grayPixels);
    cv.imshow('gridWhiteBalanced', gridWhiteBalanced);
    grid.delete();
    grid = gridWhiteBalanced;

    // V1 Detection
    let detectedV1 = DiceGridDetectorV1.detect(grid);
    console.log('detectedV1: ' + JSON.stringify(detectedV1));
    printDicesBoard(detectedV1, 'outputTableV1');

    // V2 Detection
    let detectedV2 = DiceGridDetectorV2.detect(grid);
    console.log('detectedV2: ' + JSON.stringify(detectedV2));
    printDicesBoard(detectedV2, 'outputTableV2');

    // V3 Detection
    let detectedV3 = DiceGridDetectorV3.detect(grid);
    console.log('detectedV3: ' + JSON.stringify(detectedV3));
    printDicesBoard(detectedV3, 'outputTableV3');

    // Calculate score
    calculateScore(detectedV3);
    
    src.delete(); 

    var endTime = performance.now();
    var timeTaken = endTime - startTime;
    document.getElementById('timeTaken').innerHTML = 'Time taken: ' + timeTaken + 'ms';
}

function printDicesBoard(board, tableElementId) {
    let outputTable = document.getElementById(tableElementId);
    outputTable.innerHTML = '';
    for (let i = 0; i < DiceBoard.rows; i++) {
        let row = outputTable.insertRow();
        for (let j = 0; j < DiceBoard.columns; j++) {
            let cell = row.insertCell();
            let dice = board.get(i, j);
            let diceSize = 30;
            
            if (dice === null) {
                // gray cell
                cell.innerHTML =
                    '<div style="background-color: gray; ' +
                    'width: ' + diceSize + 'px; ' +
                    'height: ' + diceSize + 'px;"></div>';
                continue;
            }
            // align text to center and center height
            cell.innerHTML =
                '<div style="background-color: ' + dice.color + '; ' +
                'color: ' + (dice.color === DiceColor.Yellow ? 'black' : 'white') + '; ' +
                'text-align: center; ' +
                'line-height: ' + diceSize + 'px; ' +
                'width: ' + diceSize + 'px; ' +
                'height: ' + diceSize + 'px;">' +
                dice.value + '</div>';
        }
    }
}

const globalRules = [
    new rules.global.DiverseShadesInRow(),
    new rules.global.DiverseColorsInRow(),
    new rules.global.DiverseShadesInColumn(),
    new rules.global.DiverseColorsInColumn(),
    new rules.global.DiverseColorsSet(),
    new rules.global.DiverseShadesSet(),
    new rules.global.DarkShades(),
    new rules.global.MediumShades(),
    new rules.global.LightShades(),
    new rules.global.DiagonalsRule()
];

const individualRules = [
    new rules.individual.RedRule(),
    new rules.individual.YellowRule(),
    new rules.individual.GreenRule(),
    new rules.individual.BlueRule(),
    new rules.individual.PurpleRule()
];

function hydrateRuleOptions() {
    let globalRulesOptions = document.getElementById('globalRules');

    for (let rule of globalRules) {
        console.log('Rule: ' + rule.title);
        let option = document.createElement('option');
        option.value = rule.title;
        option.text = rule.title;
        globalRulesOptions.appendChild(option);
    }

    let individualRuleOptions = document.getElementById('individualRule');

    for (let rule of individualRules) {
        console.log('Rule: ' + rule.title);
        let option = document.createElement('option');
        option.value = rule.title;
        option.text = rule.title;
        individualRuleOptions.appendChild(option);
    }
}

function calculateScore(board) {
    let totalScore = 0;

    // Get selected rules
    let globalRulesOptions = document.getElementById('globalRules');
    
    for (let i = 0; i < globalRulesOptions.length; i++) {
        let option = globalRulesOptions[i];
        if (option.selected) {
            let rule = globalRules.find(r => r.title === option.value);
            let score = rule.calculateScore(board);
            console.log('Global rule: ' + rule.title + ' score: ' + score);
            totalScore += score;
        }
    }

    let individualRuleOptions = document.getElementById('individualRule');
    // only one individual rule can be selected
    for (let i = 0; i < individualRuleOptions.length; i++) {
        let option = individualRuleOptions[i];
        if (option.selected) {
            let rule = individualRules.find(r => r.title === option.value);
            let score = rule.calculateScore(board);
            console.log('Individual rule: ' + rule.title + ' score: ' + score);
            totalScore += score;
        }
    }
    
    document.getElementById('totalScore').innerHTML = 'Total score: ' + totalScore;
}

hydrateRuleOptions();
let btnElement = document.getElementById('runDiceDetectionBtn');
btnElement.addEventListener('click', runDiceDetection);
let imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');
inputElement.addEventListener('change', (e) => {
    imgElement.src = URL.createObjectURL(e.target.files[0]);
}, false);

var Module = {
    // https://emscripten.org/docs/api_reference/module.html#Module.onRuntimeInitialized
    onRuntimeInitialized() {
        document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
        imgElement.onload = runDiceDetection;
    }
};