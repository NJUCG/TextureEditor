import { BaseNode, NodeType } from "./node/base-node";
import { ShaderNode } from "./node/shader-node";
import { Connection } from "./node/connection";
import { ThumbnailRenderer } from "./manager/thumbnail";
import { PropertyType, EnumProperty } from "./node/node-property";
import { Library } from "./library";

export class NodeInputInfo {
    name: string;
    node: BaseNode;

    constructor(name: string, node: BaseNode) {
        this.name = name;
        this.node = node;
    }
}

export class NodeRenderingContext {
    canvas: HTMLCanvasElement;
    gl: WebGL2RenderingContext;
    fbo: WebGLFramebuffer;
    inputs: NodeInputInfo[];
    textureWidth: number;
    textureHeight: number;

    randomSeed: number;

    constructor(canvas: HTMLCanvasElement, gl: WebGL2RenderingContext, fbo: WebGLFramebuffer, inputs: NodeInputInfo[], width: number, height: number, seed: number = 0) {
        this.canvas = canvas;
        this.gl = gl;
        this.fbo = fbo;
        this.inputs = inputs;
        this.textureWidth = width;
        this.textureHeight = height;
        this.randomSeed = seed;
    }
}

export class Designer {
    private static instance: Designer = null;
    public static getInstance() {
        if (!Designer.instance)
            Designer.instance = new Designer();
        return Designer.instance;
    }

    public canvas: HTMLCanvasElement;
    // rendering ctx
    public gl: WebGL2RenderingContext;
    public fbo: WebGLFramebuffer;
    public posBuffer: WebGLBuffer;
    public texCoordBuffer: WebGLBuffer;
    public texSize: number;
    public randomSeed: number;

    public nodes: Map<string, BaseNode>;
    public conns: Map<string, Connection>;

    public queueToUpdate: BaseNode[];

    // callbacks
    public onNodeTextureUpdated: (Node: BaseNode) => void;

    private constructor() {
        // webgl2 context
        this.canvas = document.createElement("canvas");
        this.gl = this.canvas.getContext("webgl2");
        // init thumbnail renderer
        ThumbnailRenderer.getInstance().initRenderingCtx(this.canvas, this.gl);
        // designer texture's resolution
        this.texSize = this.canvas.width = this.canvas.height = 2048;
        this.randomSeed = 32;

        /** webgl2 query extension */
        // let result = this.gl.getExtension("EXT_disjoint_timer_query_webgl2");
        // if (result)
        //     console.log("TIMER QUERY SUPPORTED", result);
        // else
        //     console.log("TIMER QUERY NOT SUPPORTED", result);
        // this.queryExt = result;
        
        /** floating point textures support */
        let result = this.gl.getExtension("EXT_color_buffer_float");
		if (!result) 
            console.log("COLOR BUFFER FLOAT NOT SUPPORTED", result);
		result = this.gl.getExtension("OES_texture_float_linear");
		if (!result) 
            console.log("TEXTURE FLOAT LINEAR NOT SUPPORTED", result);
		result = this.gl.getExtension("EXT_texture_norm16");
		if (!result) 
            console.log("TEXTURE NORM16 NOT SUPPORTED", result);

        this.nodes = new Map<string, BaseNode>();
        this.conns = new Map<string, Connection>();

        this.queueToUpdate = [];
        
        this.init();
    }

    public update() {
        let updateTimeLimit = 1e13;

        while (this.queueToUpdate.length != 0) {
            for (const node of this.queueToUpdate) {
                this.queueToUpdate.splice(this.queueToUpdate.indexOf(node), 1);
                this.updateNode(node);

                if (--updateTimeLimit < 0)
                    break;
            }
        }
    }

    public reset() {
        this.nodes.clear();
        this.conns.clear();
        this.queueToUpdate = [];
    }

    public save() {
        const data = {};
        data["texSize"] = this.texSize;
        data["randomSeed"] = this.randomSeed;

        // node info
        const nodeInfo = [];
        this.nodes.forEach((node) => {
            // basic info
            const info = {};
            info["uuid"] = node.uuid;
            info["name"] = node.name;
            info["type"] = node.type;
            info["randomSeed"] = node.randomSeed;
            // properties
            const propInfo = {};
            for (const prop of node.properties) {
                if (prop.type == PropertyType.Image) {
                    // 需要实现
                } else {
                    propInfo[prop.name] = prop.getValue();
                }
            }
            info["properties"] = propInfo;

            nodeInfo.push(info);
        });
        
        // connection info
        const connInfo = [];
        this.conns.forEach((conn) => {
            // basic info
            const info = {};
            info["uuid"] = conn.uuid;
            info["outNodeId"] = conn.outNodeId;
            info["outPortIndex"] = conn.outPortIndex;
            info["inNodeId"] = conn.inNodeId;
            info["inPortIndex"] = conn.inPortIndex;
            
            connInfo.push(info);
        });

        data["nodes"] = nodeInfo;
        data["conns"] = connInfo;

        return data;
    }

    public static load(data: {}, library: Library) {
        const designer = new Designer();
        designer.texSize = data["texSize"];
        designer.randomSeed = data["randomSeed"];

        // load nodes
        const nodeInfo = data["nodes"];
        for (const info of nodeInfo) {
            // console.log(info);
            const uuid: string = info["uuid"];
            const name: string = info["name"];
            const type: NodeType = info["type"];
            const randomSeed: number = info["randomSeed"];
            
            const node = library.createNode(name, type, designer);
            node.uuid = uuid;
            node.randomSeed = randomSeed;

            const propInfo = info["properties"];
            // console.log(typeof(props), props);
            for (const name of Object.keys(propInfo))
                node.setProperty(name, propInfo[name]);

            designer.addNode(node);
        }

        // load connections
        const connInfo = data["conns"];
        for (const info of connInfo) {
            const uuid = info["uuid"];
            const outNodeId = info["outNodeId"];
            const outPortIndex = info["outPortIndex"];
            const inNodeId = info["inNodeId"];
            const inPortIndex = info["inPortIndex"];

            designer.addConnection(uuid, outNodeId, outPortIndex, inNodeId, inPortIndex);
        }

        return designer;
    }
    
    private init() {
        // buffer, fbo, shader是所有节点共用的, 用于节点渲染和生成节点缩略图
        this.initBuffers();
        this.initFBO();
    }

    private initBuffers() {
        const gl = this.gl;
        // 位置顶点坐标
        this.posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                1.0, 1.0,
                -1.0, 1.0,
                1.0, -1.0,
                -1.0, -1.0,
            ]),
            gl.STATIC_DRAW
        );
        // 纹理顶点坐标
        this.texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                1.0, 1.0,
                0.0, 1.0,
                1.0, 0.0,
                0.0, 0.0,
            ]),
            gl.STATIC_DRAW
        );
        
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

    }

    private initFBO() {
        const gl = this.gl;
        this.fbo = gl.createFramebuffer();
    }
    
    /**
     * update the node
     * @param node 
     * @param processInputs 
     * note:
     * 1. ensure all input nodes are already updated
     */
    private updateNode(node: BaseNode) {
        const inputs = node.inputs;

        // update input nodes
        for (const port of inputs) {
            if (port.conns.length) {
                const outNode = this.nodes.get(port.conns[0].outNodeId);
                if (outNode.needToUpdate) {
                    this.updateNode(outNode);

                    outNode.needToUpdate = false;
                    this.queueToUpdate.splice(this.queueToUpdate.indexOf(outNode), 1);
                }
            }
        }

        // set rendering context
        const context = new NodeRenderingContext(this.canvas, this.gl, this.fbo, [], this.texSize, this.texSize, this.randomSeed);
        for (const port of node.inputs) {
            if (port.conns.length) {
                const input = new NodeInputInfo(port.name, this.nodes.get(port.conns[0].outNodeId));
                context.inputs.push(input);
            }
        }

        // rendering
        (node as ShaderNode).renderingToTexture(context);
        // emit event: texture updated
        if (this.onNodeTextureUpdated)
            this.onNodeTextureUpdated(node);
        
        node.needToUpdate = false;
    }

    public addNode(node: BaseNode) {
        this.nodes.set(node.uuid, node);
        node.gl = this.gl;
        node.designer = this;
        console.log("Designer-addNode...", node);
        this.requestToUpdate(node);
    }

    public removeNode(uuid: string) {
        // node doesnt exist
        if (!this.nodes.has(uuid))
            return;

        this.nodes.delete(uuid);
    }

    public addConnection(uuid: string, outNodeId: string, outPortIndex: number, inNodeId: string, inPortIndex: number) {
        const conn = new Connection(uuid, outNodeId, outPortIndex, inNodeId, inPortIndex);
        this.conns.set(uuid, conn);
        // update in&out Node's port connection
        this.nodes.get(inNodeId).inputs[inPortIndex].addConnection(conn);
        this.nodes.get(outNodeId).outputs[outPortIndex].addConnection(conn);

        console.log("Designer-addConnection...", conn);
        this.requestToUpdate(this.nodes.get(inNodeId));

        // return conn;
    }

    public removeConnection(connId: string) {
        // conn doesnt exist
        if (!this.conns.has(connId))
            return;

        const conn = this.conns.get(connId);
        this.nodes.get(conn.inNodeId).inputs[conn.inPortIndex].removeConnection(conn);
        this.nodes.get(conn.outNodeId).outputs[conn.outPortIndex].removeConnection(conn);
        // console.log("designer.removing a connection...");
        // console.log(this.nodes);

        this.requestToUpdate(this.nodes.get(conn.inNodeId));
        this.conns.delete(connId);
    }

    /**
     * requset to update
     * add node and its subsequent nodes to update list recursively
     * @param node 
     */
    public requestToUpdate(node: BaseNode) {
        if (this.queueToUpdate.indexOf(node) == -1) {
            // console.log("requestToUpdate: addtoqueue");
            // console.log(node);
            node.needToUpdate = true;
            this.queueToUpdate.push(node);
        }

        // add all right nodes of this node
        for (const port of node.outputs) {
            for (const conn of port.conns) {
                this.requestToUpdate(this.nodes.get(conn.inNodeId));
            }
        }
    }

    public getNodeById(uuid: string): BaseNode {
		if (this.nodes.has(uuid))
			return this.nodes.get(uuid);

		return null;
	}
}
