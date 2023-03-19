/**
 * Infinity drawing canvas, able to dragging and scaling
 * Need to refactor
 * Some events and interfaces have been deprecated
 */

import { Vector2 } from "./basic-item";

// get local mouse position
function _getMousePos(canvas, evt) {
	const rect = canvas.getBoundingClientRect();
	return new Vector2(evt.clientX - rect.left, evt.clientY - rect.top);
}

/*
 This class handles panning and zooming of scene
 Tracks mouse movement, position and clicks
 Also converts from scene space to screen space and
 vice versa.
*/
export class SceneView {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;

	// screen/canvas space
	globalMousePos: Vector2;

	mousePos: Vector2;
	prevMousePos: Vector2;
	mouseDownPos: Vector2;      // pos of last mouse down
	mouseDragDiff: Vector2;     // mouse drag diff

	zoomFactor: number;
	offset: Vector2;

	panning: boolean;
	panStart: SVGPoint;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.context = this.canvas.getContext("2d");

		const self = this;
		canvas.addEventListener("mousemove", function(evt: MouseEvent) {
			self.onMouseMove(evt);
		});
		canvas.addEventListener("mousedown", function(evt: MouseEvent) {
			self.onMouseDown(evt);
		});
		canvas.addEventListener("mouseup", function(evt: MouseEvent) {
			self.onMouseUp(evt);
		});
		canvas.addEventListener("mouseout", function(evt: MouseEvent) {
			self.onMouseOut(evt);
		});
		canvas.addEventListener("mousewheel", function(evt: WheelEvent) {
			self.onMouseScroll(evt);
		});
		canvas.addEventListener("contextmenu", function(evt: MouseEvent) {
			evt.preventDefault();
		});

		// todo: do document mouse move event callback too
		document.addEventListener("mousemove", function(evt: MouseEvent) {
			self.onGlobalMouseMove(evt);
		});

		this.zoomFactor = 1;
		this.offset = new Vector2(0, 0);

		this.mousePos = new Vector2(0, 0);
		this.globalMousePos = new Vector2(0, 0);
	}

	getAbsPos() {
		return new Vector2(this.canvas.offsetLeft, this.canvas.offsetTop);
	}

	isMouseOverCanvas() {
		const rect = this.canvas.getBoundingClientRect();
		//console.log(rect);
		if (this.globalMousePos.x < rect.left) return false;
		if (this.globalMousePos.y < rect.top) return false;
		if (this.globalMousePos.x > rect.right) return false;
		if (this.globalMousePos.y > rect.bottom) return false;

		return true;
	}

	onMouseDown(evt: MouseEvent) {
		if (evt.button == 1 || evt.button == 2) {
			this.panning = true;

			this.mouseDownPos = _getMousePos(this.canvas, evt);
		}

		this.mousePos = _getMousePos(this.canvas, evt);
	}

	onMouseUp(evt: MouseEvent) {
		if (evt.button == 1 || evt.button == 2) {
			this.panning = false;
		}
	}

	onMouseMove(evt: MouseEvent) {
		this.prevMousePos = this.mousePos;
		this.mousePos = _getMousePos(this.canvas, evt);

		if (this.panning) {
			const prev = this.canvasToScene(this.prevMousePos);
			const cur = this.canvasToScene(this.mousePos);
			const diff = new Vector2(prev.x - cur.x, prev.y - cur.y);
			this.mouseDragDiff = diff;

			const factor = this.zoomFactor;
			this.offset.x -= diff.x * factor;
			this.offset.y -= diff.y * factor;
		}
	}

	onGlobalMouseMove(evt: MouseEvent) {
		this.globalMousePos = new Vector2(evt.pageX, evt.pageY);
	}

	onMouseScroll(evt: WheelEvent) {
		// no panning while zooming
		if (this.panning) return;

		const pos = _getMousePos(this.canvas, evt);
		const delta = (<any>evt).wheelDelta > 0 ? 1.1 : 1.0 / 1.1;

		// offset from mouse pos
		// find offset from previous zoom then move offset by that value

		this.zoomFactor *= delta;
		this.offset.x = pos.x - (pos.x - this.offset.x) * delta; // * (factor);
		this.offset.y = pos.y - (pos.y - this.offset.y) * delta; // * (factor);

		//this.zoom(pos.x, pos.y, delta);

		evt.preventDefault();
		return false;
	}

	onMouseOut(evt: MouseEvent) {
		// cancel panning
		this.panning = false;
	}

	get sceneCenter(): Vector2 {
		return this.canvasToSceneXY(this.canvas.width / 2, this.canvas.height / 2);
	}

	zoom(x: number, y: number, level: number) {}

	clear(context: CanvasRenderingContext2D, style = "rgb(50,50,50)") {
		const ctx = context;

		ctx.setTransform(1, 0, 0, 1, 0, 0);
		//ctx.fillStyle = "rgb(50,50,50)";
		ctx.fillStyle = style;
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	setViewMatrix(context: CanvasRenderingContext2D) {
		context.setTransform(
			this.zoomFactor,
			0,
			0,
			this.zoomFactor,
			this.offset.x,
			this.offset.y
		);
	}

	drawGrid(
		ctx: CanvasRenderingContext2D,
		GRID_SIZE: number,
		strokeStyle: string,
		lineWidth: number
	) {
		// todo: convert line points to canvas space, reset context and draw them there to preserve line width

		//const GRID_SIZE = 100;
		const tl = this.canvasToSceneXY(0, 0);
		const br = this.canvasToSceneXY(this.canvas.width, this.canvas.height);

		//ctx.strokeStyle = "#4A5050";
		//ctx.strokeStyle = "#464C4C";
		ctx.strokeStyle = strokeStyle;
		ctx.lineWidth = lineWidth;

		// vertical
		const vCount = (br.x - tl.x) / GRID_SIZE + 1.0;
		const xStart = tl.x - (tl.x % GRID_SIZE);
		for (let i = 0; i < vCount; i++) {
			ctx.beginPath();
			ctx.moveTo(xStart + i * GRID_SIZE, tl.y);
			ctx.lineTo(xStart + i * GRID_SIZE, br.y);
			ctx.stroke();
		}

		// horizontal
		const hCount = (br.y - tl.y) / GRID_SIZE + 1.0;
		const yStart = tl.y - (tl.y % GRID_SIZE);
		for (let i = 0; i < hCount; i++) {
			ctx.beginPath();
			ctx.moveTo(tl.x, yStart + i * GRID_SIZE);
			ctx.lineTo(br.x, yStart + i * GRID_SIZE);
			ctx.stroke();
		}
	}

	canvasToScene(pos: Vector2): Vector2 {
		return new Vector2(
			(pos.x - this.offset.x) * (1.0 / this.zoomFactor),
			(pos.y - this.offset.y) * (1.0 / this.zoomFactor)
		);
	}

	canvasToSceneXY(x: number, y: number): Vector2 {
		return new Vector2(
			(x - this.offset.x) * (1.0 / this.zoomFactor),
			(y - this.offset.y) * (1.0 / this.zoomFactor)
		);
	}

	globalToCanvasXY(x: number, y: number): Vector2 {
		const rect = this.canvas.getBoundingClientRect();
		return new Vector2(x - rect.left, y - rect.top);
	}

	getMouseSceneSpace(): Vector2 {
		return this.canvasToScene(this.mousePos);
	}

	getMouseDeltaCanvasSpace(): Vector2 {
		const prev = this.prevMousePos;
		const cur = this.mousePos;
		const diff = new Vector2(cur.x - prev.x, cur.y - prev.y);

		return diff;
	}

	getMouseDeltaSceneSpace(): Vector2 {
		const prev = this.canvasToScene(this.prevMousePos);
		const cur = this.canvasToScene(this.mousePos);
		const diff = new Vector2(cur.x - prev.x, cur.y - prev.y);

		return diff;
	}
}