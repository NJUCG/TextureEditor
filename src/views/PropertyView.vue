<template>
    <component
        v-for="(value, index) in propViews"
        :is="value.component"
        :prop="value.prop"
        :key="index"
    ></component>
</template>

<script setup lang="ts">
// all prop components
import BoolView from "@/components/properties/BoolView.vue";
import ColorView from "@/components/properties/ColorView.vue";
import EnumView from "@/components/properties/EnumView.vue";
import NumberView from "@/components/properties/NumberView.vue";
import StringView from "@/components/properties/StringView.vue";

import { ref, markRaw, onMounted } from "vue";
import { useMainStore } from '@/store/index';
import { Property } from "@/lib/node/node-property";

const propComponentMapping = [
    NumberView,
    NumberView,
    BoolView,
    ColorView,
    EnumView,
    StringView,
];

const store = useMainStore();
const propViews = ref([]);

// 监听pinia
store.$onAction(({ name, store, after }) => {
    after(result => {
        if (name == "updateFocusedNode") {
            if (store.focusedNode)
                updatePropertyView(store.focusedNode.properties);
        }
    })
});

onMounted(() => {
})

const updatePropertyView = (properties: Property[]) => {
    propViews.value = properties.map((prop) => {
        return {
            prop: prop,
            component: markRaw(propComponentMapping[prop.type])
        }
    });
}

</script>
