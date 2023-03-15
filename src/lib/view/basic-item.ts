export class Vector2 {
	public x: number;
	public y: number;

	constructor(x: number = 0, y: number = 0) {
		this.x = x;
		this.y = y;
	}

	public clone(): Vector2 {
		return new Vector2(this.x, this.y);
	}

	public static add(a: Vector2, b: Vector2): Vector2 {
		return new Vector2(a.x + b.x, a.y + b.y);
	}

	public static subtract(a: Vector2, b: Vector2): Vector2 {
		return new Vector2(a.x - b.x, a.y - b.y);
	}
}

export abstract class Shape {
	protected x: number;
	protected y: number;
	
	constructor(x: number = 0, y: number = 0) {
		this.x = x;
		this.y = y;
	}

	public abstract isPointInside(px: number, py: number): boolean;
	public abstract move(dx: number, dy: number): void;
	public abstract clone(): Shape;
}

export class Rect extends Shape {
	public width: number;
	public height: number;

	public constructor(x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
		super(x, y);
		this.width = width;
		this.height = height;
	}

	public setCenter(x: number, y: number) {
		this.x = x - this.width / 2;
		this.y = y - this.height / 2;
	}

	public setSize(w: number, h: number) {
		this.width = w;
		this.height = h;
	}

	public move(dx: number, dy: number) {
		this.x += dx;
		this.y += dy;
	}

	public isPointInside(px: number, py: number): boolean {
		return px >= this.x && px <= this.x + this.width 
			&& py >= this.y && py <= this.y + this.height;
	}

	public intersects(other: Rect): boolean {
		if (this.left > other.right) return false;
		if (this.right < other.left) return false;
		if (this.bottom < other.top) return false;
		if (this.top > other.bottom) return false;

		return true;
	}
	
	public clone(): Rect {
		return new Rect(this.x, this.y, this.width, this.height);
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

    public get centerX() {
		return this.x + this.width / 2;
	}

	public get centerY() {
		return this.y + this.height / 2;
	}

	public get center() {
		return new Vector2(this.centerX, this.centerY);
	}
}

export class Circle extends Shape {
	public r: number;

	constructor(x: number = 0, y: number = 0, radius: number = 1) {
		super(x, y);
		this.r = radius;
	}

	public setCenter(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	public setRadius(r: number) {
		this.r = r;
	}

	public move(dx: number, dy: number) {
		this.x += dx;
		this.y += dy;
	}

	public isPointInside(px: number, py: number): boolean {
		const dx = px - this.x;
		const dy = py - this.y;

		return dx * dx + dy * dy < this.r * this.r;
	}
	
	public clone(): Circle {
		return new Circle(this.x, this.y, this.r);
	}

	public get centerX() {
		return this.x;
	}

	public get centerY() {
		return this.y;
	}

	public get radius() {
		return this.r;
	}
}