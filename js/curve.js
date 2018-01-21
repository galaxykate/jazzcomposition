/* 
 * A curve
 * contains points, but does not edit them
 */

function CurveHandle(p, index) {
	this.p = p;
	this.index = index;
	this.theta = 0;
	this.r = 0;

	this.c = new Vector()

	this.update();

}

CurveHandle.prototype.setTheta = function(theta) {
	this.theta = theta
	this.c.setToPolarOffset(this.p, this.r, this.theta);
}


CurveHandle.prototype.update = function() {
	this.c.setToPolarOffset(this.p, this.r, this.theta);
}

CurveHandle.prototype.debugDraw = function(g) {
	if (this.r > 0) {
		g.stroke(0);
		this.p.drawLineTo(g, this.c);
		g.noStroke();
		g.fill(.4 + .5 * this.index, 1, 1);
		this.c.drawCircle(g, 2);
	}

}
//======================================================
//======================================================
// CurvePoint
//======================================================

function CurvePoint(p, r0, r1, theta0, theta1) {

	this.curveDot = 0;

	this.p = p;
	this.h = [new CurveHandle(p, 0), new CurveHandle(p, 1)]
	this.setHandles(r0, r1, theta0, theta1)

	this.curveDir = new Vector();
	this.curveSmoothDir = new Vector();
	this.curveAcc = new Vector();
	this.springTheta = 0
}

CurvePoint.prototype.setHandles = function(r0, r1, theta0, theta1) {
	if (r0 === undefined)
		r0 = 30;
	if (r1 === undefined)
		r1 = r0;
	if (theta0 === undefined)
		theta0 = 0;
	if (theta1 === undefined)
		theta1 = theta0 + Math.PI;
	this.h[0].r = r0;
	this.h[0].theta = theta0;
	this.h[1].r = r1;
	this.h[1].theta = theta1;
	this.h[0].update();
	this.h[1].update();
}

CurvePoint.prototype.drawHandles = function(g) {
	this.h[0].debugDraw(g)
	this.h[1].debugDraw(g)

	g.stroke(.9, 1, 1);
	this.p.drawArrow(g, this.curveSmoothDir, 10)
}


CurvePoint.prototype.setCurveSmoothDir = function(p0, p1) {
	this.curveSmoothDir.mult(0)
	if (p0)
		this.curveSmoothDir.addNormalizedDifference(p0, this.p, 1)
	if (p1)
		this.curveSmoothDir.addNormalizedDifference(this.p, p1, 1)

	let theta = this.curveSmoothDir.getAngle();

	this.h[0].theta = theta + Math.PI
	this.h[1].theta = theta
	this.h[0].update()
	this.h[1].update()

}

CurvePoint.prototype.update = function(g) {
	this.h[0].update()
	this.h[1].update()
}

//======================================================
//======================================================
// Curve Edge
//======================================================

function CurveEdge(start, end) {
	this.start = start;
	this.end = end;
	this.edge = new Vector();
	this.en = new Vector();
	this.normal = new Vector();
	this.m = 0;
	this.angle = 0
}

CurveEdge.prototype.update = function() {

	this.edge.setToDifference(this.end.p, this.start.p)
	this.m = this.edge.magnitude();
	this.angle = this.edge.getAngle();
	this.en.setToMultiple(this.edge, 1 / this.m)
}

CurveEdge.prototype.draw = function(g) {

}

//======================================================
//======================================================
// Curve
//======================================================
let curveCount = Math.floor((Math.random()*10000));

function Curve() {

	this.points = [];
	this.edges = [];
	this.id = curveCount++;

}
Curve.prototype.getPoint = function(segment, t) {
	if (segment > this.points.length - 2)
		return this.points[0].p;

	//	console.log(segment, t, this.points.length)

	let p0 = this.points[segment].p
	let p1 = this.points[segment + 1].p
	let c0 = this.points[segment].h[1].c
	let c1 = this.points[segment + 1].h[0].c

	let t1 = 1 - t
	let p = new Vector(t1 * t1 * t1 * p0.x +
		3 * t1 * t1 * t * c0.x +
		3 * t * t * t1 * c1.x +
		t * t * t * p1.x,

		t1 * t1 * t1 * p0.y +
		3 * t1 * t1 * t * c0.y +
		3 * t * t * t1 * c1.y +
		t * t * t * p1.y)
	//console.log(p.toSimpleString())
	return p;
}

Curve.prototype.update = function(t) {
	for (var i = 0; i < this.points.length; i++) {
		let r = .5 + .5 * utilities.noise(.1 * t.current + .2 * i + this.id)
		let theta = 30 * utilities.noise(.04 * t.current + .2 * i + this.id)
		this.points[i].p.addPolar(r, theta);
		this.points[i].p.mult(.9998)

		if (i > 0)
			this.points[i].p.lerp(this.points[i - 1].p, .0009)
		if (i < this.points.length - 1)
			this.points[i].p.lerp(this.points[i + 1].p, .0009)
	}
	this.smooth();

}

Curve.prototype.getClosestPoint = function(p, range) {}

Curve.prototype.addPoint = function(p, r0, r1, theta0, theta1) {
	let cp = new CurvePoint(p, r0, r1, theta0, theta1)
	this.points.push(cp);

	if (this.last) {
		let edge = new CurveEdge(this.last, cp)

		this.edges.push(edge)
	}

	this.last = cp
	return this;
}


Curve.prototype.smooth = function() {
	for (var i = 0; i < this.points.length; i++) {
		this.points[i].curveDir.mult(0)
		this.points[i].curveAcc.mult(0)
		this.points[i].curveDot = 1
	}

	for (var i = 0; i < this.edges.length; i++) {
		this.edges[i].start.curveDir.add(this.edges[i].en)
		this.edges[i].start.curveAcc.add(this.edges[i].en)
		this.edges[i].end.curveDir.add(this.edges[i].en)
		this.edges[i].end.curveAcc.sub(this.edges[i].en)
	}

	for (var i = 0; i < this.edges.length; i++) {
		this.edges[i].update();

	}

	for (var i = 0; i < this.points.length; i++) {
		let e0 = this.edges[i - 1];
		let e1 = this.edges[i];
		let p = this.points[i]
		let r0 = 0;
		let r1 = 0;


		if (e0 && e1) {
			p.curveDot = Vector.dot(e0.en, e1.en)
		}

		p.handleR = ((.8 - .5 * p.curveDot) * .8) * Math.pow(.5 + .5 * p.curveDot, .5);
		// get the back edge
		if (e0)
			r0 = e0.m * p.handleR;
		if (e1)
			r1 = e1.m * p.handleR;

		p.setHandles(r0, r1, p.curveDir.getAngle() + Math.PI)
		p.update()
	}


	// Double smooth 
	for (var i = 0; i < smoothCount; i++) {
		this.extrasmooth();
	}


}

Curve.prototype.extrasmooth = function() {
	for (var i = 0; i < this.points.length; i++) {
		let p = this.points[i]
		let p0 = this.points[i - 1]
		let p1 = this.points[i + 1]
		let c0, c1;
		if (p0)
			c0 = p0.h[1].c
		if (p1)
			c1 = p1.h[0].c

		p.setCurveSmoothDir(c0, c1)
	}
}


Curve.prototype.drawHandles = function(g) {
	for (var i = 0; i < this.points.length; i++) {
		let p = this.points[i]
		p.drawHandles(g)
		g.fill(1)

		g.text(p.curveDot.toFixed(2), p.p.x, p.p.y)
	}
	for (var i = 0; i < this.edges.length; i++) {

		this.edges[i].draw(g);
	}

}

Curve.prototype.drawPoints = function(g) {
	for (var i = 0; i < this.points.length; i++) {
		this.points[i].p.drawCircle(g, this.points[i].p.radius)
	}
}

Curve.prototype.draw = function(g, startIndex, endIndex) {
	g.beginShape();
	this.drawVerts(g, startIndex, endIndex)
	g.endShape();
}


Curve.prototype.drawVerts = function(g, startIndex, endIndex) {

	if (startIndex === undefined)
		startIndex = 0
	if (endIndex === undefined)
		endIndex = this.points.length

	if (this.points.length > 0) {

		g.vertex(this.points[startIndex].p.x, this.points[startIndex].p.y);

		for (var i = startIndex + 1; i < endIndex; i++) {
			let c0 = this.points[i - 1].h[1].c;
			let c1 = this.points[i].h[0].c;
			let p = this.points[i].p;
			g.bezierVertex(c0.x, c0.y, c1.x, c1.y, p.x, p.y);
		}

	}



}

Curve.prototype.drawVertsReverse = function(g, startIndex, endIndex) {

	if (startIndex === undefined)
		startIndex = 0
	if (endIndex === undefined)
		endIndex = this.points.length

	if (this.points.length > 0) {

		g.vertex(this.points[endIndex - 1].p.x, this.points[endIndex - 1].p.y);

		for (var i = endIndex - 2; i >= startIndex; i--) {

			let c0 = this.points[i + 1].h[0].c;
			let c1 = this.points[i].h[1].c;
			let p = this.points[i].p;
			g.bezierVertex(c0.x, c0.y, c1.x, c1.y, p.x, p.y);
		}

	}



}