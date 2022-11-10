<template>
  <div class="field">
    <div>
      <label>{{ prop.displayName }}</label>
    </div>
    <div class="input-holder">
      <canvas @click="loadImage()" width="150" height="150" ref="canvas" />
      <div class="image-buttons">
        <button class="image-button load-button" @click="loadImage()">
          load
        </button>
        <button class="image-button reload-button" @click="reloadImage()">
          reload
        </button>
        <button class="image-button remove-button" @click="removeImage()">
          remove
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

</script>

<style scoped>
.field {
  font-size: 12px;
  padding: 0.9em 0.5em;
  color: rgba(255, 255, 255, 0.7);
  border-bottom: 1px rgb(61, 61, 61) solid;
}

.field label {
  font-weight: bold;
  padding: 0.4em;
  padding-left: 0;
}

.texture-options {
  background: #e0e0e0;
  border-radius: 3px;
  margin-bottom: 1em !important;
  padding: 1em;
}

.input-holder {
  display: flex;
}

.image-buttons {
  display: flex;
  flex-direction: column;
  margin-left: 5px;
}

.image-button {
  width: 48px;
  height: 48px;
  margin: 1px;
  box-sizing: border-box;
  background: #222;
  border: none;
  color: white;
  padding: 0;
  cursor: pointer;
  border-radius: 4px;
}

.image-button:hover {
  background: rgb(88, 88, 88);
}
</style>
