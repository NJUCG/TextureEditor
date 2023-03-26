import { BaseNode } from "./node/base-node";
import { ShaderNode } from "./node/shader-node";
import { Connection } from "./node/connection";
import { createShaderProgram } from "./webgl-utils";
import { TextureCanvas } from "./utils/texture-canvas";

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
    public canvas: HTMLCanvasElement;
    // rendering ctx
    public gl: WebGL2RenderingContext;
    public fbo: WebGLFramebuffer;
    public posBuffer: WebGLBuffer;
    public texCoordBuffer: WebGLBuffer;
    public texSize: number;
    public randomSeed: number;

    public thumbnailProgram: WebGLProgram;      // 仅用于从targetTex绘制缩略图

    public nodes: Map<string, BaseNode>;
    public conns: Map<string, Connection>;

    public queueToUpdate: BaseNode[];

    // callbacks
    public onNodeTextureUpdated: (Node: BaseNode) => void;

    public constructor() {
        // webgl2 context
        this.canvas = document.createElement("canvas");
        this.gl = this.canvas.getContext("webgl2");
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
    
    private init() {
        // buffer, fbo, shader是所有节点共用的, 用于节点渲染和生成节点缩略图
        this.initBuffers();
        this.initFBO();
        this.initThumbnailProgram();
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

    private initThumbnailProgram() {
        const vertSource = `#version 300 es
        precision highp float;

        in vec3 aVertPosition;
        in vec2 aTexCoord;
            
        out vec2 vTexCoord;

        void main() {
            gl_Position = vec4(aVertPosition, 1.0);
            vTexCoord = aTexCoord;
        }`
        const fragSource = `#version 300 es
        precision highp float;

        in vec2 vTexCoord;
        uniform sampler2D uTex;
        
        out vec4 outColor;
        
        void main() {
            outColor = texture(uTex, vTexCoord);
        }`

        this.thumbnailProgram = createShaderProgram(this.gl, vertSource, fragSource);
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

    /**
     * render node's texture then draw it on the image canvas
     * @param texture
     * @param canvas 
     */
    public renderTextureToCanvas(texture: WebGLTexture, targetCanvas: TextureCanvas) {
        const gl = this.gl;

        // bind shader
        gl.useProgram(this.thumbnailProgram);
		// bind mesh
		const posLoc = gl.getAttribLocation(this.thumbnailProgram, "aVertPosition");
		const texCoordLoc = gl.getAttribLocation(
			this.thumbnailProgram,
			"aTexCoord"
		);

		// provide texture coordinates for the rectangle.
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
		gl.enableVertexAttribArray(posLoc);
		gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
		gl.enableVertexAttribArray(texCoordLoc);
		gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);

		// send texture
		gl.uniform1i(gl.getUniformLocation(this.thumbnailProgram, "uTex"), 0);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.clearColor(1, 1, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.bindVertexArray(vao);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

		// cleanup
		gl.disableVertexAttribArray(posLoc);
		gl.disableVertexAttribArray(texCoordLoc);
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);

		targetCanvas.drawToTextureCanvas(this.canvas);
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

        console.log("Designer-addConnection", conn);
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
            console.log("requestToUpdate: addtoqueue");
            console.log(node);
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
