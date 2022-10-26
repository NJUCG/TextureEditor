//节点编辑器

import { group } from "console";
import { NodeGraph } from "./nodegraph";

export class Editor{

    canvas: HTMLCanvasElement;
    graph: NodeGraph;
    // focuedNode:Node;//node类还没定义

    // view2D:



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
        //为graph添加事件
        // this.graph.onNodeFouced = 
    }
}