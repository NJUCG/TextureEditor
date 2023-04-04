import fs from "fs";
import { dialog, getCurrentWindow } from "@electron/remote";

export class Project {
    public name: string;
    public path: string;
    public data: {};

    constructor(name: string = null, path: string = null, data: {} = null) {
        this.name = name;
        this.path = path;
        this.data = data;
    }

    public clear() {
        this.name = null;
        this.path = null;
        this.data = null;
    }
}

export class ProjectManager {
    private static instance: Project = null;
    public static getInstance() {
        if (!ProjectManager.instance)
            ProjectManager.instance = ProjectManager.new();
        return ProjectManager.instance;
    }

    public static open(): Project {
        let paths = dialog.showOpenDialogSync(getCurrentWindow(), {
            filters: [
                {
                    name: "Texture Project",
                    extensions: ["texproj"]
                }
            ],
        });

        if (!paths) 
            return;

        const path = paths[0];

        ProjectManager.instance = ProjectManager.read(path);
        return ProjectManager.instance;
    }

    public static new(): Project {
        ProjectManager.instance = new Project("Untitled Project");
        return ProjectManager.instance;
    }

    public static save(data: {}, saveAs = false) {
        const project = ProjectManager.getInstance();
        project.data = data;

        if (!project.path || saveAs) {
            // 保存新文件
            const path = dialog.showSaveDialogSync(getCurrentWindow(), {
                filters: [
                    {
                        name: "Texture Project",
                        extensions: ["texproj"]
                    }
                ],
            });

            if (!path) 
                return;

            const fileName = path.replace(/^.*[\\/]/, "");
            project.name = fileName.substring(0, fileName.lastIndexOf(".")) || fileName;
            project.path = path;

            ProjectManager.write(path, project);
            ProjectManager.setWindowTitle(project.name);
        } else {
            // 保存老文件
            ProjectManager.write(project.path, project);
        }
    }

    public static read(path: string): Project {
        const project = new Project();

        project.path = path;
        const fileName = path.replace(/^.*[\\/]/, "");
        project.name = fileName.substring(0, fileName.lastIndexOf("."));
        project.data = JSON.parse(fs.readFileSync(path).toString());

        return project;
    }

    public static write(path: string, project: Project) {
        fs.writeFileSync(path, JSON.stringify(project.data));
    }

    public static setWindowTitle(newTitle: string) {
        document.title = newTitle;
    }
}