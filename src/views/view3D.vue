<template>
    <div style="height:100%">
        3dView
        <div style="height:2em;">
        </div>
        <canvas id="_view3d" ref="myCanvas" style="display:block;"></canvas>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { CanvasMonitor3D } from '@/lib/canvas3d';
const myCanvas = ref<HTMLCanvasElement | null>(null);
const canvasMonitor = ref<CanvasMonitor3D | null>(null);

onMounted(() => {
    canvasMonitor.value = new CanvasMonitor3D(myCanvas.value);
    //在类外加入鼠标事件监听器
    myCanvas.value.addEventListener('mouseover', onMouseOver);
    myCanvas.value.addEventListener('mouseleave', onMouseLeave);
	myCanvas.value.addEventListener('mousemove', onMouseMove);
	myCanvas.value.addEventListener('wheel', onWheel);

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
	canvasMonitor.value.focus = true;
};

const onMouseLeave = (event: MouseEvent) => {
	canvasMonitor.value.focus = false;
};

const onWheel = (event: WheelEvent) => {
    let factor = event.deltaY < 0 ? 1.1 : 0.9;
    canvasMonitor.value.zoom(factor);
};

</script>