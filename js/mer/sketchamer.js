let smoothCount = 2;
$(document).keyup((ev) => {
	console.log(ev.which)
	if (ev.which === 49)
		smoothCount = Math.max(smoothCount - 1, 0);
	if (ev.which === 50)
		smoothCount++;
	console.log(smoothCount);
})
$(document).ready(() => {
	console.log("start sketchin' mers")

	$("#clear").click(() => {
		console.log("click")
		mers = []
	})

	let svgHolder = $("#view-svg");
	let w = svgHolder.width();
	let h = svgHolder.height();

	let mers = []

	let objSVG = toTag("defs", {
		id: "defs",
	}) + toTag("g", {
		transform: "translate(" + w / 2 + ", " + h / 2 + ")",
		id: "shapes",
	})


	utilities.createProcessing($("#view-p5"), (t) => {
		//	t.update();
		if (t.frames < 100000) {
			mers.forEach(mer => mer.update(t))
			//mers.forEach(mer => mer.redrawSVG())
		}
		mers.forEach(mer => mer.update(t))
	}, (g) => {
		g.background(1, 1, 1, 0)
		//mers.forEach(mer => mer.draw(g))
		mers.forEach(mer => {

			mer.draw(g)
		})
		//mers.forEach(mer => mer.drawHandles(g))


		//console.log(mouse.p)
		//mouse.draw(g)
	})



	let mouse = {
		p: new Vector(),
		selected: undefined,
		draw: (g) => {
			g.fill(.45, 1, 1, .5)
			mouse.p.drawCircle(g, 15)
			g.fill(.85, 1, 1, .15)
			if (mouse.closestPoint) {
				mouse.closestPoint.drawCircle(g, 20)
			}
		},
		setTo: (ev, ui) => {
			let target = $(ev.target)
			if (ui !== undefined)
				mouse.p.setTo(ui.offset.left, ui.offset.top)
			else
				mouse.p.setTo(ev.offsetX, ev.offsetY)
			mouse.p.x -= target.width() / 2
			mouse.p.y -= target.height() / 2;

		}
	}
	$("#view-p5").mousemove((ev) => {
		mouse.setTo(ev)
		// Calculate closest point
		let closest;
		let closestDist = 100;
		mers.forEach(mer => {
			let p = mer.getClosestPoint(mouse.p, closestDist)
			if (p) {
				closest = p;
				closestDist = d
			}

		})

		mouse.closestPoint = closest;
		//console.log(p)

	}).draggable({
		helper: () => $("<div/>", {
			class: "dot"
		}).css({
			width: 6,
			height: 6,
			background: "black",
			borderRadius: 5,
			pointerEvents: "none",
		}),
		cursorAt: {
			top: 3,
			left: 3
		},

		start: (ev, ui) => {
			//mouse.setTo(ev)

			if (mouse.selected)
				mouse.selected.deselect()

			if (mouse.closestPoint) {
				mouse.draggingPoint = mouse.closestPoint;
				mouse.draggingPoint.isHeld = true;
			} else {
				let c = new Mer();
				c.addPoint(mouse.p)
				mouse.drawingCurve = c;
				mers.push(c)
			}


		},

		stop: (ev, ui) => {
			if (mouse.draggingPoint) {
				mouse.draggingPoint.isHeld = false;
			}
		},

		drag: (ev, ui) => {
			if (mouse.draggingPoint) {
				mouse.draggingPoint.dragTo(mouse.p)
				mouse.draggingPoint.curve.recalculate();
			} else {
				if (mouse.drawingCurve) {
					let d = mouse.drawingCurve.getDistanceToLast(mouse.p);

					if (d > 100) {
						mouse.drawingCurve.addPoint(mouse.p)
					}
				}
			}


		}
	})

	svgHolder.html("<svg width='" + w + "' height='" + h + "' xmlns='http://www.w3.org/2000/svg'>" + objSVG + "</svg>");

})