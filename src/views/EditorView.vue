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
import { ref, onMounted, onBeforeUnmount, onUnmounted } from 'vue';
import { Editor } from "@/lib/editor";
import { Designer } from '@/lib/designer';
import { ProjectManager } from '@/lib/project';
import { ImageExportManager } from '@/lib/manager/exporter';
import { Library, LibraryItemType } from '@/lib/library';
import { MenuCommands } from '@/menu';

import { ipcRenderer } from 'electron';

const props = defineProps<{ isNewProject: boolean }>();
const isNewProject = props.isNewProject;

const containerEditor = ref<HTMLDivElement | null>(null);
const editorResizeObserver = new ResizeObserver(resize);
const canvas = ref<HTMLCanvasElement | null>(null);

const library = Library.getInstance();
const editor = Editor.getInstance();
const project = ProjectManager.getInstance();

onMounted(() => {
	editor.setCanvas(canvas.value);
	editorResizeObserver.observe(containerEditor.value!);
	canvas.value.addEventListener("drop", onDrop);
	canvas.value.addEventListener("dragover", onDragOver);
	canvas.value.addEventListener("click", onClick);

	ipcRenderer.on(MenuCommands.FileSave, () => {
		const data = editor.save();
		ProjectManager.save(data);
	});

	ipcRenderer.on(MenuCommands.FileSaveAs, () => {
		const data = editor.save();
		ProjectManager.save(data, true);
	});

	ipcRenderer.on(MenuCommands.ExportPng, () => {
		const exportManager = new ImageExportManager(project, editor);
		exportManager.exportTexturesToPng();
	});


	if (isNewProject)
		editor.setupInitialScene();

	const draw = () => {
		editor.update();
    	editor.draw();
    	requestAnimationFrame(draw);
  	};

  	requestAnimationFrame(draw);
})

onBeforeUnmount(() => {
	canvas.value.removeEventListener("drop", onDrop);
	canvas.value.removeEventListener("dragover", onDragOver);
	canvas.value.removeEventListener("click", onClick);
})

onUnmounted(() => {
	editor.clear();
	ProjectManager.clear();
	ipcRenderer.removeAllListeners(MenuCommands.FileSave);
	ipcRenderer.removeAllListeners(MenuCommands.FileSaveAs);
	ipcRenderer.removeAllListeners(MenuCommands.ExportPng);
});

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