import * as Atomic from "./node/atomic-node";
import * as Generator from "./node/generator-node";
import * as Filter from "./node/filter-node";
import { BaseNode, NodeType } from "./node/base-node";
import { Designer } from "./designer";

export enum LibraryItemType {
	Node = "node",
	Comment = "comment",
	Frame = "frame",
}
/** 资源库物品信息类, 用于在drag&drop传递相关物品的信息
 * params:
 *  type -- 物品类型: node, comment, frame等
 *  name -- 该物品的名称, 用于drop时创建对应物品
 */
export class LibraryItemInfo {
	type: LibraryItemType;
	nodeType: NodeType;
	name: string;

	constructor(type: LibraryItemType, nodeType: NodeType, name: string = "") {
		this.type = type;
		this.nodeType = nodeType;
		this.name = name;
	}
}

// 节点构造器类, 用于创建name类型的节点
export class NodeCreator {
	public name: string;
	public type: NodeType;
	public create: () => BaseNode;
}

export class Library {
	private static instance: Library = null;
    public static getInstance() {
        if (!Library.instance)
            Library.instance = new Library();
        return Library.instance;
    }

	public util: Map<string, NodeCreator>;
	public atom: Map<string, NodeCreator>;
	public function: Map<string, NodeCreator>;
	public generator: Map<string, NodeCreator>;
	public filter: Map<string, NodeCreator>;
	public view3d: Map<string, NodeCreator>;

	private constructor() {
		this.util = new Map<string, NodeCreator>();
		this.atom = new Map<string, NodeCreator>();
		this.function = new Map<string, NodeCreator>();
		this.generator = new Map<string, NodeCreator>();
		this.filter = new Map<string, NodeCreator>();
		this.view3d = new Map<string, NodeCreator>();

		// atomic
		this.addNodeCreator("output", NodeType.Atomic, Atomic.OutputNode);
		this.addNodeCreator("normal", NodeType.Atomic, Atomic.NormalNode);
		this.addNodeCreator("color", NodeType.Atomic, Atomic.ColorNode);
		// generators
		this.addNodeCreator("simplex", NodeType.Generator, Generator.SimplexNoiseNode);
		this.addNodeCreator("worley", NodeType.Generator, Generator.WorleyNoiseNode);
		this.addNodeCreator("brick", NodeType.Generator, Generator.BrickNode);
		this.addNodeCreator("polygon", NodeType.Generator, Generator.PolygonNode);
		this.addNodeCreator("gradient", NodeType.Generator, Generator.GradientNode);
		this.addNodeCreator("cell", NodeType.Generator, Generator.CellNode);
		
		// filters
		this.addNodeCreator("invert", NodeType.Filter, Filter.InvertNode);
		this.addNodeCreator("blend", NodeType.Filter, Filter.BlendNode);
		this.addNodeCreator("blur", NodeType.Filter, Filter.BlurNode);
	}

	/** 用于建立节点库
	 * refs: https://blog.rsuter.com/how-to-instantiate-a-generic-type-in-typescript/
	 *       https://stackoverflow.com/questions/39622778/what-is-new-in-typescript
	 * params:
	 *  name -- 节点名称, 用于访问不同的构造器
	 *  type -- 节点对应的类
	 *  */
	public addNodeCreator<T extends BaseNode>(
		name: string,
		type: NodeType,
		node: (new() => T)
	) {
		const creator = new NodeCreator();
		creator.name = name;
		creator.type = type;
		creator.create = (): BaseNode => {
			return new node();
		}
		switch (type) {
			case NodeType.Util:
				this.util.set(name, creator);
				break;
			case NodeType.Atomic:
				this.atom.set(name, creator);
				break;
			case NodeType.Function:
				this.function.set(name, creator);
				break;
			case NodeType.Generator:
				this.generator.set(name, creator);
				break;
			case NodeType.Filter:
				this.filter.set(name, creator);
				break;
			case NodeType.View3D:
				this.view3d.set(name, creator);
				break;
			default:
				console.log("Library-addNodeCreator: Unexpected node creator type!");
		}
	}

	// 建立节点库以后, 通过该函数创建不同种类的节点
	public createNode(name: string, type: NodeType, designer: Designer): BaseNode {
		let creator = null;
		switch (type) {
			case NodeType.Util:
				creator = this.util.get(name);
				break;
			case NodeType.Atomic:
				creator = this.atom.get(name);
				break;
			case NodeType.Function:
				creator = this.function.get(name);
				break;
			case NodeType.Generator:
				creator = this.generator.get(name);
				break;
			case NodeType.Filter:
				creator = this.filter.get(name);
				break;
			case NodeType.View3D:
				creator = this.view3d.get(name);
				break;
			default:
				console.log("Library-createNode: Unexpected node creator type!");
		}
		
		if (creator == undefined) {
			console.log("Library-creatorNode: Undefined node creator!");
			return;
		}
		const node = creator.create();
		node.initRenderingCtx(designer);
		node.initNode(name);

		return node;
	}
}

