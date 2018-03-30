/// <reference path="tools.ts" />
/// <reference path="pixiBackend.ts" />
/// <reference path="wafer.ts" />
/**
 * The namespace contains a number of classes that each have their separate purposes but have dependencies on each other.
 * They are written into separate files to keep a clear structure.
 */
namespace internalModule {
  /**
   * The Detailview includes detailed representations of HICANN elements.
   * Buses are drawn as thin rectangles and the synapse arrays as arrays of small squares.
   * The detailview is divided into two sub-levels. The first one (detailview) drawing elements as Sprites,
   * the second one (detialviewLevelTwo) drawing real graphics elements.
   */
  export class Detailview {
    constructor(wafer: internalModule.Wafer, hicannWidth: number, hicannHeight: number, margin: number) {
      this.wafer = wafer;
      this.hicannWidth = hicannWidth;
      this.hicannHeight = hicannHeight;
      this.margin = margin;
    }
    wafer: internalModule.Wafer;
    hicannHeight: number;
    hicannWidth: number;
    margin: number;
    
    /**
     * set this property when detailview is entered or left
     */
    enabled = false;
    /**
     * set this property when detailviewLevelTwo is entered or left.
     */
    levelTwoEnabled = false;
    /**
     * Index of the HICANN that is currently in detailview. Used for auto mode.
     */
    currentHicann = undefined;
    /**
     * Index of northern HICANN of the one currently in detailview. Used for auto mode.
     */
    northernHicann = undefined;
    /**
     * Index of southern HICANN of the one currently in detailview. Used for auto mode.
     */
    southernHicann = undefined;
    /**
     * Index of eastern HICANN of the one currently in detailview. Used for auto mode.
     */
    easternHicann = undefined;
    /**
     * Index of western HICANN of the one currently in detailview. Used for auto mode.
     */
    westernHicann = undefined;
    /**
     * zoom-scale threshold to start detailview
     */
    threshold = NaN;
    /**
     * zoom-scale threshold to start detailviewLevelTwo
     */
    threshold2 = NaN;

    /**
     * Hardcoded number of neurons on a HICANN.
     */
    numNeurons = 256;
    /**
     * Hardcoded number of synapse rows in a synapse array on a HICANN.
     */
    numSynapsesVertical = 224;
    /**
     * Hardcoded number of vertical buses on a HICANN.
     */
    numBusesVertical = 128;
    /**
     * Hardcoded number of horizontal buses on a HICANN.
     */
    numBusesHorizontal = 64;
    /**
     * Unit distances between synapse array and Buses.
     */
    gap = 4;
    
    /**
     * Margin around HICANN. used to calculate when to start the detailview.
     */
    get edge() {
      return(this.hicannWidth/4)
    }
    /**
     * Total width of a synapse array.
     */
    get synapseArrayWidth() {
      return(this.hicannWidth*0.8)
    }
    /**
     * Computed width or height of synapses/Buses.
     */
    get unitLength() {
      return(this.hicannWidth/(4*520))
    }
    /**
     * Computed distance between synapses/Buses
     */
    get unitDistance() {
      return(this.hicannWidth - this.unitLength)/(this.numNeurons + this.numBusesVertical*2 + 2*this.gap - 1)
    }

    /**
     * Calculate the position of the center of a HICANN
     */
    hicannCenter(hicannIndex: number) {
      const transform: any = pixiBackend.container.stage.transform;
      const scale = transform.scale.x;
      const stagePosition = transform.position;
      const hicannCenter = {
        x: (this.wafer.hicanns[hicannIndex].x * (this.hicannWidth + this.margin) + this.hicannWidth/2)
            * scale + stagePosition.x,
        y: (this.wafer.hicanns[hicannIndex].y * (this.hicannHeight + this.margin) + this.hicannHeight/2)
            * scale + stagePosition.y,
      };
      return(hicannCenter);
    }
  
    /**
     * Find the HICANN that is closest to the center of the canvas.
     */
    hicannClosestToCenter(canvasCenter: {x: number, y: number}) {
      let minDistance = Infinity;
      let closestHicann = <number>undefined;
      for (let hicannIndex=this.wafer.enumMin; hicannIndex<=this.wafer.enumMax; hicannIndex++) {
        const hicannCenter = this.hicannCenter(hicannIndex);
        const distance = tools.distanceBetweenPoints(hicannCenter, canvasCenter);
        if (distance<minDistance) {
          minDistance = distance;
          closestHicann = hicannIndex;
        };
      }
      return(closestHicann);
    }

    /**
     * Find indices of neighboring HICANNS and update class properties.
     */
    updateSurroundingHicanns() {
      this.northernHicann = this.wafer.northernHicann(this.currentHicann);
      this.southernHicann = this.wafer.southernHicann(this.currentHicann);
      this.easternHicann = this.wafer.easternHicann(this.currentHicann);
      this.westernHicann = this.wafer.westernHicann(this.currentHicann);
    }

    /**
     * Draw all detailed elements of a HICANN
     */
    drawHicann(newHicann: number) {
      const hicannPosition = {
        x: this.wafer.hicanns[newHicann].position.x,
        y: this.wafer.hicanns[newHicann].position.y,
      };
      // draw hicann details
      this.drawSynapseArrays(hicannPosition);
      this.drawBusesLeft(hicannPosition);
      this.drawBusesRight(hicannPosition);
      this.drawBusesHorizontal(hicannPosition);
    }

    /**
     * Determine the zoom-scale where the detailview should begin.
     * The HICANN is fully in taking up almost the whole window at that point.
     */
    determineThreshold(canvasHeight: number) {
      const fullHicannScale = canvasHeight / (this.hicannHeight + 2 * this.edge);
      this.threshold = fullHicannScale;
      this.threshold2 = fullHicannScale * 8;
    }

    /**
     * draw both synapse arrays of a HICANN, both as sprites and graphics objects.
     * @param hicannPosition top left corner of the HICANN.
     */
    drawSynapseArrays(hicannPosition: {x: number, y: number}) {
      const synapseArrayHeight = (this.numSynapsesVertical - 1) * this.unitDistance + this.unitLength;
      const synapsesOne = {
        x: hicannPosition.x + (this.numBusesVertical + this.gap)*this.unitDistance,
        y: hicannPosition.y + 5 * this.gap,
        xValues: [],
        yValues: [],
        widthValues: [],
        heightValues: [],
      };
      const synapsesTwo = {
        x: hicannPosition.x + (this.numBusesVertical + this.gap)*this.unitDistance,
        y: hicannPosition.y + this.hicannHeight - synapseArrayHeight - 5 * this.gap,
        xValues: [],
        yValues: [],
        widthValues: [],
        heightValues: [],
      };
      for (let horizontal=0; horizontal<this.numNeurons; horizontal++) {
        for (let vertical=0; vertical<this.numSynapsesVertical; vertical++) {
          synapsesOne.xValues.push(synapsesOne.x + horizontal*this.unitDistance);
          synapsesOne.yValues.push(synapsesOne.y + vertical*this.unitDistance);
          synapsesOne.widthValues.push(this.unitLength);
          synapsesOne.heightValues.push(this.unitLength);
        };
      };
      for (let horizontal=0; horizontal<this.numNeurons; horizontal++) {
        for (let vertical=0; vertical<this.numSynapsesVertical; vertical++) {
          synapsesTwo.xValues.push(synapsesTwo.x + horizontal*this.unitDistance);
          synapsesTwo.yValues.push(synapsesTwo.y + vertical*this.unitDistance);
          synapsesTwo.widthValues.push(this.unitLength);
          synapsesTwo.heightValues.push(this.unitLength);
        };
      };
      pixiBackend.drawRectangles(pixiBackend.container.synapsesOne,
          synapsesOne.xValues, synapsesOne.yValues,
          synapsesOne.widthValues, synapsesOne.heightValues, "0xff6666");
      pixiBackend.drawRectanglesSprite(pixiBackend.container.synapsesOneSprite,
          synapsesOne.xValues, synapsesOne.yValues,
          synapsesOne.widthValues, synapsesOne.heightValues, "0xff6666");
      pixiBackend.drawRectangles(pixiBackend.container.synapsesTwo,
          synapsesTwo.xValues, synapsesTwo.yValues,
          synapsesTwo.widthValues, synapsesTwo.heightValues, "0xff6666");
      pixiBackend.drawRectanglesSprite(pixiBackend.container.synapsesTwoSprite,
          synapsesTwo.xValues, synapsesTwo.yValues,
          synapsesTwo.widthValues, synapsesTwo.heightValues, "0xff6666");
    }

    /**
     * Draw all vertical left routes of a HICANN as graphics objects.
     * @param hicannPosition Top left corner of the HICANN.
     */
    drawBusesLeft(hicannPosition: {x: number, y: number}) {
      const verticalBusesLeft = {
        x: hicannPosition.x,
        y: hicannPosition.y,
        xValues: [],
        yValues: [],
        widthValues: [],
        heightValues: [],
      };
      for (let i=0; i<this.numBusesVertical; i++) {
        verticalBusesLeft.xValues.push(verticalBusesLeft.x + i*this.unitDistance);
        verticalBusesLeft.yValues.push(verticalBusesLeft.y);
        verticalBusesLeft.widthValues.push(this.unitLength);
        verticalBusesLeft.heightValues.push(this.hicannHeight);
      };
      pixiBackend.drawRectangles(pixiBackend.container.busesLeft,
          verticalBusesLeft.xValues, verticalBusesLeft.yValues,
          verticalBusesLeft.widthValues, verticalBusesLeft.heightValues, "0xffffff");
    }

    /**
     * Draw all vertical right routes of a HICANN as graphics objects.
     * @param hicannPosition Top left corner of the HICANN.
     */
    drawBusesRight(hicannPosition: {x: number, y: number}) {
      const verticalBusesRight = {
        x: hicannPosition.x + (this.numBusesVertical + this.numNeurons + this.gap*2)*this.unitDistance,
        y: hicannPosition.y,
        xValues: [],
        yValues: [],
        widthValues: [],
        heightValues: [],
      };
      for (let i=0; i<this.numBusesVertical; i++) {
        verticalBusesRight.xValues.push(verticalBusesRight.x + i*this.unitDistance);
        verticalBusesRight.yValues.push(verticalBusesRight.y);
        verticalBusesRight.widthValues.push(this.unitLength);
        verticalBusesRight.heightValues.push(this.hicannHeight);
      };
      pixiBackend.drawRectangles(pixiBackend.container.busesRight,
          verticalBusesRight.xValues, verticalBusesRight.yValues,
          verticalBusesRight.widthValues, verticalBusesRight.heightValues, "0xffffff");
    }

    /**
     * Draw all horizontal buses of a HICANN as graphics objects.
     * @param hicannPosition Top left corner of the HICANN.
     */
    drawBusesHorizontal(hicannPosition: {x: number, y: number}) {
      // height of all the horizontal routes together
      const routeBlockHeight = (this.numBusesHorizontal - 1) * 2 * this.unitDistance + this.unitLength;
      const horizontalBuses = {
        x: hicannPosition.x,
        y: hicannPosition.y + (this.hicannHeight - routeBlockHeight) / 2,
        xValues: [],
        yValues: [],
        widthValues: [],
        heightValues: [],
      };
      for (let i=0; i<this.numBusesHorizontal; i++) {
        horizontalBuses.xValues.push(horizontalBuses.x);
        horizontalBuses.yValues.push(horizontalBuses.y + i * 2 *this.unitDistance);
        horizontalBuses.widthValues.push(this.hicannWidth);
        horizontalBuses.heightValues.push(this.unitLength);
      };
      pixiBackend.drawRectangles(pixiBackend.container.busesHorizontal,
          horizontalBuses.xValues, horizontalBuses.yValues,
          horizontalBuses.widthValues, horizontalBuses.heightValues, "0xffffff");
    }

    /**
     * Draw vertical left, vertical right and horizontal buses of a HICANN as sprites.
     * @param visible Show routes or hide them.
     */
    drawBusesSprite(hicannIndex: number, visible: boolean) {
      const hicannPosition = {
        x: this.wafer.hicanns[hicannIndex].position.x,
        y: this.wafer.hicanns[hicannIndex].position.y,
      };
      // vertical left
      const verticalBusesLeft = {
        xValues: [],
        yValues: [],
        widthValues: [],
        heightValues: [],
      };
      for (let i=0; i<this.numBusesVertical; i++) {
        verticalBusesLeft.xValues.push(hicannPosition.x + i*this.unitDistance);
        verticalBusesLeft.yValues.push(hicannPosition.y);
        verticalBusesLeft.widthValues.push(this.unitLength);
        verticalBusesLeft.heightValues.push(this.hicannHeight);
      };
      pixiBackend.drawRectanglesSprite(pixiBackend.container.busesLeftSprite,
        verticalBusesLeft.xValues, verticalBusesLeft.yValues,
        verticalBusesLeft.widthValues, verticalBusesLeft.heightValues, "0xffffff");
      pixiBackend.container.busesLeftSprite.children[hicannIndex].visible = visible;
    
      // vertical right
      const verticalBusesRight = {
        x: hicannPosition.x + (this.numBusesVertical + this.numNeurons + this.gap*2)*this.unitDistance,
        y: hicannPosition.y,
        xValues: [],
        yValues: [],
        widthValues: [],
        heightValues: [],
      };
      for (let i=0; i<this.numBusesVertical; i++) {
        verticalBusesRight.xValues.push(verticalBusesRight.x + i*this.unitDistance);
        verticalBusesRight.yValues.push(verticalBusesRight.y);
        verticalBusesRight.widthValues.push(this.unitLength);
        verticalBusesRight.heightValues.push(this.hicannHeight);
      };
      pixiBackend.drawRectanglesSprite(pixiBackend.container.busesRightSprite,
          verticalBusesRight.xValues, verticalBusesRight.yValues,
          verticalBusesRight.widthValues, verticalBusesRight.heightValues, "0xffffff");
      pixiBackend.container.busesRightSprite.children[hicannIndex].visible = visible;
    
      // horizontal
      // height of all the horizontal routes together
      const routeBlockHeight = (this.numBusesHorizontal - 1) * 2 * this.unitDistance + this.unitLength;
      const horizontalBuses = {
        x: hicannPosition.x,
        y: hicannPosition.y + (this.hicannHeight - routeBlockHeight) / 2,
        xValues: [],
        yValues: [],
        widthValues: [],
        heightValues: [],
      };
      for (let i=0; i<this.numBusesHorizontal; i++) {
        horizontalBuses.xValues.push(horizontalBuses.x);
        horizontalBuses.yValues.push(horizontalBuses.y + i * 2 * this.unitDistance);
        horizontalBuses.widthValues.push(this.hicannWidth);
        horizontalBuses.heightValues.push(this.unitLength);
      };
      pixiBackend.drawRectanglesSprite(pixiBackend.container.busesHorizontalSprite,
          horizontalBuses.xValues, horizontalBuses.yValues,
          horizontalBuses.widthValues, horizontalBuses.heightValues, "0xffffff");
      pixiBackend.container.busesHorizontalSprite.children[hicannIndex].visible = visible;
    }

    /**
     * Draw all buses of all HICANNs on the wafer as sprites.
     */
    drawAllBusesSprite() {
      for (const hicannIndex in this.wafer.hicanns) {
        this.drawBusesSprite(parseInt(hicannIndex), false);
      }
    }

    /**
     * remove all the detailed elements
     */
    resetDetailview() {
      const numChildren = pixiBackend.container.synapsesOne.children.length;
      for (let i=0; i<numChildren; i++) {
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
    }

    /**
     * Check if the northern HICANN is closer to the canvas center than the one currently in detailview.
     * Needed for auto mode.
     */
    northernHicannCloser(canvasCenter: {x: number, y: number}) {
      if (this.northernHicann) {
        const distanceCurrentHicann =
            tools.distanceBetweenPoints(this.hicannCenter(this.currentHicann), canvasCenter);
        const distanceNorthernHicann =
            tools.distanceBetweenPoints(this.hicannCenter(this.northernHicann), canvasCenter);
        if (distanceNorthernHicann + 2*this.edge < distanceCurrentHicann) {
          return true;
        } else {
          return false;
        };
      };
    }

    /**
     * Check if the southern HICANN is closer to the canvas center than the one currently in detailview.
     * Needed for auto mode.
     */
    southernHicannCloser(canvasCenter: {x: number, y: number}) {
      if (this.southernHicann) {
        const distanceCurrentHicann =
            tools.distanceBetweenPoints(this.hicannCenter(this.currentHicann), canvasCenter);
        const distanceSouthernHicann =
            tools.distanceBetweenPoints(this.hicannCenter(this.southernHicann), canvasCenter);
        if (distanceSouthernHicann + 2*this.edge < distanceCurrentHicann) {
          return true;
        } else {
          return false;
        };
      };
    }

    /**
     * Check if the eastern HICANN is closer to the canvas center than the one currently in detailview.
     * Needed for auto mode.
     */
    easternHicannCloser(canvasCenter: {x: number, y: number}) {
      if (this.easternHicann) {
        const distanceCurrentHicann =
            tools.distanceBetweenPoints(this.hicannCenter(this.currentHicann), canvasCenter);
        const distanceEasternHicann =
            tools.distanceBetweenPoints(this.hicannCenter(this.easternHicann), canvasCenter);
        if (distanceEasternHicann + 4*this.edge < distanceCurrentHicann) {
          return true;
        } else {
          return false;
        };
      };
    }

    /**
     * Check if the western HICANN is closer to the canvas center than the one currently in detailview.
     * Needed for auto mode.
     */
    westernHicannCloser(canvasCenter: {x: number, y: number}) {
      if (this.westernHicann) {
        const distanceCurrentHicann =
            tools.distanceBetweenPoints(this.hicannCenter(this.currentHicann), canvasCenter);
        const distanceWesternHicann =
            tools.distanceBetweenPoints(this.hicannCenter(this.westernHicann), canvasCenter);
        if (distanceWesternHicann + 4*this.edge < distanceCurrentHicann) {
          return true;
        } else {
          return false;
        };
      };
    }
  }
}