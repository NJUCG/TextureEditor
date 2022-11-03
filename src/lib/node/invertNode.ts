import { Node } from "./Node"
import { TestNode,drawScene } from "./simpleNode";
export  class InvertNode extends Node{
    private InputNode:any;
    private texture:WebGLTexture;
    private frameBuffer:WebGLFramebuffer;

    constructor(canvas:HTMLCanvasElement){
        super(canvas);
        //创建输入节点
        // this.setInputNode(new TestNode(canvas));

        this.type = "filter";
        this.canvas = canvas;
        this.canvas.id='invertNode';
        this.setCanvas(300,400);
        // loadInput(this.InputNode).then(
        //     result=>{
        //         console.log("then");
        //     }
        // );
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
            // vec4 col = 1.0 -  texture2D(u_texture,v_texcoord);
            // col.a = 1.0;
            // gl_FragColor= col;
            gl_FragColor = vec4(1,0,0.5,1);
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
        
        const buffers = this.initBuffers(this.gl);

        //创建纹理
        const texture = gl.createTexture();
        // const inputTex = this.InputNode.getPixelData();

        gl.bindFramebuffer(gl.FRAMEBUFFER,null);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        //绑定输入节点的结果到texture
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 255, 255]));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        this.texture = texture;
        //绘画
        
        drawScene(gl,programInfo,buffers);
        console.log("invert draw");
    }

    //获取该节点的结果
    public getTexture():WebGLTexture{
        return this.texture;
    }


}
// async function loadInput(node:TestNode) {
//     console.log(node.flag);
//     console.log("intput node finshed return true");
//     return true;
// }