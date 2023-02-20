<template>
    <div id="imageDiv">
        <!-- <canvas class="nodeCanvas" id="ownCanvas"></canvas> -->
        <!-- <canvas class="nodeCanvas" id="libCanvas"></canvas> -->
    </div>
    <div>
        <canvas class="hideCanvas" id="mycanvas"></canvas>
    </div>

    
</template>

<script setup>
import { onMounted } from 'vue';
import {Node,copyFromCanvas,drawCanvas,drawFbo,loadImage} from '@/lib/node/Node';
import {ColorNode,PatternNode,SimplexNoiseNode} from '@/lib/node/generatorNode';
import {BlendNode} from '@/lib/node/filterNode';
import {Connection} from '@/lib/node/connection';

onMounted(() => {
    // const canvas = document.getElementById("nodeCanvas");
    // const ctx = canvas.getContext("2d");
    // const nodeCanvas = document.getElementById("mycanvas");
    // if(nodeCanvas){
    //     console.log("mycanvas is exist");
    // }

    
    // const noiseNode = new SimplexNoiseNode();
    // noiseNode.initCanvas();


    // const colorA = new ColorNode();
    // colorA.initCanvas();

    // noiseNode.drawScene();
    // const pattern = new PatternNode();
    // loadImage(pattern);
    
    // setTimeout(() => {
    //     copyFromCanvas(pattern.canvas,canvas,pattern.size);
    // }, 800);

    // ctx.fillStyle = "red";
    // ctx.fillRect(0, 0, 100, 100);
    
    // const blend = new BlendNode();
    // console.log(blend);
    // blend.initCanvas();
    // const connection = new Connection("con01",[colorA,noiseNode],blend);
    

    // setTimeout(() => {
    //     blend.drawScene();
    // }, 2000);




})
</script>

<style>
.showCanvas{
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
.hideImage{
    width: 128px;
    height: 128px;
    display: none;
    visibility: hidden;
}
</style>