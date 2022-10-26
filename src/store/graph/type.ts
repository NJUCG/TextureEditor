import { NodeGraph } from "@/lib/nodegraph"

export interface GraphState {
    nodeGraph: NodeGraph,//整张节点图
    focusedNode: string//被选中的节点，在2d视图和property视图显示
}