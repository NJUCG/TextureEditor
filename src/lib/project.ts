import fs from "fs";

export class Project {
    public name: string;
    public path: string;
    public data: {};

    constructor(name: string = null, path: string = null, data: {} = null) {
        this.name = name;
        this.path = path;
        this.data = data;
    }
}

export class ProjectManager {
    public static load(path: string): Project {
        const project = new Project();

        project.path = path;
        const fileName = path.replace(/^.*[\\/]/, "");
        project.name = fileName.substring(0, fileName.lastIndexOf("."));
        project.data = JSON.parse(fs.readFileSync(path).toString());


        return project;
    }

    public static save(path: string, project: Project) {
        fs.writeFileSync(path, JSON.stringify(project.data));
    }
}