import { BaseNode, NodeType } from "./node/base-node";
import { PortType } from "./node/port";
import { Connection } from "./node/connection";
import { Library } from '@/lib/library';
import { NodeGraph } from "./node-graph";
import { NodeView } from "./view/node-view";
import { ConnectionView } from "./view/connection-view";
import { Designer } from "./designer";
import { ImageCanvas } from "./utils/image-canvas";
import { useMainStore } from "@/store";

export enum MappingChannel {
    BaseColor,
    Roughness,
    Metallic,
    Albedo,
    Glossiness,
    Specular,
    AmbientOcclusion,
    Normal,
    Height,
}

export class Editor {
    public canvas: HTMLCanvasElement;

    public library: Library;
    public designer: Designer;
    public graph: NodeGraph;
    public selectedNode: BaseNode;
    public selectedConn: Connection;

    // <key: channel, value: node.uuid>
    private mappingNodes: Map<string, string>;

    // callbacks
    public onNodeSelected: (node: BaseNode) => void;

    public onConnectionSelected: (conn: Connection) => void;

    public onTextureMappingUpdated: (imageCanvas: ImageCanvas, channel: string) => void;

    constructor() {
        this.canvas = null;
        this.library = null;
        this.designer = null;
        this.graph = null;
        this.selectedNode = null;
        this.selectedConn = null;
        this.mappingNodes = null;
    }

    public init(canvas: HTMLCanvasElement, library: Library, designer: Designer) {
        this.canvas = canvas;
        this.library = library;
        this.designer = designer;
        this.mappingNodes = new Map<string, string>();
        this.setup();
    }

    public draw() {
        if(this.graph) 
            this.graph.draw();
    }

    public update() {
        if (this.designer)
            this.designer.update();
    }

    public setup() {
        this.clearAllTextureChannels();
        this.setupDesigner();
        this.setupScene();
        // this.setupDefaultScene();
    }

    public addNode(node: BaseNode, centerX: number = 0, centerY: number = 0) {
        console.log("editor.ts: addNode");
        console.log(node);
        // 1. add this node to the designer object
        this.designer.addNode(node);

        // console.log(this.designer);
        // 2. create a NodeView from the designer node then add it to node graph
        const centerPosOfScene = this.graph.view.canvasToSceneXY(centerX, centerY);
        const width = 100;
        const height = 100;
        const leftTopPos = { x: centerPosOfScene.x - width / 2, y: centerPosOfScene.y - height / 2 };
        const nodeView = new NodeView(node.uuid, node.name, leftTopPos.x, leftTopPos.y, width, height);
        // console.log(nodeView);
        for (const port of node.inputs)
            nodeView.addPortView(port);
        nodeView.arrangePortViews(PortType.In);
        for (const port of node.outputs)
            nodeView.addPortView(port);
        nodeView.arrangePortViews(PortType.Out);

        this.graph.addNodeView(nodeView);
    }

    private setupDesigner() {
        this.designer.onNodeTextureUpdated = (node: BaseNode) => {
            const nodeView = this.graph.getNodeViewById(node.uuid);
            if (!nodeView)
                return;
            
            this.designer.renderTextureToCanvas(node.targetTex, nodeView.imageCanvas);
            
            if (this.onTextureMappingUpdated && nodeView.mappingChannel)
                this.onTextureMappingUpdated(nodeView.imageCanvas, nodeView.mappingChannel);
        }
    }

    private setupScene() {
        // clear prev graph
        // if (this.graph)
        //     this.graph.clear();
        
        this.graph = new NodeGraph(this.canvas);

        // set NodeGraph callbacks
        this.graph.onNodeViewSelected = (nodeView: NodeView) => {
            if (nodeView == null)
                return;
            
            const node = this.designer.nodes[nodeView.uuid];
            this.selectedNode = node;
            useMainStore().updateFocusedNode(node);
            
            if (this.onNodeSelected)
                this.onNodeSelected(node);
        }

        this.graph.onNodeViewDeleted = (nodeView: NodeView) => {
            // clear the texture mapping channel if this node is MappingNode
            if (nodeView.mappingChannel)
                this.clearTextureChannel(nodeView.uuid);
            
            this.designer.removeNode(nodeView.uuid);
        }

        this.graph.onConnectionViewSelected = (connView: ConnectionView) => {
            if (connView == null)
                return;
            
            const conn = this.designer.conns[connView.uuid];
            this.selectedConn = conn;
            
            if (this.onConnectionSelected)
                this.onConnectionSelected(conn);
        }

        this.graph.onConnectionViewCreated = (connView: ConnectionView) => {
            const outPort = connView.out;
            const inPort = connView.in;
            
            this.designer.addConnection(connView.uuid, outPort.node.uuid, outPort.port.index, inPort.node.uuid, inPort.port.index);
        }

        this.graph.onConnectionViewDestroyed = (connView: ConnectionView) => {
            this.designer.removeConnection(connView.uuid);
        }
    }

    private setupDefaultScene() {
        const offset = 100;
        const spacing = 150;

        const mappingChannels = ["BaseColor", "Roughness", "Metallic", "AmbientOcclusion", "Normal", "Height"];
        
        for (let i = 0; i < mappingChannels.length; ++i) {
            const node = this.library.createNode("output", NodeType.Atomic, this.designer);
            this.addNode(node, 800, offset + spacing * i);
            node.setProperty("name", mappingChannels[i]);
            this.setMappingChannelByNode(node.uuid, mappingChannels[i]);
        }
    }

    private setMappingChannelByNode(uuid: string, channel: string) {
        if (this.mappingNodes[channel]) {
            // clear texture channel from prev NodeView
            const prev = this.mappingNodes[channel];
            const prevNodeViewItem = this.graph.getNodeViewById(prev);
            prevNodeViewItem.mappingChannel = null;
            delete this.mappingNodes[channel];

            if (this.onTextureMappingUpdated)
                this.onTextureMappingUpdated(null, channel);
        }

        // store {channel: uuid} to mappingNodes
        const nodeView = this.graph.getNodeViewById(uuid);
        nodeView.mappingChannel = channel;
        this.mappingNodes[channel] = uuid;

        // update view3d texture mapping
        if (this.onTextureMappingUpdated)
            this.onTextureMappingUpdated(nodeView.imageCanvas, channel);
    }

    private clearAllTextureChannels() {

    }

    private clearTextureChannel(uuid: string) {

    }

    // private updateMappingNode(nodeView: NodeView) {
    //     if (!this.view3d)
    //         return;
        
    //     if (this.view3d.pbr == "metallic") {
    //         switch (nodeView.uuid) {
    //             case (mappings.baseColorNodeId):
    //                 this.view3d.setBaseColorTexture(nodeView.imageCanvas);
    //                 break;
    //             case (mappings.roughnessNodeId):
    //                 this.view3d.setRoughnessTexture(nodeView.imageCanvas);
    //                 break;
    //             case (mappings.metallicNodeId):
    //                 this.view3d.setMetallicTexture(nodeView.imageCanvas);
    //                 break;
    //             case (mappings.ambientOcclusionNodeId):
    //                 this.view3d.setAmbientOcclusionTexture(nodeView.imageCanvas);
    //                 break;
    //             case (mappings.normalNodeId):
    //                 this.view3d.setNormalTexture(nodeView.imageCanvas);
    //                 break;
    //             case (mappings.heightNodeId):
    //                 this.view3d.setHeightTexture(nodeView.imageCanvas);
    //                 break;
    //             default:
    //                 console.log("editor.ts: nodeView metallic-roughness mapping type is not valid!");
    //         }
    //     } 
    //     /**
    //     else {
    //         const mappings = this.mappingNodes as SpecularMappingNodes;
    //         switch (nodeView.uuid) {
    //             case (mappings.albedoNodeId):
    //                 break;
    //             case (mappings.glossinessNodeId):
    //                 break;
    //             case (mappings.specularNodeId):
    //                 break;
    //             case (mappings.ambientOcclusionNodeId):
    //                 break;
    //             case (mappings.normalNodeId):
    //                 break;
    //             case (mappings.heightNodeId):
    //                 break;
    //             default:
    //                 console.log("editor.ts: nodeView specular-glossiness mapping type is not valid!");
    //         }
    //     }
    //     */
        
    // }
}