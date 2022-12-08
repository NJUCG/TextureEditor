import { Node } from "./Node"
import { LibraryItemType } from "../library";
import {Color} from "@/lib/designer/color";
//Pattern节点
export class PatternNode extends Node{
    public image:HTMLImageElement;

    constructor() {

        super();
        const canvas = this.canvas;
        
        this.type = LibraryItemType.Generators;        

        this.canvas = canvas;
        this.id = 'patternNode';

        if (!this.gl) {
            console.log('fail to get context');
        }
        

        // this.vertexSource = `
        // attribute vec4 aVertexPosition;
        // attribute vec2 aTexCoord;

        // varying vec2 vTexCoord;
        
        // void main(){
        //     gl_Position=aVertexPosition;
        //     vTexCoord = aTexCoord;
        // }
        // `;
        this.fragmentSource = 
        `
        precision mediump float;
        `
        +
        this.createCodeForProps()+
        this.createCodeForInputs()+
        `
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
                textureLocation:this.gl.getUniformLocation(shaderProgram, "uTexture"),
            },  

        }
        this.programInfo = programInfo;

        const image = new Image();
        this.image = image;

    }

    public drawScene(): void {
        const gl = this.gl;
        const programInfo = this.programInfo;
        const buffers = this.buffers;
        
        gl.viewport(0, 0, this.size, this.size);
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
        
        gl.uniform1i(programInfo.uniformLocations.textureLocation, 0);
        {
            gl.enableVertexAttribArray(
                programInfo.attribLocations.texCoordLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
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
        
        {
            const offset = 0;
            const vertexCount = 4;
            gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
        }
        //清除
        gl.disableVertexAttribArray(programInfo.attribLocations.vertexPosition);
        gl.disableVertexAttribArray(programInfo.attribLocations.texCoordLocation);

    }

}


export class ColorNode extends Node{
   
    constructor(){
        super();
        
        //添加节点属性
        const color = new Color(Math.random(),Math.random(),Math.random(), 1);
        this.addColorProperty('001','color',color);
        console.log(color);
        const canvas = this.canvas;
        this.id = 'colorNode';

        this.type = LibraryItemType.Generators;
        const gl = this.gl;

        // this.vertexSource = `
        // attribute vec4 aVertexPosition;
        // attribute vec2 aTexCoord;
        
        // void main(){
        //     gl_Position=aVertexPosition;

        // }
        // `;

        this.fragmentSource =

        `
        precision mediump float;
        `+
        this.createCodeForProps()+
        `
        void main(){
            gl_FragColor = vec4(prop001);
        }
        `       
        ;

        const shaderProgram = this.initShaderProgram(gl, this.vertexSource, this.fragmentSource);

        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
            },
            uniformLocations: {

            },
        }
        this.programInfo = programInfo;
        this.setPropsLocation();
  
    }



}