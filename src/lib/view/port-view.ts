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
    // 只有In Port存储对应的Connection
    private conn: ConnectionView;
    private mouseDraggingX: number;
    private mouseDraggingY: number;

    constructor(uuid: string, port: Port, node: NodeView, x: number = 0, y: number = 0, r: number = 8, graph: NodeGraph = null) {
        super(uuid, graph);
        this.area = new Circle(x, y, r);
        this.port = port;
        this.node = node;
        this.conn = null;
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

    public setCenter(x: number, y: number) {
        (this.area as Circle).setCenter(x, y);
    }

    public get connection() {
        return this.conn;
    }

    public set connection(conn: ConnectionView) {
        this.conn = conn;
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
            if (stillDAG && this.connectionValid(this, targetPort)) {
                const uuid = newUUID();
                const conn = new ConnectionView(uuid);

                if (this.port.type == PortType.Out) {
                    conn.in = targetPort;
                    conn.out = this;
                    
                    // remove the existing connection of 'targetPort' 
                    if (targetPort.conn)
                        this.graph.removeConnectionView(targetPort.conn);
                } else {
                    conn.in = this;
                    conn.out = targetPort; 

                    if (this.conn) 
                        this.graph.removeConnectionView(this.conn);
                }

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

    private connectionValid(outPort: PortView, inPort: PortView): boolean {
        return inPort != outPort
            && inPort.port.type != outPort.port.type
            && inPort.node != outPort.node
    }

}