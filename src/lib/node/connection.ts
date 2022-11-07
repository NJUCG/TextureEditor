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
			node1.calPixelData();
			gl.bindFramebuffer(gl.FRAMEBUFFER,null);
			gl.bindTexture(gl.TEXTURE_2D,null);
			reslove(1);
		}
		
	})
	await promise;
	gl.bindFramebuffer(gl.TEXTURE_2D,null);
	gl.bindTexture(gl.TEXTURE_2D,tex);
	node1.drawScene();
	//创建第二个节点
	//将输入节点结果绑定到texture
	// node2.setInputNode(node1);
	//画布中绘画
    // node2.drawScene();

	//缓冲区绘画
	// gl.bindFramebuffer(gl.FRAMEBUFFER,null);
	// gl.bindTexture(gl.TEXTURE_2D,null);
	// drawFbo(node2);
	// console.log("check pixel data ");
	// console.log(node2.getPixelData());

}

function drawFbo(node:InvertNode){
	const gl = node.gl;
	const tex = node.getTexture();
	const fb = node.getFrameBuffer();
	const targetTex = node.getTargetTexture();
	//绘制到fbo中
	gl.bindTexture(gl.TEXTURE_2D, tex);
	// gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
	gl.bindFramebuffer(gl.FRAMEBUFFER,fb);
	gl.framebufferTexture2D(gl.FRAMEBUFFER,
		gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,targetTex,0);
	gl.bindTexture(gl.TEXTURE_2D,tex);
	gl.viewport(0,0,512,512);
	node.drawScene();
	node.calPixelData();
	gl.bindFramebuffer(gl.FRAMEBUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,null);

}