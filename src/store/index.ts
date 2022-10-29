import { createStore, Store } from 'vuex'
import { InjectionKey } from 'vue'
import { NodeGraph } from "@/lib/nodegraph"
// import { state } from './graph/state'

export const key: InjectionKey<Store<state>> = Symbol('key');

// export type state  = {
//     nodeGraph: null,
//     focusedNode: null
// }


export type state = {
    nodeGraph: NodeGraph,//整张节点图
    focusedNode: HTMLCanvasElement//被选中的节点，在2d视图和property视图显示
}
export default createStore({
    state: {
        nodeGraph: null,
        focusedNode: null
    },
    mutations: {
        displayNodeOnComponents:(state, focusedNode)=>{//editor中选中node，展示在2d视图
            state.focusedNode = focusedNode;
            // console.log(state.focusedNode);
        }
    }
})