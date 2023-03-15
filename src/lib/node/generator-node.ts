import { Node } from "./shader-node"
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
        this.id = "simplexNoiseNode";

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
// Worley Noise(Cell Noise)
export class WorleyNoiseNode extends Node {
	constructor(){
        super();
        //添加节点属性
        this.addFloatProperty("Scale", "Cell Scale", 5, 1, 20, 1);
        this.id = "WorleyNoiseNode";

        this.type = LibraryItemType.Generators;
        const gl = this.canvas.getContext("webgl");

		
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
        
        vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
        }
        
        vec2 mod289(vec2 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
        }
        
        // Modulo 7 without a division
        vec3 mod7(vec3 x) {
        return x - floor(x * (1.0 / 7.0)) * 7.0;
        }
        
        // Permutation polynomial: (34x^2 + x) mod 289
        vec3 permute(vec3 x) {
        return mod289((34.0 * x + 1.0) * x);
        }
        
        // Cellular noise, returning F1 and F2 in a vec2.
        // Standard 3x3 search window for good F1 and F2 values
        vec2 cellular(vec2 P) {
        #define K 0.142857142857 // 1/7
        #define Ko 0.428571428571 // 3/7
        #define jitter 1.0 // Less gives more regular pattern
            vec2 Pi = mod289(floor(P));
            vec2 Pf = fract(P);
            vec3 oi = vec3(-1.0, 0.0, 1.0);
            vec3 of = vec3(-0.5, 0.5, 1.5);
            vec3 px = permute(Pi.x + oi);
            vec3 p = permute(px.x + Pi.y + oi); // p11, p12, p13
            vec3 ox = fract(p*K) - Ko;
            vec3 oy = mod7(floor(p*K))*K - Ko;
            vec3 dx = Pf.x + 0.5 + jitter*ox;
            vec3 dy = Pf.y - of + jitter*oy;
            vec3 d1 = dx * dx + dy * dy; // d11, d12 and d13, squared
            p = permute(px.y + Pi.y + oi); // p21, p22, p23
            ox = fract(p*K) - Ko;
            oy = mod7(floor(p*K))*K - Ko;
            dx = Pf.x - 0.5 + jitter*ox;
            dy = Pf.y - of + jitter*oy;
            vec3 d2 = dx * dx + dy * dy; // d21, d22 and d23, squared
            p = permute(px.z + Pi.y + oi); // p31, p32, p33
            ox = fract(p*K) - Ko;
            oy = mod7(floor(p*K))*K - Ko;
            dx = Pf.x - 1.5 + jitter*ox;
            dy = Pf.y - of + jitter*oy;
            vec3 d3 = dx * dx + dy * dy; // d31, d32 and d33, squared
            // Sort out the two smallest distances (F1, F2)
            vec3 d1a = min(d1, d2);
            d2 = max(d1, d2); // Swap to keep candidates for F2
            d2 = min(d2, d3); // neither F1 nor F2 are now in d3
            d1 = min(d1a, d2); // F1 is now in d1
            d2 = max(d1a, d2); // Swap to keep candidates for F2
            d1.xy = (d1.x < d1.y) ? d1.xy : d1.yx; // Swap if smaller
            d1.xz = (d1.x < d1.z) ? d1.xz : d1.zx; // F1 is in d1.x
            d1.yz = min(d1.yz, d2.yz); // F2 is now not in d2.yz
            d1.y = min(d1.y, d1.z); // nor in  d1.z
            d1.y = min(d1.y, d2.x); // F2 is in d1.y, we're done.
            return sqrt(d1.xy);
        }
        vec4 process(vec2 uv)
        {
            float scale = 7.0;
            //vec2 cel = cellular(uv*vec2(scale));
            vec2 cel = cellular(uv*vec2(propScale));
            return vec4(vec3(cel.y - cel.x),1.0);
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
        this.setPropsLocation();
	}
}

export class BrickNode extends Node {
	constructor(){
        super();

		this.addFloatProperty("Rows", "Rows", 8, 1, 20, 1);
		this.addFloatProperty("Columns", "Columns", 5, 1, 20, 1);
		this.addFloatProperty("Offset", "Offset", 0.5, 0, 1, 0.1);

        this.addFloatProperty("BrickWidth", "Brick Width", 0.9, 0, 1, 0.01)
        this.addFloatProperty("BrickHeight", "Brick Height", 0.9, 0, 1, 0.01)

        this.addFloatProperty("HeightMin", "Height Min", 0.0, 0, 1, 0.05)
        this.addFloatProperty("HeightMax", "Height Max", 1.0, 0, 1, 0.05)
        this.addFloatProperty("HeightBalance", "Height Balance", 1.0, 0, 1, 0.05)
        this.addFloatProperty("HeightVariance", "Height Variance", 0, 0, 1, 0.05)

        //TODO:该属性可能会复用，之后考虑迁移到抽象父类中
        this.addIntProperty("Seed", "Random Seed", 0, 0, 20, 1);

        this.id="brickNode";

        this.type = LibraryItemType.Generators;
        const gl = this.canvas.getContext("webgl");

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

        // gives a much better distribution at 1
        #define RANDOM_ITERATIONS 1
        #define HASHSCALE1 443.8975

        //  1 out, 2 in...
        float hash12(vec2 p)
        {
            vec3 p3  = fract(vec3(p.xyx) * HASHSCALE1);
            p3 += dot(p3, p3.yzx + 19.19);
            return fract((p3.x + p3.y) * p3.z);
        }

        float _rand(vec2 uv)
        {
            float a = 0.0;
            for (int t = 0; t < RANDOM_ITERATIONS; t++)
            {
                float v = float(t+1)*.152;
                // 0.005 is a good value
                vec2 pos = (uv * v);
                a += hash12(pos);
            }

            return a/float(RANDOM_ITERATIONS);
        }

        // HEIGHT FUNCTIONS
        float calculateHeight(vec2 brickId)
        {
            // height
            float heightMin = propHeightMin;
            float heightMax = propHeightMax;
            float heightBalance= propHeightBalance; // threshold that decides whether to use height variance or not
            float heightVariance = propHeightVariance; // multiplies the heightMax-heightMin range


            // check whether or not there should be a height range in the first place
            float balRand = _rand(vec2(propSeed) + brickId * vec2(0.01));
            
            // if balRand is less than heightBalance it means it qualifies for a random
            // height. This way if heightBalance is 0 then we only use the min luminance
            if( balRand > heightBalance) {
                return 1.0;
            }
            
            // calculate height variance
            // need to offset brickId to give new random result
            float randVariance = _rand(vec2(propSeed) + (brickId + vec2(1) ) * vec2(0.01));
            randVariance *= heightVariance;
            
            float range = (heightMax - heightMin);
            float height = heightMax - 
                        range * randVariance;
            
            return height;
        }

        vec2 is_brick(vec2 pos)
        {
            vec2 brickSize = vec2(propBrickWidth, propBrickHeight);

            vec2 edgeSize = (vec2(1.0) - brickSize) * vec2(0.5);
            vec2 brick = vec2(0.0);
            
            if (pos.x > edgeSize.x && pos.x < (1.0 - edgeSize.x))
                brick.x = 1.0;
                
            if (pos.y > edgeSize.y && pos.y < (1.0 - edgeSize.y))
                brick.y = 1.0;
                
            return brick;
        }

        vec4 process(vec2 uv)
        {
            vec2 tileSize = vec2(propColumns, propRows);
            float offset = propOffset;

            //vec2 pos = uv * vec2(5);
            vec2 pos = uv * tileSize;
            
            float xOffset = 0.0;
            if (fract(pos.y * 0.5) > 0.5) {
                xOffset = offset;
            }
            pos.x += xOffset;
            
            // a brick's id would be floor(pos)
            // this gives us its origin
            // this can act as a random seed for the entire brick
            vec2 brickId = floor(pos);// - vec2(xOffset, 0);

            // wrap around x
            if (brickId.x > tileSize.x-1.0)
                brickId.x = 0.0;

            float lum = calculateHeight(brickId);
            pos = fract(pos);
            
            //vec2 isBrick = step(pos,vec2(0.95,0.9));
            vec2 isBrick =is_brick(pos);

            
            return vec4(vec3(isBrick.x * isBrick.y * lum),1.0);
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
        this.setPropsLocation();
	}
}

export class PolygonNode extends Node {
	constructor(){
        super();

        this.addFloatProperty("Radius", "Radius", 0.7, 0, 3, 0.01);
		this.addFloatProperty("Angle", "Angle", 0, 0.0, 360.0, 1);
		this.addIntProperty("Sides", "Sides", 5, 0, 20, 1);
		this.addFloatProperty("Gradient", "Gradient", 0, 0, 1.0, 0.01);

        this.id = "polygonNode";

        this.type = LibraryItemType.Generators;
        const gl = this.canvas.getContext("webgl");

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
        
        #define PI 3.14159265359
        #define TWO_PI 6.28318530718

        float linearstep(float a, float b, float t)
        {
            if (t <= a) return 0.0;
            if (t >= b) return 1.0;

            return (t-a)/(b-a);
        }

        vec4 process(vec2 uv)
        {
            uv = uv *2.-1.;

            // Angle and radius from the current pixel
            float a = atan(uv.x,uv.y)+radians(propAngle);
            float r = TWO_PI/float(propSides);

            float d = cos(floor(.5+a/r)*r-a)*length(uv) / propRadius;

            vec3 color = vec3(1.0-linearstep(0.8-propGradient,0.8,d));

            return vec4(color, 1.0);
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
        this.setPropsLocation();
	}
}

export class GradientNode extends Node {
	constructor(){
        super();

        this.id = "gradientNode";
        const white = new Color();
		white.r = 1;
		white.g = 1;
		white.b = 1;

		this.addColorProperty("ColorA", "Color A", Color.parse("#000000"));
		this.addFloatProperty("PosA", "Position A", 0, 0, 1, 0.01);
		this.addColorProperty("ColorB", "Color B", white);
		this.addFloatProperty("PosB", "Position B", 1, 0, 1, 0.01);

		this.addEnumProperty("Mode", "Gradient Direction", [
			"Left To Right",
			"Right To Left",
			"Top To Bottom",
			"Bottom To Top"
		]);

        this.type = LibraryItemType.Generators;
        const gl = this.canvas.getContext("webgl");

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
		
        #define POINTS_MAX 32
        //FIXME:这里固定了numPoints为2
        const int NUM_POINTS = 2;

        // assumes points are sorted
        vec3 calcGradient(float t, vec3 colors[POINTS_MAX], float positions[POINTS_MAX])
        {
            if (NUM_POINTS == 0)
                return vec3(1,0,0);
            
            if (NUM_POINTS == 1)
                return colors[0];
            
            // here at least two points are available
            if (t < positions[0])
                return colors[0];
            
            if (t > positions[NUM_POINTS - 1])
                return colors[NUM_POINTS - 1];
            
            // find two points in-between and lerp
            
            for(int i = 0; i < NUM_POINTS-1;i++) {
                if (positions[i+1] > t) {
                    vec3 colorA = colors[i];
                    vec3 colorB = colors[i+1];
                    
                    float t1 = positions[i];
                    float t2 = positions[i+1];
                    
                    float lerpPos = (t - t1)/(t2 - t1);
                    return mix(colorA, colorB, lerpPos);
                    
                }
                
            }
            
            return vec3(0,0,0);
        }

        vec4 process(vec2 uv)
        {
            float t = 0.0;
    
            // left to right
            if (propMode == 0)
                t = uv.x;
            // right to left
            else if (propMode == 1)
                t = 1.0 - uv.x;
            // top to bottom
            else if (propMode == 2)
                t = 1.0 - uv.y;
            // bottom to top
            else if (propMode == 3)
                t = uv.y;


            vec3 colors[POINTS_MAX];
            colors[0] = propColorA.rgb;
            colors[1] = propColorB.rgb;
            float positions[32];
            positions[0] = propPosA;
            positions[1] = propPosB;
                
            
            vec3 col = calcGradient(t, colors, positions);
            
            return vec4(col,1.0);
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
        this.setPropsLocation();
	}
}

export class CellNode extends Node {
    constructor(){
        super();
        //添加节点属性
		this.addIntProperty("Scale", "Scale", 5, 0, 256);
		this.addBoolProperty("Invert", "Invert", false);
		this.addFloatProperty("Entropy", "Order", 0, 0, 1, 0.01);
		this.addFloatProperty("Intensity", "Intensity", 1, 0, 2, 0.01);
        //TODO:该属性可能会复用，之后考虑迁移到抽象父类中
        this.addIntProperty("Seed", "Random Seed", 0, 0, 20, 1);

        this.id = "cellNode";

        this.type = LibraryItemType.Generators;
        const gl = this.canvas.getContext("webgl");

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
        vec2 random2( vec2 p ) {
            //p += vec2(_seed);
            p += vec2(propSeed);
            return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
        }
        float wrapAround(float value, float upperBound) {
            return mod((value + upperBound - 1.0), upperBound);
        }
        vec4 process(vec2 uv)
        {
            uv *= float(propScale);
            vec2 i_st = floor(uv);
            vec2 f_st = fract(uv);
            float m_dist = 1.;
            for (int y= -1; y <= 1; y++) {
                for (int x= -1; x <= 1; x++) {
                    vec2 neighbor = vec2(float(x),float(y));
                    // wraps around cells to make it seamless
                    vec2 neighborCell = i_st + neighbor;
                    neighborCell.x = wrapAround(neighborCell.x, float(propScale));
                    neighborCell.y = wrapAround(neighborCell.y, float(propScale));
                    // Random position from current + neighbor place in the grid
                    vec2 point = random2(neighborCell);
                    // entropy is lerping between the center and the random point
                    point = mix(point, vec2(0.5,0.5), propEntropy);
                    // Animate the point
                    //point = 0.5 + 0.5*sin(u_time + 6.2831*point);
                    // Vector between the pixel and the point
                    vec2 diff = neighbor + point - f_st;
                    // Distance to the point
                    float dist = length(diff);
                    // Keep the closer distance
                    m_dist = min(m_dist, dist);
                }
            }
            if (propInvert)
                m_dist = 1.0 - m_dist;
            return vec4(vec3(m_dist) * propIntensity, 1.0);
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
        this.setPropsLocation();
	}
}