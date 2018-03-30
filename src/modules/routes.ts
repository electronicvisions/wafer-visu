/// <reference path="routes_json.d.ts" />
/// <reference path="detailview.ts" />

/**
 * The namespace contains a number of classes that each have their separate purposes but have dependencies on each other.
 * They are written into separate files to keep a clear structure.
 */
namespace internalModule {
	/**
	 * Load and process the route data from a json.
	 * The route data will later be availabe via the Marocco API.
	 */
	function loadRouteData() {

		// array with strings for each route element
		const routesString = JSON.parse(routesJSON);
		const routes = <Route[]>[];
		for (const route of routesString) {
			// split array into segments on different hicanns
			const routesSegmented = []
			while (route.length > 0) {
				for (let i = 1; i < route.length; i++) {
					if (route[i].includes("HICANNOnWafer")) {
						routesSegmented.push(route.splice(0, i))
						break;
					}
					if (i == (route.length - 1)) {
						routesSegmented.push(route.splice(0, i + 1))
					}
				}
			}

			// push route segments as new RouteElements into array
			const routeElements = [];
			for (const segment of routesSegmented) {
				for (let i = 1; i < segment.length; i++) {
					const hicann = tools.numberInString(segment[0]);
					const type = (segment[i].includes("HLine")) ? "hLine" : "vLine";
					const index = tools.numberInString(segment[i]);
					routeElements.push(new RouteElement(hicann, type, index));
				}
			}

			// store route in routes array
			routes.push(new Route(routeElements, routes.length))
		}

		return routes;
	}

	/**
	 * An element of a route, either a vertical or a horizontal bus.
	 */
	class RouteElement {
		constructor(hicann: number, type: "vLine" | "hLine", index: number) {
			this.hicann = hicann;
			this.type = type;
			this.index = index;
		}
		/**
		 * Index/coordinate of the HICANN the route-element belongs to.
		 */
		hicann: number;
		/**
		 * vertical or horizontal bus.
		 */
		type: "vLine" | "hLine";
		/**
		 * Index of the bus, the route uses.
		 */
		index: number;
	}

	/**
	 * A complete route with source and target HICANN.
	 */
	class Route {
		constructor(routeElements: RouteElement[], ID: number) {
			this.route = routeElements;
			this.sourceHicann = this.route[0].hicann;
			this.targetHicann = this.route[this.route.length - 1].hicann;
			this.ID = ID;
			this.color = tools.randomHexColor();
			this.greyedOut = false;
		}
		/**
		 * List of the individual bus segments the route is using.
		 */
		route: RouteElement[];
		/**
		 * Index/coordinate of the source HICANN.
		 */
		sourceHicann: number;
		/**
		 * Index/coordinate of the target HICANN.
		 */
		targetHicann: number;
		/**
		 * An individual ID for just this route.
		 */
		ID: number;
		/**
		 * Indicates whether the route will be rendered or not.
		 */
		visible = true;
		/**
		 * Color of the route. Requires a hex-color of the form "0xffffff".
		 */
		color: string;
		/**
		 * Indicates whether the route is currently greyed-out or not.
		 */
		greyedOut: boolean;
	}

	/**
	 * Control the route information in the UI route-info box.
	 */
	class RouteInfo {
		constructor() {
			this.details = false;
		}

		/**
		 * Indicates whether route details are shown or not.
		 */
		details: boolean;
		
		/**
		 * Display information about a list of routes.
		 */
		displayRouteInfo(routes: Route[]) {
			//remove old info
			this.reset();

			if (routes.length !== 1) {

				// display numbers of all selected routes
				let routeNumbers = "";
				for (let route of routes) { routeNumbers += `${route.ID + 1}, ` };
				routeNumbers = routeNumbers.slice(0, -2);
				$("#routeNumber").html(`Routes ${routeNumbers}`)

			} else {

				// display info about selected route
				$("#routeNumber").html(`Route ${routes[0].ID + 1}`)
				$("#routeInfoBox").append(`<p id="sourceHicann" class="routeInfoItem">
						source hicann: <span>${routes[0].sourceHicann}</span></p>`);
				$("#routeInfoBox").append(`<p id="targetHicann" class="routeInfoItem">
						target hicann: <span>${routes[0].targetHicann}</span></p>`);
				
				// expand list to show all route segments
				const routeDetails = $(`<button id="routeDetails">details</button>`)
				routeDetails.click(function() {
					if (this.details) {
						this.removeDetailsList();
						this.details = false;
					} else {
						this.buildRouteDetailsList(routes[0]);
						this.details = true;
					}
				}.bind(this))
				$("#targetHicann").after(routeDetails);

				if (this.details) {
					this.buildRouteDetailsList(routes[0]);
				}
			}
		}

		/**
		 * Build an HTML list of route segments.
		 */
		buildRouteDetailsList(route: Route) {
			let html = "";

			// open containing div
			html += "<div id='routeElementsBox'>"
			
			// build route elements list
			for (const element of route.route) {
				html += `<p class='routeElementItem'>HICANN <span>${element.hicann}</span>: ${element.type} <span>${element.index}</span></p>`
			}

			// close containing div
			html += "</div>";

			// append
			$("#sourceHicann").after(html)
		}

		/**
		 * Remove the HTML list of route segments
		 */
		removeDetailsList() {
			$("#routeElementsBox").remove();
			$(".routeElementItem").remove();
		}

		/**
		 * reset the UI route-info box.
		 */
		reset() {
			$("#routeNumber").html("Route Info");
			$("#routeDetails").remove();
			$(".routeInfoItem").remove();
			this.removeDetailsList();
		}
	}

	/**
	 * Controls all the routes that are visualized. All routes are stored as a new instance of the class Route.
	 * When a route is selected, an additional route is drawn on top of all the other routes, so selected route are not hidden by other routes.
	 * When the class is constructed with a routes array, the number of positions (first index) have to match the number of routes.
	 */
	export class RoutesOnStage {
		constructor(detailview: Detailview, routes?: Route[], positions?: tools.Box[][]) {
			this.detailview = detailview;
			this.wafer = detailview.wafer;
			this.routeInfo = new RouteInfo();

			if (routes && positions) {
				if (routes.length === positions.length) {
					this.routes = routes;
					this.positions = positions;
				} else {
					throw (new Error("Incompatible input: Routes array has a different length than positions array"));
				}
			} else {
				this.routes = [];
				this.selectedRoutes = [];
				this.positions = [];
			}
		}

		wafer: Wafer;
		detailview: Detailview;
		routeInfo: RouteInfo;
		/**
		 * All the routes that are to be visualized.
		 */
		routes: Route[];
		/**
		 * Store the routes that have been selected either by clicking in the visualization or in the routes list.
		 */
		selectedRoutes: Route[];
		/**
		 * Positions (includes widths and heights) of all the routes.
		 * - first index is route index
		 * - second index is route segment of that route
		 */
		positions: tools.Box[][];
		/**
		 * Different zoom-levels for route width adjustment.
		 */
		zoomLevels = {
			level0: {
				scale: 0.2, // 0.2*detailview.threshold
				originalWidth: 200, // corresponds to width-slider value 4 (out of 5)
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

		/**
		 * total number of routes in the visualization.
		 */
		get numRoutes() {
			return this.routes.length;
		};

		/**
		 * Add a route to the routes list.
		 */
		addRoute(route: Route, position: tools.Box[]) {
			this.routes.push(route);
			this.positions.push(position);
		};

		/**
		 * Number of segments of a route.
		 * @param routeID 
		 */
		routeLength(routeID: number) {
			return this.routes[routeID].route.length;
		};

		/**
		 * Process route data, instantiate and draw all routes.
		 */
		drawRoutes() {
			// load routes
			const routes = loadRouteData();

			// draw routes and store them
			for (const route of routes) {
				this.drawRoute(route)
			}
		};

		/**
		 * Redraw all routes, without loading the route data again.
		 * The position values are overwritten.
		 */
		redrawRoutes() {
			// draw already stored routes, recalculate positions
			for (const route of this.routes) {
				this.drawRoute(route, true)
			}

			// ... and the selected routes
			for (const route of this.selectedRoutes) {
				this.drawRoute(route, true, true)
			}
		};

		/**
		 * Calculate the positions for all route segments and draw a route.
		 * @param saveOnlyPositions Set to true, if only the position values should be stored. Otherwise a new Route is stored in the routes array and the route will have a new color.
		 * @param selected Set to true, to store the route in the PixiJS container for selected routes.
		 */
		drawRoute(route: Route, saveOnlyPositions = false, selected = false) {
			const positions = <tools.Box[]>[];
			const switchCircles = <{x: number, y: number, radius: number}[]>[];

			// calculate positions of route segments
			for (const segment of route.route) {
				if (segment.type === "vLine") {
					positions.push(this.calcSegmentVertical(segment));
				} else if (segment.type === "hLine") {
					positions.push(this.calcSegmentHorizontal(segment));
				} else {
					throw (new Error("wrong route segment type"))
				}
			}

			// calculate circle positions of route intersection points -> switches
			for (let i=1; i<route.route.length; i++) {
				if (route.route[i].type !== route.route[i-1].type) {
					// square, where horizontal and vertical segments intersect
					const intersectionSquare = tools.intersectionRectangle(positions[i], positions[i-1]);

					// calculate circle positions
					switchCircles.push(tools.circleInSquare(intersectionSquare));
				}
			};

			// rearrange position values into arrays for drawing
			const xValues = [];
			const yValues = [];
			const widthValues = [];
			const heightValues = [];
			for (const position of positions) {
				xValues.push(position.x);
				yValues.push(position.y);
				widthValues.push(position.width);
				heightValues.push(position.height);
			};

			// rearrange switch circle position values into arrays for drawing
			const switchXValues = [];
			const switchYValues = [];
			const switchRadiusValues = [];
			for (const position of switchCircles) {
				switchXValues.push(position.x);
				switchYValues.push(position.y);
				switchRadiusValues.push(position.radius);
			};

			// container to store routes in
			let routesContainer: PIXI.Container;
			let switchesContainer: PIXI.Container;
			if (selected) {
				routesContainer = pixiBackend.container.selectedRoutes;
				switchesContainer = pixiBackend.container.selectedSwitches;
			} else {
				routesContainer = pixiBackend.container.routes;
				switchesContainer = pixiBackend.container.switches;
			};

			// draw Route
			if (route.greyedOut) {
				pixiBackend.drawRectangles(routesContainer, xValues, yValues, widthValues, heightValues, "0x8c8c8c");
			} else {
				pixiBackend.drawRectangles(routesContainer, xValues, yValues, widthValues, heightValues, route.color);
			};

			// draw Circles on Switches (between horizontal and vertical segment of same route)
			// switches are on top of all the routes
			if (route.greyedOut) {
				pixiBackend.drawCircles(switchesContainer, switchXValues, switchYValues, switchRadiusValues, "0x8c8c8c");
			} else {
				pixiBackend.drawCircles(switchesContainer, switchXValues, switchYValues, switchRadiusValues, "0xffffff");
			};

			// save full route || update positions
			if (saveOnlyPositions) {
				this.positions[route.ID] = positions;
			} else {
				this.addRoute(route, positions);
			};
		};

		/**
		 * Calculate rectangle that represents a vertical route segment.
		 */
		calcSegmentVertical(segment: RouteElement) {
			const hicannPosition = {
				x: this.wafer.hicanns[segment.hicann].position.x,
				y: this.wafer.hicanns[segment.hicann].position.y,
			}

			const widthFactor = this.zoomLevels.current.width;
			const xOffset = (segment.index < 128) ? 0 : (this.detailview.numBusesVertical + this.detailview.numNeurons + this.detailview.gap * 2) * this.detailview.unitDistance;
			const index = (segment.index < 128) ? segment.index : segment.index - 128;

			const x = hicannPosition.x + xOffset + index * this.detailview.unitDistance - (widthFactor - 1) / 2 * this.detailview.unitLength;
			const y = hicannPosition.y;
			const width = widthFactor * this.detailview.unitLength;
			const height = this.detailview.hicannHeight;

			return { x, y, width, height };
		};

		/**
		 * Calculate rectangle that represents a horizontal route segment.
		 */
		calcSegmentHorizontal(segment: RouteElement) {
			const hicannPosition = {
				x: this.wafer.hicanns[segment.hicann].position.x,
				y: this.wafer.hicanns[segment.hicann].position.y,
			}

			const widthFactor = this.zoomLevels.current.width;
			const routeBlockHeight = (this.detailview.numBusesHorizontal - 1) * 2 * this.detailview.unitDistance + this.detailview.unitLength;
			const yOffset = (this.detailview.hicannHeight - routeBlockHeight) / 2;

			const x = hicannPosition.x;
			const y = hicannPosition.y + yOffset + segment.index * this.detailview.unitDistance - (widthFactor - 1) / 2 * this.detailview.unitLength;
			const width = this.detailview.hicannWidth;
			const height = widthFactor * this.detailview.unitLength;

			return { x, y, width, height };
		};

		/**
		 * Removes the graphics objects for all routes (and selected routes) from the PixiJS containers.
		 */
		removeRoutesFromContainer() {
			// remove all routes (and switch circles) from pixiJS container
			const numRoutes = pixiBackend.container.routes.children.length;
			for (let i=0; i<numRoutes; i++) {
				pixiBackend.removeChild(pixiBackend.container.routes, 0);
				pixiBackend.removeChild(pixiBackend.container.switches, 0);
			};

			// ... and from selected Route pixiJS container
			const numSelectedRoutes = pixiBackend.container.selectedRoutes.children.length;
			for (let i=0; i<numSelectedRoutes; i++) {
				pixiBackend.removeChild(pixiBackend.container.selectedRoutes, 0);
				pixiBackend.removeChild(pixiBackend.container.selectedSwitches, 0);
			}
		}

		/**
		 * Set a route in the visualization visible or hide it.
		 * @param visible Set to true to make the route visible.
		 */
		setRoute(route: Route, visible: boolean) {
			// set pixiJS route according to input
			pixiBackend.container.routes.children[route.ID].visible = visible;

			// set pixiJS switch circle according to input
			pixiBackend.container.switches.children[route.ID].visible = visible;

			// set pixiJS route and switches for selected Route according to input
			if (this.selectedRoutes.indexOf(route) !== -1) {
				pixiBackend.container.selectedRoutes.children[this.selectedRoutes.indexOf(route)].visible = visible;
				pixiBackend.container.selectedSwitches.children[this.selectedRoutes.indexOf(route)].visible = visible;
			};

			// update Route.visible property
			route.visible = visible;
		};

		/**
		 * Set all routes in the visualization visible or hide them according to their "visible" property.
		 */
		setAllRoutes() {
			for (const route of this.routes) {
				// set pixiJS route according to the Route.visible property
				pixiBackend.container.routes.children[route.ID].visible = route.visible;

				// set pixiJS switch circles according to the Route.visible property
				pixiBackend.container.switches.children[route.ID].visible = route.visible;
			
				// set pixiJS route and switch for selected Route according to the Route.visible property
				const indexSelectedRoute = this.selectedRoutes.indexOf(route);
				if (indexSelectedRoute !== -1) {
					pixiBackend.container.selectedRoutes.children[indexSelectedRoute].visible = route.visible;
					pixiBackend.container.selectedSwitches.children[indexSelectedRoute].visible = route.visible;
				};
			}
		};

		/**
		 * Calculate the current zoom-level (for route widths) from the current zoom-scale.
		 * @param pixiScale zoom-scale of the "stage" PixiJS container.
		 */
		currentZoomLevel(pixiScale: number) {
			// determine the zoomlevel from current zoom
			if ((pixiScale / this.detailview.threshold) >= this.zoomLevels.level4.scale) {
				return this.zoomLevels.level4;
			} else if ((pixiScale / this.detailview.threshold) >= this.zoomLevels.level3.scale) {
				return this.zoomLevels.level3;
			} else if ((pixiScale / this.detailview.threshold) >= this.zoomLevels.level2.scale) {
				return this.zoomLevels.level2;
			} else if ((pixiScale / this.detailview.threshold) >= this.zoomLevels.level1.scale) {
				return this.zoomLevels.level1;
			} else {
				return this.zoomLevels.level0;
			};
		};

		/**
		 * Adjust the widths of all routes if a new zoom-level is reached.
		 * @param pixiScale Zoom-scale of the "stage" PixiJS container.
		 */
		adjustRouteWidth(pixiScale: number) {
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

		/**
		 * If all routes are visible (UI checkboxes checked), the Checkbox for all routes is set to checked as well.
		 */
		checkAllRoutes() {
			let allElementsSelected = true;

			// go through all routes and check if visible
			for (const route of this.routes) {
				if (!route.visible) {
					allElementsSelected = false;
					break;
				};
			};

			// set Routes checkbox
			if (allElementsSelected) {
				$("#routes_0_check").prop("checked", true);
			} else {
				$("#routes_0_check").prop("checked", false);
			};
		};

		/**
		 * set the checkbox for a route. 
		 */
		setCheckbox(route: Route, checked: boolean) {
			// set checkbox of route
			$(`#routes_0_${route.ID}`).prop("checked", checked);
		};

		/**
		 * Check if a route (or multiple routes) was clicked in the visualization
		 */
		handleVisuClick(mouseX: number, mouseY: number) {
			let selectedRoutes = <Route[]>[];

			// check what routes the mouse is over
			for (const route of this.routes) {
				if (this.mouseOverRoute(mouseX, mouseY, route)) {
					selectedRoutes.push(route);
				}
			}

			if (selectedRoutes.length !== 0) {
				this.handleRouteClick(selectedRoutes);
			}
		};

		/**
		 * Handle selected routes.
		 * - update route info box
		 * - highlight selected routes
		 * @param routes 
		 */
		handleRouteClick(routes: Route[]) {
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

		/**
		 * Check if a route (or multiple routes) was doubleclicked in the visualization
		 */
		handleVisuDoubleClick(mouseX: number, mouseY: number) {
			let clickedRoute = undefined;

			// check if mouse is over route
			for (const route of this.routes) {
				if (this.mouseOverRoute(mouseX, mouseY, route)) {
					clickedRoute = route;
					break;
				}
			}

			if (clickedRoute !== undefined) {
				this.handleRouteDoubleClick()
			}
		}

		/**
		 * Double clicking a route resets the routes.
		 * - reset the route info box
		 * - remove highlighting and draw all routes in color
		 */
		handleRouteDoubleClick() {
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
		}

		/**
		 * check is within the boundaries of the segments of a route.
		 */
		mouseOverRoute(mouseX: number, mouseY: number, route: Route) {
			// check if route is visible
			if (route.visible) {
				// check if mouse is over route
				for (const segment of this.positions[route.ID]) {
					if (pixiBackend.mouseInRectangle({ x: mouseX, y: mouseY }, segment.x, segment.y, segment.width, segment.height)) {
						return true;
					}
				}
			}
		};

		/**
		 * Set the greyout property for non-selected routes.
		 */
		highlightRoutes(selectedRoutes: Route[]) {
			// set greyedOut property
			for (const route of this.routes) {
				if ((<any>selectedRoutes).includes(route)) {
					route.greyedOut = false;
				} else {
					route.greyedOut = true;
				}
			}
		}

		/**
		 * set the greyed out property to false for all routes.
		 */
		unhighlightRoutes() {
			// set greyedOut property
			for (const route of this.routes) {
				route.greyedOut = false;
			}
		}

		/**
		 * handle the route-width slider in the UI route info box
		 * - remove old routes
		 * - draw routes in new width (store only positions)
		 */
		handleRouteWidthSlider(sliderValue: number) {
			// change the route widths for all zoom levels
			for (const zoomLevel in this.zoomLevels) {
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
		}
	}
}