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
import { Editor } from "@/lib/editor"
import { MenuCommands, setupMenu } from "./menu";
import { Project, ProjectManager } from "@/lib/project"
const { ipcRenderer } = require('electron')
const remote = require("@electron/remote");
const { dialog, app, BrowserWindow, Menu } = remote;

var project = new Project();
const editor = ref<Editor | null>(null);
const editorCanvas = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
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

</style>
