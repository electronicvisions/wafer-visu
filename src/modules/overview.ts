/// <reference path="tools.ts" />
/// <reference path="pixiBackend.ts" />
/// <reference path="wafer.ts" />
/**
 * The namespace contains a number of classes that each have their separate purposes but have dependencies on each other.
 * They are written into separate files to keep a clear structure.
 */
namespace internalModule {
	/**
	 * The HICANN number is drawn on top of a HICANN, when hovering over it.
	 */
	class HicannNumber {
		constructor(width: number, height: number) {
			this.style = {
				font: 'bold 100px Arial',
				fill: pixiBackend.renderer.backgroundColor
			}
			this.hicannIndex = undefined;
			this.width = width;
			this.height = height;
			this.alwaysHidden = false;
			this.container = pixiBackend.container.numberText;
		}

		hicannIndex: number;
		/**
		 * Set the style for the HICANN number text.
		 */
		style: {
			font: string,
			fill: number
		};
		/**
		 * Width of the number. Typically the width of the HICANN.
		 */
		width: number;
		height: number;
		/**
		 * Set to true if the HICANN number should not get displayed even in overview.
		 */
		alwaysHidden: boolean;
		/**
		 * pixiJS container to store the HICANN number text.
		 */
		container: PIXI.Container;

		/**
		 * Returns the visible property of the PixiJS container that holds the text.
		 */
		get visible() {
			return this.container.visible;
		};
		/**
		 * Set the visible property of the PixiJS container that holds the text.
		 */
		setVisible(visible: boolean) {
			if (!this.alwaysHidden) {
				this.container.visible = visible;
			}
		};

		/**
		 * Draw the HICANN number.
		 * @param number Index of the HICANN.
		 * @param x x-position for the text.
		 * @param y y-position for the text.
		 */
		draw(number: number, x: number, y: number) {
			// remove possible previous numbers
			this.clean();

			// draw new number;
			pixiBackend.drawTextInRectangle(this.container, x, y, this.width, this.height, number.toString(), this.style);
		};

		/**
		 * remove all text-graphic objects from the container.
		 */
		clean() {
			// number of graphics elements (children) in container
			const numElements = this.container.children.length;
			for (let i=0; i<numElements; i++) {
				pixiBackend.removeChild(this.container, 0);
			};
		};

		/**
		 * update the UI checkbox.
		 */
		updateCheckbox() {
			if (this.visible) {
				$("#numberTextCheckbox").prop("checked", true);
			} else {
				$("#numberTextCheckbox").prop("checked", false);
			}
		};
	}

	/**
	 * An image of the HICANN can be display in the background.
	 * Those images can be set visible or hidden via a checkbox in the UI.
	 */
	class WaferImage {
		constructor(wafer: internalModule.Wafer, hicannImagePath: string, container: PIXI.Container, width: number, height: number) {
			this.wafer = wafer;
			this.hicannImagePath = hicannImagePath;
			this.container = container;
			this.width = width;
			this.height = height;
			
			// preload the hicann Image
			PIXI.loader.add(hicannImagePath);
		}

		wafer: internalModule.Wafer;
		hicannImagePath: string;
		/**
		 * PixiJS container to hold the images.
		 */
		container: PIXI.Container;
		/**
		 * Width of the image. Should typically be the HICANN width.
		 */
		width: number;
		/**
		 * Height of the image. Shoudl typically be the HICANN height.
		 */
		height: number;

		/**
		 * Draw the images for all HICANNs.
		 */
		draw() {
			for (const hicann of this.wafer.hicanns) {
				// draw png-image of hicann
				pixiBackend.drawImage(this.container, this.hicannImagePath, hicann.position.x, hicann.position.y, this.width, this.height);
			}

			// render stage when hicann Image finished loading
			PIXI.loader.load(() => {
				pixiBackend.renderer.render();
			})
		}

		/**
		 * Set the images to visible or hide them.
		 */
		setVisible(visible: boolean) {
			// set pixiJS container property
			this.container.visible = visible;
		}
	}
	
	/**
	 * The overview does not show the HICANN elements such as buses in detail but provides cumulative information about a HICANN.
	 * All bus segments (vertical left, vertical right, horizontal) are drawn as one rectangle each in a color that represents the number of routes running over that segment.
	 * The number of inputs on a HICANN are represented by a colored triangle at the bottom of the HICANN.
	 * The number of neurons on a HICANN are represented by a colored rectangle in the background.
	 */
	export class Overview {
		constructor(
			wafer: internalModule.Wafer,
			hicannStyleProperties: {
				hicannWidth: number,
				hicannHeight: number,
				margin: number,
				triangleHeight: number,
				busWidth: number
			},
			hicannColors: {
				numNeuronsColorOne: string,
				numNeuronsColorTwo: string,
				numInputsColorOne: string,
				numInputsColorTwo: string,
				numRoutesLeftColorOne: string,
				numRoutesLeftColorTwo: string,
				numRoutesRightColorOne: string,
				numRoutesRightColorTwo: string,
				numRoutesHorizontalColorOne: string,
				numRoutesHorizontalColorTwo: string,
			},
		) {
			this.wafer = wafer;
			this.hicannNumber = new HicannNumber(hicannStyleProperties.hicannWidth, hicannStyleProperties.hicannHeight);
			this.waferImage = new WaferImage(wafer, "img/hicann.png", pixiBackend.container.hicannImages,
					hicannStyleProperties.hicannWidth, hicannStyleProperties.hicannHeight);
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
		wafer: internalModule.Wafer;
		hicannNumber: HicannNumber;
		waferImage: WaferImage;
		hicannWidth: number;
		hicannHeight: number;
		/**
		 * The space between two neighboring HICANNs.
		 */
		margin: number;
		/**
		 * The height of the triangle that represents the number of inpus of a HICANN.
		 */
		triangleHeight: number;
		routeWidth: number;
		/**
		 * Left color on the gradient for the number of neurons on a HICANN.
		 * Corresponds to the minimum number of neurons on any HICANN of the wafer.
		 */
		numNeuronsColorOne: string;
		/**
		 * Right color on the gradient for teh number of neurons on a HICANN.
		 * Corresponds to the maximum number of neurons on any HICANN of the wafer.
		 */
		numNeuronsColorTwo: string;
		/**
		 * Left color on the gradient for the number of inputs on a HICANN.
		 * Corresponds to the minimum number of inputs on any HICANN of the wafer.
		 */
		numInputsColorOne: string;
		/**
		 * Right color on the gradient for the number of inputs on a HICANN.
		 * Corresponds to the maximum number of inputs on any HICANN of the wafer.
		 */
		numInputsColorTwo: string;
		/**
		 * Left color on the gradient for the number of left routes on a HICANN.
		 * Corresponds to the minimum number of routes running over the left bus segment of any HICANN of the wafer.
		 */
		numRoutesLeftColorOne: string;
		/**
		 * Right color on the gradient for the number of left routes on a HICANN.
		 * Corresponds to the maximum number of routes running over the left bus segment of any HICANN of the wafer.
		 */
		numRoutesLeftColorTwo: string;
		/**
		 * Left color on the gradient for the number of right routes on a HICANN.
		 * Corresponds to the minimum number of routes running over the right bus segment of any HICANN of the wafer.
		 */
		numRoutesRightColorOne: string;
		/**
		 * Right color on the gradient for the number of right routes on a HICANN.
		 * Corresponds to the maximum number of routes running over the right bus segment of any HICANN of the wafer.
		 */
		numRoutesRightColorTwo: string;
		/**
		 * Left color on the gradient for the number of horizontal routes on a HICANN.
		 * Corresponds to the minimum number of routes running over the horizontal bus segment of any HICANN of the wafer.
		 */
		numRoutesHorizontalColorOne: string;
		/**
		 * Right color on the gradient for the number of horizontal routes on a HICANN.
		 * Corresponds to the maximum number of routes running over the horizontal bus segment of any HICANN of the wafer.
		 */
		numRoutesHorizontalColorTwo: string;

		/**
		 * Draw HICANN background inputs and vertical left, right and horizontal buses for all HICANNs.
		 */
		drawWafer() {
			// loop through hicanns on wafer
			for (let hicannIndex=this.wafer.enumMin; hicannIndex<=this.wafer.enumMax; hicannIndex++) {
				// calculate Hicann position in pixels
				let hicannX = this.wafer.hicanns[hicannIndex].x * ( this.hicannWidth + this.margin );
				let hicannY = this.wafer.hicanns[hicannIndex].y * ( this.hicannHeight + this.margin );
				this.wafer.hicanns[hicannIndex].position = {x: hicannX, y: hicannY};
		
				// draw rectangle as hicann representation, color scale for number of neurons
				this.drawHicannBackground(hicannIndex, hicannX, hicannY);

				// draw triangle in color scale for number of hicann inputs
				this.drawInputs(hicannIndex, hicannX + this.routeWidth, hicannY + this.hicannHeight);
				
				// draw "H" ín color scale for number of route-segment
				this.drawBusH(hicannIndex, hicannX, hicannY);
			};
			// render stage
			pixiBackend.renderer.render();
		}

		/**
		 * Draw a rectangle in the HICANN background in a color representing the number of neurons on that HICANN.
		 */
		drawHicannBackground(hicannIndex: number, x: number, y: number) {
			// calculate color on number of neurons color gradient
			let colorNumNeurons = tools.colorInGradient( this.numNeuronsColorOne, this.numNeuronsColorTwo,
					this.wafer.numNeuronsMax, this.wafer.hicanns[hicannIndex].numNeurons );
			// draw rectangle as hicann representation
			pixiBackend.drawRectangle(pixiBackend.container.backgrounds, x, y, this.hicannWidth, this.hicannHeight, colorNumNeurons);
		}

		/**
		 * Draw a rectangle on the bottom of a HICANN in a color representing the number of inputs on that HICANN.
		 */
		drawInputs(hicannIndex: number, x: number, y: number) {
			// calculate color on number of inputs color gradient
			let colorNumInputs = tools.colorInGradient( this.numInputsColorOne, this.numInputsColorTwo,
					this.wafer.numInputsMax, this.wafer.hicanns[hicannIndex].numInputs );
			// draw triangle in color scale as number of hicann inputs representation
			pixiBackend.drawTriangle(pixiBackend.container.inputs, x, y, this.hicannWidth - 2 * this.routeWidth, this.triangleHeight, colorNumInputs);
		}

		/**
		 * Draw vertical left, vertical right and horizontal buses of a HICANN
		 */
		drawBusH(hicannIndex: number, x: number, y: number) {
			// draw three segments of "H" seperately
			this.drawLeftBusH(hicannIndex, x, y);
			this.drawHorizontalBusH(hicannIndex, x + this.routeWidth, y + (this.hicannHeight - this.routeWidth)/2);
			this.drawRightBusH(hicannIndex, x + this.hicannWidth - this.routeWidth, y);
		}

		/**
		 * Draw all vertical left buses as one colored rectangle for a HICANN (as graphics object).
		 */
		drawLeftBusH(hicannIndex: number, x: number, y: number) {
			let colorNumBuses = tools.colorInGradient( this.numRoutesLeftColorOne, this.numRoutesLeftColorTwo,
					this.wafer.numBusesLeftMax, this.wafer.hicanns[hicannIndex].numBusesLeft);
			pixiBackend.drawRectangle(pixiBackend.container.overviewBusesLeft, x, y, this.routeWidth, this.hicannHeight, colorNumBuses);
		}

		/**
		 * Draw all vertical right buses as one colored rectangle for a HICANN (as graphics object).
		 */
		drawRightBusH(hicannIndex: number, x: number, y: number) {
			let colorNumBuses = tools.colorInGradient( this.numRoutesRightColorOne, this.numRoutesRightColorTwo,
					this.wafer.numBusesRightMax, this.wafer.hicanns[hicannIndex].numBusesRight);
			pixiBackend.drawRectangle(pixiBackend.container.overviewBusesRight, x, y, this.routeWidth, this.hicannHeight, colorNumBuses);
		}

		/**
		 * Draw all horizontal buses as one colored rectangle for a HICANN (as graphics object).
		 */
		drawHorizontalBusH(hicannIndex: number, x: number, y: number) {
			let colorNumBuses = tools.colorInGradient( this.numRoutesHorizontalColorOne, this.numRoutesHorizontalColorTwo,
					this.wafer.numBusesHorizontalMax, this.wafer.hicanns[hicannIndex].numBusesHorizontal);
			pixiBackend.drawRectangle(pixiBackend.container.overviewBusesHorizontal, x, y, this.hicannWidth - 2*this.routeWidth, this.routeWidth, colorNumBuses);
		}
	}
}