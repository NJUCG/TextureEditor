<template>
    <div id="imageDiv">
        <canvas class="hideCanvas" id="nodeCanvas"></canvas>
    </div>
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
    // const canvas = document.getElementById("nodeCanvas");
    // const ctx = canvas.getContext("2d");
    // const nodeCanvas = document.getElementById("mycanvas");
    // if(nodeCanvas){
    //     console.log("mycanvas is exist");
    // }



    // console.log("color");
    // const colorA = new ColorNode();
    // drawCanvas(colorA);
    // copyFromCanvas(colorA.canvas,canvas,colorA.size);
    
    // const pattern = new PatternNode();
    // loadImage(pattern);
    
    // setTimeout(() => {
    //     copyFromCanvas(pattern.canvas,canvas,pattern.size);
    // }, 800);

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
    width: 512px;
    height: 512px;
    display: none;
    visibility: hidden;
}
</style>