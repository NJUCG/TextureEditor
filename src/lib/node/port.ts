import { Connection } from "./connection";

// 节点接口类型 in/out
export enum PortType {
    In,
    Out
}

export class Port {
    public uuid: string;
    public type: PortType;
    public index: number;
    public name: string;
    public conns: Connection[];

    /**
     * 构造函数
     * @param uuid 唯一标识符, 与Port隶属的Node相同
     * @param type PortType, In或Out
     * @param index 端口号, 从0开始，自上而下依次递增
     * @param name 端口名称，会显示到端口旁边
     */
    constructor(uuid: string, type: PortType, index: number, name: string) {
        this.uuid = uuid;
        this.type = type;
        this.index = index;
        this.name = name;
        this.conns = [];
    }

    public addConnection(conn: Connection) {
        this.conns.push(conn);
    }

    public removeConnection(conn: Connection) {
        this.conns.splice(this.conns.indexOf(conn), 1);
    }
}