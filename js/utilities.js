/**
 * @author Kate Compton
 */


// Converts canvas to an image
// https://davidwalsh.name/convert-canvas-image
function convertCanvasToImage(canvas) {
	var image = new Image();
	image.src = canvas.toDataURL("image/png");
	return image;
}


/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */

function extend(destination, source) {
	for (var k in source) {
		if (source.hasOwnProperty(k)) {
			destination[k] = source[k];
		}
	}
	return destination;
}

// https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
String.prototype.hashCode = function() {
	var hash = 0,
		i, chr;
	if (this.length === 0) return hash;
	for (i = 0; i < this.length; i++) {
		chr = this.charCodeAt(i);
		hash = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
};


function AnimTime() {
	this.start = Date.now() * .001;
	this.current = this.start;
	this.elapsed = .01;
	this.frame = 0;

}

AnimTime.prototype.update = function() {
	this.last = this.current;
	this.current = Date.now() * .001 - this.start;

	this.elapsed = this.current - this.last;
	this.frame++;
}


var utilities = {
	createThree: function(holder, init, update) {



		function bookmark(x, y) {
			orbitalCamera.dragStart = new Vector(x, y);
			orbitalCamera.bookmarkPhi = orbitalCamera.phi;
			orbitalCamera.bookmarkTheta = orbitalCamera.theta;
		}

		function bookmarkOffset(x, y) {
			orbitalCamera.phi = 1.2 + y * -.004;
			orbitalCamera.theta = -x * .008;

		}

		holder.draggable({

			helper: function() {
				return "<div class='draggable'></div>";
			},
			start: function() {
				var x = event.clientX - holder.offset().left;
				var y = event.clientY - holder.offset().top;
				bookmark(x, y);
			},
			stop: function() {
				var x = event.clientX - holder.offset().left;
				var y = event.clientY - holder.offset().top;
				bookmark(x, y);
			},
			drag: function(ev, ui) {
				var x = event.clientX - holder.offset().left;
				var y = event.clientY - holder.offset().top;
				bookmarkOffset(x, y);
				orbitalCamera.update();
			},
		}).on('mousewheel', function(event, ui) {

			//	orbitalCamera.radius += event.deltaY;

			orbitalCamera.update();

		});
		var container, stats;

		var w = holder.width();
		var h = holder.height();
		var camera, scene, renderer;

		var geometry, group;

		var mouseX = 0,
			mouseY = 0;

		var windowHalfX = w / 2;
		var windowHalfY = h / 2;

		container = holder.get(0);


		var orbitalCamera = new THREE.PerspectiveCamera(55, w / h, 1, 10000);
		orbitalCamera.theta = Math.PI / 2;
		orbitalCamera.center = new Vector();
		orbitalCamera.focus = new Vector();
		orbitalCamera.phi = .4;
		orbitalCamera.radius = 100;
		bookmark(0, 0);

		orbitalCamera.update = function() {
			orbitalCamera.up.set(0, 0, 1);

			var p = new Vector(orbitalCamera.center);
			p.addSpherical(orbitalCamera.radius, orbitalCamera.theta, orbitalCamera.phi);

			orbitalCamera.position.set(p.x, p.y, p.z);
			orbitalCamera.lookAt(orbitalCamera.focus);
		}

		orbitalCamera.update();


		scene = new THREE.Scene();

		//scene.add(createAxis(2));
		scene.add(orbitalCamera);
		scene.orbitalCamera = orbitalCamera;

		var geometry = new THREE.BoxGeometry(100, 100, 100);
		var material = new THREE.MeshNormalMaterial();

		group = new THREE.Group();

		scene.add(group);

		renderer = new THREE.WebGLRenderer({
			alpha: true
		});
		renderer.setClearColor(0x000000, 0);
		renderer.setPixelRatio(w / h);
		renderer.setSize(w, h);
		renderer.sortObjects = false;

		container.appendChild(renderer.domElement);

		stats = new Stats();
		//	container.appendChild(stats.dom);

		//
		function animate() {

			requestAnimationFrame(animate);

			render();
			stats.update();

		}


		var time = {
			frames: 0,
			start: Date.now() * .001,
			current: 0
		}

		function render() {
			time.frames++;
			var temp = Date.now() * .001 - time.start;
			time.elapsed = temp - time.current;
			time.current = temp;


			update(time, scene, orbitalCamera);
			//camera.lookAt(scene.position);
			renderer.render(scene, orbitalCamera);
		}

		init(scene, orbitalCamera);

		animate();
	},

	// control the processing view
	createProcessing: function(holder, onUpdate, onDraw, onStart) {
		var time = {
			current: 0,
			lastUpdate: -.1,
			elapsed: .1,
			frames: 0
		};

		var canvas = $("<canvas/>").appendTo(holder).css({
			width: "100%",
			height: "100%",
			left: "0px",
			top: "0px",
			position: "absolute"
		});


		var processingInstance = new Processing(canvas.get(0), function(g) {

			// Set the size of processing so that it matches that size of the canvas element
			var w = canvas.width();
			var h = canvas.height();
			time.start = new Date().getTime() * .001;

			g.size(w, h);
			g.colorMode(g.HSB, 1);
			g.ellipseMode(g.CENTER_RADIUS);
			if (onStart) {
				g.pushMatrix();
				g.translate(w / 2, h / 2);
				onStart(g);
				g.popMatrix();
			}

			g.draw = function() {
				time.current = new Date().getTime() * .001 - time.start;
				time.elapsed = time.current - time.lastUpdate;
				time.frames++;

				onUpdate(time, g);
				time.lastUpdate = time.current;


				g.pushMatrix();
				g.translate(w / 2, h / 2);

				onDraw(g, time);
				g.popMatrix();

			};
		});

	},

	noiseObj: new SimplexNoise(Math.random),

	noise: function() {
		// use the correct number of args
		switch (arguments.length) {
			case 1:
				return utilities.noiseObj.noise2D(arguments[0], 1000);
				break;
			case 2:
				return utilities.noiseObj.noise2D(arguments[0], arguments[1]);
				break;
			case 3:
				return utilities.noiseObj.noise3D(arguments[0], arguments[1], arguments[2]);
				break;
			case 4:
				return utilities.noiseObj.noise4D(arguments[0], arguments[1], arguments[2], arguments[3]);
				break;
			default:
				console.log("Attempting to use Noise with " + arguments.length + " arguments: not supported!");
				return 0;
				break;
		}
	},

	seedNoise: function(rnd) {
		utilities.noiseObj = new _Noise(rnd);
	},

	// convert angle to -PI, PI
	normalizeAngle: function(angle) {
		angle = angle % (Math.PI * 2);
		if (angle > Math.PI)
			angle -= Math.PI * 2;
		return angle;
	},
	// put noise in here too?
	capitaliseFirstLetter: function(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	},

	lowerCaseFirstLetter: function(string) {
		return string.charAt(0).toLowerCase() + string.slice(1);
	},

	words: {
		syllables: {
			first: "B C D F G H J K L M N P Qu R S T V W X Y Z St Fl Bl Pr Kr Ll Chr Sk Br Sth Ch Dhr Dr Sl Sc Sh Thl Thr Pl Fr Phr Phl Wh".split(" "),
			middle: "an all ar art air aean eun eun euh esqu aphn arl ifn ast ign agn af av ant app ab er en eor eon ent enth iar ein irt ian ion iont ill il ipp in is it ik ob ov orb oon ion uk uf un ull urk".split(" "),
			composites: "estr antr okl ackl".split(" "),
			last: "a ia ea u y en am is on an o ang ing io i el ios ius ae ie ee i".split(" "),
		},
		animals: "cobra okapi moose amoeba mongoose capybara yeti dragon unicorn sphinx kangaroo boa nematode sheep quail goat corgi agouti zebra giraffe rhino skunk dolphin whale bullfrog okapi sloth monkey orangutan grizzly moose elk dikdik ibis stork finch nightingale goose robin eagle hawk iguana tortoise panther lion tiger gnu reindeer raccoon opossum".split(" "),
		moods: "vexed indignant impassioned wistful astute courteous benevolent convivial mirthful lighthearted affectionate mournful inquisitive quizzical studious disillusioned angry bemused oblivious sophisticated elated skeptical morose gleeful curious sleepy hopeful ashamed alert energetic exhausted giddy grateful groggy grumpy irate jealous jubilant lethargic sated lonely relaxed restless surprised tired thankful".split(" "),
		colors: "ivory silver ecru scarlet red burgundy ruby crimson carnelian pink rose grey pewter charcoal slate onyx black mahogany brown green emerald blue sapphire turquoise aquamarine teal gold yellow carnation orange lavender purple magenta lilac ebony amethyst jade garnet".split(" "),
		material: "fire water cybernetic steampunk jazz steel bronze brass leather pearl cloud sky river great crystal rainbow iron gold silver titanium".split(" "),
		adventures: "lament story epic tears wish desire dance mystery enigma drama path training sorrows joy tragedy comedy riddle puzzle regret victory loss song adventure question quest vow oath tale travels".split(" "),
		getRandomBotName: function() {
			var adj = randomCap(utilities.words.moods);
			if (Math.random() > .8)
				adj = randomCap(utilities.words.material);
			if (Math.random() > .6)
				adj = randomCap(utilities.words.colors);

			return adj + " " + randomCap(utilities.words.animals);
		},

		getUserName: function() {
			var f = utilities.getRandom(utilities.words.moods);
			if (Math.random() > .5)
				f = utilities.getRandom(utilities.words.colors);
			f = utilities.capitaliseFirstLetter(f);
			f += utilities.capitaliseFirstLetter(utilities.getRandom(utilities.words.animals));
			if (Math.random() > .6)
				f += Math.floor(Math.random() * 50);
			return f;
		},

		getStatement: function() {
			return "This " + utilities.getRandom(utilities.words.moods) + " " + utilities.getRandom(utilities.words.adventures) + " made me " + utilities.getRandom(utilities.words.moods);
		},

		getRandomTitle: function() {
			var adj = randomCap(this.moods);
			if (Math.random() > .5)
				adj = randomCap(this.colors);
			return "The " + randomCap(this.adventures) + " of the " + adj + " " + randomCap(this.animals);
		},

		getRandomWord: function(lengthMult) {
			if (!lengthMult)
				lengthMult = 1;
			var s = utilities.getRandom(this.syllables.first);
			if (Math.random() < .5)
				s = utilities.capitaliseFirstLetter(utilities.getRandom(this.syllables.middle));

			var count = Math.floor(Math.random() * lengthMult * 3);
			for (var i = 0; i < count; i++) {
				var mid = utilities.getRandom(this.syllables.middle);
				s += mid;

			}
			s += utilities.getRandom(this.syllables.last);

			if (s.length > 6 * lengthMult && Math.random < .8)
				s = utilities.words.getRandomWord();
			if (s.length > 9 * lengthMult && Math.random < .9)
				s = utilities.words.getRandomWord();

			if (s.length < 6 * lengthMult && Math.random() < .2)
				s += " " + utilities.words.getRandomWord();
			else if (s.length < 6 * lengthMult && Math.random() < .2)
				s += "'" + utilities.getRandom(this.syllables.last);

			return s;
		},

		getDollName: function() {
			return utilities.capitaliseFirstLetter(utilities.words.getRandomWord());
		}
	},

	arrayToString: function(array) {
		s = "";
		$.each(array, function(index, obj) {
			if (index !== 0)
				s += ", ";
			s += obj;
		});
		return s;
	},
	inSquareBrackets: function(s) {
		return "[" + s + "]";
	},
	getSpacer: function(count) {
		var s = "";
		for (var i = 0; i < count; i++) {
			s += " ";
		}
		return s;
	},

	getTabSpacer: function(count) {
		var s = "";
		for (var i = 0; i < count; i++) {
			s += "\t";
		}
		return s;
	},

	sigmoid: function(v) {
		return 1 / (1 + Math.pow(Math.E, -v));
	},

	sCurve: function(v, iterations) {
		if (iterations === undefined)
			iterations = 1;
		for (var i = 0; i < iterations; i++) {
			var v2 = .5 - .5 * Math.cos(v * Math.PI);
			v = v2;
		}
		return v;
	},

	raiseRatio: function(ratio, boost, pct) {
		return Math.pow(ratio, 2 * boost * (pct - .5))
	},

	within: function(val, min, max) {
		return (val >= min) && (val <= max);
	},

	// Inefficient, fix someday
	// the weight is determined by the function getWeight(index, item, list)
	getWeightedRandomIndex: function(array) {
		var totalWeight = 0;
		var length = array.length;

		for (var i = 0; i < length; i++) {

			totalWeight += array[i];
		};

		var target = Math.random() * totalWeight;
		var cumWeight = 0;

		for (var i = 0; i < length; i++) {
			cumWeight += array[i];

			if (target <= cumWeight) {
				return i;
			}

		};

	},

	// Get a random, from an array
	getRandom: function(array, power) {
		if (power)
			return array[Math.floor(Math.pow(Math.random(), power) * array.length)];
		else
			return array[Math.floor(Math.random() * array.length)];
	},
	getRandomIndex: function(array) {
		return Math.floor(Math.random() * Math.round(array.length - 1));
	},
	getRandomKey: function(obj) {
		return this.getRandom(Object.keys(obj));
	},

	constrain: function(val, lowerBound, upperBound) {
		if (Math.max(val, upperBound) === val)
			return upperBound;
		if (Math.min(val, lowerBound) === val)
			return lowerBound;
		return val;
	},
	lerp: function(start, end, percent) {
		return (start + percent * (end - start));
	},
	lerpAngles: function(start, end, pct) {
		var dTheta = end - start;
	},

	// angle between 0 and 2 PI
	normalizeAngle: function(theta) {
		var twopi = Math.PI * 2;
		theta = (((theta % twopi) + twopi) % twopi);
		return theta;
	},

	// Rertun a random, possible between two numbers
	random: function() {
		if (arguments.length === 0)
			return Math.random();
		if (arguments.length === 1)
			return Math.random() * arguments[i];
		if (arguments.length === 2)
			return Math.random() * (arguments[1] - arguments[0]) + arguments[0];

		return Math.random();
	},
	roundNumber: function(num, places) {
		// default 2 decimal places
		if (places === undefined) {
			return parseFloat(Math.round(num * 100) / 100).toFixed(2);
		} else {
			return parseFloat(Math.round(num * 100) / 100).toFixed(places);
		}
	},
	angleBetween: function(a, b) {
		var dTheta = b - a;
		dTheta = ((dTheta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
		if (dTheta > Math.PI)
			dTheta -= Math.PI * 2;
		return dTheta;
	},

	addSlider: function(parent, overrideOptions, onChange) {

		var options = {
			range: "min",
			value: 50,
			min: 0,
			max: 100,
			step: 1,

		};
		$.extend(options, overrideOptions);

		options.slide = function(event, ui) {
			$("#" + options.key + "amt").text(ui.value);
			console.log("Slide " + ui.value);
			if (onChange !== undefined) {
				onChange(options.key, ui.value);
			}
		};

		// Create an empty slider div
		var optionDiv = $("<div/>", {});
		optionDiv.css({
			"pointer-events": "auto"
		});
		parent.append(optionDiv);

		var slider = $('<div />', {
			id: 'slider_' + options.key,
			class: "tuning_slider",
			value: options.key
		});

		slider.appendTo(optionDiv);
		slider.slider(options);

		// Create a lable
		$('<label />', {
			'for': 'slider_' + options.key,
			text: options.key + ": "
		}).appendTo(optionDiv);

		// Create a lable
		$('<span />', {
			id: options.key + "amt",
			text: options.defaultValue
		}).appendTo(optionDiv);

		return slider;
	},

	HSVtoRGB: function(h, s, v) {
		var r,
			g,
			b;
		h *= 6;
		h = h % 6;

		var i = Math.floor(h);
		var f = h - i;
		var p = v * (1 - s);
		var q = v * (1 - (s * f));
		var t = v * (1 - (s * (1 - f)));
		if (i == 0) {
			r = v;
			g = t;
			b = p;
		} else if (i == 1) {
			r = q;
			g = v;
			b = p;
		} else if (i == 2) {
			r = p;
			g = v;
			b = t;
		} else if (i == 3) {
			r = p;
			g = q;
			b = v;
		} else if (i == 4) {
			r = t;
			g = p;
			b = v;
		} else if (i == 5) {
			r = v;
			g = p;
			b = q;
		}
		r = Math.floor(r * 255);
		g = Math.floor(g * 255);
		b = Math.floor(b * 255);
		return [r, g, b];
	},
};


/*
 *
 */

//================================================================
//================================================================
//================================================================
// KColor: new

function KColor(h, s, l, a) {
	this.h = ((h) % 1 + 1) % 1;
	this.s = s;
	this.l = l;
	this.a = a;
	if (this.a === undefined)
		this.a = 1;
}

// Lerp a [0, 1] value towards 0 or 1
function midLerp(v, a) {
	if (a > 0)
		return a + (1 - a) * v;
	return v * (a + 1);
}


// move the color to saturated darks or desaturated lights
KColor.prototype.shade = function(amt) {
	let s2 = midLerp(this.s, amt * .3);
	let l2 = midLerp(this.l, amt);

	return new KColor(this.h, s2, l2, this.a);


}


// move the color to saturated darks or desaturated lights
KColor.prototype.alpha = function(amt) {

	return new KColor(this.h, this.s, this.l, .3);


}



// move the color to saturated darks or desaturated lights
KColor.prototype.lerp = function(c, amt) {

	return new KColor(lerp(this.h, c.h, amt), lerp(this.s, c.s, amt), lerp(this.l, c.l, amt), lerp(this.a, c.a, amt));


}
KColor.prototype.toCSS = function() {


	if (this.a < 1)
		return "hsla(" + this.h * 360 + ", " + this.s * 100 + "%, " + this.l * 100 + "%, " + this.a + ")";
	return "hsl(" + this.h * 360 + ", " + this.s * 100 + "%, " + this.l * 100 + "%)";
}

KColor.prototype.fill = function(g, shade, opacity) {
	if (opacity === undefined)
		opacity = 1;
	if (shade !== undefined) {
		let s2 = midLerp(this.s, shade * .3);
		let l2 = midLerp(this.l, shade);

		g.fill(this.h, s2, l2, opacity)
	} else
		g.fill(this.h, this.s, this.l, opacity)
}


KColor.prototype.stroke = function(g, shade, opacity) {
	if (opacity === undefined)
		opacity = 1;
	if (shade !== undefined) {
		let s2 = midLerp(this.s, shade * .3);
		let l2 = midLerp(this.l, shade);

		g.stroke(this.h, s2, l2, opacity)
	} else
		g.stroke(this.h, this.s, this.l, opacity)
}


function KGradient() {

}

//================================================================
//================================================================
//================================================================

var Vector = function(x, y, z) {

	if (Array.isArray(x)) {
		this.x = x[0];
		this.y = x[1];
		this.z = x[2];
	} else {
		// actually another vector, clone it
		if (x === undefined) {
			this.x = 0;
			this.y = 0;
			this.z = 0;
		} else {
			if (x.x !== undefined) {
				this.x = x.x;
				this.y = x.y;
				this.z = x.z;
			} else {
				this.x = x;
				this.y = y;

				this.z = 0;
				if (z !== undefined)
					this.z = z;

			}
		}
	}
	//if (!this.isValid())
	//	throw new Error(this.invalidToString() + " is not a valid vector");
}

function extend(a, b) {
	for (var key in b)
		if (b.hasOwnProperty(key))
			a[key] = b[key];
	return a;
}

extend(Vector.prototype, {
	clone: function() {
		return new Vector(this);
	},

	cloneInto: function(v) {
		v.x = this.x;
		v.y = this.y;
		v.z = this.z;
		return this;
	},

	addMultiple: function(v, m) {
		this.x += v.x * m;
		this.y += v.y * m;
		this.z += v.z * m;
		return this;
	},
	addPolar: function(r, theta) {
		this.x += r * Math.cos(theta);
		this.y += r * Math.sin(theta);
		return this;
	},

	addSpherical: function(r, theta, phi) {
		this.x += r * Math.cos(theta) * Math.cos(phi);
		this.y += r * Math.sin(theta) * Math.cos(phi);
		this.z += r * Math.sin(phi);
		return this;
	},

	addRotated: function(v, theta) {
		var cs = Math.cos(theta);
		var sn = Math.sin(theta);
		var x = v.x * cs - v.y * sn;
		var y = v.x * sn + v.y * cs;
		this.x += x;
		this.y += y;
		return this;
	},

	setToCSSPos: function(p) {
		this.x = p.left;
		this.y = p.top;
		return this;
	},

	setToPolar: function(r, theta) {
		this.x = r * Math.cos(theta);
		this.y = r * Math.sin(theta);
		return this;
	},
	setToCylindrical: function(r, theta, z) {
		this.x = r * Math.cos(theta);
		this.y = r * Math.sin(theta);
		this.z = z;
		return this;
	},

	setToPolarOffset: function(v, r, theta) {
		this.x = v.x + r * Math.cos(theta);
		this.y = v.y + r * Math.sin(theta);
		this.z = v.z;
	},

	setToSpherical: function(r, theta, phi) {
		this.x = r * Math.cos(theta) * Math.cos(phi);
		this.y = r * Math.sin(theta) * Math.cos(phi);
		this.z = r * Math.sin(phi);
		return this;
	},

	setToMultiple: function(v, m) {
		this.x = v.x * m;
		this.y = v.y * m;
		this.z = v.z * m;
		return this;
	},

	setToLerp: function(v0, v1, m) {
		var m1 = 1 - m;
		this.x = v0.x * m1 + v1.x * m;
		this.y = v0.y * m1 + v1.y * m;
		this.z = v0.z * m1 + v1.z * m;
		return this;
	},

	setToAddMultiple: function(v0, m0, v1, m1) {
		this.x = v0.x * m0 + v1.x * m1;
		this.y = v0.y * m0 + v1.y * m1;
		this.z = v0.z * m0 + v1.z * m1;
		return this;
	},

	setToDifference: function(v0, v1) {
		this.x = v0.x - v1.x;
		this.y = v0.y - v1.y;
		this.z = v0.z - v1.z;
		return this;
	},

	setTo: function(x, y, z) {
		// Just in case this was passed a vector
		if (x.x !== undefined) {
			this.x = x.x;
			this.y = x.y;
			this.z = x.z;
			if (this.z === undefined)
				this.z = 0;

		} else {
			this.x = x;
			this.y = y;
			if (z !== undefined)
				this.z = z;
		}
		if (!this.isValid())
			throw new Error(this.invalidToString() + " is not a valid vector");
		return this;
	},

	setScreenPosition: function(g) {
		if (this.screenPos === undefined)
			this.screenPos = new Vector();

		this.screenPos.setTo(g.screenX(this.x, this.y), g.screenY(this.x, this.y));
		return this;
	},

	magnitude: function() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	},

	normalize: function() {
		this.div(this.magnitude());
		return this;
	},

	constrainMagnitude: function(min, max) {
		var d = this.magnitude();
		if (d !== 0) {
			var d2 = utilities.constrain(d, min, max);
			this.mult(d2 / d);
		}
		return this;
	},

	getDistanceTo: function(p) {
		var dx = this.x - p.x;
		var dy = this.y - p.y;
		var dz = this.z - p.z;
		return Math.sqrt(dx * dx + dy * dy + dz * dz);
	},

	getDistanceToIgnoreZ: function(p) {
		var dx = this.x - p.x;
		var dy = this.y - p.y;

		return Math.sqrt(dx * dx + dy * dy);
	},

	getAngleTo: function(p) {
		var dx = this.x - p.x;
		var dy = this.y - p.y;
		//var dz = this.z - p.z;
		return Math.atan2(dy, dx);
	},


	getNormalTo: function(p) {
		var dx = this.x - p.x;
		var dy = this.y - p.y;
		return (new Vector(-dy, dx)).normalize();
	},

	//===========================================================
	//===========================================================
	// Complex geometry

	dot: function(v) {
		return v.x * this.x + v.y * this.y + v.z * this.z;
	},
	cross: function(v) {
		return new Vector(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x);
	},

	getAngleBetween: function(v) {
		return Math.acos(this.dot(v) / (this.magnitude() * v.magnitude()));
	},

	getCrossAngleBetween: function(v) {
		var cross = this.cross(v);
		if (cross.z > 0)
			return -Math.asin(cross.magnitude() / (this.magnitude() * v.magnitude()));
		else
			return Math.asin(cross.magnitude() / (this.magnitude() * v.magnitude()));
	},

	getNormalizedAngleBetween: function(v) {
		var theta0 = this.getAngle();
		var theta1 = v.getAngle();
		return normalizeAngle(theta1 - theta0);
	},

	isInTriangle: function(triangle) {

		//credit: http://www.blackpawn.com/texts/pointinpoly/default.html
		var ax = triangle[0].x;
		var ay = triangle[0].y;
		var bx = triangle[1].x;
		var by = triangle[1].y;
		var cx = triangle[2].x;
		var cy = triangle[2].y;

		var v0 = [cx - ax, cy - ay];
		var v1 = [bx - ax, by - ay];
		var v2 = [this.x - ax, this.y - ay];

		var dot00 = (v0[0] * v0[0]) + (v0[1] * v0[1]);
		var dot01 = (v0[0] * v1[0]) + (v0[1] * v1[1]);
		var dot02 = (v0[0] * v2[0]) + (v0[1] * v2[1]);
		var dot11 = (v1[0] * v1[0]) + (v1[1] * v1[1]);
		var dot12 = (v1[0] * v2[0]) + (v1[1] * v2[1]);

		var invDenom = 1 / (dot00 * dot11 - dot01 * dot01);

		var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
		var v = (dot00 * dot12 - dot01 * dot02) * invDenom;

		return ((u >= 0) && (v >= 0) && (u + v < 1));

	},

	isInPolygon: function(poly) {
		var pt = this;
		for (var c = false,
				i = -1,
				l = poly.length,
				j = l - 1; ++i < l; j = i)
			((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y)) && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x) && (c = !c);
		return c;
	},

	//===========================================================
	//===========================================================
	// Add and sub and mult and div functions

	add: function(x, y, z) {
		if (x.x !== undefined) {

			this.x += x.x;
			this.y += x.y;
			this.z += x.z;
		} else {
			this.x += x;
			this.y += y;
			if (z !== undefined)
				this.z += z;
		}
		return this;
	},

	sub: function(v) {
		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;
		return this;
	},
	mult: function(m) {
		this.x *= m;
		this.y *= m;
		this.z *= m;
		return this;
	},
	div: function(m) {
		this.x /= m;
		this.y /= m;
		this.z /= m;
		return this;
	},
	getOffsetTo: function(v) {
		return new Vector(v.x - this.x, v.y - this.y, v.z - this.z);
	},

	getNormalizedOffsetTo: function(v) {
		let dx = v.x - this.x;
		let dy = v.y - this.y;
		let dz = v.z - this.z;
		let m = Math.sqrt(dx * dx + dy * dy + dz * dz);
		return new Vector(dx / m, dy / m, dz / m);
	},

	setToNormalizedOffset: function(u, v) {
		let dx = v.x - u.x;
		let dy = v.y - u.y;
		let dz = v.z - u.z;
		let m = Math.sqrt(dx * dx + dy * dy + dz * dz);
		this.x = dx / m;
		this.y = dy / m;
		this.z = dz / m;
		return this;
	},

	addNormalizedDifference: function(u, v, n) {
		if (n === undefined)
			n = 1;
		let dx = v.x - u.x;
		let dy = v.y - u.y;
		let dz = v.z - u.z;
		let m = Math.sqrt(dx * dx + dy * dy + dz * dz);
		this.x += n * dx / m;
		this.y += n * dy / m;
		this.z += n * dz / m;
		return this;
	},

	getAngle: function() {
		return Math.atan2(this.y, this.x);
	},

	rotate: function(theta) {
		var cs = Math.cos(theta);
		var sn = Math.sin(theta);
		var x = this.x * cs - this.y * sn;
		var y = this.x * sn + this.y * cs;
		this.x = x;
		this.y = y;
		return this;
	},

	rotateX: function(theta) {
		var cs = Math.cos(theta);
		var sn = Math.sin(theta);
		var z = this.z * cs - this.y * sn;
		var y = this.z * sn + this.y * cs;
		this.z = z;
		this.y = y;
		return this;
	},

	//===========================================================
	//===========================================================

	// Lerp a vector!
	lerp: function(otherVector, percent) {
		this.x = utilities.lerp(this.x, otherVector.x, percent);
		this.y = utilities.lerp(this.y, otherVector.y, percent)
		this.z = utilities.lerp(this.z, otherVector.z, percent);
		return this;
	},

	//===========================================================
	//===========================================================
	isValid: function() {
		var hasNaN = isNaN(this.x) || isNaN(this.y) || isNaN(this.z);
		var hasUndefined = this.x === undefined || this.y === undefined || this.z === undefined;
		var hasInfinity = Math.abs(this.x) === Infinity || Math.abs(this.y) === Infinity || Math.abs(this.z) === Infinity;

		var valid = !(hasNaN || hasUndefined || hasInfinity);
		// if (!valid)
		//   console.log(hasNaN + " " + hasUndefined + " " + hasInfinity);
		return valid;
	},


	//===========================================================
	//===========================================================
	translateTo: function(g) {
		g.translate(this.x, this.y);
	},

	//===========================================================
	//===========================================================

	bezier: function(g, c0, c1) {
		g.bezierVertex(c0.x, c0.y, c1.x, c1.y, this.x, this.y);
	},

	bezierTo: function(g, c0, c1, p) {
		g.bezier(this.x, this.y, c0.x, c0.y, c1.x, c1.y, p.x, p.y);
	},
	bezierWithRelativeControlPoints: function(g, p, c0, c1) {
		g.bezierVertex(p.x + c0.x, p.y + c0.y, this.x + c1.x, this.y + c1.y, this.x, this.y);
	},

	bezierWithPolarControlPoints: function(g, p, r0, theta0, r1, theta1) {
		g.bezierVertex(p.x + r0 * Math.cos(theta0), p.y + r0 * Math.sin(theta0), this.x + r1 * Math.cos(theta1), this.y + r1 * Math.sin(theta1), this.x, this.y);
	},

	vertex: function(g) {
		g.vertex(this.x, this.y);
	},

	offsetVertex: function(g, offset, m) {
		if (m === undefined)
			m = 1;
		g.vertex(this.x + offset.x * m, this.y + offset.y * m);
	},
	polarOffsetVertex: function(g, r, theta) {

		g.vertex(this.x + r * Math.cos(theta), this.y + r * Math.sin(theta));
	},

	drawCircle: function(g, radius) {
		g.ellipse(this.x, this.y, radius, radius);
	},

	drawOffsetCircle: function(g, offset, radius) {
		g.ellipse(this.x + offset.x, this.y + offset.y, radius, radius);
	},

	drawOffsetMultipleCircle: function(g, offset, m, radius) {
		g.ellipse(this.x + offset.x * m, this.y + offset.y * m, radius, radius);
	},

	drawLineTo: function(g, v) {
		g.line(this.x, this.y, v.x, v.y);
	},

	drawOffsetLineTo: function(g, v, m, offset) {
		var mx = m * offset.x;
		var my = m * offset.y;

		g.line(this.x + mx, this.y + my, v.x + mx, v.y + my);
	},

	drawEndOffsetLineTo: function(g, p, u, v) {
		var ex = p.x - this.x;
		var ey = p.y - this.y;
		var d = Math.sqrt(ex * ex + ey * ey);
		var nx = ey / d;
		var ny = -ex / d;
		var mx = u * nx;
		var my = u * ny;

		var dx = v * ex / d;
		var dy = v * ey / d;


		g.line(this.x + mx + dx, this.y + my + dy, p.x + mx - dx, p.y + my - dy);
	},

	drawLerpedLineTo: function(g, v, startLerp, endLerp) {
		var dx = v.x - this.x;
		var dy = v.y - this.y;

		g.line(this.x + dx * startLerp, this.y + dy * startLerp, this.x + dx * endLerp, this.y + dy * endLerp);
	},

	drawArrow: function(g, v, m) {
		g.line(this.x, this.y, v.x * m + this.x, v.y * m + this.y);
	},


	drawPolarLine: function(g, r, theta) {
		g.line(this.x, this.y, r * Math.cos(theta) + this.x, r * Math.sin(theta) + this.y);
	},
	drawPolarCircle: function(g, r, theta, radius) {
		g.ellipse(r * Math.cos(theta) + this.x, r * Math.sin(theta) + this.y, radius, radius);
	},

	drawArrowHead: function(g, v, m) {
		var head = 10;
		var d = v.magnitude() * m;
		g.pushMatrix();
		g.rotate(v.getAngle());
		g.beginShape();
		g.vertex(d, 0);
		g.vertex(d - head * 1.2, -head * .3);
		g.vertex(d - head);
		g.vertex(d - head * 1.2, head * .3);

		g.endShape();
		g.popMatrix();
	},

	drawArrowWithHead: function(g, v, m, headSize, offsetLength, offsetNormal) {
		if (isNaN(offsetLength))
			offsetLength = 0;
		if (isNaN(offsetNormal))
			offsetNormal = 0;
		if (isNaN(headSize))
			headSize = 10;

		var head = headSize;
		var d = v.magnitude() * m;
		g.pushMatrix();
		g.translate(this.x, this.y);
		g.rotate(v.getAngle());
		g.translate(offsetLength, offsetNormal);
		g.line(0, 0, d - head, 0);
		g.noStroke();

		g.beginShape();
		g.vertex(d, 0);
		g.vertex(d - head * 1.2, -head * .5);
		g.vertex(d - head);
		g.vertex(d - head * 1.2, head * .5);

		g.endShape();
		g.popMatrix();
	},

	drawAngle: function(g, r, theta) {
		g.line(this.x, this.y, r * Math.cos(theta) + this.x, r * Math.sin(theta) + this.y);
	},

	drawAngleBall: function(g, r, theta, radius) {
		g.ellipse(r * Math.cos(theta) + this.x, r * Math.sin(theta) + this.y, radius, radius);
	},

	drawArc: function(g, r, theta0, theta1) {
		var range = theta1 - theta0;
		var segments = Math.ceil(range / .2);
		for (var i = 0; i < segments + 1; i++) {
			var theta = theta0 + range * (i / segments);
			g.vertex(this.x + r * Math.cos(theta), this.y + r * Math.sin(theta));
		}
	},

	drawText: function(g, s, xOffset, yOffset) {
		g.text(s, this.x + xOffset, this.y + yOffset);
	},
	//===========================================================
	//===========================================================
	toThreeVector: function() {
		return new THREE.Vector3(this.x, this.y, this.z);
	},
	toSVG: function() {
		return Math.round(this.x) + " " + Math.round(this.y);
	},

	polarOffsetToSVG: function(r, theta) {
		return Math.round(this.x + r * Math.cos(theta)) + " " + Math.round(this.y + r * Math.sin(theta));
	},

	toB2D: function() {
		return new Box2D.b2Vec2(this.x, -this.y);
	},

	toCSSDimensions: function() {
		return {
			width: this.x + "px",
			height: this.y + "px",

		};
	},

	toCSSTranslate: function() {
		return "translate(" + this.x.toFixed(2) + "px, " + this.y.toFixed() + "px)";
	},

	toSVGPathL: function() {
		return "L" + this.x.toFixed(2) + " " + this.y.toFixed(2) + " ";
	},

	toSVGPathM: function() {
		return "M" + this.x.toFixed(2) + " " + this.y.toFixed(2) + " ";
	},

	toSVGPathC: function(cp0, cp1) {
		return "C" + cp0.x.toFixed(2) + " " + cp0.y.toFixed(2) + ", " + cp1.x.toFixed(2) + " " + cp1.y.toFixed(2) + ", " + this.x.toFixed(2) + " " + this.y.toFixed(2) + " ";
	},

	toSVGPathS: function(cp1) {
		return "S" + cp1.x.toFixed(2) + " " + cp1.y.toFixed(2) + ", " + this.x.toFixed(2) + " " + this.y.toFixed(2) + " ";
	},

	toSVGPathT: function() {
		return "T" + this.x.toFixed(2) + " " + this.y.toFixed(2) + " ";
	},

	//===========================================================
	//===========================================================

	toString: function(precision) {
		if (precision === undefined)
			precision = 2;

		return "(" + this.x.toFixed(precision) + ", " + this.y.toFixed(precision) + ", " + this.z.toFixed(precision) + ")";
	},

	toSimpleString: function() {
		precision = 1;
		return "(" + this.x.toFixed(precision) + ", " + this.y.toFixed(precision) + ")";

	},

	invalidToString: function() {

		return "(" + this.x + ", " + this.y + ", " + this.z + ")";
	},
});

// Class functions
Vector.sub = function(a, b) {
	return new Vector(a.x - b.x, a.y - b.y, a.z - b.z);
};
// Class functions
Vector.add = function(a, b) {
	return new Vector(a.x + b.x, a.y + b.y, a.z + b.z);
};

Vector.dot = function(a, b) {
	return a.x * b.x + a.y * b.y + a.z * b.z;
};

Vector.polar = function(r, theta) {
	return new Vector(r * Math.cos(theta), r * Math.sin(theta));
};

Vector.polarOffset = function(v, r, theta) {
	return new Vector(v.x + r * Math.cos(theta), v.y + r * Math.sin(theta), v.z);
};

Vector.multiPolarOffset = function(v, r, theta, r0, theta0) {
	return new Vector(v.x + r * Math.cos(theta) + r0 * Math.cos(theta0), v.y + r * Math.sin(theta) + r0 * Math.sin(theta0), v.z);
};

Vector.angleBetween = function(a, b) {
	return Math.acos(Vector.dot(a, b) / (a.magnitude() * b.magnitude()));
};

Vector.addMultiples = function(u, m, v, n) {
	var p = new Vector();
	p.addMultiple(u, m);
	p.addMultiple(v, n);
	return p;
};

Vector.average = function(array) {
	var avg = new Vector();
	$.each(array, function(index, v) {
		avg.add(v);
	});
	avg.div(array.length);
	return avg;
};

Vector.calculateIntersection = function(p, q, u, v) {
	var s = Vector.sub(p, u);
	var m = (s.y / v.y - s.x / v.x) / (q.x / v.x - q.y / v.y);

	var n0 = s.x / v.x + m * q.x / v.x;

	// for verification
	//var n1 = s.y / v.y + m * q.y / v.y;
	return [m, n0];
};



function getRandom(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}


function getRandomProperty(obj) {

	return getRandom(Object.keys(obj));
}


// WIP
function splitStrict(s, splitChar) {
	var escape = false;
	var sections = [];
	var levels = [];

	var lastEnd = 0;

	function pushLevel(index, c, mate, selfmate) {
		// At base level?
		if (levels.length === 0) {
			levels.push({
				index: index,
				mate: mate,
				selfmate: selfmate
			});
		}

		// not at base level
		else {
			//ignore
		}
	}

	function popLevel(index, mate, selfmate) {
		var last = levels[levels.length - 1];
		if (last.mate === mate) {
			levels.pop();

		} else {
			//console.warn ("Mismatched: expected " + last.mate + " got " + mate);
		}
	}

	function splitAt(i) {
		if (levels.length === 0) {
			sections.push(s.substring(lastEnd, i));
			lastEnd = i + 1;
		}
	}

	for (var i = 0; i < s.length; i++) {

		if (!escape) {
			var c = s.charAt(i);
			switch (c) {
				case "\\":
					escape = true;
					break;
				case "{":
					pushLevel(i, "{", "}");
					break;
				case "(":
					pushLevel(i, "(", ")");
					break;
				case "[":
					pushLevel(i, "[", "]");
					break;

				case "}":
					popLevel(i, "}");
					break;
				case ")":
					popLevel(i, ")");
					break;
				case "]":
					popLevel(i, "]");
					break;

				case "'":
					if (levels.length === 0)
						pushLevel(i, "'", "'", true);
					else
						popLevel(i, "'", true);
					break;
				case "\"":
					if (levels.length === 0)
						pushLevel(i, '"', '"', true);
					else
						popLevel(i, '"', true);

					break;

				case splitChar:
					splitAt(i);
					break;

			}

		} else {
			escape = false;
		}


	}

	splitAt(s.length);


	if (levels.length > 0)
		console.warn("Mismatched: expected ", levels.map(function(level) {
			return level.mate + " " + level.index;
		}).join(", "));

	return sections;

}


function toClosedTag(tagName, attributes) {
	var s = "<" + tagName;
	if (attributes) {
		$.each(attributes, function(key, val) {
			s += " " + key + "=" + inQuotes(val);
		});

	}
	s += "/>";
	return s;
}



function toTag(tagName, attributes, contents) {
	var s = "<" + tagName;
	if (attributes) {

		if (Array.isArray(attributes)) {
			$.each(attributes, function(key, attr2) {
				if (attr2 !== undefined) {
					$.each(attr2, function(key, val) {
						s += " " + key + "=" + inQuotes(val);
					});
				}
			});
		} else {

			$.each(attributes, function(key, val) {
				s += " " + key + "=" + inQuotes(val);
			});
		}
	}
	s += ">" + (contents ? contents : "") + "</" + tagName + ">";
	return s;
}

function inEscapedQuotes(s) {
	return '\\"' + s + '\\"';
}

function inQuotes(s) {
	return '"' + s + '"';
}

function inParens(s) {
	return '(' + s + ')';
}

function inBrackets(s) {
	return '[' + s + ']';
}

function lerp(a, b, pct) {
	return a + (b - a) * pct;
}

function pushToEdges(a, b) {


	if (b < .5) {

		return lerp(0, a, b * 2)
	}
	return lerp(a, 1, (b - .5) * 2)
}