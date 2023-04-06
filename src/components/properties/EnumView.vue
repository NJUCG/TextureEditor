<template>
    <div class="field">
        <label>{{ property.displayName }}</label>
        <el-select v-model="enumValue" class="m-2" placeholder="None" @change="updateEnumProperty">
            <el-option
                v-for="(name, index) in enumList"
                :key="index"
                :value="name"
            />
        </el-select>
    </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from "vue";
import { EnumProperty } from "@/lib/node/node-property";
import { useMainStore } from "@/store";

const props = defineProps<{ prop: EnumProperty }>();
const property = props.prop;
const enumList = ref(property.getValues());
const enumValue = ref(property.getValueName());

const store = useMainStore();

const updateEnumProperty = (value: string) => {
    enumValue.value = value;
    store.updatePropertyByName(property.name, enumList.value.indexOf(value));
    console.log("EnumView.vue: update enum property: ", value);
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

.enum {
  outline: 0;
  box-shadow: none;
  border: 0 !important;

  margin-top: 0.4em;
  width: 100%;
  border: none;
  border-radius: 4px;
  color: white;
  background: #222;
  padding: 0.5em;
  font-family: Arial;
}
</style>
