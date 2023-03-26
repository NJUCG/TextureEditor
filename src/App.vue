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
// electron related
const { ipcRenderer } = require('electron')
const remote = require("@electron/remote");
const { dialog } = remote;

let project = null;
let setupSceneFunc = () => {};

const library = new Library();
const designer = new Designer();
const editorView = ref(null);

onMounted(() => {
    const { setupInitialScene } = editorView.value;
    setupSceneFunc = setupInitialScene;
    project = newProject();
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
