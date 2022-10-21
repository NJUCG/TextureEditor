<template>
	<div style="height:100%">
		<div style="height:2em;">
			<button v-on:click="saveImage">保存</button>
		</div>
		<canvas id="_view2d" ref="myCanvas" style="display:block;"></canvas>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, defineExpose, computed } from 'vue';
import { CanvasMonitor2D } from '@/lib/canvas2d';
import { Editor } from '@/lib/editor';
const electron = require("electron");
const remote = require("@electron/remote");
const { dialog, app, BrowserWindow, Menu } = remote;

const image = ref(0);
const myCanvas = ref<HTMLCanvasElement | null>(null);
const canvasMonitor = ref<CanvasMonitor2D | null>(null);
const hasImage = computed(() => { return canvasMonitor.value && canvasMonitor.value.image != null });

onMounted(() => {

	canvasMonitor.value = new CanvasMonitor(myCanvas.value);
	//在类外加入鼠标事件监听器
	myCanvas.value.addEventListener('mousemove', onMouseMove);

	const img = new Image();
	img.src = "https://pic2.zhimg.com/v2-3f3533b2e479e2a17cc96654024a8b41_r.jpg";
	canvasMonitor.value.setImage(img);

	const draw = () => {
		canvasMonitor.value.draw();
		requestAnimationFrame(draw);
	};
	requestAnimationFrame(draw);
})

onBeforeUnmount(() => {
	myCanvas.value.removeEventListener('mousemove', onMouseMove);
})

const onMouseMove = (event: MouseEvent) => {
	let rect = myCanvas.value.getBoundingClientRect();
	canvasMonitor.value.setMousePos(event.clientX - rect.left, event.clientY - rect.top);
};

const setEditor = (editor) => {
	//只需关联editor事件
}


const saveImage = () => {
	if (!hasImage.value) return;

	let img = canvasMonitor.value.image;
	let cavs = document.createElement("canvas");
	cavs.width = img.width;
	cavs.height = img.height;
	let context = cavs.getContext("2d");
	context.drawImage(img, 0, 0, img.width, img.height);

	let image = cavs.toDataURL();

	// create temporary link  
	let tmpLink = document.createElement('a');
	tmpLink.download = 'image.png'; // set the name of the download file 
	tmpLink.href = image;

	// temporarily add link to body and initiate the download  
	document.body.appendChild(tmpLink);
	tmpLink.click();
	document.body.removeChild(tmpLink);

}



defineExpose({
	canvasMonitor
})

const setEditor = (editor) => {
	//只需关联editor事件
}


const saveImage = () => {
	if (!hasImage.value) return;

	let img = canvasMonitor.value.image;
	let cavs = document.createElement("canvas");
	cavs.width = img.width;
	cavs.height = img.height;
	let context = cavs.getContext("2d");
	context.drawImage(img, 0, 0, img.width, img.height);

	let image = cavs.toDataURL();

	// create temporary link  
	let tmpLink = document.createElement('a');
	tmpLink.download = 'image.png'; // set the name of the download file 
	tmpLink.href = image;

	// temporarily add link to body and initiate the download  
	document.body.appendChild(tmpLink);
	tmpLink.click();
	document.body.removeChild(tmpLink);

}



defineExpose({
	canvasMonitor
})

</script>