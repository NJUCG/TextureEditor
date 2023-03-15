import { NodeGraph } from "../node-graph";
import { Shape } from "./basic-item";
import { newUUID } from "../utils";

export enum Color4Canvas {
	TextShowGray = "rgb(150, 150, 150)",
	PortFillGray = "rgb(150, 150, 150)",
	NodeBorderGray = "rgb(25, 25, 25)",
	PortBorderGray = "rgb(40, 40, 40)",
	MappingShowGreen = "rgb(200, 255, 200)",
	InnerDotGray = "rgb(100, 100, 100)",
	DashLineGray = "rgb(170, 170, 170)",
	ConnectionGray = "rgb(175, 175, 175)",
	ConnectionHoverGray = "rgb(192, 192, 192)",
}

export class InternalMouseEvent {
	// scene space 
	public globalX: number;
	public globalY: number;

	public localX: number;
	public localY: number;

	public button: number;

	// modifiers
	public shiftKey = false;
	public altKey = false;
	public ctrlKey = false;
}

export class MouseDownEvent extends InternalMouseEvent {}
export class MouseMoveEvent extends InternalMouseEvent {
    deltaX: number;
    deltaY: number;
}
export class MouseUpEvent extends InternalMouseEvent {}
export class MouseOverEvent extends InternalMouseEvent {}
export class MouseOutEvent extends InternalMouseEvent {}

export abstract class BaseView {
	public uuid: string;
	public hovered: boolean;
	public selected: boolean;

    protected graph: NodeGraph;
	protected area: Shape;

	public constructor(graph: NodeGraph = null) {
		this.uuid = newUUID();
		this.hovered = false;
		this.selected = false;

		this.graph = graph;
		this.area = null;
	}

	public setGraph(graph: NodeGraph) {
		this.graph = graph;
	}

	public isPointInside(px: number, py: number): boolean {
		return this.area.isPointInside(px, py);
	}

	public move(dx: number, dy: number) {
		this.area.move(dx, dy);
	}

	public reset() {
		this.hovered = false;
		this.selected = false;
	}

	/**
     * Abstract, draw element(texture/image) in this view item
     * @param ctx 
     */
	public abstract draw(ctx: CanvasRenderingContext2D): void;
	// public abstract setItemState(viewItemState: ViewItemState): void;
	/**
     * Abstract, some mouse events
	 * @param evt 
     * note:
	 * 1. these events happen exactly on the view item 
	 * 2. 'mouseOver' event is called every rendering frame when mouse is over this object
     */
	public abstract mouseDown(evt: MouseDownEvent): void;
	public abstract mouseMove(evt: MouseMoveEvent): void;
	public abstract mouseUp(evt: MouseUpEvent): void;
	public abstract mouseOver(evt: MouseOverEvent): void;
	public abstract mouseOut(evt: MouseOutEvent): void;
}