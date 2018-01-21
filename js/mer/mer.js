let merCount = Math.floor((Math.random() * 10000))

function Mer() {
	this.id = merCount++;
	this.color = new KColor(30 * utilities.noise(this.id * .2) % 1,
		.6 + .7 * utilities.noise(this.id * .2 + 30), .6 + .8 * utilities.noise(this.id * .2 + 80))


	this.curve = new Curve();

	this.followerCount = 0;
	this.twinCount = Math.floor(Math.random() * Math.random() * 7 + 1);
	//this.twinCount = 1;
	this.twins = []
	for (var i = 0; i < this.twinCount; i++) {
		this.twins.push(new Curve())
	}
}


Mer.prototype.draw = function(g) {
	g.noStroke();
	g.noFill()
	if (this.id % 12 % 4 > 2)
		this.color.fill(g, .4, .4);
	if (this.id % 10 % 3 === 1)
		this.color.stroke(g, -.5, 1);



	this.curve.draw(g);



	g.noStroke();
	let last = this.curve;
	for (var i = 0; i < this.twins.length; i++) {
		g.noStroke();
		g.noFill();
		let c = this.twins[i]
		if (this.id % 2 === 0) {
			this.color.fill(g, -.5 + i * .2, .2);
		}
		if (this.id % 2 === 1) {
			this.color.stroke(g, 1 - i * .2, .6);
		}
		this.twins[i].draw(g)

		if (c.id % 14 % 4 === 0)
			fillBetween(g, this.color, last, c)


		if (c.id % 4 === 0) {

			linesBetween(g, this.color, last, c)
		}
		if (c.id % 9 === 3)
			dots(g, this.color, last)

		last = c;

	}

	if (this.curve.id % 11 % 3 == 1) {
		g.noStroke();
		this.color.fill(g)
		this.curve.drawPoints(g);
	}

}

function fillBetween(g, color, c0, c1) {
	color.fill(g, Math.sin(c0.id), .3 + .3 * utilities.noise(c0.id))

	g.beginShape();
	c0.drawVerts(g)
	c1.drawVertsReverse(g)
	g.endShape();
}


function linesBetween(g, color, c0, c1) {

	for (var i = 0; i < c0.points.length; i++) {
		let subsections = 10;
		for (var j = 0; j < subsections; j++) {

			pct = (j + .5) / subsections;
			color.stroke(g, utilities.noise(c0.id + i + pct))
			let p0 = c0.getPoint(i, pct)
			let p1 = c1.getPoint(i, pct)
			p0.drawLineTo(g, p1)
		}
	}



}

function dots(g, color, c) {
	g.noStroke();
	color.fill(g)
	for (var i = 0; i < c.points.length - 1; i++) {

		let subsections = c.edges[i].m / 10;
		for (var j = 0; j < subsections; j++) {
			pct = (j + .5) / subsections;
			let p0 = c.getPoint(i, pct)
			p0.drawCircle(g, 3)
		}
	}
}



Mer.prototype.update = function(t) {
	this.curve.update(t)
	for (var i = 0; i < this.curve.points.length; i++) {
		let p = this.curve.points[i]
		let theta = p.curveSmoothDir.getAngle() + Math.PI / 2;
		for (var j = 0; j < this.twins.length; j++) {
			let p2 = this.twins[j].points[i]
			let offset = (Math.pow(j, 1.2) + 1) * p.p.radius * (p.curveDot + 1)

			p2.p.setToPolarOffset(p.p, offset, theta)

		}
	}

	for (var i = 0; i < this.twins.length; i++) {
		this.twins[i].smooth()
	}
}


Mer.prototype.addPoint = function(p) {
	let p2 = new Vector(p);
	let l = this.curve.points.length;
	//console.log(l)
	p2.radius = 20 * (utilities.noise(this.id + this.curve.points.length) * .5 + .6)
	//console.log(p2.radius)
	this.curve.addPoint(p2);


	for (var i = 0; i < this.twins.length; i++) {

		this.twins[i].addPoint(new Vector(p))
	}
}


Mer.prototype.getClosestPoint = function(p) {

}

Mer.prototype.getDistanceToLast = function(p) {
	let d = 100000;
	if (this.curve.last)
		d = p.getDistanceTo(this.curve.last.p)
	return d;
}