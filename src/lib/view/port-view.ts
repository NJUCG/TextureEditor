import { newUUID } from "../utils";
import { NodeGraph } from "../node-graph";
import { Port, PortType } from "../node/port";
import { 
    BaseView, 
    MouseUpEvent,
	MouseDownEvent,
	MouseMoveEvent,
	MouseOverEvent,
    MouseOutEvent,
    Color4Canvas 
} from "./base-view";
import { NodeView } from "./node-view";
import { ConnectionView } from "./connection-view";
import { Circle } from "./basic-item";

export class PortView extends BaseView {
    public port: Port;
    public node: NodeView;
    private conns: ConnectionView[];
    private mouseDraggingX: number;
    private mouseDraggingY: number;

    constructor(uuid: string, port: Port, node: NodeView, x: number = 0, y: number = 0, r: number = 8, graph: NodeGraph = null) {
        super(uuid, graph);
        this.area = new Circle(x, y, r);
        this.port = port;
        this.node = node;
        this.conns = [];
        this.mouseDraggingX = 0;
        this.mouseDraggingY = 0;
    }

    public draw(ctx: CanvasRenderingContext2D) {
        const circle = <Circle>this.area;
        // 1. draw a filled circle as port
        ctx.beginPath();
        ctx.fillStyle = Color4Canvas.PortFillGray;
        ctx.arc(circle.centerX, circle.centerY, circle.radius, 0, 2 * Math.PI);
        ctx.fill();

        // 2. draw a inner dot if port has connections
        if (this.port.conns.length) {
            ctx.beginPath();
            ctx.fillStyle = Color4Canvas.InnerDotGray;
            ctx.arc(circle.centerX, circle.centerY, circle.radius / 3, 0, 2 * Math.PI);
            ctx.fill();
        }

        // 2. draw the port's border
        if (this.hovered)
            ctx.strokeStyle = "white";
        else 
            ctx.strokeStyle = Color4Canvas.PortBorderGray;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(circle.centerX, circle.centerY, circle.radius, 0, 2 * Math.PI);
        ctx.stroke();

        // 3. draw ports' title
        if (this.node.hovered) {
            // console.log("draw port's title....");
            ctx.fillStyle = Color4Canvas.TextShowGray;
            if (this.hovered)
                ctx.fillStyle = "white";
            ctx.font = "9px Arial";
            const w = ctx.measureText(this.port.name).width;
            if (this.port.type == PortType.In)
                ctx.fillText(this.port.name, circle.centerX - circle.radius - 4 - w, circle.centerY + 3);
            else
                ctx.fillText(this.port.name, circle.centerX + circle.radius + 4, circle.centerY + 3);
        }

        // 4. draw a dash-style active connection line when the port is selected
        if (this.selected) 
            this.drawDashStyleConnection(ctx);
    }

    /**
	 * move this port and its conns
	 * @param dx 
	 * @param dy 
	 */
	public move(dx: number, dy: number) {
		this.area.move(dx, dy);
		for (const conn of this.conns) {
            if (conn.in == this) {
                conn.inLine.move(dx, dy, dx, dy);
                conn.midLine.move(dx, dy, 0, 0);
            } else {
                conn.outLine.move(dx, dy, dx, dy);
                conn.midLine.move(0, 0, dx, dy);
            }
        }
	}

    public setCenter(x: number, y: number) {
        (this.area as Circle).setCenter(x, y);
    }

    public addConnection(conn: ConnectionView) {
        this.conns.push(conn);
    }

    public removeConnection(conn: ConnectionView) {
        this.conns.splice(this.conns.indexOf(conn), 1);
    }

    public emptyConnection(): boolean {
        return this.conns.length == 0;
    }

    public get connections() {
        return this.conns;
    }

    public get centerX() {
        return (this.area as Circle).centerX;
    }

    public get centerY() {
        return (this.area as Circle).centerY;
    }

    public get radius() {
        return (this.area as Circle).r;
    }

    public mouseDown(evt: MouseDownEvent) {
        this.mouseDraggingX = evt.globalX;
        this.mouseDraggingY = evt.globalY;
    }

    public mouseMove(evt: MouseMoveEvent) {
        this.mouseDraggingX = evt.globalX;
        this.mouseDraggingY = evt.globalY;
    }

    public mouseUp(evt: MouseUpEvent) {
        const mouseX = evt.globalX;
        const mouseY = evt.globalY;    
        // 1. get the dash-connection's target port
        const targetPort = this.graph.getHitPort(mouseX, mouseY);

        // 2. targetPort != null: check if the graph is still a DAG
        if (targetPort) {
            let stillDAG = false;

            if (this.port.type == PortType.Out && targetPort.port.type == PortType.In)
                stillDAG ||= this.graph.checkIfDAG(this.node, targetPort.node);
            else if (this.port.type == PortType.In && targetPort.port.type == PortType.Out)
                stillDAG ||= this.graph.checkIfDAG(targetPort.node, this.node);
            
            // 3. create and link the new connection
            if (stillDAG && this.graph.connectionValid(this, targetPort)) {
                const uuid = newUUID();
                let inPort = null, outPort = null;
                
                if (this.port.type == PortType.Out) {
                    inPort = targetPort;
                    outPort = this;
                } else {
                    inPort = this;
                    outPort = targetPort;
                }

                // remove the existing connection of 'targetPort' 
                if (inPort.conns[0])
                    this.graph.removeConnectionView(inPort.conns[0]);

                const conn = new ConnectionView(uuid, inPort, outPort, this.graph);

                this.graph.addConnectionView(conn);
            }
        }

        this.selected = false;
    }

    public mouseOver(evt: MouseOverEvent) {
        this.node.hovered = true;
    }

    public mouseOut(evt: MouseOutEvent) {
        this.node.hovered = false;
    }

    private drawDashStyleConnection(ctx: CanvasRenderingContext2D) {
        const mouseX = this.mouseDraggingX;
        const mouseY = this.mouseDraggingY;
        const port = <Circle>this.area;

        ctx.beginPath();
        ctx.strokeStyle = Color4Canvas.DashLineGray;
        ctx.lineWidth = 2;
        ctx.moveTo(port.centerX, port.centerY);

        if (this.port.type == PortType.In) {
            ctx.bezierCurveTo(
                port.centerX - 60,
                port.centerY,
                mouseX + 60,
                mouseY,
                mouseX,
                mouseY
            );
        } else {
            ctx.bezierCurveTo(
                port.centerX + 60,
                port.centerY,
                mouseX - 60,
                mouseY,
                mouseX,
                mouseY
            );
        }

        ctx.setLineDash([5, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}