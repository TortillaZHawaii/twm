class WhiteBalancer {
    static _getAverageGray(grayPixels) {
        let sum = {r: 0, g: 0, b: 0};
        for (let i = 0; i < grayPixels.length; i++) {
            sum.r += grayPixels[i].r;
            sum.g += grayPixels[i].g;
            sum.b += grayPixels[i].b;
        }

        let avg = {
            r: sum.r / grayPixels.length, 
            g: sum.g / grayPixels.length,
            b: sum.b / grayPixels.length
        };

        let k = (avg.r + avg.g + avg.b) / 3;
        let kr = k / avg.r;
        let kg = k / avg.g;
        let kb = k / avg.b;

        return {kr, kg, kb};
    }

    static balance(image, grayPixels) {
        let {kr, kg, kb} = this._getAverageGray(grayPixels);

        console.log(kr, kg, kb);

        let result = image.clone();

        for (let i = 0; i < result.rows; i++) {
            for (let j = 0; j < result.cols; j++) {
                let pixel = result.ucharPtr(i, j);
                pixel[0] *= kr;
                pixel[1] *= kg;
                pixel[2] *= kb;
            }
        }
        

        return result;
    }

    static getGrayPixels(image, grayPixelCoords) {
        let grayPixels = [];
        for (let i = 0; i < grayPixelCoords.length; i++) {
            let {x, y} = grayPixelCoords[i];
            let pixel = image.ucharPtr(y, x);
            grayPixels.push({r: pixel[0], g: pixel[1], b: pixel[2]});
        }
        return grayPixels;
    }
}