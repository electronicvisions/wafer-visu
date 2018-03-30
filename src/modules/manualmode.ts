/// <reference path="detailview.ts" />
/// <reference path="overview.ts" />

/**
 * The namespace contains a number of classes that each have their separate purposes but have dependencies on each other.
 * They are written into separate files to keep a clear structure.
 */
namespace internalModule {
	/**
	 * The manual mode aims at giving the user full control over what details to show for which HICANN.
	 * Clicking checkboxes in the UI sets the visible property for the respective pixiJS containers.
	 * Switching between detailview and detailviewLevelTwo (sprites vs. graphics objects) is still done automatically.
	 */
	export class Manualmode {
		constructor(overview: internalModule.Overview, detailview: internalModule.Detailview) {
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
			}

			this.containerIndices = {
				left: [],
				right: [],
				horizontal: []
			}
			// initialize selected Elements with standard overview values
			for (let i=this.wafer.enumMin; i<=this.wafer.enumMax; i++) {
				this.selectedElements.overview.numNeurons.push(true);
				this.selectedElements.overview.numInputs.push(true);
				this.selectedElements.overview.left.push(true);
				this.selectedElements.overview.right.push(true);
				this.selectedElements.overview.horizontal.push(true);
				
				this.selectedElements.detailview.left.push(false);
				this.selectedElements.detailview.right.push(false);
				this.selectedElements.detailview.horizontal.push(false);
			}
		};

		enabled: boolean;

		detailview: internalModule.Detailview;

		overview: internalModule.Overview;

		wafer: internalModule.Wafer;

		/**
		 * Store which elements are checked (i.e. visible) as boolean values for all elements.
		 * For example: if selectedElements.overview.left[5] is "true", 
		 * then the left buses in overview representation for the 5th HICANN are visible.
		 */
		selectedElements: {
			overview: {
				numNeurons: boolean[],
				numInputs: boolean[],
				left: boolean[],
				right: boolean[],
				horizontal: boolean[]
			},
			detailview: {
				left: boolean[],
				right: boolean[],
				horizontal: boolean[]
			}
		};

		/**
		 * Store the HICANN indices for the bus-segments that are drawn as graphics objects (in detailviewLevelTwo)
		 * in the order in that they are first drawn. This is necessary to be able to delete those bus-segments again later.
		 * If not all bus-segments are drawn, the left bus-segment of the 5th HICANN, for example, will in general not be at fifth place in the respective container.
		 */
		containerIndices: {
			left: number[],
			right: number[],
			horizontal: number[]
		};

		/**
		 * Initialize the manual mode. Call this method when starting the manual mode.
		 * @param levelOneEnabled Set to true if the manual mode is started in detailview.
		 * @param levelTwoEnabled Set to true if the manual mode is started in detailviewLevelTwo.
		 */
		init(levelOneEnabled: boolean, levelTwoEnabled: boolean) {
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
			if(levelOneEnabled) {
				this.startDetailview();
			};
			if (levelTwoEnabled) {
				this.startDetailviewLevelTwo();
			};
			// render stage
			pixiBackend.renderer.render();
		}

		/**
		 * Reset all elements to a plain "overview".
		 * Call this method when switching to automode.
		 */
		resetView() {
			// reset detail Levels
			if (this.detailview.levelTwoEnabled) {
				this.leaveDetailviewLevelTwo();
			};
			if (this.detailview.enabled) {
				this.leaveDetailview();
			};
			// hide detailview and show overview
			this.setDetailview(false, false);
			this.setOverview(true, true);
		}

		/**
		 * Start the detailview. Only hides the HICANN number, because the rest is managed manually.
		 */
		startDetailview() {
			this.overview.hicannNumber.setVisible(false);
			this.overview.hicannNumber.updateCheckbox();
			this.detailview.enabled = true;
		}

		/**
		 * Leave the detailview.
		 */
		leaveDetailview() {
			this.overview.hicannNumber.setVisible(true);
			this.overview.hicannNumber.updateCheckbox();
			this.detailview.enabled = false;
		}

		/**
		 * Start the DetailviewLevelTwo to switch from sprites to graphics objects.
		 */
		startDetailviewLevelTwo() {
			// set detailview property
			this.detailview.levelTwoEnabled = true;

			// set container properties
			this.setDetailviewLevelTwo(true);
			
			// loop through detailed buses and switch from sprites to graphics object
			for (let i=this.wafer.enumMin; i<=this.wafer.enumMax; i++) {
				let hicannPosition = this.wafer.hicanns[i].position;

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
		}

		/**
		 * Leave the detailviewLevelTwo to switch from graphics objects back to sprites.
		 */
		leaveDetailviewLevelTwo() {
			// set detailview property
			this.detailview.levelTwoEnabled = false;

			// set container properties
			this.setDetailviewLevelTwo(false);

			// loop through detailed buses and switch from graphics object to sprites
			for (let i=this.wafer.enumMin; i<=this.wafer.enumMax; i++) {
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
		}

		/**
		 * Set the visible properties for all elements of the overview.
		 * @param viewChecked Set to true if checked (in UI checkbox) elements should be set.
		 * @param viewUnchecked Set to true if unchecked (in UI checkbox) elements should be set.
		 */
		setOverview(viewChecked: boolean, viewUnchecked: boolean) {
			// loop through detailed Buses and hide/display checked ones
			for (let i=this.wafer.enumMin; i<=this.wafer.enumMax; i++) {

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
		}

		/**
		 * Set the visible properties for all elements of the detailview.
		 * @param viewChecked Set to true if checked (in UI checkbox) elements should be set.
		 * @param viewUnchecked Set to true if unchecked (in UI checkbox) elements should be set.
		 */
		setDetailview(viewChecked: boolean, viewUnchecked: boolean) {
			// loop through detailed Buses and hide/display checked ones
			for (let i=this.wafer.enumMin; i<=this.wafer.enumMax; i++) {

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
		}

		/**
		 * Set the visible properties for all elements of the detailviewLevelTwo.
		 */
		setDetailviewLevelTwo(enabled: boolean) {
			pixiBackend.container.synapsesOne.visible = enabled;
			pixiBackend.container.synapsesTwo.visible = enabled;
			pixiBackend.container.busesLeft.visible = enabled;
			pixiBackend.container.busesRight.visible = enabled;
			pixiBackend.container.busesHorizontal.visible = enabled;
		}

		/**
		 * Handle clicking the checkbox for a vertical left buses of a HICANN in the HICANN list.
		 * If checked, the graphics elements for that bus are drawn, if unchecked the graphics element removed.
		 */
		busesLeft(hicannIndex: number, checked: boolean) {
			if (checked) {
				if (this.detailview.levelTwoEnabled) {
					// draw graphics element and store container.children index
					this.detailview.drawBusesLeft(this.wafer.hicanns[hicannIndex].position);
					this.containerIndices.left.push(hicannIndex);
				} else {
					// set pixiJS container visible property
					pixiBackend.container.busesLeftSprite.children[hicannIndex].visible = true;
				}
				// update selected Elements list
				this.selectedElements.detailview.left[hicannIndex] = true;
			} else {
				if (this.detailview.levelTwoEnabled) {
					// remove graphics element
					const containerIndex = this.containerIndices.left.indexOf(hicannIndex);
					pixiBackend.removeChild(pixiBackend.container.busesLeft, containerIndex);
					this.containerIndices.left.splice(containerIndex, 1);
				} else {
					// set pixiJS container visible property
					pixiBackend.container.busesLeftSprite.children[hicannIndex].visible = false;
				}
				// update selected Elements list
				this.selectedElements.detailview.left[hicannIndex] = false;
			}
		}

		/**
		 * Handle clicking the checkbox for a vertical right buses of a HICANN in the HICANN list.
		 * If checked, the graphics elements for that bus are drawn, if unchecked the graphics element removed.
		 */
		busesRight(hicannIndex: number, checked: boolean) {
			if (checked) {
				if (this.detailview.levelTwoEnabled) {
					// draw graphics element and store container.children index
					this.detailview.drawBusesRight(this.wafer.hicanns[hicannIndex].position);
					this.containerIndices.right.push(hicannIndex);
				} else {
					// set pixiJS container visible property
					pixiBackend.container.busesRightSprite.children[hicannIndex].visible = true;
				}
				// update selected Elements list
				this.selectedElements.detailview.right[hicannIndex] = true;
			} else {
				if (this.detailview.levelTwoEnabled) {
					// remove graphics element
					const containerIndex = this.containerIndices.right.indexOf(hicannIndex);
					pixiBackend.removeChild(pixiBackend.container.busesRight, containerIndex);
					this.containerIndices.right.splice(containerIndex, 1);
				} else {
					// set pixiJS container visible property
					pixiBackend.container.busesRightSprite.children[hicannIndex].visible = false;
				}
				// update selected Elements list
				this.selectedElements.detailview.right[hicannIndex] = false;
			}
		}

		/**
		 * Handle clicking the checkbox for a horizontal buses of a HICANN in the HICANN list.
		 * If checked, the graphics elements for that bus are drawn, if unchecked the graphics element removed.
		 */
		busesHorizontal(hicannIndex: number, checked: boolean) {
			if (checked) {
				if (this.detailview.levelTwoEnabled) {
					// draw graphics element and store container.children index
					this.detailview.drawBusesHorizontal(this.wafer.hicanns[hicannIndex].position);
					this.containerIndices.horizontal.push(hicannIndex);
				} else {
					// set pixiJS container visible property
					pixiBackend.container.busesHorizontalSprite.children[hicannIndex].visible = true;
				}
				// update selected Elements list
				this.selectedElements.detailview.horizontal[hicannIndex] = true;
			} else {
				if (this.detailview.levelTwoEnabled) {
					// remove graphics element
					const containerIndex = this.containerIndices.horizontal.indexOf(hicannIndex);
					pixiBackend.removeChild(pixiBackend.container.busesHorizontal, containerIndex);
					this.containerIndices.horizontal.splice(containerIndex, 1);
				} else {
					// set pixiJS container visible property
					pixiBackend.container.busesHorizontalSprite.children[hicannIndex].visible = false;
				}
				// update selected Elements list
				this.selectedElements.detailview.horizontal[hicannIndex] = false;
			}
		}

		/**
		 * synchronize the checkboxes in the HICANN list when the all elements of one type are drawn at once.
		 * @param element type of the element. "numNeurons" for example are are the colored HICANN backgrounds of the overview.
		 */
		checkAllCheckboxes(element: "numNeurons" | "numInputs" | "left" | "right" | "horizontal" | "detailLeft" | "detailRight" | "detailHorizontal") {
			let allElementsSelected = true;
			switch (element) {
				case "numNeurons":
					for (let i=0; i<this.selectedElements.overview.numNeurons.length; i++) {
						if (this.selectedElements.overview.numNeurons[i] === false) {
							allElementsSelected = false;
							break;
						};
					};
					if (allElementsSelected) {
						$("#numNeuronsCheckbox").prop("checked", true);
					} else {
						$("#numNeuronsCheckbox").prop("checked", false);
					}
					break;
				case "numInputs":
					for (let i=0; i<this.selectedElements.overview.numInputs.length; i++) {
						if (this.selectedElements.overview.numInputs[i] === false) {
							allElementsSelected = false;
							break;
						};
					};
					if (allElementsSelected) {
						$("#numInputsCheckbox").prop("checked", true);
					} else {
						$("#numInputsCheckbox").prop("checked", false);
					}
					break;
				case "left":
					for (let i=0; i<this.selectedElements.overview.left.length; i++) {
						if (this.selectedElements.overview.left[i] === false) {
							allElementsSelected = false;
							break;
						};
					};
					if (allElementsSelected) {
						$("#verticalLeftCheckbox").prop("checked", true);
					} else {
						$("#verticalLeftCheckbox").prop("checked", false);
					}
					break;
				case "right":
					for (let i=0; i<this.selectedElements.overview.right.length; i++) {
						if (this.selectedElements.overview.right[i] === false) {
							allElementsSelected = false;
							break;
						};
					};
					if (allElementsSelected) {
						$("#verticalRightCheckbox").prop("checked", true);
					} else {
						$("#verticalRightCheckbox").prop("checked", false);
					}
					break;
				case "horizontal":
					for (let i=0; i<this.selectedElements.overview.horizontal.length; i++) {
						if (this.selectedElements.overview.horizontal[i] === false) {
							allElementsSelected = false;
							break;
						};
					};
					if (allElementsSelected) {
						$("#horizontalCheckbox").prop("checked", true);
					} else {
						$("#horizontalCheckbox").prop("checked", false);
					}
					break;
				case "detailLeft":
					for (let i=0; i<this.selectedElements.detailview.left.length; i++) {
						if (this.selectedElements.detailview.left[i] === false) {
							allElementsSelected = false;
							break;
						};
					};
					if (allElementsSelected) {
						$("#verticalLeftDetailsCheckbox").prop("checked", true);
					} else {
						$("#verticalLeftDetailsCheckbox").prop("checked", false);
					}
					break;
				case "detailRight":
					for (let i=0; i<this.selectedElements.detailview.right.length; i++) {
						if (this.selectedElements.detailview.right[i] === false) {
							allElementsSelected = false;
							break;
						};
					};
					if (allElementsSelected) {
						$("#verticalRightDetailsCheckbox").prop("checked", true);
					} else {
						$("#verticalRightDetailsCheckbox").prop("checked", false);
					}
					break;
				case "detailHorizontal":
					for (let i=0; i<this.selectedElements.detailview.horizontal.length; i++) {
						if (this.selectedElements.detailview.horizontal[i] === false) {
							allElementsSelected = false;
							break;
						};
					};
					if (allElementsSelected) {
						$("#horizontalDetailsCheckbox").prop("checked", true);
					} else {
						$("#horizontalDetailsCheckbox").prop("checked", false);
					}
					break;
			};
		}

		/**
		 * Update the selectedElements list and the UI checkboxes in the HICANN list when all elements of one type are set at once.
		 * @param element type of the element. "numNeurons" for example are are the colored HICANN backgrounds of the overview.
		 */
		setAllCheckboxes(element: "numNeurons" | "numInputs" | "left" | "right" | "horizontal" | "detailLeft" | "detailRight" | "detailHorizontal", checked: boolean) {
			switch (element) {
				case "numNeurons":
					for (let i=0; i<this.selectedElements.overview.numNeurons.length; i++) {
						this.selectedElements.overview.numNeurons[i] = checked;
						$(`#element_0_${i}_0_0`).prop("checked", checked)
					};
					break;
				case "numInputs":
					for (let i=0; i<this.selectedElements.overview.numInputs.length; i++) {
						this.selectedElements.overview.numInputs[i] = checked;
						$(`#element_0_${i}_0_1`).prop("checked", checked)
					};
					break;
				case "left":
					for (let i=0; i<this.selectedElements.overview.left.length; i++) {
						this.selectedElements.overview.left[i] = checked;
						$(`#element_0_${i}_0_2`).prop("checked", checked)
					};
					break;
				case "right":
					for (let i=0; i<this.selectedElements.overview.right.length; i++) {
						this.selectedElements.overview.right[i] = checked;
						$(`#element_0_${i}_0_3`).prop("checked", checked)
					};
					break;
				case "horizontal":
					for (let i=0; i<this.selectedElements.overview.horizontal.length; i++) {
						this.selectedElements.overview.horizontal[i] = checked;
						$(`#element_0_${i}_0_4`).prop("checked", checked)
					};
					break;
				case "detailLeft":
					for (let i=0; i<this.selectedElements.detailview.left.length; i++) {
						this.selectedElements.detailview.left[i] = checked;
						$(`#element_0_${i}_1_0`).prop("checked", checked)
					};
					break;
				case "detailRight":
					for (let i=0; i<this.selectedElements.detailview.right.length; i++) {
						this.selectedElements.detailview.right[i] = checked;
						$(`#element_0_${i}_1_1`).prop("checked", checked)
					};
					break;
				case "detailHorizontal":
					for (let i=0; i<this.selectedElements.detailview.horizontal.length; i++) {
						this.selectedElements.detailview.horizontal[i] = checked;
						$(`#element_0_${i}_1_2`).prop("checked", checked)
					};
					break;
			};
		}

	}
}