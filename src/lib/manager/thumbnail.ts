import { createShaderProgram } from "../webgl-utils";
import { TextureCanvas } from "../utils/texture-canvas";
import { PixelDataInfo } from "../node/base-node";

export class ThumbnailRenderer {
    // single instance
    private static instance: ThumbnailRenderer = null;
    public static getInstance() {
        if (!ThumbnailRenderer.instance)
            ThumbnailRenderer.instance = new ThumbnailRenderer();
        return ThumbnailRenderer.instance;
    }

    public canvas: HTMLCanvasElement;
    // rendering ctx
    public gl: WebGL2RenderingContext;
    public posBuffer: WebGLBuffer;
    public texCoordBuffer: WebGLBuffer;

    public thumbnailProgram: WebGLProgram;      // 仅用于从targetTex绘制缩略图

    private constructor() {
    }

    public initRenderingCtx(canvas: HTMLCanvasElement, gl: WebGL2RenderingContext) {
        this.canvas = canvas;
        this.gl = gl;
        this.initBuffers();
        this.initThumbnailProgram();
    }
    
    private initBuffers() {
        const gl = this.gl;
        // 位置顶点坐标
        this.posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                1.0, 1.0,
                -1.0, 1.0,
                1.0, -1.0,
                -1.0, -1.0,
            ]),
            gl.STATIC_DRAW
        );
        // 纹理顶点坐标
        this.texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                1.0, 1.0,
                0.0, 1.0,
                1.0, 0.0,
                0.0, 0.0,
            ]),
            gl.STATIC_DRAW
        );
        
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    private initThumbnailProgram() {
        const vertSource = `#version 300 es
        precision highp float;

        in vec3 aVertPosition;
        in vec2 aTexCoord;
            
        out vec2 vTexCoord;

        void main() {
            gl_Position = vec4(aVertPosition, 1.0);
            vTexCoord = aTexCoord;
        }`
        const fragSource = `#version 300 es
        precision highp float;

        in vec2 vTexCoord;
        uniform sampler2D uTex;
        
        out vec4 outColor;
        
        void main() {
            outColor = texture(uTex, vTexCoord);
        }`

        this.thumbnailProgram = createShaderProgram(this.gl, vertSource, fragSource);
    }

    // private initTextureFromPixel(texData: Float32Array, width: number, height: number) {
    //     const gl = this.gl;

    //     const texture = gl.createTexture();
    //     gl.bindTexture(gl.TEXTURE_2D, texture);

    //     const level = 0;
    //     const internalFormat = gl.RGBA32F;
    //     const border = 0;
    //     const format = gl.RGBA;
    //     const type = gl.FLOAT;

    //     gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, format, type, texData);

    //     // set the filtering so we don't need mips
	// 	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	// 	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	// 	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	// 	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

	// 	gl.bindTexture(gl.TEXTURE_2D, null);

    //     return texture;
    // }

    /**
     * render node's texture then draw it on the image canvas
     * @param texture
     * @param canvas 
     */
    public renderTextureToCanvas(texture: WebGLTexture, targetCanvas: TextureCanvas) {
        const gl = this.gl;

        // bind shader
        gl.useProgram(this.thumbnailProgram);
		// bind mesh
		const posLoc = gl.getAttribLocation(this.thumbnailProgram, "aVertPosition");
		const texCoordLoc = gl.getAttribLocation(
			this.thumbnailProgram,
			"aTexCoord"
		);

		// provide texture coordinates for the rectangle.
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
		gl.enableVertexAttribArray(posLoc);
		gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
		gl.enableVertexAttribArray(texCoordLoc);
		gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);

		// send texture
		gl.uniform1i(gl.getUniformLocation(this.thumbnailProgram, "uTex"), 0);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.clearColor(1, 1, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.bindVertexArray(vao);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

		// cleanup
		gl.disableVertexAttribArray(posLoc);
		gl.disableVertexAttribArray(texCoordLoc);
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);

		targetCanvas.drawToTextureCanvas(this.canvas);
    }

    // /**
    //  * render node's texture then draw it on the image canvas
    //  * @param texData
    //  * @param canvas 
    //  */
    // public renderTextureToCanvas(texData: PixelDataInfo, targetCanvas: TextureCanvas) {
    //     const gl = this.gl;
    //     const texture = this.initTextureFromPixel(texData.data, texData.width, texData.height);

    //     // bind shader
    //     gl.useProgram(this.thumbnailProgram);
	// 	// bind mesh
	// 	const posLoc = gl.getAttribLocation(this.thumbnailProgram, "aVertPosition");
	// 	const texCoordLoc = gl.getAttribLocation(
	// 		this.thumbnailProgram,
	// 		"aTexCoord"
	// 	);

	// 	// provide texture coordinates for the rectangle.
    //     const vao = gl.createVertexArray();
    //     gl.bindVertexArray(vao);

	// 	gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
	// 	gl.enableVertexAttribArray(posLoc);
	// 	gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

	// 	gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
	// 	gl.enableVertexAttribArray(texCoordLoc);
	// 	gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);

	// 	// send texture
	// 	gl.uniform1i(gl.getUniformLocation(this.thumbnailProgram, "uTex"), 0);
	// 	gl.activeTexture(gl.TEXTURE0);
	// 	gl.bindTexture(gl.TEXTURE_2D, texture);

    //     gl.clearColor(1, 1, 1, 1);
    //     gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //     gl.bindVertexArray(vao);

	// 	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

	// 	// cleanup
	// 	gl.disableVertexAttribArray(posLoc);
	// 	gl.disableVertexAttribArray(texCoordLoc);
    //     gl.bindVertexArray(null);
    //     gl.bindBuffer(gl.ARRAY_BUFFER, null);
    //     gl.bindTexture(gl.TEXTURE_2D, null);

	// 	targetCanvas.drawToTextureCanvas(this.canvas);
    // }
}