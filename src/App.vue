<template>
    <split-view class="pane-root" direction="horizontal" a-init="20%">
        <template #A>
            <split-view direction="vertical">
                <template #A>
                    <View2D :designer="designer"></View2D>
                </template>
                <template #B>
                    <View3D></View3D>
                </template>
            </split-view>
        </template>

        <template #B>
            <split-view direction="horizontal" a-init="75%">
                <template #A>
                    <EditorView ref="editorView" :designer="designer" :library="library"></EditorView>
                </template>
                <template #B>
                    <split-view direction="vertical">
                        <template #A>
                            PropertyView
                            <PropertyView></PropertyView>
                        </template>
                        <template #B>
                            <LibraryView ref="libraryView" :library="library"></LibraryView>
                            <!-- <LibraryView class="library-pane" ref="libraryCanvas" :library="library"></LibraryView> -->
                        </template>
                    </split-view>
                </template>
            </split-view>
        </template>
    </split-view>
</template>

<script setup lang="ts">

import SplitView from 'vue-split-view'
// element-plus related
import { ElMessage } from 'element-plus';
// view components
import View2D from './views/View2D.vue';
import View3D from './views/View3D.vue';
import PropertyView from './views/PropertyView.vue';
import LibraryView from './views/LibraryView.vue';
import EditorView from './views/EditorView.vue';
// libs
import { onMounted, ref } from "vue";
import { MenuCommands } from "./menu";
import { Project, ProjectManager } from "@/lib/project";
import { Library } from '@/lib/library';
import { Designer } from './lib/designer';
import { Editor } from './lib/editor';
import { ImageExportManager } from './lib/manager/exporter';
// electron related
const { ipcRenderer, shell } = require('electron')
const remote = require("@electron/remote");
const { dialog } = remote;

let project: Project = null;
let exportManager: ImageExportManager = null;
let exportEditor: Editor = null;
let setupSceneFunc = () => {};

const library = new Library();
const designer = new Designer();
const editorView = ref(null);

onMounted(() => {
    const { editor, setupInitialScene } = editorView.value;
    exportEditor = editor;
    setupSceneFunc = setupInitialScene;
    project = newProject();
    exportManager = new ImageExportManager(project);
    setWindowTitle(project.name);
    setupSceneFunc();
})

// 处理menu指令
ipcRenderer.on(MenuCommands.FileOpen, () => {
    project = openProject();
    setWindowTitle(project.name);
    setupSceneFunc();
})

ipcRenderer.on(MenuCommands.FileNew, () => {
    project = newProject();
    setWindowTitle(project.name);
    setupSceneFunc();
})

ipcRenderer.on(MenuCommands.FileSave, () => {
    saveProject();
})

ipcRenderer.on(MenuCommands.FileSaveAs, () => {
    saveProject(true);
})

ipcRenderer.on(MenuCommands.ExportPng, () => {
    const folder = setExportFolder();
    exportTexturesToPng(folder);
})

function newProject(): Project {
    const project = new Project("Untitled Project");
    return project;
}

function openProject(projectPath: string = null): Project {
    if (!projectPath) {
        let paths = dialog.showOpenDialogSync(remote.getCurrentWindow(), {
        filters: [
            {
            name: "Images",
            extensions: ["jpg"]
            }
        ],
        });

        if (!paths) return;

        projectPath = paths[0];
    }
    return ProjectManager.load(projectPath);
}

function saveProject(saveAs: boolean = false) {
    if (!project.path || saveAs) {
        let path = dialog.showSaveDialogSync(remote.getCurrentWindow(), {
        // filters: [
        //   {
        //     name: "Images",
        //     extensions: ["jpg"]
        //   }
        // ],
        });
        if (!path) return;
        const fileName = path.replace(/^.*[\\/]/, "");
        project.name = fileName.substring(0, fileName.lastIndexOf(".")) || fileName;
        project.path = path;

        ProjectManager.save(path, project);
        setWindowTitle(project.name);

    } else {
        ProjectManager.save(project.path, project);
    }
}

function setWindowTitle(newTitle: string) {
  // document.title = newTitle; //修改editor的title

}

async function exportTexturesToPng(folder: string) {
    exportManager.getMappingTextures(exportEditor);
    exportManager.exportFilesToFolder(folder);

    ElMessage({
        message: "Textures exported successfully!",
        type: "success",
    });
}

function setExportFolder(): string {
    const path = dialog.showOpenDialogSync(remote.getCurrentWindow(), {
        properties: ["openDirectory", "createDirectory"]
    });
    if (path && path.length > 0)
        return path[0];
    return null;
}

</script>

<style>
@import './styles/layout-style.css';

html {
  height: 100%;
  margin: 0;
}

body {
  height: 100%;
  margin: 0;
  overflow: hidden;
}

.full-height,
#app {
  height: 100%;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#nav {
  text-align: center;
}
</style>
