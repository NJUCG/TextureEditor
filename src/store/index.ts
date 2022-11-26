
import { defineStore } from "pinia";
import { colorNode } from "@/lib/node/simpleNode";
import { Node } from "@/lib/node/Node";
import { Property } from "@/lib/node/NodeProperty";
export const useMainStore = defineStore('main', {
    state: () => {
        return {
            focusedNode: null,
            colornode: new Node(),
        }
    },
    getters: {},
    actions: {
        displayNodeOnComponents(data: Uint8Array, node: Node) {//editor中选中node，展示在2d视图
            this.focusedNode = data;
            this.colornode = node;
            console.log("color node");
            console.log(this.colornode);
            // console.log(state.focusedNode);
        }
    }
}
);
