/**
 * A backend to draw graphics on a HTML 5 canvas using the library PixiJS.
 * The backend includes functions to draw primitive shapes either as graphics objects or as sprites with a specified resolution.
 * Functions to store multiple primitive shapes of one type as one PixiJS graphics object are also included.
 *
 */
var pixiBackend;
(function (pixiBackend) {
    /**
     * The PixiJS containers are objects to hold graphics elements that are rendered on the canvas.
     * They can be nested to build something like a folderstructure. The substructure is accessible via the "childrens" of a container.
     */
    pixiBackend.container = {
        stage: new PIXI.Container(),
        backgrounds: new PIXI.Container(),
        inputs: new PIXI.Container(),
        overviewBusesLeft: new PIXI.Container(),
        overviewBusesRight: new PIXI.Container(),
        overviewBusesHorizontal: new PIXI.Container(),
        hicannImages: new PIXI.Container(),
        numberText: new PIXI.Container(),
        border: new PIXI.Container(),
        routes: new PIXI.Container(),
        switches: new PIXI.Container(),
        selectedRoutes: new PIXI.Container(),
        selectedSwitches: new PIXI.Container(),
        reticles: new PIXI.Container(),
        detailView: new PIXI.Container(),
        busesLeft: new PIXI.Container(),
        busesRight: new PIXI.Container(),
        busesHorizontal: new PIXI.Container(),
        synapsesOne: new PIXI.Container(),
        synapsesTwo: new PIXI.Container(),
        synapseCross: new PIXI.Container(),
        busesLeftSprite: new PIXI.Container(),
        busesRightSprite: new PIXI.Container(),
        busesHorizontalSprite: new PIXI.Container(),
        synapsesOneSprite: new PIXI.Container(),
        synapsesTwoSprite: new PIXI.Container(),
        /**
         * Build the container (folder) structure together. The top-level container is stage.
         * All graphics elements that belong to the detailView are nested in the detailView container.
         */
        setup: function () {
            this.stage.addChild(this.backgrounds);
            this.stage.addChild(this.hicannImages);
            this.stage.addChild(this.inputs);
            this.stage.addChild(this.overviewBusesLeft);
            this.stage.addChild(this.overviewBusesRight);
            this.stage.addChild(this.overviewBusesHorizontal);
            this.stage.addChild(this.detailView);
            this.stage.addChild(this.routes);
            this.stage.addChild(this.switches);
            this.stage.addChild(this.selectedRoutes);
            this.stage.addChild(this.selectedSwitches);
            this.stage.addChild(this.numberText);
            this.stage.addChild(this.border);
            this.stage.addChild(this.reticles);
            this.detailView.addChild(this.busesLeft);
            this.detailView.addChild(this.busesRight);
            this.detailView.addChild(this.busesHorizontal);
            this.detailView.addChild(this.synapsesOne);
            this.detailView.addChild(this.synapsesTwo);
            this.detailView.addChild(this.synapseCross);
            this.detailView.addChild(this.busesLeftSprite);
            this.detailView.addChild(this.busesRightSprite);
            this.detailView.addChild(this.busesHorizontalSprite);
            this.detailView.addChild(this.synapsesOneSprite);
            this.detailView.addChild(this.synapsesTwoSprite);
        },
    };
    /**
     * The renderer is by default the WebGL renderer but uses the canvas renderer as a fallback option,
     * if the WebGL renderer is not supported by the browser.
     */
    pixiBackend.renderer = {
        renderer: PIXI.autoDetectRenderer({ width: 256, height: 256, autoResize: true }),
        backgroundColor: 0x333333,
        /**
         * Setup the canvas
         */
        setup: function (domParent, canvasWidth, canvasHeight) {
            // setup and resize canvas
            domParent.append(this.renderer.view);
            this.renderer.view.style.position = 'absolute';
            this.renderer.view.style.display = 'block';
            this.renderer.backgroundColor = this.backgroundColor;
            this.renderer.resize(canvasWidth, canvasHeight);
        },
        /**
         * render the stage (including all the substructure) on the canvas.
         * Call this method every time changes are made to the graphics elements that should be displayed.
         */
        render: function () {
            this.renderer.render(pixiBackend.container.stage);
        }
    };
    /**
     * Draw a rectangle as a graphics object.
     * @param container PixiJS container to hold the graphics object
     * @param x x-coordinate of the top left corner of the rectangle.
     * @param y y-coordinate of the top left corner of the rectangle.
     * @param width Width of the rectangle.
     * @param height Height of the rectangle.
     * @param color Fill color of the rectangle. Requires hex-color in the form "0xffffff".
     * @param interactive Set to true to allow mouse interactivity with the object.
     * @param mouseoverFunction Any callback function for the mouseover event.
     * @param mouseoutFunction Any callback function for the mouseout event.
     * @param clickFunction Any callback function for the mouseclick event.
     */
    function drawRectangle(container, x, y, width, height, color, interactive, mouseoverFunction, mouseoutFunction, clickFunction) {
        if (interactive === void 0) { interactive = false; }
        if (mouseoverFunction === void 0) { mouseoverFunction = undefined; }
        if (mouseoutFunction === void 0) { mouseoutFunction = undefined; }
        if (clickFunction === void 0) { clickFunction = undefined; }
        var rectangle = new PIXI.Graphics();
        rectangle.beginFill(color);
        rectangle.drawRect(x, y, width, height);
        rectangle.endFill();
        container.addChild(rectangle);
        if (interactive) {
            rectangle.interactive = true;
            rectangle.hitArea = new PIXI.Rectangle(x, y, width, height);
            rectangle.mouseover = mouseoverFunction;
            rectangle.mouseout = mouseoutFunction;
            rectangle.click = clickFunction;
        }
        ;
    }
    pixiBackend.drawRectangle = drawRectangle;
    /**
     * Draw a circle as graphics object.
     * @param container PixiJS container to hold the graphics object.
     * @param x x-coordinate of the top left corner.
     * @param y y-coordinate of the top left corner.
     * @param radius Radius of the circle.
     * @param color Fill color for the circle. Requires hex-color in the form "0xffffff".
     */
    function drawCircle(container, x, y, radius, color) {
        var circle = new PIXI.Graphics();
        circle.beginFill(color);
        circle.drawCircle(x, y, radius);
        circle.endFill();
        container.addChild(circle);
    }
    pixiBackend.drawCircle = drawCircle;
    /**
     * Draw multiple circles as a single graphics object.
     * This yields vastly better performance compare to creating multiple graphics objects.
     * @param container PixiJS container to hold the graphics object.
     * @param xValues x-coordinates of the top left corners of the circles.
     * @param yValues y-coordinates of the top left corners of the circles.
     * @param radiusValues Radii of the circles.
     * @param color Fill colors of the circles. Requires hex-colors in the form "0xffffff".
     */
    function drawCircles(container, xValues, yValues, radiusValues, color) {
        var circle = new PIXI.Graphics();
        for (var index = 0; index < xValues.length; index++) {
            circle.beginFill(color);
            circle.drawCircle(xValues[index], yValues[index], radiusValues[index]);
            circle.endFill();
        }
        ;
        container.addChild(circle);
    }
    pixiBackend.drawCircles = drawCircles;
    /**
     * Draw a triangle as graphics object
     * @param container PixiJS container to hold the graphics object.
     * @param x x-coordinate of the top left corner of the triangle.
     * @param y y-coordinate of the top left corner of the triangle.
     * @param width Width of the triangle.
     * @param height Height of the triangle.
     * @param color Fill color of the triangle. Requires hex-color in the form "0xffffff".
     */
    function drawTriangle(container, x, y, width, height, color) {
        var path = [x, y, x + width, y, x + width / 2, y - height, x, y];
        var triangle = new PIXI.Graphics();
        triangle.beginFill(color);
        triangle.drawPolygon(path);
        triangle.endFill();
        container.addChild(triangle);
    }
    pixiBackend.drawTriangle = drawTriangle;
    /**
     * Draws text in the boundaries of the rectangle. The text is sized to fit exactly in, either by width or by height.
     * @param container PixiJS container to hold the text object.
     * @param x x-coordinate of the top left corner of the text.
     * @param y y-coordinate of the top left corner of the text.
     * @param rectWidth Width of the rectangle, the text should fit in.
     * @param rectHeight Height of the rectangle, the text should fit in.
     * @param style style-object for the text.
     */
    function drawTextInRectangle(container, x, y, rectWidth, rectHeight, textContent, style) {
        var text = new PIXI.Text(textContent, style);
        text.x = x;
        text.y = y;
        // set width & height
        var originalWidth = text.width;
        var originalHeight = text.height;
        text.width = rectWidth;
        text.height *= text.width / originalWidth;
        if (text.height > rectHeight) {
            originalHeight = text.height;
            text.height = rectHeight;
            text.width *= text.height / originalHeight;
        }
        container.addChild(text);
    }
    pixiBackend.drawTextInRectangle = drawTextInRectangle;
    /**
     * Draw just the border, not the fill of a rectangle.
     * @param container PixiJS container to hold the graphics object.
     * @param x x-coordinate of the top left corner of the rectangle.
     * @param y y-coordinate of the top left corner of the rectangle.
     * @param width Width of the rectangle.
     * @param height Height of the rectangle.
     * @param lineWidth Width of the border-line.
     * @param color Color of the border-line. Requires hex-color in the form "0xffffff".
     * @param alpha Transparency of the border-line. Requires value between 0 and 1.
     */
    function drawRectangleBorder(container, x, y, width, height, lineWidth, color, alpha) {
        var rectangle = new PIXI.Graphics();
        rectangle.lineStyle(lineWidth, color, alpha);
        rectangle.drawRect(x, y, width, height);
        container.addChild(rectangle);
    }
    pixiBackend.drawRectangleBorder = drawRectangleBorder;
    /**
     * Draw multiple rectangles as a single graphics object.
     * @param container PixiJS container to hold the graphics object.
     * @param xValues x-coordinates of the top left corners of the rectangles.
     * @param yValues y-coordinates of the top left corners of the rectangles.
     * @param widthValues Widths of the rectangles.
     * @param heightValues Heights of the rectangles.
     * @param color Colors of the rectangles. Requires hex-colors in the form "0xffffff".
     */
    function drawRectangles(container, xValues, yValues, widthValues, heightValues, color) {
        var rectangles = new PIXI.Graphics();
        for (var index = 0; index < xValues.length; index++) {
            rectangles.beginFill(color);
            rectangles.drawRect(xValues[index], yValues[index], widthValues[index], heightValues[index]);
            rectangles.endFill();
        }
        ;
        container.addChild(rectangles);
    }
    pixiBackend.drawRectangles = drawRectangles;
    /**
     * Draw multiple rectangles and store them as a single sprite with specified resolution.
     * @param container PixiJS container to hold the sprite.
     * @param xValues x-coordinates of the top left corners of the rectangles.
     * @param yValues y-coordinates of the top left corners of the rectangles.
     * @param widthValues Widths of the rectangles.
     * @param heightValues Heights of the rectangles.
     * @param color Fill colors of the rectangles. Requires hex-colors in the form "0xffffff".
     * @param resolution Relative resolution of the sprite compared to the canvas.
     */
    function drawRectanglesSprite(container, xValues, yValues, widthValues, heightValues, color, resolution) {
        if (resolution === void 0) { resolution = 10; }
        var rectangles = new PIXI.Graphics();
        for (var index = 0; index < xValues.length; index++) {
            rectangles.beginFill(color);
            rectangles.drawRect(xValues[index], yValues[index], widthValues[index], heightValues[index]);
            rectangles.endFill();
        }
        ;
        var sprite = new PIXI.Sprite(rectangles.generateCanvasTexture(0, resolution));
        sprite.position = new PIXI.Point(xValues[0], yValues[0]);
        container.addChild(sprite);
    }
    pixiBackend.drawRectanglesSprite = drawRectanglesSprite;
    /**
     * Draw an image from a local url.
     * @param container PixiJS container to hold the sprite.
     * @param url Image file-path.
     * @param x x-coordinate of the top left corner of the image.
     * @param y y-coordinate of the top left corner of the image.
     * @param width Width of the image.
     * @param height Height of the image.
     */
    function drawImage(container, url, x, y, width, height) {
        var image = PIXI.Sprite.fromImage(url);
        image.position = new PIXI.Point(x, y);
        image.width = width;
        image.height = height;
        container.addChild(image);
    }
    pixiBackend.drawImage = drawImage;
    /**
     * Remove a child of any type from a PixiJS container.
     * @param container PixiJS container to remove the child from.
     * @param childIndex Index of the child to be removed (starts at 0).
     */
    function removeChild(container, childIndex) {
        container.removeChild(container.children[childIndex]);
    }
    pixiBackend.removeChild = removeChild;
    /**
     * Zoom the whole stage in.
     * @param factor zoom-factor.
     * @param x x-coordinate of the target position. Typically the x-coordinate of the mouse position.
     * @param y y-coordinate of the target position. Typically the y-coordinate of the mouse position.
     */
    function zoomIn(factor, x, y) {
        var scale = this.container.stage.transform.scale;
        var position = this.container.stage.transform.position;
        var oldScale = scale.x;
        scale.x *= factor;
        scale.y *= factor;
        position.x -= (x - position.x) * Math.abs(scale.x / oldScale - 1);
        position.y -= (y - position.y) * Math.abs(scale.x / oldScale - 1);
    }
    pixiBackend.zoomIn = zoomIn;
    /**
     * Zoom the whole stage out.
     * @param factor zoom-factor.
     * @param x x-coordinate of the target position. Typically the x-coordinate of the mouse position.
     * @param y y-coordinate of the target position. Typically the y-coordinate of the mouse position.
     */
    function zoomOut(factor, x, y) {
        var scale = this.container.stage.transform.scale;
        var position = this.container.stage.transform.position;
        var oldScale = scale.x;
        scale.x /= factor;
        scale.y /= factor;
        position.x += (x - position.x) * Math.abs(scale.x / oldScale - 1);
        position.y += (y - position.y) * Math.abs(scale.x / oldScale - 1);
    }
    pixiBackend.zoomOut = zoomOut;
    /**
     * Move the whole stage (panning).
     * @param deltaX Shift in x-direction (positive or negative value).
     * @param deltaY Shift in y-direction (positive or negative value).
     */
    function moveStage(deltaX, deltaY) {
        this.container.stage.position.x += deltaX;
        this.container.stage.position.y += deltaY;
    }
    pixiBackend.moveStage = moveStage;
    /**
     * Animate panning of the whole stage.
     * @param x1 Start x-coordinate
     * @param y1 Start y-coordinate
     * @param x2 Target x-coordinate
     * @param y2 Target y-coordinate
     * @param duration Animation duration in milliseconds
     */
    function animateStagePosition(x1, y1, x2, y2, duration) {
        var numberSteps = Math.floor(duration / 20);
        var step = {
            x: (x2 - x1) / numberSteps,
            y: (y2 - y1) / numberSteps,
        };
        var stepTracker = 0;
        var timer = setInterval(function () {
            pixiBackend.moveStage(step.x, step.y);
            pixiBackend.renderer.render();
            stepTracker++;
            if (stepTracker === numberSteps) {
                clearInterval(timer);
            }
        }, 20);
    }
    pixiBackend.animateStagePosition = animateStagePosition;
    /**
     * Checks if the the mouse is within the boundaries of a rectangle.
     * @param mousePosition x-y-position of the mouse.
     * @param x x-coordinate of the rectangle.
     * @param y y-coordinate of the rectangle.
     * @param width Width of the rectangle.
     * @param height Height of the rectangle.
     */
    function mouseInRectangle(mousePosition, x, y, width, height) {
        var scale = this.container.stage.transform.scale.x;
        var stagePosition = this.container.stage.transform.position;
        if ((mousePosition.x >= x * scale + stagePosition.x)
            && (mousePosition.x <= (x + width) * scale + stagePosition.x)
            && (mousePosition.y >= y * scale + stagePosition.y)
            && (mousePosition.y <= (y + height) * scale + stagePosition.y)) {
            return (true);
        }
        ;
    }
    pixiBackend.mouseInRectangle = mouseInRectangle;
    /**
     * Checks if a rectangle is at least partially within in the boundaries of the window.
     * @param x x-coordinate of the rectangle.
     * @param y y-coordinate of the rectangle.
     * @param width Width of the rectangle.
     * @param height Height of the rectangle.
     */
    function rectanglePartiallyInWindow(x, y, width, height) {
        var view = {
            width: $(window).width(),
            height: $(window).height(),
        };
        var scale = this.container.stage.transform.scale.x;
        var stagePosition = this.container.stage.transform.position;
        x *= scale;
        y *= scale;
        width *= scale;
        height *= scale;
        if ((x + stagePosition.x < view.width)
            && (x + width + stagePosition.x > 0)
            && (y + stagePosition.y < view.height)
            && (y + height + stagePosition.y > 0)) {
            return true;
        }
        else {
            return false;
        }
        ;
    }
    pixiBackend.rectanglePartiallyInWindow = rectanglePartiallyInWindow;
})(pixiBackend || (pixiBackend = {}));
/// <reference path="module.d.ts" />
/**
 * The namespace contains a number of classes that each have their separate purposes but have dependencies on each other.
 * They are written into separate files to keep a clear structure.
 */
var internalModule;
(function (internalModule) {
    /**
     * Representation of a HICANN. Position is the position in the visualization and is added when the HICANN is drawn the first time.
     */
    var HICANN = /** @class */ (function () {
        function HICANN(index, x, y, hasInputs, hasNeurons, isAvailable, numBusesHorizontal, numBusesLeft, numBusesRight, numBusesVertical, numInputs, numNeurons) {
            this.index = index;
            this.x = x;
            this.y = y;
            this.position = {
                x: undefined,
                y: undefined
            };
            this.hasInputs = hasInputs;
            this.hasNeurons = hasNeurons;
            this.isAvailable = isAvailable;
            this.numBusesHorizontal = numBusesHorizontal;
            this.numBusesLeft = numBusesLeft;
            this.numBusesRight = numBusesRight;
            this.numBusesVertical = numBusesVertical;
            this.numInputs = numInputs;
            this.numNeurons = numNeurons;
        }
        return HICANN;
    }());
    internalModule.HICANN = HICANN;
    /**
     * Representation of a HICANN wafer. The data is parsed from a configuration xml-file using the Marocco JavaScript API.
     */
    var Wafer = /** @class */ (function () {
        function Wafer() {
            // hardcode some wafer properties, because they are not yet wrapped.
            this.hicanns = [];
            this.enumMin = 0;
            this.enumMax = 383;
            this.xMin = 0;
            this.xMax = 35;
            this.yMin = 0;
            this.yMax = 15;
            this.numNeuronsMax = 0;
            this.numInputsMax = 0;
            this.numBusesLeftMax = 0;
            this.numBusesRightMax = 0;
            this.numBusesHorizontalMax = 0;
        }
        /**
         * process the network configuration xml file using the Marocco JavaScript API.
         * - new instances of HICANN are created
         * @param networkFilePath path to the xml file, located in the virtual emscripten filesystem
         */
        Wafer.prototype.loadOverviewData = function (networkFilePath) {
            console.log("start loading network");
            var marocco = networkFilePath ? new Module.Marocco(networkFilePath) : new Module.Marocco();
            console.log("done loading network");
            $("#setupScreen").fadeTo(1500, 0, function () { $("#setupScreen").css("display", "none"); });
            // reading properties from marocco
            for (var i = this.enumMin; i <= this.enumMax; i++) {
                var enumRanged = new Module.HICANNOnWafer_EnumRanged_type(i);
                var hicann = new Module.HICANNOnWafer(enumRanged);
                var properties_1 = marocco.properties(hicann);
                this.hicanns.push(new HICANN(i, hicann.x().value(), hicann.y().value(), properties_1.has_inputs(), properties_1.has_neurons(), properties_1.is_available(), properties_1.num_buses_horizontal(), properties_1.num_buses_left(), properties_1.num_buses_right(), properties_1.num_buses_vertical(), properties_1.num_inputs(), properties_1.num_neurons()));
            }
            this.maxPropertyValues();
        };
        /**
         * Find out the maximum values for HICANN properties
         */
        Wafer.prototype.maxPropertyValues = function () {
            for (var _i = 0, _a = this.hicanns; _i < _a.length; _i++) {
                var hicann = _a[_i];
                if (hicann.numNeurons > this.numNeuronsMax) {
                    this.numNeuronsMax = hicann.numNeurons;
                }
                if (hicann.numInputs > this.numInputsMax) {
                    this.numInputsMax = hicann.numInputs;
                }
                if (hicann.numBusesLeft > this.numBusesLeftMax) {
                    this.numBusesLeftMax = hicann.numBusesLeft;
                }
                if (hicann.numBusesRight > this.numBusesRightMax) {
                    this.numBusesRightMax = hicann.numBusesRight;
                }
                if (hicann.numBusesHorizontal > this.numBusesHorizontalMax) {
                    this.numBusesHorizontalMax = hicann.numBusesHorizontal;
                }
            }
        };
        /**
         * Calculate the index/enum-coordinate of the northern HICANN, if existent.
         */
        Wafer.prototype.northernHicann = function (hicannIndex) {
            var northernHicann;
            for (var _i = 0, _a = this.hicanns; _i < _a.length; _i++) {
                var hicann = _a[_i];
                if ((hicann.y == this.hicanns[hicannIndex].y - 1)
                    && (hicann.x == this.hicanns[hicannIndex].x)) {
                    northernHicann = hicann;
                    break;
                }
                ;
            }
            ;
            return (northernHicann ? northernHicann.index : undefined);
        };
        /**
         * Calculate the index/enum-coordinate of the southern HICANN, if existent.
         */
        Wafer.prototype.southernHicann = function (hicannIndex) {
            var southernHicann;
            for (var _i = 0, _a = this.hicanns; _i < _a.length; _i++) {
                var hicann = _a[_i];
                if ((hicann.y == this.hicanns[hicannIndex].y + 1)
                    && (hicann.x == this.hicanns[hicannIndex].x)) {
                    southernHicann = hicann;
                    break;
                }
                ;
            }
            ;
            return (southernHicann ? southernHicann.index : undefined);
        };
        /**
         * Calculate the index/enum-coordinate of the eastern HICANN, if existent.
         */
        Wafer.prototype.easternHicann = function (hicannIndex) {
            var easternHicann;
            for (var _i = 0, _a = this.hicanns; _i < _a.length; _i++) {
                var hicann = _a[_i];
                if ((hicann.y == this.hicanns[hicannIndex].y)
                    && (hicann.x == this.hicanns[hicannIndex].x + 1)) {
                    easternHicann = hicann;
                    break;
                }
                ;
            }
            ;
            return (easternHicann ? easternHicann.index : undefined);
        };
        /**
         * Calculate the index/enum-coordinate of the western HICANN, if existent.
         */
        Wafer.prototype.westernHicann = function (hicannIndex) {
            var westernHicann;
            for (var _i = 0, _a = this.hicanns; _i < _a.length; _i++) {
                var hicann = _a[_i];
                if ((hicann.y == this.hicanns[hicannIndex].y)
                    && (hicann.x == this.hicanns[hicannIndex].x - 1)) {
                    westernHicann = hicann;
                    break;
                }
                ;
            }
            ;
            return (westernHicann ? westernHicann.index : undefined);
        };
        return Wafer;
    }());
    internalModule.Wafer = Wafer;
    ;
})(internalModule || (internalModule = {}));
/**
 * A collection of functions useful functions, that are not specific to the visualization.
 */
var tools;
(function (tools) {
    /**
     * For a color gradient, where "colorOne" corresponds to "zero" and "colorTwo" corresponds to "max",
     * the color corresponding to "value" is calculated.
     */
    function colorInGradient(colorOne, colorTwo, max, value) {
        var frac = max ? value / max : 0;
        var c1 = {
            r: parseInt(colorOne.slice(0, 2), 16),
            g: parseInt(colorOne.slice(2, 4), 16),
            b: parseInt(colorOne.slice(4, 6), 16)
        };
        var c2 = {
            r: parseInt(colorTwo.slice(0, 2), 16),
            g: parseInt(colorTwo.slice(2, 4), 16),
            b: parseInt(colorTwo.slice(4, 6), 16)
        };
        var diff = {
            r: c2.r - c1.r,
            g: c2.g - c1.g,
            b: c2.b - c1.b
        };
        var cnew = {
            r: Math.floor(diff.r * frac + c1.r),
            g: Math.floor(diff.g * frac + c1.g),
            b: Math.floor(diff.b * frac + c1.b)
        };
        var cnew_hex = {
            r: ((cnew.r).toString(16).length === 2) ?
                (cnew.r).toString(16) : (0).toString(16) + (cnew.r).toString(16),
            g: ((cnew.g).toString(16).length === 2) ?
                (cnew.g).toString(16) : (0).toString(16) + (cnew.g).toString(16),
            b: ((cnew.b).toString(16).length === 2) ?
                (cnew.b).toString(16) : (0).toString(16) + (cnew.b).toString(16),
        };
        var result = "0x" + cnew_hex.r + cnew_hex.g + cnew_hex.b;
        return result;
    }
    tools.colorInGradient = colorInGradient;
    /**
     * returns all teh digits in a string, concatenated.
     * e.g. "Hello13Visu08" -> 1308
     */
    function numberInString(string) {
        var number = "";
        for (var letter in string) {
            number += (!isNaN(parseInt(string[letter]))) ? string[letter] : "";
        }
        return parseInt(number);
    }
    tools.numberInString = numberInString;
    /**
     * returns a random number between "bottom" and "top".
     */
    function randomNumber(bottom, top) {
        return (Math.floor(Math.random() * (top - bottom + 1) + bottom));
    }
    ;
    /**
     * returns a random color in hexadecimal form (e.g. 0xffffff).
     */
    function randomHexColor() {
        // random Color
        var color = {
            r: randomNumber(0, 255),
            g: randomNumber(0, 255),
            b: randomNumber(0, 255)
        };
        // convert to Hex color
        var colorHex = {
            r: ((color.r).toString(16).length === 2) ?
                (color.r).toString(16) : (0).toString(16) + (color.r).toString(16),
            g: ((color.g).toString(16).length === 2) ?
                (color.g).toString(16) : (0).toString(16) + (color.g).toString(16),
            b: ((color.b).toString(16).length === 2) ?
                (color.b).toString(16) : (0).toString(16) + (color.b).toString(16),
        };
        // concatenate and return
        return "0x" + colorHex.r + colorHex.g + colorHex.b;
    }
    tools.randomHexColor = randomHexColor;
    ;
    /**
     * Calculate the intersection of two rectangles.
     * caveat: works only in the special case of two intersecting bus segments
     */
    function intersectionRectangle(rect1, rect2) {
        var position = {};
        // intersection x & width
        if (rect1.width < rect2.width) {
            position.x = rect1.x;
            position.width = rect1.width;
        }
        else {
            position.x = rect2.x;
            position.width = rect2.width;
        }
        ;
        // intersection y & height
        if (rect1.height < rect2.height) {
            position.y = rect1.y;
            position.height = rect1.height;
        }
        else {
            position.y = rect2.y;
            position.height = rect2.height;
        }
        ;
        return (position);
    }
    tools.intersectionRectangle = intersectionRectangle;
    ;
    /**
     * calculates center position and radius of a circle that fits exactly into the square
     */
    function circleInSquare(square) {
        // circle x
        var x = square.x + square.width / 2;
        // circle y
        var y = square.y + square.height / 2;
        // circle radius
        var radius = square.width / 2;
        return ({
            x: x,
            y: y,
            radius: radius,
        });
    }
    tools.circleInSquare = circleInSquare;
    /**
     * Gaußsche Summenformel "kleiner Gauss"
     */
    function kleinerGauss(n) {
        return (Math.pow(n, 2) + n) / 2;
    }
    tools.kleinerGauss = kleinerGauss;
    /**
     * Calculate the distance between two two-dimensional points
     */
    function distanceBetweenPoints(point1, point2) {
        var distance = Math.sqrt(Math.pow((point1.x - point2.x), 2)
            + Math.pow((point1.y - point2.y), 2));
        return (distance);
    }
    tools.distanceBetweenPoints = distanceBetweenPoints;
})(tools || (tools = {}));
/// <reference path="tools.ts" />
/// <reference path="pixiBackend.ts" />
/// <reference path="wafer.ts" />
/**
 * The namespace contains a number of classes that each have their separate purposes but have dependencies on each other.
 * They are written into separate files to keep a clear structure.
 */
var internalModule;
(function (internalModule) {
    /**
     * The Detailview includes detailed representations of HICANN elements.
     * Buses are drawn as thin rectangles and the synapse arrays as arrays of small squares.
     * The detailview is divided into two sub-levels. The first one (detailview) drawing elements as Sprites,
     * the second one (detialviewLevelTwo) drawing real graphics elements.
     */
    var Detailview = /** @class */ (function () {
        function Detailview(wafer, hicannWidth, hicannHeight, margin) {
            /**
             * set this property when detailview is entered or left
             */
            this.enabled = false;
            /**
             * set this property when detailviewLevelTwo is entered or left.
             */
            this.levelTwoEnabled = false;
            /**
             * Index of the HICANN that is currently in detailview. Used for auto mode.
             */
            this.currentHicann = undefined;
            /**
             * Index of northern HICANN of the one currently in detailview. Used for auto mode.
             */
            this.northernHicann = undefined;
            /**
             * Index of southern HICANN of the one currently in detailview. Used for auto mode.
             */
            this.southernHicann = undefined;
            /**
             * Index of eastern HICANN of the one currently in detailview. Used for auto mode.
             */
            this.easternHicann = undefined;
            /**
             * Index of western HICANN of the one currently in detailview. Used for auto mode.
             */
            this.westernHicann = undefined;
            /**
             * zoom-scale threshold to start detailview
             */
            this.threshold = NaN;
            /**
             * zoom-scale threshold to start detailviewLevelTwo
             */
            this.threshold2 = NaN;
            /**
             * Hardcoded number of neurons on a HICANN.
             */
            this.numNeurons = 256;
            /**
             * Hardcoded number of synapse rows in a synapse array on a HICANN.
             */
            this.numSynapsesVertical = 224;
            /**
             * Hardcoded number of vertical buses on a HICANN.
             */
            this.numBusesVertical = 128;
            /**
             * Hardcoded number of horizontal buses on a HICANN.
             */
            this.numBusesHorizontal = 64;
            /**
             * Unit distances between synapse array and Buses.
             */
            this.gap = 4;
            this.wafer = wafer;
            this.hicannWidth = hicannWidth;
            this.hicannHeight = hicannHeight;
            this.margin = margin;
        }
        Object.defineProperty(Detailview.prototype, "edge", {
            /**
             * Margin around HICANN. used to calculate when to start the detailview.
             */
            get: function () {
                return (this.hicannWidth / 4);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Detailview.prototype, "synapseArrayWidth", {
            /**
             * Total width of a synapse array.
             */
            get: function () {
                return (this.hicannWidth * 0.8);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Detailview.prototype, "unitLength", {
            /**
             * Computed width or height of synapses/Buses.
             */
            get: function () {
                return (this.hicannWidth / (4 * 520));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Detailview.prototype, "unitDistance", {
            /**
             * Computed distance between synapses/Buses
             */
            get: function () {
                return (this.hicannWidth - this.unitLength) / (this.numNeurons + this.numBusesVertical * 2 + 2 * this.gap - 1);
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Calculate the position of the center of a HICANN
         */
        Detailview.prototype.hicannCenter = function (hicannIndex) {
            var transform = pixiBackend.container.stage.transform;
            var scale = transform.scale.x;
            var stagePosition = transform.position;
            var hicannCenter = {
                x: (this.wafer.hicanns[hicannIndex].x * (this.hicannWidth + this.margin) + this.hicannWidth / 2)
                    * scale + stagePosition.x,
                y: (this.wafer.hicanns[hicannIndex].y * (this.hicannHeight + this.margin) + this.hicannHeight / 2)
                    * scale + stagePosition.y,
            };
            return (hicannCenter);
        };
        /**
         * Find the HICANN that is closest to the center of the canvas.
         */
        Detailview.prototype.hicannClosestToCenter = function (canvasCenter) {
            var minDistance = Infinity;
            var closestHicann = undefined;
            for (var hicannIndex = this.wafer.enumMin; hicannIndex <= this.wafer.enumMax; hicannIndex++) {
                var hicannCenter = this.hicannCenter(hicannIndex);
                var distance = tools.distanceBetweenPoints(hicannCenter, canvasCenter);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestHicann = hicannIndex;
                }
                ;
            }
            return (closestHicann);
        };
        /**
         * Find indices of neighboring HICANNS and update class properties.
         */
        Detailview.prototype.updateSurroundingHicanns = function () {
            this.northernHicann = this.wafer.northernHicann(this.currentHicann);
            this.southernHicann = this.wafer.southernHicann(this.currentHicann);
            this.easternHicann = this.wafer.easternHicann(this.currentHicann);
            this.westernHicann = this.wafer.westernHicann(this.currentHicann);
        };
        /**
         * Draw all detailed elements of a HICANN
         */
        Detailview.prototype.drawHicann = function (newHicann) {
            var hicannPosition = {
                x: this.wafer.hicanns[newHicann].position.x,
                y: this.wafer.hicanns[newHicann].position.y,
            };
            // draw hicann details
            this.drawSynapseArrays(hicannPosition);
            this.drawBusesLeft(hicannPosition);
            this.drawBusesRight(hicannPosition);
            this.drawBusesHorizontal(hicannPosition);
        };
        /**
         * Determine the zoom-scale where the detailview should begin.
         * The HICANN is fully in taking up almost the whole window at that point.
         */
        Detailview.prototype.determineThreshold = function (canvasHeight) {
            var fullHicannScale = canvasHeight / (this.hicannHeight + 2 * this.edge);
            this.threshold = fullHicannScale;
            this.threshold2 = fullHicannScale * 8;
        };
        /**
         * draw both synapse arrays of a HICANN, both as sprites and graphics objects.
         * @param hicannPosition top left corner of the HICANN.
         */
        Detailview.prototype.drawSynapseArrays = function (hicannPosition) {
            var synapseArrayHeight = (this.numSynapsesVertical - 1) * this.unitDistance + this.unitLength;
            var synapsesOne = {
                x: hicannPosition.x + (this.numBusesVertical + this.gap) * this.unitDistance,
                y: hicannPosition.y + 5 * this.gap,
                xValues: [],
                yValues: [],
                widthValues: [],
                heightValues: [],
            };
            var synapsesTwo = {
                x: hicannPosition.x + (this.numBusesVertical + this.gap) * this.unitDistance,
                y: hicannPosition.y + this.hicannHeight - synapseArrayHeight - 5 * this.gap,
                xValues: [],
                yValues: [],
                widthValues: [],
                heightValues: [],
            };
            for (var horizontal = 0; horizontal < this.numNeurons; horizontal++) {
                for (var vertical = 0; vertical < this.numSynapsesVertical; vertical++) {
                    synapsesOne.xValues.push(synapsesOne.x + horizontal * this.unitDistance);
                    synapsesOne.yValues.push(synapsesOne.y + vertical * this.unitDistance);
                    synapsesOne.widthValues.push(this.unitLength);
                    synapsesOne.heightValues.push(this.unitLength);
                }
                ;
            }
            ;
            for (var horizontal = 0; horizontal < this.numNeurons; horizontal++) {
                for (var vertical = 0; vertical < this.numSynapsesVertical; vertical++) {
                    synapsesTwo.xValues.push(synapsesTwo.x + horizontal * this.unitDistance);
                    synapsesTwo.yValues.push(synapsesTwo.y + vertical * this.unitDistance);
                    synapsesTwo.widthValues.push(this.unitLength);
                    synapsesTwo.heightValues.push(this.unitLength);
                }
                ;
            }
            ;
            pixiBackend.drawRectangles(pixiBackend.container.synapsesOne, synapsesOne.xValues, synapsesOne.yValues, synapsesOne.widthValues, synapsesOne.heightValues, "0xff6666");
            pixiBackend.drawRectanglesSprite(pixiBackend.container.synapsesOneSprite, synapsesOne.xValues, synapsesOne.yValues, synapsesOne.widthValues, synapsesOne.heightValues, "0xff6666");
            pixiBackend.drawRectangles(pixiBackend.container.synapsesTwo, synapsesTwo.xValues, synapsesTwo.yValues, synapsesTwo.widthValues, synapsesTwo.heightValues, "0xff6666");
            pixiBackend.drawRectanglesSprite(pixiBackend.container.synapsesTwoSprite, synapsesTwo.xValues, synapsesTwo.yValues, synapsesTwo.widthValues, synapsesTwo.heightValues, "0xff6666");
        };
        /**
         * Draw all vertical left routes of a HICANN as graphics objects.
         * @param hicannPosition Top left corner of the HICANN.
         */
        Detailview.prototype.drawBusesLeft = function (hicannPosition) {
            var verticalBusesLeft = {
                x: hicannPosition.x,
                y: hicannPosition.y,
                xValues: [],
                yValues: [],
                widthValues: [],
                heightValues: [],
            };
            for (var i = 0; i < this.numBusesVertical; i++) {
                verticalBusesLeft.xValues.push(verticalBusesLeft.x + i * this.unitDistance);
                verticalBusesLeft.yValues.push(verticalBusesLeft.y);
                verticalBusesLeft.widthValues.push(this.unitLength);
                verticalBusesLeft.heightValues.push(this.hicannHeight);
            }
            ;
            pixiBackend.drawRectangles(pixiBackend.container.busesLeft, verticalBusesLeft.xValues, verticalBusesLeft.yValues, verticalBusesLeft.widthValues, verticalBusesLeft.heightValues, "0xffffff");
        };
        /**
         * Draw all vertical right routes of a HICANN as graphics objects.
         * @param hicannPosition Top left corner of the HICANN.
         */
        Detailview.prototype.drawBusesRight = function (hicannPosition) {
            var verticalBusesRight = {
                x: hicannPosition.x + (this.numBusesVertical + this.numNeurons + this.gap * 2) * this.unitDistance,
                y: hicannPosition.y,
                xValues: [],
                yValues: [],
                widthValues: [],
                heightValues: [],
            };
            for (var i = 0; i < this.numBusesVertical; i++) {
                verticalBusesRight.xValues.push(verticalBusesRight.x + i * this.unitDistance);
                verticalBusesRight.yValues.push(verticalBusesRight.y);
                verticalBusesRight.widthValues.push(this.unitLength);
                verticalBusesRight.heightValues.push(this.hicannHeight);
            }
            ;
            pixiBackend.drawRectangles(pixiBackend.container.busesRight, verticalBusesRight.xValues, verticalBusesRight.yValues, verticalBusesRight.widthValues, verticalBusesRight.heightValues, "0xffffff");
        };
        /**
         * Draw all horizontal buses of a HICANN as graphics objects.
         * @param hicannPosition Top left corner of the HICANN.
         */
        Detailview.prototype.drawBusesHorizontal = function (hicannPosition) {
            // height of all the horizontal routes together
            var routeBlockHeight = (this.numBusesHorizontal - 1) * 2 * this.unitDistance + this.unitLength;
            var horizontalBuses = {
                x: hicannPosition.x,
                y: hicannPosition.y + (this.hicannHeight - routeBlockHeight) / 2,
                xValues: [],
                yValues: [],
                widthValues: [],
                heightValues: [],
            };
            for (var i = 0; i < this.numBusesHorizontal; i++) {
                horizontalBuses.xValues.push(horizontalBuses.x);
                horizontalBuses.yValues.push(horizontalBuses.y + i * 2 * this.unitDistance);
                horizontalBuses.widthValues.push(this.hicannWidth);
                horizontalBuses.heightValues.push(this.unitLength);
            }
            ;
            pixiBackend.drawRectangles(pixiBackend.container.busesHorizontal, horizontalBuses.xValues, horizontalBuses.yValues, horizontalBuses.widthValues, horizontalBuses.heightValues, "0xffffff");
        };
        /**
         * Draw vertical left, vertical right and horizontal buses of a HICANN as sprites.
         * @param visible Show routes or hide them.
         */
        Detailview.prototype.drawBusesSprite = function (hicannIndex, visible) {
            var hicannPosition = {
                x: this.wafer.hicanns[hicannIndex].position.x,
                y: this.wafer.hicanns[hicannIndex].position.y,
            };
            // vertical left
            var verticalBusesLeft = {
                xValues: [],
                yValues: [],
                widthValues: [],
                heightValues: [],
            };
            for (var i = 0; i < this.numBusesVertical; i++) {
                verticalBusesLeft.xValues.push(hicannPosition.x + i * this.unitDistance);
                verticalBusesLeft.yValues.push(hicannPosition.y);
                verticalBusesLeft.widthValues.push(this.unitLength);
                verticalBusesLeft.heightValues.push(this.hicannHeight);
            }
            ;
            pixiBackend.drawRectanglesSprite(pixiBackend.container.busesLeftSprite, verticalBusesLeft.xValues, verticalBusesLeft.yValues, verticalBusesLeft.widthValues, verticalBusesLeft.heightValues, "0xffffff");
            pixiBackend.container.busesLeftSprite.children[hicannIndex].visible = visible;
            // vertical right
            var verticalBusesRight = {
                x: hicannPosition.x + (this.numBusesVertical + this.numNeurons + this.gap * 2) * this.unitDistance,
                y: hicannPosition.y,
                xValues: [],
                yValues: [],
                widthValues: [],
                heightValues: [],
            };
            for (var i = 0; i < this.numBusesVertical; i++) {
                verticalBusesRight.xValues.push(verticalBusesRight.x + i * this.unitDistance);
                verticalBusesRight.yValues.push(verticalBusesRight.y);
                verticalBusesRight.widthValues.push(this.unitLength);
                verticalBusesRight.heightValues.push(this.hicannHeight);
            }
            ;
            pixiBackend.drawRectanglesSprite(pixiBackend.container.busesRightSprite, verticalBusesRight.xValues, verticalBusesRight.yValues, verticalBusesRight.widthValues, verticalBusesRight.heightValues, "0xffffff");
            pixiBackend.container.busesRightSprite.children[hicannIndex].visible = visible;
            // horizontal
            // height of all the horizontal routes together
            var routeBlockHeight = (this.numBusesHorizontal - 1) * 2 * this.unitDistance + this.unitLength;
            var horizontalBuses = {
                x: hicannPosition.x,
                y: hicannPosition.y + (this.hicannHeight - routeBlockHeight) / 2,
                xValues: [],
                yValues: [],
                widthValues: [],
                heightValues: [],
            };
            for (var i = 0; i < this.numBusesHorizontal; i++) {
                horizontalBuses.xValues.push(horizontalBuses.x);
                horizontalBuses.yValues.push(horizontalBuses.y + i * 2 * this.unitDistance);
                horizontalBuses.widthValues.push(this.hicannWidth);
                horizontalBuses.heightValues.push(this.unitLength);
            }
            ;
            pixiBackend.drawRectanglesSprite(pixiBackend.container.busesHorizontalSprite, horizontalBuses.xValues, horizontalBuses.yValues, horizontalBuses.widthValues, horizontalBuses.heightValues, "0xffffff");
            pixiBackend.container.busesHorizontalSprite.children[hicannIndex].visible = visible;
        };
        /**
         * Draw all buses of all HICANNs on the wafer as sprites.
         */
        Detailview.prototype.drawAllBusesSprite = function () {
            for (var hicannIndex in this.wafer.hicanns) {
                this.drawBusesSprite(parseInt(hicannIndex), false);
            }
        };
        /**
         * remove all the detailed elements
         */
        Detailview.prototype.resetDetailview = function () {
            var numChildren = pixiBackend.container.synapsesOne.children.length;
            for (var i = 0; i < numChildren; i++) {
                // remove detailview level two objects
                pixiBackend.removeChild(pixiBackend.container.synapsesOne, 0);
                pixiBackend.removeChild(pixiBackend.container.synapsesTwo, 0);
                pixiBackend.removeChild(pixiBackend.container.busesLeft, 0);
                pixiBackend.removeChild(pixiBackend.container.busesRight, 0);
                pixiBackend.removeChild(pixiBackend.container.busesHorizontal, 0);
                pixiBackend.removeChild(pixiBackend.container.synapseCross, 0);
                // remove detailview level One synapse arrays
                pixiBackend.removeChild(pixiBackend.container.synapsesOneSprite, 0);
                pixiBackend.removeChild(pixiBackend.container.synapsesTwoSprite, 0);
            }
        };
        /**
         * Check if the northern HICANN is closer to the canvas center than the one currently in detailview.
         * Needed for auto mode.
         */
        Detailview.prototype.northernHicannCloser = function (canvasCenter) {
            if (this.northernHicann) {
                var distanceCurrentHicann = tools.distanceBetweenPoints(this.hicannCenter(this.currentHicann), canvasCenter);
                var distanceNorthernHicann = tools.distanceBetweenPoints(this.hicannCenter(this.northernHicann), canvasCenter);
                if (distanceNorthernHicann + 2 * this.edge < distanceCurrentHicann) {
                    return true;
                }
                else {
                    return false;
                }
                ;
            }
            ;
        };
        /**
         * Check if the southern HICANN is closer to the canvas center than the one currently in detailview.
         * Needed for auto mode.
         */
        Detailview.prototype.southernHicannCloser = function (canvasCenter) {
            if (this.southernHicann) {
                var distanceCurrentHicann = tools.distanceBetweenPoints(this.hicannCenter(this.currentHicann), canvasCenter);
                var distanceSouthernHicann = tools.distanceBetweenPoints(this.hicannCenter(this.southernHicann), canvasCenter);
                if (distanceSouthernHicann + 2 * this.edge < distanceCurrentHicann) {
                    return true;
                }
                else {
                    return false;
                }
                ;
            }
            ;
        };
        /**
         * Check if the eastern HICANN is closer to the canvas center than the one currently in detailview.
         * Needed for auto mode.
         */
        Detailview.prototype.easternHicannCloser = function (canvasCenter) {
            if (this.easternHicann) {
                var distanceCurrentHicann = tools.distanceBetweenPoints(this.hicannCenter(this.currentHicann), canvasCenter);
                var distanceEasternHicann = tools.distanceBetweenPoints(this.hicannCenter(this.easternHicann), canvasCenter);
                if (distanceEasternHicann + 4 * this.edge < distanceCurrentHicann) {
                    return true;
                }
                else {
                    return false;
                }
                ;
            }
            ;
        };
        /**
         * Check if the western HICANN is closer to the canvas center than the one currently in detailview.
         * Needed for auto mode.
         */
        Detailview.prototype.westernHicannCloser = function (canvasCenter) {
            if (this.westernHicann) {
                var distanceCurrentHicann = tools.distanceBetweenPoints(this.hicannCenter(this.currentHicann), canvasCenter);
                var distanceWesternHicann = tools.distanceBetweenPoints(this.hicannCenter(this.westernHicann), canvasCenter);
                if (distanceWesternHicann + 4 * this.edge < distanceCurrentHicann) {
                    return true;
                }
                else {
                    return false;
                }
                ;
            }
            ;
        };
        return Detailview;
    }());
    internalModule.Detailview = Detailview;
})(internalModule || (internalModule = {}));
/// <reference path="tools.ts" />
/// <reference path="pixiBackend.ts" />
/// <reference path="wafer.ts" />
/**
 * The namespace contains a number of classes that each have their separate purposes but have dependencies on each other.
 * They are written into separate files to keep a clear structure.
 */
var internalModule;
(function (internalModule) {
    /**
     * The HICANN number is drawn on top of a HICANN, when hovering over it.
     */
    var HicannNumber = /** @class */ (function () {
        function HicannNumber(width, height) {
            this.style = {
                font: 'bold 100px Arial',
                fill: pixiBackend.renderer.backgroundColor
            };
            this.hicannIndex = undefined;
            this.width = width;
            this.height = height;
            this.alwaysHidden = false;
            this.container = pixiBackend.container.numberText;
        }
        Object.defineProperty(HicannNumber.prototype, "visible", {
            /**
             * Returns the visible property of the PixiJS container that holds the text.
             */
            get: function () {
                return this.container.visible;
            },
            enumerable: true,
            configurable: true
        });
        ;
        /**
         * Set the visible property of the PixiJS container that holds the text.
         */
        HicannNumber.prototype.setVisible = function (visible) {
            if (!this.alwaysHidden) {
                this.container.visible = visible;
            }
        };
        ;
        /**
         * Draw the HICANN number.
         * @param number Index of the HICANN.
         * @param x x-position for the text.
         * @param y y-position for the text.
         */
        HicannNumber.prototype.draw = function (number, x, y) {
            // remove possible previous numbers
            this.clean();
            // draw new number;
            pixiBackend.drawTextInRectangle(this.container, x, y, this.width, this.height, number.toString(), this.style);
        };
        ;
        /**
         * remove all text-graphic objects from the container.
         */
        HicannNumber.prototype.clean = function () {
            // number of graphics elements (children) in container
            var numElements = this.container.children.length;
            for (var i = 0; i < numElements; i++) {
                pixiBackend.removeChild(this.container, 0);
            }
            ;
        };
        ;
        /**
         * update the UI checkbox.
         */
        HicannNumber.prototype.updateCheckbox = function () {
            if (this.visible) {
                $("#numberTextCheckbox").prop("checked", true);
            }
            else {
                $("#numberTextCheckbox").prop("checked", false);
            }
        };
        ;
        return HicannNumber;
    }());
    /**
     * An image of the HICANN can be display in the background.
     * Those images can be set visible or hidden via a checkbox in the UI.
     */
    var WaferImage = /** @class */ (function () {
        function WaferImage(wafer, hicannImagePath, container, width, height) {
            this.wafer = wafer;
            this.hicannImagePath = hicannImagePath;
            this.container = container;
            this.width = width;
            this.height = height;
            // preload the hicann Image
            PIXI.loader.add(hicannImagePath);
        }
        /**
         * Draw the images for all HICANNs.
         */
        WaferImage.prototype.draw = function () {
            for (var _i = 0, _a = this.wafer.hicanns; _i < _a.length; _i++) {
                var hicann = _a[_i];
                // draw png-image of hicann
                pixiBackend.drawImage(this.container, this.hicannImagePath, hicann.position.x, hicann.position.y, this.width, this.height);
            }
            // render stage when hicann Image finished loading
            PIXI.loader.load(function () {
                pixiBackend.renderer.render();
            });
        };
        /**
         * Set the images to visible or hide them.
         */
        WaferImage.prototype.setVisible = function (visible) {
            // set pixiJS container property
            this.container.visible = visible;
        };
        return WaferImage;
    }());
    /**
     * The overview does not show the HICANN elements such as buses in detail but provides cumulative information about a HICANN.
     * All bus segments (vertical left, vertical right, horizontal) are drawn as one rectangle each in a color that represents the number of routes running over that segment.
     * The number of inputs on a HICANN are represented by a colored triangle at the bottom of the HICANN.
     * The number of neurons on a HICANN are represented by a colored rectangle in the background.
     */
    var Overview = /** @class */ (function () {
        function Overview(wafer, hicannStyleProperties, hicannColors) {
            this.wafer = wafer;
            this.hicannNumber = new HicannNumber(hicannStyleProperties.hicannWidth, hicannStyleProperties.hicannHeight);
            this.waferImage = new WaferImage(wafer, "img/hicann.png", pixiBackend.container.hicannImages, hicannStyleProperties.hicannWidth, hicannStyleProperties.hicannHeight);
            this.hicannWidth = hicannStyleProperties.hicannWidth;
            this.hicannHeight = hicannStyleProperties.hicannHeight;
            this.margin = hicannStyleProperties.margin;
            this.triangleHeight = hicannStyleProperties.triangleHeight;
            this.routeWidth = hicannStyleProperties.busWidth;
            this.numNeuronsColorOne = hicannColors.numNeuronsColorOne;
            this.numNeuronsColorTwo = hicannColors.numNeuronsColorTwo;
            this.numInputsColorOne = hicannColors.numInputsColorOne;
            this.numInputsColorTwo = hicannColors.numInputsColorTwo;
            this.numRoutesLeftColorOne = hicannColors.numRoutesLeftColorOne;
            this.numRoutesLeftColorTwo = hicannColors.numRoutesLeftColorTwo;
            this.numRoutesRightColorOne = hicannColors.numRoutesRightColorOne;
            this.numRoutesRightColorTwo = hicannColors.numRoutesRightColorTwo;
            this.numRoutesHorizontalColorOne = hicannColors.numRoutesHorizontalColorOne;
            this.numRoutesHorizontalColorTwo = hicannColors.numRoutesHorizontalColorTwo;
        }
        /**
         * Draw HICANN background inputs and vertical left, right and horizontal buses for all HICANNs.
         */
        Overview.prototype.drawWafer = function () {
            // loop through hicanns on wafer
            for (var hicannIndex = this.wafer.enumMin; hicannIndex <= this.wafer.enumMax; hicannIndex++) {
                // calculate Hicann position in pixels
                var hicannX = this.wafer.hicanns[hicannIndex].x * (this.hicannWidth + this.margin);
                var hicannY = this.wafer.hicanns[hicannIndex].y * (this.hicannHeight + this.margin);
                this.wafer.hicanns[hicannIndex].position = { x: hicannX, y: hicannY };
                // draw rectangle as hicann representation, color scale for number of neurons
                this.drawHicannBackground(hicannIndex, hicannX, hicannY);
                // draw triangle in color scale for number of hicann inputs
                this.drawInputs(hicannIndex, hicannX + this.routeWidth, hicannY + this.hicannHeight);
                // draw "H" ín color scale for number of route-segment
                this.drawBusH(hicannIndex, hicannX, hicannY);
            }
            ;
            // render stage
            pixiBackend.renderer.render();
        };
        /**
         * Draw a rectangle in the HICANN background in a color representing the number of neurons on that HICANN.
         */
        Overview.prototype.drawHicannBackground = function (hicannIndex, x, y) {
            // calculate color on number of neurons color gradient
            var colorNumNeurons = tools.colorInGradient(this.numNeuronsColorOne, this.numNeuronsColorTwo, this.wafer.numNeuronsMax, this.wafer.hicanns[hicannIndex].numNeurons);
            // draw rectangle as hicann representation
            pixiBackend.drawRectangle(pixiBackend.container.backgrounds, x, y, this.hicannWidth, this.hicannHeight, colorNumNeurons);
        };
        /**
         * Draw a rectangle on the bottom of a HICANN in a color representing the number of inputs on that HICANN.
         */
        Overview.prototype.drawInputs = function (hicannIndex, x, y) {
            // calculate color on number of inputs color gradient
            var colorNumInputs = tools.colorInGradient(this.numInputsColorOne, this.numInputsColorTwo, this.wafer.numInputsMax, this.wafer.hicanns[hicannIndex].numInputs);
            // draw triangle in color scale as number of hicann inputs representation
            pixiBackend.drawTriangle(pixiBackend.container.inputs, x, y, this.hicannWidth - 2 * this.routeWidth, this.triangleHeight, colorNumInputs);
        };
        /**
         * Draw vertical left, vertical right and horizontal buses of a HICANN
         */
        Overview.prototype.drawBusH = function (hicannIndex, x, y) {
            // draw three segments of "H" seperately
            this.drawLeftBusH(hicannIndex, x, y);
            this.drawHorizontalBusH(hicannIndex, x + this.routeWidth, y + (this.hicannHeight - this.routeWidth) / 2);
            this.drawRightBusH(hicannIndex, x + this.hicannWidth - this.routeWidth, y);
        };
        /**
         * Draw all vertical left buses as one colored rectangle for a HICANN (as graphics object).
         */
        Overview.prototype.drawLeftBusH = function (hicannIndex, x, y) {
            var colorNumBuses = tools.colorInGradient(this.numRoutesLeftColorOne, this.numRoutesLeftColorTwo, this.wafer.numBusesLeftMax, this.wafer.hicanns[hicannIndex].numBusesLeft);
            pixiBackend.drawRectangle(pixiBackend.container.overviewBusesLeft, x, y, this.routeWidth, this.hicannHeight, colorNumBuses);
        };
        /**
         * Draw all vertical right buses as one colored rectangle for a HICANN (as graphics object).
         */
        Overview.prototype.drawRightBusH = function (hicannIndex, x, y) {
            var colorNumBuses = tools.colorInGradient(this.numRoutesRightColorOne, this.numRoutesRightColorTwo, this.wafer.numBusesRightMax, this.wafer.hicanns[hicannIndex].numBusesRight);
            pixiBackend.drawRectangle(pixiBackend.container.overviewBusesRight, x, y, this.routeWidth, this.hicannHeight, colorNumBuses);
        };
        /**
         * Draw all horizontal buses as one colored rectangle for a HICANN (as graphics object).
         */
        Overview.prototype.drawHorizontalBusH = function (hicannIndex, x, y) {
            var colorNumBuses = tools.colorInGradient(this.numRoutesHorizontalColorOne, this.numRoutesHorizontalColorTwo, this.wafer.numBusesHorizontalMax, this.wafer.hicanns[hicannIndex].numBusesHorizontal);
            pixiBackend.drawRectangle(pixiBackend.container.overviewBusesHorizontal, x, y, this.hicannWidth - 2 * this.routeWidth, this.routeWidth, colorNumBuses);
        };
        return Overview;
    }());
    internalModule.Overview = Overview;
})(internalModule || (internalModule = {}));
/// <reference path="overview.ts" />
/// <reference path="detailview.ts" />
/**
 * The namespace contains a number of classes that each have their separate purposes but have dependencies on each other.
 * They are written into separate files to keep a clear structure.
 */
var internalModule;
(function (internalModule) {
    /**
     * The AutoMode controls automatically what details of which HICANN are displayed,
     * depending on the zoom level as well as the part of the wafer that is currently within in the canvas boundaries.
     */
    var Automode = /** @class */ (function () {
        function Automode(overview, detailview) {
            this.enabled = undefined;
            this.overview = overview;
            this.detailview = detailview;
            this.wafer = overview.wafer;
            this.options = {
                synapses: true,
                leftBuses: true,
                rightBuses: true,
                horizontalBuses: true,
            };
            this.detailedHicanns = [];
        }
        /**
         * Initialization of the auto mode. Call this method when entering auto mode.
         * @param hicannIndex The index/coordinate of the HICANN, whose details should be shown.
         * @param levelOneEnabled Set to true if the automode should start in detailview.
         * @param levelTwoEnabled Set to true if the auomode should start in detailviewLevelTwo.
         */
        Automode.prototype.init = function (hicannIndex, levelOneEnabled, levelTwoEnabled) {
            this.enabled = true;
            // Auto/Manual switch design
            $("#automode")[0].classList.add("selected");
            $("#automode")[0].classList.remove("nonSelected");
            $("#manualmode")[0].classList.add("nonSelected");
            $("#manualmode")[0].classList.remove("selected");
            // display option checkboxes for auto mode
            $("#automodeCheckboxes").css("display", "block");
            $("#manualmodeCheckboxes").css("display", "none");
            // disable wafer elements list
            // otherwise automatic mode would get messed up
            $("#element_0").prop("checked", true);
            $("#element_0").prop("disabled", true);
            // start detailLevel depending on zoom level
            if (levelOneEnabled) {
                this.startDetailview(hicannIndex);
            }
            ;
            if (levelTwoEnabled) {
                this.startDetailviewLevelTwo(hicannIndex);
            }
            ;
            // render stage
            pixiBackend.renderer.render();
        };
        /**
         * Potentially leave a detailview and start the overview.
         * @param hicannIndex Index of the HICANN, whose detailview is left.
         */
        Automode.prototype.startOverview = function (hicannIndex) {
            // reset detailview
            this.detailview.resetDetailview();
            // set parameters in detailview
            this.detailview.enabled = false;
            this.detailview.levelTwoEnabled = false;
            this.detailview.currentHicann = undefined;
            // display overview
            // hide level one details
            for (var _i = 0, _a = this.detailedHicanns; _i < _a.length; _i++) {
                var hicannIndex_1 = _a[_i];
                this.setOverview(hicannIndex_1, true);
                this.setDetailview(hicannIndex_1, false);
            }
            // hide level two details
            this.setDetailviewLevelTwo(false);
        };
        /**
         * Start the detailview for a specified HICANN.
         * The Detailview can be entered coming either form the overview or the detailviewLevelTwo.
         */
        Automode.prototype.startDetailview = function (hicannIndex) {
            // check if coming from detailview level two
            if (!this.detailview.enabled) {
                this.getDetailedHicanns(hicannIndex);
                // draw detail objects i.e.
                //   synapse array level one and level two
                //	 buses level two
                for (var _i = 0, _a = this.detailedHicanns; _i < _a.length; _i++) {
                    var hicannIndex_2 = _a[_i];
                    this.detailview.drawHicann(hicannIndex_2);
                }
                ;
            }
            // display level one detailview
            // hide overview containers
            for (var _b = 0, _c = this.detailedHicanns; _b < _c.length; _b++) {
                var hicannIndex_3 = _c[_b];
                this.setDetailview(hicannIndex_3, true);
                this.setOverview(hicannIndex_3, false);
            }
            // hide level two details
            this.setDetailviewLevelTwo(false);
            // set parameters in detailview
            this.detailview.enabled = true;
            this.detailview.levelTwoEnabled = false;
            this.detailview.currentHicann = hicannIndex;
            this.detailview.updateSurroundingHicanns();
        };
        /**
         * Start the detailview level two (graphics objects instead of sprites).
         * Call this function only if currently in detailview.
         */
        Automode.prototype.startDetailviewLevelTwo = function (hicannIndex) {
            // set parameter in detailview
            this.detailview.levelTwoEnabled = true;
            // hide the sprites from detailview level one
            for (var _i = 0, _a = this.detailedHicanns; _i < _a.length; _i++) {
                var hicannIndex_4 = _a[_i];
                this.setDetailview(hicannIndex_4, false);
            }
            // display graphicsobject details from detailview level two
            this.setDetailviewLevelTwo(true);
        };
        /**
         * Switch to detailview of the western HICANN.
         */
        Automode.prototype.startWesternHicann = function (hicannIndex) {
            var levelTwoEnabled = this.detailview.levelTwoEnabled;
            // end detailview of old hicann
            this.startOverview(hicannIndex);
            // start detailview of new hicann
            this.startDetailview(this.detailview.westernHicann);
            // if level two was enabled before, start level two on new hicann
            if (levelTwoEnabled) {
                this.startDetailviewLevelTwo(this.detailview.currentHicann);
            }
            ;
        };
        /**
         * Switch to detailview of the eastern HICANN.
         */
        Automode.prototype.startEasternHicann = function (hicannIndex) {
            var levelTwoEnabled = this.detailview.levelTwoEnabled;
            // end detailview of old hicann
            this.startOverview(hicannIndex);
            // start detailview of new hicann
            this.startDetailview(this.detailview.easternHicann);
            // if level two was enabled before, start level two on new hicann
            if (levelTwoEnabled) {
                this.startDetailviewLevelTwo(this.detailview.currentHicann);
            }
            ;
        };
        /**
         * Switch to detailview of the northern HICANN.
         */
        Automode.prototype.startNorthernHicann = function (hicannIndex) {
            var levelTwoEnabled = this.detailview.levelTwoEnabled;
            // end detailview of old hicann
            this.startOverview(hicannIndex);
            this.startDetailview(this.detailview.northernHicann);
            // if level two was enabled before, start level two on new hicann
            if (levelTwoEnabled) {
                this.startDetailviewLevelTwo(this.detailview.currentHicann);
                // start detailview of new hicann
            }
            ;
        };
        /**
         * Switch to detailview of the sourthern HICANN.
         */
        Automode.prototype.startSouthernHicann = function (hicannIndex) {
            var levelTwoEnabled = this.detailview.levelTwoEnabled;
            // end detailview of old hicann
            this.startOverview(hicannIndex);
            // start detailview of new hicann
            this.startDetailview(this.detailview.southernHicann);
            // if level two was enabled before, start level two on new hicann
            if (levelTwoEnabled) {
                this.startDetailviewLevelTwo(this.detailview.currentHicann);
            }
            ;
        };
        /**
         * Set visible properties for the overview elements of a HICANN.
         * @param hicannIndex HICANN to be set.
         * @param enabled pass true for visible and false for hidden.
         */
        Automode.prototype.setOverview = function (hicannIndex, enabled) {
            this.overview.hicannNumber.setVisible(enabled);
            this.overview.hicannNumber.updateCheckbox();
            pixiBackend.container.backgrounds.children[hicannIndex].visible = enabled;
            pixiBackend.container.inputs.children[hicannIndex].visible = enabled;
            pixiBackend.container.overviewBusesLeft.children[hicannIndex].visible = enabled;
            pixiBackend.container.overviewBusesRight.children[hicannIndex].visible = enabled;
            pixiBackend.container.overviewBusesHorizontal.children[hicannIndex].visible = enabled;
        };
        /**
         * Set visible properties for the detailview elements of a HICANN.
         * @param hicannIndex HICANN to be set.
         * @param enabled pass true for visible and false for hidden.
         */
        Automode.prototype.setDetailview = function (hicannIndex, enabled) {
            pixiBackend.container.synapsesOneSprite.visible = this.options.synapses ? enabled : false;
            pixiBackend.container.synapsesTwoSprite.visible = this.options.synapses ? enabled : false;
            pixiBackend.container.busesLeftSprite.children[hicannIndex].visible = this.options.leftBuses ? enabled : false;
            pixiBackend.container.busesRightSprite.children[hicannIndex].visible = this.options.rightBuses ? enabled : false;
            pixiBackend.container.busesHorizontalSprite.children[hicannIndex].visible = this.options.horizontalBuses ? enabled : false;
        };
        /**
         * Set visible properties for the detailviewLevelTwo elements of a HICANN.
         * @param hicannIndex HICANN to be set.
         * @param enabled pass true for visible and false for hidden.
         */
        Automode.prototype.setDetailviewLevelTwo = function (enabled) {
            pixiBackend.container.synapsesOne.visible = this.options.synapses ? enabled : false;
            pixiBackend.container.synapsesTwo.visible = this.options.synapses ? enabled : false;
            pixiBackend.container.busesLeft.visible = this.options.leftBuses ? enabled : false;
            pixiBackend.container.busesRight.visible = this.options.rightBuses ? enabled : false;
            pixiBackend.container.busesHorizontal.visible = this.options.horizontalBuses ? enabled : false;
        };
        /**
         * Find the eigth surrounding HICANNs of a HICANN (if existing).
         */
        Automode.prototype.getDetailedHicanns = function (hicannIndex) {
            // reset array
            this.detailedHicanns = [];
            // center HICANN
            this.detailedHicanns.push(hicannIndex);
            // northern HICANN
            if (this.wafer.northernHicann(hicannIndex) !== undefined) {
                this.detailedHicanns.push(this.wafer.northernHicann(hicannIndex));
                // north-western HICANN
                if (this.wafer.westernHicann(this.wafer.northernHicann(hicannIndex)) !== undefined) {
                    this.detailedHicanns.push(this.wafer.westernHicann(this.wafer.northernHicann(hicannIndex)));
                }
                // north-eastern HICANN
                if (this.wafer.easternHicann(this.wafer.northernHicann(hicannIndex)) !== undefined) {
                    this.detailedHicanns.push(this.wafer.easternHicann(this.wafer.northernHicann(hicannIndex)));
                }
            }
            // eastern HICANN
            if (this.wafer.easternHicann(hicannIndex) !== undefined) {
                this.detailedHicanns.push(this.wafer.easternHicann(hicannIndex));
            }
            // southern HICANN
            if (this.wafer.southernHicann(hicannIndex) !== undefined) {
                this.detailedHicanns.push(this.wafer.southernHicann(hicannIndex));
                // south-western HICANN
                if (this.wafer.westernHicann(this.wafer.southernHicann(hicannIndex)) !== undefined) {
                    this.detailedHicanns.push(this.wafer.westernHicann(this.wafer.southernHicann(hicannIndex)));
                }
                // south-eastern HICANN
                if (this.wafer.easternHicann(this.wafer.southernHicann(hicannIndex)) !== undefined) {
                    this.detailedHicanns.push(this.wafer.easternHicann(this.wafer.southernHicann(hicannIndex)));
                }
            }
            // western HICANN
            if (this.wafer.westernHicann(hicannIndex) !== undefined) {
                this.detailedHicanns.push(this.wafer.westernHicann(hicannIndex));
            }
        };
        return Automode;
    }());
    internalModule.Automode = Automode;
})(internalModule || (internalModule = {}));
/// <reference path="detailview.ts" />
/// <reference path="overview.ts" />
/**
 * The namespace contains a number of classes that each have their separate purposes but have dependencies on each other.
 * They are written into separate files to keep a clear structure.
 */
var internalModule;
(function (internalModule) {
    /**
     * The manual mode aims at giving the user full control over what details to show for which HICANN.
     * Clicking checkboxes in the UI sets the visible property for the respective pixiJS containers.
     * Switching between detailview and detailviewLevelTwo (sprites vs. graphics objects) is still done automatically.
     */
    var Manualmode = /** @class */ (function () {
        function Manualmode(overview, detailview) {
            /**
             * set this property when entering or leaving the manual mode
             */
            this.enabled = false;
            this.detailview = detailview;
            this.overview = overview;
            this.wafer = overview.wafer;
            /**
             *
             */
            this.selectedElements = {
                overview: {
                    numNeurons: [],
                    numInputs: [],
                    left: [],
                    right: [],
                    horizontal: []
                },
                detailview: {
                    left: [],
                    right: [],
                    horizontal: []
                }
            };
            this.containerIndices = {
                left: [],
                right: [],
                horizontal: []
            };
            // initialize selected Elements with standard overview values
            for (var i = this.wafer.enumMin; i <= this.wafer.enumMax; i++) {
                this.selectedElements.overview.numNeurons.push(true);
                this.selectedElements.overview.numInputs.push(true);
                this.selectedElements.overview.left.push(true);
                this.selectedElements.overview.right.push(true);
                this.selectedElements.overview.horizontal.push(true);
                this.selectedElements.detailview.left.push(false);
                this.selectedElements.detailview.right.push(false);
                this.selectedElements.detailview.horizontal.push(false);
            }
        }
        ;
        /**
         * Initialize the manual mode. Call this method when starting the manual mode.
         * @param levelOneEnabled Set to true if the manual mode is started in detailview.
         * @param levelTwoEnabled Set to true if the manual mode is started in detailviewLevelTwo.
         */
        Manualmode.prototype.init = function (levelOneEnabled, levelTwoEnabled) {
            this.enabled = true;
            // Auto/Manual switch design
            $("#manualmode")[0].classList.add("selected");
            $("#manualmode")[0].classList.remove("nonSelected");
            $("#automode")[0].classList.add("nonSelected");
            $("#automode")[0].classList.remove("selected");
            // display option checkboxes for manual mode
            $("#manualmodeCheckboxes").css("display", "block");
            $("#automodeCheckboxes").css("display", "none");
            // enable Wafer elements list
            // user can now select each element to be shown by hand
            $("#element_0").prop("disabled", false);
            // display the checked elements
            this.setOverview(true, false);
            this.setDetailview(true, false);
            // start detailLevel depending on zoom level
            if (levelOneEnabled) {
                this.startDetailview();
            }
            ;
            if (levelTwoEnabled) {
                this.startDetailviewLevelTwo();
            }
            ;
            // render stage
            pixiBackend.renderer.render();
        };
        /**
         * Reset all elements to a plain "overview".
         * Call this method when switching to automode.
         */
        Manualmode.prototype.resetView = function () {
            // reset detail Levels
            if (this.detailview.levelTwoEnabled) {
                this.leaveDetailviewLevelTwo();
            }
            ;
            if (this.detailview.enabled) {
                this.leaveDetailview();
            }
            ;
            // hide detailview and show overview
            this.setDetailview(false, false);
            this.setOverview(true, true);
        };
        /**
         * Start the detailview. Only hides the HICANN number, because the rest is managed manually.
         */
        Manualmode.prototype.startDetailview = function () {
            this.overview.hicannNumber.setVisible(false);
            this.overview.hicannNumber.updateCheckbox();
            this.detailview.enabled = true;
        };
        /**
         * Leave the detailview.
         */
        Manualmode.prototype.leaveDetailview = function () {
            this.overview.hicannNumber.setVisible(true);
            this.overview.hicannNumber.updateCheckbox();
            this.detailview.enabled = false;
        };
        /**
         * Start the DetailviewLevelTwo to switch from sprites to graphics objects.
         */
        Manualmode.prototype.startDetailviewLevelTwo = function () {
            // set detailview property
            this.detailview.levelTwoEnabled = true;
            // set container properties
            this.setDetailviewLevelTwo(true);
            // loop through detailed buses and switch from sprites to graphics object
            for (var i = this.wafer.enumMin; i <= this.wafer.enumMax; i++) {
                var hicannPosition = this.wafer.hicanns[i].position;
                // left buses
                if (this.selectedElements.detailview.left[i] == true) {
                    // draw graphics object
                    this.containerIndices.left.push(i);
                    this.detailview.drawBusesLeft(hicannPosition);
                    // hide sprites
                    pixiBackend.container.busesLeftSprite.children[i].visible = false;
                }
                // right buses
                if (this.selectedElements.detailview.right[i] == true) {
                    // draw graphics object
                    this.containerIndices.right.push(i);
                    this.detailview.drawBusesRight(hicannPosition);
                    // hide sprites
                    pixiBackend.container.busesRightSprite.children[i].visible = false;
                }
                // horizontal buses
                if (this.selectedElements.detailview.horizontal[i] == true) {
                    // draw graphics object
                    this.containerIndices.horizontal.push(i);
                    this.detailview.drawBusesHorizontal(hicannPosition);
                    // hide sprites
                    pixiBackend.container.busesHorizontalSprite.children[i].visible = false;
                }
            }
        };
        /**
         * Leave the detailviewLevelTwo to switch from graphics objects back to sprites.
         */
        Manualmode.prototype.leaveDetailviewLevelTwo = function () {
            // set detailview property
            this.detailview.levelTwoEnabled = false;
            // set container properties
            this.setDetailviewLevelTwo(false);
            // loop through detailed buses and switch from graphics object to sprites
            for (var i = this.wafer.enumMin; i <= this.wafer.enumMax; i++) {
                // left buses
                if (this.selectedElements.detailview.left[i] == true) {
                    // remove one graphics object
                    pixiBackend.removeChild(pixiBackend.container.busesLeft, 0);
                    // display sprite
                    pixiBackend.container.busesLeftSprite.children[i].visible = true;
                }
                // right buses
                if (this.selectedElements.detailview.right[i] == true) {
                    // remove one graphics object
                    pixiBackend.removeChild(pixiBackend.container.busesRight, 0);
                    // display sprite
                    pixiBackend.container.busesRightSprite.children[i].visible = true;
                }
                // horizontal buses
                if (this.selectedElements.detailview.horizontal[i] == true) {
                    // remove one graphics object
                    pixiBackend.removeChild(pixiBackend.container.busesHorizontal, 0);
                    // display sprite
                    pixiBackend.container.busesHorizontalSprite.children[i].visible = true;
                }
            }
            // reset container indices
            this.containerIndices.left = [];
            this.containerIndices.right = [];
            this.containerIndices.horizontal = [];
        };
        /**
         * Set the visible properties for all elements of the overview.
         * @param viewChecked Set to true if checked (in UI checkbox) elements should be set.
         * @param viewUnchecked Set to true if unchecked (in UI checkbox) elements should be set.
         */
        Manualmode.prototype.setOverview = function (viewChecked, viewUnchecked) {
            // loop through detailed Buses and hide/display checked ones
            for (var i = this.wafer.enumMin; i <= this.wafer.enumMax; i++) {
                // number neurons
                pixiBackend.container.backgrounds.children[i].visible =
                    (this.selectedElements.overview.numNeurons[i] == true) ? viewChecked : viewUnchecked;
                // number inputs
                pixiBackend.container.inputs.children[i].visible =
                    (this.selectedElements.overview.numInputs[i] == true) ? viewChecked : viewUnchecked;
                // left buses
                pixiBackend.container.overviewBusesLeft.children[i].visible =
                    (this.selectedElements.overview.left[i] == true) ? viewChecked : viewUnchecked;
                // right buses
                pixiBackend.container.overviewBusesRight.children[i].visible =
                    (this.selectedElements.overview.right[i] == true) ? viewChecked : viewUnchecked;
                // horizontal buses
                pixiBackend.container.overviewBusesHorizontal.children[i].visible =
                    (this.selectedElements.overview.horizontal[i] == true) ? viewChecked : viewUnchecked;
            }
        };
        /**
         * Set the visible properties for all elements of the detailview.
         * @param viewChecked Set to true if checked (in UI checkbox) elements should be set.
         * @param viewUnchecked Set to true if unchecked (in UI checkbox) elements should be set.
         */
        Manualmode.prototype.setDetailview = function (viewChecked, viewUnchecked) {
            // loop through detailed Buses and hide/display checked ones
            for (var i = this.wafer.enumMin; i <= this.wafer.enumMax; i++) {
                // left buses
                pixiBackend.container.busesLeftSprite.children[i].visible =
                    (this.selectedElements.detailview.left[i] == true) ? viewChecked : viewUnchecked;
                // right buses
                pixiBackend.container.busesRightSprite.children[i].visible =
                    (this.selectedElements.detailview.right[i] == true) ? viewChecked : viewUnchecked;
                // horizontal buses
                pixiBackend.container.busesHorizontalSprite.children[i].visible =
                    (this.selectedElements.detailview.horizontal[i] == true) ? viewChecked : viewUnchecked;
            }
        };
        /**
         * Set the visible properties for all elements of the detailviewLevelTwo.
         */
        Manualmode.prototype.setDetailviewLevelTwo = function (enabled) {
            pixiBackend.container.synapsesOne.visible = enabled;
            pixiBackend.container.synapsesTwo.visible = enabled;
            pixiBackend.container.busesLeft.visible = enabled;
            pixiBackend.container.busesRight.visible = enabled;
            pixiBackend.container.busesHorizontal.visible = enabled;
        };
        /**
         * Handle clicking the checkbox for a vertical left buses of a HICANN in the HICANN list.
         * If checked, the graphics elements for that bus are drawn, if unchecked the graphics element removed.
         */
        Manualmode.prototype.busesLeft = function (hicannIndex, checked) {
            if (checked) {
                if (this.detailview.levelTwoEnabled) {
                    // draw graphics element and store container.children index
                    this.detailview.drawBusesLeft(this.wafer.hicanns[hicannIndex].position);
                    this.containerIndices.left.push(hicannIndex);
                }
                else {
                    // set pixiJS container visible property
                    pixiBackend.container.busesLeftSprite.children[hicannIndex].visible = true;
                }
                // update selected Elements list
                this.selectedElements.detailview.left[hicannIndex] = true;
            }
            else {
                if (this.detailview.levelTwoEnabled) {
                    // remove graphics element
                    var containerIndex = this.containerIndices.left.indexOf(hicannIndex);
                    pixiBackend.removeChild(pixiBackend.container.busesLeft, containerIndex);
                    this.containerIndices.left.splice(containerIndex, 1);
                }
                else {
                    // set pixiJS container visible property
                    pixiBackend.container.busesLeftSprite.children[hicannIndex].visible = false;
                }
                // update selected Elements list
                this.selectedElements.detailview.left[hicannIndex] = false;
            }
        };
        /**
         * Handle clicking the checkbox for a vertical right buses of a HICANN in the HICANN list.
         * If checked, the graphics elements for that bus are drawn, if unchecked the graphics element removed.
         */
        Manualmode.prototype.busesRight = function (hicannIndex, checked) {
            if (checked) {
                if (this.detailview.levelTwoEnabled) {
                    // draw graphics element and store container.children index
                    this.detailview.drawBusesRight(this.wafer.hicanns[hicannIndex].position);
                    this.containerIndices.right.push(hicannIndex);
                }
                else {
                    // set pixiJS container visible property
                    pixiBackend.container.busesRightSprite.children[hicannIndex].visible = true;
                }
                // update selected Elements list
                this.selectedElements.detailview.right[hicannIndex] = true;
            }
            else {
                if (this.detailview.levelTwoEnabled) {
                    // remove graphics element
                    var containerIndex = this.containerIndices.right.indexOf(hicannIndex);
                    pixiBackend.removeChild(pixiBackend.container.busesRight, containerIndex);
                    this.containerIndices.right.splice(containerIndex, 1);
                }
                else {
                    // set pixiJS container visible property
                    pixiBackend.container.busesRightSprite.children[hicannIndex].visible = false;
                }
                // update selected Elements list
                this.selectedElements.detailview.right[hicannIndex] = false;
            }
        };
        /**
         * Handle clicking the checkbox for a horizontal buses of a HICANN in the HICANN list.
         * If checked, the graphics elements for that bus are drawn, if unchecked the graphics element removed.
         */
        Manualmode.prototype.busesHorizontal = function (hicannIndex, checked) {
            if (checked) {
                if (this.detailview.levelTwoEnabled) {
                    // draw graphics element and store container.children index
                    this.detailview.drawBusesHorizontal(this.wafer.hicanns[hicannIndex].position);
                    this.containerIndices.horizontal.push(hicannIndex);
                }
                else {
                    // set pixiJS container visible property
                    pixiBackend.container.busesHorizontalSprite.children[hicannIndex].visible = true;
                }
                // update selected Elements list
                this.selectedElements.detailview.horizontal[hicannIndex] = true;
            }
            else {
                if (this.detailview.levelTwoEnabled) {
                    // remove graphics element
                    var containerIndex = this.containerIndices.horizontal.indexOf(hicannIndex);
                    pixiBackend.removeChild(pixiBackend.container.busesHorizontal, containerIndex);
                    this.containerIndices.horizontal.splice(containerIndex, 1);
                }
                else {
                    // set pixiJS container visible property
                    pixiBackend.container.busesHorizontalSprite.children[hicannIndex].visible = false;
                }
                // update selected Elements list
                this.selectedElements.detailview.horizontal[hicannIndex] = false;
            }
        };
        /**
         * synchronize the checkboxes in the HICANN list when the all elements of one type are drawn at once.
         * @param element type of the element. "numNeurons" for example are are the colored HICANN backgrounds of the overview.
         */
        Manualmode.prototype.checkAllCheckboxes = function (element) {
            var allElementsSelected = true;
            switch (element) {
                case "numNeurons":
                    for (var i = 0; i < this.selectedElements.overview.numNeurons.length; i++) {
                        if (this.selectedElements.overview.numNeurons[i] === false) {
                            allElementsSelected = false;
                            break;
                        }
                        ;
                    }
                    ;
                    if (allElementsSelected) {
                        $("#numNeuronsCheckbox").prop("checked", true);
                    }
                    else {
                        $("#numNeuronsCheckbox").prop("checked", false);
                    }
                    break;
                case "numInputs":
                    for (var i = 0; i < this.selectedElements.overview.numInputs.length; i++) {
                        if (this.selectedElements.overview.numInputs[i] === false) {
                            allElementsSelected = false;
                            break;
                        }
                        ;
                    }
                    ;
                    if (allElementsSelected) {
                        $("#numInputsCheckbox").prop("checked", true);
                    }
                    else {
                        $("#numInputsCheckbox").prop("checked", false);
                    }
                    break;
                case "left":
                    for (var i = 0; i < this.selectedElements.overview.left.length; i++) {
                        if (this.selectedElements.overview.left[i] === false) {
                            allElementsSelected = false;
                            break;
                        }
                        ;
                    }
                    ;
                    if (allElementsSelected) {
                        $("#verticalLeftCheckbox").prop("checked", true);
                    }
                    else {
                        $("#verticalLeftCheckbox").prop("checked", false);
                    }
                    break;
                case "right":
                    for (var i = 0; i < this.selectedElements.overview.right.length; i++) {
                        if (this.selectedElements.overview.right[i] === false) {
                            allElementsSelected = false;
                            break;
                        }
                        ;
                    }
                    ;
                    if (allElementsSelected) {
                        $("#verticalRightCheckbox").prop("checked", true);
                    }
                    else {
                        $("#verticalRightCheckbox").prop("checked", false);
                    }
                    break;
                case "horizontal":
                    for (var i = 0; i < this.selectedElements.overview.horizontal.length; i++) {
                        if (this.selectedElements.overview.horizontal[i] === false) {
                            allElementsSelected = false;
                            break;
                        }
                        ;
                    }
                    ;
                    if (allElementsSelected) {
                        $("#horizontalCheckbox").prop("checked", true);
                    }
                    else {
                        $("#horizontalCheckbox").prop("checked", false);
                    }
                    break;
                case "detailLeft":
                    for (var i = 0; i < this.selectedElements.detailview.left.length; i++) {
                        if (this.selectedElements.detailview.left[i] === false) {
                            allElementsSelected = false;
                            break;
                        }
                        ;
                    }
                    ;
                    if (allElementsSelected) {
                        $("#verticalLeftDetailsCheckbox").prop("checked", true);
                    }
                    else {
                        $("#verticalLeftDetailsCheckbox").prop("checked", false);
                    }
                    break;
                case "detailRight":
                    for (var i = 0; i < this.selectedElements.detailview.right.length; i++) {
                        if (this.selectedElements.detailview.right[i] === false) {
                            allElementsSelected = false;
                            break;
                        }
                        ;
                    }
                    ;
                    if (allElementsSelected) {
                        $("#verticalRightDetailsCheckbox").prop("checked", true);
                    }
                    else {
                        $("#verticalRightDetailsCheckbox").prop("checked", false);
                    }
                    break;
                case "detailHorizontal":
                    for (var i = 0; i < this.selectedElements.detailview.horizontal.length; i++) {
                        if (this.selectedElements.detailview.horizontal[i] === false) {
                            allElementsSelected = false;
                            break;
                        }
                        ;
                    }
                    ;
                    if (allElementsSelected) {
                        $("#horizontalDetailsCheckbox").prop("checked", true);
                    }
                    else {
                        $("#horizontalDetailsCheckbox").prop("checked", false);
                    }
                    break;
            }
            ;
        };
        /**
         * Update the selectedElements list and the UI checkboxes in the HICANN list when all elements of one type are set at once.
         * @param element type of the element. "numNeurons" for example are are the colored HICANN backgrounds of the overview.
         */
        Manualmode.prototype.setAllCheckboxes = function (element, checked) {
            switch (element) {
                case "numNeurons":
                    for (var i = 0; i < this.selectedElements.overview.numNeurons.length; i++) {
                        this.selectedElements.overview.numNeurons[i] = checked;
                        $("#element_0_" + i + "_0_0").prop("checked", checked);
                    }
                    ;
                    break;
                case "numInputs":
                    for (var i = 0; i < this.selectedElements.overview.numInputs.length; i++) {
                        this.selectedElements.overview.numInputs[i] = checked;
                        $("#element_0_" + i + "_0_1").prop("checked", checked);
                    }
                    ;
                    break;
                case "left":
                    for (var i = 0; i < this.selectedElements.overview.left.length; i++) {
                        this.selectedElements.overview.left[i] = checked;
                        $("#element_0_" + i + "_0_2").prop("checked", checked);
                    }
                    ;
                    break;
                case "right":
                    for (var i = 0; i < this.selectedElements.overview.right.length; i++) {
                        this.selectedElements.overview.right[i] = checked;
                        $("#element_0_" + i + "_0_3").prop("checked", checked);
                    }
                    ;
                    break;
                case "horizontal":
                    for (var i = 0; i < this.selectedElements.overview.horizontal.length; i++) {
                        this.selectedElements.overview.horizontal[i] = checked;
                        $("#element_0_" + i + "_0_4").prop("checked", checked);
                    }
                    ;
                    break;
                case "detailLeft":
                    for (var i = 0; i < this.selectedElements.detailview.left.length; i++) {
                        this.selectedElements.detailview.left[i] = checked;
                        $("#element_0_" + i + "_1_0").prop("checked", checked);
                    }
                    ;
                    break;
                case "detailRight":
                    for (var i = 0; i < this.selectedElements.detailview.right.length; i++) {
                        this.selectedElements.detailview.right[i] = checked;
                        $("#element_0_" + i + "_1_1").prop("checked", checked);
                    }
                    ;
                    break;
                case "detailHorizontal":
                    for (var i = 0; i < this.selectedElements.detailview.horizontal.length; i++) {
                        this.selectedElements.detailview.horizontal[i] = checked;
                        $("#element_0_" + i + "_1_2").prop("checked", checked);
                    }
                    ;
                    break;
            }
            ;
        };
        return Manualmode;
    }());
    internalModule.Manualmode = Manualmode;
})(internalModule || (internalModule = {}));
/// <reference path="routes_json.d.ts" />
/// <reference path="detailview.ts" />
/**
 * The namespace contains a number of classes that each have their separate purposes but have dependencies on each other.
 * They are written into separate files to keep a clear structure.
 */
var internalModule;
(function (internalModule) {
    /**
     * Load and process the route data from a json.
     * The route data will later be availabe via the Marocco API.
     */
    function loadRouteData() {
        // array with strings for each route element
        var routesString = JSON.parse(routesJSON);
        var routes = [];
        for (var _i = 0, routesString_1 = routesString; _i < routesString_1.length; _i++) {
            var route = routesString_1[_i];
            // split array into segments on different hicanns
            var routesSegmented = [];
            while (route.length > 0) {
                for (var i = 1; i < route.length; i++) {
                    if (route[i].includes("HICANNOnWafer")) {
                        routesSegmented.push(route.splice(0, i));
                        break;
                    }
                    if (i == (route.length - 1)) {
                        routesSegmented.push(route.splice(0, i + 1));
                    }
                }
            }
            // push route segments as new RouteElements into array
            var routeElements = [];
            for (var _a = 0, routesSegmented_1 = routesSegmented; _a < routesSegmented_1.length; _a++) {
                var segment = routesSegmented_1[_a];
                for (var i = 1; i < segment.length; i++) {
                    var hicann = tools.numberInString(segment[0]);
                    var type = (segment[i].includes("HLine")) ? "hLine" : "vLine";
                    var index = tools.numberInString(segment[i]);
                    routeElements.push(new RouteElement(hicann, type, index));
                }
            }
            // store route in routes array
            routes.push(new Route(routeElements, routes.length));
        }
        return routes;
    }
    /**
     * An element of a route, either a vertical or a horizontal bus.
     */
    var RouteElement = /** @class */ (function () {
        function RouteElement(hicann, type, index) {
            this.hicann = hicann;
            this.type = type;
            this.index = index;
        }
        return RouteElement;
    }());
    /**
     * A complete route with source and target HICANN.
     */
    var Route = /** @class */ (function () {
        function Route(routeElements, ID) {
            /**
             * Indicates whether the route will be rendered or not.
             */
            this.visible = true;
            this.route = routeElements;
            this.sourceHicann = this.route[0].hicann;
            this.targetHicann = this.route[this.route.length - 1].hicann;
            this.ID = ID;
            this.color = tools.randomHexColor();
            this.greyedOut = false;
        }
        return Route;
    }());
    /**
     * Control the route information in the UI route-info box.
     */
    var RouteInfo = /** @class */ (function () {
        function RouteInfo() {
            this.details = false;
        }
        /**
         * Display information about a list of routes.
         */
        RouteInfo.prototype.displayRouteInfo = function (routes) {
            //remove old info
            this.reset();
            if (routes.length !== 1) {
                // display numbers of all selected routes
                var routeNumbers = "";
                for (var _i = 0, routes_1 = routes; _i < routes_1.length; _i++) {
                    var route = routes_1[_i];
                    routeNumbers += route.ID + 1 + ", ";
                }
                ;
                routeNumbers = routeNumbers.slice(0, -2);
                $("#routeNumber").html("Routes " + routeNumbers);
            }
            else {
                // display info about selected route
                $("#routeNumber").html("Route " + (routes[0].ID + 1));
                $("#routeInfoBox").append("<p id=\"sourceHicann\" class=\"routeInfoItem\">\n\t\t\t\t\t\tsource hicann: <span>" + routes[0].sourceHicann + "</span></p>");
                $("#routeInfoBox").append("<p id=\"targetHicann\" class=\"routeInfoItem\">\n\t\t\t\t\t\ttarget hicann: <span>" + routes[0].targetHicann + "</span></p>");
                // expand list to show all route segments
                var routeDetails = $("<button id=\"routeDetails\">details</button>");
                routeDetails.click(function () {
                    if (this.details) {
                        this.removeDetailsList();
                        this.details = false;
                    }
                    else {
                        this.buildRouteDetailsList(routes[0]);
                        this.details = true;
                    }
                }.bind(this));
                $("#targetHicann").after(routeDetails);
                if (this.details) {
                    this.buildRouteDetailsList(routes[0]);
                }
            }
        };
        /**
         * Build an HTML list of route segments.
         */
        RouteInfo.prototype.buildRouteDetailsList = function (route) {
            var html = "";
            // open containing div
            html += "<div id='routeElementsBox'>";
            // build route elements list
            for (var _i = 0, _a = route.route; _i < _a.length; _i++) {
                var element = _a[_i];
                html += "<p class='routeElementItem'>HICANN <span>" + element.hicann + "</span>: " + element.type + " <span>" + element.index + "</span></p>";
            }
            // close containing div
            html += "</div>";
            // append
            $("#sourceHicann").after(html);
        };
        /**
         * Remove the HTML list of route segments
         */
        RouteInfo.prototype.removeDetailsList = function () {
            $("#routeElementsBox").remove();
            $(".routeElementItem").remove();
        };
        /**
         * reset the UI route-info box.
         */
        RouteInfo.prototype.reset = function () {
            $("#routeNumber").html("Route Info");
            $("#routeDetails").remove();
            $(".routeInfoItem").remove();
            this.removeDetailsList();
        };
        return RouteInfo;
    }());
    /**
     * Controls all the routes that are visualized. All routes are stored as a new instance of the class Route.
     * When a route is selected, an additional route is drawn on top of all the other routes, so selected route are not hidden by other routes.
     * When the class is constructed with a routes array, the number of positions (first index) have to match the number of routes.
     */
    var RoutesOnStage = /** @class */ (function () {
        function RoutesOnStage(detailview, routes, positions) {
            /**
             * Different zoom-levels for route width adjustment.
             */
            this.zoomLevels = {
                level0: {
                    scale: 0.2,
                    originalWidth: 200,
                    width: 200 // changes when width-slider changes
                },
                level1: {
                    scale: 0.4,
                    originalWidth: 70,
                    width: 70
                },
                level2: {
                    scale: 1.0,
                    originalWidth: 30,
                    width: 30
                },
                level3: {
                    scale: 3.0,
                    originalWidth: 10,
                    width: 10
                },
                level4: {
                    scale: 8.0,
                    originalWidth: 3,
                    width: 3
                },
                current: undefined
            };
            this.detailview = detailview;
            this.wafer = detailview.wafer;
            this.routeInfo = new RouteInfo();
            if (routes && positions) {
                if (routes.length === positions.length) {
                    this.routes = routes;
                    this.positions = positions;
                }
                else {
                    throw (new Error("Incompatible input: Routes array has a different length than positions array"));
                }
            }
            else {
                this.routes = [];
                this.selectedRoutes = [];
                this.positions = [];
            }
        }
        Object.defineProperty(RoutesOnStage.prototype, "numRoutes", {
            /**
             * total number of routes in the visualization.
             */
            get: function () {
                return this.routes.length;
            },
            enumerable: true,
            configurable: true
        });
        ;
        /**
         * Add a route to the routes list.
         */
        RoutesOnStage.prototype.addRoute = function (route, position) {
            this.routes.push(route);
            this.positions.push(position);
        };
        ;
        /**
         * Number of segments of a route.
         * @param routeID
         */
        RoutesOnStage.prototype.routeLength = function (routeID) {
            return this.routes[routeID].route.length;
        };
        ;
        /**
         * Process route data, instantiate and draw all routes.
         */
        RoutesOnStage.prototype.drawRoutes = function () {
            // load routes
            var routes = loadRouteData();
            // draw routes and store them
            for (var _i = 0, routes_2 = routes; _i < routes_2.length; _i++) {
                var route = routes_2[_i];
                this.drawRoute(route);
            }
        };
        ;
        /**
         * Redraw all routes, without loading the route data again.
         * The position values are overwritten.
         */
        RoutesOnStage.prototype.redrawRoutes = function () {
            // draw already stored routes, recalculate positions
            for (var _i = 0, _a = this.routes; _i < _a.length; _i++) {
                var route = _a[_i];
                this.drawRoute(route, true);
            }
            // ... and the selected routes
            for (var _b = 0, _c = this.selectedRoutes; _b < _c.length; _b++) {
                var route = _c[_b];
                this.drawRoute(route, true, true);
            }
        };
        ;
        /**
         * Calculate the positions for all route segments and draw a route.
         * @param saveOnlyPositions Set to true, if only the position values should be stored. Otherwise a new Route is stored in the routes array and the route will have a new color.
         * @param selected Set to true, to store the route in the PixiJS container for selected routes.
         */
        RoutesOnStage.prototype.drawRoute = function (route, saveOnlyPositions, selected) {
            if (saveOnlyPositions === void 0) { saveOnlyPositions = false; }
            if (selected === void 0) { selected = false; }
            var positions = [];
            var switchCircles = [];
            // calculate positions of route segments
            for (var _i = 0, _a = route.route; _i < _a.length; _i++) {
                var segment = _a[_i];
                if (segment.type === "vLine") {
                    positions.push(this.calcSegmentVertical(segment));
                }
                else if (segment.type === "hLine") {
                    positions.push(this.calcSegmentHorizontal(segment));
                }
                else {
                    throw (new Error("wrong route segment type"));
                }
            }
            // calculate circle positions of route intersection points -> switches
            for (var i = 1; i < route.route.length; i++) {
                if (route.route[i].type !== route.route[i - 1].type) {
                    // square, where horizontal and vertical segments intersect
                    var intersectionSquare = tools.intersectionRectangle(positions[i], positions[i - 1]);
                    // calculate circle positions
                    switchCircles.push(tools.circleInSquare(intersectionSquare));
                }
            }
            ;
            // rearrange position values into arrays for drawing
            var xValues = [];
            var yValues = [];
            var widthValues = [];
            var heightValues = [];
            for (var _b = 0, positions_1 = positions; _b < positions_1.length; _b++) {
                var position = positions_1[_b];
                xValues.push(position.x);
                yValues.push(position.y);
                widthValues.push(position.width);
                heightValues.push(position.height);
            }
            ;
            // rearrange switch circle position values into arrays for drawing
            var switchXValues = [];
            var switchYValues = [];
            var switchRadiusValues = [];
            for (var _c = 0, switchCircles_1 = switchCircles; _c < switchCircles_1.length; _c++) {
                var position = switchCircles_1[_c];
                switchXValues.push(position.x);
                switchYValues.push(position.y);
                switchRadiusValues.push(position.radius);
            }
            ;
            // container to store routes in
            var routesContainer;
            var switchesContainer;
            if (selected) {
                routesContainer = pixiBackend.container.selectedRoutes;
                switchesContainer = pixiBackend.container.selectedSwitches;
            }
            else {
                routesContainer = pixiBackend.container.routes;
                switchesContainer = pixiBackend.container.switches;
            }
            ;
            // draw Route
            if (route.greyedOut) {
                pixiBackend.drawRectangles(routesContainer, xValues, yValues, widthValues, heightValues, "0x8c8c8c");
            }
            else {
                pixiBackend.drawRectangles(routesContainer, xValues, yValues, widthValues, heightValues, route.color);
            }
            ;
            // draw Circles on Switches (between horizontal and vertical segment of same route)
            // switches are on top of all the routes
            if (route.greyedOut) {
                pixiBackend.drawCircles(switchesContainer, switchXValues, switchYValues, switchRadiusValues, "0x8c8c8c");
            }
            else {
                pixiBackend.drawCircles(switchesContainer, switchXValues, switchYValues, switchRadiusValues, "0xffffff");
            }
            ;
            // save full route || update positions
            if (saveOnlyPositions) {
                this.positions[route.ID] = positions;
            }
            else {
                this.addRoute(route, positions);
            }
            ;
        };
        ;
        /**
         * Calculate rectangle that represents a vertical route segment.
         */
        RoutesOnStage.prototype.calcSegmentVertical = function (segment) {
            var hicannPosition = {
                x: this.wafer.hicanns[segment.hicann].position.x,
                y: this.wafer.hicanns[segment.hicann].position.y,
            };
            var widthFactor = this.zoomLevels.current.width;
            var xOffset = (segment.index < 128) ? 0 : (this.detailview.numBusesVertical + this.detailview.numNeurons + this.detailview.gap * 2) * this.detailview.unitDistance;
            var index = (segment.index < 128) ? segment.index : segment.index - 128;
            var x = hicannPosition.x + xOffset + index * this.detailview.unitDistance - (widthFactor - 1) / 2 * this.detailview.unitLength;
            var y = hicannPosition.y;
            var width = widthFactor * this.detailview.unitLength;
            var height = this.detailview.hicannHeight;
            return { x: x, y: y, width: width, height: height };
        };
        ;
        /**
         * Calculate rectangle that represents a horizontal route segment.
         */
        RoutesOnStage.prototype.calcSegmentHorizontal = function (segment) {
            var hicannPosition = {
                x: this.wafer.hicanns[segment.hicann].position.x,
                y: this.wafer.hicanns[segment.hicann].position.y,
            };
            var widthFactor = this.zoomLevels.current.width;
            var routeBlockHeight = (this.detailview.numBusesHorizontal - 1) * 2 * this.detailview.unitDistance + this.detailview.unitLength;
            var yOffset = (this.detailview.hicannHeight - routeBlockHeight) / 2;
            var x = hicannPosition.x;
            var y = hicannPosition.y + yOffset + segment.index * this.detailview.unitDistance - (widthFactor - 1) / 2 * this.detailview.unitLength;
            var width = this.detailview.hicannWidth;
            var height = widthFactor * this.detailview.unitLength;
            return { x: x, y: y, width: width, height: height };
        };
        ;
        /**
         * Removes the graphics objects for all routes (and selected routes) from the PixiJS containers.
         */
        RoutesOnStage.prototype.removeRoutesFromContainer = function () {
            // remove all routes (and switch circles) from pixiJS container
            var numRoutes = pixiBackend.container.routes.children.length;
            for (var i = 0; i < numRoutes; i++) {
                pixiBackend.removeChild(pixiBackend.container.routes, 0);
                pixiBackend.removeChild(pixiBackend.container.switches, 0);
            }
            ;
            // ... and from selected Route pixiJS container
            var numSelectedRoutes = pixiBackend.container.selectedRoutes.children.length;
            for (var i = 0; i < numSelectedRoutes; i++) {
                pixiBackend.removeChild(pixiBackend.container.selectedRoutes, 0);
                pixiBackend.removeChild(pixiBackend.container.selectedSwitches, 0);
            }
        };
        /**
         * Set a route in the visualization visible or hide it.
         * @param visible Set to true to make the route visible.
         */
        RoutesOnStage.prototype.setRoute = function (route, visible) {
            // set pixiJS route according to input
            pixiBackend.container.routes.children[route.ID].visible = visible;
            // set pixiJS switch circle according to input
            pixiBackend.container.switches.children[route.ID].visible = visible;
            // set pixiJS route and switches for selected Route according to input
            if (this.selectedRoutes.indexOf(route) !== -1) {
                pixiBackend.container.selectedRoutes.children[this.selectedRoutes.indexOf(route)].visible = visible;
                pixiBackend.container.selectedSwitches.children[this.selectedRoutes.indexOf(route)].visible = visible;
            }
            ;
            // update Route.visible property
            route.visible = visible;
        };
        ;
        /**
         * Set all routes in the visualization visible or hide them according to their "visible" property.
         */
        RoutesOnStage.prototype.setAllRoutes = function () {
            for (var _i = 0, _a = this.routes; _i < _a.length; _i++) {
                var route = _a[_i];
                // set pixiJS route according to the Route.visible property
                pixiBackend.container.routes.children[route.ID].visible = route.visible;
                // set pixiJS switch circles according to the Route.visible property
                pixiBackend.container.switches.children[route.ID].visible = route.visible;
                // set pixiJS route and switch for selected Route according to the Route.visible property
                var indexSelectedRoute = this.selectedRoutes.indexOf(route);
                if (indexSelectedRoute !== -1) {
                    pixiBackend.container.selectedRoutes.children[indexSelectedRoute].visible = route.visible;
                    pixiBackend.container.selectedSwitches.children[indexSelectedRoute].visible = route.visible;
                }
                ;
            }
        };
        ;
        /**
         * Calculate the current zoom-level (for route widths) from the current zoom-scale.
         * @param pixiScale zoom-scale of the "stage" PixiJS container.
         */
        RoutesOnStage.prototype.currentZoomLevel = function (pixiScale) {
            // determine the zoomlevel from current zoom
            if ((pixiScale / this.detailview.threshold) >= this.zoomLevels.level4.scale) {
                return this.zoomLevels.level4;
            }
            else if ((pixiScale / this.detailview.threshold) >= this.zoomLevels.level3.scale) {
                return this.zoomLevels.level3;
            }
            else if ((pixiScale / this.detailview.threshold) >= this.zoomLevels.level2.scale) {
                return this.zoomLevels.level2;
            }
            else if ((pixiScale / this.detailview.threshold) >= this.zoomLevels.level1.scale) {
                return this.zoomLevels.level1;
            }
            else {
                return this.zoomLevels.level0;
            }
            ;
        };
        ;
        /**
         * Adjust the widths of all routes if a new zoom-level is reached.
         * @param pixiScale Zoom-scale of the "stage" PixiJS container.
         */
        RoutesOnStage.prototype.adjustRouteWidth = function (pixiScale) {
            // check if width has to be adjusted
            if ((this.currentZoomLevel(pixiScale)).width !== this.zoomLevels.current.width) {
                // store new zoom level
                this.zoomLevels.current = this.currentZoomLevel(pixiScale);
                // remove old routes from pixiJS container
                this.removeRoutesFromContainer();
                // draw new Routes, but store only new positions
                this.redrawRoutes();
                // set pixiJS containers visible/non-visible like before
                this.setAllRoutes();
            }
        };
        ;
        /**
         * If all routes are visible (UI checkboxes checked), the Checkbox for all routes is set to checked as well.
         */
        RoutesOnStage.prototype.checkAllRoutes = function () {
            var allElementsSelected = true;
            // go through all routes and check if visible
            for (var _i = 0, _a = this.routes; _i < _a.length; _i++) {
                var route = _a[_i];
                if (!route.visible) {
                    allElementsSelected = false;
                    break;
                }
                ;
            }
            ;
            // set Routes checkbox
            if (allElementsSelected) {
                $("#routes_0_check").prop("checked", true);
            }
            else {
                $("#routes_0_check").prop("checked", false);
            }
            ;
        };
        ;
        /**
         * set the checkbox for a route.
         */
        RoutesOnStage.prototype.setCheckbox = function (route, checked) {
            // set checkbox of route
            $("#routes_0_" + route.ID).prop("checked", checked);
        };
        ;
        /**
         * Check if a route (or multiple routes) was clicked in the visualization
         */
        RoutesOnStage.prototype.handleVisuClick = function (mouseX, mouseY) {
            var selectedRoutes = [];
            // check what routes the mouse is over
            for (var _i = 0, _a = this.routes; _i < _a.length; _i++) {
                var route = _a[_i];
                if (this.mouseOverRoute(mouseX, mouseY, route)) {
                    selectedRoutes.push(route);
                }
            }
            if (selectedRoutes.length !== 0) {
                this.handleRouteClick(selectedRoutes);
            }
        };
        ;
        /**
         * Handle selected routes.
         * - update route info box
         * - highlight selected routes
         * @param routes
         */
        RoutesOnStage.prototype.handleRouteClick = function (routes) {
            // update selected routes array
            this.selectedRoutes = routes;
            // display route information in box
            this.routeInfo.displayRouteInfo(this.selectedRoutes);
            // grey out all routes excep the selected ones
            this.highlightRoutes(this.selectedRoutes);
            // remove all routes from pixiJS container
            this.removeRoutesFromContainer();
            // draw Routes, but store only new positions
            this.redrawRoutes();
            // set pixiJS containers visible/non-visible like before
            this.setAllRoutes();
            // render stage
            pixiBackend.renderer.render();
        };
        ;
        /**
         * Check if a route (or multiple routes) was doubleclicked in the visualization
         */
        RoutesOnStage.prototype.handleVisuDoubleClick = function (mouseX, mouseY) {
            var clickedRoute = undefined;
            // check if mouse is over route
            for (var _i = 0, _a = this.routes; _i < _a.length; _i++) {
                var route = _a[_i];
                if (this.mouseOverRoute(mouseX, mouseY, route)) {
                    clickedRoute = route;
                    break;
                }
            }
            if (clickedRoute !== undefined) {
                this.handleRouteDoubleClick();
            }
        };
        /**
         * Double clicking a route resets the routes.
         * - reset the route info box
         * - remove highlighting and draw all routes in color
         */
        RoutesOnStage.prototype.handleRouteDoubleClick = function () {
            // reset selected routes array
            this.selectedRoutes = [];
            // remove routes from pixiJS container
            this.removeRoutesFromContainer();
            // remove route info in box
            this.routeInfo.reset();
            // redraw all routes in their original color
            this.unhighlightRoutes();
            // draw new Routes, but store only new positions
            this.redrawRoutes();
            // set pixiJS containers visible/non-visible like before
            this.setAllRoutes();
            // render stage
            pixiBackend.renderer.render();
        };
        /**
         * check is within the boundaries of the segments of a route.
         */
        RoutesOnStage.prototype.mouseOverRoute = function (mouseX, mouseY, route) {
            // check if route is visible
            if (route.visible) {
                // check if mouse is over route
                for (var _i = 0, _a = this.positions[route.ID]; _i < _a.length; _i++) {
                    var segment = _a[_i];
                    if (pixiBackend.mouseInRectangle({ x: mouseX, y: mouseY }, segment.x, segment.y, segment.width, segment.height)) {
                        return true;
                    }
                }
            }
        };
        ;
        /**
         * Set the greyout property for non-selected routes.
         */
        RoutesOnStage.prototype.highlightRoutes = function (selectedRoutes) {
            // set greyedOut property
            for (var _i = 0, _a = this.routes; _i < _a.length; _i++) {
                var route = _a[_i];
                if (selectedRoutes.includes(route)) {
                    route.greyedOut = false;
                }
                else {
                    route.greyedOut = true;
                }
            }
        };
        /**
         * set the greyed out property to false for all routes.
         */
        RoutesOnStage.prototype.unhighlightRoutes = function () {
            // set greyedOut property
            for (var _i = 0, _a = this.routes; _i < _a.length; _i++) {
                var route = _a[_i];
                route.greyedOut = false;
            }
        };
        /**
         * handle the route-width slider in the UI route info box
         * - remove old routes
         * - draw routes in new width (store only positions)
         */
        RoutesOnStage.prototype.handleRouteWidthSlider = function (sliderValue) {
            // change the route widths for all zoom levels
            for (var zoomLevel in this.zoomLevels) {
                this.zoomLevels[zoomLevel].width = this.zoomLevels[zoomLevel].originalWidth * sliderValue / 4;
            }
            // remove old routes from pixiJS container
            this.removeRoutesFromContainer();
            // draw new Routes, but store only new positions
            this.redrawRoutes();
            // set pixiJS containers visible/non-visible like before
            this.setAllRoutes();
            // render stage
            pixiBackend.renderer.render();
        };
        return RoutesOnStage;
    }());
    internalModule.RoutesOnStage = RoutesOnStage;
})(internalModule || (internalModule = {}));
/// <reference path="overview.ts" />
/**
 * The namespace contains a number of classes that each have their separate purposes but have dependencies on each other.
 * They are written into separate files to keep a clear structure.
 */
var internalModule;
(function (internalModule) {
    /**
     * Calculate the coordinate of the top left HICANN of a reticle.
     */
    function topLeftHicannInReticle(reticleCoord) {
        return (reticleCoord + reticlesInFullRows(row(reticleCoord + 1) - 1)) * 4;
    }
    /**
     * Calculate the row of a reticle. (row is not the HICANN y coordinate!)
     */
    function row(reticleCoord) {
        var row = undefined;
        if (reticleCoord <= 3) {
            row = 1;
        }
        else if (reticleCoord <= 8) {
            row = 2;
        }
        else if (reticleCoord <= 15) {
            row = 3;
        }
        else if (reticleCoord <= 24) {
            row = 4;
        }
        else if (reticleCoord <= 33) {
            row = 5;
        }
        else if (reticleCoord <= 40) {
            row = 6;
        }
        else if (reticleCoord <= 45) {
            row = 7;
        }
        else if (reticleCoord <= 48) {
            row = 8;
        }
        else {
            throw (new Error("reticle coordinate out of range"));
        }
        ;
        return row;
    }
    /**
     * Calculate the number of reticles in all the rows up to the one passed as argument.
     */
    function reticlesInFullRows(row) {
        if (row <= 4) {
            return 2 * tools.kleinerGauss(row - 1) + 3 * row;
        }
        else if (row <= 8) {
            return 2 * (2 * tools.kleinerGauss(3) + 12) - (2 * tools.kleinerGauss(7 - row) + 3 * (8 - row));
        }
        else {
            throw (new Error("row out of range"));
        }
    }
    /**
     * Convert a reticle coordinate into the respective fpga coordinate.
     */
    function fpgaCoords(reticleCoord) {
        var fpgaCoords = [12, 13, 11, 16, 14, 15, 10, 9, 20, 17, 19, 7, 6, 8, 3, 22, 21, 23, 18, 5, 4,
            0, 2, 1, 25, 26, 24, 28, 43, 42, 47, 45, 46, 27, 29, 30, 41, 40, 38, 44, 31, 32, 39, 37, 36, 33, 34, 35];
        return fpgaCoords[reticleCoord];
    }
    /**
     * The reticle class stores information about the graphical representation of the reticle.
     */
    var Reticle = /** @class */ (function () {
        function Reticle(reticleCoord, fpgaCoord, x, y, width, height, color) {
            this.reticleCoord = reticleCoord;
            this.fpgaCoord = fpgaCoords(reticleCoord);
            this.position = {
                x: x,
                y: y,
                width: width,
                height: width,
            };
            this.color = color;
        }
        return Reticle;
    }());
    /**
     * ReticlesOnStage controls the visualization of the lookup plot including reticle and fpga coordinates.
     */
    var ReticlesOnStage = /** @class */ (function () {
        function ReticlesOnStage(overview, container) {
            this.overview = overview;
            this.wafer = overview.wafer;
            this.container = container;
            this.reticles = [];
            this.numReticles = 48;
            this.threshold = undefined;
            this.buildReticles();
            //this.enabled = this.container.visible;
            //console.log(this.enabled);
        }
        Object.defineProperty(ReticlesOnStage.prototype, "enabled", {
            /**
             * Set this property to make the graphics visible or hide them.
             */
            get: function () {
                return this.container.visible;
            },
            set: function (enabled) {
                this.container.visible = enabled;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Calculate the positions for all reticles on the wafer and instantiate new reticle classes
         */
        ReticlesOnStage.prototype.buildReticles = function () {
            for (var reticleCoord = 0; reticleCoord < this.numReticles; reticleCoord++) {
                // hicann in top left corner of reticle
                var hicannTopLeft = topLeftHicannInReticle(reticleCoord);
                // reticle position x
                var x = this.wafer.hicanns[hicannTopLeft].position.x - this.overview.margin / 2;
                // reticle position y
                var y = this.wafer.hicanns[hicannTopLeft].position.y - this.overview.margin / 2;
                // reticle width
                var width = 4 * (this.overview.hicannWidth + this.overview.margin);
                // reticle height
                var height = 2 * (this.overview.hicannHeight + this.overview.margin);
                // reticle color
                var color = "0xffffff";
                // store reticle
                this.reticles.push(new Reticle(reticleCoord, 3, x, y, width, height, color));
            }
        };
        /**
         * Draw reticle boundaries as well as reticle and fpga coordinates as text in the visualization
         */
        ReticlesOnStage.prototype.drawReticles = function () {
            // style for reticle and fpga coordinate
            var reticleStyle = {
                font: 'normal 100px Arial',
                fill: "0x177076"
            };
            var fpgaStyle = {
                font: 'normal 100px Arial',
                fill: "0xff581e"
            };
            // draw reticles
            for (var _i = 0, _a = this.reticles; _i < _a.length; _i++) {
                var reticle = _a[_i];
                // draw background rectangle
                pixiBackend.drawRectangle(this.container, reticle.position.x, reticle.position.y, reticle.position.width, reticle.position.height, reticle.color);
                // draw border
                pixiBackend.drawRectangleBorder(this.container, reticle.position.x, reticle.position.y, reticle.position.width, reticle.position.height, 10, "0x000000", 1.0);
                // draw reticle (=DNC) coordinate
                pixiBackend.drawTextInRectangle(this.container, reticle.position.x, reticle.position.y, reticle.position.width, reticle.position.height / 2, "F " + reticle.fpgaCoord.toString(), reticleStyle);
                // draw FPGA coordinate
                pixiBackend.drawTextInRectangle(this.container, reticle.position.x, reticle.position.y + reticle.position.height / 2, reticle.position.width, reticle.position.height / 2, "D " + reticle.reticleCoord.toString(), fpgaStyle);
            }
            // render stage
            pixiBackend.renderer.render();
        };
        /**
         * Pass "true" to make the reticles visible and "false" to hide them
         */
        ReticlesOnStage.prototype.setReticles = function (visible) {
            // set pixiJS container visibility
            this.enabled = visible;
            // set UI reticle checkbox
            this.setCheckbox(visible);
        };
        /**
         * Set the UI checkbox
         */
        ReticlesOnStage.prototype.setCheckbox = function (checked) {
            // set UI reticle checkbox
            $("#reticlesCheckbox").prop("checked", checked);
        };
        return ReticlesOnStage;
    }());
    internalModule.ReticlesOnStage = ReticlesOnStage;
})(internalModule || (internalModule = {}));
/*
    * --- remove development mode ----
    * main.ts: const devMode
    * main.ts: devMode area with quickStart function
    * main.ts: modified wafer.loadOverviewData() function calls
    * wafer.ts: loadOverviewData networkFilePath parameter should not be optional!
    * wafer.ts: don't check for networkFilePath, but do 'marocco = new Module.Marocco(networkFilePath);' right away
    */
/// <reference path="modules/jquery.d.ts" />
/// <reference path="modules/jqueryui.d.ts" />
/// <reference path="modules/filesystem.d.ts" />
/// <reference path="modules/stats.d.ts" />
/// <reference path="modules/pixi.d.ts" />
/// <reference path="modules/pixiBackend.ts" />
/// <reference path="modules/wafer.ts" />
/// <reference path="modules/detailview.ts" />
/// <reference path="modules/overview.ts" />
/// <reference path="modules/automode.ts" />
/// <reference path="modules/manualmode.ts" />
/// <reference path="modules/routes.ts" />
/// <reference path="modules/lookupPlot.ts" />
/**
 * development mode: set to true to skip file upload procedure
 */
var devMode = false;
var mouseIsDown = false;
var mousePosition = {
    x: undefined,
    y: undefined
};
var mouseDownPosition = {
    x: undefined,
    y: undefined
};
/**
 * Pixels between HICANNs in visualization
 */
var margin = 0;
/**
 * HICANN width in visualization
 */
var hicannWidth = 100;
/**
 * HICANN height in visualization
 */
var hicannHeight = 200;
/**
 * Height of triangle that represents HICANN inputs in visualization
 */
var triangleHeight = 40;
/**
 * Bus width in visualization
 */
var busWidth = 10;
/**
 * HICANN property gradient color
 */
var numNeuronsColorOne = "ffffff";
/**
 * HICANN property gradient color
 */
var numNeuronsColorTwo = "003366";
/**
 * HICANN property gradient color
 */
var numInputsColorOne = numNeuronsColorOne;
/**
 * HICANN property gradient color
 */
var numInputsColorTwo = "ff9900";
/**
 * HICANN property gradient color
 */
var numRoutesLeftColorOne = numNeuronsColorOne;
/**
 * HICANN property gradient color
 */
var numRoutesLeftColorTwo = "00cc00";
/**
 * HICANN property gradient color
 */
var numRoutesRightColorOne = numNeuronsColorOne;
/**
 * HICANN property gradient color
 */
var numRoutesRightColorTwo = "00cc00";
/**
 * HICANN property gradient color
 */
var numRoutesHorizontalColorOne = numNeuronsColorOne;
/**
 * HICANN property gradient color
 */
var numRoutesHorizontalColorTwo = "00cc00";
var domObjects = {};
var properties = [
    "neurons",
    "inputs",
    "leftBuses",
    "rightBuses",
    "horizontalBuses",
];
var wafer;
var overview;
var detailview;
var routesOnStage;
var reticlesOnStage;
var automode;
var manualmode;
var canvasWidth = function () {
    return ($(window).width());
};
var canvasHeight = function () {
    return ($(window).height());
};
var canvasCenter = function () {
    return ({
        x: $("#leftInfoBox").outerWidth(true) + (canvasWidth() - domObjects.rightInfoBox[0].offsetWidth - $("#leftInfoBox").outerWidth()) / 2,
        y: canvasHeight() / 2,
    });
};
// wait for DOM to load
$(document).ready(setupScreen);
/**
 * When the software is started, a setup screen allows to upload a network configuration xml file.
 * After loading the file into emscriptens virtual file system, "main" is started.
 */
function setupScreen() {
    // wait for emscripten to finish building
    Module.onRuntimeInitialized = function () {
        console.log("emscripten ready");
        //upload xml network file
        var inputFile = undefined;
        // upload via filebrowser
        var fileBrowser = document.querySelector("#networkFile");
        fileBrowser.addEventListener("change", function (event) {
            inputFile = fileBrowser.files[0];
            $("#fileLabel").html(inputFile.name);
            $("#fileLabel").css("color", "#99ff99");
        }, false);
        // upload via drag-n-drop
        var dropZone = document.querySelector("#dropZone");
        dropZone.addEventListener("drop", function (e) {
            var event = e || window.event; //Firefox
            event.preventDefault();
            if (event.dataTransfer.files.length > 1) {
                alert("Please select only one file!");
            }
            else {
                inputFile = event.dataTransfer.files[0];
                $("#fileLabel").html(inputFile.name);
                $("#fileLabel").css("color", "#99ff99");
            }
        });
        dropZone.addEventListener("dragover", function (e) {
            var event = e || window.event;
            event.preventDefault();
        });
        // visual effects
        dropZone.addEventListener("dragenter", function () { $("#dropZone").css("border", "2px solid #65c4fa"); });
        dropZone.addEventListener("dragleave", function () { $("#dropZone").css("border", "none"); });
        dropZone.addEventListener("drop", function () { $("#dropZone").css("border", "none"); });
        // handle upload Button
        var uploadButton = document.querySelector("#upload");
        uploadButton.addEventListener("click", function () {
            if (inputFile === undefined) {
                alert("no file selected");
            }
            else {
                var filereader = new FileReader();
                // event handler for data loaded with filereader
                filereader.onload = function (event) {
                    var target = event.target;
                    var contents = target.result;
                    // write file into emscriptens virtual file system (FS)
                    FS.writeFile("./network.xml", contents);
                    // remove upload screen and display loading screen
                    $("#uploadScreen").css("display", "none");
                    $("#loadingScreen").css("display", "block");
                    // start main program
                    setTimeout(main, 100);
                };
                filereader.onerror = function (event) {
                    console.error("File could not be read! Code $event.target.error.code");
                };
                // read the contents of inputFile and fire onload event
                filereader.readAsText(inputFile);
            }
        });
        // ----- devMode -----
        // skip file upload
        if (devMode) {
            quickStart();
        }
        function quickStart() {
            // remove upload screen and display loading screen
            $("#uploadScreen").css("display", "none");
            $("#loadingScreen").css("display", "block");
            // start main program
            setTimeout(main, 100);
        }
        // ----- devMode -----
    }; //module.onRuntimeInitialized
} //setupScreen
/**
 * The main function runs the core visualization program.
 * Instances of all the classes needed for the visualization are created and event handlers defined.
 */
function main() {
    ///////////////////////////
    // FPS, RAM Stats
    var stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    stats.dom.style.position = "relative";
    stats.dom.style.marginLeft = "20px";
    document.querySelector("#visuWindow").appendChild(stats.dom);
    function animate() {
        stats.begin();
        stats.end();
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
    ///////////////////////////
    console.log("WebGL is" + (!PIXI.utils.isWebGLSupported ? " not" : "") + " supported by this browser.");
    //////////////////////////////////
    // store common DOM elements
    // deprecated???
    referenceDOM();
    // setup pixiBackend
    pixiBackend.renderer.setup($("body"), canvasWidth(), canvasHeight());
    pixiBackend.container.setup();
    wafer = new internalModule.Wafer();
    // ----- devMode -----
    devMode ? wafer.loadOverviewData() : wafer.loadOverviewData("/network.xml");
    // ----- devMode -----
    // Adjust color gradients when a HICANN property is zero for every HICANN.
    setHicannPropertyGradients();
    overview = new internalModule.Overview(wafer, {
        hicannWidth: hicannWidth,
        hicannHeight: hicannHeight,
        margin: margin,
        triangleHeight: triangleHeight,
        busWidth: busWidth
    }, {
        numNeuronsColorOne: numNeuronsColorOne,
        numNeuronsColorTwo: numNeuronsColorTwo,
        numInputsColorOne: numInputsColorOne,
        numInputsColorTwo: numInputsColorTwo,
        numRoutesLeftColorOne: numRoutesLeftColorOne,
        numRoutesLeftColorTwo: numRoutesLeftColorTwo,
        numRoutesRightColorOne: numRoutesRightColorOne,
        numRoutesRightColorTwo: numRoutesRightColorTwo,
        numRoutesHorizontalColorOne: numRoutesHorizontalColorOne,
        numRoutesHorizontalColorTwo: numRoutesHorizontalColorTwo
    });
    // draw overview of wafer
    overview.drawWafer();
    // draw images of hicanns on wafer
    overview.waferImage.draw();
    // adjust stage position and scale to show full wafer centered in screen
    centerWafer();
    detailview = new internalModule.Detailview(wafer, hicannWidth, hicannHeight, margin);
    // preparation for manual mode: draw and hide sprite representation of buses
    detailview.drawAllBusesSprite();
    // determine zoom level thresholds
    detailview.determineThreshold(canvasHeight());
    routesOnStage = new internalModule.RoutesOnStage(detailview);
    // determine and set route-width
    (function () {
        var transform = pixiBackend.container.stage.transform;
        routesOnStage.zoomLevels.current = routesOnStage.currentZoomLevel(transform.scale.x);
    })();
    // draw routes
    routesOnStage.drawRoutes();
    // hide routes
    for (var _i = 0, _a = routesOnStage.routes; _i < _a.length; _i++) {
        var route = _a[_i];
        routesOnStage.setRoute(route, false);
    }
    reticlesOnStage = new internalModule.ReticlesOnStage(overview, pixiBackend.container.reticles);
    // threshold where the lookup plot is made visible
    reticlesOnStage.threshold = fullWaferScale() * 2 / 3;
    // draw reticles
    reticlesOnStage.drawReticles();
    // hide reticles
    reticlesOnStage.setReticles(false);
    automode = new internalModule.Automode(overview, detailview);
    manualmode = new internalModule.Manualmode(overview, detailview);
    // start off with automatic zoom mode
    automode.init(undefined, false, false);
    // setup UI using JQueryUI
    setupJQueryUI();
    // UI property gradients in right info panel
    setupPropertyGradients();
    // display properties for HICANN 0 in right info panel
    displayProperties(0);
    // build UI hicann list in left info panel
    buildElementsTree();
    // build UI routes list in left info panel
    buildRoutesTree();
    //////////////////////////////////
    // Event Listeners
    $(window).keydown(function (e) {
        var event = e || window.event;
        handleKeyDown(event);
    });
    $("#visuWindow").mousedown(function (e) {
        var event = e || window.event;
        handleMouseDown(event);
    });
    $("#visuWindow").mouseup(function (e) {
        var event = e || window.event;
        handleMouseUp(event);
    });
    $("#visuWindow").mousemove(function (e) {
        var event = e || window.event;
        handleMouseMove(event);
    });
    $("#visuWindow").mouseout(function (e) {
        var event = e || window.event;
        mouseIsDown = false;
    });
    $("#visuWindow").dblclick(function (e) {
        var event = e || window.event;
        routesOnStage.handleVisuDoubleClick(event.clientX, event.clientY);
    });
    window.addEventListener("wheel", function (e) {
        var event = e || window.event;
        handleWheel(event);
    });
    $("#numberTextCheckbox").change(function (e) {
        var event = e || window.event;
        if (event.target.checked) {
            overview.hicannNumber.alwaysHidden = false;
            overview.hicannNumber.setVisible(true);
        }
        else {
            overview.hicannNumber.setVisible(false);
            overview.hicannNumber.alwaysHidden = true;
        }
        ;
        pixiBackend.renderer.render();
    });
    $("#waferImageCheckbox").change(function (e) {
        var event = e || window.event;
        if (event.target.checked) {
            overview.waferImage.setVisible(true);
        }
        else {
            overview.waferImage.setVisible(false);
        }
        ;
        pixiBackend.renderer.render();
    });
    $("#reticlesCheckbox").change(function (e) {
        var event = e || window.event;
        if (event.target.checked) {
            reticlesOnStage.setReticles(true);
        }
        else {
            reticlesOnStage.setReticles(false);
        }
        ;
        pixiBackend.renderer.render();
    });
    $("#numNeuronsCheckbox").change(function (e) {
        var event = e || window.event;
        if (event.target.checked) {
            manualmode.setAllCheckboxes("numNeurons", true);
            for (var index = 0; index <= wafer.enumMax; index++) {
                pixiBackend.container.backgrounds.children[index].visible = true;
            }
            ;
            pixiBackend.renderer.render();
        }
        else {
            manualmode.setAllCheckboxes("numNeurons", false);
            for (var index = 0; index <= wafer.enumMax; index++) {
                pixiBackend.container.backgrounds.children[index].visible = false;
            }
            ;
            pixiBackend.renderer.render();
        }
        ;
    });
    $("#numInputsCheckbox").change(function (e) {
        var event = e || window.event;
        if (event.target.checked) {
            for (var index = 0; index <= wafer.enumMax; index++) {
                manualmode.setAllCheckboxes("numInputs", true);
                pixiBackend.container.inputs.children[index].visible = true;
            }
            ;
            pixiBackend.renderer.render();
        }
        else {
            for (var index = 0; index <= wafer.enumMax; index++) {
                manualmode.setAllCheckboxes("numInputs", false);
                pixiBackend.container.inputs.children[index].visible = false;
            }
            ;
            pixiBackend.renderer.render();
        }
        ;
    });
    $("#verticalLeftCheckbox").change(function (e) {
        var event = e || window.event;
        if (event.target.checked) {
            for (var index = 0; index <= wafer.enumMax; index++) {
                manualmode.setAllCheckboxes("left", true);
                pixiBackend.container.overviewBusesLeft.children[index].visible = true;
            }
            ;
            pixiBackend.renderer.render();
        }
        else {
            for (var index = 0; index <= wafer.enumMax; index++) {
                manualmode.setAllCheckboxes("left", false);
                pixiBackend.container.overviewBusesLeft.children[index].visible = false;
            }
            ;
            pixiBackend.renderer.render();
        }
        ;
    });
    $("#verticalRightCheckbox").change(function (e) {
        var event = e || window.event;
        if (event.target.checked) {
            for (var index = 0; index <= wafer.enumMax; index++) {
                manualmode.setAllCheckboxes("right", true);
                pixiBackend.container.overviewBusesRight.children[index].visible = true;
            }
            ;
            pixiBackend.renderer.render();
        }
        else {
            for (var index = 0; index <= wafer.enumMax; index++) {
                manualmode.setAllCheckboxes("right", false);
                pixiBackend.container.overviewBusesRight.children[index].visible = false;
            }
            ;
            pixiBackend.renderer.render();
        }
        ;
    });
    $("#horizontalCheckbox").change(function (e) {
        var event = e || window.event;
        if (event.target.checked) {
            for (var index = 0; index <= wafer.enumMax; index++) {
                manualmode.setAllCheckboxes("horizontal", true);
                pixiBackend.container.overviewBusesHorizontal.children[index].visible = true;
            }
            ;
            pixiBackend.renderer.render();
        }
        else {
            for (var index = 0; index <= wafer.enumMax; index++) {
                manualmode.setAllCheckboxes("horizontal", false);
                pixiBackend.container.overviewBusesHorizontal.children[index].visible = false;
            }
            ;
            pixiBackend.renderer.render();
        }
        ;
    });
    $("#verticalLeftDetailsCheckbox").change(function (e) {
        var event = e || window.event;
        if (event.target.checked) {
            for (var index = 0; index <= wafer.enumMax; index++) {
                manualmode.setAllCheckboxes("detailLeft", true);
                pixiBackend.container.busesLeftSprite.children[index].visible = true;
            }
            ;
            pixiBackend.renderer.render();
        }
        else {
            for (var index = 0; index <= wafer.enumMax; index++) {
                manualmode.setAllCheckboxes("detailLeft", false);
                pixiBackend.container.busesLeftSprite.children[index].visible = false;
            }
            ;
            pixiBackend.renderer.render();
        }
        ;
    });
    $("#verticalRightDetailsCheckbox").change(function (e) {
        var event = e || window.event;
        if (event.target.checked) {
            for (var index = 0; index <= wafer.enumMax; index++) {
                manualmode.setAllCheckboxes("detailRight", true);
                pixiBackend.container.busesRightSprite.children[index].visible = true;
            }
            ;
            pixiBackend.renderer.render();
        }
        else {
            for (var index = 0; index <= wafer.enumMax; index++) {
                manualmode.setAllCheckboxes("detailRight", false);
                pixiBackend.container.busesRightSprite.children[index].visible = false;
            }
            ;
            pixiBackend.renderer.render();
        }
        ;
    });
    $("#horizontalDetailsCheckbox").change(function (e) {
        var event = e || window.event;
        if (event.target.checked) {
            for (var index = 0; index <= wafer.enumMax; index++) {
                manualmode.setAllCheckboxes("detailHorizontal", true);
                pixiBackend.container.busesHorizontalSprite.children[index].visible = true;
            }
            ;
            pixiBackend.renderer.render();
        }
        else {
            for (var index = 0; index <= wafer.enumMax; index++) {
                manualmode.setAllCheckboxes("detailHorizontal", false);
                pixiBackend.container.busesHorizontalSprite.children[index].visible = false;
            }
            ;
            pixiBackend.renderer.render();
        }
        ;
    });
    $("#autoSynapsesCheckbox").change(function () {
        var checked = document.querySelector("#autoSynapsesCheckbox").checked;
        if (checked) {
            automode.options.synapses = true;
        }
        else {
            automode.options.synapses = false;
        }
        ;
    });
    $("#autoLeftCheckbox").change(function () {
        var checked = document.querySelector("#autoLeftCheckbox").checked;
        if (checked) {
            automode.options.leftBuses = true;
        }
        else {
            automode.options.leftBuses = false;
        }
        ;
    });
    $("#autoRightCheckbox").change(function () {
        var checked = document.querySelector("#autoRightCheckbox").checked;
        if (checked) {
            automode.options.rightBuses = true;
        }
        else {
            automode.options.rightBuses = false;
        }
        ;
    });
    $("#autoHorizontalCheckbox").change(function () {
        var checked = document.querySelector("#autoHorizontalCheckbox").checked;
        if (checked) {
            automode.options.horizontalBuses = true;
        }
        else {
            automode.options.horizontalBuses = false;
        }
        ;
    });
    $("#automode").click(function () {
        if (!automode.enabled) {
            // store detail Level
            var levelOneEnabled = detailview.enabled;
            var levelTwoEnabled = detailview.levelTwoEnabled;
            // determine closest hicann for auto detail view
            var hicannClosestToCenter = detailview.hicannClosestToCenter(canvasCenter());
            // reset view
            manualmode.resetView();
            // start auto Mode
            automode.init(hicannClosestToCenter, levelOneEnabled, levelTwoEnabled);
            manualmode.enabled = false;
        }
    });
    $("#manualmode").click(function () {
        if (!manualmode.enabled) {
            // store detail Level
            var levelOneEnabled = detailview.enabled;
            var levelTwoEnabled = detailview.levelTwoEnabled;
            // reset view
            if (levelOneEnabled) {
                automode.startOverview(detailview.currentHicann);
            }
            // start manual Mode
            manualmode.init(levelOneEnabled, levelTwoEnabled);
            automode.enabled = false;
        }
    });
    // Resize Canvas, when window is rescaled;
    $(window).resize(function () {
        pixiBackend.renderer.renderer.resize(canvasWidth(), canvasHeight());
        detailview.determineThreshold(canvasHeight());
        setupJQueryUI();
        pixiBackend.renderer.render();
    });
} //main
/**
 * Center the wafer in middle of the canvas and adjust the zoom-scale, so the full wafer is visible.
 */
function centerWafer() {
    var scale = fullWaferScale();
    var transform = pixiBackend.container.stage.transform;
    transform.scale.x = scale;
    transform.scale.y = scale;
    var hicannNumber = 173;
    var stagePosition = transform.position;
    var hicannPosition = wafer.hicanns[hicannNumber].position;
    var newPosition = {
        x: -(hicannPosition.x + hicannWidth / 2) * transform.scale.x + canvasCenter().x,
        y: -(hicannPosition.y + hicannHeight / 2) * transform.scale.y + canvasCenter().y,
    };
    stagePosition.x = newPosition.x;
    stagePosition.y = newPosition.y;
    pixiBackend.renderer.render();
}
/**
 * Calculate the scale, where the full wafer fits onto the canvas.
 */
function fullWaferScale() {
    var waferWidth = 36 * (hicannWidth + margin) * 1.3;
    var waferHeight = 16 * (hicannHeight + margin) * 1.3;
    return (canvasWidth() / waferWidth < canvasHeight() / waferHeight) ? canvasWidth() / waferWidth : canvasHeight() / waferHeight;
}
/**
 * If a property is zero for every HICANN, the color gradient has to be adjusted.
 */
function setHicannPropertyGradients() {
    if (wafer.hicanns === []) {
        throw (new Error("HICANN data has to be loaded into wafer class before gradients can be set."));
    }
    if (wafer.numNeuronsMax === 0) {
        numNeuronsColorTwo = numNeuronsColorOne;
    }
    ;
    if (wafer.numInputsMax === 0) {
        numInputsColorTwo = numInputsColorOne;
    }
    ;
    if (wafer.numBusesLeftMax === 0) {
        numRoutesLeftColorTwo = numRoutesLeftColorOne;
    }
    ;
    if (wafer.numBusesRightMax === 0) {
        numRoutesRightColorTwo = numRoutesRightColorOne;
    }
    ;
    if (wafer.numBusesHorizontalMax === 0) {
        numRoutesHorizontalColorTwo = numRoutesHorizontalColorOne;
    }
    ;
}
/**
 * Build the HTML for the HICANN "tree-style" list in the left info-box
 */
function buildElementsTree() {
    /* TODO:
    * - use jQuery
    * - create smaller functions similar to buildRoutesTree()
    * - think about moving the functions to manualmode or to overview/Detailview??
    * - do I really need the manualmode.selectedItems object?
    */
    // surrounding div
    var tree = domObjects.elementsTree[0];
    // unordered list
    var list = document.createElement("ul");
    tree.appendChild(list);
    // wafer
    // surrounding list item wafer
    var listItem = document.createElement("li");
    list.appendChild(listItem);
    // wafer checkbox
    var waferInput = document.createElement("input");
    waferInput.type = "checkbox";
    waferInput.checked = true;
    waferInput.classList.add("fork");
    waferInput.id = "element_0";
    listItem.appendChild(waferInput);
    // wafer checkbox label
    var waferInputLabel = document.createElement("label");
    waferInputLabel.htmlFor = "element_0";
    waferInputLabel.classList.add("checkboxLabel");
    listItem.appendChild(waferInputLabel);
    // wafer label
    var waferLabel = document.createElement("label");
    waferLabel.innerHTML = "Wafer";
    listItem.appendChild(waferLabel);
    // hicann list
    // hicann surrounding unordered list
    var hicannList = document.createElement("ul");
    listItem.appendChild(hicannList);
    var _loop_1 = function (i) {
        var listItem_1 = document.createElement("li");
        hicannList.appendChild(listItem_1);
        var hicannInput = document.createElement("input");
        hicannInput.type = "checkbox";
        hicannInput.checked = true;
        hicannInput.classList.add("fork");
        hicannInput.id = "element_0_" + i;
        listItem_1.appendChild(hicannInput);
        var hicannInputLabel = document.createElement("label");
        hicannInputLabel.htmlFor = "element_0_" + i;
        hicannInputLabel.classList.add("checkboxLabel");
        listItem_1.appendChild(hicannInputLabel);
        var hicann = document.createElement("button");
        hicann.innerText = "HICANN " + i;
        hicann.addEventListener("click", function () { handleListClickHicann(event); });
        listItem_1.appendChild(hicann);
        var elementsList = document.createElement("ul");
        listItem_1.appendChild(elementsList);
        // Buses
        var overviewListItem = document.createElement("li");
        elementsList.appendChild(overviewListItem);
        var overviewInput = document.createElement("input");
        overviewInput.type = "checkbox";
        overviewInput.checked = true;
        overviewInput.classList.add("fork");
        overviewInput.id = "element_0_" + i + "_0";
        overviewListItem.appendChild(overviewInput);
        // buses checkbox label
        var overviewInputLabel = document.createElement("label");
        overviewInputLabel.htmlFor = "element_0_" + i + "_0";
        overviewInputLabel.classList.add("checkboxLabel");
        overviewListItem.appendChild(overviewInputLabel);
        // detailed Buses checkbox
        var overviewCheckbox = document.createElement("input");
        overviewCheckbox.type = "checkbox";
        overviewCheckbox.checked = true;
        overviewCheckbox.addEventListener("change", function (e) {
            var event = e || window.event;
            var target = event.target;
            var hicannIndex = i;
            if (target.checked) {
                // number of neurons
                manualmode.selectedElements.overview.numNeurons[hicannIndex] = true;
                pixiBackend.container.backgrounds.children[hicannIndex].visible = true;
                $("#element_0_" + i + "_0_0").prop("checked", true);
                // number of inputs
                manualmode.selectedElements.overview.numInputs[hicannIndex] = true;
                pixiBackend.container.inputs.children[hicannIndex].visible = true;
                $("#element_0_" + i + "_0_1").prop("checked", true);
                // left buses
                manualmode.selectedElements.overview.left[hicannIndex] = true;
                pixiBackend.container.overviewBusesLeft.children[hicannIndex].visible = true;
                $("#element_0_" + i + "_0_2").prop("checked", true);
                // right buses
                manualmode.selectedElements.overview.right[hicannIndex] = true;
                pixiBackend.container.overviewBusesRight.children[hicannIndex].visible = true;
                $("#element_0_" + i + "_0_3").prop("checked", true);
                // horizontal buses
                manualmode.selectedElements.overview.horizontal[hicannIndex] = true;
                pixiBackend.container.overviewBusesHorizontal.children[hicannIndex].visible = true;
                $("#element_0_" + i + "_0_4").prop("checked", true);
            }
            else {
                // number of neurons
                manualmode.selectedElements.overview.numNeurons[hicannIndex] = false;
                pixiBackend.container.backgrounds.children[hicannIndex].visible = false;
                $("#element_0_" + i + "_0_0").prop("checked", false);
                // number of inputs
                manualmode.selectedElements.overview.numInputs[hicannIndex] = false;
                pixiBackend.container.inputs.children[hicannIndex].visible = false;
                $("#element_0_" + i + "_0_1").prop("checked", false);
                // left buses
                manualmode.selectedElements.overview.left[hicannIndex] = false;
                pixiBackend.container.overviewBusesLeft.children[hicannIndex].visible = false;
                $("#element_0_" + i + "_0_2").prop("checked", false);
                // right buses
                manualmode.selectedElements.overview.right[hicannIndex] = false;
                pixiBackend.container.overviewBusesRight.children[hicannIndex].visible = false;
                $("#element_0_" + i + "_0_3").prop("checked", false);
                // horizontal buses
                manualmode.selectedElements.overview.horizontal[hicannIndex] = false;
                pixiBackend.container.overviewBusesHorizontal.children[hicannIndex].visible = false;
                $("#element_0_" + i + "_0_4").prop("checked", false);
            }
            pixiBackend.renderer.render();
            manualmode.checkAllCheckboxes("numNeurons");
            manualmode.checkAllCheckboxes("numInputs");
            manualmode.checkAllCheckboxes("left");
            manualmode.checkAllCheckboxes("right");
            manualmode.checkAllCheckboxes("horizontal");
        });
        overviewCheckbox.classList.add("hicannElementCheckbox");
        overviewCheckbox.id = "element_0_" + i + "_0_checkbox";
        overviewListItem.appendChild(overviewCheckbox);
        // buses label
        var overviewLabel = document.createElement("label");
        overviewLabel.innerHTML = "Overview";
        overviewListItem.appendChild(overviewLabel);
        var overviewList = document.createElement("ul");
        overviewListItem.appendChild(overviewList);
        // number of neurons
        var numNeuronsListItem = document.createElement("li");
        overviewList.appendChild(numNeuronsListItem);
        var numNeuronsCheckbox = document.createElement("input");
        numNeuronsCheckbox.type = "checkbox";
        numNeuronsCheckbox.checked = true;
        numNeuronsCheckbox.classList.add("hicannElementCheckbox");
        numNeuronsCheckbox.id = "element_0_" + i + "_0_0";
        numNeuronsCheckbox.addEventListener("change", function (e) {
            var event = e || window.event;
            var target = event.target;
            var hicannIndex = i;
            if (target.checked) {
                manualmode.selectedElements.overview.numNeurons[hicannIndex] = true;
                pixiBackend.container.backgrounds.children[hicannIndex].visible = true;
                pixiBackend.renderer.render();
            }
            else {
                manualmode.selectedElements.overview.numNeurons[hicannIndex] = false;
                pixiBackend.container.backgrounds.children[hicannIndex].visible = false;
                pixiBackend.renderer.render();
            }
            manualmode.checkAllCheckboxes("numNeurons");
            var allPropertiesSelected;
            if ((manualmode.selectedElements.overview.numNeurons[i] === true)
                && (manualmode.selectedElements.overview.numInputs[i] === true)
                && (manualmode.selectedElements.overview.left[i] === true)
                && (manualmode.selectedElements.overview.right[i] === true)
                && (manualmode.selectedElements.overview.horizontal[i] === true)) {
                allPropertiesSelected = true;
            }
            else {
                allPropertiesSelected = false;
            }
            if (allPropertiesSelected) {
                $("#element_0_" + i + "_0_checkbox").prop("checked", true);
            }
            else {
                $("#element_0_" + i + "_0_checkbox").prop("checked", false);
            }
        });
        numNeuronsListItem.appendChild(numNeuronsCheckbox);
        var numNeuronsLabel = document.createElement("label");
        numNeuronsLabel.innerHTML = "number of Neurons";
        numNeuronsListItem.appendChild(numNeuronsLabel);
        // number of inputs
        var numInputsListItem = document.createElement("li");
        overviewList.appendChild(numInputsListItem);
        var numInputsCheckbox = document.createElement("input");
        numInputsCheckbox.type = "checkbox";
        numInputsCheckbox.checked = true;
        numInputsCheckbox.classList.add("hicannElementCheckbox");
        numInputsCheckbox.id = "element_0_" + i + "_0_1";
        numInputsCheckbox.addEventListener("change", function (e) {
            var event = e || window.event;
            var target = event.target;
            var hicannIndex = i;
            if (target.checked) {
                manualmode.selectedElements.overview.numInputs[hicannIndex] = true;
                pixiBackend.container.inputs.children[hicannIndex].visible = true;
                pixiBackend.renderer.render();
            }
            else {
                manualmode.selectedElements.overview.numInputs[hicannIndex] = false;
                pixiBackend.container.inputs.children[hicannIndex].visible = false;
                pixiBackend.renderer.render();
            }
            manualmode.checkAllCheckboxes("numInputs");
            var allPropertiesSelected;
            if ((manualmode.selectedElements.overview.numNeurons[i] === true)
                && (manualmode.selectedElements.overview.numInputs[i] === true)
                && (manualmode.selectedElements.overview.left[i] === true)
                && (manualmode.selectedElements.overview.right[i] === true)
                && (manualmode.selectedElements.overview.horizontal[i] === true)) {
                allPropertiesSelected = true;
            }
            else {
                allPropertiesSelected = false;
            }
            if (allPropertiesSelected) {
                $("#element_0_" + i + "_0_checkbox").prop("checked", true);
            }
            else {
                $("#element_0_" + i + "_0_checkbox").prop("checked", false);
            }
        });
        numInputsListItem.appendChild(numInputsCheckbox);
        var numInputsLabel = document.createElement("label");
        numInputsLabel.innerHTML = "number of Inputs";
        numInputsListItem.appendChild(numInputsLabel);
        // Buses left
        var busesLeftListItem = document.createElement("li");
        overviewList.appendChild(busesLeftListItem);
        var busesLeftCheckbox = document.createElement("input");
        busesLeftCheckbox.type = "checkbox";
        busesLeftCheckbox.checked = true;
        busesLeftCheckbox.addEventListener("change", function (e) {
            var event = e || window.event;
            var target = event.target;
            var hicannIndex = i;
            if (target.checked) {
                manualmode.selectedElements.overview.left[hicannIndex] = true;
                pixiBackend.container.overviewBusesLeft.children[hicannIndex].visible = true;
                pixiBackend.renderer.render();
            }
            else {
                manualmode.selectedElements.overview.left[hicannIndex] = false;
                pixiBackend.container.overviewBusesLeft.children[hicannIndex].visible = false;
                pixiBackend.renderer.render();
            }
            manualmode.checkAllCheckboxes("left");
            var allPropertiesSelected;
            if ((manualmode.selectedElements.overview.numNeurons[i] === true)
                && (manualmode.selectedElements.overview.numInputs[i] === true)
                && (manualmode.selectedElements.overview.left[i] === true)
                && (manualmode.selectedElements.overview.right[i] === true)
                && (manualmode.selectedElements.overview.horizontal[i] === true)) {
                allPropertiesSelected = true;
            }
            else {
                allPropertiesSelected = false;
            }
            if (allPropertiesSelected) {
                $("#element_0_" + i + "_0_checkbox").prop("checked", true);
            }
            else {
                $("#element_0_" + i + "_0_checkbox").prop("checked", false);
            }
        });
        busesLeftCheckbox.classList.add("hicannElementCheckbox");
        busesLeftCheckbox.id = "element_0_" + i + "_0_2";
        busesLeftListItem.appendChild(busesLeftCheckbox);
        var busesLeftLabel = document.createElement("label");
        busesLeftLabel.innerHTML = "vertical left";
        busesLeftListItem.appendChild(busesLeftLabel);
        // Buses right
        var busesRightListItem = document.createElement("li");
        overviewList.appendChild(busesRightListItem);
        var busesRightCheckbox = document.createElement("input");
        busesRightCheckbox.type = "checkbox";
        busesRightCheckbox.checked = true;
        busesRightCheckbox.addEventListener("change", function (e) {
            var event = e || window.event;
            var target = event.target;
            var hicannIndex = i;
            if (target.checked) {
                manualmode.selectedElements.overview.right[hicannIndex] = true;
                pixiBackend.container.overviewBusesRight.children[hicannIndex].visible = true;
                pixiBackend.renderer.render();
            }
            else {
                manualmode.selectedElements.overview.right[hicannIndex] = false;
                pixiBackend.container.overviewBusesRight.children[hicannIndex].visible = false;
                pixiBackend.renderer.render();
            }
            manualmode.checkAllCheckboxes("right");
            var allPropertiesSelected;
            if ((manualmode.selectedElements.overview.numNeurons[i] === true)
                && (manualmode.selectedElements.overview.numInputs[i] === true)
                && (manualmode.selectedElements.overview.left[i] === true)
                && (manualmode.selectedElements.overview.right[i] === true)
                && (manualmode.selectedElements.overview.horizontal[i] === true)) {
                allPropertiesSelected = true;
            }
            else {
                allPropertiesSelected = false;
            }
            if (allPropertiesSelected) {
                $("#element_0_" + i + "_0_checkbox").prop("checked", true);
            }
            else {
                $("#element_0_" + i + "_0_checkbox").prop("checked", false);
            }
        });
        busesRightCheckbox.classList.add("hicannElementCheckbox");
        busesRightCheckbox.id = "element_0_" + i + "_0_3";
        busesRightListItem.appendChild(busesRightCheckbox);
        var busesRightLabel = document.createElement("label");
        busesRightLabel.innerHTML = "vertical right";
        busesRightListItem.appendChild(busesRightLabel);
        // Buses horizontal
        var busesHorizontalListItem = document.createElement("li");
        overviewList.appendChild(busesHorizontalListItem);
        var busesHorizontalCheckbox = document.createElement("input");
        busesHorizontalCheckbox.type = "checkbox";
        busesHorizontalCheckbox.checked = true;
        busesHorizontalCheckbox.addEventListener("change", function (e) {
            var event = e || window.event;
            var target = event.target;
            var hicannIndex = i;
            if (target.checked) {
                manualmode.selectedElements.overview.horizontal[hicannIndex] = true;
                pixiBackend.container.overviewBusesHorizontal.children[hicannIndex].visible = true;
                pixiBackend.renderer.render();
            }
            else {
                manualmode.selectedElements.overview.horizontal[hicannIndex] = false;
                pixiBackend.container.overviewBusesHorizontal.children[hicannIndex].visible = false;
                pixiBackend.renderer.render();
            }
            manualmode.checkAllCheckboxes("horizontal");
            var allPropertiesSelected;
            if ((manualmode.selectedElements.overview.numNeurons[i] === true)
                && (manualmode.selectedElements.overview.numInputs[i] === true)
                && (manualmode.selectedElements.overview.left[i] === true)
                && (manualmode.selectedElements.overview.right[i] === true)
                && (manualmode.selectedElements.overview.horizontal[i] === true)) {
                allPropertiesSelected = true;
            }
            else {
                allPropertiesSelected = false;
            }
            if (allPropertiesSelected) {
                $("#element_0_" + i + "_0_checkbox").prop("checked", true);
            }
            else {
                $("#element_0_" + i + "_0_checkbox").prop("checked", false);
            }
        });
        busesHorizontalCheckbox.classList.add("hicannElementCheckbox");
        busesHorizontalCheckbox.id = "element_0_" + i + "_0_4";
        busesHorizontalListItem.appendChild(busesHorizontalCheckbox);
        var busesHorizontalLabel = document.createElement("label");
        busesHorizontalLabel.innerHTML = "horizontal";
        busesHorizontalListItem.appendChild(busesHorizontalLabel);
        // detailed Buses
        var detailviewListItem = document.createElement("li");
        elementsList.appendChild(detailviewListItem);
        var detailviewInput = document.createElement("input");
        detailviewInput.type = "checkbox";
        detailviewInput.checked = true;
        detailviewInput.classList.add("fork");
        detailviewInput.id = "element0_" + i + "_1";
        detailviewListItem.appendChild(detailviewInput);
        // detailed Buses checkbox label
        var detailviewInputLabel = document.createElement("label");
        detailviewInputLabel.htmlFor = "element0_" + i + "_1";
        detailviewInputLabel.classList.add("checkboxLabel");
        detailviewListItem.appendChild(detailviewInputLabel);
        // detailed Buses checkbox
        var detailviewCheckbox = document.createElement("input");
        detailviewCheckbox.type = "checkbox";
        detailviewCheckbox.checked = false;
        detailviewCheckbox.addEventListener("change", function (e) {
            var event = e || window.event;
            var target = event.target;
            var hicannIndex = i;
            manualmode.busesLeft(hicannIndex, target.checked);
            manualmode.busesRight(hicannIndex, target.checked);
            manualmode.busesHorizontal(hicannIndex, target.checked);
            pixiBackend.renderer.render();
            $("#element_0_" + i + "_1_0").prop("checked", target.checked);
            $("#element_0_" + i + "_1_1").prop("checked", target.checked);
            $("#element_0_" + i + "_1_2").prop("checked", target.checked);
            manualmode.checkAllCheckboxes("detailLeft");
            manualmode.checkAllCheckboxes("detailRight");
            manualmode.checkAllCheckboxes("detailHorizontal");
        });
        detailviewCheckbox.classList.add("hicannElementCheckbox");
        detailviewCheckbox.id = "element_0_" + i + "_1_checkbox";
        detailviewListItem.appendChild(detailviewCheckbox);
        // detailed Buses label
        var detailviewLabel = document.createElement("label");
        detailviewLabel.innerHTML = "Detailview";
        detailviewListItem.appendChild(detailviewLabel);
        var detailviewList = document.createElement("ul");
        detailviewListItem.appendChild(detailviewList);
        // detailed Buses left
        var detailBusesLeftListItem = document.createElement("li");
        detailviewList.appendChild(detailBusesLeftListItem);
        var detailBusesLeftCheckbox = document.createElement("input");
        detailBusesLeftCheckbox.type = "checkbox";
        detailBusesLeftCheckbox.checked = false;
        detailBusesLeftCheckbox.addEventListener("change", function (e) {
            var event = e || window.event;
            var target = event.target;
            var hicannIndex = i;
            manualmode.busesLeft(hicannIndex, target.checked);
            pixiBackend.renderer.render();
            manualmode.checkAllCheckboxes("detailLeft");
            var allPropertiesSelected;
            if ((manualmode.selectedElements.detailview.left[i] === true)
                && (manualmode.selectedElements.detailview.right[i] === true)
                && (manualmode.selectedElements.detailview.horizontal[i] === true)) {
                allPropertiesSelected = true;
            }
            else {
                allPropertiesSelected = false;
            }
            if (allPropertiesSelected) {
                $("#element_0_" + i + "_1_checkbox").prop("checked", true);
            }
            else {
                $("#element_0_" + i + "_1_checkbox").prop("checked", false);
            }
        });
        detailBusesLeftCheckbox.classList.add("hicannElementCheckbox");
        detailBusesLeftCheckbox.id = "element_0_" + i + "_1_0";
        detailBusesLeftListItem.appendChild(detailBusesLeftCheckbox);
        var detailBusesLeftLabel = document.createElement("label");
        detailBusesLeftLabel.innerHTML = "vertical left";
        detailBusesLeftListItem.appendChild(detailBusesLeftLabel);
        // detailed Buses right
        var detailBusesRightListItem = document.createElement("li");
        detailviewList.appendChild(detailBusesRightListItem);
        var detailBusesRightCheckbox = document.createElement("input");
        detailBusesRightCheckbox.type = "checkbox";
        detailBusesRightCheckbox.checked = false;
        detailBusesRightCheckbox.addEventListener("change", function (e) {
            var event = e || window.event;
            var target = event.target;
            var hicannIndex = i;
            manualmode.busesRight(hicannIndex, target.checked);
            pixiBackend.renderer.render();
            manualmode.checkAllCheckboxes("detailRight");
            var allPropertiesSelected;
            if ((manualmode.selectedElements.detailview.left[i] === true)
                && (manualmode.selectedElements.detailview.right[i] === true)
                && (manualmode.selectedElements.detailview.horizontal[i] === true)) {
                allPropertiesSelected = true;
            }
            else {
                allPropertiesSelected = false;
            }
            if (allPropertiesSelected) {
                $("#element_0_" + i + "_1_checkbox").prop("checked", true);
            }
            else {
                $("#element_0_" + i + "_1_checkbox").prop("checked", false);
            }
        });
        detailBusesRightCheckbox.classList.add("hicannElementCheckbox");
        detailBusesRightCheckbox.id = "element_0_" + i + "_1_1";
        detailBusesRightListItem.appendChild(detailBusesRightCheckbox);
        var detailBusesRightLabel = document.createElement("label");
        detailBusesRightLabel.innerHTML = "vertical right";
        detailBusesRightListItem.appendChild(detailBusesRightLabel);
        // detailed Buses horizontal
        var detailBusesHorizontalListItem = document.createElement("li");
        detailviewList.appendChild(detailBusesHorizontalListItem);
        var detailBusesHorizontalCheckbox = document.createElement("input");
        detailBusesHorizontalCheckbox.type = "checkbox";
        detailBusesHorizontalCheckbox.checked = false;
        detailBusesHorizontalCheckbox.addEventListener("change", function (e) {
            var event = e || window.event;
            var target = event.target;
            var hicannIndex = i;
            manualmode.busesHorizontal(hicannIndex, target.checked);
            pixiBackend.renderer.render();
            manualmode.checkAllCheckboxes("detailHorizontal");
            var allPropertiesSelected;
            if ((manualmode.selectedElements.detailview.left[i] === true)
                && (manualmode.selectedElements.detailview.right[i] === true)
                && (manualmode.selectedElements.detailview.horizontal[i] === true)) {
                allPropertiesSelected = true;
            }
            else {
                allPropertiesSelected = false;
            }
            if (allPropertiesSelected) {
                $("#element_0_" + i + "_1_checkbox").prop("checked", true);
            }
            else {
                $("#element_0_" + i + "_1_checkbox").prop("checked", false);
            }
        });
        detailBusesHorizontalCheckbox.classList.add("hicannElementCheckbox");
        detailBusesHorizontalCheckbox.id = "element_0_" + i + "_1_2";
        detailBusesHorizontalListItem.appendChild(detailBusesHorizontalCheckbox);
        var detailBusesHorizontalLabel = document.createElement("label");
        detailBusesHorizontalLabel.innerHTML = "horizontal";
        detailBusesHorizontalListItem.appendChild(detailBusesHorizontalLabel);
    };
    // hicanns add list items containing buttons
    for (var i = 0; i <= wafer.enumMax; i++) {
        _loop_1(i);
    }
    ;
}
/**
 * Build the HTML for the Routes "tree-style" list in the left info-box
 */
function buildRoutesTree() {
    // surrounding div
    var tree = domObjects.routesTree[0];
    //unordered list
    var list = document.createElement("ul");
    tree.appendChild(list);
    // routes
    // surrounding list item routes
    var listItem = document.createElement("li");
    list.appendChild(listItem);
    // routes checkbox
    var routesInput = document.createElement("input");
    routesInput.type = "checkbox";
    routesInput.checked = true;
    routesInput.classList.add("fork");
    routesInput.id = "routes_0";
    listItem.appendChild(routesInput);
    // routes checkbox label
    var routesInputLabel = document.createElement("label");
    routesInputLabel.htmlFor = "routes_0";
    routesInputLabel.classList.add("checkboxLabel");
    listItem.appendChild(routesInputLabel);
    // select all Routes checkbox
    var allRoutesCheckbox = document.createElement("input");
    allRoutesCheckbox.type = "checkbox";
    allRoutesCheckbox.checked = false;
    allRoutesCheckbox.classList.add("routeCheckbox");
    allRoutesCheckbox.id = "routes_0_check";
    allRoutesCheckbox.addEventListener("change", function (e) {
        //var startTime = self.performance.now();
        var event = e || window.event;
        var target = event.target;
        if (target.checked) {
            for (var _i = 0, _a = routesOnStage.routes; _i < _a.length; _i++) {
                var route = _a[_i];
                routesOnStage.setRoute(route, true);
                routesOnStage.setCheckbox(route, true);
            }
            ;
        }
        else {
            for (var _b = 0, _c = routesOnStage.routes; _b < _c.length; _b++) {
                var route = _c[_b];
                routesOnStage.setRoute(route, false);
                routesOnStage.setCheckbox(route, false);
            }
            ;
        }
        ;
        pixiBackend.renderer.render();
        /*
        requestAnimationFrame(end)
        function end() {

            var endTime = self.performance.now();
            console.log(endTime - startTime);
        
        }*/
    });
    listItem.appendChild(allRoutesCheckbox);
    // routes label
    var routesLabel = document.createElement("button");
    routesLabel.innerText = "Routes";
    routesLabel.addEventListener("click", function () {
        routesOnStage.handleRouteDoubleClick();
    });
    listItem.appendChild(routesLabel);
    // route list
    // route surrounding unordered list
    var routesList = document.createElement("ul");
    listItem.appendChild(routesList);
    var _loop_2 = function (route) {
        var ID = route.ID;
        var routeListItem = document.createElement("li");
        routesList.appendChild(routeListItem);
        var routeCheckbox = document.createElement("input");
        routeCheckbox.type = "checkbox";
        routeCheckbox.checked = false;
        routeCheckbox.classList.add("routeCheckbox");
        routeCheckbox.id = "routes_0_" + ID;
        routeCheckbox.addEventListener("change", function (e) {
            var event = e || window.event;
            var target = event.target;
            if (target.checked) {
                routesOnStage.setRoute(route, true);
            }
            else {
                routesOnStage.setRoute(route, false);
            }
            ;
            routesOnStage.checkAllRoutes();
            pixiBackend.renderer.render();
        });
        routeListItem.appendChild(routeCheckbox);
        var routeLabel = document.createElement("button");
        routeLabel.innerText = "Route " + (ID + 1);
        routeLabel.addEventListener("click", function () {
            routesOnStage.handleRouteClick([route]);
        });
        routeListItem.appendChild(routeLabel);
    };
    // routes: add list items
    for (var _i = 0, _a = routesOnStage.routes; _i < _a.length; _i++) {
        var route = _a[_i];
        _loop_2(route);
    }
}
/**
 * Event handler for clicking on a HICANN in the HICANN list.
 */
function handleListClickHicann(event) {
    var hicannNumber = parseInt(event.path[0].innerText.split(" ")[1]);
    var transform = pixiBackend.container.stage.transform;
    var stagePosition = transform.position;
    var hicannPosition = wafer.hicanns[hicannNumber].position;
    var newPosition = {
        x: -(hicannPosition.x + hicannWidth / 2) * transform.scale.x + canvasCenter().x,
        y: -(hicannPosition.y + hicannHeight / 2) * transform.scale.y + canvasCenter().y,
    };
    pixiBackend.animateStagePosition(stagePosition.x, stagePosition.y, newPosition.x, newPosition.y, 700);
    animateBorderAroundHicann(pixiBackend.container.border, hicannPosition.x, hicannPosition.y, hicannWidth, hicannHeight, 10, "0xff0066");
    pixiBackend.renderer.render();
    displayProperties(hicannNumber);
}
/**
 * Animate a temporary border around a HICANN.
 * @param container PixiJS container for the border object.
 * @param x x-coordinate of the top left corner of the HICANN.
 * @param y y-coordinate of the top left corner of the HICANN.
 * @param width Width of the HICANN.
 * @param height Height of the HICANN.
 * @param lineWidth Line-Width for the border.
 * @param color Color of border. Requires a hex-color in the form "0xffffff".
 */
function animateBorderAroundHicann(container, x, y, width, height, lineWidth, color) {
    var alpha = 1;
    var timer = setInterval(function () {
        if (container.children.length === 1) {
            pixiBackend.removeChild(container, 0);
        }
        ;
        pixiBackend.drawRectangleBorder(container, x, y, width, height, lineWidth, color, alpha);
        pixiBackend.renderer.render();
        alpha -= 0.01;
        if (Math.round(alpha * 100) / 100 === 0.00) {
            clearInterval(timer);
            pixiBackend.removeChild(container, 0);
        }
        ;
    }, 15);
}
/**
 * Use JQueryUI to set up part of the UI
 */
function setupJQueryUI() {
    // add resizability to wafer list in left info panel
    $("#waferList")
        .resizable({
        handles: "s",
    })
        .on("resize", function () {
        $("#elementsTree").outerHeight($("#waferList").height() - 15);
    });
    // initialize
    $("#elementsTree").outerHeight($("#waferList").height() - 15);
    // add resizability to routes list in left info panel
    $("#routesList")
        .resizable({
        handles: "s",
    }).on("resize", function () {
        $("#routesTree").outerHeight($("#routesList").height() - 15);
    });
    // initialize
    $("#routesTree").outerHeight($("#routesList").height() - 15);
    // route width slider
    $("#routeWidthSlider")
        .slider({
        slide: function (event, ui) {
            routesOnStage.handleRouteWidthSlider(ui.value);
        },
        min: 1,
        max: 5
    });
    // initialize
    $("#routeWidthSlider").slider("value", 4);
}
/**
 * Helper function to reference the DOM
 */
function addByID(object, id) {
    object[id] = $("#" + id);
}
/**
 * Helper function to reference the DOM
 */
function addProperty(object, property) {
    object[property] = {};
    addByID(object[property], property + "Number");
    addByID(object[property], property + "Gradient");
    addByID(object[property], property + "Min");
    addByID(object[property], property + "Max");
}
/**
 * Store references to DOM objects to save performance.
 */
function referenceDOM() {
    addByID(domObjects, "controlsContainer");
    addByID(domObjects, "rightInfoBox");
    addByID(domObjects, "hicannNumber");
    addByID(domObjects, "elementsTree");
    addByID(domObjects, "routesTree");
    for (var i = 0; i < properties.length; i++) {
        addProperty(domObjects, properties[i]);
    }
    ;
}
/**
 * Show Hicann properties in left info box.
 */
function displayProperties(hicannNumber) {
    domObjects.hicannNumber.html("HICANN " + hicannNumber);
    displayNeuronsNumber(hicannNumber);
    displayInputsNumber(hicannNumber);
    displayBusesNumber(hicannNumber);
}
function displayNeuronsNumber(hicannNumber) {
    domObjects.neurons.neuronsNumber.html("\n\t\tNumber of neurons: " + wafer.hicanns[hicannNumber].numNeurons + "\n\t");
}
function displayInputsNumber(hicannNumber) {
    domObjects.inputs.inputsNumber.html("\n\t\tNumber of inputs: " + wafer.hicanns[hicannNumber].numInputs + "\n\t");
}
function displayBusesNumber(hicannNumber) {
    domObjects.leftBuses.leftBusesNumber.html("\n\t\tvertical left: " + wafer.hicanns[hicannNumber].numBusesLeft + "\n\t");
    domObjects.rightBuses.rightBusesNumber.html("\n\t\tvertical right: " + wafer.hicanns[hicannNumber].numBusesRight + "\n\t");
    domObjects.horizontalBuses.horizontalBusesNumber.html("\n\t\thorizontal: " + wafer.hicanns[hicannNumber].numBusesHorizontal + "\n\t");
}
/**
 * Set the background colors as well as Min, Max numbers for all HICANN property gradients.
 */
function setupPropertyGradients() {
    domObjects.neurons.neuronsGradient.css("background", "linear-gradient(90deg, #" + numNeuronsColorOne + ", #" + numNeuronsColorTwo + ")");
    domObjects.neurons.neuronsMin.html("0");
    domObjects.neurons.neuronsMax.html(wafer.numNeuronsMax);
    domObjects.inputs.inputsGradient.css("background", "linear-gradient(90deg, #" + numInputsColorOne + ", #" + numInputsColorTwo + ")");
    domObjects.inputs.inputsMin.html("0");
    domObjects.inputs.inputsMax.html(wafer.numInputsMax);
    domObjects.leftBuses.leftBusesGradient.css("background", "linear-gradient(90deg, #" + numRoutesLeftColorOne + ", #" + numRoutesLeftColorTwo + ")");
    domObjects.leftBuses.leftBusesMin.html("0");
    domObjects.leftBuses.leftBusesMax.html(wafer.numBusesLeftMax);
    domObjects.rightBuses.rightBusesGradient.css("background", "linear-gradient(90deg, #" + numRoutesRightColorOne + ", #" + numRoutesRightColorTwo + ")");
    domObjects.rightBuses.rightBusesMin.html("0");
    domObjects.rightBuses.rightBusesMax.html(wafer.numBusesRightMax);
    domObjects.horizontalBuses.horizontalBusesGradient.css("background", "linear-gradient(90deg, #" + numRoutesHorizontalColorOne + ", #" + numRoutesHorizontalColorTwo + ")");
    domObjects.horizontalBuses.horizontalBusesMin.html("0");
    domObjects.horizontalBuses.horizontalBusesMax.html(wafer.numBusesHorizontalMax);
}
/**
 * Event handler for keyboard events
 */
function handleKeyDown(event) {
    var key = event.which;
    switch (key) {
        case 65:
            console.log('key a pressed');
            break;
        case 83:
            console.log('key s pressed');
            break;
    }
    ;
}
;
/**
 * Event handler for mouse-down event
 */
function handleMouseDown(event) {
    mouseIsDown = true;
    mouseDownPosition = {
        x: event.clientX,
        y: event.clientY
    };
    /*
    if (detailview.enabled) {
        mouseOverSynapse();
        detailview.handleSynapseClick();
    };
    */
    if (overview.hicannNumber.hicannIndex !== undefined) {
        displayProperties(overview.hicannNumber.hicannIndex);
    }
    ;
    routesOnStage.handleVisuClick(event.clientX, event.clientY);
}
;
/**
 * Event handler for the mouse-up event
 * - in automode: switch to neighbor HICANN
 */
function handleMouseUp(event) {
    mouseIsDown = false;
    var positionDiff = {
        x: (event.clientX - mouseDownPosition.x),
        y: (event.clientY - mouseDownPosition.y)
    };
    if ((positionDiff.x !== 0) || (positionDiff.y !== 0)) {
        if (detailview.enabled && automode.enabled) {
            // horizontal movement
            if (positionDiff.x > 0) {
                if (detailview.westernHicannCloser(canvasCenter())) {
                    displayProperties(detailview.westernHicann);
                    automode.startWesternHicann(detailview.currentHicann);
                }
                ;
            }
            else {
                if (detailview.easternHicannCloser(canvasCenter())) {
                    displayProperties(detailview.easternHicann);
                    automode.startEasternHicann(detailview.currentHicann);
                }
            }
            ;
            // vertical movement
            if (positionDiff.y > 0) {
                if (detailview.northernHicannCloser(canvasCenter())) {
                    displayProperties(detailview.northernHicann);
                    automode.startNorthernHicann(detailview.currentHicann);
                }
            }
            else {
                if (detailview.southernHicannCloser(canvasCenter())) {
                    displayProperties(detailview.southernHicann);
                    automode.startSouthernHicann(detailview.currentHicann);
                }
                ;
            }
            ;
        }
        ;
    }
}
;
/**
 * Event handler for the mouse-move event
 * - stage panning
 */
function handleMouseMove(event) {
    var newMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
    if (mouseIsDown) {
        var diff = {
            x: (newMousePosition.x - mousePosition.x),
            y: (newMousePosition.y - mousePosition.y),
        };
        // pan effect
        pixiBackend.moveStage(diff.x, diff.y);
    }
    else {
        // display hicann number
        mouseOverHicann();
    }
    ;
    pixiBackend.renderer.render();
    mousePosition = {
        x: newMousePosition.x,
        y: newMousePosition.y
    };
}
;
/**
 * Event handler for mouse-over event
 * - draw HICANN number
 */
function mouseOverHicann() {
    for (var index = wafer.enumMin; index <= wafer.enumMax; index++) {
        // loop through hicanns and check if mouse if over them
        if (pixiBackend.mouseInRectangle(mousePosition, wafer.hicanns[index].position.x, wafer.hicanns[index].position.y, hicannWidth, hicannHeight)) {
            if (index !== overview.hicannNumber.hicannIndex) {
                // remove old hicann number(s)
                overview.hicannNumber.clean();
                // draw new hicann number
                overview.hicannNumber.draw(index, wafer.hicanns[index].position.x, wafer.hicanns[index].position.y);
            }
            ;
            overview.hicannNumber.hicannIndex = index;
        }
    }
}
/**
 * Event handler for the wheel event
 * - zoom in or out of stage
 * - show lookup plot if zoomed out all the way
 * - adjust routewidth
 * - automode/ manualMode: switch between overview, detailview and detailviewLevelTwo
 */
function handleWheel(event) {
    var factor = Math.abs(event.deltaY / 600) + 1;
    var transform = pixiBackend.container.stage.transform;
    var pixiScale = transform.scale.x;
    // limit zooming out
    if ((pixiScale <= reticlesOnStage.threshold) && (event.deltaY > 0)) {
        // show lookup plot (reticle & fpga coordinates)
        reticlesOnStage.setReticles(true);
        pixiBackend.renderer.render();
        // end handleWheel
        return "reached zoom limit";
    }
    if (reticlesOnStage.enabled && (event.deltaY < 0)) {
        // hide lookup plot
        reticlesOnStage.setReticles(false);
        pixiBackend.renderer.render();
    }
    if ((event.clientX >= ($("#leftInfoBox").offset().left + $("#leftInfoBox").outerWidth(true))) && (event.clientX <= $("#rightInfoBox").offset().left)) {
        if (Math.abs(event.deltaY) !== event.deltaY) {
            // zoom stage
            pixiBackend.zoomIn(factor, event.clientX, event.clientY);
            // auto mode
            if (automode.enabled) {
                // zoom into detail view
                if ((!detailview.enabled) && (pixiScale >= detailview.threshold) && (pixiScale < detailview.threshold2)) {
                    // determine hicann in view
                    var hicannIndex = void 0;
                    if (pixiBackend.container.numberText.children[0]) {
                        // hicann number text
                        var child = pixiBackend.container.numberText.children[0];
                        hicannIndex = parseInt(child.text);
                    }
                    else {
                        hicannIndex = detailview.hicannClosestToCenter(canvasCenter());
                    }
                    // display Hicann properties in right Infobox
                    displayProperties(hicannIndex);
                    // start the detailview
                    automode.startDetailview(hicannIndex);
                }
                // zoom into detailview level two
                if (pixiScale >= detailview.threshold2) {
                    automode.startDetailviewLevelTwo(detailview.currentHicann);
                }
                // manual mode
            }
            else {
                if ((pixiScale >= detailview.threshold) && (!detailview.enabled)) {
                    manualmode.startDetailview();
                }
                if ((pixiScale >= detailview.threshold2) && (!detailview.levelTwoEnabled)) {
                    manualmode.startDetailviewLevelTwo();
                }
            }
            // route width adjustment
            routesOnStage.adjustRouteWidth(pixiScale);
        }
        else {
            // zoom stage
            pixiBackend.zoomOut(factor, event.clientX, event.clientY);
            // auto mode
            if (automode.enabled) {
                // zoom out of detailview level two
                if ((pixiScale < detailview.threshold2) && (pixiScale > detailview.threshold)) {
                    automode.startDetailview(detailview.currentHicann);
                }
                ;
                // zoom out of detail view
                if ((pixiScale < detailview.threshold) && (detailview.enabled)) {
                    automode.startOverview(detailview.currentHicann);
                }
                ;
                // manual mode
            }
            else {
                if ((pixiScale < detailview.threshold) && (detailview.enabled)) {
                    manualmode.leaveDetailview();
                }
                if ((pixiScale < detailview.threshold2) && (detailview.levelTwoEnabled)) {
                    manualmode.leaveDetailviewLevelTwo();
                }
            }
            // route width adjustment
            routesOnStage.adjustRouteWidth(pixiScale);
        }
        ;
    }
    ;
    pixiBackend.renderer.render();
}
/*
 * jquery ui plugin alsoResizeReverse
 * copied and modified alsoResize from jquery-ui.js
 * works, but problems with typescript
 */
/*
$.ui.plugin.add( "resizable", "alsoResizeReverse", {

    start: function() {
        var that = $( this ).resizable( "instance" ),
            o = that.options;

        $( o.alsoResizeReverse ).each( function() {
            var el = $( this );
            el.data( "ui-resizable-alsoresizereverse", {
                width: parseFloat( el.width() ), height: parseFloat( el.height() ),
                left: parseFloat( el.css( "left" ) ), top: parseFloat( el.css( "top" ) )
            } );
        } );
    },

    resize: function( event, ui ) {
        var that = $( this ).resizable( "instance" ),
            o = that.options,
            os = that.originalSize,
            op = that.originalPosition,
            delta = {
                height: ( that.size.height - os.height ) || 0,
                width: ( that.size.width - os.width ) || 0,
                top: ( that.position.top - op.top ) || 0,
                left: ( that.position.left - op.left ) || 0
            };

            $( o.alsoResizeReverse ).each( function() {
                var el = $( this ), start = $( this ).data( "ui-resizable-alsoresizereverse" ), style = {},
                    css = el.parents( ui.originalElement[ 0 ] ).length ?
                            [ "width", "height" ] :
                            [ "width", "height", "top", "left" ];

                $.each( css, function( i, prop ) {
                    var sum = ( start[ prop ] || 0 ) - ( delta[ prop ] || 0 );
                    if ( sum && sum >= 0 ) {
                        style[ prop ] = sum || null;
                    }
                } );

                el.css( style );
            } );
    },

    stop: function() {
        $( this ).removeData( "ui-resizable-alsoresizereverse" );
    }
} );
*/ 
