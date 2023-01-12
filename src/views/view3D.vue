<template>
	<div class="full-view">
		<div>
			<!-- setting button -->
		</div>
		<div class="flex-view">
			<canvas ref="preview3d" style="display: block;"></canvas>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { View3D } from "@/lib/canvas3d";
import { nextTick } from "process";

const preview3d = ref<HTMLCanvasElement | null>(null);
const showMenu = ref(false);
const view3d = new View3D();

onMounted(() => {
	view3d.setCanvas(preview3d.value!);
	window.addEventListener("resize", () => {
		nextTick(resize);
	});
});

function resize() {
	fitCanvasToContainer(preview3d.value!, showMenu.value);
	if (view3d)
		view3d.resize(preview3d.value!.width, preview3d.value!.height);
}

// 动态调整Canvas大小: https://stackoverflow.com/questions/10214873/make-canvas-as-wide-and-as-high-as-parent
function fitCanvasToContainer(canvas: HTMLCanvasElement, showMenu: boolean) {
	// Make it visually fill the positioned parent
	if (showMenu) 
		canvas.style.width = "60%";
	else 
		canvas.style.width = "100%";
	canvas.style.height = "100%";
	// ...then set the internal size to match
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
}

</script>

<style>

.full-view {
	display: relative;
	height: 100%;
	overflow: hidden;
}

.flex-view {
	display: flex;
	flex-direction: row;
	height: 100%;
}

</style>