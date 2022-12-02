export class Vector2 {
	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	clone(): Vector2 {
		return new Vector2(this.x, this.y);
	}

	static add(a: Vector2, b: Vector2): Vector2 {
		return new Vector2(a.x + b.x, a.y + b.y);
	}

	static subtract(a: Vector2, b: Vector2): Vector2 {
		return new Vector2(a.x - b.x, a.y - b.y);
	}
}

export class Rect {
	public x = 0;
	public y = 0;
	public width: number;
	public height: number;

	color: string;

	public constructor() {
		//this.scene = scene;
		//scene.addItem(this);
		this.width = 1;
		this.height = 1;
		this.color = "rgb(255, 50, 50)";
	}

	public setSize(w: number, h: number) {
		this.width = w;
		this.height = h;
	}

	public isPointInside(px: number, py: number): boolean {
		if (
			px >= this.x &&
			px <= this.x + this.width &&
			py >= this.y &&
			py <= this.y + this.height
		)
			return true;
		return false;
	}

	public setCenter(x: number, y: number) {
		this.x = x - this.width / 2;
		this.y = y - this.height / 2;
	}

	public centerX(): number {
		return this.x + this.width / 2;
	}

	public centerY(): number {
		return this.y + this.height / 2;
	}

	public move(dx: number, dy: number) {
		this.x += dx;
		this.y += dy;
	}

	public get left() {
		return this.x;
	}

	public get top() {
		return this.y;
	}

	public get right() {
		return this.x + this.width;
	}

	public get bottom() {
		return this.y + this.height;
	}

	public get center() {
		return new Vector2(this.centerX(), this.centerY());
	}

	public intersects(other: Rect) {
		if (this.left > other.right) return false;
		if (this.right < other.left) return false;
		if (this.bottom < other.top) return false;
		if (this.top > other.bottom) return false;

		return true;
	}

	public expand(uniformSize: number) {
		const halfSize = uniformSize * 0.5;

		// assume it's a rect with a positive area
		this.x -= halfSize;
		this.y -= halfSize;
		this.width += halfSize * 2;
		this.height += halfSize * 2;
	}

	public expandByRect(rect: Rect) {
		// assume it's a rect with a positive area
		this.x = Math.min(this.x, rect.x);
		this.y = Math.min(this.y, rect.y);
		this.width = Math.max(this.width, rect.width);
		this.height = Math.max(this.height, rect.height);
	}

	clone(): Rect {
		const rect = new Rect();
		rect.x = this.x;
		rect.y = this.y;
		rect.width = this.width;
		rect.height = this.height;

		return rect;
	}
}