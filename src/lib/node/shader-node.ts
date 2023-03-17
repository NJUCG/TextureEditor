import { BaseNode } from "./base-node";
import { createShaderProgram } from "../webgl-utils";
import { Designer, NodeRenderingContext, NodeInputInfo } from "../designer";
import { Port } from "./port";
import {
    Property,
    FloatProperty,
    IntProperty,
    BoolProperty,
    EnumProperty,
    StringProperty,
    ColorProperty,
    PropertyType,
    PropertyGroup
} from "./node-property";

class ShaderProgramInfo {
    program: WebGLProgram;
    attribLocations: { [key:string]: number; };
    uniformLocations: { [key:string]: WebGLUniformLocation; };

    constructor(program: WebGLProgram = null, attribLoc: { [key:string]: number; } = {}, uniformLoc: { [key:string]: WebGLUniformLocation; } = {}) {
        this.program = program;
        this.attribLocations = attribLoc;
        this.uniformLocations = uniformLoc;
    }
}

/**
 * ShaderNode类, 使用GLSL渲染结果
 * ShaderNode没有自己的Canvas, 所有的结果利用FBO渲染到Texture, 在NodeViewItem中使用Canvas绘制
 * ShaderNode没有自己的Buffers, 整个渲染使用Designer提供的Buffers, 一组Buffers用于全部节点的绘制
 * ShaderNode的输入节点信息通过Designer提供
 */
export class ShaderNode extends BaseNode {
    // shader 上下文属性
    protected vertexSource: string;
    protected fragmentSource: string;
    protected shaderProgram: WebGLProgram;
    protected programInfo: ShaderProgramInfo

    // Constructor并不初始化, 初始化在init函数中进行
    constructor() {
        super();
        this.vertexSource = null;
        this.fragmentSource = null;
        this.shaderProgram = null;
        this.programInfo = null;
    }

    public initNode() {}

    // 初始化渲染上下文
    public initRenderingCtx(designer: Designer) {
        this.designer = designer;
        this.gl = designer.gl;
        this.texSize = designer.texSize;
        this.createTexture();
        this.vertexSource = `#version 300 es
        precision highp float;

        in vec3 aVertPosition;
        in vec2 aTexCoord;
            
        // the texCoords passed in from the vertex shader.
        out vec2 vTexCoord;
            
        void main() {
            gl_Position = vec4(aVertPosition, 1.0);
            vTexCoord = aTexCoord;
        }
        `;
        this.fragmentSource = `#version 300 es
        precision highp float;

        in vec2 vTexCoord;
        out vec4 fragColor;

        vec4 process(vec2 uv);

        void main() {
			vec4 result = process(vTexCoord);
			fragColor = clamp(result, 0.0, 1.0);
        }
        `;
        this.programInfo = new ShaderProgramInfo();
    }
    
    // 利用fbo离屏渲染到targetTex
    public renderingToTexture(context: NodeRenderingContext) {
        const inputs = context.inputs;
        const gl = context.gl;

        gl.useProgram(this.programInfo["program"]);
        // 绑定纹理和framebuffer
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.targetTex);
        gl.bindFramebuffer(gl.FRAMEBUFFER, context.fbo);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            this.targetTex,
            0
        );
        gl.bindTexture(gl.TEXTURE_2D, null);
        // console.log("完成绑定纹理和framebuffer");

        // 设定glsl的输入纹理
        this.setInputsValue(inputs);
        // console.log("完成设定glsl的输入纹理");
        
        this.setUniformsValue();
        // console.log("完成传递随机种子");
        // console.log("完成设定tex大小");
        
        // 传递属性参数
        this.setPropsValue();
        // console.log("完成传递属性参数");

        // 绑定位置坐标, 纹理坐标
        const posLoc = this.programInfo.attribLocations["aVertPosition"];
        const texCoordLoc = this.programInfo.attribLocations["aTexCoord"];
        // create a vertex array object
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        // vertex position
        gl.bindBuffer(gl.ARRAY_BUFFER, this.designer.posBuffer);
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
        // texCoord
        gl.bindBuffer(gl.ARRAY_BUFFER, this.designer.texCoordBuffer);
        gl.enableVertexAttribArray(texCoordLoc);
        gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
        // console.log("完成绑定位置坐标, 纹理坐标");

        // 设定渲染窗口为纹理大小
        gl.viewport(0, 0, context.textureWidth, context.textureHeight);
        gl.clearColor(1, 1, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.bindVertexArray(vao);
        // console.log("完成设定渲染窗口为纹理大小");

        // 绘制顶点, 组成矩形 https://juejin.cn/post/6992934014411620365
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        // console.log("完成绘制顶点, 组成矩形");

        // 清空webgl状态
        gl.disableVertexAttribArray(posLoc);
        gl.disableVertexAttribArray(texCoordLoc);
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    // 根据每个节点个性化的fragSource构建着色程序
    protected buildShader(processShaderSource: string) {
        const gl = this.gl;

        const fragSource = 
            this.fragmentSource + 
            this.createCodeForUniforms() +
            this.createCodeForInputs() + 
            this.createCodeForProps() + 
            "#line 0\n" + processShaderSource;

        this.shaderProgram = createShaderProgram(gl, this.vertexSource, fragSource);
        this.programInfo["program"] = this.shaderProgram;
        this.programInfo.attribLocations["aVertPosition"] = gl.getAttribLocation(this.shaderProgram, "aVertPosition");
        this.programInfo.attribLocations["aTexCoord"] = gl.getAttribLocation(this.shaderProgram, "aTexCoord");
        this.setUniformsLocation();
        this.setInputsLocation();
        this.setPropsLocation();
    }

    // 该节点的Uniform变量声明
    private createCodeForUniforms() {
        let code = "";
        
        code += "uniform float _seed;\n";
        code += "uniform vec2 uTexSize;\n";

        code += "\n";
        return code;
    }

    // 输入节点的GLSL声明   
    private createCodeForInputs() {
        let code = "";

        for (const port of this.inputs) {
            code += "uniform sampler2D input" + port.name + ";\n";
            code += "uniform bool input" + port.name + "Connected;\n";
        }

        code += "\n";

        return code;
    }

    // 属性构建GLSL声明
	private createCodeForProps() {
		let code = "";

		for (const prop of this.properties) {
			switch (true) {
                case prop instanceof FloatProperty:
                    code += "uniform float prop" + prop.name + ";\n";
                    break;
                case prop instanceof IntProperty:
                    code += "uniform int prop" + prop.name + ";\n";
                    break;
                case prop instanceof BoolProperty:
                    code += "uniform bool prop" + prop.name + ";\n";
                    break;
                case prop instanceof EnumProperty:
                    code += "uniform int prop" + prop.name + ";\n";
                    break;
                case prop instanceof ColorProperty:
                    code += "uniform vec4 prop" + prop.name + ";\n";
                    break;
                default:
                    console.log("ShaderNode: Unexpected property type!");
            }
		}

        code += "\n";

        return code;
    }

    private setUniformsLocation() {
        this.programInfo.uniformLocations["_seed"] = this.gl.getUniformLocation(this.shaderProgram, "_seed");
        this.programInfo.uniformLocations["uTexSize"] = this.gl.getUniformLocation(this.shaderProgram, "uTexSize");
    }

    private setInputsLocation() {
        for (const port of this.inputs) {
            this.programInfo.uniformLocations["input" + port.name] = this.gl.getUniformLocation(this.shaderProgram, "input" + port.name);
            this.programInfo.uniformLocations["input" + port.name + "Connected"] = this.gl.getUniformLocation(this.shaderProgram, "input" + port.name + "Connected");
        }
    }

    private setPropsLocation() {
        for (const prop of this.properties)
            this.programInfo.uniformLocations["prop" + prop.name] = this.gl.getUniformLocation(this.shaderProgram, "prop" + prop.name);
    }

    // 赋值unifom
    private setUniformsValue() {
        const gl = this.gl;
        const locations = this.programInfo.uniformLocations;
        gl.uniform1f(locations["_seed"], this.randomSeed);
        gl.uniform2f(locations["uTexSize"], this.texSize, this.texSize);
    }

    // 赋值prop
    private setPropsValue(){
        const gl = this.gl;
        const locations = this.programInfo.uniformLocations;
        for (const prop of this.properties) {
            const loc = locations["prop" + prop.name];
			switch (true) {
                // https://stackoverflow.com/questions/36332665/how-to-use-instanceof-in-a-switch-statement
                case prop instanceof FloatProperty:
                    gl.uniform1f(loc, (prop as FloatProperty).value);
                    break;
                case prop instanceof IntProperty:
                    gl.uniform1i(loc, (prop as IntProperty).value);
                    break;
                case prop instanceof BoolProperty:
                    gl.uniform1i(loc, (prop as BoolProperty).value == false ? 0 : 1);
                    break;
                case prop instanceof EnumProperty:
                    gl.uniform1i(loc, (prop as EnumProperty).index);
                    break;
                case prop instanceof ColorProperty:
                    const color = (prop as ColorProperty).value;
                    gl.uniform4f(loc, color.r, color.g, color.b, color.a);
                    break;
                default:
                    console.log("ShaderNode: Unexpected property type!");
            }
		}
    }
    
    // 将输入节点的纹理赋值给GLSL
    private setInputsValue(inputs: NodeInputInfo[]) {
        const gl = this.gl;
        const locations = this.programInfo.uniformLocations;
        let texIndex = 0;
        for (const input of inputs) {
            gl.activeTexture(gl.TEXTURE0 + texIndex);
            gl.bindTexture(gl.TEXTURE_2D, input.node.targetTex);
            gl.uniform1i(locations["input" + input.name], texIndex);
            gl.uniform1i(locations["input" + input.name + "Connected"], 1);
            ++texIndex;
		}
    }
}

// //copy canvas result from webgl canvas to 2d canvas
// export function drawToTextureCanvas(src: HTMLCanvasElement, dest: HTMLCanvasElement,size:GLuint) {
// 	const context = dest.getContext("2d");
//     console.log(dest);
//     console.log("copy from canvas context");
//     console.log(context);
//     //设置目标像素
// 	dest.width = size;
// 	dest.height = size;

// 	// console.log("copying from " + src.width + " to " + dest.width);
// 	context.clearRect(0, 0, dest.width, dest.height);
// 	// context.rotate(Math.PI);
// 	// context.translate(-dest.width, -dest.height);
// 	context.drawImage(src, 0, 0, dest.width, dest.height);
// }

// //异步加载图片并渲染fbo
// export async function loadImage(node1) {
// 	const gl = node1.gl;
// 	const image = node1.image;
//     //创建新的纹理并加入node
//     var texIndex = node1.texIndex;
//     node1.texIndex++;
// 	var tex = gl.createTexture();
//     node1.textures.push(tex);
// 	const promise = new Promise((reslove) => {
// 		//加载图片 绘制到缓冲区 drawFbo
// 		node1.image.src = require("../../assets/leaves.jpg");
//         //set node1.image.src to https://webglfundamentals.org/webgl/resources/leaves.jpg
//         // node1.image.src = "https://webglfundamentals.org/webgl/resources/leaves.jpg";

//         node1.image.onload = async function () {
// 			//将加载的图片放到texture中
//             const programInfo=node1.programInfo;
//             gl.activeTexture(gl.TEXTURE0);
//             gl.bindTexture(gl.TEXTURE_2D, tex);
//             gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
//             gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
//             gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
//             gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
// 			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
// 			gl.uniform1i(programInfo.uniformLocations.textureLocation, 0);
//             console.log(programInfo.uniformLocations.textureLocation);
//             // drawFbo(node1);
//             node1.drawScene();
//             //bind framebuffer to null
//             gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			
// 			reslove(1);
// 		}

// 	})
// 	await promise;
// 	console.log('loading finshed');

// }