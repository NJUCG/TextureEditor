import { Node } from "./Node"
import { PatternNode} from "./simpleNode";
export  class InvertNode extends Node{
    private InputNode:any;
    // private frameBuffer:WebGLFramebuffer;

    constructor(){
        super();
        const canvas = this.canvas;
        this.setCanvas(512,512);
        this.type = "filter";
        this.canvas = canvas;
        this.canvas.id='invertNode';


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


        // this.drawScene();

    }

    //将输入节点的结果绑定到当前节点的texture
    public setInputNode(node1: PatternNode): void {
        const data = node1.getPixelData();
        const gl = this.gl;
        const texture = this.texture;

        // gl.bindFramebuffer(gl.FRAMEBUFFER,null);
        gl.bindTexture(gl.TEXTURE_2D,texture);
        //绑定输入节点的结果到texture
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
             512 , 512, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            data);
    }




}


