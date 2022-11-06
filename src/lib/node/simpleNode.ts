import { Node } from "./Node"

//Pattern节点
export class PatternNode extends Node{
    public flag:boolean = false;
    public image:HTMLImageElement;
    public texture:WebGLTexture;
    // public targetTexture:WebGLTexture;
    // public frameBuffer:WebGLFramebuffer;

    //在节点内创建画布
    constructor(canvas: HTMLCanvasElement) {
        //对可视化canvas的处理
        super(canvas);
        this.type = "generators";
        
        this.setCanvas(512,512);
        // this.canvas=<HTMLCanvasElement>document.getElementById('mycanvas');
        // if(this.canvas == null){
        //     this.canvas = <HTMLCanvasElement>document.createElement("canvas");
        //     this.canvas.id='patternNode';
        // }
        this.canvas = canvas;
        // this.canvas.id = 'patternNode';

        this.gl = this.canvas.getContext("webgl");
        const gl = this.gl;

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
        const buffers = this.initBuffers(this.gl);
        this.buffers = buffers;
        //创建纹理
        const texture = gl.createTexture();
        this.texture = texture;

        //绑定framebuffer到上下文
        // this.frameBuffer = this.initFrameBufferObject(gl,texture);
        const image = new Image();
        this.image = image;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        // image.src = "../../assets/1.jpg";
        const targetTexture = gl.createTexture();
        this.targetTexture = targetTexture;
        const data = null;
        gl.bindTexture(gl.TEXTURE_2D,targetTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
            512, 512, 0,
            gl.RGBA, gl.UNSIGNED_BYTE, data);
        // set the filtering so we don't need mips
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        //创建fb
        const frameBuffer = gl.createFramebuffer();
        this.frameBuffer = frameBuffer;
        gl.bindFramebuffer(gl.FRAMEBUFFER,frameBuffer);
        //将targettexture作为fb的第一个颜色绑定
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, 0);


    }

    
    public getFinshedLoading():boolean{
        console.log("get Finshed Loading");
        console.log(this.flag);
        return this.flag;
    }


    public drawScene(): void {
        const gl = this.gl;
        const programInfo = this.programInfo;
        const buffers = this.buffers;

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
        gl.uniform1i(programInfo.texture,0);
        {
          const offset = 0;
          const vertexCount = 4;
          gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
        }
		//清除
		gl.disableVertexAttribArray(programInfo.attribLocations.vertexPosition);
		gl.disableVertexAttribArray(programInfo.attribLocations.texCoordLocation);
        console.log("finshed draw");
    }
    
}

// 现在图像加载完成，拷贝到纹理中
// export function loadImage(gl, texture, image) {
//     //反转y轴
//     gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
//     gl.bindTexture(gl.TEXTURE_2D, texture);
//     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
//     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
//     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
//     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);

// }

