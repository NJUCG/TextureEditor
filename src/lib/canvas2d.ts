import { onUnmounted } from 'vue';


const IMAGE_RENDER_SIZE = 1000;

function _getMousePos(canvas: HTMLCanvasElement, evt: MouseEvent) {
	const rect = canvas.getBoundingClientRect();
	return new Vector2(evt.clientX - rect.left, evt.clientY - rect.top);
}

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
export class CanvasMonitor {
	myCanvas: HTMLCanvasElement;
	image: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
	box: Box;
	mousePos: Vector2;//鼠标位置
	zoomFactor: number;//缩放参数

	constructor(canvas: HTMLCanvasElement) {
		this.myCanvas = canvas;
		this.context = this.myCanvas.getContext("2d");
		this.mousePos = new Vector2(0, 0);

		// this.myCanvas.addEventListener("mousemove", this.onMouseMove);
	}

	public draw(): void {
		if (this.image) {
			this.context.drawImage(this.image, 0, 0, this.myCanvas.width, this.myCanvas.height);
		} else {
			const ctx = this.context;

			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.fillStyle = "rgb(50,50,50)";
			ctx.fillRect(0, 0, this.myCanvas.width, this.myCanvas.height);
		}

	}

	setImage(image: HTMLCanvasElement) {
		this.image = image;
	}

	setMousePos(x,y){
		this.mousePos=new Vector2(x,y);
		console.log(this.mousePos);
		

	}
	// onMouseMove(event: MouseEvent): Vector2 {
	// 	this.mousePos = _getMousePos(this.myCanvas, event);
	// 	return this.mousePos;
	// 	// console.log(pos.x);
	// 	// console.log(pos.y);
	// }


	// onUnmounted(){
	// 	this.myCanvas.removeEventListener('mousemove', this.onMouseMove);
	// }
}