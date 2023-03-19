<template>
	<div ref="container2d" class="full-view">
		2DView
		<div style="height:2em;">
			<button @click="save">保存</button>
			<button @click="reset">复位</button>
		</div>
		<canvas ref="preview2d" style="height: 100%; display: block;"></canvas>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { View2D } from '@/lib/canvas2d';
import { Designer } from '@/lib/designer';
import { useMainStore } from '@/store';

const props = defineProps<{ designer: Designer }>();
const designer = props.designer;

const container2d = ref<HTMLDivElement | null>(null);
const preview2d = ref<HTMLCanvasElement | null>(null);
const preview2dResizeObserver = new ResizeObserver(resize);
const view2d = new View2D();
const store = useMainStore();

// 监听pinia
store.$onAction(({ name, store, after }) => {
	after(result => {
		if (name == "updateFocusedNode" || name == "updatePropertyByName") {
			if (store.focusedNode == null)
				view2d.clearTextureCanvas();
			else
				view2d.updateTexureCanvas(store.focusedNode.targetTex);
		}
	})
})

onMounted(() => {
	view2d.init(preview2d.value!, designer);
	preview2dResizeObserver.observe(container2d.value!);

	const draw = () => {
		view2d.draw();
    	requestAnimationFrame(draw);
  	};

  	requestAnimationFrame(draw);
})

function resize() {
	fitCanvasToContainer(preview2d.value);
	view2d.resize();
}

function fitCanvasToContainer(canvas: HTMLCanvasElement) {
	// Make it visually fill the positioned parent
	canvas.style.width = "100%";
	// 1em is the size of the top bar
	canvas.style.height = "calc(100% - 2em)";
	// ...then set the internal size to match
	canvas.width = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;
	//canvas.height = canvas.offsetWidth;
	canvas.style.width = "auto";
	canvas.style.height = "auto";
}

function save() {

}

function reset() {
	view2d.reset();
}

</script>

<style scoped>

.full-view {
	position: relative;
	height: 100%;
	overflow: hidden;
}

.flex-view {
	display: flex;
	flex-direction: row;
	height: 100%;
}

</style>