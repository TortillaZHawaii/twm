import DiceGridDetectorV2 from './engine/dice_grid_detector.js';
import Templater from './engine/templater.js';
import WhiteBalancer from './engine/white_balance.js';
import ColorMasks from './engine/color_masks.js';

function getContours(hsv, contoursSrcName = null) {
    // Function to get contours for given hsv and draw them
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();

    // let kernel = cv.Mat.ones(5, 5, cv.CV_8UC3);
    // let anchor = new cv.Point(-1, -1);
    // let iterations = 5;
    // cv.morphologyEx(hsv, hsv, cv.MORPH_OPEN, kernel, anchor, iterations);
    let M = cv.Mat.ones(3, 3, cv.CV_8U);
    let N = cv.Mat.ones(2, 2, cv.CV_8U);
    let anchor = new cv.Point(-1, -1);
    let fat = new cv.Mat();
    cv.morphologyEx(hsv, fat, cv.MORPH_OPEN, N, anchor, 3, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    cv.dilate(fat, fat, N, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

    cv.findContours(fat, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

    if (contoursSrcName === null) {
        return contours;
    }

    let dst = cv.Mat.zeros(hsv.rows, hsv.cols, cv.CV_8UC3);

    for (let i = 0; i < contours.size(); ++i) {
        let color = new cv.Scalar(255, 255, 255);
        cv.drawContours(dst, contours, i, color, 1, cv.LINE_8, hierarchy, 100);
    }

    console.log('contoursSrcName: ' + contoursSrcName);
    cv.imshow(contoursSrcName, fat); //dst);
    dst.delete();

    return contours;
}

function detectDices(color, colorMaskFunction, hsv, imgSrcName, gridArray) {
    let colorMask = colorMaskFunction(hsv);
    let contours = getContours(colorMask, imgSrcName);

    function getApproximatedDiceSideLength(hsv) {
        return hsv.rows / 4;
    }

    function getApproximatedCircleRadius(diceLength) {
        return diceLength / 4 / 2;
    }

    let diceSideLength = getApproximatedDiceSideLength(hsv);
    let circleRadius = getApproximatedCircleRadius(diceSideLength);

    let diceAreaLowerBound = diceSideLength * diceSideLength / 2;
    let circleArea = circleRadius * circleRadius * Math.PI;
    let circleAreaLowerBound = 0.4 * circleArea;
    let circleAreaUpperBound = 1.4 * circleArea;
    let noiseArea = 0.1 * circleArea;


    for (let i = 0; i < contours.size(); ++i) {
        let contour = contours.get(i);
        let area = cv.contourArea(contour, false);

        let isNoise = area < noiseArea;

        if (isNoise) {
            continue;
        }

        let perimeter = cv.arcLength(contour, true);
        let circularity = 4 * Math.PI * area / (perimeter * perimeter);
        let centroid = cv.moments(contour, false);
        let x = centroid.m10 / centroid.m00;
        let y = centroid.m01 / centroid.m00;

        let gridX = Math.floor(x / diceSideLength);
        let gridY = Math.floor(y / diceSideLength);

        // if area is close to dice area, it's a dice
        let isSquare = area > diceAreaLowerBound;
        // if area is close to circle area, it's a circle
        let isCircle = area > circleAreaLowerBound && area < circleAreaUpperBound;

        console.log('gridX: ' + gridX + ', gridY: ' + gridY + ',\n circularity: ' + circularity + ', area ' + area + ',\n isSquare: ' + isSquare + ', isCircle: ' + isCircle);

        if (isSquare) {
            gridArray[gridY][gridX].color = color;
        } else if (isCircle) {
            if (gridArray[gridY][gridX].value === undefined) {
                gridArray[gridY][gridX].value = 1;
            } else {
                gridArray[gridY][gridX].value += 1;
            }
        }
    }

    return gridArray;
}

function runDiceDetection() {
    var startTime = performance.now();

    let src = cv.imread('imageSrc');
    // Find edges using Hough Transform
    let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);

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

    let grayPixels = WhiteBalancer.getGrayPixels(src, result.grayPixelCoords);
    let gridWhiteBalanced = WhiteBalancer.balance(grid, grayPixels);
    cv.imshow('gridWhiteBalanced', gridWhiteBalanced);

    // use the white balanced grid for further processing
    grid.delete();
    grid = gridWhiteBalanced;

    // V2 Detection
    let detectedV2 = DiceGridDetectorV2.detect(grid);
    console.log('detectedV2: ' + JSON.stringify(detectedV2));

    // Convert image to HSV
    let hsv = cv.Mat.zeros(grid.rows, grid.cols, cv.CV_8UC3);
    cv.cvtColor(grid, hsv, cv.COLOR_RGB2HSV, 0);
    cv.imshow('hsvOutput', hsv);

    // Threshold the HSV image to get only black colors 
    let hsvBlack = ColorMasks.getBlack(hsv);
    cv.imshow('hsvBlackOutput', hsvBlack);
    let blackCountours = getContours(hsvBlack, hsvBlackOutputContours);

    let cols = 5;
    let rows = 4;
    let gridArray = Array.from(Array(rows), () => Array(cols).fill().map(Object));
    for (let i = 0; i < gridArray.length; i++) {
        for (let j = 0; j < gridArray[i].length; j++) {
            console.log('gridArray[' + i + '][' + j + ']: ' + JSON.stringify(gridArray[i][j]));
        }
    }

    // Threshold the HSV image to get only yellow colors
    let hsvYellow = ColorMasks.getYellow(hsv);
    cv.imshow('hsvYellowOutput', hsvYellow);
    let yellowCountours = getContours(hsvYellow, hsvYellowOutputContours);

    // Detect dices
    gridArray = detectDices('yellow', ColorMasks.getYellow, hsv, hsvYellowOutputContours, gridArray);

    for (let i = 0; i < gridArray.length; i++) {
        for (let j = 0; j < gridArray[i].length; j++) {
            console.log('gridArray[' + i + '][' + j + ']: ' + JSON.stringify(gridArray[i][j]));
        }
    }

    // Threshold the HSV image to get only red colors
    let hsvRed = ColorMasks.getRed(hsv);
    cv.imshow('hsvRedOutput', hsvRed);
    let redCountours = getContours(hsvRed, hsvRedOutputContours);
    gridArray = detectDices('red', ColorMasks.getRed, hsv, hsvRedOutputContours, gridArray);

    // Threshold the HSV image to get only purple colors
    let hsvPurple = ColorMasks.getPurple(hsv);
    cv.imshow('hsvPurpleOutput', hsvPurple);
    let purpleCountours = getContours(hsvPurple, hsvPurpleOutputContours);
    gridArray = detectDices('purple', ColorMasks.getPurple, hsv, hsvPurpleOutputContours, gridArray);

    // Threshold the HSV image to get only blue colors
    let hsvBlue = ColorMasks.getBlue(hsv);
    cv.imshow('hsvBlueOutput', hsvBlue);
    let blueCountours = getContours(hsvBlue, hsvBlueOutputContours);
    gridArray = detectDices('blue', ColorMasks.getBlue, hsv, hsvBlueOutputContours, gridArray);

    // Threshold the HSV image to get only green colors
    let hsvGreen = ColorMasks.getGreen(hsv);
    cv.imshow('hsvGreenOutput', hsvGreen);
    let greenCountours = getContours(hsvGreen, hsvGreenOutputContours);
    gridArray = detectDices('green', ColorMasks.getGreen, hsv, hsvGreenOutputContours, gridArray);

    // write the output to the table
    let table = document.getElementById('outputTable');
    table.innerHTML = '';
    for (let i = 0; i < gridArray.length; i++) {
        let row = table.insertRow();
        for (let j = 0; j < gridArray[i].length; j++) {
            let cell = row.insertCell();
            cell.innerHTML = JSON.stringify(gridArray[i][j]);
        }
    }

    // Mask opening
    let kernel = cv.Mat.ones(3, 3, cv.CV_8U);
    let anchor = new cv.Point(-1, -1);
    let iterations = 1;
    let hsvBlackOpened = new cv.Mat();
    cv.morphologyEx(hsvBlack, hsvBlackOpened, cv.MORPH_OPEN, kernel, anchor, iterations);
    cv.imshow('hsvBlackOpened', hsvBlackOpened);

    // let lines = new cv.Mat();
    // let color = new cv.Scalar(255, 0, 0);
    // // cv.cvtColor(hsv, src, cv.COLOR_RGBA2GRAY, 0);
    // cv.Canny(hsvBlackOpened, hsvBlackOpened, 220, 250, 5);
    // // You can try more different parameters
    // cv.HoughLinesP(hsvBlackOpened, lines, 1, Math.PI / 180, 2, 0, 0);
    // // draw lines
    // for (let i = 0; i < lines.rows; ++i) {
    //     let startPoint = new cv.Point(lines.data32S[i * 4], lines.data32S[i * 4 + 1]);
    //     let endPoint = new cv.Point(lines.data32S[i * 4 + 2], lines.data32S[i * 4 + 3]);
    //     cv.line(dst, startPoint, endPoint, color);
    // }
    // cv.imshow('canvasOutput', dst);
    // Dispose the mats to free memory
    src.delete(); hsv.delete(); hsvBlackOpened.delete();
    hsvBlack.delete();
    hsvYellow.delete();
    hsvRed.delete();
    hsvPurple.delete();
    hsvBlue.delete();
    hsvGreen.delete();
    grid.delete();

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