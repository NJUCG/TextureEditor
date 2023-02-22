import { Node } from "./Node"
import { PatternNode} from "./generatorNode";
import { LibraryItemType } from "../library";
export  class InvertNode extends Node{
    private InputNode:any;

    constructor(){
        super();
        const canvas = this.canvas;
        const gl = canvas.getContext("webgl");
        // this.setCanvas(512,512);
        this.type = LibraryItemType.Filters;
        this.addInput("Tex1");
        this.fragmentSource = `
        precision mediump float;
        `+
        this.createCodeForProps()+
        this.createCodeForInputs()+
        `
        // uniform sampler2D u_texture;

        varying vec2 vTexCoord;
      
        void main(){
            vec4 col = 1.0 -  texture2D(inputTex1,vTexCoord);
            col.a = 1.0;
            gl_FragColor= col;
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
            },

        }
        this.programInfo = programInfo;


    }

    //将输入节点的结果绑定到当前节点的texture
    // public setInputNode(node1: PatternNode): void {
    //     const data = node1.getPixelData();
    //     const gl = gl;
    //     const texture = this.texture;

    //     // gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    //     gl.bindTexture(gl.TEXTURE_2D,texture);
    //     //绑定输入节点的结果到texture
    //     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
    //          512 , 512, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    //         data);
    // }




}


export class BlendNode extends Node{
    constructor(){
        super();
        const canvas = this.canvas;
        const gl = this.canvas.getContext("webgl");
        // this.setCanvas(512,512);
        this.type = LibraryItemType.Filters;
        this.canvas = canvas;
        this.id='blendNode';
        this.addInput("Foreground");
        this.addInput("Background");
        // this.addInput("Opacity");
        this.addFloatProperty("Opacity","Opacity",0.7, 0.0, 1.0, 0.01);
		this.addEnumProperty("Type", "Type", [
			"Multiply",
			"Add",
			"Subtract",
			"Divide",
			//   "Add Sub",
			"Max",
			"Min",
			"Switch",
			"Overlay",
			"Screen"
		]);
        this.fragmentSource = `precision mediump float;\n`+
        this.createCodeForProps()+
        this.createCodeForInputs()+
        `
        varying vec2 vTexCoord;

        float screen(float fg, float bg) {
            float res = (1.0 - fg) * (1.0 - bg);
            return 1.0 - res;
        }
        
        void main(){
            vec4 foreground = texture2D(inputForeground,vTexCoord);
            vec4 background = texture2D(inputBackground,vTexCoord);
            // vec4 result = mix(background,foreground,propOpacity);
            vec4 colA = foreground;
            vec4 colB = background;
            vec4 col = vec4(1.0);

            if (propType==0){ // multiply
                col.rgb = colA.rgb * colB.rgb;
            }
            if (propType==1) // add
                col.rgb = colA.rgb + colB.rgb;
            if (propType==2) // subtract
                col.rgb = colB.rgb - colA.rgb;
            if (propType==3) // divide
                col.rgb = colB.rgb / colA.rgb;
            if (propType==4) { // max
                col.rgb = max(colA.rgb, colB.rgb);
            }
            if (propType==5) { // min
                col.rgb = min(colA.rgb, colB.rgb);
            }
            if (propType==6) { // switch
                col.rgb = colA.rgb;
            }
            if (propType==7) { // overlay
                if (colB.r < 0.5) col.r = colB.r * colA.r; else col.r = screen(colB.r, colA.r);
                if (colB.g < 0.5) col.g = colB.g * colA.g; else col.g = screen(colB.g, colA.g);
                if (colB.b < 0.5) col.b = colB.b * colA.b; else col.b = screen(colB.b, colA.b);
            }
            if (propType==8) { // screen
                col.r = screen(colA.r, colB.r);
                col.g = screen(colA.g, colB.g);
                col.b = screen(colA.b, colB.b);
            }

            // apply opacity 
            //后期继续加上Opacity的输入纹理 比如噪声图
            col.rgb = mix(colB.rgb, col.rgb, vec3(propOpacity));

            gl_FragColor =col;
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

        this.setInputsLocation();
        this.setPropsLocation();

    }
}