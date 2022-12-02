//结点图
import { Node } from "./node/Node";
import { GeneratorNodeScene } from "./scene/generatornodescene";
import { NodeSceneState } from "./scene/nodescene";
export class NodeGraph {

    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    // displayNode:
    nodes:Array<GeneratorNodeScene>;


    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        // this.context = canvas.getContext("2d");
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