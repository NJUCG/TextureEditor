import { ConnectionScene } from "./connectionscene";
import { GeneratorNodeScene } from "./generatornodescene";
import { NodeScene } from "./nodescene";

//节点的in/out接口
export enum SocketType {
    In,
    Out
}

export class SocketScene extends NodeScene {
    public socketType: SocketType;
    private radius: number;
    public select: boolean;//选中接口
    public connected: boolean;//当前接口有连接
    public connections: ConnectionScene[];
    public node: NodeScene;
    public movingX: number;
    public movingY: number;

    constructor(type: SocketType, node: NodeScene) {
        super();
        this.socketType = type;
        this.radius = 4;
        this.select = false;
        this.connected = false;
        this.connections = [];
        this.width = this.radius * 2;
        this.height = this.radius * 2;
        this.node = node;
        this.movingX = 0;
        this.movingY = 0;
    }

    draw(ctx: CanvasRenderingContext2D) {

        ctx.lineWidth = 1;
        //ctx.rect(this.x, this.y, this.width, this.height);
        ctx.beginPath();
        ctx.fillStyle = "rgb(150,150,150)";
        ctx.arc(this.centerX(), this.centerY(), this.radius, 0, 2 * Math.PI);
        ctx.fill();

        // border
        ctx.beginPath();
        ctx.arc(this.centerX(), this.centerY(), this.radius, 0, 2 * Math.PI);
        ctx.strokeStyle = "rgb(0, 0, 0)";
        ctx.stroke();

        if (this.select) this.drawActiveConnection(ctx);
    }

    drawActiveConnection(ctx: CanvasRenderingContext2D) {
        if (this.select) {
            const mouseX = this.movingX;
            const mouseY = this.movingY;

            ctx.beginPath();
            ctx.strokeStyle = "rgb(200, 200, 200)";
            ctx.lineWidth = 4;
            ctx.moveTo(this.centerX(), this.centerY());//开始点

            if (this.socketType == SocketType.Out) {
                ctx.bezierCurveTo(
                    this.centerX() + 60,
                    this.centerY(), // control point 1
                    mouseX - 60,
                    mouseY,
                    mouseX,
                    mouseY
                );
            } else {
                ctx.bezierCurveTo(
                    this.centerX(),
                    this.centerY() - 60, // control point 1
                    mouseX,
                    mouseY + 60,
                    mouseX,
                    mouseY
                );
            }

            ctx.setLineDash([5, 3]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    mouseDown(evt: CustomEvent) {
        this.select = true;
        console.log("socketHit");
        this.movingX = this.centerX();
        this.movingY = this.centerY();

        // 当前接口有连接
        if (this.socketType == SocketType.In && this.connections.length) { }
    }

    mouseMove(evt: CustomEvent) {
        if (this.select) {
            this.movingX += evt.detail.deltaX;
            this.movingY += evt.detail.deltaY;
        }
    }

    mouseUp(evt: CustomEvent) {
        if (!this.connected) {//没连上
            this.select = false;
        }
    }

    public centerX(): number {
        return this.x + this.width / 2;
    }

    public centerY(): number {
        return this.y + this.height / 2;
    }

    public setCenter(x: number, y: number) {
        this.x = x - this.width / 2;
        this.y = y - this.height / 2;
    }

    public move(deltaX: number, deltaY: number) {
        this.x += deltaX;
        this.y += deltaY;
    }

}