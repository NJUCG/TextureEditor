<template>
	<div ref="containerEditor" class="full-view">
		<canvas 
			ref="canvas"
			style="height: 100%; display: block;"
		>
		</canvas>
	</div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineExpose, onMounted, onBeforeUnmount } from 'vue';
import { Editor } from "@/lib/editor";
import { Designer } from '@/lib/designer';
import { Library, LibraryItemType } from '@/lib/library';

const props = defineProps<{ designer: Designer, library: Library }>();

const containerEditor = ref<HTMLDivElement | null>(null);
const editorResizeObserver = new ResizeObserver(resize);
const canvas = ref<HTMLCanvasElement | null>(null);
const designer = props.designer;
const library = props.library;
const editor = new Editor();

const setupInitialScene = () => {
	editor.setupInitialScene();
}

defineExpose({ setupInitialScene });

onBeforeUnmount(() => {
	canvas.value.removeEventListener("drop", onDrop);
	canvas.value.removeEventListener("dragover", onDragOver);
	canvas.value.removeEventListener("click", onClick);
})

onMounted(() => {
	editor.init(canvas.value, library, designer);
	editorResizeObserver.observe(containerEditor.value!);
	canvas.value.addEventListener("drop", onDrop);
	canvas.value.addEventListener("dragover", onDragOver);
	canvas.value.addEventListener("click", onClick);

	const draw = () => {
		editor.update();
    	editor.draw();
    	requestAnimationFrame(draw);
  	};

  	requestAnimationFrame(draw);
})

const onDrop = (evt: DragEvent) => {
	// console.log("editorView.vue: editor handling onDrop event.");
	evt.preventDefault();

	const item = JSON.parse(evt.dataTransfer.getData('text/plain'));
	// console.log(item);
	const rect = canvas.value.getBoundingClientRect();
	const itemCenter = { x: evt.clientX - rect.left, y: evt.clientY - rect.top };

	switch (item.type) {
		case LibraryItemType.Node:
			const node = library.createNode(item.name, item.nodeType, editor.designer);
			editor.addNode(node, itemCenter.x, itemCenter.y);
			break;
		case LibraryItemType.Comment:
			break;
		case LibraryItemType.Frame:
			break;
		default:
			console.log("editorView.vue: drop item type is invalid!");
	}
}

const onDragOver = (evt: DragEvent) => {
	evt.preventDefault();
	// console.log("onDragOver");
	// console.log(library.value.generators);
}

const onClick = (evt: Event) => {
	// console.log("click happens!");
}

function resize() {
	// console.log("EditorView.vue: resize called!");
	// set the internal size to match
	canvas.value.width = canvas.value.clientWidth;
	canvas.value.height = canvas.value.clientHeight;
}

</script>

<style scoped>

.full-view {
	position: relative;
	height: 100%;
	overflow: hidden;
}

</style>