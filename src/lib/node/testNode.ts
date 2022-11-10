import { Node } from "./Node"
import { PatternNode} from "./simpleNode";
export  class testNode extends Node{
    private InputNode:any;
    private texture:WebGLTexture;
    // private frameBuffer:WebGLFramebuffer;

    constructor(canvas:HTMLCanvasElement){
        super(canvas);

        // this.setCanvas(512,512);
        this.type = "filter";
        this.canvas = canvas;
        this.canvas.id='invertNode';
        this.setCanvas(512,512);
        this.addBoolProperty("testbool","testbool");
        this.addEnumProperty("testEnum","testEnum",["1","2","3"]);
        this.addFloatProperty("testf","testf",1,1,100,1);
        this.gl = this.canvas.getContext("webgl");
        const gl = this.gl;
        if(!this.gl){
            console.log('fail to get context');
        }
        this.vertexSource = `
        attribute vec4 aVertexPosition;
        attribute vec2 aTexCoord;
        varying vec2 v_texcoord;
        void main(){
            gl_Position=aVertexPosition;
            v_texcoord = aTexCoord;
        }
        `;
        this.fragmentSource = `
        precision mediump float;
        varying vec2 v_texcoord;
        uniform sampler2D u_texture;
        void main(){
            vec4 col = 1.0 -  texture2D(u_texture,v_texcoord);
            col.a = 1.0;
            gl_FragColor= col;
            // gl_FragColor = vec4(1,0,0.5,1);
        }
        `;

        const shaderProgram = this.initShaderProgram(this.gl, this.vertexSource, this.fragmentSource);

        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: this.gl.getAttribLocation(shaderProgram, "aVertexPosition"),
                texCoordLocation: this.gl.getAttribLocation(shaderProgram, "aTexCoord"),
            },
            uniformLocations: {
                textureLocation: this.gl.getUniformLocation(
                    shaderProgram,
                    "u_texture"
                ),
            },

        }
        this.programInfo = programInfo;
        const buffers = this.initBuffers(this.gl);
        this.buffers = buffers;
        //创建纹理
        const texture = gl.createTexture();
        this.texture = texture;
        // const inputTex = this.InputNode.getPixelData();

        gl.bindTexture(gl.TEXTURE_2D, texture);
        const data =null;
        //绑定输入节点的结果到texture
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0,
            gl.RGBA, gl.UNSIGNED_BYTE,
            data);//粉色new Uint8Array([0, 0, 255, 255]
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

        //绘画

        // this.drawScene();
        gl.bindTexture(gl.TEXTURE_2D,null);
        console.log("invert draw");
    }

    //将输入节点的结果绑定到当前节点的texture
    public setInputNode(node1: PatternNode): void {
        const data = node1.getPixelData();
        const gl = this.gl;
        const texture = node1.getTargetTexture();
        console.log("input tex");
        console.log(data);
        gl.bindFramebuffer(gl.FRAMEBUFFER,null);
        gl.bindTexture(gl.TEXTURE_2D,texture);
        //绑定输入节点的结果到texture
        // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
        //      1 , 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        //     data);
        // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, node.image);
    }




}


