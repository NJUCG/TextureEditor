import { Rect, Vector2 } from "../utils/utils";
import { ImageCanvas } from "../designer/image-canvas";

export class NodeSceneState {
    hovered = false;//悬停
    selected = false;//选中
}

export class MouseDownEvent extends MouseEvent { }
export class MouseMoveEvent extends MouseEvent {
    deltaX: number;
    deltaY: number;
}
export class MouseUpEvent extends MouseEvent { }
export class MouseOverEvent extends MouseEvent { }

export class NodeScene {
    protected x: number = 0;
    protected y: number = 0;
    protected width: number = 100;
    protected height: number = 100;
    public nodecanvas: ImageCanvas;

    public draw(ctx: CanvasRenderingContext2D, nodeState: NodeSceneState) { }

    // STANDARD MOUSE EVENTS
    public mouseDown(evt: CustomEvent) { }
    public mouseMove(evt: CustomEvent) { }
    public mouseUp(evt: CustomEvent) { }

    // called every frame the mouse is over this object
    public mouseOver(evt: MouseOverEvent) { }

    public setCenter(x: number, y: number){}

    roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
		if (w < 2 * r) r = w / 2;
		if (h < 2 * r) r = h / 2;
		ctx.beginPath();
		ctx.moveTo(x + r, y);
		ctx.arcTo(x + w, y, x + w, y + h, r);
		ctx.arcTo(x + w, y + h, x, y + h, r);
		ctx.arcTo(x, y + h, x, y, r);
		ctx.arcTo(x, y, x + w, y, r);
		ctx.closePath();
		//ctx.stroke();
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