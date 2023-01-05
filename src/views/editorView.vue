<template>
	<canvas id="editor-canvas" ref="canvas"></canvas>
</template>



<script setup lang="ts">
import { Editor } from "@/lib/editor";
import { ref, onMounted, defineProps, toRefs, onBeforeUnmount } from 'vue';
import { LibraryMonitor } from '@/lib/library';

const canvas = ref<HTMLCanvasElement | null>(null);
let editor:Editor = null;
let mousePos = [];
// let library = null;
const props = defineProps({
	library: {
		type: [LibraryMonitor, null],
	}
});
const { library } = toRefs(props);

onMounted(() => {
	
	editor = new Editor(canvas.value);

	canvas.value.addEventListener("drop", onDrop);
	canvas.value.addEventListener("dragover", onDragOver);

	const draw = () => {
    	editor.draw();//通过editor逐层重绘
    	requestAnimationFrame(draw);
  	};
  	requestAnimationFrame(draw);
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
	if (type == "generators") {
		const libNode = library.value.generators[name];
		const newNode = Object.create(libNode.node);
		console.log(newNode);
		editor.addNode(newNode, evt.clientX, evt.clientY);
		// let rect = canvas.value.getBoundingClientRect();
		// let pos = [evt.clientX - rect.left, evt.clientY - rect.top];
		// console.log(rect);
		// console.log(pos);
	}

}

const onDragOver = (evt: DragEvent) => {

	evt.preventDefault();
	console.log("onDragOver");
	// console.log(library.value.generators);
}



</script>

<style>
/* #editor-canvas {
	height: 100%;
	width: 100%;
} */
</style>