
import { defineStore } from "pinia";
import { NodeScene } from "@/lib/scene/nodescene";
import { ColorNode } from "@/lib/node/generator-node";
import { Node } from "@/lib/node/shader-node";
import { Property } from "@/lib/node/node-property";
import { EnumProperty } from "@/lib/node/node-property";
import { toRaw } from "vue";
import { SocketScene } from "@/lib/scene/socketscene";
import {GeneratorNodeScene} from "@/lib/scene/generatornodescene";
export const useMainStore = defineStore('main', {
    state: () => {
        return {
            focusedNode: null,
            colornode: null,
            property: [],
            change:true
        }
    },
    getters: {},
    actions: {
        displayNodeOnComponents(node: GeneratorNodeScene) {//editor中选中node，展示在2d视图
            this.focusedNode = node;
            // this.colornode = node;
            this.property=node.node.properties;
            this.change=!this.change;
            console.log("color node");
            console.log(node);
        },
        changeProperties(name: String, newValue: any) {//供properties component调用用来修改property的值
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
        },
    }
}
);
