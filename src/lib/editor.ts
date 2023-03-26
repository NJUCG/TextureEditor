import { BaseNode, NodeType } from "./node/base-node";
import { PortType } from "./node/port";
import { Connection } from "./node/connection";
import { Library } from '@/lib/library';
import { NodeGraph } from "./node-graph";
import { NodeView } from "./view/node-view";
import { ConnectionView } from "./view/connection-view";
import { Designer } from "./designer";
import { newUUID } from "./utils";
import { MappingChannel, mappingChannelName } from "./canvas3d";
import { Color } from "./utils/color";
import { useMainStore } from "@/store";

export class Editor {
    public canvas: HTMLCanvasElement;

    public library: Library;
    public designer: Designer;
    public graph: NodeGraph;
    public selectedNode: BaseNode;
    public selectedConn: Connection;

    // <key: enum MappingChannel, value: node.uuid>
    public mappingNodes: Map<number, string>;
    private store: any;

    // callbacks
    public onConnectionSelected: (conn: Connection) => void;

    constructor() {
        this.canvas = null;
        this.library = null;
        this.designer = null;
        this.graph = null;
        this.selectedNode = null;
        this.selectedConn = null;
        this.mappingNodes = null;
        this.store = null;
    }

    public init(canvas: HTMLCanvasElement, library: Library, designer: Designer) {
        this.canvas = canvas;
        this.library = library;
        this.designer = designer;
        this.mappingNodes = new Map<number, string>();
        this.store = useMainStore();
        this.setup();
    }

    public draw() {
        if (this.graph) 
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
    }

    public setupInitialScene() {
        const offset = 100;
        const spacing = 150;

        const initColors = ["#FFFFFF", "#808080", "#404040", "#000000", "#FFFFFF", "#FFFFFF", "#808080"]
        
        console.log("setupInitialScene");
        for (let i = 1; i < mappingChannelName.length; ++i) {
            // 1. create input node
            let input: BaseNode = null;
            if (mappingChannelName[i] == "Normal") {
                input = this.library.createNode("normal", NodeType.Atomic, this.designer);
            } else {
                input = this.library.createNode("color", NodeType.Atomic, this.designer);
                input.setProperty("Color", initColors[i]);
            }
            const inputView = this.addNode(input, 650, offset + spacing * i);
            // 2. create output node
            const output = this.library.createNode("output", NodeType.Atomic, this.designer);
            output.setProperty("Name", mappingChannelName[i]);
            const outputView = this.addNode(output, 800, offset + spacing * i);
            // 3. connect the two nodes
            const conn = new ConnectionView(newUUID(), outputView.inPorts[0], inputView.outPorts[0], this.graph);
            console.log("index = ", i);
            console.log(conn);
            this.graph.addConnectionView(conn);
            // 4. update texture mapping channel
            this.setMappingChannelByNode(output.uuid, i);
        }
    }

    public addNode(node: BaseNode, centerX: number = 0, centerY: number = 0): NodeView {
        // console.log("editor.ts: addNode");
        // console.log(node);
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

        return nodeView;
    }

    private setupDesigner() {
        this.designer.onNodeTextureUpdated = (node: BaseNode) => {
            const nodeView = this.graph.getNodeViewById(node.uuid);
            if (!nodeView)
                return;
            
            this.designer.renderTextureToCanvas(node.targetTex, nodeView.texCanvas);
            
            if (nodeView.mappingChannel)
                this.store.updateMappingChannel(nodeView.texCanvas, nodeView.mappingChannel);
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
            
            const node = this.designer.nodes.get(nodeView.uuid);
            this.selectedNode = node;
            // update 2d view
            this.store.updateFocusedNode(node);
        }

        this.graph.onNodeViewDeleted = (nodeView: NodeView) => {
            // clear the texture mapping channel if this node is MappingNode
            if (nodeView.mappingChannel)
                this.clearTextureChannel(nodeView.uuid);
            
            this.designer.removeNode(nodeView.uuid);
            // update 2d view
            this.store.updateFocusedNode(null);
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

    private setMappingChannelByNode(uuid: string, channel: MappingChannel) {
        if (this.mappingNodes.has(channel)) {
            // clear texture channel from prev NodeViewItem
            const prev = this.mappingNodes.get(channel);
            const prevNodeViewItem = this.graph.getNodeViewById(prev);
            prevNodeViewItem.mappingChannel = null;
            this.mappingNodes.delete(channel);

            // this.store.updateMappingChannel(null, channel);
        }

        // store {channel: uuid} to mappingNodes
        const nodeView = this.graph.getNodeViewById(uuid);
        nodeView.mappingChannel = channel;
        this.mappingNodes.set(channel, uuid);

        // update view3d texture mapping
        this.store.updateMappingChannel(nodeView.texCanvas, channel);
        // console.log(channel);
    }

    private clearAllTextureChannels() {

    }

    private clearTextureChannel(uuid: string) {

    }
}