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
const devMode = false;
let mouseIsDown = false;
let mousePosition = {
	x: <number>undefined,
	y: <number>undefined
};
let mouseDownPosition = {
		x: <number>undefined,
		y: <number>undefined
};
/**
 * Pixels between HICANNs in visualization
 */
const margin = 0;
/**
 * HICANN width in visualization
 */
const hicannWidth = 100;
/**
 * HICANN height in visualization
 */
let hicannHeight = 200;
/**
 * Height of triangle that represents HICANN inputs in visualization
 */
const triangleHeight = 40;
/**
 * Bus width in visualization
 */
const busWidth = 10;
/**
 * HICANN property gradient color
 */
const numNeuronsColorOne = "ffffff";
/**
 * HICANN property gradient color
 */
let numNeuronsColorTwo = "003366";
/**
 * HICANN property gradient color
 */
const numInputsColorOne = numNeuronsColorOne;
/**
 * HICANN property gradient color
 */
let numInputsColorTwo = "ff9900";
/**
 * HICANN property gradient color
 */
const numRoutesLeftColorOne = numNeuronsColorOne;
/**
 * HICANN property gradient color
 */
let numRoutesLeftColorTwo = "00cc00";
/**
 * HICANN property gradient color
 */
const numRoutesRightColorOne = numNeuronsColorOne;
/**
 * HICANN property gradient color
 */
let numRoutesRightColorTwo = "00cc00";
/**
 * HICANN property gradient color
 */
const numRoutesHorizontalColorOne = numNeuronsColorOne;
/**
 * HICANN property gradient color
 */
let numRoutesHorizontalColorTwo = "00cc00";
let domObjects: {[key: string]: any} = {};
const properties = [
	"neurons",
	"inputs",
	"leftBuses",
	"rightBuses",
	"horizontalBuses",
];
let wafer: internalModule.Wafer;
let overview: internalModule.Overview;
let detailview: internalModule.Detailview;
let routesOnStage: internalModule.RoutesOnStage;
let reticlesOnStage: internalModule.ReticlesOnStage;
let automode: internalModule.Automode;
let manualmode: internalModule.Manualmode;

const canvasWidth = function() {
	return($(window).width());
};
const canvasHeight = function() {
	return($(window).height());
};
const canvasCenter = function() {
	return({
		x: $("#leftInfoBox").outerWidth(true) + (canvasWidth() - domObjects.rightInfoBox[0].offsetWidth - $("#leftInfoBox").outerWidth())/2,
		y: canvasHeight()/2,
	})
};
	
// wait for DOM to load
$(document).ready(setupScreen)

/**
 * When the software is started, a setup screen allows to upload a network configuration xml file.
 * After loading the file into emscriptens virtual file system, "main" is started.
 */
function setupScreen(){
	// wait for emscripten to finish building
	Module.onRuntimeInitialized = function() {
	console.log("emscripten ready");
	
	//upload xml network file
	let inputFile = undefined;
	// upload via filebrowser
	let fileBrowser: HTMLInputElement = document.querySelector("#networkFile");
	fileBrowser.addEventListener("change", function(event) {
		inputFile = fileBrowser.files[0];
		$("#fileLabel").html(inputFile.name);
		$("#fileLabel").css("color", "#99ff99");
	}, false);
	// upload via drag-n-drop
	let dropZone = document.querySelector("#dropZone");
	dropZone.addEventListener("drop", function(e: DragEvent){
		let event: DragEvent = e || <DragEvent>window.event; //Firefox
		event.preventDefault();
		if(event.dataTransfer.files.length > 1) {
			alert("Please select only one file!")
		} else {
			inputFile = event.dataTransfer.files[0]
			$("#fileLabel").html(inputFile.name);
			$("#fileLabel").css("color", "#99ff99");
		}
	})
	dropZone.addEventListener("dragover", (e: DragEvent) => {
		let event: DragEvent = e || <DragEvent>window.event;
		event.preventDefault();
	})
	// visual effects
	dropZone.addEventListener("dragenter", () => {$("#dropZone").css("border", "2px solid #65c4fa")})
	dropZone.addEventListener("dragleave", () => {$("#dropZone").css("border", "none")})
	dropZone.addEventListener("drop", () => {$("#dropZone").css("border", "none")})
	
	// handle upload Button
	let uploadButton = document.querySelector("#upload");
	uploadButton.addEventListener("click", function() {
		if(inputFile === undefined) {
			alert("no file selected")
		} else { // process file
			let filereader = new FileReader();
			// event handler for data loaded with filereader
			filereader.onload = function(event) {
				let target: any = event.target;
				let contents = target.result;
				// write file into emscriptens virtual file system (FS)
				FS.writeFile("./network.xml", contents);
				// remove upload screen and display loading screen
				$("#uploadScreen").css("display", "none");
				$("#loadingScreen").css("display", "block");
				// start main program
				setTimeout(main, 100);
			};
			filereader.onerror = function(event) {
				console.error(`File could not be read! Code $event.target.error.code`);
			};
			// read the contents of inputFile and fire onload event
			filereader.readAsText(inputFile);
		}
	})

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

	}//module.onRuntimeInitialized
}//setupScreen
/**
 * The main function runs the core visualization program.
 * Instances of all the classes needed for the visualization are created and event handlers defined.
 */
function main() {
	///////////////////////////
	
	// FPS, RAM Stats
	const stats = new Stats();
	stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
	stats.dom.style.position = "relative"
	stats.dom.style.marginLeft = "20px"
	
	document.querySelector("#visuWindow").appendChild( stats.dom );
	
	function animate() {
	
		stats.begin();
		stats.end();
	
		requestAnimationFrame( animate );
	
	}
	
	requestAnimationFrame( animate );
	
	///////////////////////////
	
	console.log(`WebGL is${!PIXI.utils.isWebGLSupported ? " not": ""} supported by this browser.`);
	
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

	overview = new internalModule.Overview(
		wafer,
		{
			hicannWidth: hicannWidth,
			hicannHeight: hicannHeight,
			margin: margin,
			triangleHeight: triangleHeight,
			busWidth: busWidth
		},
		{
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
		}
		);

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
	(() => {
		const transform: any = pixiBackend.container.stage.transform;
		routesOnStage.zoomLevels.current = routesOnStage.currentZoomLevel(transform.scale.x);
	})()

	// draw routes
	routesOnStage.drawRoutes();
	
	// hide routes
	for (const route of routesOnStage.routes) {
		routesOnStage.setRoute(route, false);
	}

	reticlesOnStage = new internalModule.ReticlesOnStage(overview, pixiBackend.container.reticles);

	// threshold where the lookup plot is made visible
	reticlesOnStage.threshold = fullWaferScale() * 2/3;

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
	$(window).keydown( e => {
		let event = e || window.event;
		handleKeyDown(event);
	} );
	$("#visuWindow").mousedown( e => {
		let event = e || window.event;
		handleMouseDown(event);
	} );
	$("#visuWindow").mouseup( e => {
		let event = e || window.event;
		handleMouseUp(event);
	} );
	$("#visuWindow").mousemove( e => {
		let event = e || window.event;
		handleMouseMove(event)
	} );
	$("#visuWindow").mouseout( e => {
		let event = e || window.event;
		mouseIsDown = false;
	} );
	$("#visuWindow").dblclick( e => {
		let event: any = e || window.event;
		routesOnStage.handleVisuDoubleClick(event.clientX, event.clientY);
	})
	window.addEventListener("wheel", e => {
		let event = e || window.event;
		handleWheel(event);
	} );
	
	$("#numberTextCheckbox").change( e => {
		let event = e || window.event;
		if ((event.target as HTMLInputElement).checked) {
			overview.hicannNumber.alwaysHidden = false;
			overview.hicannNumber.setVisible(true);
		} else {
			overview.hicannNumber.setVisible(false);
			overview.hicannNumber.alwaysHidden = true;
		};
		pixiBackend.renderer.render();
	})

	$("#waferImageCheckbox").change( e => {
		let event = e || window.event;
		if ((event.target as HTMLInputElement).checked) {
			overview.waferImage.setVisible(true);
		} else {
			overview.waferImage.setVisible(false);
		};
		pixiBackend.renderer.render();
	})

	$("#reticlesCheckbox").change( e => {
		let event = e || window.event;
		if ((event.target as HTMLInputElement).checked) {
			reticlesOnStage.setReticles(true);
		} else {
			reticlesOnStage.setReticles(false);
		};
		pixiBackend.renderer.render();
	})
	
	$("#numNeuronsCheckbox").change( e => {
		let event = e || window.event;
		if ((event.target as HTMLInputElement).checked) {
			manualmode.setAllCheckboxes("numNeurons", true);
			for (let index=0; index<=wafer.enumMax; index++) {
				pixiBackend.container.backgrounds.children[index].visible = true;
			};
			pixiBackend.renderer.render();
		} else {
			manualmode.setAllCheckboxes("numNeurons", false);
			for (let index=0; index<=wafer.enumMax; index++) {
				pixiBackend.container.backgrounds.children[index].visible = false;
			};
			pixiBackend.renderer.render();
		};
	})
	
	$("#numInputsCheckbox").change( e => {
		let event = e || window.event;
		if ((event.target as HTMLInputElement).checked) {
			for (let index=0; index<=wafer.enumMax; index++) {
				manualmode.setAllCheckboxes("numInputs", true);
				pixiBackend.container.inputs.children[index].visible = true;
			};
			pixiBackend.renderer.render();
		} else {
			for (let index=0; index<=wafer.enumMax; index++) {
				manualmode.setAllCheckboxes("numInputs", false);
				pixiBackend.container.inputs.children[index].visible = false;
			};
			pixiBackend.renderer.render();
		};
	})
	
	$("#verticalLeftCheckbox").change( e => {
		let event = e || window.event;
		if ((event.target as HTMLInputElement).checked) {
			for (let index=0; index<=wafer.enumMax; index++) {
				manualmode.setAllCheckboxes("left", true);
				pixiBackend.container.overviewBusesLeft.children[index].visible = true;
			};
			pixiBackend.renderer.render();
		} else {
			for (let index=0; index<=wafer.enumMax; index++) {
				manualmode.setAllCheckboxes("left", false);
				pixiBackend.container.overviewBusesLeft.children[index].visible = false;
			};
			pixiBackend.renderer.render();
		};
	})
	
	$("#verticalRightCheckbox").change( e => {
		let event = e || window.event;
		if ((event.target as HTMLInputElement).checked) {
			for (let index=0; index<=wafer.enumMax; index++) {
				manualmode.setAllCheckboxes("right", true);
				pixiBackend.container.overviewBusesRight.children[index].visible = true;
			};
			pixiBackend.renderer.render();
		} else {
			for (let index=0; index<=wafer.enumMax; index++) {
				manualmode.setAllCheckboxes("right", false);
				pixiBackend.container.overviewBusesRight.children[index].visible = false;
			};
			pixiBackend.renderer.render();
		};
	})
	
	$("#horizontalCheckbox").change( e => {
		let event = e || window.event;
		if ((event.target as HTMLInputElement).checked) {
			for (let index=0; index<=wafer.enumMax; index++) {
				manualmode.setAllCheckboxes("horizontal", true);
				pixiBackend.container.overviewBusesHorizontal.children[index].visible = true;
			};
			pixiBackend.renderer.render();
		} else {
			for (let index=0; index<=wafer.enumMax; index++) {
				manualmode.setAllCheckboxes("horizontal", false);
				pixiBackend.container.overviewBusesHorizontal.children[index].visible = false;
			};
			pixiBackend.renderer.render();
		};
	})
	
	$("#verticalLeftDetailsCheckbox").change( e => {
		let event = e || window.event;
		if ((event.target as HTMLInputElement).checked) {
			for (let index=0; index<=wafer.enumMax; index++) {
				manualmode.setAllCheckboxes("detailLeft", true);
				pixiBackend.container.busesLeftSprite.children[index].visible = true;
			};
			pixiBackend.renderer.render();
		} else {
			for (let index=0; index<=wafer.enumMax; index++) {
				manualmode.setAllCheckboxes("detailLeft", false);
				pixiBackend.container.busesLeftSprite.children[index].visible = false;
			};
			pixiBackend.renderer.render();
		};
	})
	
	$("#verticalRightDetailsCheckbox").change( e => {
		let event = e || window.event;
		if ((event.target as HTMLInputElement).checked) {
			for (let index=0; index<=wafer.enumMax; index++) {
				manualmode.setAllCheckboxes("detailRight", true);
				pixiBackend.container.busesRightSprite.children[index].visible = true;
			};
			pixiBackend.renderer.render();
		} else {
			for (let index=0; index<=wafer.enumMax; index++) {
				manualmode.setAllCheckboxes("detailRight", false);
				pixiBackend.container.busesRightSprite.children[index].visible = false;
			};
			pixiBackend.renderer.render();
		};
	})
	
	$("#horizontalDetailsCheckbox").change( e => {
		let event = e || window.event;
		if ((event.target as HTMLInputElement).checked) {
			for (let index=0; index<=wafer.enumMax; index++) {
				manualmode.setAllCheckboxes("detailHorizontal", true);
				pixiBackend.container.busesHorizontalSprite.children[index].visible = true;
			};
			pixiBackend.renderer.render();
		} else {
			for (let index=0; index<=wafer.enumMax; index++) {
				manualmode.setAllCheckboxes("detailHorizontal", false);
				pixiBackend.container.busesHorizontalSprite.children[index].visible = false;
			};
			pixiBackend.renderer.render();
		};
	})
	
	$("#autoSynapsesCheckbox").change( () => {
		let checked = (document.querySelector("#autoSynapsesCheckbox") as HTMLInputElement).checked
		if (checked) {
			automode.options.synapses = true;
		} else {
			automode.options.synapses = false;
		};
	})
	
	$("#autoLeftCheckbox").change( () => {
		let checked = (document.querySelector("#autoLeftCheckbox") as HTMLInputElement).checked
		if (checked) {
			automode.options.leftBuses = true;
		} else {
			automode.options.leftBuses = false;
		};
	})
	
	$("#autoRightCheckbox").change( () => {
		let checked = (document.querySelector("#autoRightCheckbox") as HTMLInputElement).checked
		if (checked) {
			automode.options.rightBuses = true;
		} else {
			automode.options.rightBuses = false;
		};
	})
	
	$("#autoHorizontalCheckbox").change( () => {
		let checked = (document.querySelector("#autoHorizontalCheckbox") as HTMLInputElement).checked
		if (checked) {
			automode.options.horizontalBuses = true;
		} else {
			automode.options.horizontalBuses = false;
		};
	})
	
	$("#automode").click( () => {
		if (!automode.enabled) {
			// store detail Level
			let levelOneEnabled = detailview.enabled;
			let levelTwoEnabled = detailview.levelTwoEnabled;
			// determine closest hicann for auto detail view
			let hicannClosestToCenter = detailview.hicannClosestToCenter(canvasCenter());
			// reset view
			manualmode.resetView();
			// start auto Mode
			automode.init(hicannClosestToCenter, levelOneEnabled, levelTwoEnabled);
			manualmode.enabled = false;	
		}
	})

	$("#manualmode").click( () => {
		if (!manualmode.enabled) {
			// store detail Level
			let levelOneEnabled = detailview.enabled;
			let levelTwoEnabled = detailview.levelTwoEnabled;
			// reset view
			if(levelOneEnabled) {
				automode.startOverview(detailview.currentHicann);
			}
			// start manual Mode
			manualmode.init(levelOneEnabled, levelTwoEnabled);
			automode.enabled = false;
		}
	})

	// Resize Canvas, when window is rescaled;
	$(window).resize(function() {
		pixiBackend.renderer.renderer.resize(canvasWidth(), canvasHeight());
		detailview.determineThreshold(canvasHeight())
		setupJQueryUI();
		pixiBackend.renderer.render();
	})
	
} //main
/**
 * Center the wafer in middle of the canvas and adjust the zoom-scale, so the full wafer is visible.
 */
function centerWafer() {
	const scale = fullWaferScale();
	const transform: any = pixiBackend.container.stage.transform;
	transform.scale.x = scale;
	transform.scale.y = scale;

	const hicannNumber = 173
	let stagePosition = transform.position;
	let hicannPosition = wafer.hicanns[hicannNumber].position;
	const newPosition = {
		x: -(hicannPosition.x + hicannWidth/2)*transform.scale.x + canvasCenter().x,
		y: -(hicannPosition.y + hicannHeight/2)*transform.scale.y + canvasCenter().y,
	}
	stagePosition.x = newPosition.x;
	stagePosition.y = newPosition.y;

	pixiBackend.renderer.render();
}
/**
 * Calculate the scale, where the full wafer fits onto the canvas.
 */
function fullWaferScale() {
	const waferWidth = 36 * (hicannWidth + margin) * 1.3
	const waferHeight = 16 * (hicannHeight + margin) * 1.3
	return (canvasWidth()/waferWidth < canvasHeight()/waferHeight) ? canvasWidth()/waferWidth : canvasHeight()/waferHeight;
}
/**
 * If a property is zero for every HICANN, the color gradient has to be adjusted.
 */
function setHicannPropertyGradients() {
	if (wafer.hicanns === []) {
		throw(new Error("HICANN data has to be loaded into wafer class before gradients can be set."))
	}

	if (wafer.numNeuronsMax === 0) {
		numNeuronsColorTwo = numNeuronsColorOne;
	};
	if (wafer.numInputsMax === 0) {
		numInputsColorTwo = numInputsColorOne;
	};
	if (wafer.numBusesLeftMax === 0) {
		numRoutesLeftColorTwo = numRoutesLeftColorOne;
	};
	if (wafer.numBusesRightMax === 0) {
		numRoutesRightColorTwo = numRoutesRightColorOne;
	};
	if (wafer.numBusesHorizontalMax === 0) {
		numRoutesHorizontalColorTwo = numRoutesHorizontalColorOne;
	};
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
	const tree = domObjects.elementsTree[0]
	// unordered list
	const list = document.createElement("ul");
	tree.appendChild(list);
	// wafer
	// surrounding list item wafer
	const listItem = document.createElement("li");
	list.appendChild(listItem);
	// wafer checkbox
	const waferInput = document.createElement("input");
	waferInput.type = "checkbox";
	waferInput.checked = true;
	waferInput.classList.add("fork");
	waferInput.id = "element_0";
	listItem.appendChild(waferInput);
	// wafer checkbox label
	const waferInputLabel = document.createElement("label");
	waferInputLabel.htmlFor = "element_0";
	waferInputLabel.classList.add("checkboxLabel");
	listItem.appendChild(waferInputLabel);
	// wafer label
	const waferLabel = document.createElement("label");
	waferLabel.innerHTML = "Wafer";
	listItem.appendChild(waferLabel);
	// hicann list
	// hicann surrounding unordered list
	const hicannList = document.createElement("ul");
	listItem.appendChild(hicannList);
	// hicanns add list items containing buttons
	for (let i=0; i<=wafer.enumMax; i++) {
		const listItem = document.createElement("li");
		hicannList.appendChild(listItem);

		const hicannInput = document.createElement("input");
		hicannInput.type = "checkbox";
		hicannInput.checked = true;
		hicannInput.classList.add("fork");
		hicannInput.id = `element_0_${i}`;
		listItem.appendChild(hicannInput);

		const hicannInputLabel = document.createElement("label");
		hicannInputLabel.htmlFor = `element_0_${i}`;
		hicannInputLabel.classList.add("checkboxLabel");
		listItem.appendChild(hicannInputLabel);

		const hicann = document.createElement("button");
		hicann.innerText = `HICANN ${i}`;
		hicann.addEventListener("click", function(){ handleListClickHicann(event) });
		listItem.appendChild(hicann)

		const elementsList = document.createElement("ul");
		listItem.appendChild(elementsList);
		// Buses
		const overviewListItem = document.createElement("li");
		elementsList.appendChild(overviewListItem);

		const overviewInput = document.createElement("input");
		overviewInput.type = "checkbox";
		overviewInput.checked = true;
		overviewInput.classList.add("fork");
		overviewInput.id = `element_0_${i}_0`;
		overviewListItem.appendChild(overviewInput);
		// buses checkbox label
		const overviewInputLabel = document.createElement("label");
		overviewInputLabel.htmlFor = `element_0_${i}_0`;
		overviewInputLabel.classList.add("checkboxLabel");
		overviewListItem.appendChild(overviewInputLabel);
		// detailed Buses checkbox
		const overviewCheckbox = document.createElement("input");
		overviewCheckbox.type = "checkbox";
		overviewCheckbox.checked = true;
		overviewCheckbox.addEventListener("change", function(e) {
			const event = e || window.event;
			const target: any = event.target
			const hicannIndex = i;
			if (target.checked) {
				// number of neurons
				manualmode.selectedElements.overview.numNeurons[hicannIndex] = true;
				pixiBackend.container.backgrounds.children[hicannIndex].visible = true;
				$(`#element_0_${i}_0_0`).prop("checked", true);
				// number of inputs
				manualmode.selectedElements.overview.numInputs[hicannIndex] = true;
				pixiBackend.container.inputs.children[hicannIndex].visible = true;
				$(`#element_0_${i}_0_1`).prop("checked", true);
				// left buses
				manualmode.selectedElements.overview.left[hicannIndex] = true;
				pixiBackend.container.overviewBusesLeft.children[hicannIndex].visible = true;
				$(`#element_0_${i}_0_2`).prop("checked", true);
				// right buses
				manualmode.selectedElements.overview.right[hicannIndex] = true;
				pixiBackend.container.overviewBusesRight.children[hicannIndex].visible = true;
				$(`#element_0_${i}_0_3`).prop("checked", true);
				// horizontal buses
				manualmode.selectedElements.overview.horizontal[hicannIndex] = true;
				pixiBackend.container.overviewBusesHorizontal.children[hicannIndex].visible = true;
				$(`#element_0_${i}_0_4`).prop("checked", true);
			} else {
				// number of neurons
				manualmode.selectedElements.overview.numNeurons[hicannIndex] = false;
				pixiBackend.container.backgrounds.children[hicannIndex].visible = false;
				$(`#element_0_${i}_0_0`).prop("checked", false);
				// number of inputs
				manualmode.selectedElements.overview.numInputs[hicannIndex] = false;
				pixiBackend.container.inputs.children[hicannIndex].visible = false;
				$(`#element_0_${i}_0_1`).prop("checked", false);
				// left buses
				manualmode.selectedElements.overview.left[hicannIndex] = false;
				pixiBackend.container.overviewBusesLeft.children[hicannIndex].visible = false;
				$(`#element_0_${i}_0_2`).prop("checked", false);
				// right buses
				manualmode.selectedElements.overview.right[hicannIndex] = false;
				pixiBackend.container.overviewBusesRight.children[hicannIndex].visible = false;
				$(`#element_0_${i}_0_3`).prop("checked", false);
				// horizontal buses
				manualmode.selectedElements.overview.horizontal[hicannIndex] = false;
				pixiBackend.container.overviewBusesHorizontal.children[hicannIndex].visible = false;
				$(`#element_0_${i}_0_4`).prop("checked", false);
			}
			pixiBackend.renderer.render();
			manualmode.checkAllCheckboxes("numNeurons");
			manualmode.checkAllCheckboxes("numInputs");
			manualmode.checkAllCheckboxes("left");
			manualmode.checkAllCheckboxes("right");
			manualmode.checkAllCheckboxes("horizontal");
		})
		overviewCheckbox.classList.add("hicannElementCheckbox");
		overviewCheckbox.id = `element_0_${i}_0_checkbox`;
		overviewListItem.appendChild(overviewCheckbox);
		// buses label
		const overviewLabel = document.createElement("label");
		overviewLabel.innerHTML = "Overview";
		overviewListItem.appendChild(overviewLabel);

		const overviewList = document.createElement("ul");
		overviewListItem.appendChild(overviewList);
		// number of neurons
		const numNeuronsListItem = document.createElement("li");
		overviewList.appendChild(numNeuronsListItem);

		const numNeuronsCheckbox = document.createElement("input");
		numNeuronsCheckbox.type = "checkbox";
		numNeuronsCheckbox.checked = true;
		numNeuronsCheckbox.classList.add("hicannElementCheckbox");
		numNeuronsCheckbox.id = `element_0_${i}_0_0`;
		numNeuronsCheckbox.addEventListener("change", function(e) {
			const event = e || window.event;
			const target: any = event.target
			const hicannIndex = i;
			if (target.checked) {
				manualmode.selectedElements.overview.numNeurons[hicannIndex] = true;
				pixiBackend.container.backgrounds.children[hicannIndex].visible = true;
				pixiBackend.renderer.render();
			} else {
				manualmode.selectedElements.overview.numNeurons[hicannIndex] = false;
				pixiBackend.container.backgrounds.children[hicannIndex].visible = false;
				pixiBackend.renderer.render();
			}
			manualmode.checkAllCheckboxes("numNeurons");
			let allPropertiesSelected: boolean;
			if ((manualmode.selectedElements.overview.numNeurons[i] === true)
					&& (manualmode.selectedElements.overview.numInputs[i] === true)
					&& (manualmode.selectedElements.overview.left[i] === true)
					&& (manualmode.selectedElements.overview.right[i] === true)
					&& (manualmode.selectedElements.overview.horizontal[i] === true)) {
				allPropertiesSelected = true;
			} else {
				allPropertiesSelected = false;
			}
			if (allPropertiesSelected) {
				$(`#element_0_${i}_0_checkbox`).prop("checked", true);
			} else {
				$(`#element_0_${i}_0_checkbox`).prop("checked", false);
			}
		});
		numNeuronsListItem.appendChild(numNeuronsCheckbox);

		const numNeuronsLabel = document.createElement("label");
		numNeuronsLabel.innerHTML = "number of Neurons"
		numNeuronsListItem.appendChild(numNeuronsLabel);
		// number of inputs
		const numInputsListItem = document.createElement("li");
		overviewList.appendChild(numInputsListItem);

		const numInputsCheckbox = document.createElement("input");
		numInputsCheckbox.type = "checkbox";
		numInputsCheckbox.checked = true;
		numInputsCheckbox.classList.add("hicannElementCheckbox");
		numInputsCheckbox.id = `element_0_${i}_0_1`;
		numInputsCheckbox.addEventListener("change", function(e) {
			const event = e || window.event;
			const target: any = event.target
			const hicannIndex = i;
			if (target.checked) {
				manualmode.selectedElements.overview.numInputs[hicannIndex] = true;
				pixiBackend.container.inputs.children[hicannIndex].visible = true;
				pixiBackend.renderer.render();
			} else {
				manualmode.selectedElements.overview.numInputs[hicannIndex] = false;
				pixiBackend.container.inputs.children[hicannIndex].visible = false;
				pixiBackend.renderer.render();
			}
			manualmode.checkAllCheckboxes("numInputs");
			let allPropertiesSelected: boolean;
			if ((manualmode.selectedElements.overview.numNeurons[i] === true)
					&& (manualmode.selectedElements.overview.numInputs[i] === true)
					&& (manualmode.selectedElements.overview.left[i] === true)
					&& (manualmode.selectedElements.overview.right[i] === true)
					&& (manualmode.selectedElements.overview.horizontal[i] === true)) {
				allPropertiesSelected = true;
			} else {
				allPropertiesSelected = false;
			}
			if (allPropertiesSelected) {
				$(`#element_0_${i}_0_checkbox`).prop("checked", true);
			} else {
				$(`#element_0_${i}_0_checkbox`).prop("checked", false);
			}
		});
		numInputsListItem.appendChild(numInputsCheckbox);

		const numInputsLabel = document.createElement("label");
		numInputsLabel.innerHTML = "number of Inputs"
		numInputsListItem.appendChild(numInputsLabel);
		// Buses left
		const busesLeftListItem = document.createElement("li");
		overviewList.appendChild(busesLeftListItem);

		const busesLeftCheckbox = document.createElement("input");
		busesLeftCheckbox.type = "checkbox";
		busesLeftCheckbox.checked = true;
		busesLeftCheckbox.addEventListener("change", function(e) {
			const event = e || window.event;
			const target: any = event.target
			const hicannIndex = i;
			if (target.checked) {
				manualmode.selectedElements.overview.left[hicannIndex] = true;
				pixiBackend.container.overviewBusesLeft.children[hicannIndex].visible = true;
				pixiBackend.renderer.render();
			} else {
				manualmode.selectedElements.overview.left[hicannIndex] = false;
				pixiBackend.container.overviewBusesLeft.children[hicannIndex].visible = false;
				pixiBackend.renderer.render();
			}
			manualmode.checkAllCheckboxes("left");
			let allPropertiesSelected: boolean;
			if ((manualmode.selectedElements.overview.numNeurons[i] === true)
					&& (manualmode.selectedElements.overview.numInputs[i] === true)
					&& (manualmode.selectedElements.overview.left[i] === true)
					&& (manualmode.selectedElements.overview.right[i] === true)
					&& (manualmode.selectedElements.overview.horizontal[i] === true)) {
				allPropertiesSelected = true;
			} else {
				allPropertiesSelected = false;
			}
			if (allPropertiesSelected) {
				$(`#element_0_${i}_0_checkbox`).prop("checked", true);
			} else {
				$(`#element_0_${i}_0_checkbox`).prop("checked", false);
			}
		});
		busesLeftCheckbox.classList.add("hicannElementCheckbox");
		busesLeftCheckbox.id = `element_0_${i}_0_2`;
		busesLeftListItem.appendChild(busesLeftCheckbox);

		const busesLeftLabel = document.createElement("label");
		busesLeftLabel.innerHTML = "vertical left";
		busesLeftListItem.appendChild(busesLeftLabel);
		// Buses right
		const busesRightListItem = document.createElement("li");
		overviewList.appendChild(busesRightListItem);

		const busesRightCheckbox = document.createElement("input");
		busesRightCheckbox.type = "checkbox";
		busesRightCheckbox.checked = true;
		busesRightCheckbox.addEventListener("change", function(e) {
			const event = e || window.event;
			const target: any = event.target
			const hicannIndex = i;
			if (target.checked) {
				manualmode.selectedElements.overview.right[hicannIndex] = true;
				pixiBackend.container.overviewBusesRight.children[hicannIndex].visible = true;
				pixiBackend.renderer.render();
			} else {
				manualmode.selectedElements.overview.right[hicannIndex] = false;
				pixiBackend.container.overviewBusesRight.children[hicannIndex].visible = false;
				pixiBackend.renderer.render();
			}
			manualmode.checkAllCheckboxes("right");
			let allPropertiesSelected: boolean;
			if ((manualmode.selectedElements.overview.numNeurons[i] === true)
					&& (manualmode.selectedElements.overview.numInputs[i] === true)
					&& (manualmode.selectedElements.overview.left[i] === true)
					&& (manualmode.selectedElements.overview.right[i] === true)
					&& (manualmode.selectedElements.overview.horizontal[i] === true)) {
				allPropertiesSelected = true;
			} else {
				allPropertiesSelected = false;
			}
			if (allPropertiesSelected) {
				$(`#element_0_${i}_0_checkbox`).prop("checked", true);
			} else {
				$(`#element_0_${i}_0_checkbox`).prop("checked", false);
			}
		});
		busesRightCheckbox.classList.add("hicannElementCheckbox");
		busesRightCheckbox.id = `element_0_${i}_0_3`;
		busesRightListItem.appendChild(busesRightCheckbox);

		const busesRightLabel = document.createElement("label");
		busesRightLabel.innerHTML = "vertical right";
		busesRightListItem.appendChild(busesRightLabel);
		// Buses horizontal
		const busesHorizontalListItem = document.createElement("li");
		overviewList.appendChild(busesHorizontalListItem);

		const busesHorizontalCheckbox = document.createElement("input");
		busesHorizontalCheckbox.type = "checkbox";
		busesHorizontalCheckbox.checked = true;
		busesHorizontalCheckbox.addEventListener("change", function(e) {
			const event = e || window.event;
			const target: any = event.target
			const hicannIndex = i;
			if (target.checked) {
				manualmode.selectedElements.overview.horizontal[hicannIndex] = true;
				pixiBackend.container.overviewBusesHorizontal.children[hicannIndex].visible = true;
				pixiBackend.renderer.render();
			} else {
				manualmode.selectedElements.overview.horizontal[hicannIndex] = false;
				pixiBackend.container.overviewBusesHorizontal.children[hicannIndex].visible = false;
				pixiBackend.renderer.render();
			}
			manualmode.checkAllCheckboxes("horizontal");
			let allPropertiesSelected: boolean;
			if ((manualmode.selectedElements.overview.numNeurons[i] === true)
					&& (manualmode.selectedElements.overview.numInputs[i] === true)
					&& (manualmode.selectedElements.overview.left[i] === true)
					&& (manualmode.selectedElements.overview.right[i] === true)
					&& (manualmode.selectedElements.overview.horizontal[i] === true)) {
				allPropertiesSelected = true;
			} else {
				allPropertiesSelected = false;
			}
			if (allPropertiesSelected) {
				$(`#element_0_${i}_0_checkbox`).prop("checked", true);
			} else {
				$(`#element_0_${i}_0_checkbox`).prop("checked", false);
			}
		});
		busesHorizontalCheckbox.classList.add("hicannElementCheckbox");
		busesHorizontalCheckbox.id = `element_0_${i}_0_4`;
		busesHorizontalListItem.appendChild(busesHorizontalCheckbox);

		const busesHorizontalLabel = document.createElement("label");
		busesHorizontalLabel.innerHTML = "horizontal";
		busesHorizontalListItem.appendChild(busesHorizontalLabel);

		// detailed Buses
		const detailviewListItem = document.createElement("li");
		elementsList.appendChild(detailviewListItem);

		const detailviewInput = document.createElement("input");
		detailviewInput.type = "checkbox";
		detailviewInput.checked = true;
		detailviewInput.classList.add("fork");
		detailviewInput.id = `element0_${i}_1`;
		detailviewListItem.appendChild(detailviewInput);
		// detailed Buses checkbox label
		const detailviewInputLabel = document.createElement("label");
		detailviewInputLabel.htmlFor = `element0_${i}_1`;
		detailviewInputLabel.classList.add("checkboxLabel");
		detailviewListItem.appendChild(detailviewInputLabel);
		// detailed Buses checkbox
		const detailviewCheckbox = document.createElement("input");
		detailviewCheckbox.type = "checkbox";
		detailviewCheckbox.checked = false;
		detailviewCheckbox.addEventListener("change", function(e) {
			const event = e || window.event;
			const target: any = event.target
			const hicannIndex = i;
			manualmode.busesLeft(hicannIndex, target.checked);
			manualmode.busesRight(hicannIndex, target.checked);
			manualmode.busesHorizontal(hicannIndex, target.checked);
			pixiBackend.renderer.render();
			$(`#element_0_${i}_1_0`).prop("checked", target.checked);
			$(`#element_0_${i}_1_1`).prop("checked", target.checked);
			$(`#element_0_${i}_1_2`).prop("checked", target.checked);
			manualmode.checkAllCheckboxes("detailLeft");
			manualmode.checkAllCheckboxes("detailRight");
			manualmode.checkAllCheckboxes("detailHorizontal");
		})
		detailviewCheckbox.classList.add("hicannElementCheckbox");
		detailviewCheckbox.id = `element_0_${i}_1_checkbox`;
		detailviewListItem.appendChild(detailviewCheckbox);
		// detailed Buses label
		const detailviewLabel = document.createElement("label");
		detailviewLabel.innerHTML = "Detailview";
		detailviewListItem.appendChild(detailviewLabel);

		const detailviewList = document.createElement("ul");
		detailviewListItem.appendChild(detailviewList);
		// detailed Buses left
		const detailBusesLeftListItem = document.createElement("li");
		detailviewList.appendChild(detailBusesLeftListItem);

		const detailBusesLeftCheckbox = document.createElement("input");
		detailBusesLeftCheckbox.type = "checkbox";
		detailBusesLeftCheckbox.checked = false;
		detailBusesLeftCheckbox.addEventListener("change", function(e) {
			const event = e || window.event;
			const target: any = event.target
			const hicannIndex = i;
			manualmode.busesLeft(hicannIndex, target.checked);
			pixiBackend.renderer.render();
			manualmode.checkAllCheckboxes("detailLeft");
			let allPropertiesSelected: boolean;
			if ((manualmode.selectedElements.detailview.left[i] === true)
					&& (manualmode.selectedElements.detailview.right[i] === true)
					&& (manualmode.selectedElements.detailview.horizontal[i] === true)) {
				allPropertiesSelected = true;
			} else {
				allPropertiesSelected = false;
			}
			if (allPropertiesSelected) {
				$(`#element_0_${i}_1_checkbox`).prop("checked", true);
			} else {
				$(`#element_0_${i}_1_checkbox`).prop("checked", false);
			}
		});
		detailBusesLeftCheckbox.classList.add("hicannElementCheckbox");
		detailBusesLeftCheckbox.id = `element_0_${i}_1_0`;
		detailBusesLeftListItem.appendChild(detailBusesLeftCheckbox);

		const detailBusesLeftLabel = document.createElement("label");
		detailBusesLeftLabel.innerHTML = "vertical left";
		detailBusesLeftListItem.appendChild(detailBusesLeftLabel);
		// detailed Buses right
		const detailBusesRightListItem = document.createElement("li");
		detailviewList.appendChild(detailBusesRightListItem);

		const detailBusesRightCheckbox = document.createElement("input");
		detailBusesRightCheckbox.type = "checkbox";
		detailBusesRightCheckbox.checked = false;
		detailBusesRightCheckbox.addEventListener("change", function(e) {
			const event = e || window.event;
			const target: any = event.target
			const hicannIndex = i;
			manualmode.busesRight(hicannIndex, target.checked);
			pixiBackend.renderer.render();
			manualmode.checkAllCheckboxes("detailRight");
			let allPropertiesSelected: boolean;
			if ((manualmode.selectedElements.detailview.left[i] === true)
					&& (manualmode.selectedElements.detailview.right[i] === true)
					&& (manualmode.selectedElements.detailview.horizontal[i] === true)) {
				allPropertiesSelected = true;
			} else {
				allPropertiesSelected = false;
			}
			if (allPropertiesSelected) {
				$(`#element_0_${i}_1_checkbox`).prop("checked", true);
			} else {
				$(`#element_0_${i}_1_checkbox`).prop("checked", false);
			}
		});
		detailBusesRightCheckbox.classList.add("hicannElementCheckbox");
		detailBusesRightCheckbox.id = `element_0_${i}_1_1`;
		detailBusesRightListItem.appendChild(detailBusesRightCheckbox);

		const detailBusesRightLabel = document.createElement("label");
		detailBusesRightLabel.innerHTML = "vertical right";
		detailBusesRightListItem.appendChild(detailBusesRightLabel);
		// detailed Buses horizontal
		const detailBusesHorizontalListItem = document.createElement("li");
		detailviewList.appendChild(detailBusesHorizontalListItem);

		const detailBusesHorizontalCheckbox = document.createElement("input");
		detailBusesHorizontalCheckbox.type = "checkbox";
		detailBusesHorizontalCheckbox.checked = false;
		detailBusesHorizontalCheckbox.addEventListener("change", function(e) {
			const event = e || window.event;
			const target: any = event.target
			const hicannIndex = i;
			manualmode.busesHorizontal(hicannIndex, target.checked);
			pixiBackend.renderer.render();
			manualmode.checkAllCheckboxes("detailHorizontal");
			let allPropertiesSelected: boolean;
			if ((manualmode.selectedElements.detailview.left[i] === true)
					&& (manualmode.selectedElements.detailview.right[i] === true)
					&& (manualmode.selectedElements.detailview.horizontal[i] === true)) {
				allPropertiesSelected = true;
			} else {
				allPropertiesSelected = false;
			}
			if (allPropertiesSelected) {
				$(`#element_0_${i}_1_checkbox`).prop("checked", true);
			} else {
				$(`#element_0_${i}_1_checkbox`).prop("checked", false);
			}
		});
		detailBusesHorizontalCheckbox.classList.add("hicannElementCheckbox");
		detailBusesHorizontalCheckbox.id = `element_0_${i}_1_2`;
		detailBusesHorizontalListItem.appendChild(detailBusesHorizontalCheckbox);

		const detailBusesHorizontalLabel = document.createElement("label");
		detailBusesHorizontalLabel.innerHTML = "horizontal";
		detailBusesHorizontalListItem.appendChild(detailBusesHorizontalLabel);
	};
}
/**
 * Build the HTML for the Routes "tree-style" list in the left info-box
 */
function buildRoutesTree() {
	// surrounding div
	const tree = domObjects.routesTree[0];
	//unordered list
	const list = document.createElement("ul");
	tree.appendChild(list)
	// routes
	// surrounding list item routes
	const listItem = document.createElement("li");
	list.appendChild(listItem);
	// routes checkbox
	const routesInput = document.createElement("input");
	routesInput.type = "checkbox";
	routesInput.checked = true;
	routesInput.classList.add("fork");
	routesInput.id = "routes_0";
	listItem.appendChild(routesInput);
	// routes checkbox label
	const routesInputLabel = document.createElement("label");
	routesInputLabel.htmlFor = "routes_0";
	routesInputLabel.classList.add("checkboxLabel");
	listItem.appendChild(routesInputLabel);
	// select all Routes checkbox
	const allRoutesCheckbox = document.createElement("input");
	allRoutesCheckbox.type = "checkbox";
	allRoutesCheckbox.checked = false;
	allRoutesCheckbox.classList.add("routeCheckbox");
	allRoutesCheckbox.id = `routes_0_check`;
	allRoutesCheckbox.addEventListener("change", function(e) {
		//var startTime = self.performance.now();
		const event = e || window.event;
		const target: any = event.target;
		if (target.checked) {
			for (const route of routesOnStage.routes) {
				routesOnStage.setRoute(route, true);
				routesOnStage.setCheckbox(route, true);
			};
		} else {
			for (const route of routesOnStage.routes) {
				routesOnStage.setRoute(route, false);
				routesOnStage.setCheckbox(route, false);
			};
		};
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
	const routesLabel = document.createElement("button");
	routesLabel.innerText = "Routes";
	routesLabel.addEventListener("click", function(){
		routesOnStage.handleRouteDoubleClick();
	})
	listItem.appendChild(routesLabel);

	
	// route list
	// route surrounding unordered list
	const routesList = document.createElement("ul");
	listItem.appendChild(routesList);
	// routes: add list items
	for (const route of routesOnStage.routes) {
		const ID = route.ID;
		const routeListItem = document.createElement("li")
		routesList.appendChild(routeListItem);
		
		const routeCheckbox = document.createElement("input");
		routeCheckbox.type = "checkbox";
		routeCheckbox.checked = false;
		routeCheckbox.classList.add("routeCheckbox");
		routeCheckbox.id = `routes_0_${ID}`;
		routeCheckbox.addEventListener("change", function(e) {
			const event = e || window.event;
			const target: any = event.target;
			if (target.checked) {
				routesOnStage.setRoute(route, true);
			} else {
				routesOnStage.setRoute(route, false);
			};
			routesOnStage.checkAllRoutes();
			pixiBackend.renderer.render();
		});
		routeListItem.appendChild(routeCheckbox);
		
		const routeLabel = document.createElement("button");
		routeLabel.innerText = `Route ${ID + 1}`;
		routeLabel.addEventListener("click", function(){
			routesOnStage.handleRouteClick([route]);
		})
		routeListItem.appendChild(routeLabel);
	}
}
/**
 * Event handler for clicking on a HICANN in the HICANN list.
 */
function handleListClickHicann(event) {
	const hicannNumber = parseInt(event.path[0].innerText.split(" ")[1]);
	const transform: any = pixiBackend.container.stage.transform;
	let stagePosition = transform.position;
	let hicannPosition = wafer.hicanns[hicannNumber].position;
	const newPosition = {
		x: -(hicannPosition.x + hicannWidth/2)*transform.scale.x + canvasCenter().x,
		y: -(hicannPosition.y + hicannHeight/2)*transform.scale.y + canvasCenter().y,
	}
	pixiBackend.animateStagePosition(stagePosition.x, stagePosition.y, newPosition.x, newPosition.y, 700)
	animateBorderAroundHicann(pixiBackend.container.border, hicannPosition.x, hicannPosition.y,
			hicannWidth, hicannHeight, 10, "0xff0066");
	pixiBackend.renderer.render();
	displayProperties(hicannNumber)
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
	let alpha = 1;
	let timer = setInterval(function(){
		if (container.children.length === 1) {
			pixiBackend.removeChild(container, 0)
		};
		pixiBackend.drawRectangleBorder(container, x, y, width, height, lineWidth, color, alpha);
		pixiBackend.renderer.render();
		alpha -= 0.01;
		if (Math.round(alpha*100)/100 === 0.00) {
			clearInterval(timer);
			pixiBackend.removeChild(container, 0)
		};
	}, 15)
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
		.on("resize", function() {
			$("#elementsTree").outerHeight($("#waferList").height() - 15);
		})
	// initialize
	$("#elementsTree").outerHeight($("#waferList").height() - 15);

	// add resizability to routes list in left info panel
	$("#routesList")
		.resizable({
			handles: "s",
		}).on("resize", function() {
			$("#routesTree").outerHeight($("#routesList").height() - 15);
		})
	// initialize
	$("#routesTree").outerHeight($("#routesList").height() - 15);

	// route width slider
	$("#routeWidthSlider")
	.slider({
		slide: function(event, ui) {
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
function addByID(object: object, id: string) { 
	object[id] = $(`#${id}`)
}
/**
 * Helper function to reference the DOM
 */
function addProperty(object: object, property: string) {
	object[property] = {};
	addByID(object[property], `${property}Number`);
	addByID(object[property], `${property}Gradient`);
	addByID(object[property], `${property}Min`);
	addByID(object[property], `${property}Max`);
}
/**
 * Store references to DOM objects to save performance.
 */
function referenceDOM() {
	addByID(domObjects,"controlsContainer");
	addByID(domObjects, "rightInfoBox");
	addByID(domObjects, "hicannNumber");
	addByID(domObjects, "elementsTree");
	addByID(domObjects, "routesTree");
	for (let i=0; i<properties.length; i++){
		addProperty(domObjects, properties[i]);
	};
}
/**
 * Show Hicann properties in left info box.
 */
function displayProperties(hicannNumber) {
	domObjects.hicannNumber.html(`HICANN ${hicannNumber}`);
	displayNeuronsNumber(hicannNumber);
	displayInputsNumber(hicannNumber);
	displayBusesNumber(hicannNumber);
}
function displayNeuronsNumber(hicannNumber) {
	domObjects.neurons.neuronsNumber.html(`
		Number of neurons: ${wafer.hicanns[hicannNumber].numNeurons}
	`);
}
function displayInputsNumber(hicannNumber) {
	domObjects.inputs.inputsNumber.html(`
		Number of inputs: ${wafer.hicanns[hicannNumber].numInputs}
	`);
}
function displayBusesNumber(hicannNumber) {
	domObjects.leftBuses.leftBusesNumber.html(`
		vertical left: ${wafer.hicanns[hicannNumber].numBusesLeft}
	`);
	domObjects.rightBuses.rightBusesNumber.html(`
		vertical right: ${wafer.hicanns[hicannNumber].numBusesRight}
	`);
	domObjects.horizontalBuses.horizontalBusesNumber.html(`
		horizontal: ${wafer.hicanns[hicannNumber].numBusesHorizontal}
	`);
}
/**
 * Set the background colors as well as Min, Max numbers for all HICANN property gradients.
 */
function setupPropertyGradients() {
	domObjects.neurons.neuronsGradient.css("background",
			`linear-gradient(90deg, #${numNeuronsColorOne}, #${numNeuronsColorTwo})`);
	domObjects.neurons.neuronsMin.html(`0`);
	domObjects.neurons.neuronsMax.html(wafer.numNeuronsMax);

	domObjects.inputs.inputsGradient.css("background",
			`linear-gradient(90deg, #${numInputsColorOne}, #${numInputsColorTwo})`);
	domObjects.inputs.inputsMin.html(`0`);
	domObjects.inputs.inputsMax.html(wafer.numInputsMax);
	domObjects.leftBuses.leftBusesGradient.css("background",
			`linear-gradient(90deg, #${numRoutesLeftColorOne}, #${numRoutesLeftColorTwo})`);
	domObjects.leftBuses.leftBusesMin.html(`0`);
	domObjects.leftBuses.leftBusesMax.html(wafer.numBusesLeftMax);

	domObjects.rightBuses.rightBusesGradient.css("background",
			`linear-gradient(90deg, #${numRoutesRightColorOne}, #${numRoutesRightColorTwo})`);
	domObjects.rightBuses.rightBusesMin.html(`0`);
	domObjects.rightBuses.rightBusesMax.html(wafer.numBusesRightMax);
	
	domObjects.horizontalBuses.horizontalBusesGradient.css("background",
			`linear-gradient(90deg, #${numRoutesHorizontalColorOne}, #${numRoutesHorizontalColorTwo})`);
	domObjects.horizontalBuses.horizontalBusesMin.html(`0`);
	domObjects.horizontalBuses.horizontalBusesMax.html(wafer.numBusesHorizontalMax);
}
/**
 * Event handler for keyboard events
 */
function handleKeyDown(event) {
	const key = event.which;
	switch (key) {
		case 65:
			console.log('key a pressed');
			break;
		case 83:
			console.log('key s pressed')
			break;
	};
};
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
	};
	routesOnStage.handleVisuClick(event.clientX, event.clientY);
};
/**
 * Event handler for the mouse-up event
 * - in automode: switch to neighbor HICANN
 */
function handleMouseUp(event) {
	mouseIsDown = false;
	const positionDiff = {
		x: (event.clientX - mouseDownPosition.x),
		y: (event.clientY - mouseDownPosition.y)
	}
	if ((positionDiff.x !== 0) || (positionDiff.y !== 0)) {
		if (detailview.enabled && automode.enabled) {
			// horizontal movement
			if (positionDiff.x > 0) {
				if (detailview.westernHicannCloser(canvasCenter())) {
					displayProperties(detailview.westernHicann);
					automode.startWesternHicann(detailview.currentHicann);
				};
			} else {
				if (detailview.easternHicannCloser(canvasCenter())) {
					displayProperties(detailview.easternHicann);
					automode.startEasternHicann(detailview.currentHicann);
				}
			};
			// vertical movement
			if (positionDiff.y > 0) {
				if (detailview.northernHicannCloser(canvasCenter())) {
					displayProperties(detailview.northernHicann);
					automode.startNorthernHicann(detailview.currentHicann);
				}
			} else {
				if (detailview.southernHicannCloser(canvasCenter())) {
					displayProperties(detailview.southernHicann);
					automode.startSouthernHicann(detailview.currentHicann);
				};
			};
		};
	}
};
/**
 * Event handler for the mouse-move event
 * - stage panning
 */
function handleMouseMove(event) {
	let newMousePosition = {
		x:event.clientX,
		y:event.clientY
	};

	if (mouseIsDown) {
		let diff = {
			x:(newMousePosition.x - mousePosition.x),
			y:(newMousePosition.y - mousePosition.y),
		};
		// pan effect
		pixiBackend.moveStage(diff.x, diff.y);
	} else {
		// display hicann number
		mouseOverHicann();
	};
	pixiBackend.renderer.render();

	mousePosition = {
		x: newMousePosition.x,
		y: newMousePosition.y
	};
};
/**
 * Event handler for mouse-over event
 * - draw HICANN number
 */
function mouseOverHicann() {
	for (let index=wafer.enumMin; index<=wafer.enumMax; index++) {
		// loop through hicanns and check if mouse if over them
		if (pixiBackend.mouseInRectangle(mousePosition, wafer.hicanns[index].position.x, wafer.hicanns[index].position.y, hicannWidth, hicannHeight)) {
			if (index !== overview.hicannNumber.hicannIndex) {
				// remove old hicann number(s)
				overview.hicannNumber.clean();
				// draw new hicann number
				overview.hicannNumber.draw(index, wafer.hicanns[index].position.x, wafer.hicanns[index].position.y)
			};
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
	const factor = Math.abs(event.deltaY/600) + 1;
	const transform: any = pixiBackend.container.stage.transform;
	const pixiScale = transform.scale.x;

	// limit zooming out
	if ((pixiScale <= reticlesOnStage.threshold) && (event.deltaY > 0)) {
		// show lookup plot (reticle & fpga coordinates)
		reticlesOnStage.setReticles(true);
		pixiBackend.renderer.render();

		// end handleWheel
		return "reached zoom limit"
	}

	if (reticlesOnStage.enabled && (event.deltaY < 0)) {
		// hide lookup plot
		reticlesOnStage.setReticles(false);
		pixiBackend.renderer.render();
	}

	if((event.clientX >= ($("#leftInfoBox").offset().left + $("#leftInfoBox").outerWidth(true))) && (event.clientX <= $("#rightInfoBox").offset().left)) {
		if (Math.abs(event.deltaY) !== event.deltaY) { //zoom in
			// zoom stage
			pixiBackend.zoomIn(factor, event.clientX, event.clientY);
			// auto mode
			if (automode.enabled) {
				// zoom into detail view
				if ((!detailview.enabled) && (pixiScale >= detailview.threshold) && (pixiScale < detailview.threshold2)) {
					// determine hicann in view
					let hicannIndex: number;
					if (pixiBackend.container.numberText.children[0]) {
						// hicann number text
						const child = <PIXI.Text>pixiBackend.container.numberText.children[0];
						hicannIndex = parseInt(child.text)
					} else {
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
			} else {
				if ((pixiScale >= detailview.threshold) && (!detailview.enabled)) {
					manualmode.startDetailview();
				}
				if ((pixiScale >= detailview.threshold2) && (!detailview.levelTwoEnabled)) {
					manualmode.startDetailviewLevelTwo();
				}
			}
			// route width adjustment
			routesOnStage.adjustRouteWidth(pixiScale);
		} else { //zoom out
			// zoom stage
			pixiBackend.zoomOut(factor, event.clientX, event.clientY);
			// auto mode
			if (automode.enabled) {
				// zoom out of detailview level two
				if ((pixiScale < detailview.threshold2) && (pixiScale > detailview.threshold)) {
					automode.startDetailview(detailview.currentHicann);
				};
				// zoom out of detail view
				if ((pixiScale < detailview.threshold) && (detailview.enabled)) {
					automode.startOverview(detailview.currentHicann);
				};
			// manual mode
			} else {
				if ((pixiScale < detailview.threshold) && (detailview.enabled)) {
					manualmode.leaveDetailview();
				}
				if ((pixiScale < detailview.threshold2) && (detailview.levelTwoEnabled)) {
					manualmode.leaveDetailviewLevelTwo();
				}
			}
			// route width adjustment
			routesOnStage.adjustRouteWidth(pixiScale);
		};
	};

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