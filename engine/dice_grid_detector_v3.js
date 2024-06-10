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

        for (let row = 0; row < DiceBoard.rows; row++) {
            for (let col = 0; col < DiceBoard.columns; col++) {
                colors[row][col] = this._getDiceColor(hsv, row, col);
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

    static _getDiceColor(hsv, row, col) {
        let diceLength = this._getApproximateDiceSideLength(hsv);
        let diceArea = diceLength * diceLength;
        let areaThreshold = diceArea * 0.5;

        let hueSum = 0;
        let count = 0;

        for (let y = row * diceLength; y < (row + 1) * diceLength; y++) {
            for (let x = col * diceLength; x < (col + 1) * diceLength; x++) {
                let saturation = hsv.ucharPtr(y, x)[1];
                let value = hsv.ucharPtr(y, x)[2];
                
                // Skip white and black colors
                let saturationThreshold = 0.4 * 255;
                // let valueThreshold = 0.4 * 255;
                if (saturation < saturationThreshold) {
                    continue;
                }

                let hue = hsv.ucharPtr(y, x)[0];
                hueSum += hue;
                count++;
            }
        }

        if (count < areaThreshold) {
            console.log('Skipping dice with area', count, 'less than', areaThreshold);
            return null;
        }

        let averageHue = hueSum / count;

        // Get closest color based on closest hue
        // Note that we calculate the distance in the hue circle, 
        // so the value 178 is closer to 2 than for example 6
        // Average is taken from masks in color_masks.js
        let colors = [
            { name: DiceColor.Red, hue: 0 },
            { name: DiceColor.Yellow, hue: 180 * (0.085 + 0.247) / 2 }, // ~29
            { name: DiceColor.Green, hue: 180 * (0.354 + 0.497) / 2}, // ~76
            { name: DiceColor.Blue, hue: 180 * (0.527 + 0.684) / 2}, // ~108
            { name: DiceColor.Purple, hue: 180 *  (0.711 + 0.902) / 2 }, // ~145
        ];

        let minDistance = Number.MAX_VALUE;
        let color = null;

        let logMessage = [];
        logMessage.push('Average hue is', averageHue, 'based on', count, 'pixels');

        for (let i = 0; i < colors.length; i++) {
            let distance = Math.min(
                Math.abs(averageHue - colors[i].hue),
                Math.abs(averageHue - colors[i].hue + 180)
            );
            logMessage.push('\n', 'Distance to', colors[i].name, 'with hue:', colors[i].hue, 'equals', distance);

            if (distance < minDistance) {
                minDistance = distance;
                color = colors[i].name;
            }
        }
        logMessage.push('\n', 'Closest color is', color);
        console.log(logMessage.join(' '));

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