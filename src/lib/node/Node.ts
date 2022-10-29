import { useStore } from 'vuex'
import { key } from '@/store'

export class Node {
    public id: string;
    public type: string;
    protected vertexSource: string;
    protected fragmentSource: string;
    public canvas: HTMLCanvasElement;
    protected gl: WebGLRenderingContext;
    protected buffers: Object;
    protected programInfo: Object;
    protected store;

    constructor(canvas: HTMLCanvasElement) {
        console.log("this is father node");
        this.canvas = canvas;
        const self = this;
        canvas.addEventListener("mousedown", function(evt: MouseEvent) {
			self.onMouseDown(evt);
		});
        // console.log(this.canvas);

        this.store = useStore(key);
        // console.log(this.store.state.count);
        // this.store.commit('add');
        // console.log(this.store.state.count);
    }

    onMouseDown(evt:MouseEvent) {
        console.log("click");
        // console.log(this.canvas);
        // console.log(this.canvas.id);
        this.store.commit('displayNodeOnComponents', this.canvas);
        // console.log(this.store.state.count);
        // this.store.commit('add');
        // console.log(this.store.state.count);
    }

    protected initBuffers(gl: WebGLRenderingContext): void {
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
            -1.0, 1.0,
            1.0, -1.0,
            -1.0, -1.0,
        ];
        //纹理坐标缓冲区
        const texBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(texpositions),
            gl.STATIC_DRAW);

        this.buffers = {
            position: positionBuffer,
            texture: texBuffer,
        };
    }

    protected initShaderProgram(gl: WebGLRenderingContext,
        vsSource: string, fsSource: string): WebGLProgram {
        const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
        // 创建着色器程序
        const shaderProgram = gl.createProgram();
        console.log(vertexShader);
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
        console.log("load shader");
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
            console.log(type);
            console.log('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }


}