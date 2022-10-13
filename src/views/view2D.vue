<template>
	<div style="height:100%">
		<div style="height:2em;">
		</div>
		<canvas id="_view2d" ref="myCanvas" style="display:block;"></canvas>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { CanvasMonitor } from '@/lib/canvas2d';
// import img1 from '../assets/1.jpg';

const image = ref(0);
const myCanvas = ref<HTMLCanvasElement | null>(null);
const canvasMonitor = ref<CanvasMonitor | null>(null);

onMounted(() => {

	canvasMonitor.value = new CanvasMonitor(myCanvas.value);
	//在类外加入鼠标事件监听器
	myCanvas.value.addEventListener('mousemove', onMouseMove);

	// canvasMonitor.setImage(img1);

	const draw = () => {
		canvasMonitor.value.draw();
		requestAnimationFrame(draw);
	};
	requestAnimationFrame(draw);
})

onBeforeUnmount(() => {

})

const onMouseMove = (event: MouseEvent) => {
	let rect = myCanvas.value.getBoundingClientRect();
	canvasMonitor.value.setMousePos(event.clientX - rect.left, event.clientY - rect.top);
};

</script>