import { ImageCanvas } from "../designer/imagecanvas";
import { NodeGraph } from "../nodegraph";
import { Vector2 } from "../utils/utils";
import { Node } from "../node/Node";
import { NodeScene, MouseDownEvent, MouseMoveEvent, MouseUpEvent } from "./nodescene"
import { useMainStore } from '@/store/index';

export class GeneratorNodeScene extends NodeScene {
	public id: string;
	// public nodecanvas: ImageCanvas;
	thumbnail: HTMLImageElement;
	protected store;
	public select: boolean;

	constructor(node: Node) {
		super();
		this.width = 50;
		this.height = 50;
		this.id = node.id;
		this.nodecanvas = new ImageCanvas();
		this.nodecanvas.copyFromCanvas(node.canvas, true);
		this.select = false;

		//綁定鼠标监听事件
		const self = this;
		const canvas = this.nodecanvas.canvas;

		this.store = useMainStore();
	}

	mouseDown(evt: CustomEvent) {
		console.log("click");
		this.select = true;
		this.store.displayNodeOnComponents(this);
	}

	mouseUp(evt: CustomEvent) {
		console.log("mouseUp");
		if (this.select) {
			this.x += evt.detail.deltaX;
			this.y += evt.detail.deltaY;
		}
		this.select = false;
	}

	mouseMove(evt: CustomEvent) {
		console.log("mouseMove");
		if (this.select) {
			this.x += evt.detail.deltaX;
			this.y += evt.detail.deltaY;
		}
	}

	public draw(ctx: CanvasRenderingContext2D) {
		// border
		if (this.select) {
			ctx.strokeStyle = "rgb(255, 255, 255)";
			ctx.beginPath();
			ctx.lineWidth = 8;
			this.roundRect(ctx, this.x, this.y, this.width, this.height, 2);
			ctx.stroke();
			ctx.lineWidth = 1;
		}
		// console.log(this.width, this.height);
		// background
		ctx.beginPath();
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.rect(this.x, this.y, this.width, this.height);
		ctx.fill();

		ctx.drawImage(
			this.nodecanvas.canvas,
			this.x,
			this.y,
			this.width,
			this.height
		);

	}

	public setThumbnail(thumbnail: HTMLImageElement) {
		this.thumbnail = thumbnail;
	}

	public setCenter(x: number, y: number) {
		this.x = Math.max(0, x - this.width / 2);
		this.y = Math.max(0, y - this.height / 2);
	}

	public isPointInside(px: number, py: number): boolean {
		if (
			px >= this.x &&
			px <= this.x + this.width &&
			py >= this.y &&
			py <= this.y + this.height
		)
			return true;
		return false;
	}
}