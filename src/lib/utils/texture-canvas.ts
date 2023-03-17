export class TextureCanvas {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;

	constructor(width = 50, height = 50) {
		this.canvas = document.createElement("canvas");
		this.canvas.width = width;
		this.canvas.height = height;
		this.context = this.canvas.getContext("2d");
	}

	// draw image from src to this.canvas
	public drawToTextureCanvas(src: HTMLCanvasElement) {
		console.log("copying from " + src.width + " to " + this.canvas.width);
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.drawImage(src, 0, 0, this.canvas.width, this.canvas.height);
	}

	public resize(width: number, height: number) {
		this.canvas.width = width;
		this.canvas.height = height;
	}

	public clear() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	public get width(): number {
		return this.canvas.width;
	}

	public get height(): number {
		return this.canvas.height;
	}
}
