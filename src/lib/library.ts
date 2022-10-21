

export enum LibraryItemType {
    Utils = "utils",//comment frame pin...
	AtomicNodes = "ctomicnodes",//自定义原子节点
	FunctionNodes = "functionnodes",//函数节点
	Generators = "generators",
	Filters = "filters",
    View3D = "view3d",//环境参数
}

export class LibraryItem {
	type: LibraryItemType;
	name: string;
	displayName: string;

	constructor(
		type: LibraryItemType,
		name: string = "",
		displayName: string = ""
	) {
		this.type = type;
		this.name = name;
		this.displayName = displayName;
	}
}

export class LibraryMonitor{
    constructor(){}

    public addNode(//向libraryItem中添加节点
        type: LibraryItemType,
        name: string = "",
        displayName: string = ""
    ){

    }
}