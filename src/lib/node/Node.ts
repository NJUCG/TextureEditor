import {storeToRefs} from 'pinia'
import { useMainStore } from '@/store/index';

export class Node {
    public id: string;
    public type: string;
    protected vertexSource: string;
    protected fragmentSource: string;
    public canvas: HTMLCanvasElement;
    protected gl: WebGLRenderingContext;
    // protected buffers: any;
    // protected programInfo: any;
    protected size:GLuint;//图片分辨率
    protected store;
    protected inputNode:Node;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.size = 512;
        const self = this;
        canvas.addEventListener("mousedown", function(evt: MouseEvent) {
			self.onMouseDown(evt);
		});
        // console.log(this.canvas);

        this.store = useMainStore();
    }

    onMouseDown(evt:MouseEvent) {
        console.log("click");
        this.store.displayNodeOnComponents(this.canvas);
    }

    protected initBuffers(gl: WebGLRenderingContext) {
        // Create a buffer for the square's positions.
        const positionBuffer = gl.createBuffer();

        // Select the positionBuffer as the one to apply buffer
        // operations to from here out.

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // Now create an array of positions for the square.
        //由两个三角形构造一个矩形
        const positions = [
            1.0, 1.0,
            -1.0, 1.0,
            1.0, -1.0,
            -1.0, -1.0,
        ];

        // Now pass the list of positions into WebGL to build the
        // shape. We do this by creating a Float32Array from the
        // JavaScript array, then use it to fill the current buffer.

        gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(positions),
            gl.STATIC_DRAW);

        const texpositions = [
            1.0, 1.0,
            0.0, 1.0,
            1.0, 0.0,
            0.0, 0.0,
        ];
        //纹理坐标缓冲区
        const texBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(texpositions),
            gl.STATIC_DRAW);

        const buffers = {
            position: positionBuffer,
            texture: texBuffer,
        };
        return buffers;
    }

    protected initShaderProgram(gl: WebGLRenderingContext,
        vsSource: string, fsSource: string): WebGLProgram {
        const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
        // 创建着色器程序
        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        // 创建失败，alert
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
            return null;
        }

        return shaderProgram;
    }

    protected loadShader(gl: WebGLRenderingContext, type: number, source: string) {
        const shader = gl.createShader(type);

        // Send the source to the shader object

        gl.shaderSource(shader, source);

        // Compile the shader program

        gl.compileShader(shader);

        // See if it compiled successfully
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
            console.log(type);
            console.log('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    protected initFrameBufferObject(gl:WebGLRenderingContext,texture:WebGLTexture){
        
        // 创建FBO 帧缓冲区
        const framebuffer = gl.createFramebuffer();
     
        // 将帧缓冲区绑定到程序上
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
     
        // The WebGLRenderingContext.framebufferTexture2D() method of the WebGL API attaches a texture to a WebGLFramebuffer.
        //将framebufer渲染到一个纹理附件中
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        // 创建渲染缓冲区 深度缓冲区
        const colorBuffer = gl.createRenderbuffer(); // Create a renderbuffer object
        gl.bindRenderbuffer(gl.RENDERBUFFER, colorBuffer); // Bind the object to target
        //根据size创建buffer
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA4, this.size,this.size);
        //将帧缓冲区绑定到渲染缓冲区上
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, colorBuffer);
     
     
        // 解除帧缓冲区绑定
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        //解除纹理
        gl.bindTexture(gl.TEXTURE_2D, null);
        //解除 渲染缓冲区
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
     
        return framebuffer;
    }


    public setInputNode(node:Node){
        this.inputNode = node;
    }

    protected setCanvas(width,height){
        this.canvas.width = width;
        this.canvas.height = height;
    }
    public drawScene() {
        
      }
}