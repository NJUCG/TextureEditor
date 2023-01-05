//节点编辑器

import { NodeGraph } from "./nodegraph";
import { LibraryMonitor } from '@/lib/library';
import { Node } from "./node/Node";
import { GeneratorNodeScene } from "./scene/generatornodescene";

export class Editor {

    canvas: HTMLCanvasElement;
    graph: NodeGraph;//放editor画布中的所有子节点画布及关联
    library: LibraryMonitor;

    constructor(canvas: HTMLCanvasElement) {
        this.setCanvas(canvas);
        // this.node= new TestNode();
    }

    public draw(): void {
        if(this.graph) this.graph.draw();
    }

    public setCanvas(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.setGraph(canvas);
    }

    public setGraph(canvas: HTMLCanvasElement) {
        this.graph = new NodeGraph(canvas);
    }

    public addNode(node: Node, clientX:number, clientY:number) {
        //todo: 用得到的node给GeneratorNodeScene中的canvas赋值
        const nodeItem = new GeneratorNodeScene(node);
        console.log(nodeItem);
        this.graph.addNode(nodeItem);
        const rect = this.canvas.getBoundingClientRect();
		const pos = [Math.max(0,clientX - rect.left), Math.max(0,clientY - rect.top)];
		nodeItem.setCenter(pos[0], pos[1]);
    }

}