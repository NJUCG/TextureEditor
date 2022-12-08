<template>
    <div id="imageDiv">
        <canvas class="nodeCanvas" id="nodeCanvas"></canvas>
    </div>
    <p>========================================================</p>
    <div>
        <canvas class="hideCanvas" id="mycanvas"></canvas>
    </div>
    
</template>

<script setup>
import { onMounted } from 'vue';
import {Node,copyFromCanvas,drawCanvas,drawFbo,loadImage} from '@/lib/node/Node';
import {ColorNode,PatternNode} from '@/lib/node/generatorNode';
import {BlendNode} from '@/lib/node/filterNode';
import {Connection} from '@/lib/node/connection';

onMounted(() => {
    const canvas = document.getElementById("nodeCanvas");
    const ctx = canvas.getContext("2d");
    if(document.getElementById("mycanvas")){
        console.log("mycanvas is exist");
    }


    console.log("color");
    const colorA = new ColorNode();
    drawCanvas(colorA);
    copyFromCanvas(colorA.canvas,canvas,colorA.size);
    

    console.log("pattern");
    const pattern = new PatternNode();
    loadImage(pattern);
    setTimeout(() => {
        copyFromCanvas(pattern.canvas,canvas,pattern.size);
    }, 1000);
    // ctx.fillStyle = "red";
    // ctx.fillRect(0, 0, 100, 100);
    
    // const blend = new BlendNode();
    // const connection = new Connection("con01",[colorA,pattern],blend);

    // setTimeout(() => {
    //     drawCanvas(blend);
    //     copyFromCanvas(blend.canvas,canvas,blend.size);
    // }, 2000);

    
})
</script>

<style>
.nodeCanvas{
    width: 256px;
    height: 256px;
    background: #ffffff;
    display: block
}
.hideCanvas{
    width: 128px;
    height: 128px;
    display: none;
    visibility: hidden;
}
</style>