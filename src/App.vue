<template>
  <!-- golden layout test -->
  <div class="full-height">
    <div id="nav" style="height: 40px; border-style: dashed;">
      Navigator: 作为工具栏，实现部分方法，如Redo/Undo等
    </div>
    <golden-layout
      ref="GoldenLayoutRoot"
      glc-path="./"
      style="width: 100%; height: calc(100% - 40px)"
    ></golden-layout>
  </div>
  <!-- golden layout test -->
</template>

<script setup lang="ts">

import { onMounted, ref } from "vue";

/** vue-golden-layout test
import GoldenLayout from "@/views/GoldenLayout.vue";
import { predefinedLayout } from "./lib/layout/predefined-layout";

const GoldenLayoutRoot = ref<null | HTMLElement>(null);

onMounted(() => {
  if (!GoldenLayoutRoot.value) return;
  GoldenLayoutRoot.value.loadGLLayout(predefinedLayout.defaultLayout);
})
 */

/** Golden-Layout methods
const onClickInitLayoutMinRow = () => {
  if (!GoldenLayoutRoot.value) return;
  GoldenLayoutRoot.value.loadGLLayout(predefinedLayout.miniRow);
};

const onClickAddGLComponent1 = () => {
  if (!GoldenLayoutRoot.value) return;
  GoldenLayoutRoot.value.addGLComponent("Content1", "Title 1st");
};

const onClickAddGLComponent2 = () => {
  if (!GoldenLayoutRoot.value) return;
  GoldenLayoutRoot.value.addGLComponent("Content2", "I'm wide");
};

const onClickAddGLComponent3 = () => {
  if (!GoldenLayoutRoot.value) return;
  GoldenLayoutRoot.value.addGLComponent("Content3", "I'm high");
};

const onClickSaveLayout = () => {
  if (!GoldenLayoutRoot.value) return;
  const config = GoldenLayoutRoot.value.getLayoutConfig();
  localStorage.setItem("gl_config", JSON.stringify(config));
};

const onClickLoadLayout = () => {
  const str = localStorage.getItem("gl_config");
  if (!str) return;
  if (!GoldenLayoutRoot.value) return;
  const config = JSON.parse(str as string);
  GoldenLayoutRoot.value.loadGLLayout(config);
};
 */

import GoldenLayout from "@/views/GoldenLayout.vue";
import { predefinedLayout } from "./lib/layout/predefined-layout";
/** former import */
import { Editor } from "@/lib/editor"
import { MenuCommands, setupMenu } from "./menu";
import { Project, ProjectManager } from "@/lib/project"
const { ipcRenderer } = require('electron')
const remote = require("@electron/remote");
const { dialog, app, BrowserWindow, Menu } = remote;

var project = new Project();
const editor = ref<Editor | null>(null);
const editorCanvas = ref<HTMLCanvasElement | null>(null);
const GoldenLayoutRoot = ref<null | HTMLElement>(null);

onMounted(() => {
  if (!GoldenLayoutRoot.value) return;
  GoldenLayoutRoot.value.loadGLLayout(predefinedLayout.defaultLayout);

  console.log(editorCanvas.value);
  editor.value = new Editor(editorCanvas.value);//包含setCanvas setGraph


  //2d.setEditor
  //3d.setEditor

  newProject();

  const draw = () => {
    editor.value.draw();//通过editor逐层重绘
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
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
@import "golden-layout/dist/css/goldenlayout-base.css";
@import "golden-layout/dist/css/themes/goldenlayout-dark-theme.css";

html {
    height: 100%;
}
body {
    height: 100%;
    margin: 0;
    overflow: hidden;
}
.full-height, #app {
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
/*
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.flex-div {
  display: flex;
  width: auto;
}
*/
</style>
