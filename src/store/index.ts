
import { defineStore } from "pinia";
// import { NodeGraph } from "@/lib/nodegraph"
import {Property} from "@/lib/node/NodeProperty";
export const useMainStore = defineStore('main', {
    state: () => {
        return {
            focusedNode: null,
        }
    },
    getters: {},
    actions: {
        displayNodeOnComponents (data:Uint8Array){//editor中选中node，展示在2d视图
            this.focusedNode = data;
            // console.log(state.focusedNode);
        }
    }
}
);
