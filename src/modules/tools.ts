/**
 * A collection of functions useful functions, that are not specific to the visualization.
 */
namespace tools {
	/**
	 * For a color gradient, where "colorOne" corresponds to "zero" and "colorTwo" corresponds to "max",
	 * the color corresponding to "value" is calculated.
	 */
	export function colorInGradient(colorOne: string, colorTwo: string, max: number, value: number) {
		let frac = max ? value/max : 0;
		let c1 = {
			r: parseInt(colorOne.slice(0,2), 16),
			g: parseInt(colorOne.slice(2,4), 16),
			b: parseInt(colorOne.slice(4,6), 16)
		};
		let c2 = {
			r: parseInt(colorTwo.slice(0,2), 16),
			g: parseInt(colorTwo.slice(2,4), 16),
			b: parseInt(colorTwo.slice(4,6), 16)
		};
		let diff = {
			r:c2.r - c1.r,
			g:c2.g - c1.g,
			b:c2.b - c1.b
		}
		let cnew = {
			r: Math.floor(diff.r*frac + c1.r),
			g: Math.floor(diff.g*frac + c1.g),
			b: Math.floor(diff.b*frac + c1.b)
		};
		let cnew_hex = {
			r: ((cnew.r).toString(16).length === 2) ?
					(cnew.r).toString(16) : (0).toString(16) + (cnew.r).toString(16),
			g: ((cnew.g).toString(16).length === 2) ?
					(cnew.g).toString(16) : (0).toString(16) + (cnew.g).toString(16),
			b: ((cnew.b).toString(16).length === 2) ?
					(cnew.b).toString(16) : (0).toString(16) + (cnew.b).toString(16),
		}
		
		let result = "0x" + cnew_hex.r + cnew_hex.g + cnew_hex.b;
		return result;
	}
	/**
	 * returns all teh digits in a string, concatenated.
	 * e.g. "Hello13Visu08" -> 1308
	 */
	export function numberInString(string: any) {
		let number = "";
		for (const letter in string) {
			number += (!isNaN(parseInt(string[letter]))) ? string[letter] : "";
		}
		return parseInt(number);
	}
	/**
	 * returns a random number between "bottom" and "top".
	 */
	function randomNumber(bottom: number, top: number) {
		return (Math.floor(Math.random() * (top-bottom+1) + bottom))
	};
	/**
	 * returns a random color in hexadecimal form (e.g. 0xffffff).
	 */
	export function randomHexColor() {
		// random Color
		const color = {
			r: randomNumber(0, 255),
			g: randomNumber(0, 255),
			b: randomNumber(0, 255)
		}

		// convert to Hex color
		const colorHex = {
			r: ((color.r).toString(16).length === 2) ?
					(color.r).toString(16) : (0).toString(16) + (color.r).toString(16),
			g: ((color.g).toString(16).length === 2) ?
					(color.g).toString(16) : (0).toString(16) + (color.g).toString(16),
			b: ((color.b).toString(16).length === 2) ?
					(color.b).toString(16) : (0).toString(16) + (color.b).toString(16),
		}

		// concatenate and return
		return "0x" + colorHex.r + colorHex.g + colorHex.b;
	};
	/**
	 * interface for a box/rectangle
	 */
	export interface Box {
		x: number;
		y: number;
		width: number;
		height: number;
	}
	/**
	 * Calculate the intersection of two rectangles.
	 * caveat: works only in the special case of two intersecting bus segments
	 */
	export function intersectionRectangle(rect1: Box, rect2: Box) {
		let position = <Box>{};
		
		// intersection x & width
		if (rect1.width < rect2.width) {
			position.x = rect1.x;
			position.width = rect1.width;
		} else {
			position.x = rect2.x;
			position.width = rect2.width;
		};

		// intersection y & height
		if (rect1.height < rect2.height) {
			position.y = rect1.y;
			position.height = rect1.height;
		} else {
			position.y = rect2.y;
			position.height = rect2.height;
		};

		return (position);
	};
	/**
	 * calculates center position and radius of a circle that fits exactly into the square
	 */
	export function circleInSquare(square: Box) {
		// circle x
		const x = square.x + square.width/2;

		// circle y
		const y = square.y + square.height/2;

		// circle radius
		const radius = square.width/2;

		return({
			x: x,
			y: y,
			radius: radius,
		})
	}
	/**
	 * Gaußsche Summenformel "kleiner Gauss"
	 */
	export function kleinerGauss(n: number) {
		return (n**2 + n)/2
	}
	/**
	 * Calculate the distance between two two-dimensional points
	 */
	export function distanceBetweenPoints(point1: {x: number, y: number}, point2: {x: number, y: number}) {
		const distance = Math.sqrt((point1.x - point2.x)**2
				+ (point1.y - point2.y)**2);
		return(distance);
	}
}