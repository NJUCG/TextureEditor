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
	//在类外加入鼠标事件监听器
	myCanvas.value.addEventListener('mousemove',function(e){
		var rect=myCanvas.value.getBoundingClientRect();
		canvasMonitor.setMousePos(e.clientX - rect.left, e.clientY - rect.top);

	})
	
	// canvasMonitor.setImage(img1);
	
	const draw = () => {
		canvasMonitor.draw();
		requestAnimationFrame(draw);
	};
	requestAnimationFrame(draw);
})

</script>