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
		
		const pattern = new PatternNode(canvas);
		const invert = new InvertNode(canvas);
		//建立节点连接
		const connect = new Connection(pattern,invert);

		document.body.appendChild(canvas);
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
