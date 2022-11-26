import { Node } from "./Node"
import { LibraryItemType } from "../library";
//Pattern节点
export class PatternNode extends Node{
    public image:HTMLImageElement;

    constructor() {

        super();
        const canvas = this.canvas;
        
        this.type = LibraryItemType.Generators;        
        this.setCanvas(256,256);
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

        varying vec2 vTexCoord;
        
        void main(){
            gl_Position=aVertexPosition;
            vTexCoord = aTexCoord;
        }
        `;
        this.fragmentSource = `
        precision mediump float;

        uniform sampler2D uTexture;

        varying vec2 vTexCoord;
        
        void main(){
            gl_FragColor= texture2D(uTexture,vTexCoord);
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
                    "uTexture"
                ),
            },

        }
        this.programInfo = programInfo;

        const image = new Image();
        this.image = image;

    }



}

export class colorNode extends Node{
    private color: number[] = [Math.random(),Math.random(),Math.random(), 1];
    
    constructor(){
        super();
        const canvas = this.canvas;
        
        canvas.id = 'colorNode';
        this.id = 'colorNode';

        this.type = LibraryItemType.Generators;
        this.gl = this.canvas.getContext('webgl');
        const gl = this.gl;
        if (!gl) {
            console.log('fail to get context');
        }
        this.vertexSource = `
        attribute vec4 aVertexPosition;
        attribute vec2 aTexCoord;
        
        void main(){
            gl_Position=aVertexPosition;

        }
        `;
        this.fragmentSource = `
        precision mediump float;

        uniform vec4 uColor;
        
        void main(){
            // gl_FragColor= vec4(1.0,0.0,0.0,1.0);
            gl_FragColor = vec4(uColor);
        }
        `;

        const shaderProgram = this.initShaderProgram(gl, this.vertexSource, this.fragmentSource);

        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
            },
            uniformLocations: {
                colorLocation: gl.getUniformLocation(
                    shaderProgram,
                    "uColor"
                ),
            },

        }
        this.programInfo = programInfo;
        // this.addColorProperty('color', 'Color', this.color);
        this.drawCanvas();
    }

    public drawCanvas() {
        const gl = this.gl;
        const tex = this.getTexture();
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        this.drawScene();
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    public drawScene(): void {
        
        const gl = this.gl;
        const programInfo = this.programInfo;
        const buffers = this.buffers;
        gl.viewport(0,0,this.size,this.size);
        gl.clearColor(0.0, 1.0, 0.0, 1.0);  // Clear to black, fully opaque
        // Clear the canvas before we start drawing on it.

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Tell WebGL to use our program when drawing
        gl.useProgram(programInfo.program);
        //设置从位置缓冲区取数据到vertexPosition属性
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

        gl.uniform4fv(programInfo.uniformLocations.colorLocation,this.color);

        const offset = 0;
        const vertexCount = 4;
        gl.drawArrays(gl.TRIANGLE_STRIP,offset,vertexCount);
    
		gl.disableVertexAttribArray(programInfo.attribLocations.vertexPosition);
		gl.disableVertexAttribArray(programInfo.attribLocations.texCoordLocation);

    }

    public passToStore(){
        this.store.displayNodeOnComponents(this.getPixelData(),this);
    }
    //set color
    public setColor(color: number[]): void {
        this.color = color;
    }

    //return color
    public getColor(): number[] {
        return this.color;
    }

    //set alpha
    public setAlpha(alpha: number): void {
        this.color[3] = alpha;
    }

    //set red
    public setRed(red: number): void {
        this.color[0] = red;
    }

    //set green
    public setGreen(green: number): void {
        this.color[1] = green;
    }

    //set blue
    public setBlue(blue: number): void {
        this.color[2] = blue;
    }


}