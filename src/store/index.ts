
import { defineStore } from "pinia";
// import { NodeGraph } from "@/lib/nodegraph"

export const useMainStore = defineStore('main', {
    state: () => {
        return {
            focusedNode: null
        }
    },
    getters: {},
    actions: {
        displayNodeOnComponents (focusedNode){//editor中选中node，展示在2d视图
            this.focusedNode = focusedNode;
            // console.log(state.focusedNode);
        }
    }
}
);