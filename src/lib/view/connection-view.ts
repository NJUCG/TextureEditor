import { NodeGraph } from "../node-graph";
import {
	BaseView,
	MouseUpEvent,
	MouseDownEvent,
	MouseMoveEvent,
	MouseOverEvent,
	MouseOutEvent,
	Color4Canvas 
} from "./base-view";
import { Line } from "./basic-item";
import { PortView } from "./port-view";

export class ConnectionView extends BaseView {
    public in!: PortView;
    public out!: PortView;
	public inLine: Line;
	public outLine: Line;
	public midLine: Line;

	constructor(uuid: string, inPort: PortView = null, outPort: PortView = null, graph: NodeGraph = null) {
		super(uuid, graph);
		this.in = inPort;
		this.out = outPort;
		const fixedLength = 20;
		this.inLine = new Line(this.in.centerX, this.in.centerY, this.in.centerX - fixedLength, this.in.centerY);
		this.outLine = new Line(this.out.centerX, this.out.centerY, this.out.centerX + fixedLength, this.out.centerY);
		this.midLine = new Line(this.inLine.ex, this.inLine.ey, this.outLine.ex, this.outLine.ey);
	}

    public draw(ctx: CanvasRenderingContext2D) {
		if (this.selected) {
			ctx.strokeStyle = "white";
			ctx.lineWidth = 5;
		} else if (this.hovered) {
			ctx.strokeStyle = Color4Canvas.ConnectionHoverGray;
			ctx.lineWidth = 3;
		} else {
			ctx.strokeStyle = Color4Canvas.ConnectionGray;
			ctx.lineWidth = 2;
		}

		ctx.beginPath();
		ctx.moveTo(this.in.centerX, this.in.centerY);
		ctx.bezierCurveTo(
			this.in.centerX - 60,
			this.in.centerY, // control point 1
			this.out.centerX + 60,
			this.out.centerY,
			this.out.centerX,
			this.out.centerY
		);
		ctx.stroke();
	}

	public move(dx: number, dy: number) {
		this.midLine.sx = this.inLine.ex;
		this.midLine.sy = this.inLine.ey;
		this.midLine.ex = this.outLine.ex;
		this.midLine.ey = this.outLine.ey;
	}

	public isPointInside(px: number, py: number): boolean {
		return this.inLine.isPointInside(px, py) || this.outLine.isPointInside(px, py) || this.midLine.isPointInside(px, py);
	}

	public mouseDown(evt: MouseDownEvent) {
	}

	public mouseMove(evt: MouseMoveEvent) {
	}

	public mouseUp(evt: MouseUpEvent) {
	}
	
	public mouseOver(evt: MouseOverEvent) {
	}

	public mouseOut(evt: MouseOutEvent) {
	}
}