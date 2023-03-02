import { resolveComponent, withCtx } from "vue";
import { PatternNode,ColorNode,SimplexNoiseNode, WorleyNoiseNode, BrickNode, PolygonNode, GradientNode, CellNode} from "./node/generatorNode";
import { BlurNode,BlendNode, InvertNode } from "./node/filterNode";
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

		//add generator node
		const colorNode = new ColorNode();
		colorNode.initCanvas();
		this.addNode("generators", "colorNode", colorNode);
		
		const simplexNoiseNode = new SimplexNoiseNode();
		simplexNoiseNode.initCanvas();
		this.addNode("generators","simplexNoiseNode",simplexNoiseNode);

		const worleyNoiseNode = new WorleyNoiseNode();
		worleyNoiseNode.initCanvas();
		this.addNode("generators","WorleyNoiseNode",worleyNoiseNode);

		const brickNode = new BrickNode();
		brickNode.initCanvas();
		this.addNode("generators","brickNode",brickNode);

		const polygonNode = new PolygonNode();
		polygonNode.initCanvas();
		this.addNode("generators","polygonNode",polygonNode);

		const gradientNode = new GradientNode();
		gradientNode.initCanvas();
		this.addNode("generators","gradientNode",gradientNode);

		const cellNode = new CellNode();
		cellNode.initCanvas();
		this.addNode("generators","cellNode",cellNode);

		//add filter node
		const blendNode = new BlendNode();
		blendNode.initCanvas();
		this.addNode("filters","blendNode",blendNode);

		//add blur node
		const blurNode = new BlurNode();
		blurNode.initCanvas();
		this.addNode("filters","blurNode",blurNode);

		//add invert node
		const invertNode = new InvertNode();
		invertNode.initCanvas();
		this.addNode("filters","invertNode",invertNode);
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

