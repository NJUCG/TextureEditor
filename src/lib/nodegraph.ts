//结点图

export class NodeGraph {

    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    // displayNode:
    // nodes:[];


    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        // this.context = canvas.getContext("2d");
        // canvas.addEventListener("mousedown", this.onMouseDown);
    }

    public draw() {
        //每个下属节点都设置draw
    }

    onNodeFouced: (node) => void;

    onMouseDown(evt:MouseEvent){
        
    }
}