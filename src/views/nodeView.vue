<template>
    <div id="imageDiv">
        <canvas class="nodeCanvas" id="nodeCanvas"></canvas>
    </div>
    
</template>

<script setup>
import { onMounted } from 'vue';
import {Node,copyFromCanvas,drawCanvas,drawFbo,loadImage} from '@/lib/node/Node';
import {ColorNode,PatternNode} from '@/lib/node/generatorNode';
onMounted(() => {
    const canvas = document.getElementById("nodeCanvas");
    const ctx = canvas.getContext("2d");

    const pattern = new PatternNode();
    loadImage(pattern);
    setTimeout(() => {
        copyFromCanvas(pattern.canvas,canvas,pattern.size);
    }, 2000);

    // const colorA = new ColorNode();
    // drawCanvas(colorA);
    // copyFromCanvas(colorA.canvas,canvas,colorA.size);
    
    // ctx.fillStyle = "red";
    // ctx.fillRect(0, 0, 100, 100);
    


    console.log("canvas size");
    console.log(canvas.width);
    console.log(canvas.height);
    console.log("canvas client size");
    console.log(canvas.clientWidth);
    console.log(canvas.clientHeight);
    
})
</script>

<style>
.nodeCanvas{
    width: 256px;
    height: 256px;
    background: #ffffff
}
</style>