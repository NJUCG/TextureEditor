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
import { PortView } from "./port-view";

export class ConnectionView extends BaseView {
    public in!: PortView;
    public out!: PortView;

	constructor(uuid: string, inPort: PortView = null, outPort: PortView = null, graph: NodeGraph = null) {
		super(uuid, graph);
		this.in = inPort;
		this.out = outPort;
	}

    draw(ctx: CanvasRenderingContext2D) {
		ctx.beginPath();
		if (this.hovered) {
			ctx.strokeStyle = Color4Canvas.ConnectionHoverGray;
			ctx.lineWidth = 6;
		} else if (this.selected) {
			ctx.strokeStyle = "white";
			ctx.lineWidth = 8;
		} else {
			ctx.strokeStyle = Color4Canvas.ConnectionGray;
			ctx.lineWidth = 4;
		}

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