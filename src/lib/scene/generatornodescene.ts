import { ImageCanvas } from "../designer/imagecanvas";
import { NodeGraph } from "../nodegraph";
import { Vector2 } from "../utils/utils";
import { Node } from "../node/Node";
import { NodeSceneState, NodeScene, MouseDownEvent, MouseMoveEvent, MouseUpEvent } from "./nodescene"
import { useMainStore } from '@/store/index';

export class GeneratorNodeScene extends NodeScene {
    public id: string;
    public nodecanvas: ImageCanvas;
    thumbnail: HTMLImageElement;
	protected store;

    constructor(node: Node) {
        super();
        this.width = 50;
        this.height = 50;
        this.id = node.id;
        this.nodecanvas = new ImageCanvas();
		this.nodecanvas.copyFromCanvas(node.canvas, true);

		//綁定鼠标监听事件
        const self = this;
		const canvas = this.nodecanvas.canvas;
        canvas.addEventListener("mousedown", function (evt: MouseEvent) {
            self.onMouseDown(evt);
        });

        this.store = useMainStore();
    }

	onMouseDown(evt: MouseEvent) {
        console.log("click");
        this.store.displayNodeOnComponents(this);
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

	public setCenter(x: number, y: number) {
		this.x = Math.max(0,x-this.width/2);
		this.y = Math.max(0,y-this.height/2);
	}
}