import {
	BaseView,
	MouseUpEvent,
	MouseDownEvent,
	MouseMoveEvent,
	MouseOverEvent,
	MouseOutEvent,
	Color4Canvas,
} from "./base-view";
import { NodeGraph } from "../node-graph";
import { Port, PortType } from "../node/port";
import { ImageCanvas } from "../utils/image-canvas";
import { Vector2, Rect } from "./basic-item";
import { PortView } from "./port-view";

export class NodeView extends BaseView {
	public title: string;
	public inPorts: PortView[];
	public outPorts: PortView[];
	public indexOfPorts: number;
	public imageCanvas: ImageCanvas;

	public mappingChannel: string;

	private isDragging: boolean;
	private dragingStart: Vector2;

	constructor(title: string, x: number = 0, y: number = 0, w: number = 100, h: number = 100, mappingChannel: string = null, graph: NodeGraph = null) {
		super(graph);
		this.area = new Rect(x, y, w, h);
		this.title = title;
		this.inPorts = [];
		this.outPorts = [];
		this.indexOfPorts = 0;
		this.imageCanvas = new ImageCanvas(w, h);
		this.mappingChannel = mappingChannel;
		// this.viewItemState = new NodeViewItemState();
		this.isDragging = false;
		this.dragingStart = null;
	}
	
	/**
	 * move this node and its ports
	 * @param dx 
	 * @param dy 
	 */
	public move(dx: number, dy: number) {
		this.area.move(dx, dy);
		for (const port of this.ports)
			port.move(dx, dy);
	}

	/**
     * draw element(texture/image) in this view item
     * @param ctx 
     */
	public draw(ctx: CanvasRenderingContext2D) {
		const rect = <Rect>this.area;
		// 1. draw a white border if item is selected, else gray border
		if (this.selected)
			ctx.strokeStyle = "white";
		else
			ctx.strokeStyle = Color4Canvas.NodeBorderGray;
		
		ctx.lineWidth = 8;
		ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);

		// 2. draw a background color: black
		// ctx.fillStyle = "blue";
		// ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
		
		// 3. draw the thumbnail
		ctx.drawImage(this.imageCanvas.canvas, rect.left, rect.top, rect.width, rect.height);
		
		// 4. draw the node's title
		if (!this.hovered) {
			// title background
			ctx.fillStyle = "black";
			ctx.fillRect(rect.left, rect.top, rect.width, 20);
			// title name
			ctx.font = "bold 9px 'Open Sans'";
			ctx.fillStyle = "white";
			const textSize = ctx.measureText(this.title);
			const textLeft = rect.centerX - textSize.width / 2;
			const textTop = rect.top + 14;
			ctx.fillText(this.title, textLeft, textTop);
		}

		// 5. draw the node's ports
		for (const port of this.ports)
			port.draw(ctx);

		// 6. draw the node's processing time

		// 7. draw mapping channel identifier
		if (this.mappingChannel) {
			ctx.font = "12px 'Open Sans'";
			ctx.fillStyle = Color4Canvas.MappingShowGreen;
			const textSize = ctx.measureText(this.mappingChannel.toUpperCase());
			const textLeft = rect.centerX - textSize.width / 2;
			const textTop = rect.top - 12;
			ctx.fillText(this.mappingChannel.toUpperCase(), textLeft, textTop);
		}
	}

	public setGraph(graph: NodeGraph) {
		this.graph = graph;
		for (const port of this.ports)
			port.setGraph(graph);
	}

	public addPortView(port: Port) {
		const portView = new PortView(port, this);
		if (port.type == PortType.In)
			this.inPorts.push(portView);
		else
			this.outPorts.push(portView);
	}

	public arrangePortViews(type: PortType) {
		const rect = <Rect>this.area;
		let ports: PortView[] = [];
		// (x, y) is the center of port
		let x = 0;
		let y = rect.centerY;
		if (type == PortType.In) {
			ports = this.inPorts;
			x = rect.left;
		} else {
			ports = this.outPorts;
			x = rect.right;
		}

		if (ports.length == 0)
			return;

		// port spacing of each other
		const spacing = this.ports[0].radius * 3;
		const mid = Math.floor(ports.length / 2);
		if (ports.length % 2)
			// port number is odd
			y -= mid * spacing;
		else
			// port number is even
			y -= (mid - 0.5) * spacing;
		
		for (const port of ports) {
			port.setCenter(x, y);
			y += spacing;
		}
	}

	public get ports() {
		const ports = [...this.inPorts, ...this.outPorts];
		return ports;
	}

	/**
     * handle mouse events
     * @param evt 
     * note: 'mouseOver' event is called every rendering frame when mouse is over this object
     */
	public mouseDown(evt: MouseDownEvent) {
		this.isDragging = true;
		const rect = <Rect>this.area;
		this.dragingStart = new Vector2(rect.left, rect.top);
	}

	public mouseMove(evt: MouseMoveEvent) {
		if (this.isDragging)
			this.move(evt.deltaX, evt.deltaY);
	}

	public mouseUp(evt: MouseUpEvent) {
		this.isDragging = false;
	}
	
	public mouseOver(evt: MouseOverEvent) {
	}

	public mouseOut(evt: MouseOutEvent) {
	}

	public onDeleteDown(evt: KeyboardEvent) {
		
	}
}