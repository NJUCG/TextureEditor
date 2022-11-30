//节点编辑器

import { NodeGraph } from "./nodegraph";
import {PatternNode} from "./node/simpleNode";
import { LibraryMonitor } from '@/lib/library';

export class Editor{

    canvas: HTMLCanvasElement;
    graph: NodeGraph;
    library:LibraryMonitor;
    // focuedNode:Node;//node类还没定义
    // node:TestNode;
    // view2D:



    constructor(canvas:HTMLCanvasElement){
        this.setCanvas(canvas);
        console.log(canvas);
        // this.node= new TestNode();
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

    public setLibrary(library:LibraryMonitor){
        this.library = library;
    }
}