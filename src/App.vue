<template>
    <split-view class="pane-root" direction="horizontal" a-init="20%">
        <template #A>
            <split-view direction="vertical">
                <template #A>
                    <View2D v-if="hasProject"></View2D>
                </template>
                <template #B>
                    <View3D v-if="hasProject"></View3D>
                </template>
            </split-view>
        </template>

        <template #B>
            <split-view direction="horizontal" a-init="75%">
                <template #A>
                    <EditorView v-if="hasProject" ref="editorView" :isNewProject="isNewProject"></EditorView>
                </template>
                <template #B>
                    <split-view direction="vertical">
                        <template #A>
                            PropertyView
                            <PropertyView v-if="hasProject"></PropertyView>
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
// electron related
import { ipcRenderer } from "electron";

const editorView = ref(null);

const hasProject = ref(false);
const isNewProject = ref(false);

// 处理menu指令
ipcRenderer.on(MenuCommands.FileOpen, () => {
    hasProject.value = false;
    nextTick(() => {
        const project = ProjectManager.open();
        hasProject.value = true;
        ProjectManager.setWindowTitle(project.name);
    });
})

ipcRenderer.on(MenuCommands.FileNew, () => {
    hasProject.value = false;
    nextTick(() => {
        const project = ProjectManager.new();
        hasProject.value = true;
        isNewProject.value = true;
        ProjectManager.setWindowTitle(project.name);
    });
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
