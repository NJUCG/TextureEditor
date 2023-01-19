//记录一条connection连接的前后两个接口

import { NodeScene } from "./nodescene";
import { SocketType, SocketScene } from "./socketscene";

export class ConnectionScene extends NodeScene {
    public socketIn!: SocketScene;
    public socketOut!: SocketScene;

    draw(ctx: CanvasRenderingContext2D, renderData: any = null) {
		ctx.beginPath();
		ctx.strokeStyle = "rgb(200, 200, 200)";
		ctx.lineWidth = 4;
		ctx.moveTo(this.socketIn.centerX(), this.socketIn.centerY());
		ctx.bezierCurveTo(
			this.socketIn.centerX() ,
			this.socketIn.centerY()- 60, // control point 1
			this.socketOut.centerX() ,
			this.socketOut.centerY()+ 60,
			this.socketOut.centerX(),
			this.socketOut.centerY()
		);
		ctx.stroke();
	}

	public setSockets(sockIn:SocketScene, sockOut:SocketScene){
		this.socketIn = sockIn;
		this.socketOut = sockOut;
	}
}