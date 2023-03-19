<template>
    <div class="field">
        <label>{{ prop.displayName }}</label>
        <el-input v-model="inputString" placeholder="" @change="updateStringProperty" />
    </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from "vue";
import { StringProperty } from "@/lib/node/node-property";
import { useMainStore } from "@/store";

const props = defineProps<{ prop: StringProperty }>();
const property = props.prop;
const inputString = ref(property.getValue());

const store = useMainStore();

const updateStringProperty = (value: string) => {
    store.updatePropertyByName(property.name, value);
    console.log("StringView.vue: update string property: ", value);
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

.number {
  width: calc(100% - 4px - 1px);
  border: solid gray 1px;
  padding: 2px;
  border-radius: 2px;
}

.input-holder {
  display: flex;
}
</style>
