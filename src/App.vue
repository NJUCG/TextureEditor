<template>
  <split-view class="pane-root" direction="horizontal" a-init="20%">
    <template #A>
      <split-view direction="vertical">
          <template #A>
            <view2D></view2D>
          </template>
          <template #B>
            <view3D></view3D>
          </template>
      </split-view>
    </template>

    <template #B>
      <split-view direction="horizontal" a-init="75%">
        <template #A>
          <div class="editor-pane">
            <editorView ref="editor"></editorView>
          </div>
        </template>
        <template #B>
          <split-view direction="vertical">
            <template #A>
              <propertyView></propertyView>
            </template>

            <template #B>
              <libraryView class="library-pane" ref="libraryCanvas"></libraryView>
            </template>
          </split-view>
        </template>
      </split-view>
    </template>
  </split-view>
</template>

<script setup lang="ts">
import SplitView from 'vue-split-view'
// import all views of texture editor
import view2D from './views/view2D.vue';
import view3D from './views/view3D.vue';
import propertyView from './views/propertyView.vue';
import libraryView from './views/libraryView.vue';
import editorView from './views/editorView.vue';
import { LibraryMonitor } from '@/lib/library';
import { onMounted, ref } from "vue";
import { Editor } from "@/lib/editor"
import { MenuCommands, setupMenu } from "./menu";
import { Project, ProjectManager } from "@/lib/project"
const { ipcRenderer } = require('electron')
const remote = require("@electron/remote");
const { dialog, app, BrowserWindow, Menu } = remote;

let project = new Project();
const libraryCanvas = ref(null);
let library: LibraryMonitor = null;
// const editor = ref<Editor | null>(null);
const editor = ref(null);

onMounted(() => {
  
  library = libraryCanvas.value.libraryMonitor;
  editor.value.setLibrary(library);
  // editor.value = new Editor(editorCanvas.value);//包含setCanvas setGraph
  // editor.value.setLibrary(library);

  //2d.setEditor
  //3d.setEditor

  newProject();

  const draw = () => {
    // editor.value.draw();//通过editor逐层重绘
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
@import './styles/layout-style.css';

html {
  height: 100%;
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
