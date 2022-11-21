
import { defineStore } from "pinia";
import { colorNode } from "@/lib/node/simpleNode";
import Node from "element-plus/es/components/cascader-panel/src/node";
// import { NodeGraph } from "@/lib/nodegraph"
import {Property} from "@/lib/node/NodeProperty";
export const useMainStore = defineStore('main', {
    state: () => {
        return {
            focusedNode: null,
            colornode:Node
        }
    },
    getters: {},
    actions: {
        displayNodeOnComponents (data:Uint8Array,node:Node){//editor中选中node，展示在2d视图
            this.focusedNode = data;
            this.colornode=node;
            console.log("color node");
            console.log(this.colornode);
            // console.log(state.focusedNode);
        }
    }
}
);
