<template>
	<div style="height:100%">
		<div style="height:2em;">
		</div>
		<canvas id="_view2d" ref="myCanvas" style="display:block;"></canvas>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { CanvasMonitor } from '@/lib/canvas2d';
// import img1 from '../assets/1.jpg';

const image = ref(0);
const myCanvas = ref<HTMLCanvasElement>();

onMounted(() => {
	let canvasMonitor = new CanvasMonitor(myCanvas.value);
	// canvasMonitor.setImage(img1);
	
	const draw = () => {
		canvasMonitor.draw();
		requestAnimationFrame(draw);
	};
	requestAnimationFrame(draw);
})

</script>