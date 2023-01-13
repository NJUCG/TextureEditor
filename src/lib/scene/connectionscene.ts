//记录一条connection连接的前后两个接口

import { NodeScene } from "./nodescene";
import { SocketType, SocketScene } from "./socketscene";

export class ConnectionScene extends NodeScene {
    public socketIn!: SocketScene;
    public socketOut!: SocketScene;
}