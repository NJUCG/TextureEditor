//节点编辑器

import { group } from "console";
import { NodeGraph } from "./nodegraph";

export class Editor{

    canvas: HTMLCanvasElement;
    graph: NodeGraph;




    constructor(canvas:HTMLCanvasElement){
        this.setCanvas(canvas);
    }

    public draw(): void {
        if(this.graph) this.graph.draw();
    }

    public setCanvas(canvas:HTMLCanvasElement){
        this.canvas=canvas;
        this.setGraph(canvas);
    }

    public setGraph(canvas:HTMLCanvasElement){
        this.graph = new NodeGraph(canvas);

    }
}