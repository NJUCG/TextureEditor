<template>
    <div class="field">
    <div>
        <label>{{ property.displayName }}</label>
    </div>
    <el-color-picker
        v-model="colorValue"
        @active-change="updateColorProperty"
    >
    </el-color-picker>
    </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from "vue";
import { ColorProperty } from "@/lib/node/node-property";
import { useMainStore } from "@/store";

const props = defineProps<{ prop: ColorProperty }>();
const property = props.prop;
const colorValue = ref(property.getValue().toHex());

const store = useMainStore();

const updateColorProperty = (value: string) => {
    store.updatePropertyByName(property.name, value);
    console.log("ColorView.vue: update color property: ", value);
}

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


</style>
