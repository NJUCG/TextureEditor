//结点图

export class NodeGraph{

    canvas:HTMLCanvasElement;


    constructor(canvas: HTMLCanvasElement){
        this.canvas = canvas;
    }

    public draw(){
        //每个下属节点都设置draw
    }

    onNodeFouced:()=>void;
}