import { NodeType } from "@/lib/node/base-node";
import { ShaderNode } from "@/lib/node/shader-node";
import { Port, PortType } from "@/lib/node/port";
import { Color } from "@/lib/utils/color";

export class OutputNode extends ShaderNode { 
    public initNode(name: string) {
        this.name = name;
        this.title = "Output";
        this.type = NodeType.Atomic;

        const inPort = new Port(this.uuid, PortType.In, 0, "Input");
        this.addInput(inPort);

        this.addStringProperty("Name", "Output Name");
        this.addEnumProperty("Components", "Components", [
            "RGBA",
            "RGB",
            "R",
            "G",
            "B",
            "A"
        ]);
        this.addEnumProperty("Precision", "Precision", [
            "8 Bits Per Component",
            "16 Bits Per Component"
        ]);

        const processShaderSource = `
        vec4 process(vec2 uv) {
            vec4 col;

            if (inputInputConnected)
              col = texture(inputInput, uv);
            else
              col = vec4(1,1,1,1);

			if(propComponents == 2) col.rgb = vec3(col.r);
			if(propComponents == 3) col.rgb = vec3(col.g);
			if(propComponents == 4) col.rgb = vec3(col.b);
			if(propComponents == 5) col.rgb = vec3(col.a);
            
            return col;
        }
        `;

        this.buildShader(processShaderSource);
    }
}

export class NormalNode extends ShaderNode {
    public initNode(name: string) {
        this.name = name;
        this.title = "Normal";
        this.type = NodeType.Atomic;

        const inPort = new Port(this.uuid, PortType.In, 0, "Input");
        this.addInput(inPort);
        const outPort = new Port(this.uuid, PortType.Out, 0, "Output");
        this.addOutput(outPort);

        this.addFloatProperty("Strength", "Strength", 0.02, -0.02, 0.02, 0.00001);

        const processShaderSource = `
        vec4 process(vec2 uv) {
            vec2 step = vec2(1.0,1.0) / uTexSize;
            // center point
            float d0 = abs(texture(inputInput, uv + vec2(0.0, 0.0)).r) * propStrength / 2.0;
            // sample horizontally
            float d1 = abs(texture(inputInput, uv + vec2(step.x, 0.0)).r) * propStrength / 2.0;
            float d2 = abs(texture(inputInput, uv + vec2(-step.x, 0.0)).r) * propStrength / 2.0;
            // sample vertically
            float d3 = abs(texture(inputInput, uv + vec2(0.0, step.y)).r) * propStrength / 2.0;
            float d4 = abs(texture(inputInput, uv + vec2(0.0, -step.y)).r) * propStrength / 2.0;
            // find diff horizontally and average
            float dx = ((d2 - d0) + (d0 - d1)) * 0.5;
            // find diff vertically and average
            float dy = ((d4 - d0) + (d0 - d3)) * 0.5;
            // calculate normal
            vec3 dvx = vec3(step.x, 0.0       , d1-d0);
            vec3 dvy = vec3(0.0       , step.y, d3-d0);
            vec3 normal = normalize(cross(dvx, dvy));
            vec3 final = normal.xyz * 0.5 + 0.5;
            return vec4(final, 1.0);
        }
        `;

        this.buildShader(processShaderSource);
    }
}

export class ColorNode extends ShaderNode { 
    public initNode(name: string) {
        this.name = name;
        this.title = "Color";
        this.type = NodeType.Atomic;

        const outPort = new Port(this.uuid, PortType.Out, 0, "Output");
        this.addOutput(outPort);

        const color = new Color(1, 1, 1, 1);
        this.addColorProperty("Color", "Color", color);

        const processShaderSource = `
        vec4 process(vec2 uv) {
            return propColor;
        }
        `;

        this.buildShader(processShaderSource);
    }
}