<template>
  <nodeView></nodeView>
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
            <editorView ref="editor" :library="library"></editorView>
          </div>
        </template>
        <template #B>
          <split-view direction="vertical">
            <template #A>
              <propertyView :key="state.timer"></propertyView>
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

import nodeView from './views/nodeView.vue';

import SplitView from 'vue-split-view'
// import all views of texture editor
import view2D from './views/view2D.vue';
import view3D from './views/view3D.vue';
import propertyView from './views/propertyView.vue';
import libraryView from './views/libraryView.vue';
import editorView from './views/editorView.vue';
import { computed, onMounted, ref } from "vue";
import { MenuCommands, setupMenu } from "./menu";
import { Project, ProjectManager } from "@/lib/project"
import {watch} from "vue";
import {useMainStore} from "@/store";
import {reactive} from "vue";
const { ipcRenderer } = require('electron')
const remote = require("@electron/remote");
const { dialog, app, BrowserWindow, Menu } = remote;

let project = new Project();
const libraryCanvas = ref(null);
let library = computed(() => { return libraryCanvas.value ? libraryCanvas.value.libraryMonitor : null; })
// const editor = ref<Editor | null>(null);
const editor = ref(null);
const store=useMainStore();
const state=reactive({
  timer:0
})

watch(
    // pointer???????????????????????????
    () => store.property,
    // change???????????????????????????
    (newV, oldV) => {
      console.log("?????????store??????")
      state.timer=new Date().getTime();

    },
    {
      immediate: true, // ????????????
      deep: true // ????????????
    }
)
onMounted(() => {
  console.log(editor.value);

  newProject();

  // const draw = () => {
  //   // editor.value.draw();//??????editor????????????
  //   requestAnimationFrame(draw);
  // };
  // requestAnimationFrame(draw);
})

// ??????menu??????
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
  // document.title = newTitle; //??????editor???title

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
