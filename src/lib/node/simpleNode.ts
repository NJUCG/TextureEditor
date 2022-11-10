import { Node } from "./Node"

//Pattern节点
export class PatternNode extends Node{
    public flag:boolean = false;
    public image:HTMLImageElement;
    
    // public targetTexture:WebGLTexture;
    // public frameBuffer:WebGLFramebuffer;

    //在节点内创建画布
    constructor() {
        //对可视化canvas的处理

        super();
        const canvas = this.canvas;
        this.type = "generators";
        this.setCanvas(512,512);
        this.canvas = canvas;
        this.canvas.id = 'patternNode';

        const gl =this.gl;
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);


        if (!this.gl) {
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
            gl_FragColor= texture2D(u_texture,v_texcoord);
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

        const image = new Image();
        this.image = image;

    }


    
}

