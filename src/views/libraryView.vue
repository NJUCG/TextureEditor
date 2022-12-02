<template>
	<div class="library-container">
		LibraryView
		<div class style="padding-bottom:1em; display:flex;margin:0.5em;">
			<div class="search-container">
				<input type="search-input" />
			</div>
		</div>
		<div class="node-list" id="nodeList">
			<div class="node-items" v-for='(item, index) in LibraryItemType' :key="index">
				<div class="items-name" v-on:click="showHide(index)">
					<h4>{{ item }}</h4>
				</div>
				<div class="items">
					<ul>
						<!-- <li v-for='item of library[index]'>
							{{loadImgFromNode(item.name)}}
							<div class="node-name">{{ item.name }}</div>
						</li> -->
					</ul>
				</div>
			</div>

			<button v-on:click="createNewItem()">创建新Item</button>
			<button v-on:click="addImageNode()">添加图片</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { LibraryMonitor } from '@/lib/library';
import { it } from 'node:test';
const remote = require("@electron/remote");
const { dialog } = remote;

const searchInput = ref<Text>(null);
const libraryItems = ref(null);

// const LibraryItemType = {
// 	Utils: "utils",//comment frame pin...
// 	AtomicNodes: "atomicnodes",//自定义原子节点
// 	FunctionNodes: "functionnodes",//函数节点
// 	Generators: "generators",
// 	Filters: "filters",
//     View3D: "view3d"
// }

const LibraryItemType = ["utils", "atomicnodes", "functionnodes", "generators", "filters", "view3d"];

const libraryMonitor = new LibraryMonitor();
const library = [libraryMonitor.utils, libraryMonitor.atomicNodes, libraryMonitor.functionnodes, libraryMonitor.generators, libraryMonitor.filterNodes, libraryMonitor.view3D];

onMounted(() => {
	for (let i = 0; i < library.length; i++) {
		const locateLibrary = document.getElementById("nodeList");
		const itemsModule = locateLibrary.getElementsByClassName("items")[i];
		let ul = itemsModule.getElementsByTagName("ul")[0];
		
		// console.log(library);
		if (library[i]) {
			for (let index in library[i]) {
				let li: HTMLLIElement = document.createElement('li');
				//获取节点名称
				const nodeTitle: HTMLDivElement = document.createElement('div');
				nodeTitle.innerHTML = library[i][index].name;
				nodeTitle.className = "node-name";
				li.appendChild(nodeTitle);

				//append图片
				const img = new Image();
				const tmpCanvas = document.createElement("canvas")
				const tmpCtx = tmpCanvas.getContext("2d");
				tmpCtx.drawImage(library[i][index].node.canvas, 0, 0, 128, 128);
				img.src = tmpCanvas.toDataURL("image/png");
				// img.src = library[i][index].node.canvas.toDataURL("image/png");
				img.addEventListener("dragstart", function (evt: DragEvent) {
					console.log(library[i][index].node.type + ',' + library[i][index].node.id);
					evt.dataTransfer.setData("text/plain", library[i][index].node.type + ',' + library[i][index].node.id);
				});
				li.appendChild(img);
				// console.log(li.childNodes);

				ul.appendChild(li);
			}
		}
	}
})

onBeforeUnmount(() => {

})


defineExpose({libraryMonitor});

const showHide = (index) => {//items列表展开收起

	let contant = document.getElementsByClassName('items')[index];
	var oUl = contant.getElementsByTagName('ul')[0];
	if (oUl.style.display == 'none') {  //判断样式
		oUl.style.display = 'block';
		// oUl.style.height = '20px';

		//    oH2.className = 'up'; //给不同的css类
	}
	else {
		oUl.style.display = 'none';
		// oUl.style.height = '0px';
		//    oH2.className = 'down';
	}
}


const createNewItem = () => {//添加自定义文件夹，没有实现重命名h4、删除、添加子节点等功能
	//可能要建一个别的类来添加事件LibraryMonitor
	// library.push(new LibraryItem(items, ));

	let nodeList = document.getElementById("nodeList");
	let item = document.createElement("div");
	item.className = "node-items";
	let name = document.createElement("div");
	name.className = "items-name";
	let head = document.createElement("h4");
	head.innerHTML = "自定义";
	name.appendChild(head);
	item.appendChild(name);
	let pos = document.getElementsByTagName("button")[0];
	nodeList.insertBefore(item, pos);//自定义节点添加在button位置之前
	// nodeList.appendChild(item);
}


const addImageNode = () => {//添加图片节点
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

const dragstartNewNode = (evt: DragEvent) => {
	console.log("dragstartNewNode");
	evt.dataTransfer.setData("text/plain", this);
}

const loadImgFromNode = (nodeName: string) => {
	const canvas2: HTMLCanvasElement = document.createElement('canvas');
	canvas2.width = 512;
	canvas2.height = 512;
	const cavans2Ctx: CanvasRenderingContext2D = canvas2.getContext('2d');
}



</script>

<style>
.node-items {
	overflow: hidden;
}

.items-name {
	height: 10px;
	padding: 0 12px;
	border-bottom: 1px solid #eaeaea;
}

.items-name h4 {
	height: 10px;
	font-size: 18px;
	color: #333;
	display: flex;
	align-items: stretch;
	float: left;
	margin-left: 10px;
}

.items {
	background: rgb(34, 34, 34);
	transition: height 1s;
	/* height: 20px; */
}

.items ul li {
	padding: 0 12px;
	/* height: 10px; */
	display: inline;
	align-items: stretch;
}

.items ul li node-name {
	/* padding: 0 24px; */
	/* height: 10px; */
	display: block;
	align-items: stretch;
}

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