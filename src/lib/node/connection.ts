import {Node} from "./Node"

export class Connection {
    private input:Node;
    private output:Node;
    private id:string;
    constructor(){

    }
    public setInput(node:Node){
        this.input = node;
    }
    public setOutput(node:Node){
        this.output = node;
    }
}