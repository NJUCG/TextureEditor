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
					<h4>{{item}}</h4>
				</div>
				<div class="items">
					<ul>
						111
						<!-- <li v-for='i in LibraryItemType' :key="i">
							node
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
var library = [];
const libraryMonitor = new LibraryMonitor();

onMounted(() => {
	
	// for(let items in LibraryItemType){
	// 	library.push(new LibraryItem(items, ));
	// }
	
	// for (let i = 0; i < Object.values(LibraryItemType).length; i++) {
	// 	let btn = document.getElementsByClassName("items")[i] as HTMLElement
	// 	btn.style.height = '0px';
	// }
})

onBeforeUnmount(() => {

})

const showHide = (index) => {//items列表展开收起

	let contant = document.getElementsByClassName('items')[index];
	var oUl = contant.getElementsByTagName('ul')[0];
	console.log(oUl.style.height);
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
	nodeList.insertBefore(item,pos);//自定义节点添加在button位置之前
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



</script>

<style>
.node-items {
	overflow: hidden;
}

.items-name {
	height: 20px;
	padding: 0 24px;
	border-bottom: 1px solid #eaeaea;
}

.items-name h4 {
	height: 20px;
	font-size: 28px;
	color: #333;
	display: flex;
	align-items: center;
	float: left;
	margin-left: 10px;
}

.items {
	background: #fff;
	transition: height 1s;
	height: 20px;
}

.items ul li {
	padding: 0 24px;
	height: 10px;
	display: flex;
	align-items: center;
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