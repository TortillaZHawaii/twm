import DiceBoard from '../entities/dice_board.js';
import Dice from '../entities/dice.js';
import DiceColor from '../entities/dice_color.js';

import ColorMasks from './color_masks.js';

class DiceGridDetectorV1 {

}

class DiceGridDetectorV2 {
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

                if (!hasColor || !hasEye) {
                    console.log('Skipping', row, col);
                    continue;
                }

                console.log(row, col, color, eye);
                diceBoard.set(row, col,
                    new Dice(color, eye)
                );
            }
        }
        
        return diceBoard;
    }

    static _retrieveGridColors(hsv) {
        let dicesMask = ColorMasks.getWithoutBlack(hsv);
        this._dilateDicesMask(dicesMask);
        
        let diceContours = new cv.MatVector();
        let diceHierarchy = new cv.Mat();
        cv.findContours(dicesMask, diceContours, diceHierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        let expectedSideLength = this._getApproximateDiceSideLength(hsv);
        let expectedArea = expectedSideLength * expectedSideLength;
        let margin = 0.5;
        let minArea = expectedArea * (1 - margin);
        let maxArea = expectedArea * (1 + margin);

        // 4 by 5 grid with nulls
        let colors = new Array(DiceBoard.rows).fill(null)
            .map(() => new Array(DiceBoard.columns).fill(null));

        console.log('Found ' + diceContours.size() + ' dice contours');
        for (let i = 0; i < diceContours.size(); i++) {
            let contour = diceContours.get(i);
            let area = cv.contourArea(contour);

            if (area < minArea || area > maxArea) {
                console.log('Skipping contour with area', area);
                continue;
            }

            let centroid = cv.moments(contour, false);
            let x = centroid.m10 / centroid.m00;
            let y = centroid.m01 / centroid.m00;

            let color = this._getDiceColor(hsv, contour);

            console.log(x, y, color);
            let { row, col } = this._getGridPosition(y, x, hsv);
            console.log(row, col, color);
            colors[row][col] = color;
        }

        diceContours.delete();
        diceHierarchy.delete();
        dicesMask.delete();

        return colors;
    }

    static _retrieveGridEyes(hsv) {
        let eyesMask = ColorMasks.getWhite(hsv);
        this._dilateEyesMask(eyesMask);

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

    static _getDiceColor(hsv, contour) {
        // Get average hue of the contour
        let hueSum = 0;
        let count = 0;
        for (let i = 0; i < contour.rows; i++) {
            let [x, y] = contour.intPtr(i);
            let saturation = hsv.ucharPtr(y, x)[1];
            
            // Skip white and black colors
            let saturationThreshold = 0.4 * 255;
            if (saturation < saturationThreshold) {
                continue;
            }

            let hue = hsv.ucharPtr(y, x)[0];
            hueSum += hue;
            count++;
        }
        let averageHue = hueSum / count;

        // Get closest color based on closest hue
        // Note that we calculate the distance in the hue circle, 
        // so the value 178 is closer to 2 than for example 6
        // Average is taken from masks in color_masks.js
        let colors = [
            { name: DiceColor.Yellow, hue: 180 * (0.085 + 0.247) / 2 },
            { name: DiceColor.Red, hue: 0 },
            { name: DiceColor.Purple, hue: 180 *  (0.711 + 0.902) / 2 },
            { name: DiceColor.Blue, hue: 180 * (0.527 + 0.684) / 2},
            { name: DiceColor.Green, hue: 180 * (0.354 + 0.497) / 2}
        ];

        let minDistance = Number.MAX_VALUE;
        let color = null;
        console.log('Average hue', averageHue);

        for (let i = 0; i < colors.length; i++) {
            // TODO: Fix the distance wrap around calculation
            let distance = Math.min(
                Math.abs(averageHue - colors[i].hue),
                Math.abs(averageHue - colors[i].hue + 180)
            );
            console.log('Distance to ', colors[i].name, ' with hue: ', colors[i].hue, 'equals', distance);

            if (distance < minDistance) {
                minDistance = distance;
                color = colors[i].name;
            }
        }

        return color;
    }

    static _dilateDicesMask(dicesMask) {
        let kernel = cv.Mat.ones(3, 3, cv.CV_8U);
        cv.dilate(dicesMask, dicesMask, kernel);
        kernel.delete();
    }

    static _getApproximateDiceSideLength(img) {
        // there are more columns than rows, 
        // so the result should be a bit more accurate
        console.log(img.cols, DiceBoard.columns);
        return img.cols / DiceBoard.columns;
    }

    static _getGridPosition(y, x, img) {
        let sideLength = this._getApproximateDiceSideLength(img);
        let row = Math.floor(y / sideLength);
        let col = Math.floor(x / sideLength);
        return { row, col };
    }

    static _dilateEyesMask(eyesMask) {
        let kernel = cv.Mat.ones(1, 1, cv.CV_8U);
        cv.dilate(eyesMask, eyesMask, kernel);
        kernel.delete();
    }
}

export default DiceGridDetectorV2;