/**
 * Create a texture.
 * @param gl The WebGL2RenderingContext to use.
 * @param width The width of the texture.
 * @param height The height of the texture.
 * @returns The created texture.
 */
export function createTexture(gl: WebGL2RenderingContext, width: number, height: number): WebGLTexture {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	// Set tex parameters
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

	// Upload the image into the texture.
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

	return texture;
}

/**
 * Loads a shader.
 * @param gl The WebGL2RenderingContext to use.
 * @param shaderSource The shader source.
 * @param shaderType The type of shader.
 * @return The created shader.
 */
export function loadShader(gl: WebGL2RenderingContext, shaderSource: string, shaderType: GLenum) {
	// Create the shader object
	const shader = gl.createShader(shaderType);
	// Load the shader source
	gl.shaderSource(shader, shaderSource);
	// Compile the shader
	gl.compileShader(shader);
	// Check the compile status
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

/**
 * Creates a program, attaches shaders, binds attrib locations, links the
 * program and calls useProgram.
 * @param gl The WebGL2RenderingContext to use.
 * @param vertSource The vertex shader source.
 * @param fragSource The fragment shader source.
 * @returns The created shader program.
 */
export function createShaderProgram(gl: WebGL2RenderingContext, vertSource: string, fragSource: string) {
	const vertexShader = loadShader(gl, vertSource, gl.VERTEX_SHADER);
	const fragmentShader = loadShader(gl, fragSource, gl.FRAGMENT_SHADER);

	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}

	return shaderProgram;
}