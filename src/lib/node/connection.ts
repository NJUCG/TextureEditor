/**
 * @var
 * outNodeId: means left node, this conn is out from left node "the Out Node"
 * inNodeId: means right node, this conn is in to right node "the In Node"
 */
export class Connection {
	public uuid: string;

	public outNodeId: string;
	public outPortIndex: number;
	public inNodeId: string;
	public inPortIndex: number;

	constructor(uuid: string, outNodeId: string, outPortIndex: number, inNodeId: string, inPortIndex: number) {
		this.uuid = uuid;
		this.outNodeId = outNodeId;
		this.outPortIndex = outPortIndex;
		this.inNodeId = inNodeId;
		this.inPortIndex = inPortIndex;
	}
}