<template>
	<div style="height:100%">
		2DView
		<div style="height:2em;">
			<button v-on:click="saveImage">保存</button>
			<button v-on:click="resetImage">复位</button>
		</div>
		<canvas id="_view2d" ref="myCanvas" style="display:block;"></canvas>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, defineExpose, computed } from 'vue';
import { CanvasMonitor2D } from '@/lib/canvas2d';
import { Editor } from '@/lib/editor';
import { useMainStore } from '@/store';
import { storeToRefs } from 'pinia';
const electron = require("electron");
const remote = require("@electron/remote");
const { dialog, app, BrowserWindow, Menu } = remote;

const myCanvas = ref<HTMLCanvasElement | null>(null);
const canvasMonitor = ref<CanvasMonitor2D | null>(null);
const hasImage = computed(() => { return canvasMonitor.value && canvasMonitor.value.image != null });
const mainStore = useMainStore();
const { focusedNode, colornode } = storeToRefs(mainStore);
const focused = computed(() => { return focusedNode.value; })

onMounted(() => {

	canvasMonitor.value = new CanvasMonitor2D(myCanvas.value);
	canvasMonitor.value.setSize(512, 512);
	//在类外加入鼠标事件监听器
	myCanvas.value.addEventListener('mouseover', onMouseOver);
	myCanvas.value.addEventListener('mouseleave', onMouseLeave);
	myCanvas.value.addEventListener('mousemove', onMouseMove);
	myCanvas.value.addEventListener('wheel', onWheel);


	const img = new Image();
	img.src = "https://pic2.zhimg.com/v2-3f3533b2e479e2a17cc96654024a8b41_r.jpg";
	canvasMonitor.value.setImage(img);

	const draw = () => {
		canvasMonitor.value.draw(focused.value);
		requestAnimationFrame(draw);
	};
	requestAnimationFrame(draw);
})

onBeforeUnmount(() => {
	myCanvas.value.removeEventListener('mouseover', onMouseOver);
	myCanvas.value.removeEventListener('mouseleave', onMouseLeave);
	myCanvas.value.removeEventListener('mousemove', onMouseMove);
	myCanvas.value.removeEventListener('wheel', onWheel);
})

const onMouseMove = (event: MouseEvent) => {
	// let rect = myCanvas.value.getBoundingClientRect();
	// canvasMonitor.value.setMousePos(event.clientX - rect.left, event.clientY - rect.top);
};

const onMouseOver = (event: MouseEvent) => {
	// canvasMonitor.value.focus = true;
	// console.log(canvasMonitor.value.focus);
};

const onMouseLeave = (event: MouseEvent) => {
	// canvasMonitor.value.focus = false;
	// console.log(canvasMonitor.value.focus);
};

const onWheel = (event: WheelEvent) => {

	let pos = canvasMonitor.value.getMousePos(event);
	// console.log(event.deltaY);
	let factor = event.deltaY < 0 ? 1.1 : 0.9;
	canvasMonitor.value.zoom(factor, pos);
	event.preventDefault();
};

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

const resetImage = () => {//图片复位
	canvasMonitor.value.resetImage();
}

defineExpose({
	canvasMonitor
})

</script>