import path from "path"
import fs from "fs"
import electron from "electron";
import { Project } from "../project";
import { Editor } from "../editor";
import { TextureCanvas } from "../utils/texture-canvas";
import { mappingChannelName } from "../canvas3d";

export class ImageExportManager {
    public texCanvas: TextureCanvas;
    public project: Project;
    public files: Map<string, ArrayBuffer>;

	constructor(project: Project) {
        this.texCanvas = new TextureCanvas();
        this.project = project;
        this.files = new Map<string, ArrayBuffer>();
	}

    public exportFilesToFolder(folder: string) {
        for (const info of this.files) {
            const exportPath = path.join(folder, info[0]);
            const bytes = info[1];
    
            fs.writeFile(exportPath, new Uint8Array(bytes), function(e) {
                if (e) 
                    alert("Exporter: Failed exporting textures: " + e);
            });
        }
    }

    public getMappingTextures(editor: Editor) {
        for (const info of editor.mappingNodes) {
            const channel = info[0];
            const uuid = info[1];
            const filename = this.project.name + "_" + mappingChannelName[channel] + ".png";
            const node = editor.designer.getNodeById(uuid);
            
            this.texCanvas.resize(node.texSize, node.texSize);
            editor.designer.renderTextureToCanvas(node.targetTex, this.texCanvas);
            this.files.set(filename, this.canvasToArrayBuffer(this.texCanvas.canvas));
        }
    }

    private canvasToArrayBuffer(canvas: HTMLCanvasElement): ArrayBuffer {
        const url = canvas.toDataURL("image/png", 1);
        const nativeImage = electron.nativeImage.createFromDataURL(url);
        const buffer = nativeImage.toPNG();

        return buffer;
    }
}