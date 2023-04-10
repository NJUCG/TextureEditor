import { NodeType } from "@/lib/node/base-node";
import { ShaderNode } from "@/lib/node/shader-node";
import { Port, PortType } from "@/lib/node/port";

export  class Transform2DNode extends ShaderNode {
    public initNode() {
        this.name = "Transform2D";
        this.type = NodeType.Filter;

        const inPort = new Port(this.uuid, PortType.In, 0, "Image");
        this.addInput(inPort);
        const outPort = new Port(this.uuid, PortType.Out, 0, "Output");
        this.addOutput(outPort);
        
		this.addFloatProperty("TranslateX", "Translate X", 0, -1.0, 1.0, 0.01);
		this.addFloatProperty("TranslateY", "Translate Y", 0, -1.0, 1.0, 0.01);

		this.addFloatProperty("Scale", "Scale", 1, 0.0, 2.0, 0.01);
		this.addFloatProperty("ScaleX", "Scale X", 1, -2.0, 2.0, 0.01);
		this.addFloatProperty("ScaleY", "Scale Y", 1, -2.0, 2.0, 0.01);

		this.addFloatProperty("Rot", "Rotation", 0, 0.0, 360.0, 0.01);

		this.addBoolProperty("Clamp", "Clamp", true);

        const processShaderSource = `
        mat2 buildScale(float sx, float sy)
        {
            return mat2(sx, 0.0, 0.0, sy);
        }

        // rot is in degrees
        mat2 buildRot(float rot)
        {
            float r = radians(rot);
            return mat2(cos(r), -sin(r), sin(r), cos(r));
        }
        
        mat3 transMat(vec2 t)
        {
            return mat3(vec3(1.0,0.0,0.0), vec3(0.0,1.0,0.0), vec3(t, 1.0));
        }

        mat3 scaleMat(vec2 s)
        {
            return mat3(vec3(s.x,0.0,0.0), vec3(0.0,s.y,0.0), vec3(0.0, 0.0, 1.0));
        }

        mat3 rotMat(float rot)
        {
            float r = radians(rot);
            return mat3(vec3(cos(r), -sin(r),0.0), vec3(sin(r), cos(r),0.0), vec3(0.0, 0.0, 1.0));
        }

        vec4 process(vec2 uv)
        {
            // transform by (-0.5, -0.5)
            // scale
            // rotate
            // transform
            // transform by (0.5, 0.5)  

            mat3 trans = transMat(vec2(0.5, 0.5)) *
                transMat(vec2(propTranslateX, propTranslateY)) *
                rotMat(propRot) *
                scaleMat(vec2(propScaleX, propScaleY) * propScale) *
                transMat(vec2(-0.5, -0.5));

            vec3 res = inverse(trans) * vec3(uv, 1.0);
            uv = res.xy;


            if (propClamp)
                return texture(inputImage, clamp(uv,vec2(0.0), vec2(1.0)));
            return texture(inputImage, uv);
        }
        `;

        this.buildShader(processShaderSource);
    }
}



export  class InvertNode extends ShaderNode {
    public initNode(name: string) {
        this.name = name;
        this.title = "Invert";
        this.type = NodeType.Filter;

        const inPort = new Port(this.uuid, PortType.In, 0, "Color");
        this.addInput(inPort);
        const outPort = new Port(this.uuid, PortType.Out, 0, "Output");
        this.addOutput(outPort);
        
        const processShaderSource = `
        vec4 process(vec2 uv) {
            vec4 col = vec4(1.0) - texture(inputColor, uv);
            col.a = 1.0;
            return col;
        }
        `;

        this.buildShader(processShaderSource);
    }
}

export class BlendNode extends ShaderNode {
    public initNode(name: string) {
        this.name = name;
        this.title = "Blend";
        this.type = NodeType.Filter;

        // inputs and outputs
        const portNames = ["Foreground", "Background"];
        for (let i = 0; i < portNames.length; ++i) {
            const inPort = new Port(this.uuid, PortType.In, i, portNames[i]);
            this.addInput(inPort);
        }
        const outPort = new Port(this.uuid, PortType.Out, 0, "Output");
        this.addOutput(outPort);

        // properties
        this.addFloatProperty("Opacity", "Opacity", 0.7, 0.0, 1.0, 0.01);
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

        // set process function
        const processShaderSource = `
        float screen(float fg, float bg) {
            float res = (1.0 - fg) * (1.0 - bg);
            return 1.0 - res;
        }

        vec4 process(vec2 uv) {
            vec4 foreColor = texture(inputForeground, uv);
            vec4 backColor = texture(inputBackground, uv);
        
            vec4 color = vec4(1.0);
        
            if (propType == 0)    // multiply
                color.rgb = foreColor.rgb * backColor.rgb;
            if (propType == 1)    // add
                color.rgb = foreColor.rgb + backColor.rgb;
            if (propType == 2)    // subtract
                color.rgb = backColor.rgb - foreColor.rgb;
            if (propType == 3)    // divide
                color.rgb = backColor.rgb / foreColor.rgb;
            if (propType == 4)    // max
                color.rgb = max(foreColor.rgb, backColor.rgb);
            if (propType == 5)    // min
                color.rgb = min(foreColor.rgb, backColor.rgb);
            if (propType == 6)    // switch
                color.rgb = foreColor.rgb;
            if (propType == 7) {  // overlay
                if (backColor.r < 0.5) color.r = backColor.r * foreColor.r; else color.r = screen(backColor.r, foreColor.r);
                if (backColor.g < 0.5) color.g = backColor.g * foreColor.g; else color.g = screen(backColor.g, foreColor.g);
                if (backColor.b < 0.5) color.b = backColor.b * foreColor.b; else color.b = screen(backColor.b, foreColor.b);
            }
            if (propType == 8) {  // screen
                color.r = screen(foreColor.r, backColor.r);
                color.g = screen(foreColor.g, backColor.g);
                color.b = screen(foreColor.b, backColor.b);
            }
        
            // apply opacity 
            // 后期继续加上Opacity的输入纹理 比如噪声图
            color.rgb = mix(backColor.rgb, color.rgb, vec3(propOpacity));
        
            return color;
        }
        `;

        this.buildShader(processShaderSource);
    }
}

export  class BlurNode extends ShaderNode {
    public initNode(name: string) {
        this.name = name;
        this.title = "Blur";
        this.type = NodeType.Filter;

        // inputs and outputs
        const inPort = new Port(this.uuid, PortType.In, 0, "Color");
        this.addInput(inPort);
        const outPort = new Port(this.uuid, PortType.Out, 0, "Output");
        this.addOutput(outPort);

        // properties
        this.addFloatProperty("Intensity", "Intensity", 1, 0, 10, 0.1);
        this.addIntProperty("Samples", "Samples", 50, 0, 100, 1);

        // set process function
        const processShaderSource = `
        #define pow2(x) (x * x)

        const float pi = atan(1.0) * 4.0;

        float gaussian(vec2 i, float sigma) {
            return 1.0 / (2.0 * pi * pow2(sigma)) * exp(-((pow2(i.x) + pow2(i.y)) / (2.0 * pow2(sigma))));
        }

        vec3 blur(sampler2D sp, vec2 uv, vec2 scale) {
            vec3 col = vec3(0.0);
            float accum = 0.0;
            float weight;
            vec2 offset;

            float sigma = float(propSamples) * 0.25;
            
            for (int x=0; x < 100 / 2; ++x) {
                for (int y =0; y < 100 / 2; ++y) {
                    offset = vec2(x, y);
                    weight = gaussian(offset, sigma);
                    col += texture(sp, uv + scale * offset).rgb * weight;
                    accum += weight;
                }
            }
            
            return col / accum;
        }

        vec4 process(vec2 uv) {
            vec4 color = vec4(0.0);
            vec2 ps = vec2(1.0, 1.0) / uTexSize;
            color.rgb = blur(inputColor, uv, ps * propIntensity);
            color.a = 1.0;

            return color;
        }
        `;

        this.buildShader(processShaderSource);
    }
}

//create warp node
export class WarpNode extends ShaderNode {
    //create init function
    public initNode(name: string) {
        this.name = name;
        this.title = "Warp";
        this.type = NodeType.Filter;

        // inputs and outputs
        const inPort1 = new Port(this.uuid, PortType.In, 0, "Color");
        const inPort2 = new Port(this.uuid, PortType.In, 1, "Height");
        this.addInput(inPort1);
        this.addInput(inPort2);
        const outPort = new Port(this.uuid, PortType.Out, 0, "Output");
        this.addOutput(outPort);

        // properties
        // this.addFloatProperty("Intensity", "Intensity", 0.5, 0, 1, 0.01);
        this.addFloatProperty("Intensity", "Intensity", 0.1, -1.0, 1.0, 0.01);

        // set process function
        const processShaderSource = `
        vec4 process(vec2 uv) {
            // vec4 color = vec4(0.0);
            // vec2 ps = vec2(1.0, 1.0) / uTexSize;
            // vec2 offset = vec2(0.0, 0.0);
            // offset.x = sin(uv.y * 10.0) * propIntensity;
            // offset.y = sin(uv.x * 10.0) * propIntensity;
            // color = texture(inputColor, uv + offset * ps);
            // return color;

            vec2 step = vec2(1.0,1.0)/uTexSize;
            vec4 warpCol = texture(inputHeight, uv);
            float warp = (warpCol.r + warpCol.g + warpCol.b) / 3.0;

            vec4 color = texture(inputColor, uv + (vec2(warp) - 0.5) * vec2(1.0, -1.0) * propIntensity);

            return color;
        }
        `;

        this.buildShader(processShaderSource);
    }

}