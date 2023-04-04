import { defineStore } from "pinia";
import { ref } from "vue";
import { Project } from "@/lib/project";
import { BaseNode } from "@/lib/node/base-node";
import { TextureCanvas } from "@/lib/utils/texture-canvas";
import { MappingChannel } from "@/lib/canvas3d";

export const useMainStore = defineStore('main', () => {
    const focusedNode = ref<BaseNode>(null);
    const mappingTexture = ref<TextureCanvas>(null);
    const mappingChannel = ref<MappingChannel>(null);

    function updateFocusedNode(node: BaseNode) {
        focusedNode.value = node;
    }

    function updateMappingChannel(texCanvas: TextureCanvas, channel: MappingChannel) {
        mappingTexture.value = texCanvas;
        mappingChannel.value = channel;
    }

    function updatePropertyByName(name: string, newValue: any) {
        focusedNode.value.setProperty(name, newValue);
    }

    return {
        focusedNode,
        mappingTexture,
        mappingChannel,

        updateFocusedNode,
        updateMappingChannel,
        updatePropertyByName,
    };
}
);
