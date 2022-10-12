<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <EditorView />
  <LibraryView />
  <View2D width="30" height="40"/>
  <View3D />
  <PropertyView />
  <ExplorerView />
  <!-- <hello-world msg="Welcome to Your Vue.js + TypeScript App" ref="HelloWorld"/> -->
</template>

<script setup lang="ts">
// import { defineComponent, onMounted } from 'vue';
// import HelloWorld from '@/components/HelloWorld.vue';
import EditorView from "@/views/editor.vue";
import LibraryView from "@/views/library.vue";
import View2D from "@/views/view2D.vue"; 
import View3D from "@/views/view3D.vue";
import PropertyView from "@/views/property.vue";
import ExplorerView from "@/views/explorer.vue";
import { MenuCommands } from "./menu";
const { ipcRenderer } = require('electron')


// 处理menu指令
ipcRenderer.on(MenuCommands.FileOpen, ()=>{
  console.log(111);
  openProject();
})

const openProject = () =>{
  
};

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
</style>
