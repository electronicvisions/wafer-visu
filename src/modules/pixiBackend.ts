/**
 * A backend to draw graphics on a HTML 5 canvas using the library PixiJS. 
 * The backend includes functions to draw primitive shapes either as graphics objects or as sprites with a specified resolution.
 * Functions to store multiple primitive shapes of one type as one PixiJS graphics object are also included.
 * 
 */
namespace pixiBackend {
    /**
     * The PixiJS containers are objects to hold graphics elements that are rendered on the canvas.
     * They can be nested to build something like a folderstructure. The substructure is accessible via the "childrens" of a container.
     */
    export const container = {
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
      setup: function() {
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
    }

    /**
     * The renderer is by default the WebGL renderer but uses the canvas renderer as a fallback option,
     * if the WebGL renderer is not supported by the browser.
     */
    export const renderer = {
      renderer: PIXI.autoDetectRenderer({width: 256, height: 256, autoResize: true}),
      backgroundColor: 0x333333,
      /**
       * Setup the canvas
       */
      setup: function(domParent: JQuery<HTMLElement>, canvasWidth: number, canvasHeight: number) {
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
      render: function() {
        this.renderer.render(pixiBackend.container.stage);
      }
    }
    
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
    export function drawRectangle(container: PIXI.Container,
        x: number, y: number, width: number, height: number, color: string,
        interactive=false, mouseoverFunction=undefined, mouseoutFunction=undefined, clickFunction=undefined) {
      const rectangle: any = new PIXI.Graphics();
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
      };
    }

    /**
     * Draw a circle as graphics object.
     * @param container PixiJS container to hold the graphics object.
     * @param x x-coordinate of the top left corner.
     * @param y y-coordinate of the top left corner.
     * @param radius Radius of the circle.
     * @param color Fill color for the circle. Requires hex-color in the form "0xffffff".
     */
    export function drawCircle(container: PIXI.Container, x: number, y: number, radius: number, color) {
      const circle = new PIXI.Graphics();
      circle.beginFill(color);
      circle.drawCircle(x, y, radius);
      circle.endFill();
      container.addChild(circle);
    }

    /**
     * Draw multiple circles as a single graphics object.
     * This yields vastly better performance compare to creating multiple graphics objects.
     * @param container PixiJS container to hold the graphics object.
     * @param xValues x-coordinates of the top left corners of the circles.
     * @param yValues y-coordinates of the top left corners of the circles. 
     * @param radiusValues Radii of the circles.
     * @param color Fill colors of the circles. Requires hex-colors in the form "0xffffff".
     */
    export function drawCircles(container: PIXI.Container,
        xValues: number[], yValues: number[], radiusValues: number[], color) {
      const circle = new PIXI.Graphics();
      for (let index=0; index<xValues.length; index++) {
        circle.beginFill(color);
        circle.drawCircle(xValues[index], yValues[index], radiusValues[index]);
        circle.endFill();
      };
      container.addChild(circle);
    }

    /**
     * Draw a triangle as graphics object
     * @param container PixiJS container to hold the graphics object.
     * @param x x-coordinate of the top left corner of the triangle.
     * @param y y-coordinate of the top left corner of the triangle.
     * @param width Width of the triangle.
     * @param height Height of the triangle.
     * @param color Fill color of the triangle. Requires hex-color in the form "0xffffff".
     */
    export function drawTriangle(container: PIXI.Container, x: number, y: number, width: number, height: number, color) {
      const path = [x, y, x+width, y, x+width/2, y-height, x, y];
      const triangle = new PIXI.Graphics();
      triangle.beginFill(color);
      triangle.drawPolygon(path);
      triangle.endFill();
      container.addChild(triangle);
    }

    /**
     * Draws text in the boundaries of the rectangle. The text is sized to fit exactly in, either by width or by height.
     * @param container PixiJS container to hold the text object.
     * @param x x-coordinate of the top left corner of the text.
     * @param y y-coordinate of the top left corner of the text.
     * @param rectWidth Width of the rectangle, the text should fit in.
     * @param rectHeight Height of the rectangle, the text should fit in.
     * @param style style-object for the text.
     */
    export function drawTextInRectangle(container: PIXI.Container, x: number, y: number, rectWidth: number, rectHeight: number,
        textContent: string, style: object) {
      const text = new PIXI.Text(textContent, style);
      text.x = x;
      text.y = y;
      // set width & height
      const originalWidth = text.width;
      let originalHeight = text.height;
      text.width = rectWidth;
      text.height *= text.width/originalWidth;
      if (text.height > rectHeight) {
        originalHeight = text.height;
        text.height = rectHeight;
        text.width *= text.height/originalHeight;
      }
      container.addChild(text);
    }

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
    export function drawRectangleBorder(container: PIXI.Container,
        x: number, y: number, width: number, height: number, lineWidth: number, color, alpha: number) {
      const rectangle = new PIXI.Graphics();
      rectangle.lineStyle(lineWidth, color, alpha);
      rectangle.drawRect(x, y, width, height);
      container.addChild(rectangle);
    }

    /**
     * Draw multiple rectangles as a single graphics object.
     * @param container PixiJS container to hold the graphics object.
     * @param xValues x-coordinates of the top left corners of the rectangles.
     * @param yValues y-coordinates of the top left corners of the rectangles.
     * @param widthValues Widths of the rectangles.
     * @param heightValues Heights of the rectangles.
     * @param color Colors of the rectangles. Requires hex-colors in the form "0xffffff".
     */
    export function drawRectangles(container: PIXI.Container,
        xValues: number[], yValues: number[], widthValues: number[], heightValues: number[], color) {
      const rectangles = new PIXI.Graphics();
      for (let index=0; index<xValues.length; index++) {
        rectangles.beginFill(color);
        rectangles.drawRect(xValues[index], yValues[index], widthValues[index], heightValues[index]);
        rectangles.endFill();
      };
      container.addChild(rectangles);
    }

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
    export function drawRectanglesSprite(container: PIXI.Container,
        xValues: number[], yValues: number[], widthValues: number[], heightValues: number[], color: string, resolution = 10) {
      const rectangles: any = new PIXI.Graphics();
      for (let index=0; index<xValues.length; index++) {
        rectangles.beginFill(color);
        rectangles.drawRect(xValues[index], yValues[index], widthValues[index], heightValues[index]);
        rectangles.endFill();
      };
      let sprite = new PIXI.Sprite(rectangles.generateCanvasTexture(0, resolution));
      sprite.position = new PIXI.Point(xValues[0], yValues[0]);
      container.addChild(sprite);
    }

    /**
     * Draw an image from a local url.
     * @param container PixiJS container to hold the sprite.
     * @param url Image file-path.
     * @param x x-coordinate of the top left corner of the image.
     * @param y y-coordinate of the top left corner of the image.
     * @param width Width of the image.
     * @param height Height of the image.
     */
    export function drawImage(container: PIXI.Container, url: string,
        x: number, y: number, width: number, height: number) {
      const image = PIXI.Sprite.fromImage(url);
      image.position = new PIXI.Point(x, y);
      image.width = width;
      image.height = height;
      container.addChild(image);
    }

    /**
     * Remove a child of any type from a PixiJS container.
     * @param container PixiJS container to remove the child from.
     * @param childIndex Index of the child to be removed (starts at 0).
     */
    export function removeChild(container: PIXI.Container, childIndex: number) {
      container.removeChild(container.children[childIndex]);
    }

    /**
     * Zoom the whole stage in.
     * @param factor zoom-factor.
     * @param x x-coordinate of the target position. Typically the x-coordinate of the mouse position.
     * @param y y-coordinate of the target position. Typically the y-coordinate of the mouse position.
     */
    export function zoomIn(factor: number, x: number, y: number) {
      let scale = this.container.stage.transform.scale;
      let position = this.container.stage.transform.position;
      const oldScale = scale.x;
      scale.x *= factor;
      scale.y *= factor;
      position.x -= (x - position.x) * Math.abs(scale.x/oldScale -1);
      position.y -= (y - position.y) * Math.abs(scale.x/oldScale -1);
    }

    /**
     * Zoom the whole stage out.
     * @param factor zoom-factor.
     * @param x x-coordinate of the target position. Typically the x-coordinate of the mouse position.
     * @param y y-coordinate of the target position. Typically the y-coordinate of the mouse position.
     */
    export function zoomOut(factor: number, x: number, y: number) {
      let scale = this.container.stage.transform.scale;
      let position = this.container.stage.transform.position;
      const oldScale = scale.x;
      scale.x /= factor;
      scale.y /= factor;
      position.x += (x - position.x) * Math.abs(scale.x/oldScale -1);
      position.y += (y - position.y) * Math.abs(scale.x/oldScale -1);
    }

    /**
     * Move the whole stage (panning).
     * @param deltaX Shift in x-direction (positive or negative value).
     * @param deltaY Shift in y-direction (positive or negative value).
     */
    export function moveStage(deltaX: number, deltaY: number) {
      this.container.stage.position.x += deltaX;
      this.container.stage.position.y += deltaY;
    }

    /**
     * Animate panning of the whole stage.
     * @param x1 Start x-coordinate
     * @param y1 Start y-coordinate
     * @param x2 Target x-coordinate
     * @param y2 Target y-coordinate
     * @param duration Animation duration in milliseconds
     */
    export function animateStagePosition(x1: number, y1: number, x2: number, y2: number, duration: number) {
      const numberSteps = Math.floor(duration/20);
      const step = {
        x: (x2 - x1) / numberSteps,
        y: (y2 - y1) / numberSteps,
      }
      let stepTracker = 0;
      let timer = setInterval(function(){
        pixiBackend.moveStage(step.x, step.y);
        pixiBackend.renderer.render();
        stepTracker++;
        if (stepTracker === numberSteps) {
          clearInterval(timer)
        }
      }, 20)
    }

    /**
     * Checks if the the mouse is within the boundaries of a rectangle.
     * @param mousePosition x-y-position of the mouse.
     * @param x x-coordinate of the rectangle.
     * @param y y-coordinate of the rectangle.
     * @param width Width of the rectangle.
     * @param height Height of the rectangle.
     */
    export function mouseInRectangle(mousePosition: {x: number, y: number}, x: number, y: number, width: number, height: number) {
      const scale = this.container.stage.transform.scale.x;
      const stagePosition = this.container.stage.transform.position;
      if((mousePosition.x >= x*scale + stagePosition.x)
          && (mousePosition.x <= (x + width)*scale + stagePosition.x)
          && (mousePosition.y >= y*scale + stagePosition.y)
          && (mousePosition.y <= (y + height)*scale + stagePosition.y)) {
        return (true);
      };
    }

    /**
     * Checks if a rectangle is at least partially within in the boundaries of the window.
     * @param x x-coordinate of the rectangle.
     * @param y y-coordinate of the rectangle.
     * @param width Width of the rectangle.
     * @param height Height of the rectangle.
     */
    export function rectanglePartiallyInWindow(x: number, y: number, width: number, height: number) { //x, y, width, height are the rectangle parameters
      const view = {
        width: $(window).width(),
        height: $(window).height(),
      };
      const scale = this.container.stage.transform.scale.x;
      const stagePosition = this.container.stage.transform.position;
      x *= scale;
      y *= scale;
      width *= scale;
      height *= scale;
      if((x + stagePosition.x < view.width)
          && (x + width + stagePosition.x > 0)
          && (y + stagePosition.y < view.height)
          && (y + height + stagePosition.y> 0)) {
        return true;
      } else { return false };
    }
  }