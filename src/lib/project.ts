import exp from "constants";
import fs from "fs";

export class Project {
    name: string = null;
    path: string = null;
    data: object = null;
}

export class ProjectManager {
    static load(path: string): Project {
        const project = new Project();

        project.path = path;
        const fileName = path.replace(/^.*[\\/]/, "");
        project.name = fileName.substring(0, fileName.lastIndexOf("."));
        project.data = JSON.parse(fs.readFileSync(path).toString());


        return project;
    }

    static save(path: string, project: Project) {
        fs.writeFileSync(path, JSON.stringify(project.data));
    }
}