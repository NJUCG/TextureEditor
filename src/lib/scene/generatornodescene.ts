import { ImageCanvas } from "../designer/imagecanvas";
import { NodeGraph } from "../nodegraph";
import { Vector2 } from "../utils/utils";
import { Node } from "../node/shadernode";
import { NodeScene, MouseDownEvent, MouseMoveEvent, MouseUpEvent } from "./nodescene"
import { useMainStore } from '@/store/index';
import { SocketScene, SocketType } from "./socketscene";

export class GeneratorNodeScene extends NodeScene {
	public id: string;
	// public nodecanvas: ImageCanvas;
	thumbnail: HTMLImageElement;
	protected store;
	public select: boolean;
	public sockets: SocketScene[];
	public node:Node;

	constructor(node: Node) {
		super();
		this.width = 50;
		this.height = 50;
		this.id = node.id;
		this.nodecanvas = new ImageCanvas();
		this.nodecanvas.copyFromCanvas(node.ownCanvas, true);
		this.select = false;
		this.sockets = [];
		this.node=node;

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
			for (const sock of this.sockets) {
				sock.move(evt.detail.deltaX, evt.detail.deltaY);
			}
		}
		this.select = false;
	}

	mouseMove(evt: CustomEvent) {
		console.log("mouseMove");
		if (this.select) {
			this.x += evt.detail.deltaX;
			this.y += evt.detail.deltaY;
			for (const sock of this.sockets) {
				sock.move(evt.detail.deltaX, evt.detail.deltaY);
			}
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

		//图像内容
		ctx.drawImage(
			this.nodecanvas.canvas,
			this.x,
			this.y,
			this.width,
			this.height
		);

		//节点上的in/out接口
		for (const sock of this.sockets) {
			sock.draw(ctx);
		}

	}

	public setThumbnail(thumbnail: HTMLImageElement) {
		this.thumbnail = thumbnail;
	}

	public setCenter(x: number, y: number) {
		//调整节点位置
		this.x = Math.max(0, x - this.width / 2);
		this.y = Math.max(0, y - this.height / 2);

		//调整接口位置
		this.setSocketCenter();
	}

	public setSocketCenter() {
		let socks = this.getSocketIn();
		// top and bottom padding for sockets
		const pad = socks.length < 5 ? 10 : 0;

		// sort in sockets
		let incr = (this.height - pad * 2) / socks.length;
		let mid = incr / 2.0;
		let i = 0;
		for (const sock of socks) {
			const y = pad + i * incr + mid;
			const x = this.x;
			sock.setCenter(x, this.y + y);
			i++;
		}

		// sort out sockets
		socks = this.getSocketOut();
		incr = (this.height - pad * 2) / socks.length;
		mid = incr / 2.0;
		i = 0;
		for (const sock of socks) {
			const y = pad + i * incr + mid;
			const x = this.x + this.width;
			sock.setCenter(x, this.y + y);
			i++;
		}
	}

	public getSocketIn() {
		return this.sockets.filter((sock) => sock.socketType == SocketType.In);
	}

	public getSocketOut() {
		return this.sockets.filter((sock) => sock.socketType == SocketType.Out);
	}

	public addSockets(type: SocketType, graph:NodeGraph) {
		const socket = new SocketScene(type, this, graph);
		this.sockets.push(socket);
	}
}