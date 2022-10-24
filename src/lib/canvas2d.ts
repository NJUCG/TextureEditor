class Vector2 {
	x: number;
	y: number;
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
}
//记录边界
class Box {
	posX: number = 0;
	posY: number = 0;
	width: number = 1;
	height: number = 1;
	bgColor: number[] = [255, 50, 50];
	public setSize(w: number, h: number) {
		this.width = w;
		this.height = h;
	}
}

//画布
export class CanvasMonitor2D {
	myCanvas: HTMLCanvasElement;
	image: HTMLImageElement;
	context: CanvasRenderingContext2D;
	box: Box;
	mousePos: Vector2;//鼠标位置
	zoomFactor: number;//缩放参数
	focus: Boolean;//鼠标位于2dview界面
	offsetX: number;//鼠标拖动界面x位移
	offsetY: number;//鼠标拖动界面y位移

	constructor(canvas: HTMLCanvasElement) {
		this.myCanvas = canvas;
		this.context = this.myCanvas.getContext("2d");
		this.mousePos = new Vector2(0, 0);
		this.focus = false;
		this.zoomFactor = 1.0;
		this.offsetX = 0;
		this.offsetY = 0;

		// this.myCanvas.addEventListener("mousemove", this.onMouseMove);
	}

	public draw(): void {
		const ctx = this.context;

		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.fillStyle = "rgb(50,50,50)";
		ctx.fillRect(0, 0, this.myCanvas.width, this.myCanvas.height);

		if (this.image) {
			ctx.drawImage(this.image, this.offsetX, this.offsetY, this.myCanvas.width*this.zoomFactor, this.myCanvas.height*this.zoomFactor);
		}
	}

	setImage(image: HTMLImageElement) {
		this.image = image;
	}

	getMousePos(evt: MouseEvent) {
		const rect = this.myCanvas.getBoundingClientRect();
		return new Vector2(evt.clientX - rect.left, evt.clientY - rect.top);
	}

	setMousePos(x: number, y: number) {
		this.mousePos = new Vector2(x, y);
	}

	zoom(factor: number, pos: Vector2) {
		this.zoomFactor *= factor;
		this.offsetX = pos.x - (pos.x - this.offsetX) * factor;
		this.offsetY = pos.y - (pos.y - this.offsetY) * factor;
	}

	resetImage(){//图片复位
		this.offsetX = 0;
		this.offsetY = 0;
		this.zoomFactor = 1.0;
	}

}