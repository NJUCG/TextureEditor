import { Node } from "./Node"
import { LibraryItemType } from "../library";
import {Color} from "@/lib/designer/color";
//Pattern节点
export class PatternNode extends Node{
    public image:HTMLImageElement;
    public texture:WebGLTexture;
    constructor() {

        super();
        const canvas = this.canvas;
        
        this.type = LibraryItemType.Generators;        

        this.id = 'patternNode';

        const gl = this.canvas.getContext("webgl");
        

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

        const shaderProgram = this.initShaderProgram(gl, this.vertexSource, this.fragmentSource);

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
        this.id = 'colorNode';

        this.type = LibraryItemType.Generators;
        const gl = this.canvas.getContext("webgl");

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
        varying vec2 vTexCoord;

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
                texCoordLocation: gl.getAttribLocation(shaderProgram, "aTexCoord"),
            },
            uniformLocations: {

            },
        }
        this.programInfo = programInfo;
        this.setPropsLocation();
  
    }


}


export class SimplexNoiseNode extends Node{
    constructor(){
        super();
        //添加节点属性
        this.addFloatProperty('Scale','Scale',100, 1, 1000, 0.01);
        this.id="simplexNoiseNode";

        this.type = LibraryItemType.Generators;
        const gl = this.canvas.getContext("webgl");

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
        varying vec2 vTexCoord;
        
        //函数式声明
        vec4 process(vec2 uv);

        void main(){
            gl_FragColor = process(vTexCoord);
        }

        //具体噪声函数

        float random (in vec2 st) {
            return fract(sin(dot(st.xy,
                                 vec2(12.9898,78.233)))
                         * 43758.5453123);
        }
        
        float noise (in vec2 st) {
            vec2 i = floor(st);
            vec2 f = fract(st);
        
            // Four corners in 2D of a tile
            float a = random(i);
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));
        
            // Smooth Interpolation
        
            // Cubic Hermine Curve.  Same as SmoothStep()
            vec2 u = f*f*(3.0-2.0*f);
            // u = smoothstep(0.,1.,f);
        
            // Mix 4 coorners porcentages
            return mix(a, b, u.x) +
                    (c - a)* u.y * (1.0 - u.x) +
                    (d - b) * u.x * u.y;
        }
        
        vec2 skew (vec2 st) {
            vec2 r = vec2(0.0);
            r.x = 1.1547*st.x;
            r.y = st.y+0.5*r.x;
            return r;
        }
        
        vec3 simplexGrid (vec2 st) {
            vec3 xyz = vec3(0.0);
        
            vec2 p = fract(skew(st));
            if (p.x > p.y) {
                xyz.xy = 1.0-vec2(p.x,p.y-p.x);
                xyz.z = p.y;
            } else {
                xyz.yz = 1.0-vec2(p.x-p.y,p.y);
                xyz.x = p.x;
            }
        
            return fract(xyz);
        }
        
        vec4 process(vec2 uv)
        {
            vec3 color = vec3(noise(uv * propScale));
        
            return vec4(color,1.0);
        }
        
        `       
        ;



        const shaderProgram = this.initShaderProgram(gl, this.vertexSource, this.fragmentSource);

        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
                texCoordLocation: gl.getAttribLocation(shaderProgram, "aTexCoord"),
            },
            uniformLocations: {

            },
        }
        this.programInfo = programInfo;
        this.setPropsLocation();
  
    }

}
