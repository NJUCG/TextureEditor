<template>
    <split-view class="pane-root" direction="horizontal" a-init="20%">
        <template #A>
            <split-view direction="vertical">
                <template #A>
                    <View2D v-if="isVisible" :key="refreshTick"></View2D>
                </template>
                <template #B>
                    <View3D v-if="isVisible" :key="refreshTick"></View3D>
                </template>
            </split-view>
        </template>

        <template #B>
            <split-view direction="horizontal" a-init="75%">
                <template #A>
                    <EditorView v-if="isVisible" :key="refreshTick" ref="editorView" :isNewProject="isNewProject"></EditorView>
                </template>
                <template #B>
                    <split-view direction="vertical">
                        <template #A>
                            PropertyView
                            <PropertyView v-if="isVisible" :key="refreshTick"></PropertyView>
                        </template>
                        <template #B>
                            <LibraryView ref="libraryView"></LibraryView>
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
import { ref, nextTick } from "vue";
import { MenuCommands } from "./menu";
import { ProjectManager } from "@/lib/project";
import { Editor } from "@/lib/editor";
// electron related
import { ipcRenderer } from "electron";

const editorView = ref(null);

const refreshTick = ref(0);
const isVisible = ref(false);
const isNewProject = ref(false);

// 处理menu指令
ipcRenderer.on(MenuCommands.FileOpen, () => {
    isNewProject.value = false;
    const project = ProjectManager.open();
    Editor.load(project.data);
    ProjectManager.setWindowTitle(project.name);
    isVisible.value = true;
    refreshTick.value = (refreshTick.value + 1) % 100;
})

ipcRenderer.on(MenuCommands.FileNew, () => {
    isNewProject.value = true;
    const project = ProjectManager.new();
    ProjectManager.setWindowTitle(project.name);
    isVisible.value = true;
    refreshTick.value = (refreshTick.value + 1) % 100;
})

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
