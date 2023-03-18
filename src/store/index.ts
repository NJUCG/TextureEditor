import { BaseNode } from "@/lib/node/base-node";
import { defineStore } from "pinia";
import { ref, toRaw } from "vue";
import { TextureCanvas } from "@/lib/utils/texture-canvas";
import { MappingChannel } from "@/lib/canvas3d";
import { View3D } from "@/lib/canvas3d";

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

    function changeProperties(name: String, newValue: any) {//供properties component调用用来修改property的值
        //遍历整个properties数组，找出需要修改的那一个property（通过name属性）
        for (let property of toRaw(this.focusedNode).node.properties) {

            if (property.name == name) {
                if (property.values) {
                    property.index = newValue;
                }
                else {
                    property.value = newValue;
                    console.log("已经在store内修改");
                }
            }
        }

        console.log(this.property);
    }

    return {
        focusedNode,
        mappingTexture,
        mappingChannel,

        updateFocusedNode,
        updateMappingChannel,
        changeProperties,
    };
}
);
