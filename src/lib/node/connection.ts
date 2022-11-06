import {Node} from "./Node"
import {PatternNode} from "./simpleNode"
import { InvertNode } from "./invertNode"

export class Connection {
    private input:Node;
    private output:Node;
    private id:string;
    constructor(node1,node2){
        this.setInput(node1);
        this.setOutput(node2);
        connect(node1,node2);
    }
    public setInput(node:Node){
        this.input = node;
    }
    public setOutput(node:Node){
        this.output = node;
    }

    public getInput(){
        return this.input;
    }

    public getOutput(){
        return this.output;
    }

}


async function connect(node1:PatternNode,node2:InvertNode) {
	console.log('make input node');
	const gl =node1.gl;
	const image = node1.image;
	const tex = node1.texture;
	const targetTex = node1.getTargetTexture();
	const fb = node1.getFrameBuffer();
	const promise = new Promise((reslove)=>{
		//加载图片
		node1.image.src = require("../../assets/1.jpg");
		node1.image.onload = async function () {
			gl.bindTexture(gl.TEXTURE_2D, tex);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
			gl.bindFramebuffer(gl.FRAMEBUFFER,fb);
            gl.framebufferTexture2D(gl.FRAMEBUFFER,
                gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,targetTex,0);
			gl.bindTexture(gl.TEXTURE_2D,tex);
			gl.viewport(0,0,512,512);
			node1.drawScene();
			gl.bindFramebuffer(gl.FRAMEBUFFER,null);
			gl.bindTexture(gl.TEXTURE_2D,null);
			reslove(1);
		}
		
	})
	await promise;

	//创建第二个节点
	node2.setInputNode(node1);	
    node2.drawScene();
}