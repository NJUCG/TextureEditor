import { ImageCanvas } from "../designer/imagecanvas";
import { NodeGraph } from "../nodegraph";
import { Vector2 } from "../utils/utils";
import { Node } from "../node/Node";
import { NodeSceneState, NodeScene, MouseDownEvent, MouseMoveEvent, MouseUpEvent } from "./nodescene"

export class GeneratorNodeScene extends NodeScene {
    id: string;
    nodecanvas: ImageCanvas;
    thumbnail: HTMLImageElement;

    constructor(node: Node) {
        super();
        this.width = 100;
        this.height = 100;
        this.id = node.id;
        this.nodecanvas = new ImageCanvas();
		this.nodecanvas.copyFromCanvas(node.canvas, true);
    }

    public draw(ctx: CanvasRenderingContext2D, nodeState: NodeSceneState) {
        // border
		if (nodeState.selected) {
			ctx.strokeStyle = "rgb(255, 255, 255)";
			ctx.beginPath();
			ctx.lineWidth = 8;
			//ctx.rect(this.x, this.y, this.width, this.height);
			this.roundRect(ctx, this.x, this.y, this.width, this.height, 2);
			ctx.stroke();
		}
		// console.log(this.width, this.height);
		// background
		ctx.beginPath();
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.rect(this.x, this.y, this.width, this.height);
		ctx.fill();

        ctx.drawImage(
			this.nodecanvas.canvas,
			this.x,
			this.y,
			this.width,
			this.height
		);
        
    }

    public setThumbnail(thumbnail: HTMLImageElement) {
        this.thumbnail = thumbnail;
    }

}