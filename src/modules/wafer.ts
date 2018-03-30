/// <reference path="module.d.ts" />

/**
 * The namespace contains a number of classes that each have their separate purposes but have dependencies on each other.
 * They are written into separate files to keep a clear structure.
 */
namespace internalModule {
  /**
   * Representation of a HICANN. Position is the position in the visualization and is added when the HICANN is drawn the first time.
   */
  export class HICANN {
    constructor(
      index: number,
      x: number,
      y: number,
      hasInputs: boolean,
      hasNeurons: boolean,
      isAvailable: boolean,
      numBusesHorizontal: number,
      numBusesLeft: number,
      numBusesRight: number,
      numBusesVertical: number,
      numInputs: number,
      numNeurons: number
    ) {
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
    index: number;
    x: number;
    y: number;
    position: {
      x: number,
      y: number
    };
    hasInputs: boolean;
    hasNeurons: boolean;
    isAvailable: boolean;
    numBusesHorizontal: number;
    numBusesLeft: number;
    numBusesRight: number;
    numBusesVertical: number;
    numInputs: number;
    numNeurons: number;
  }
  /**
   * Representation of a HICANN wafer. The data is parsed from a configuration xml-file using the Marocco JavaScript API.
   */
  export class Wafer {
    constructor() {
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
     * List of all HICANNs. The position is added, when the HICANN is drawn the first time.
     */
    hicanns: HICANN[];
    enumMin: number;
    enumMax: number;
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    /**
		 * Maximum number of neurons on any HICANN of the wafer.
		 */
    numNeuronsMax: number;
    /**
		 * Maximum number of inputs on any HICANN of the wafer.
		 */
    numInputsMax: number;
    /**
		 * Maximum number of left buses on any HICANN of the wafer.
		 */
    numBusesLeftMax: number;
    /**
		 * Maximum number of right buses on any HICANN of the wafer.
		 */
    numBusesRightMax: number;
    /**
		 * Maximum number of horizontal buses on any HICANN of the wafer.
		 */
    numBusesHorizontalMax: number;

    /**
     * process the network configuration xml file using the Marocco JavaScript API.
     * - new instances of HICANN are created
     * @param networkFilePath path to the xml file, located in the virtual emscripten filesystem
     */
    loadOverviewData(networkFilePath?: string) {
      console.log("start loading network");
      const marocco = networkFilePath ? new Module.Marocco(networkFilePath) : new Module.Marocco();
  
      console.log("done loading network")
      $("#setupScreen").fadeTo(1500, 0, () => {$("#setupScreen").css("display", "none")})
      // reading properties from marocco
      for (let i=this.enumMin; i<=this.enumMax; i++) {
        const enumRanged = new Module.HICANNOnWafer_EnumRanged_type(i)
        const hicann = new Module.HICANNOnWafer(enumRanged);
        const properties = marocco.properties(hicann);

        this.hicanns.push(new HICANN(
          i,
          hicann.x().value(),
          hicann.y().value(),
          properties.has_inputs(),
          properties.has_neurons(),
          properties.is_available(),
          properties.num_buses_horizontal(),
          properties.num_buses_left(),
          properties.num_buses_right(),
          properties.num_buses_vertical(),
          properties.num_inputs(),
          properties.num_neurons(),
        ));
      }

      this.maxPropertyValues();
    }

    /**
     * Find out the maximum values for HICANN properties
     */
    maxPropertyValues() {
      for (const hicann of this.hicanns) {
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
    }

    /**
     * Calculate the index/enum-coordinate of the northern HICANN, if existent.
     */
    northernHicann(hicannIndex: number) {
      let northernHicann: HICANN;
      for (let hicann of this.hicanns) {
        if ((hicann.y == this.hicanns[hicannIndex].y - 1)
            && (hicann.x == this.hicanns[hicannIndex].x)) {
          northernHicann = hicann;
          break;
        };
      };
      return(northernHicann ? northernHicann.index : undefined);
    }

    /**
     * Calculate the index/enum-coordinate of the southern HICANN, if existent.
     */
    southernHicann(hicannIndex: number) {
      let southernHicann: HICANN;
      for (let hicann of this.hicanns) {
        if ((hicann.y == this.hicanns[hicannIndex].y + 1)
            && (hicann.x == this.hicanns[hicannIndex].x)) {
          southernHicann = hicann;
          break;
        };
      };
      return(southernHicann ? southernHicann.index : undefined);
    }

    /**
     * Calculate the index/enum-coordinate of the eastern HICANN, if existent.
     */
    easternHicann(hicannIndex: number) {
      let easternHicann: HICANN;
      for (let hicann of this.hicanns) {
        if ((hicann.y == this.hicanns[hicannIndex].y)
            && (hicann.x == this.hicanns[hicannIndex].x + 1)) {
          easternHicann = hicann;
          break;
        };
      };
      return(easternHicann ? easternHicann.index : undefined);
    }

    /**
     * Calculate the index/enum-coordinate of the western HICANN, if existent.
     */
    westernHicann(hicannIndex: number) {
      let westernHicann: HICANN;
      for (let hicann of this.hicanns) {
        if ((hicann.y == this.hicanns[hicannIndex].y)
            && (hicann.x == this.hicanns[hicannIndex].x - 1)) {
          westernHicann = hicann;
          break;
        };
      };
      return(westernHicann ? westernHicann.index : undefined);
    }
  };
}