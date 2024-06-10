import DiceGridDetectorV1 from './engine/dice_grid_detector_v1.js';
import DiceGridDetectorV2 from './engine/dice_grid_detector_v2.js';
import DiceGridDetectorV3 from './engine/dice_grid_detector_v3.js';

import Templater from './engine/templater.js';
import WhiteBalancer from './engine/white_balance.js';

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
    let outputTableV1 = document.getElementById('outputTableV1');
    outputTableV1.innerHTML = '';
    for (let i = 0; i < detectedV1.length; i++) {
        let row = outputTableV1.insertRow();
        for (let j = 0; j < detectedV1[i].length; j++) {
            let cell = row.insertCell();
            cell.innerHTML = JSON.stringify(detectedV1[i][j]);
        }
    }

    // V2 Detection
    let detectedV2 = DiceGridDetectorV2.detect(grid);
    console.log('detectedV2: ' + JSON.stringify(detectedV2));
    let outputTableV2 = document.getElementById('outputTableV2');
    outputTableV2.innerHTML = '';
    for (let i = 0; i < detectedV2.length; i++) {
        let row = outputTableV2.insertRow();
        for (let j = 0; j < detectedV2[i].length; j++) {
            let cell = row.insertCell();
            cell.innerHTML = JSON.stringify(detectedV2[i][j]);
        }
    }

    // V3 Detection
    let detectedV3 = DiceGridDetectorV3.detect(grid);
    console.log('detectedV3: ' + JSON.stringify(detectedV3));
    let outputTableV3 = document.getElementById('outputTableV3');
    outputTableV3.innerHTML = '';
    for (let i = 0; i < detectedV3.length; i++) {
        let row = outputTableV3.insertRow();
        for (let j = 0; j < detectedV3[i].length; j++) {
            let cell = row.insertCell();
            cell.innerHTML = JSON.stringify(detectedV3[i][j]);
        }
    }
    
    src.delete(); 

    var endTime = performance.now();
    var timeTaken = endTime - startTime;
    document.getElementById('timeTaken').innerHTML = 'Time taken: ' + timeTaken + 'ms';
}

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