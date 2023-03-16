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
                            <!-- <PropertyView></PropertyView> -->
                        </template>
                        <template #B>
                            <LibraryView ref="libraryCanvas" :library="library"></LibraryView>
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
import { onMounted, ref, reactive } from "vue";
import { MenuCommands } from "./menu";
import { Project, ProjectManager } from "@/lib/project";
import { Editor } from "@/lib/editor";
import { Library } from '@/lib/library';
import { Designer } from './lib/designer';
import { watch } from "vue";
import { useMainStore } from "@/store";
// electron related
const { ipcRenderer } = require('electron')
const remote = require("@electron/remote");
const { dialog, app, BrowserWindow, Menu } = remote;

let project = new Project();

const library = new Library();
const designer = new Designer();
const editor = ref(null);
const store = useMainStore();
const state = reactive({
    timer:0
})

watch(
    // pointer函数，监听的是什么
    () => store.change,
    // change函数，监听值的变化
    (newV, oldV) => {
      console.log("检测到store变化")
      state.timer=new Date().getTime();

    },
    {
      immediate: true, // 立即执行
      deep: true // 深度监听
    }
)
onMounted(() => {
    console.log(editor.value);

    newProject();

    // const draw = () => {
    //   // editor.value.draw();//通过editor逐层重绘
    //   requestAnimationFrame(draw);
    // };
    // requestAnimationFrame(draw);
})

// 处理menu指令
ipcRenderer.on(MenuCommands.FileOpen, () => {
    openProject();
})

ipcRenderer.on(MenuCommands.FileNew, () => {
    newProject();
})

ipcRenderer.on(MenuCommands.FileSave, () => {
    saveProject();
})

ipcRenderer.on(MenuCommands.FileSaveAs, () => {
    saveProject(true);
})

function newProject() {
    project.name = "Untitled Project";
    project.path = null;
    setWindowTitle(project.name);
}

function openProject(projectPath: string = null) {
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
    project = ProjectManager.load(projectPath);
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
