export default class Templater {
    // template: cv.Mat
    constructor(template) {
        // this would be better to load from a file but unsure how to do that
        this.template = template;
        // hardcoded, since the loaded template can be resized
        this.rowsFromPng = 1280;
        this.colsFromPng = 565;
        this.padding = 0.1;
    }

    _getScale(src, dst) {
        let scaleHorizontal = (dst.cols * (1 - this.padding * 2)) / src.cols;
        let scaleVertical = (dst.rows * (1 - this.padding * 2)) / src.rows;
        let scale = Math.min(scaleHorizontal, scaleVertical);
        return scale;
    }

    _getTemplateGridRoi(template, scale = 1.0) {
        // hardcoded, based on the template.png
        let left = 35;
        let top = 850;
        let right = 530;
        let bottom = 1245;

        let scaleCols = template.cols / this.colsFromPng * scale;
        let scaleRows = template.rows / this.rowsFromPng * scale;

        return new cv.Rect(left * scaleCols, top * scaleRows, (right - left) * scaleCols, (bottom - top) * scaleRows);
    }

    _getGrayPixelCoordinates(template, scale) {
        let height = 660;
        let distanceFromEdge = 55;
        let pointsOnTemplate = [
            {y: height, x: distanceFromEdge},
            {y: height, x: this.colsFromPng - distanceFromEdge},
        ];

        let scaleCols = template.cols / this.colsFromPng * scale;
        let scaleRows = template.rows / this.rowsFromPng * scale;

        return pointsOnTemplate.map(({y, x}) => new cv.Point(x * scaleCols, y * scaleRows));
    }


    // returns a new cv.Mat based on image with the template applied in the middle
    // image: cv.Mat
    render(image) {
        let scale = this._getScale(this.template, image);
        let roi = this._getTemplateGridRoi(this.template, scale);
        let grayPixelCoords = this._getGrayPixelCoordinates(this.template, scale);

        // resize the template to fit in the image
        let resizedTemplate = new cv.Mat();
        cv.resize(this.template, resizedTemplate, 
            new cv.Size(this.template.cols * scale, this.template.rows * scale),
            0, 0, cv.INTER_AREA);

        // draw the template in the middle of the image
        let startX = (image.cols - resizedTemplate.cols) / 2;
        let startY = (image.rows - resizedTemplate.rows) / 2;

        // Can't use cv.addWeighted because the template has an alpha channel
        let result = image.clone();

        for (let i = 0; i < resizedTemplate.rows; i++) {
            for (let j = 0; j < resizedTemplate.cols; j++) {
                let pixel = resizedTemplate.ucharPtr(i, j);
                if (pixel[3] > 0) {
                    let dstPixel = result.ucharPtr(startY + i, startX + j);
                    dstPixel[0] = pixel[0];
                    dstPixel[1] = pixel[1];
                    dstPixel[2] = pixel[2];
                }
            }
        }

        // we might cache the resized template and the roi (by the input image size)
        // in the future to avoid reallocating them
        resizedTemplate.delete();
        
        // move the roi to be in image coordinates
        roi.x += startX;
        roi.y += startY;

        // move the points to be in image coordinates
        grayPixelCoords = grayPixelCoords.map(({x, y}) => new cv.Point(x + startX, y + startY));

        return {
            imageWithTemplate: result,
            gridRoi: roi,
            grayPixelCoords: grayPixelCoords,
        };
    }
}
