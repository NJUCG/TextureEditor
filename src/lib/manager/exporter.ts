import path from "path"
import fs from "fs"
import { Project, ProjectManager } from "../project";
import { Editor } from "../editor";
import { ThumbnailRenderer } from "./thumbnail";
import { TextureCanvas } from "../utils/texture-canvas";
import { mappingChannelName } from "../canvas3d";
import { ElMessage } from "element-plus";

// electron
import { nativeImage } from "electron";
import { dialog, getCurrentWindow } from "@electron/remote";


export class ImageExportManager {
    public editor: Editor;
    public texCanvas: TextureCanvas;
    public project: Project;
    public files: Map<string, ArrayBuffer>;

	public constructor(project: Project, editor: Editor) {
        this.editor = editor;
        this.texCanvas = new TextureCanvas();
        this.project = project;
        this.files = new Map<string, ArrayBuffer>();
	}

    public async exportTexturesToPng() {
        const folder = this.getExportFolder();
        this.getMappingTextures();
        this.exportFilesToFolder(folder);
    
        ElMessage({
            message: "Textures exported successfully!",
            type: "success",
        });
    }

    private exportFilesToFolder(folder: string) {
        for (const [filename, data] of this.files) {
            const exportPath = path.join(folder, filename);
    
            fs.writeFile(exportPath, new Uint8Array(data), function(e) {
                if (e) 
                    alert("Exporter: Failed exporting textures: " + e);
            });
        }
    }
    
    private getExportFolder(): string {
        const path = dialog.showOpenDialogSync(getCurrentWindow(), {
            properties: ["openDirectory", "createDirectory"]
        });
        if (path && path.length > 0)
            return path[0];
        return null;
    }

    private getMappingTextures() {
        const renderer = ThumbnailRenderer.getInstance();
        this.editor.mappingNodes.forEach((uuid, channel) => {
            const filename = this.project.name + "_" + mappingChannelName[channel] + ".png";
            const node = this.editor.designer.getNodeById(uuid);
            this.texCanvas.resize(node.texSize, node.texSize);
            renderer.renderTextureToCanvas(node.targetTex, this.texCanvas);
            this.files.set(filename, this.canvasToArrayBuffer(this.texCanvas.canvas));
        })
    }

    private canvasToArrayBuffer(canvas: HTMLCanvasElement): ArrayBuffer {
        const url = canvas.toDataURL("image/png", 1);
        const image = nativeImage.createFromDataURL(url);
        const buffer = image.toPNG();

        return buffer;
    }
}