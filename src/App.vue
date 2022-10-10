<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <editor-view ref= "EditorView"/>
  <library-view ref= "LibraryView"/>
  <view-2D ref= "View2D"/>
  <view-3D ref= "View3D"/>
  <property-view ref= "PropertyView"/>
  <!-- <hello-world msg="Welcome to Your Vue.js + TypeScript App" ref="HelloWorld"/> -->
</template>

<script lang="ts">
import { defineComponent } from 'vue';
// import HelloWorld from '@/components/HelloWorld.vue';
import EditorView from "@/views/editor.vue";
import LibraryView from "@/views/library.vue";
import View2D from "@/views/view2D.vue";
import View3D from "@/views/view3D.vue";
import PropertyView from "@/views/property.vue";
// import { MenuCommands } from "./menu";

export default defineComponent({
  name: "App",
  components: {
    // HelloWorld,
    EditorView,
    LibraryView,
    View2D,
    View3D,
    PropertyView
  },
})
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
