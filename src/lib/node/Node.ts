import { storeToRefs } from 'pinia'
import { useMainStore } from '@/store/index';
import { LibraryItemType } from '../library';
import { Color } from "../designer/color";
import {
    Property,
    FloatProperty,
    IntProperty,
    BoolProperty,
    EnumProperty,
    StringProperty,
    ColorProperty,
    IPropertyHolder,
    PropertyType,
    PropertyGroup
} from "./NodeProperty";
import { exitCode } from 'process';
import { WebGLMultipleRenderTargets } from 'three';
export class Node {
    public name: string;
    public id: string;
    public type: LibraryItemType;
    
    protected vertexSource: string;
    protected fragmentSource: string;

    public canvas: HTMLCanvasElement;
    public ownCanvas:HTMLCanvasElement;//library canva

    public gl: WebGLRenderingContext;

    //resolution
    public size: GLuint;
    protected store;
    protected inputNode: Node;
    public buffers: any;
    public programInfo: any;
    //current node's result
    protected pixelData;
    //input texture
    // protected texture: WebGLTexture;
    //用于离屏渲染
    protected frameBuffer: WebGLFramebuffer;
    //离屏渲染的结果存储到targetTexture里
    protected targetTexture: WebGLTexture;
    protected shaderPorgram: WebGLProgram;

    protected inputNodes: Node[] = [];//输入节点
    protected inputNames: string[] = [];//GLSL输入名称
    properties: Property[] = [];
    propertyGroups: PropertyGroup[] = [];

    public texIndex:GLuint=0;//纹理序号
    textures: WebGLTexture[] = [];//纹理序列

    constructor() {
        
        this.canvas = <HTMLCanvasElement>document.getElementById('mycanvas');

        if (this.canvas == null) {
            this.canvas = <HTMLCanvasElement>document.createElement("canvas");
            this.canvas.setAttribute("id", "mycanvas");
            
            // this.canvas.draggable = true;
            console.log("fail to get ");
        }
        else{
            console.log("get it");
        }
       
        
        this.size = 512;
        this.setCanvas(this.size,this.size);
        // this.resizeCanvasToDisplaySize(this.canvas,1);

        //获取上下文
        this.gl = this.canvas.getContext("webgl");
        const gl = this.gl;
        //反置y轴
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        //创建缓冲区
        const buffers = this.initBuffers(this.gl);
        this.buffers = buffers;

        //创建保存节点渲染结果的目标纹理并设置相关参数
        const targetTexture = gl.createTexture();
        this.targetTexture = targetTexture;
        const data = null;
        gl.bindTexture(gl.TEXTURE_2D, targetTexture);
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
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        /*
        *将fbo和targetTexture绑定
        * 通过fbo将渲染结果保存到targetTexture中
        */
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        this.vertexSource = `
        attribute vec4 aVertexPosition;
        attribute vec2 aTexCoord;

        varying vec2 vTexCoord;
        
        void main(){
            gl_Position=aVertexPosition;
            vTexCoord = aTexCoord;
        }
        `;


        
        //綁定鼠标监听事件
        // const self = this;
        // canvas.addEventListener("mousedown", function (evt: MouseEvent) {
        //     self.onMouseDown(evt);
        // });
        // canvas.addEventListener("dragend", function (evt: DragEvent) {
        //     self.onDragStart(evt);
        // });

        // this.store = useMainStore();
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
        // const positions = [
        //     1.0, 1.0,
        //     -1.0, 1.0,
        //     1.0, -1.0,
        //     -1.0, -1.0,
        // ];
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
            position: positionBuffer,//顶点缓冲区
            texture: texBuffer,//纹理缓冲区
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
    protected initFrameBufferObject(gl: WebGLRenderingContext, texture: WebGLTexture) {

        // 创建FBO 帧缓冲区
        const framebuffer = gl.createFramebuffer();

        // 将帧缓冲区绑定到程序上
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

        // The WebGLRenderingContext.framebufferTexture2D() method of the WebGL API attaches a texture to a WebGLFramebuffer.

        // 创建渲染缓冲区 深度缓冲区
        const depthBuffer = gl.createRenderbuffer(); // Create a renderbuffer object
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer); // Bind the object to target
        //根据size创建buffer
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.size, this.size);
        //将帧缓冲区绑定到渲染缓冲区上
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

        gl.bindTexture(gl.TEXTURE_2D, texture);
        //纹理对象作为帧缓冲区的颜色缓冲区对象
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        // 解除帧缓冲区绑定
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        //解除纹理
        gl.bindTexture(gl.TEXTURE_2D, null);

        //解除 渲染缓冲区
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        return framebuffer;
    }

    //resize canvas
    protected setCanvas(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    /**
     * Resize a canvas to match the size its displayed.
     * @param {HTMLCanvasElement} canvas The canvas to resize.
     * @param {number} [multiplier] amount to multiply by.
     *    Pass in window.devicePixelRatio for native pixels.
     * @return {boolean} true if the canvas was resized.
     * @memberOf module:webgl-utils
     */
    protected resizeCanvasToDisplaySize(canvas, multiplier) {
        multiplier = multiplier || 1;
        const width  = canvas.clientWidth  * multiplier | 0;
        const height = canvas.clientHeight * multiplier | 0;
        if (canvas.width !== width ||  canvas.height !== height) {
          canvas.width  = width;
          canvas.height = height;
          return true;
        }
        return false;
      }
    
    //draw at own canvas by common canvas
    public drawScene(){
        this.drawCanvas(this.canvas,this.gl,this.programInfo,this.buffers);
        copyFromCanvas(this.canvas,this.ownCanvas,this.size);
    }


    //draw the result of this Node at common canvas
    protected drawCanvas(canvas:HTMLCanvasElement,gl:WebGLRenderingContext,programInfo:any,buffers:any): void {

        gl.viewport(0, 0, 512,512);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
        // gl.clearDepth(1.0);                 // Clear everything
        // gl.enable(gl.DEPTH_TEST);           // Enable depth testing
        // gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

        // Clear the canvas before we start drawing on it.

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Tell WebGL to use our program when drawing
        gl.useProgram(programInfo.program);

        //对属性赋值
        this.setPropsValue();

        
        //设置如何从位置缓冲区取数据到vertexPosition属性
        {
          gl.enableVertexAttribArray(
              programInfo.attribLocations.vertexPosition);
          gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
          const numComponents = 2;  // pull out numComponets values per iteration
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
            gl.enableVertexAttribArray(
                programInfo.attribLocations.texCoordLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texture);
            const numComponents = 2; 
            const type = gl.FLOAT;    
            const normalize = false;  
            const stride = 0;         
            const offset = 0;       
  
            gl.vertexAttribPointer(
                programInfo.attribLocations.texCoordLocation,
                numComponents,
                type,
                normalize,
                stride,
                offset);
  
        }

        this.clearInputsTex();
        this.setInputsValue();
        
        {
            const offset = 0;
            const vertexCount = 4;
            gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
        }
        //清除
        gl.disableVertexAttribArray(programInfo.attribLocations.vertexPosition);
        gl.disableVertexAttribArray(programInfo.attribLocations.texCoordLocation);

    }

    //draw to targetTexture
    public drawFbo(){
        const gl = this.gl;
        // const tex = node.getTexture();
        const fb = this.frameBuffer;
        const targetTex = this.targetTexture;
        //绘制到fbo中
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTex, 0);
        // gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.viewport(0, 0, 512, 512);
        this.drawCanvas(this.canvas,this.gl,this.programInfo,this.buffers);
 
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    public calPixelData(): Uint8Array {
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


    // public getTexture() {
    //     return this.texture;
    // }

    public getFrameBuffer() {
        return this.frameBuffer;
    }

    public getTargetTexture() {
        return this.targetTexture;
    }

    public getPixelData() {
        return this.pixelData;
    }

    protected addInput(name: string) {
		this.inputNames.push(name);
	}

    //add input Node
    public addInputNode(node: Node) {
        this.inputNodes.push(node);
    }

    public getInputNode(){
        return this.inputNames;
    }

    //属性构建GLSL声明
	protected createCodeForProps() {
		let code = "";

		for (const prop of this.properties) {
			//code += "uniform sampler2D " + input + ";\n";
			if (prop instanceof FloatProperty) {
				code += "uniform float prop" + prop.name + ";\n";
			}
			if (prop instanceof IntProperty) {
				code += "uniform int prop" + prop.name + ";\n";
			}
			if (prop instanceof BoolProperty) {
				code += "uniform bool prop" + prop.name + ";\n";
			}
			if (prop instanceof EnumProperty) {
				code += "uniform int prop" + prop.name + ";\n";
			}
			if (prop instanceof ColorProperty) {
				code += "uniform vec4 prop" + prop.name + ";\n";
			}
		}

        code += "\n";

        return code;
    }

    //输入节点的GLSL声明   
    protected createCodeForInputs() {
		let code = "";

		for (const name of this.inputNames) {
			code += "uniform sampler2D input" + name + ";\n";
		}

		return code;
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
        defaultVal: string[] = [],
        defaultIndex: number = 0
    ): EnumProperty {
        const prop = new EnumProperty(id, displayName, defaultVal, defaultIndex);

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

    addColorProperty(
        id: string,
        displayName: string,
        defaultVal: Color
    ): ColorProperty {
        const prop = new ColorProperty(id, displayName, defaultVal);

        this.properties.push(prop);
        return prop;
    }

    //获得prop地址保存到programInfo中
    setPropsLocation() {
        const gl = this.gl;
        const shaderProgram = this.programInfo.program;
        const obj = this.programInfo.uniformLocations;
        for (const prop of this.properties) {
            //获取属性地址      
            Object.defineProperty(obj,"prop"+prop.name,{
                value:gl.getUniformLocation(shaderProgram, "prop" + prop.name),
                writable:true
            });
        }
    }

    //赋值prop
    setPropsValue(){
        const gl = this.gl;
        const locations = this.programInfo.uniformLocations;
        for(const prop of this.properties){
            const propLocation = locations["prop"+prop.name];
            if (prop instanceof FloatProperty) {
				gl.uniform1f(
					propLocation,
					(prop as FloatProperty).value
				);
			}
			if (prop instanceof IntProperty) {
				gl.uniform1i(
					propLocation,
					(prop as IntProperty).value
				);
			}
			if (prop instanceof BoolProperty) {
				gl.uniform1i(
					propLocation,
					(prop as BoolProperty).value == false ? 0 : 1
				);
			}
			if (prop instanceof EnumProperty) {
				gl.uniform1i(
					propLocation,
					(prop as EnumProperty).index
				);
			}
			if (prop instanceof ColorProperty) {
				const col = (prop as ColorProperty).value;
				gl.uniform4f(
					propLocation,
					col.r,
					col.g,
					col.b,
					col.a
				);
			}
        }

    }
    
    //获得输入节点的地址保存到ProgramInfo中
    setInputsLocation(){
        const gl = this.gl;
        const shaderProgram = this.programInfo.program;
        const obj  =this.programInfo.uniformLocations;
        for (const name of this.inputNames) {
            
            Object.defineProperty(obj,"input"+name,{
                value:gl.getUniformLocation(shaderProgram, "input"+name),
                writable:true
            });
		}


    
    }
    //将输入节点的纹理赋值给GLSL
    setInputsValue(){
        const gl = this.gl;
        var texIndex = 0;
        const locations = this.programInfo.uniformLocations;
        for (const input of this.inputNodes) {
            var name = this.inputNames[texIndex];
            // var texture = gl.createTexture();
			gl.activeTexture(gl.TEXTURE0 + texIndex);
			gl.bindTexture(gl.TEXTURE_2D, input.targetTexture);
            // //设置纹理参数
            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            // // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            // //设置纹理图像
            // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
            //     512 , 512, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            //    input.pixelData);
			gl.uniform1i(
				locations["input"+name],
				texIndex
			);
			texIndex++;
        }
        console.log(locations);

    }
    //清空输入节点纹理
    clearInputsTex(){
        const gl = this.gl;
        const locations = this.programInfo.uniformLocations;
        var texIndex = 0;
        for (const name of this.inputNames) {
			gl.activeTexture(gl.TEXTURE0 + texIndex);
			gl.bindTexture(gl.TEXTURE_2D, null);
			gl.uniform1i(locations["input"+name], 0);
            texIndex ++;
		}
    }

    //init owncanvas 
    public initCanvas(){
        
        this.ownCanvas = <HTMLCanvasElement>document.createElement("canvas");
        // this.ownCanvas = <HTMLCanvasElement>document.getElementById("ownCanvas");
        const canvas = this.ownCanvas;
        const gl = canvas.getContext("2d");
        // console.log(ctx);
        if(this.type == "generators"){
            this.drawScene();//draw on the common canvas then copy to node's own canvas
            
            // ctx.drawImage(this.canvas, 0, 0, this.size,this.size);
        }
        else{
            const ctx = canvas.getContext("2d");
            canvas.width=this.size;
            canvas.height=this.size;
    
            ctx.fillStyle="white";
            ctx.fillRect(0,0,512,512);
            console.log("filter init canvas");
            console.log(canvas);
           
        }
        
        
    }

    //unused method
    protected initownCanvas(image:any,canvas:HTMLCanvasElement) {

        console.log(image);
        const gl = canvas.getContext("webgl");
        if (!gl) {
          return;
        }
        
        // const vertexSource = `
        // attribute vec4 aVertexPosition;
        // attribute vec2 aTexCoord;

        // varying vec2 vTexCoord;
        
        // void main(){
        //     gl_Position=aVertexPosition;
        //     vTexCoord = aTexCoord;
        // }
        // `;

        const vertexSource = this.vertexSource;

        const fragmentSource = `
        precision mediump float;
        uniform sampler2D uTexture;

        varying vec2 vTexCoord;
        
        void main(){
            gl_FragColor= texture2D(uTexture,vTexCoord);
        }
        `;

        // setup GLSL program
        var shaderProgram = this.initShaderProgram(gl,vertexSource,fragmentSource);

        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
                texCoordLocation: gl.getAttribLocation(shaderProgram, "aTexCoord"),
            },
            uniformLocations: {
                textureLocation:gl.getUniformLocation(shaderProgram, "uTexture"),
            },  

        }

        // return a buffer Object containing of tex and pos Buffer
        const buffers = this.initBuffers(gl);
           
        // Create a texture.
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
      
        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      
        // Upload the image into the texture.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    
    
        return {gl:gl,programInfo:programInfo,buffers:buffers};
    }

    

}



//结果绘画到画布上
export function drawCanvas(node: Node) {
	const gl = node.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	node.drawScene();
	// gl.bindTexture(gl.TEXTURE_2D, null);
}

//离屏渲染:结果保存为pixeldata
export function drawFbo(node: Node) {
	const gl = node.gl;
	// const tex = node.getTexture();
	const fb = node.getFrameBuffer();
	const targetTex = node.getTargetTexture();
	//绘制到fbo中
	gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
	gl.framebufferTexture2D(gl.FRAMEBUFFER,
		gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTex, 0);
	// gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.viewport(0, 0, 512, 512);
	node.drawScene();
	node.calPixelData();
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, null);
}

//copy canvas result from webgl canvas to 2d canvas
export function copyFromCanvas(src: HTMLCanvasElement, dest: HTMLCanvasElement,size:GLuint) {
    
	const context = dest.getContext("2d");
    console.log(dest);
    console.log("copy from canvas context");
    console.log(context);
    //设置目标像素
	dest.width = size;
	dest.height = size;

	// console.log("copying from " + src.width + " to " + dest.width);
	context.clearRect(0, 0, dest.width, dest.height);
	// context.rotate(Math.PI);
	// context.translate(-dest.width, -dest.height);
	context.drawImage(src, 0, 0, dest.width, dest.height);
}


export function testCanvas(canvas: HTMLCanvasElement) {
	const ctx = canvas.getContext("2d");
	canvas.width = 300;
	canvas.height = 300;
	//draw a rectangle in canvas and rotate 90 degree
	ctx.fillStyle = "green";
	//旋转虚拟画布后再绘画
	// ctx.translate(-canvas.width, -canvas.height);
	// ctx.rotate(Math.PI/6);
	ctx.translate(canvas.width, 0);
	ctx.scale(-1, 1);
	ctx.fillRect(20, 20, 150, 100);

}

//异步加载图片并渲染fbo
export async function loadImage(node1) {
	const gl = node1.gl;
	const image = node1.image;
    //创建新的纹理并加入node
    var texIndex = node1.texIndex;
    node1.texIndex++;
	var tex = gl.createTexture();
    node1.textures.push(tex);
	const promise = new Promise((reslove) => {
		//加载图片 绘制到缓冲区 drawFbo
		node1.image.src = require("../../assets/leaves.jpg");
        //set node1.image.src to https://webglfundamentals.org/webgl/resources/leaves.jpg
        // node1.image.src = "https://webglfundamentals.org/webgl/resources/leaves.jpg";

        node1.image.onload = async function () {
			//将加载的图片放到texture中
            const programInfo=node1.programInfo;
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			gl.uniform1i(programInfo.uniformLocations.textureLocation, 0);
            console.log(programInfo.uniformLocations.textureLocation);
            // drawFbo(node1);
            node1.drawScene();
            //bind framebuffer to null
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			
			reslove(1);
		}

	})
	await promise;
	console.log('loading finshed');

}