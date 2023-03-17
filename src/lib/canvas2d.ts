import { useMainStore } from '@/store/index';
import { Designer } from './designer';
import { TextureCanvas } from './utils/texture-canvas';
import { Vector2 } from './view/basic-item';

export class View2D {
	public canvas: HTMLCanvasElement;
	public context: CanvasRenderingContext2D;

	public designer: Designer;
	public texCanvas: TextureCanvas;

	public renderSize: number;

	public mousePos: Vector2;		// 鼠标位置

	public zoomScale: number;		// 缩放参数
	public offset: Vector2;			// 缩放&平移offset

	// handlers
	private mouseWheelHandler: (evt: MouseEvent) => void;

	constructor() {
		this.canvas = null;
		this.context = null;

		this.designer = null;
		this.texCanvas = null;

		this.renderSize = null;

		this.mousePos = null;

		this.zoomScale = null;
		this.offset = null;
	}

	public init(canvas: HTMLCanvasElement, designer: Designer) {
		this.canvas = canvas;
		this.context = canvas.getContext("2d");

		this.designer = designer;
		this.texCanvas = new TextureCanvas(800, 800);

		this.renderSize = 800;

		this.mousePos = new Vector2(0, 0);

		this.zoomScale = 1.0;
		this.offset = new Vector2(canvas.width / 2, canvas.width / 2);

		// event listeners
		this.mouseWheelHandler = (evt: MouseEvent) => {
			this.onMouseWheel(evt);
		}

		this.canvas.addEventListener("mousewheel", this.mouseWheelHandler);
	}

	public draw() {
		const ctx = this.context;

		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.fillStyle = "rgb(32, 32, 32)";
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		ctx.setTransform(
			this.zoomScale,
			0,
			0,
			this.zoomScale,
			this.offset.x,
			this.offset.y
		);

		if (this.texCanvas) {
			ctx.lineWidth = 4;
			ctx.strokeStyle = "black";
			ctx.strokeRect(-this.renderSize / 2, -this.renderSize / 2, this.renderSize, this.renderSize);
			ctx.drawImage(
				this.texCanvas.canvas, 
				-this.renderSize / 2,
				-this.renderSize / 2,
				this.renderSize, 
				this.renderSize
			);
		}
	}

	public updateTexureCanvas(texture: WebGLTexture) {
		this.designer.renderTextureToCanvas(texture, this.texCanvas);
	}

	public clearTextureCanvas() {
		this.texCanvas.clear();
	}

	public resize() {
		this.offset.x = this.canvas.width / 2;
		this.offset.y = this.canvas.height / 2;
	}

	public reset() {
		this.offset.x = this.canvas.width / 2;
		this.offset.y = this.canvas.height / 2;
		this.zoomScale = 1.0;
		this.renderSize = Math.min(this.canvas.width, this.canvas.height);
	}

	private onMouseWheel(evt: MouseEvent) {
		const pos = this.getMouseCanvasPos(evt);
		const delta = (<WheelEvent>evt).deltaY < 0 ? 1.1 : 1.0 / 1.1;

		this.zoomScale *= delta;
		this.offset.x = pos.x - (pos.x - this.offset.x) * delta;
		this.offset.y = pos.y - (pos.y - this.offset.y) * delta;

		evt.preventDefault();
	}

	private getMouseCanvasPos(evt: MouseEvent): Vector2 {
		const rect = this.canvas.getBoundingClientRect();
		return new Vector2(evt.clientX - rect.left, evt.clientY - rect.top);
	}
}