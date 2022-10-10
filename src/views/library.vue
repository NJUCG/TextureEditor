<template>
	<div class="library-container">
        <div class style="padding-bottom:1em; display:flex;margin:0.5em;">
			<div class="search-container">
				<input type="text" />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: "LibraryView",
  components: {
    // HelloWorld,
    // EditorView
  },
})
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