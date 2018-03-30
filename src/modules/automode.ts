/// <reference path="overview.ts" />
/// <reference path="detailview.ts" />

/**
 * The namespace contains a number of classes that each have their separate purposes but have dependencies on each other.
 * They are written into separate files to keep a clear structure.
 */
namespace internalModule {
	/**
	 * The AutoMode controls automatically what details of which HICANN are displayed,
	 * depending on the zoom level as well as the part of the wafer that is currently within in the canvas boundaries.
	 */
	export class Automode{
		constructor(overview: internalModule.Overview, detailview: internalModule.Detailview) {
			this.enabled = undefined;
			this.overview = overview;
			this.detailview = detailview;
			this.wafer = overview.wafer;
			this.options = {
				synapses: true,
				leftBuses: true,
				rightBuses: true,
				horizontalBuses: true,
			}
			this.detailedHicanns = [];
		}
		/**
		 * Set this property when entering or leaving the auto mode.
		 */
		enabled: boolean;
		overview: internalModule.Overview;
		detailview: internalModule.Detailview;
		wafer: internalModule.Wafer;
		options: {
			synapses: boolean;
			leftBuses: boolean;
			rightBuses: boolean;
			horizontalBuses: boolean;
		};
		/**
		 * contains the indices of all HICANNs that are displayed in detail.
		 */
		detailedHicanns: number[];

		/**
		 * Initialization of the auto mode. Call this method when entering auto mode.
		 * @param hicannIndex The index/coordinate of the HICANN, whose details should be shown.
		 * @param levelOneEnabled Set to true if the automode should start in detailview.
		 * @param levelTwoEnabled Set to true if the auomode should start in detailviewLevelTwo.
		 */
		init(hicannIndex: number, levelOneEnabled: boolean, levelTwoEnabled: boolean) {
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
			};
			if (levelTwoEnabled) {
				this.startDetailviewLevelTwo(hicannIndex);
			};
			// render stage
			pixiBackend.renderer.render();
		}

		/**
		 * Potentially leave a detailview and start the overview.
		 * @param hicannIndex Index of the HICANN, whose detailview is left.
		 */
		startOverview(hicannIndex: number) {
			// reset detailview
			this.detailview.resetDetailview();
			// set parameters in detailview
			this.detailview.enabled = false;
			this.detailview.levelTwoEnabled = false;
			this.detailview.currentHicann = undefined;
			// display overview
			// hide level one details
			for (const hicannIndex of this.detailedHicanns) {
				this.setOverview(hicannIndex, true);
				this.setDetailview(hicannIndex, false);
			}
			// hide level two details
			this.setDetailviewLevelTwo(false);
		}

		/**
		 * Start the detailview for a specified HICANN.
		 * The Detailview can be entered coming either form the overview or the detailviewLevelTwo.
		 */
		startDetailview(hicannIndex: number) {
			// check if coming from detailview level two
			if (!this.detailview.enabled) {
				this.getDetailedHicanns(hicannIndex);
				// draw detail objects i.e.
				//   synapse array level one and level two
				//	 buses level two
				for (const hicannIndex of this.detailedHicanns) {
					this.detailview.drawHicann(hicannIndex);
				};
			}
			// display level one detailview
			// hide overview containers
			for (const hicannIndex of this.detailedHicanns) {
				this.setDetailview(hicannIndex, true);
				this.setOverview(hicannIndex, false);
			}
			// hide level two details
			this.setDetailviewLevelTwo(false);
			// set parameters in detailview
			this.detailview.enabled = true;
			this.detailview.levelTwoEnabled = false;
			this.detailview.currentHicann = hicannIndex;
			this.detailview.updateSurroundingHicanns();
		}

		/**
		 * Start the detailview level two (graphics objects instead of sprites).
		 * Call this function only if currently in detailview.
		 */
		startDetailviewLevelTwo(hicannIndex: number) {
			// set parameter in detailview
			this.detailview.levelTwoEnabled = true;
			// hide the sprites from detailview level one
			for (const hicannIndex of this.detailedHicanns) {
				this.setDetailview(hicannIndex, false);
			}
			// display graphicsobject details from detailview level two
			this.setDetailviewLevelTwo(true);
		}

		/**
		 * Switch to detailview of the western HICANN.
		 */
		startWesternHicann(hicannIndex: number) {
			let levelTwoEnabled = this.detailview.levelTwoEnabled;
			// end detailview of old hicann
			this.startOverview(hicannIndex);
			// start detailview of new hicann
			this.startDetailview(this.detailview.westernHicann);
			// if level two was enabled before, start level two on new hicann
			if (levelTwoEnabled) {
				this.startDetailviewLevelTwo(this.detailview.currentHicann);
			};
		}

		/**
		 * Switch to detailview of the eastern HICANN.
		 */
		startEasternHicann(hicannIndex: number) {
			let levelTwoEnabled = this.detailview.levelTwoEnabled;
			// end detailview of old hicann
			this.startOverview(hicannIndex);
			// start detailview of new hicann
			this.startDetailview(this.detailview.easternHicann);
			// if level two was enabled before, start level two on new hicann
			if (levelTwoEnabled) {
				this.startDetailviewLevelTwo(this.detailview.currentHicann);
			};
		}

		/**
		 * Switch to detailview of the northern HICANN.
		 */
		startNorthernHicann(hicannIndex: number) {
			let levelTwoEnabled = this.detailview.levelTwoEnabled;
			// end detailview of old hicann
			this.startOverview(hicannIndex);
			this.startDetailview(this.detailview.northernHicann);
			// if level two was enabled before, start level two on new hicann
			if (levelTwoEnabled) {
				this.startDetailviewLevelTwo(this.detailview.currentHicann);
				// start detailview of new hicann
			};
		}

		/**
		 * Switch to detailview of the sourthern HICANN.
		 */
		startSouthernHicann(hicannIndex: number) {
			let levelTwoEnabled = this.detailview.levelTwoEnabled;
			// end detailview of old hicann
			this.startOverview(hicannIndex);
			// start detailview of new hicann
			this.startDetailview(this.detailview.southernHicann);
			// if level two was enabled before, start level two on new hicann
			if (levelTwoEnabled) {
				this.startDetailviewLevelTwo(this.detailview.currentHicann);
			};
		}

		/**
		 * Set visible properties for the overview elements of a HICANN.
		 * @param hicannIndex HICANN to be set.
		 * @param enabled pass true for visible and false for hidden.
		 */
		setOverview(hicannIndex: number, enabled: boolean) {
			this.overview.hicannNumber.setVisible(enabled);
			this.overview.hicannNumber.updateCheckbox();
			pixiBackend.container.backgrounds.children[hicannIndex].visible = enabled;
			pixiBackend.container.inputs.children[hicannIndex].visible = enabled;
			pixiBackend.container.overviewBusesLeft.children[hicannIndex].visible = enabled;
			pixiBackend.container.overviewBusesRight.children[hicannIndex].visible = enabled;
			pixiBackend.container.overviewBusesHorizontal.children[hicannIndex].visible = enabled;
		}

		/**
		 * Set visible properties for the detailview elements of a HICANN.
		 * @param hicannIndex HICANN to be set.
		 * @param enabled pass true for visible and false for hidden.
		 */
		setDetailview(hicannIndex: number, enabled: boolean) {
			pixiBackend.container.synapsesOneSprite.visible = this.options.synapses ? enabled : false;
			pixiBackend.container.synapsesTwoSprite.visible = this.options.synapses ? enabled : false;
			pixiBackend.container.busesLeftSprite.children[hicannIndex].visible = this.options.leftBuses ? enabled : false;
			pixiBackend.container.busesRightSprite.children[hicannIndex].visible = this.options.rightBuses ? enabled : false;
			pixiBackend.container.busesHorizontalSprite.children[hicannIndex].visible = this.options.horizontalBuses ? enabled : false;
		}

		/**
		 * Set visible properties for the detailviewLevelTwo elements of a HICANN.
		 * @param hicannIndex HICANN to be set.
		 * @param enabled pass true for visible and false for hidden.
		 */
		setDetailviewLevelTwo(enabled: boolean) {
			pixiBackend.container.synapsesOne.visible = this.options.synapses ? enabled : false;
			pixiBackend.container.synapsesTwo.visible = this.options.synapses ? enabled : false;
			pixiBackend.container.busesLeft.visible = this.options.leftBuses ? enabled : false;
			pixiBackend.container.busesRight.visible = this.options.rightBuses ? enabled : false;
			pixiBackend.container.busesHorizontal.visible = this.options.horizontalBuses ? enabled : false;
		}

		/**
		 * Find the eigth surrounding HICANNs of a HICANN (if existing).
		 */
		getDetailedHicanns(hicannIndex: number) {
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
		}
	}
}