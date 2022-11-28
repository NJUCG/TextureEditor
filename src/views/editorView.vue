<template>
	<canvas id="editor-canvas" ref="editorCanvas"></canvas>
</template>



<script setup lang="ts">
import { Editor } from "@/lib/editor";
import { ref, onMounted, onBeforeUnmount } from 'vue';

const editorCanvas = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
	editorCanvas.value.addEventListener("drop", onDrop);
	editorCanvas.value.addEventListener("dragover", onDragOver);
})

const onDrop = (evt: DragEvent) => {

	evt.preventDefault();
	console.log("ondrop");

}

const onDragOver = (evt: DragEvent) => {

	evt.preventDefault();
	console.log("onDragOver");
}

</script>

<style>
#editor-canvas {
	height: 100%;
	width: auto;
}
</style>