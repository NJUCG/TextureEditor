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
        this.canvas.id = 'patternNode';

        const gl =this.gl;
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
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

            },

        }
        this.programInfo = programInfo;

        const image = new Image();
        this.image = image;

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
        canvas.id = 'colorNode';
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