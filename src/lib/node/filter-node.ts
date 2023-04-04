import { NodeType } from "@/lib/node/base-node";
import { ShaderNode } from "@/lib/node/shader-node";
import { Port, PortType } from "@/lib/node/port";

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
