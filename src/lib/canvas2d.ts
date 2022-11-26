import { useMainStore } from '@/store/index';
import { copyFromCanvas } from '@/lib/library';
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
	focusNode: any;//鼠标位于2dview界面
	offsetX: number;//鼠标拖动界面x位移
	offsetY: number;//鼠标拖动界面y位移
	t: boolean;


	constructor(canvas: HTMLCanvasElement) {

		this.myCanvas = canvas;
		this.context = this.myCanvas.getContext("2d");
		this.mousePos = new Vector2(0, 0);
		this.image = new Image();
		this.zoomFactor = 1.0;
		this.offsetX = 0;
		this.offsetY = 0;
		this.t = false;

	}

	public draw(focused): void {
		const ctx = this.context;

		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.fillStyle = "rgb(50,50,50)";
		ctx.fillRect(0, 0, this.myCanvas.width, this.myCanvas.height);
		
		if (focused) {
			const dataImage = ctx.createImageData(512, 512);
			if (dataImage.data.set) {
				dataImage.data.set(focused);
			}

			const canvas2: HTMLCanvasElement = document.createElement('canvas');
			canvas2.width = 512;
			canvas2.height = 512;
			const cavans2Ctx: CanvasRenderingContext2D = canvas2.getContext('2d');
			cavans2Ctx.putImageData(dataImage, 0, 0);

			this.myCanvas = canvas2;
			this.image.src = canvas2.toDataURL("image/png");

			ctx.drawImage(this.image, this.offsetX, this.offsetY, this.myCanvas.width * this.zoomFactor, this.myCanvas.height * this.zoomFactor);

		} else if (this.image) {
			ctx.drawImage(this.image, this.offsetX, this.offsetY, this.myCanvas.width * this.zoomFactor, this.myCanvas.height * this.zoomFactor);
		}

		// if (mainStore.focusedNode) {
		// 	const dataImage = ctx.createImageData(512, 512);
		// 	if (dataImage.data.set) {
		// 		dataImage.data.set(mainStore.focusedNode);
		// 	}
		// 	const canvas2: HTMLCanvasElement = document.createElement('canvas');
		// 	canvas2.width = 512;
		// 	canvas2.height = 512;
		// 	const cavans2Ctx: CanvasRenderingContext2D = canvas2.getContext('2d');
		// 	cavans2Ctx.putImageData(dataImage, 0, 0);

		// 	this.myCanvas = canvas2;
		// 	this.image.src = canvas2.toDataURL("image/png");

		// 	ctx.clearRect(0, 0, this.myCanvas.width, this.myCanvas.height);
		// 	ctx.scale(1,-1);
		// 	ctx.translate(0,-this.myCanvas.height);

		// 	ctx.drawImage(this.image, this.offsetX, this.offsetY, this.myCanvas.width * this.zoomFactor, this.myCanvas.height * this.zoomFactor);

		// } else if (this.image) {
		// 	ctx.drawImage(this.image, this.offsetX, this.offsetY, this.myCanvas.width * this.zoomFactor, this.myCanvas.height * this.zoomFactor);
		// }
	}

	setFocusNode(node) {
		this.focusNode = node;
	}

	setImage(image: HTMLImageElement) {
		this.image = image;
	}

	setSize(width: number, height: number) {
		this.myCanvas.width = width;
		this.myCanvas.height = height;
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

	resetImage() {//图片复位
		this.offsetX = 0;
		this.offsetY = 0;
		this.zoomFactor = 1.0;
	}

}