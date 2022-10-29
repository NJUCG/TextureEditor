

export const mutations={
    displayNodeOnComponents:(state, focusedNode)=>{//editor中选中node，展示在2d视图
        state.focusedNode = focusedNode;
    }
}