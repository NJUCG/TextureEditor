//结点图
import { Node } from "./node/Node";
import { GeneratorNodeScene } from "./scene/generatornodescene";
import { NodeSceneState } from "./scene/nodescene";

export class Vector2 {
	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	clone(): Vector2 {
		return new Vector2(this.x, this.y);
	}

	static add(a: Vector2, b: Vector2): Vector2 {
		return new Vector2(a.x + b.x, a.y + b.y);
	}

	static subtract(a: Vector2, b: Vector2): Vector2 {
		return new Vector2(a.x - b.x, a.y - b.y);
	}
}

export class NodeGraph {

    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    // displayNode:
    nodes:Array<GeneratorNodeScene>;


    constructor(canvas: HTMLCanvasElement) {
        this.nodes = [];
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        // canvas.addEventListener("mousedown", this.onMouseDown);
    }

    public draw() {
        //每个下属节点都设置draw
        const nodeState: NodeSceneState = {
			hovered: false, // mouse over
			selected: false // selected node
		};
        for (const item of this.nodes) {
			item.draw(this.context, nodeState);
		}
    }

    public addNode(node: GeneratorNodeScene) {
		this.nodes.push(node);

	}
}