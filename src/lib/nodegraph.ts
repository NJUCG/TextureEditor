//结点图
import { Node } from "./node/Node";
import { GeneratorNodeScene } from "./scene/generatornodescene";
import { NodeSceneState, NodeScene } from "./scene/nodescene";
import { useMainStore } from '@/store/index';

export class Vector2 {
	x: number;
	y: number;

	constructor(x: number = 0, y: number = 0) {
		this.x = x;
		this.y = y;
	}

	clone(): Vector2 {
		return new Vector2(this.x, this.y);
	}

	static add(a: Vector2, b: Vector2): Vector2 {
		return new Vector2(a.x + b.x, a.y + b.y);
	}

	static subtract(a: Vector2, b: Vector2): Vector2 {
		return new Vector2(a.x - b.x, a.y - b.y);
	}
}

export class NodeGraph {

	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
	// displayNode:
	nodes: Array<GeneratorNodeScene>;
	public hitItem: NodeScene;
	private store;
	public preMousePos: Vector2;


	constructor(canvas: HTMLCanvasElement) {
		this.nodes = [];
		this.canvas = canvas;
		this.context = this.canvas.getContext("2d");
		this.store = useMainStore();
		this.preMousePos = new Vector2();

		// canvas.addEventListener("mousedown", this.onMouseDown);
		this.canvas.onwheel = function (ev: WheelEvent) {
			ev.preventDefault();
			console.log("缩放画布,还没写");
		}

		// 绑定事件
		const self = this;
		canvas.addEventListener("mousedown", function (evt: MouseEvent) {
			self.onMouseDown(evt);
		});
		canvas.addEventListener("mouseup", function (evt: MouseEvent) {
			self.onMouseUp(evt);
		});
	}

	public draw() {

		//背景图添加网格
		const width = this.canvas.width;
		const height = this.canvas.height;
		this.grid(this.canvas.width, this.canvas.height, 10)

		for (const item of this.nodes) {
			item.draw(this.context);
		}
	}

	public addNode(node: GeneratorNodeScene) {
		this.nodes.push(node);

	}

	public grid(width, height, interval) {
		// this.context.lineWidth=1;
		this.context.strokeStyle = "#333";
		for (let y = 10; y < height; y = y + interval) {
			this.context.beginPath();
			this.context.moveTo(0, y);
			this.context.lineTo(width, y);
			this.context.stroke();
		}
		for (let x = 10; x < width; x = x + interval) {
			this.context.beginPath();
			this.context.moveTo(x, 0);
			this.context.lineTo(x, height);
			this.context.stroke();
		}
	}

	onMouseDown(evt: MouseEvent) {

		const pos = this.getScenePos(evt);
		const mouseX = pos.x;
		const mouseY = pos.y;
		let mouseDownEvent = new CustomEvent("mousedown", { "detail": { "x": pos.x, "y": pos.y } });

		if (evt.button == 0) {// 判断connection
			const rect = this.canvas.getBoundingClientRect();
			this.preMousePos = new Vector2(evt.clientX - rect.left, evt.clientY - rect.top);
			const hitItem = this.getHitItem(mouseX, mouseY);

			if (hitItem != null) {

				hitItem.mouseDown(mouseDownEvent);
				this.hitItem = hitItem;

				console.log(hitItem);
				this.store.displayNodeOnComponents(hitItem);
			} else {//选中connection

			}

		}
	}

	onMouseUp(evt: MouseEvent) {
		const pos = this.getScenePos(evt);
		const mouseX = pos.x;
		const mouseY = pos.y;
		let mouseUpEvent = new CustomEvent("mouseup", { "detail": { "deltaX": 0, "deltaY": 0 } });

		const hitItem = this.hitItem;
		if (hitItem != null) {
			mouseUpEvent.detail.deltaX = mouseX-this.preMousePos.x;
			mouseUpEvent.detail.deltaY = mouseY-this.preMousePos.y;
			hitItem.mouseUp(mouseUpEvent);
			this.hitItem = hitItem;
			this.hitItem = null;
		} else {//拖动画布
		}
	}

	getScenePos(evt: MouseEvent) {
		const rect = this.canvas.getBoundingClientRect();
		const canvasPos = {
			x: evt.clientX - rect.left,
			y: evt.clientY - rect.top
		};
		return canvasPos;

		//注意后期缩放、平移等问题
		// canvasToSceneXY(x: number, y: number): Vector2 {
		// 	return new Vector2(
		// 		(x - this.offset.x) * (1.0 / this.zoomFactor),
		// 		(y - this.offset.y) * (1.0 / this.zoomFactor)
		// 	);
		// }
	}

	getHitItem(x: number, y: number): NodeScene {
		const hitItem = this._getHitItem(x, y);

		// // if item is in selection then return whole selection
		// if (
		// 	hitItem != null &&
		// 	this.isItemSelected(hitItem) &&
		// 	this.selection != null
		// ) {
		// 	if (this.selection.isPointInside(x, y)) return this.selection;
		// }

		return hitItem;
	}

	_getHitItem(x: number, y: number): NodeScene {
		for (let index = this.nodes.length - 1; index >= 0; index--) {
			const node = this.nodes[index];

			// for (const sock of node.sockets) {
			// 	if (sock.isPointInside(x, y)) return sock;
			// }//判断connection

			if (node.isPointInside(x, y)) return node;
		}

		return null;
	}
}