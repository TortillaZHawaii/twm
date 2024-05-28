class ColorMasks {
    static getBlack(hsv) {
        // Threshold the HSV image to get only black colors 
        let hsvBlack = new cv.Mat();
        let low = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [0, 0, 0, 0]);
        let high = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [180, 255, 50, 0]);
        cv.inRange(hsv, low, high, hsvBlack);
        return hsvBlack;
    }

    static getYellow(hsv) {
        // Threshold the HSV image to get only yellow colors 
        let hsvYellow = new cv.Mat();
        let low = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [180 * 0.085, 255 * 0.220, 255 * 0.204, 0]);
        let high = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [180 * 0.247, 255, 255, 0]);
        cv.inRange(hsv, low, high, hsvYellow);
        return hsvYellow;
    }

    static getRed(hsv) {
        // Threshold the HSV image to get only red colors 
        let hsvRed = new cv.Mat();
        // Hue range for red is 0-15 and 165-180, since red is wrap around
        let low1 = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [180 * 0.914, 255 * 0.220, 255 * 0.204, 0]);
        let high1 = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [180, 255, 255, 0]);
        cv.inRange(hsv, low1, high1, hsvRed);

        let mat2 = new cv.Mat();
        let low2 = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [0, 255 * 0.220, 255 * 0.204, 0]);
        let high2 = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [180 * 0.075, 255, 255, 0]);
        cv.inRange(hsv, low2, high2, mat2);

        cv.bitwise_or(hsvRed, mat2, hsvRed);
        mat2.delete();

        return hsvRed;
    }

    static getPurple(hsv) {
        // Threshold the HSV image to get only purple colors 
        let hsvPurple = new cv.Mat();
        let low = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [180 * 0.711, 255 * 0.171, 255 * 0.123, 0]);
        let high = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [180 * 0.902, 255, 255, 0]);
        cv.inRange(hsv, low, high, hsvPurple);
        return hsvPurple;
    }

    static getBlue(hsv) {
        // Threshold the HSV image to get only blue colors 
        let hsvBlue = new cv.Mat();
        let low = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [180 * 0.527, 255 * 0.327, 255 * 0.236, 0]);
        let high = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [180 * 0.684, 255, 255, 0]);
        cv.inRange(hsv, low, high, hsvBlue);
        return hsvBlue;
    }

    static getGreen(hsv) {
        // Threshold the HSV image to get only green colors 
        let hsvGreen = new cv.Mat();
        let low = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [180 * 0.354, 255 * 0.109, 255 * 0.07, 0]);
        let high = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [180 * 0.497, 255, 255, 0]);
        cv.inRange(hsv, low, high, hsvGreen);
        return hsvGreen;
    }
}
