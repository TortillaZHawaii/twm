import DiceBoard from '../entities/dice_board.js';
import Dice from '../entities/dice.js';
import DiceColor from '../entities/dice_color.js';

import DiceGridDetector from './dice_grid_detector.js';
import ColorMasks from './color_masks.js';

class DiceGridDetectorV1 extends DiceGridDetector {
    static detect(gridImageRgb) {
        // Convert the image to HSV
        let hsv = new cv.Mat();
        cv.cvtColor(gridImageRgb, hsv, cv.COLOR_RGB2HSV);
        cv.imshow('hsvOutput', hsv);

        let cols = DiceBoard.columns;
        let rows = DiceBoard.rows;
        let gridArray = Array.from(Array(rows), () => Array(cols).fill().map(Object));

        gridArray = this._detectDices(DiceColor.Yellow, ColorMasks.getYellow, hsv,
            'hsvYellowOutputContours', 'hsvYellowOutput', gridArray);

        gridArray = this._detectDices(DiceColor.Red, ColorMasks.getRed, hsv, 
            'hsvRedOutputContours', 'hsvRedOutput', gridArray);
        
        gridArray = this._detectDices(DiceColor.Purple, ColorMasks.getPurple, hsv, 
            'hsvPurpleOutputContours', 'hsvPurpleOutput', gridArray);

        gridArray = this._detectDices(DiceColor.Blue, ColorMasks.getBlue, hsv,
            'hsvBlueOutputContours', 'hsvBlueOutput', gridArray);

        gridArray = this._detectDices(DiceColor.Green, ColorMasks.getGreen, hsv,
            'hsvGreenOutputContours', 'hsvGreenOutput', gridArray);

        hsv.delete();

        let diceBoard = new DiceBoard();

        for (let row = 0; row < DiceBoard.rows; row++) {
            for (let col = 0; col < DiceBoard.columns; col++) {
                let color = gridArray[row][col].color;
                let eye = gridArray[row][col].value;

                let hasColor = color !== null && color !== undefined;
                let hasEye = eye !== null && eye !== undefined && eye > 0;

                console.log('V1 Result:', row, col, color, eye);

                if (!hasColor || !hasEye) {
                    console.log('Skipping', row, col);
                    continue;
                }

                if (eye > 6) {
                    console.warn('V1 Too many eyes', row, col, eye);
                    eye = 6;
                }

                diceBoard.set(row, col,
                    new Dice(color, eye)
                );
            }
        }
        
        return diceBoard;
    }

    static _detectDices(color, colorMaskFunction, hsv, 
            imgSrcName, hsvName, gridArray) {
        let colorMask = colorMaskFunction(hsv);
        cv.imshow(hsvName, colorMask);
        let contours = this._getContours(colorMask, imgSrcName);
    
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

    static _getContours(hsv, contoursSrcName = null) {
        // Function to get contours for given hsv and draw them
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
    
        cv.findContours(hsv, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    
        if (contoursSrcName === null) {
            return contours;
        }
    
        let dst = cv.Mat.zeros(hsv.rows, hsv.cols, cv.CV_8UC3);
    
        for (let i = 0; i < contours.size(); ++i) {
            let color = new cv.Scalar(255, 255, 255);
            cv.drawContours(dst, contours, i, color, 1, cv.LINE_8, hierarchy, 100);
        }
    
        console.log('contoursSrcName: ' + contoursSrcName);
        cv.imshow(contoursSrcName, dst);
        dst.delete();
    
        return contours;
    }
}

export default DiceGridDetectorV1;