
import { defineStore } from "pinia";
// import { ColorNode } from "@/lib/node/generatorNode";
import { Node } from "@/lib/node/Node";
import { Property } from "@/lib/node/NodeProperty";
import { NodeScene } from "@/lib/scene/nodescene";
export const useMainStore = defineStore('main', {
    state: () => {
        return {
            focusedNode: null,
            colornode: new Node(),
            property:[],
            // change:true
        }
    },
    getters: {},
    actions: {
        displayNodeOnComponents(node: NodeScene) {//editor中选中node，展示在2d视图
            this.focusedNode = node;
            // this.colornode = node;
            // this.property=node.properties;
            console.log("color node");
            console.log(this.colornode);
            // console.log(state.focusedNode);
        }
    }
}
);
