import { resolveComponent, withCtx } from "vue";
import { PatternNode,ColorNode } from "./node/generatorNode";
import { InvertNode,BlendNode } from "./node/filterNode";
import { Connection } from "./node/connection";
import { Node } from "./node/Node";
import { Color } from "./designer/color";



interface NodeItem<V> {
	[key: string]: V;
}

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
	node: Node;

	constructor(
		type: string,
		name: string = "",
		node: Node,
	) {
		this.type = type;
		this.name = name;
		this.node = node;
	}
}

export class LibraryMonitor {
	utils: NodeItem<LibraryItem>;
	atomicNodes: NodeItem<LibraryItem>;
	functionnodes: NodeItem<LibraryItem>;
	generators: NodeItem<LibraryItem>;
	filterNodes: NodeItem<LibraryItem>;
	view3D: NodeItem<LibraryItem>;
	connect: NodeItem<LibraryItem>;

	constructor() {
		this.utils = {};
		this.functionnodes = {};
		this.view3D = {};
		this.generators = {};
		this.filterNodes = {};
		this.connect = {};
		this.atomicNodes = {};

		//add color Node
		const colorNode = new ColorNode();
		colorNode.drawScene();
		this.addNode("generators", "colorNode", colorNode);
		
	}

	public addNode(//向libraryItem中添加节点
		type: string,
		name: string = "",
		nodeItem: Node,
	) {
		if (type == "generators") {
			const node = new LibraryItem(type, name, nodeItem);
			this.generators[name] = node;
			console.log(this.generators);
		}
		else if (type == "atomicNodes") {
			const node = new LibraryItem(type, name, nodeItem);
			this.atomicNodes[name] = node;
		}
		else if (type == "filters") {
			const node = new LibraryItem(type, name, nodeItem);
			this.filterNodes[name] = node;
		}
	}

	// public addConnection(connect: Connection)//添加连接
	// {
	// 	this.connect[name] = connect;
	// }
}

//异步加载图片并渲染fbo
// async function loadImage(node1) {
// 	const gl = node1.gl;
// 	const image = node1.image;
// 	const tex = node1.texture;

// 	const promise = new Promise((reslove) => {
// 		//加载图片 绘制到缓冲区 drawFbo
// 		node1.image.src = require("../assets/1.jpg");
// 		node1.image.onload = async function () {
// 			//将加载的图片放到texture中
// 			gl.bindTexture(gl.TEXTURE_2D, tex);
// 			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
// 			drawFbo(node1);
// 			drawCanvas(node1);
// 			reslove(1);
// 		}

// 	})
// 	await promise;
// 	console.log('loading finshed');

// }



// //结果绘画到画布上
// function drawCanvas(node: Node) {
// 	const gl = node.gl;
// 	const tex = node.getTexture();
// 	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
// 	gl.bindTexture(gl.TEXTURE_2D, tex);
// 	node.drawScene();
// 	gl.bindTexture(gl.TEXTURE_2D, null);
// }

// //离屏渲染:结果保存为pixeldata
// function drawFbo(node: Node) {
// 	const gl = node.gl;
// 	const tex = node.getTexture();
// 	const fb = node.getFrameBuffer();
// 	const targetTex = node.getTargetTexture();
// 	//绘制到fbo中
// 	gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
// 	gl.framebufferTexture2D(gl.FRAMEBUFFER,
// 		gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTex, 0);
// 	gl.bindTexture(gl.TEXTURE_2D, tex);
// 	gl.viewport(0, 0, 512, 512);
// 	node.drawScene();
// 	node.calPixelData();
// 	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
// 	gl.bindTexture(gl.TEXTURE_2D, null);
// }

// //copy canvas result from webgl canvas to 2d canvas
// export function copyFromCanvas(src: HTMLCanvasElement, dest: HTMLCanvasElement) {

// 	const context = dest.getContext("2d");
// 	dest.width = 512;
// 	dest.height = 512;

// 	// console.log("copying from " + src.width + " to " + dest.width);
// 	context.clearRect(0, 0, dest.width, dest.height);
// 	context.rotate(Math.PI);
// 	context.translate(-dest.width, -dest.height);
// 	context.drawImage(src, 0, 0, dest.width, dest.height);
// }


// export function testCanvas(canvas: HTMLCanvasElement) {
// 	const ctx = canvas.getContext("2d");
// 	canvas.width = 300;
// 	canvas.height = 300;
// 	//draw a rectangle in canvas and rotate 90 degree
// 	ctx.fillStyle = "green";
// 	//旋转虚拟画布后再绘画
// 	// ctx.translate(-canvas.width, -canvas.height);
// 	// ctx.rotate(Math.PI/6);
// 	ctx.translate(canvas.width, 0);
// 	ctx.scale(-1, 1);
// 	ctx.fillRect(20, 20, 150, 100);

// }