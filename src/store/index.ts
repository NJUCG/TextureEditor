
import { defineStore } from "pinia";
import { NodeScene } from "@/lib/scene/nodescene";
import { ColorNode } from "@/lib/node/generatorNode";
import { Node } from "@/lib/node/Node";
import { Property } from "@/lib/node/NodeProperty";
import {EnumProperty} from "@/lib/node/NodeProperty";
import {toRaw} from "vue";
export const useMainStore = defineStore('main', {
    state: () => {
        return {
            focusedNode: null,
            colornode:null,
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
            console.log(node);
        },
        changeProperties(name:String,newValue:any){//供properties component调用用来修改property的值
            //遍历整个properties数组，找出需要修改的那一个property（通过name属性）
            for(let property of toRaw(this.colornode).properties){

                if(property.name==name){
                    if(property.values){
                        property.index=newValue;
                    }
                    else{
                    property.value=newValue;
                    console.log("已经在store内修改");}
                }


            }
            console.log(this.colornode);


        },
    }
}
);
