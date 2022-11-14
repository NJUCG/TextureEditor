import {storeToRefs} from 'pinia'
import { useMainStore } from '@/store/index';
import { LibraryItemType } from '../library';

import {
    Property,
    FloatProperty,
    IntProperty,
    BoolProperty,
    EnumProperty,
    StringProperty,
    IPropertyHolder,
    PropertyType,
    PropertyGroup
} from "./NodeProperty";
export class Node {
    public id: string;
    public type: LibraryItemType;
    protected vertexSource: string;
    protected fragmentSource: string;
    public canvas: HTMLCanvasElement;
    public gl: WebGLRenderingContext;

    //resolution
    protected size:GLuint;
    protected store;
    protected inputNode:Node;
    protected buffers:any;
    protected programInfo:any;
    //current node's result
    protected pixelData;
    //input texture
    protected texture:WebGLTexture;
    //用于离屏渲染
    protected frameBuffer:WebGLFramebuffer;
    //离屏渲染的结果存储到targetTexture里
    protected targetTexture:WebGLTexture;
    properties: Property[] = [];
    propertyGroups: PropertyGroup[] = [];
    constructor() {
        this.canvas=<HTMLCanvasElement>document.getElementById('mycanvas');
        if(this.canvas == null){
            this.canvas = <HTMLCanvasElement>document.createElement("canvas");

        }
        const canvas = this.canvas;
        this.size = 512;

        //获取上下文
        this.gl = this.canvas.getContext("webgl");
        const gl = this.gl;

        //创建缓冲区
        const buffers = this.initBuffers(this.gl);
        this.buffers = buffers;

        //创建纹理
        const texture = gl.createTexture();
        this.texture = texture;
        //设置纹理相关参数
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.bindTexture(gl.TEXTURE_2D, null);

        // image.src = "../../assets/1.jpg";
        //创建保存节点渲染结果的目标纹理并设置相关参数
        const targetTexture = gl.createTexture();
        this.targetTexture = targetTexture;
        const data = null;
        gl.bindTexture(gl.TEXTURE_2D,targetTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
            this.size, this.size, 0,
            gl.RGBA, gl.UNSIGNED_BYTE, data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);

        //创建frameBufferObject
        const frameBuffer = gl.createFramebuffer();
        this.frameBuffer = frameBuffer;
        gl.bindFramebuffer(gl.FRAMEBUFFER,frameBuffer);
        /*
        *将fbo和targetTexture绑定
        * 通过fbo将渲染结果保存到targetTexture中
        */
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, 0);


        //綁定鼠标监听事件
        const self = this;
        canvas.addEventListener("mousedown", function(evt: MouseEvent) {
			self.onMouseDown(evt);
		});
        // console.log(this.canvas);

        this.store = useMainStore();
    }

    onMouseDown(evt:MouseEvent) {
        console.log("click");
        // this.store.displayNodeOnComponents(this.canvas);
        this.store.displayNodeOnComponents(this.getPixelData());

        // console.log(this.getPixelData());
    }


    //初始化缓冲区对象:顶点缓冲区、纹理缓冲区
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

    //初始化着色程序
    protected initShaderProgram(gl: WebGLRenderingContext,
        vsSource: string, fsSource: string): WebGLProgram {
        const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        // 创建失败，报错
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
            return null;
        }

        return shaderProgram;
    }

    //加载并编译着色器
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

    //初始化fbo
    protected initFrameBufferObject(gl:WebGLRenderingContext,texture:WebGLTexture){

        // 创建FBO 帧缓冲区
        const framebuffer = gl.createFramebuffer();

        // 将帧缓冲区绑定到程序上
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

        // The WebGLRenderingContext.framebufferTexture2D() method of the WebGL API attaches a texture to a WebGLFramebuffer.

        // 创建渲染缓冲区 深度缓冲区
        const depthBuffer = gl.createRenderbuffer(); // Create a renderbuffer object
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer); // Bind the object to target
        //根据size创建buffer
        gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16, this.size,this.size);
        //将帧缓冲区绑定到渲染缓冲区上
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

        gl.bindTexture(gl.TEXTURE_2D,texture);
        //纹理对象作为帧缓冲区的颜色缓冲区对象
        gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);
        // 解除帧缓冲区绑定
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        //解除纹理
        gl.bindTexture(gl.TEXTURE_2D, null);

        //解除 渲染缓冲区
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        return framebuffer;
    }

    //resize canvas
    protected setCanvas(width,height){
        this.canvas.width = width;
        this.canvas.height = height;
    }

    //draw the result of this Node
    public drawScene(): void {
        const gl = this.gl;
        const programInfo = this.programInfo;
        const buffers = this.buffers;
        gl.viewport(0,0,this.size,this.size);
        gl.clearColor(0.0, 1.0, 0.0, 1.0);  // Clear to black, fully opaque
        // gl.clearDepth(1.0);                 // Clear everything
        // gl.enable(gl.DEPTH_TEST);           // Enable depth testing
        // gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

        // Clear the canvas before we start drawing on it.

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Tell WebGL to use our program when drawing
        gl.useProgram(programInfo.program);
        //设置如何从位置缓冲区取数据到vertexPosition属性
        {
          gl.enableVertexAttribArray(
              programInfo.attribLocations.vertexPosition);
          gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
          const numComponents = 2;  // pull out 3 values per iteration
          const type = gl.FLOAT;    // the data in the buffer is 32bit floats
          const normalize = false;  // don't normalize
          const stride = 0;         // how many bytes to get from one set of values to the next
                                    // 0 = use type and numComponents above
          const offset = 0;         // how many bytes inside the buffer to start from

          gl.vertexAttribPointer(
              programInfo.attribLocations.vertexPosition,
              numComponents,
              type,
              normalize,
              stride,
              offset);

        }

        {
            gl.enableVertexAttribArray(programInfo.attribLocations.texCoordLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texture);
            const numComponents = 2;  // 每次迭代从缓冲区取出的数目
            const type = gl.FLOAT;    // the data in the buffer is 32bit floats
            const normalize = false;  // don't normalize
            const stride = 0;         // how many bytes to get from one set of values to the next
            const offset = 0;         // how many bytes inside the buffer to start from

            gl.vertexAttribPointer(programInfo.attribLocations.texCoordLocation,numComponents,type,normalize,stride,offset);

          }


        //u_texture使用纹理单位0
        gl.uniform1i(programInfo.uniformLocations.textureLocation,0);
        {
          const offset = 0;
          const vertexCount = 4;
          gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
        }
		//清除
		gl.disableVertexAttribArray(programInfo.attribLocations.vertexPosition);
		gl.disableVertexAttribArray(programInfo.attribLocations.texCoordLocation);

    }



    public calPixelData():Uint8Array{
		const gl = this.gl as WebGL2RenderingContext;
        const texture = this.targetTexture;
        //4代表rgba四个通道
		const data = new Uint8Array(this.size * this.size * 4);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
		gl.framebufferTexture2D(
			gl.FRAMEBUFFER,
			gl.COLOR_ATTACHMENT0,
			gl.TEXTURE_2D,
			texture,
			0
		);

		if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE) {
            //512*512*4
			gl.readPixels(0, 0, this.size, this.size, gl.RGBA, gl.UNSIGNED_BYTE, data);
		} else {
			alert("getPixelData: unable to read from framebuffer");
		}
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        this.pixelData = data;
		return data;
    }


    public getTexture(){
        return this.texture;
    }

    public getFrameBuffer(){
        return this.frameBuffer;
    }

    public getTargetTexture(){
        return this.targetTexture;
    }

    public getPixelData(){
        return this.pixelData;
    }
    addIntProperty(
        id: string,
        displayName: string,
        defaultVal = 1,
        minVal = 1,
        maxVal = 100,
        increment = 1
    ): IntProperty {
        const prop = new IntProperty(id, displayName, defaultVal);
        prop.minValue = minVal;
        prop.maxValue = maxVal;
        prop.step = increment;

        this.properties.push(prop);
        return prop;
    }
    addFloatProperty(
        id: string,
        displayName: string,
        defaultVal = 1,
        minVal = 1,
        maxVal = 100,
        increment = 1
    ): FloatProperty {
        const prop = new FloatProperty(id, displayName, defaultVal);
        prop.minValue = minVal;
        prop.maxValue = maxVal;
        prop.step = increment;

        this.properties.push(prop);
        return prop;
    }

    addBoolProperty(
        id: string,
        displayName: string,
        defaultVal = false
    ): BoolProperty {
        const prop = new BoolProperty(id, displayName, defaultVal);

        this.properties.push(prop);
        return prop;
    }

    addEnumProperty(
        id: string,
        displayName: string,
        defaultVal: string[] = []
    ): EnumProperty {
        const prop = new EnumProperty(id, displayName, defaultVal);

        this.properties.push(prop);
        return prop;
    }



    addStringProperty(
        id: string,
        displayName: string,
        defaultVal = ""
    ): StringProperty {
        const prop = new StringProperty(id, displayName, defaultVal);

        this.properties.push(prop);
        return prop;
    }

}
