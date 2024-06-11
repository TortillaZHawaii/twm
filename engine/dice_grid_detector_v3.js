import DiceBoard from '../entities/dice_board.js';
import Dice from '../entities/dice.js';
import DiceColor from '../entities/dice_color.js';

import DiceGridDetector from './dice_grid_detector.js';
import ColorMasks from './color_masks.js';

class DiceGridDetectorV3 extends DiceGridDetector {
    static detect(gridImageRgb) {
        // Convert the image to HSV
        let hsv = new cv.Mat();
        cv.cvtColor(gridImageRgb, hsv, cv.COLOR_RGB2HSV);

        let gridColors = this._retrieveGridColors(hsv);
        let gridEyes = this._retrieveGridEyes(hsv);

        hsv.delete();

        let diceBoard = new DiceBoard();

        for (let row = 0; row < DiceBoard.rows; row++) {
            for (let col = 0; col < DiceBoard.columns; col++) {
                let color = gridColors[row][col];
                let eye = gridEyes[row][col];

                let hasColor = color !== null;
                let hasEye = eye !== null && eye > 0;

                console.log('V3 Result:', row, col, color, eye);

                if (!hasColor || !hasEye) {
                    console.log('Skipping', row, col);
                    continue;
                }

                if (eye > 6) {
                    console.warn('V3 Too many eyes', row, col, eye);
                    eye = 6;
                }

                diceBoard.set(row, col,
                    new Dice(color, eye)
                );
            }
        }
        
        return diceBoard;
    }

    static _retrieveGridColors(hsv) {
        // 4 by 5 grid with nulls
        let colors = new Array(DiceBoard.rows).fill(null)
            .map(() => new Array(DiceBoard.columns).fill(null));

        let paragraph = document.getElementById('approxAreaV3');
        let diceLength = this._getApproximateDiceSideLength(hsv);
        let diceArea = diceLength * diceLength;
        paragraph.innerHTML = 'Approximate dice area: ' + diceArea;

        let table = document.getElementById('colorTableV3');
        table.innerHTML = '';

        for (let row = 0; row < DiceBoard.rows; row++) {
            let tableRow = table.insertRow();
            for (let col = 0; col < DiceBoard.columns; col++) {
                let cell = tableRow.insertCell();
                colors[row][col] = this._getDiceColor(hsv, row, col, cell);
            }
        }

        return colors;
    }

    static _retrieveGridEyes(hsv) {
        let eyesMask = ColorMasks.getWhite(hsv);
        cv.imshow('eyesMaskV3', eyesMask);
        this._erodeEyesMask(eyesMask);
        cv.imshow('eyesMaskErodedV3', eyesMask);

        let eyeContours = new cv.MatVector();
        let eyeHierarchy = new cv.Mat();
        cv.findContours(eyesMask, eyeContours, eyeHierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        // 4 by 5 grid with zeros
        let eyes = new Array(DiceBoard.rows).fill(null)
            .map(() => new Array(DiceBoard.columns).fill(0));

        console.log('Found ' + eyeContours.size() + ' eyes contours');
        for (let i = 0; i < eyeContours.size(); i++) {
            let contour = eyeContours.get(i);
            let centroid = cv.moments(contour, false);
            if (centroid.m00 === 0) {
                continue;
            }
            let x = centroid.m10 / centroid.m00;
            let y = centroid.m01 / centroid.m00;

            let { row, col } = this._getGridPosition(y, x, hsv);
            console.log(row, col, JSON.stringify(eyes));
            eyes[row][col]++;
        }

        eyeContours.delete();
        eyeHierarchy.delete();
        eyesMask.delete();

        return eyes;
    }

    static _getDiceColor(hsv, row, col, cellHtml = null) {
        let diceLength = this._getApproximateDiceSideLength(hsv);
        let diceArea = diceLength * diceLength;
        let areaThreshold = diceArea * 0.1;

        let colorsCount = {
            [DiceColor.Red]: 0,
            [DiceColor.Yellow]: 0,
            [DiceColor.Green]: 0,
            [DiceColor.Blue]: 0,
            [DiceColor.Purple]: 0,
        };

        // Get closest color based on closest hue
        // Note that we calculate the distance in the hue circle, 
        // so the value 178 is closer to 2 than for example 6
        // Average is taken from masks in color_masks.js
        let colors = [
            { name: DiceColor.Red, hue: 170 },
            { name: DiceColor.Yellow, hue: 180 * (0.085 + 0.247) / 2 }, // ~29
            { name: DiceColor.Green, hue: 180 * (0.354 + 0.497) / 2}, // ~76
            { name: DiceColor.Blue, hue: 180 * (0.527 + 0.684) / 2}, // ~108
            { name: DiceColor.Purple, hue: 180 *  (0.711 + 0.902) / 2 }, // ~145
        ];

        let count = 0;

        for (let y = row * diceLength; y < (row + 1) * diceLength; y++) {
            for (let x = col * diceLength; x < (col + 1) * diceLength; x++) {
                let saturation = hsv.ucharPtr(y, x)[1];
                let value = hsv.ucharPtr(y, x)[2];
                
                // Skip white and black colors
                let saturationThreshold = 0.4 * 255;
                if (saturation < saturationThreshold) {
                    continue;
                }

                let valueThreshold = 0.2 * 255;
                if (value < valueThreshold) {
                    continue;
                }

                let hue = hsv.ucharPtr(y, x)[0];
                count++;
                
                let minDistance = Number.MAX_VALUE;
                let color = null;
                for (let i = 0; i < colors.length; i++) {
                    let distance = Math.min(
                        Math.abs(hue - colors[i].hue),
                        Math.abs(hue - colors[i].hue + 180)
                    );

                    if (distance < minDistance) {
                        minDistance = distance;
                        color = colors[i].name;
                    }
                }
                colorsCount[color]++;
            }
        }

        if (cellHtml) {
            let style = "border: 1px solid black; border-collapse: collapse;";
            cellHtml.innerHTML = 'Red: ' + colorsCount[DiceColor.Red] + '<br>' +
                'Yellow: ' + colorsCount[DiceColor.Yellow] + '<br>' +
                'Green: ' + colorsCount[DiceColor.Green] + '<br>' +
                'Blue: ' + colorsCount[DiceColor.Blue] + '<br>' +
                'Purple: ' + colorsCount[DiceColor.Purple] + '<br>';
            cellHtml.style = style;
        }

        if (count < areaThreshold) {
            console.log('Skipping dice with area', count, 'less than', areaThreshold);
            return null;
        }

        let color = null;

        for (let key in colorsCount) {
            if (colorsCount[key] > count / 2) {
                color = key;
                break;
            }
        }

        

        return color;
    }

    static _getApproximateDiceSideLength(img) {
        // there are more columns than rows, 
        // so the result should be a bit more accurate
        return (img.cols / DiceBoard.columns);
    }

    static _getApproximateEyeRadius(img) {
        let diceSideLength = this._getApproximateDiceSideLength(img);
        return diceSideLength / 4 / 2;
    }

    static _getGridPosition(y, x, img) {
        let sideLength = this._getApproximateDiceSideLength(img);
        let row = Math.floor(y / sideLength);
        let col = Math.floor(x / sideLength);
        return { row, col };
    }

    static _erodeEyesMask(eyesMask) {
        let kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(3, 3));
        cv.erode(eyesMask, eyesMask, kernel);
        kernel.delete();
    }
}

export default DiceGridDetectorV3;