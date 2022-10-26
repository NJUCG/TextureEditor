//将输入的图片颜色取反
export class TestNode {
    public id:string;
    public type:string;
    private vertexSource:string;
    private fragmentSource:String;
    private canvas:HTMLCanvasElement;
    private gl:WebGLRenderingContext;
    private buffers;
    //在节点内创建画布
    constructor(){
        this.canvas = <HTMLCanvasElement>document.createElement("canvas");
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
            gl_Position = vec4(aVertexPosition,1.0) ;

            v_texcoord = aTexCoord;
        }
        `;
        this.fragmentSource = `
        precision mediump float;
 
        // 从顶点着色器中传入的值
        varying vec2 v_texcoord;
         
        // 纹理
        uniform sampler2D u_texture;
         
        void main() {
           gl_FragColor = texture2D(u_texture, v_texcoord);
        
        }
        `;

        const shaderProgram = this.initShaderProgram(this.gl,this.vertexSource,this.fragmentSource);

        const programInfo = {
            program:shaderProgram,
            attribLocations: {
                vertexPosition: this.gl.getAttribLocation(shaderProgram, "aVertexPosition"),
                texCoordLocation:this.gl.getAttribLocation(shaderProgram,"aTexCoord"),
            },
            uniformLocations: {
            textureLocation: this.gl.getUniformLocation(
                shaderProgram,
                "u_texture"
            ),
            },
            
        }
        this.initBuffers(this.gl);
    
        //创建纹理
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 255, 255]));
        const image = new Image();
        image.addEventListener("load",loadImage);
        image.src = "./pic256.jpg";
        function loadImage(){
        // 现在图像加载完成，拷贝到纹理中
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        this.drawScene();
        }

        this.drawScene(this.gl,programInfo,this.buffers);
        
    }

    initBuffers(gl) {

        // Create a buffer for the square's positions.
      
        const positionBuffer = gl.createBuffer();
      
        // Select the positionBuffer as the one to apply buffer
        // operations to from here out.
      
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      
        // Now create an array of positions for the square.
      
        const positions = [
           1.0,  1.0,
          -1.0,  1.0,
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
            1.0,  1.0,
            -1.0,  1.0,
             1.0, -1.0,
            -1.0, -1.0,
        ];
        //纹理坐标缓冲区
        const texBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,texBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array(texpositions),
            gl.STATIC_DRAW);

        this.buffers =  {
          position: positionBuffer,
          texture:texBuffer,
        };
      }


    initShaderProgram(gl,vsSource,fsSource) {
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


    //
    // 创建指定类型的着色器，上传 source 源码并编译
    //
    loadShader(gl, type, source) {
        const shader = gl.createShader(type);
    
        // Send the source to the shader object
    
        gl.shaderSource(shader, source);
    
        // Compile the shader program
    
        gl.compileShader(shader);
    
        // See if it compiled successfully
    
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
        }
    
        return shader;
    }

    drawScene(gl, programInfo, buffers) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
        gl.clearDepth(1.0);                 // Clear everything
        gl.enable(gl.DEPTH_TEST);           // Enable depth testing
        gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
      
        // Clear the canvas before we start drawing on it.
      
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      
        // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute.
        {
          const numComponents = 3;  // pull out 3 values per iteration
          const type = gl.FLOAT;    // the data in the buffer is 32bit floats
          const normalize = false;  // don't normalize
          const stride = 0;         // how many bytes to get from one set of values to the next
                                    // 0 = use type and numComponents above
          const offset = 0;         // how many bytes inside the buffer to start from
          gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
          gl.vertexAttribPointer(
              programInfo.attribLocations.vertexPosition,
              numComponents,
              type,
              normalize,
              stride,
              offset);
          gl.enableVertexAttribArray(
              programInfo.attribLocations.vertexPosition);
        }
      
        // Tell WebGL to use our program when drawing
      
        gl.useProgram(programInfo.program);
      
        // Set the shader uniforms
            
        {
          const offset = 0;
          const vertexCount = 4;
          gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
        }
      }




}