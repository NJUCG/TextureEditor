<template>
	<canvas id="editor-canvas" ref="canvas"></canvas>
</template>



<script setup lang="ts">
import { Editor } from "@/lib/editor";
import { ref, onMounted, defineProps, toRefs, onBeforeUnmount } from 'vue';
import { LibraryMonitor } from '@/lib/library';

const canvas = ref<HTMLCanvasElement | null>(null);
const library = ref(null);
// const props = defineProps({
// 	library: LibraryMonitor,
// });
// const { library } = toRefs(props);

onMounted(() => {
	canvas.value.addEventListener("drop", onDrop);
	canvas.value.addEventListener("dragover", onDragOver);
})

onBeforeUnmount(() => {
	canvas.value.removeEventListener("drop", onDrop);
	canvas.value.removeEventListener("dragover", onDragOver);
})

const onDrop = (evt: DragEvent) => {

	evt.preventDefault();
	console.log("onDrag");
	console.log(library.value.generators);
	const [type, name] = evt.dataTransfer.getData('text/plain').split(',');
	if(type == "generators"){
		// const nodeColor = new colorNode();
	}
	
}

const onDragOver = (evt: DragEvent) => {

	evt.preventDefault();
	// console.log("onDragOver");
	// console.log(library.value.generators);
}

const setLibrary = (lib: LibraryMonitor)=>{
	library.value = lib;
}

defineExpose({setLibrary})

</script>

<style>
#editor-canvas {
	height: 100%;
	width: auto;
}
</style>