import { resolveComponent } from "vue";
import {PatternNode} from "./node/simpleNode";
import { InvertNode } from "./node/invertNode";
import { Connection } from "./node/connection";

export enum LibraryItemType {
	Utils = "utils",//comment frame pin...
	AtomicNodes = "ctomicnodes",//自定义原子节点
	FunctionNodes = "functionnodes",//函数节点
	Generators = "generators",
	Filters = "filters",
	View3D = "view3d",//环境参数
}

export class LibraryItem {//新建节点模块
	type: string;
	name: string;
	node: any;

	constructor(
		type: string,
		name: string = "",
		node
	) {
		this.type = type;
		this.name = name;
		this.node = node;
	}
}

export class LibraryMonitor {
	generators: Array<LibraryItem>;
	
	constructor() {
		this.generators = [];
		const canvas = <HTMLCanvasElement>document.createElement("canvas");
		
		const pattern = new PatternNode();
		//绘制到fbo和canvas上
		loadImage(pattern,canvas);
		document.body.appendChild(pattern.canvas);	
		document.body.appendChild(canvas);	

		// const invert = new InvertNode(canvas);
		//建立节点连接
		// const connect = new Connection(pattern,invert);
		
		
	
		this.addNode(pattern.type, pattern.id, pattern);
		// testAsync(pattern,invert);
		// console.log('3');
	}

	public addNode(//向libraryItem中添加节点
		type: string,
		name: string = "",
		nodeItem
	) {
		if (type == "generators") {
			const node = new LibraryItem(type, name, nodeItem);
			this.generators.push(node);
		}
	}
}

async function loadImage(node1,targetcanvas){
	const gl =node1.gl;
	const image = node1.image;
	const tex = node1.texture;
	const targetTex = node1.getTargetTexture();
	const fb = node1.getFrameBuffer();
	const promise = new Promise((reslove)=>{
		//加载图片 绘制到缓冲区 drawFbo
		node1.image.src = require("../assets/1.jpg");
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
	console.log('loading finshed');
	//绘制到画布上
	drawCanvas(node1);
	//尝试将node canvas绘制到另一个canvas上
	// copyFromCanvas(node1.canvas,targetcanvas);
	copyFromCanvas(node1.canvas,targetcanvas);


}
function drawCanvas(node){
	const gl = node.gl;
	const tex = node.getTexture();
	gl.bindTexture(gl.TEXTURE_2D,tex);
	node.drawScene();
}

//把画布上的内容转移到另一个画布
function copyFromCanvas(src, dest:HTMLCanvasElement) {
	console.log(src);
	const context = dest.getContext("2d");
	dest.width = 512;
	dest.height = 512;
	//console.log("copying from " + src.width + " to " + dest.width);
	context.clearRect(0, 0, dest.width, dest.height);
	context.drawImage(src, 0, 0, dest.width, dest.height);
}