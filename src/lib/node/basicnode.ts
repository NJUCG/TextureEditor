import { Color } from '../designer/color';
import {
    Property,
    PropertyGroup,
    FloatProperty,
    IntProperty,
    BoolProperty,
    ColorProperty,
    EnumProperty,
    IPropertyHolder,
    PropertyType,
} from "./NodeProperty";

/**
 * 节点类型
 */
export enum NodeType {
    Util,           //comment frame pin...
    Atomic,         //自定义原子节点
    Function,       //函数节点
    Generator,
    Filter,
    View3D          //环境参数
};

/**
 * 节点抽象类, 保存节点的基本信息和基本方法
 */
export abstract class Node implements IPropertyHolder {
    // node info
    public uuid: string;
    public name: string;
    public type: NodeType;
    // rendering context for texture
    public designer: Designer;
    public ctx: WebGL2RenderingContext;
    public targetTex: WebGLTexture;
    // every node has a randomSeed
    public randomSeed: number;
    // inputs' ports of this node
    public inputs: Port[];
    // outpus' ports of this node
    public outputs: Port[];
    // node properties
    public properties: Property[];
    public propertyGroups: PropertyGroup[];

    constructor() {
        this.uuid = UUID.newUUID();
        this.name = null;
        this.type = null;
        this.designer = null;
        this.ctx = null;
        this.targetTex = null;
        this.randomSeed = 0;
        this.inputs = [];
        this.outputs = [];
        this.properties = [];
        this.propertyGroups = [];
    }

    public addInput(port: Port) {
        this.inputs.push(port);
    }

    public addOutput(port: Port) {
        this.outputs.push(port);
    }

    // 该节点发生变化, 请求designer更新
    public requestUpdate() {
        this.designer.requestUpdate(this);    
    }

    public setProperty(name: string, value: any): void {
        const prop = this.properties.find(x => {
            return x.name == name;
        });

        if (prop) {
            if (prop.type == PropertyType.Image) {
				prop.setValue(value, () => {
					this.requestUpdate();
				});
			} else {
				prop.setValue(value);
				this.requestUpdate();
			}
        }
    }

    protected addIntProperty(name: string, displayName: string, defaultValue = 1, minVal = 1, maxVal = 100, increment = 1) {
        const prop = new IntProperty(name, displayName, defaultValue, increment);
        prop.minValue = minVal;
        prop.maxValue = maxVal;

        this.properties.push(prop);
    }

    protected addFloatProperty(name: string, displayName: string, defaultValue = 0, minVal = 0, maxVal = 1, increment = 0.1) {
        const prop = new FloatProperty(name, displayName, defaultValue, increment);
        prop.minValue = minVal;
        prop.maxValue = maxVal;

        this.properties.push(prop);
    }

    protected addBoolProperty(name: string, displayName: string, defaultValue = false) {
        const prop = new BoolProperty(name, displayName, defaultValue);

        this.properties.push(prop);
    }

    protected addColorProperty(name: string, displayName: string, defaultValue: Color = Color.parse("#000000")) {
        const prop = new ColorProperty(name, displayName, defaultValue);

        this.properties.push(prop);
    }

    protected addEnumProperty(name: string, displayName: string, defaultValue: string[] = [], index: number = 0) {
        const prop = new EnumProperty(name, displayName, defaultValue, index);

        this.properties.push(prop);
    }

    // 新建该节点对应的纹理
    protected initTexture() {
        const gl = this.ctx;

        if (this.targetTex) {
            // texture exists
            gl.deleteTexture(this.targetTex);
            this.targetTex = null;
        }

        const targetTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, targetTex);

        const level = 0;
        const internalFormat = gl.RGBA16F;
        const border = 0;
        const format = gl.RGBA;
        const type = gl.FLOAT;
        const data = null;
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, this.designer.width, this.designer.height, border, format, type, data);

        // set the filtering so we don't need mips
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

		gl.bindTexture(gl.TEXTURE_2D, null);

		this.targetTex = targetTex;
    }
}