<template>
	<div class="library-container">
		LibraryView
		<div class style="padding-bottom:1em; display:flex; margin:0.5em;">
			<div class="search-container">
				<input type="search-input" />
			</div>
		</div>
		<!-- 节点类型分类展示对应节点 -->
		<div class="group-list" style="overflow:hidden;">
			<ul v-for="(name, index) in categoryNames" :key="index">
				<div class="group-name" @click="toggle(index)">
					<h4>{{ name }}</h4>
				</div>
				<div id="group-items">
					<span
						v-for="item in itemGroup(index)"
						:key="item.name"
						@dragstart="onDragStart($event, item)"
						class="cardview"
						href="#"
						draggable="true"
					>
						<!-- 节点缩略图 -->
						<img
							v-if="itemImageExists(item.name)"
							:src="calcImagePath(item.name)"
							class="thumbnail no-drag"
						/>
						<div v-else class="thumbnail" />
						<!-- 节点名称 -->
						<div class="item-name">{{ item.name }}</div>
					</span>				
				</div>
			</ul>
			<!-- 
			<button v-on:click="createNewItem()">创建新Item</button>
			<button v-on:click="addImageNode()">添加图片</button> 
			-->
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, onBeforeMount } from 'vue';
import { Library, LibraryItemInfo, LibraryItemType } from '@/lib/library';
import path from 'path';
import fs from 'fs';
const remote = require("@electron/remote");
const { dialog } = remote;

const searchInput = ref<Text>(null);
const libraryItems = ref(null);

const categoryNames = ref(["Utils", "Atomic Nodes", "Functions", "Generators", "Filters", "3D View"]);

const library = new Library();
const creators = [library.util, library.atom, library.function, library.generator, library.filter, library.view3d];

const itemGroup = (index: number): LibraryItemInfo[] => {
	const items = Object.values(creators[index]).map(creator => {
		return new LibraryItemInfo(LibraryItemType.Node, creator.name);
	})

	return items;
}

// items列表展开收起
const toggle = (index: number) => {
	const groupItems = <HTMLDivElement>document.querySelector("#group-items")[index];
	const spanChilds = groupItems.children;
	for (const child of spanChilds) {
		const span = <HTMLSpanElement>child;
		if (span.style.display == "none")
			span.style.display = "block";
		else
			span.style.display = "none";
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

const onDragStart = (event: DragEvent, data: LibraryItemInfo) => {
	console.log("LibraryView.vue --- drag data: " + data);
	event.dataTransfer.setData("text/plain", JSON.stringify(data));
};

// 检查缩略图是否存在
const itemImageExists = (name: string) => {
	console.log("LibraryView.vue --- thumbnail path: " + path.join(__dirname, `assets/thumbnails/${name}.png`));
	return fs.existsSync(path.join(__dirname, `assets/thumbnails/${name}.png`));
}

// 根据物品(节点、注释、框区)名称获取缩略图路径
const calcImagePath = (name: string) => {
	console.log("LibraryView.vue --- process.env.BASE_URL: " + process.env.BASE_URL);
	if (process.env.NODE_ENV == "production")
		return ("file://" + path.join(process.env.BASE_URL, `assets/thumbnails/${name}.png`));
	return path.join(process.env.BASE_URL, `assets/thumbnails/${name}.png`);
}


</script>

<style scoped>
.cardview {
	width: 100px;
	display: block;
	float: left;
	padding: 8px;
	cursor: pointer;
	border-radius: 4px;
}
.cardview:hover {
	background: rgb(0, 0, 0, 0.3);
}
.thumbnail {
	display: block;
	width: 100px;
	height: 100px;
	background: #ccc;
	border-radius: 4px;
	margin-left: -4px;
	border: solid rgba(0, 0, 0, 0.7) 4px;
}
.item-name {
	height: 2.6em;
	line-height: 1.3em;
	padding: 0;
	margin: 0;
	color: white;
	text-decoration: none;
}
.group-name h4 {
	height: 10px;
	font-size: 18px;
	color: #333;
	display: flex;
	align-items: stretch;
	float: left;
	margin-left: 10px;
}
.group-list {
	overflow-y: scroll;
	flex: 1 1 auto;
	font-size: 12px;
	font-weight: bold;
}
.search-container {
	flex-grow: 1;
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