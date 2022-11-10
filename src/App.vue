<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <ExplorerView />
  <div width="50" class="flex-div">
    EditorView
    <!-- <EditorView ref="editorView"> -->
    <canvas width="400" height="400" ref="editorCanvas"></canvas>
    <!-- </EditorView> -->
  </div>
  <LibraryView />
  <div width="30" class="flex-div">
    <View2D height="40" ref="view2d" />|
    <View3D height="40" ref="view3d" />
  </div>
  <PropertyView />
  <!-- <hello-world msg="Welcome to Your Vue.js + TypeScript App" ref="HelloWorld"/> -->
</template>

<script setup lang="ts">
// import { defineComponent, onMounted } from 'vue';
// import HelloWorld from '@/components/HelloWorld.vue';
import EditorView from "@/views/editorView.vue";
import LibraryView from "@/views/libraryView.vue";
import View2D from "@/views/view2D.vue";
import View3D from "@/views/view3D.vue";
import PropertyView from "@/views/propertyView.vue";
import ExplorerView from "@/views/explorerView.vue";
import { Editor } from "@/lib/editor"
import { MenuCommands, setupMenu } from "./menu";
import { Project, ProjectManager } from "@/lib/project"
import { onMounted, ref } from "vue";
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
</style>
