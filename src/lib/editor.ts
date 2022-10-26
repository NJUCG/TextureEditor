//节点编辑器

import { group } from "console";
import { NodeGraph } from "./nodegraph";
import {TestNode} from "./node/simpleNode";

export class Editor{

    canvas: HTMLCanvasElement;
    graph: NodeGraph;
    node:TestNode;



    constructor(canvas:HTMLCanvasElement){
        this.setCanvas(canvas);
        this.node= new TestNode();
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
        // this.graph
    }
}