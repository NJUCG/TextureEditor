import { resolveComponent, withCtx } from "vue";
import {PatternNode} from "./node/simpleNode";
import { InvertNode } from "./node/invertNode";
import { Connection } from "./node/connection";
import { Node } from "./node/Node";
export enum LibraryItemType {
	Utils = "utils",//comment frame pin...
	AtomicNodes = "atomicnodes",//自定义原子节点
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
	atomicNodes: Array<LibraryItem>;
	filterNodes:Array<LibraryItem>;
	connect:Array<Connection>;

	constructor() {
		this.generators = [];
		this.filterNodes = [];
		this.connect = [];
		this.atomicNodes = [];
		const canvas = <HTMLCanvasElement>document.createElement("canvas");
		

		const pattern = new PatternNode();
		//绘制到fbo和canvas上
		loadImage(pattern);
		
		const invert = new InvertNode();
		//建立节点连接
		const connect = new Connection(pattern,invert);	
		
		//画布测试
		// testCanavs(canvas);

		//setTimeout 4s then draw invert's canvas
		setTimeout(() => {
			//渲染画布
			drawCanvas(pattern);
			drawCanvas(invert);
			//渲染fbo
			drawFbo(invert);
			document.body.appendChild(pattern.canvas);
			document.body.appendChild(invert.canvas);

		}, 3000);

		this.addNode(pattern.type, pattern.id, pattern);
		// add invert node
		this.addNode(invert.type, invert.id, invert);
		//add connection
		this.addConnection(connect);
		
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
		else if(type == "atomicNodes"){
			const node = new LibraryItem(type, name, nodeItem);
			this.atomicNodes.push(node);
		}
		else if (type == "filters"){
			const node = new LibraryItem(type, name, nodeItem);
			this.filterNodes.push(node);
		}
	}

	public addConnection(connect:Connection)//添加连接
	{
		this.connect.push(connect);
	}
}

//pattern节点读取图片并渲染fbo
async function loadImage(node1){
	const gl =node1.gl;
	const image = node1.image;
	const tex = node1.texture;

	const promise = new Promise((reslove)=>{
		//加载图片 绘制到缓冲区 drawFbo
		node1.image.src = require("../assets/1.jpg");
		node1.image.onload = async function () {
			//将加载的图片放到texture中
			gl.bindTexture(gl.TEXTURE_2D, tex);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
			drawFbo(node1);

			reslove(1);
		}
		
	})
	await promise;
	console.log('loading finshed');	
	//当前Node加载完成
	node1.flag = true;


}

function drawCanvas(node){
	const gl = node.gl;
	const tex = node.getTexture();
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D,tex);
	node.drawScene();
	gl.bindTexture(gl.TEXTURE_2D,null);
}

//绘制到fbo上得到pixeldata结果
function drawFbo(node:Node){
	const gl = node.gl;
	const tex = node.getTexture();
	const fb = node.getFrameBuffer();
	const targetTex = node.getTargetTexture();
	//绘制到fbo中
	gl.bindFramebuffer(gl.FRAMEBUFFER,fb);
	gl.framebufferTexture2D(gl.FRAMEBUFFER,
		gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,targetTex,0);
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.viewport(0,0,512,512);
	node.drawScene();
	node.calPixelData();
	gl.bindFramebuffer(gl.FRAMEBUFFER,null);
	gl.bindTexture(gl.TEXTURE_2D,null);

}

//将webGL画布内容转移到2d画布
export function copyFromCanvas(src:HTMLCanvasElement, dest:HTMLCanvasElement) {
	
	const context = dest.getContext("2d");
	dest.width = 512;
	dest.height = 512;

	// console.log("copying from " + src.width + " to " + dest.width);
	context.clearRect(0, 0, dest.width, dest.height);
	context.rotate(Math.PI);
	context.translate(-dest.width, -dest.height);	
	context.drawImage(src, 0, 0, dest.width, dest.height);
}


export function testCanvas(canvas:HTMLCanvasElement){
	const ctx = canvas.getContext("2d");
	//draw a rectangle in canvas and rotate 90 degree
	ctx.fillStyle="green";
	//旋转虚拟画布后再绘画
	ctx.translate(-canvas.width, -canvas.height);
	ctx.rotate(Math.PI / 4);
	ctx.fillRect(20,20,150,100);

	// document.body.appendChild(canvas);
}