import { SceneView } from "./view/scene-view";
import { Vector2 } from "./view/basic-item";
import {
	BaseView,
	MouseDownEvent,
	MouseMoveEvent,
	MouseUpEvent 
} from "./view/base-view";
import { NodeView } from "./view/node-view";
import { PortView } from "./view/port-view";
import { ConnectionView } from "./view/connection-view";

export class NodeGraph {
	public canvas: HTMLCanvasElement;
	public ctx: CanvasRenderingContext2D;
	public view: SceneView;
	
	public nodes: Map<string, NodeView>;
	public conns: Map<string, ConnectionView>;
	
	public selectedItem: BaseView;
	public hoveredItem: BaseView;

	// callbacks
	public onNodeViewSelected: (item: NodeView) => void;
	public onNodeViewDeleted: (item: NodeView) => void;
	public onConnectionViewSelected: (item: ConnectionView) => void;
	public onConnectionViewCreated: (item: ConnectionView) => void;
	public onConnectionViewDestroyed: (item: ConnectionView) => void;

	// handlers
	private mouseDownHandler: (evt: MouseEvent) => void;
	private mouseMoveHandler: (evt: MouseEvent) => void;
	private mouseUpHandler: (evt: MouseEvent) => void;
	private keyDownHanlder: (evt: KeyboardEvent) => void;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.ctx = this.canvas.getContext("2d");
		this.view = new SceneView(canvas);
		this.nodes = new Map<string, NodeView>();
		this.conns = new Map<string, ConnectionView>();
		this.selectedItem = null;
		this.hoveredItem = null;

		// bind MouseEvents
		this.mouseDownHandler = (evt: MouseEvent) => {
			this.onMouseDown(evt);
		};
		this.mouseMoveHandler = (evt: MouseEvent) => {
			this.onMouseMove(evt);
		};
		this.mouseUpHandler = (evt: MouseEvent) => {
			this.onMouseUp(evt);
		};
		this.keyDownHanlder = (evt: KeyboardEvent) => {
			this.onKeyDown(evt);
		}
		canvas.addEventListener("mousedown", this.mouseDownHandler);
		canvas.addEventListener("mousemove", this.mouseMoveHandler);
		canvas.addEventListener("mouseup", this.mouseUpHandler);
		canvas.addEventListener("keydown", this.keyDownHanlder);
	}

	public draw() {
		// clear content then draw grid background
		this.reset();
		
		// draw nodes
		this.nodes.forEach((node) => {
			node.draw(this.ctx);
		})

		// draw connections
		this.conns.forEach((conn) => {
			conn.draw(this.ctx);
		})
	}

	public clear() {
		this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
		this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
		this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
		this.canvas = null;
		this.ctx = null;
		this.view = null;
		this.nodes = null;
		this.conns = null;
		this.selectedItem = null;
		this.hoveredItem = null;
	}

	public addNodeView(node: NodeView) {
		node.setGraph(this);
		this.nodes.set(node.uuid, node);
	}

	public removeNodeView(node: NodeView) {
		for (const port of node.inPorts)
			if (port.connection)
				this.removeConnectionView(port.connection);
		
		node.setGraph(null);
		this.nodes.delete(node.uuid);
		// need to implement
		if (this.onNodeViewDeleted)
			this.onNodeViewDeleted(node);
	}

	public addConnectionView(conn: ConnectionView) {
		conn.setGraph(this);
		// link in/out ports
		conn.in.connection = conn;
		this.conns.set(conn.uuid, conn);

		// callback
		if (this.onConnectionViewCreated)
			this.onConnectionViewCreated(conn);
	}

	public removeConnectionView(conn: ConnectionView) {
		conn.setGraph(null);
		conn.in.connection = null;
		this.conns.delete(conn.uuid);

		// callback
		if (this.onConnectionViewDestroyed)
			this.onConnectionViewDestroyed(conn);
	}

	public getHitPort(x: number, y: number): PortView {
		for (const node of this.nodes.values())
			for (const port of node.ports)
				if (port.isPointInside(x, y))
					return port;

		return null;
	}

	public getNodeViewById(uuid: string): NodeView {
		if (this.nodes.has(uuid))
			return this.nodes.get(uuid);

		return null;
	}

	/**
	 * check if the graph is still a DAG after adding a connection 'outNode' --> 'inNode'
	 * @param outNode 
	 * @param inNode 
	 * @returns true for still a DAG, else false
	 * note: it exsits duplicate nodes when expanding the list
	 */
	public checkIfDAG(outNode: NodeView, inNode: NodeView): boolean {
		let checked = new Set();
		checked.add(inNode);

		let expanding = [outNode];

		while (expanding.length > 0) {
			const toNode = expanding.pop();

			for (const portView of toNode.inPorts) {
				if (portView.connection == null)
					continue;
				const fromNode = portView.connection.out.node;

				if (fromNode == inNode)
					return false;
				else {
					expanding.push(fromNode);
					checked.add(toNode);
				}
			}
		}

		return true;
	}

	public connectionValid(outPort: PortView, inPort: PortView): boolean {
        return inPort != outPort
            && inPort.port.type != outPort.port.type
            && inPort.node != outPort.node
    }

	private reset() {
		// clear and draw grid
		this.view.clear(this.ctx, "#4A5050");
		this.view.setViewMatrix(this.ctx);
		this.view.drawGrid(this.ctx, 33.33333, "#4E5454", 1);
		this.view.drawGrid(this.ctx, 100, "#464C4C", 3);
	}

	private onMouseDown(evt: MouseEvent) {
		if (evt.button != 0)
			return;

		if (this.selectedItem) {
			this.selectedItem.selected = false;
			this.selectedItem = null;
		}

		const pos = this.getScenePos(evt);
		// only deal with 'left' mouse button down
		const hitItem = this.getHitItem(pos.x, pos.y);
		if (hitItem == null) {
			// todo: 实现多选框
		} else {
			const mouseEvent = new MouseDownEvent();
			mouseEvent.globalX = pos.x;
			mouseEvent.globalY = pos.y;
			mouseEvent.shiftKey = evt.shiftKey;
			mouseEvent.altKey = evt.altKey;
			mouseEvent.ctrlKey = evt.ctrlKey;
			// spread MouseDownEvent to the hit item
			hitItem.selected = true;
			hitItem.mouseDown(mouseEvent);

			this.selectedItem = hitItem;

			// deal with this event depending on the type of the hit item
			switch (true) {
				case hitItem instanceof NodeView:
					const hitNode = <NodeView>hitItem;
					if (this.onNodeViewSelected)
						this.onNodeViewSelected(hitNode);
					break;
				case hitItem instanceof PortView:
					const hitPort = <PortView>hitItem;
					break;
				case hitItem instanceof ConnectionView:
					const hitConn = <ConnectionView>hitItem;
					if (this.onConnectionViewSelected)
						this.onConnectionViewSelected(hitConn);
					break;
				default:
					console.log("nodegraph.ts: 'hitItem' is not a existing BaseView instance!");
                    break;
			}
		}
	}

	private onMouseUp(evt: MouseEvent) {
		const pos = this.getScenePos(evt);

		if (evt.button != 0)
			return;
		
		if (this.selectedItem == null)
			return;

		const mouseEvent = new MouseUpEvent();
		
		mouseEvent.globalX = pos.x;
		mouseEvent.globalY = pos.y;
		mouseEvent.shiftKey = evt.shiftKey;
		mouseEvent.altKey = evt.altKey;
		mouseEvent.ctrlKey = evt.ctrlKey;

		this.selectedItem.mouseUp(mouseEvent);
	}

	private onMouseMove(evt: MouseEvent) {
		const pos = this.getScenePos(evt);

		if (this.selectedItem) {
			// dragging: mouse move event
			const mouseEvent = new MouseMoveEvent();
			mouseEvent.globalX = pos.x;
			mouseEvent.globalY = pos.y;
			mouseEvent.shiftKey = evt.shiftKey;
			mouseEvent.altKey = evt.altKey;
			mouseEvent.ctrlKey = evt.ctrlKey;

			const drag = this.view.getMouseDeltaSceneSpace();
			mouseEvent.deltaX = drag.x;
			mouseEvent.deltaY = drag.y;

			this.selectedItem.mouseMove(mouseEvent);
		}

		const hitItem = this.getHitItem(pos.x, pos.y);
		// moving: mouse over event
		if (hitItem == null) {
			this.view.canvas.style.cursor = "default";
			if (this.hoveredItem) {
				this.hoveredItem.hovered = false;
				this.hoveredItem.mouseOut(null);
				this.hoveredItem = null;
			}
		} else {
			if (this.hoveredItem && hitItem != this.hoveredItem) {
				this.hoveredItem.hovered = false;
				this.hoveredItem.mouseOut(null);
			}
			hitItem.hovered = true;
			hitItem.mouseOver(null);
			this.hoveredItem = hitItem;
		}
	}

	private onKeyDown(evt: KeyboardEvent) {
		if (this.selectedItem == null)
			return;

		let selectedItem = null;
		switch (true) {
			case this.selectedItem instanceof NodeView:
				selectedItem = <NodeView>this.selectedItem;
				break;
			case this.selectedItem instanceof ConnectionView:
				selectedItem = <ConnectionView>this.selectedItem;
				break;
			default:
				break;
		}

		if (evt.key == "Delete")
			selectedItem.onKeyDown(evt);
	}

	private getScenePos(evt: MouseEvent): Vector2 {
		// get mouse position of this canvas
		const rect = this.canvas.getBoundingClientRect();
		// convert canvas position to scene position
		return this.view.canvasToSceneXY(evt.clientX - rect.left, evt.clientY - rect.top);
	}

	/**
	 * get the mouse position hit view item
	 * @param x 
	 * @param y 
	 * @returns 
	 * 1. BaseView instance (NodeView, PortView, etc.)
	 * 2. null if no item is hit
	 * 
	 * note: maybe it is possible to speed up the checking process
	 */
	private getHitItem(x: number, y: number): BaseView {
		// 1. check nodes and their ports
		for (const node of this.nodes.values()) {
			for (const port of node.ports) {
				if (port.isPointInside(x, y))
					return port;
			}
			if (node.isPointInside(x, y))
				return node;
		}

		// // 2. check connections
		// for (const conn of this.conns) {
		// 	if (conn.isPointInside(x, y))
		// 		return conn;
		// }

		return null;
	}
}