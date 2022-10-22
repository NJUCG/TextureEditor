<template>
	<div class="library-container">
		<div class style="padding-bottom:1em; display:flex;margin:0.5em;">
			<div class="search-container">
				<input type="search-input" />
			</div>
		</div>
		<div class="node-list" id="nodeList">
			<button v-on:click="addNewItem()">添加新Item</button>
			<button v-on:click="addImageNode()">添加图片</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { LibraryItemType, LibraryMonitor } from '@/lib/library';
const remote = require("@electron/remote");
const { dialog } = remote;

const searchInput = ref<Text>(null);
onMounted(() => {
	var libraryMonitor = new LibraryMonitor();
})

onBeforeUnmount(() => {

})

function addNewItem() {//添加自定义文件夹
	let nodeList = document.getElementById("nodeList");
	let item = document.createElement("div");
	nodeList.appendChild(item);

}

function addImageNode() {//添加图片节点

	let paths = dialog.showOpenDialogSync(remote.getCurrentWindow(), {
		filters: [
			{
				name: "Images",
				extensions: ["jpg"]
			}
		],
		properties: ['multiSelections', 'openFile']
	});
	// console.log(paths);
	let nodeList = document.getElementById("nodeList");
	for (let path of paths) {
		let img = document.createElement("img");
		img.src = path;
		// console.log(path);
		nodeList.appendChild(img);
	}
}



</script>

<style>
.library-container {
	overflow: hidden;
	height: 100%;
	box-sizing: border-box;
	display: flex;
	flex-flow: column;
}

.search-container input {
	/* width: calc(100% - 2em); */
	width: calc(100% - 0.5em) !important;
	padding: 0.5em;
	height: 1.5em;
	flex: 0 1 auto;
	padding: 4px;
	margin: 0;
	border-radius: 3px;
	/* border: solid #999 1px; */
	border: 0;
	color: white;
	background: #999;
	outline: none;
}
</style>