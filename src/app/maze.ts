export class Maze {

	map = Array<boolean>();

	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	step = 1.5;

	isBack = false;

	margin = Array<number>(0, 0);
	pos = Array<number>(0, 0);
	size = Array<number>(100, 100);

	stepLong = 0;
	lineWidth = 1;

	start = false;
	stop = false;

	limit = 30;

	colorCycle = 1000;
	colorMod: number;
	colorStart: number;
	colorDirection: boolean;

	road = Array<number>();

	color = Array<number>(0, 0, 0);

	constructor(config: any, canvas: HTMLCanvasElement) {

		// const canvas = <HTMLCanvasElement> document.getElementById('mazeCanvas');
		if (!canvas) {
			this.stop = true;
			return;
		}

		if (config) {
			if (config['lineWidth']) {
				this.lineWidth = config['lineWidth'];
			}
			if (config['colorCycle']) {
				this.colorCycle = config['colorCycle'];
			}
			if (config['limit']) {
				this.limit = config['limit'];
			}
		}

		this.colorMod = 6 * this.colorCycle;
		this.colorStart = Math.floor(Math.random() * this.colorMod);
		this.colorDirection = Math.random() < 0.5;

		const ctx = canvas.getContext('2d');
		ctx.lineWidth = this.lineWidth;
		this.canvas = canvas;
		this.ctx = ctx;

		this.stepLong = this.lineWidth * 2;

		this.calcSize();

		this.pos = this.size.map((v) => {
			return (v * 0.4) | 0;
		});
		this.setPos(this.pos);
	}

	calcSize() {

		if (this.stop) {
			return;
		}

		const c = this.canvas;

		const scale = window.devicePixelRatio;

		const w = window.innerWidth;
		const h = window.innerHeight;

		c.width  = Math.ceil(w * scale);
		c.height = Math.ceil(h * scale);
		c.style.width  = w + 'px';
		c.style.height = h + 'px';

		const stepLong = this.stepLong;

		[c.width, c.height].map((v, i) => {

			const margin = (v - this.lineWidth) % this.stepLong;

			this.size[i] = Math.floor((v - margin) / this.stepLong) + 1;
			this.margin[i] = (margin / 2) | 0;

			console.log(i ? 'Y' : 'X', 'margin', margin, ', size', this.size[i], ', offset', this.margin[i]);
		});

		this.map.length = this.size[0] * this.size[1];

		console.log('size', this.size[0], 'x', this.size[1], '=', this.size[0] * this.size[1]);
		console.log('lineWidth', this.lineWidth);
		console.log('screen', w, 'x', h, ', scale = ', scale);
	}

	drawTick(tsPrev?: number) {

		const ts = Date.now();

		const tsCost = Math.min(12, ts - (tsPrev | 0));

		const tsLimit = ts + tsCost;

		let now = 0;

		// const limit = 30;
		// limit = Infinity;

		let i = 0;
		for (; i < this.limit && !this.stop; i++) {

			this.draw();

			now = Date.now();
			if (now > tsLimit) {
				break;
			}
		}
		// console.log(i, now - ts, now, tsLimit, ts - tsPrev, tsCost);

		if (!this.stop) {
			window.requestAnimationFrame(() => {
				this.drawTick(now);
			});
		}
	}

	draw() {

		if (this.stop) {
			return;
		}

		let found = false;
		let newPos = Array<number>();

		let direction = 0;
		for (direction of this.shuffleDirection()) {
			newPos = this.move(this.pos, direction);
			if (!this.getPos(newPos)) {
				found = true;
				break;
			}
		}

		if (found) {

			this.drawLine(direction, newPos, false);
			this.setPos(newPos);
			this.road.push(direction);

			return;
		}

		if (this.road.length < 1) {
			console.log('end');
			this.stop = true;
			return;
		}

		const prev = this.road.pop();
		newPos = this.moveBack(this.pos, prev);
		this.drawLine(prev, newPos, true);
	}

	drawLine(direction: number, newPos: Array<number>, isBack: boolean) {

		const ctx = this.ctx;

		if (this.isBack !== isBack) {
			this.isBack = isBack;
			// ctx.fillStyle = isBack ? 'green' : 'red';
		}

		if (isBack) {
			direction = (direction + 2) % 4;
			this.drawDot(this.pos);
		} else {
			this.drawDot(this.pos, direction);
		}

		this.pos = newPos;
	}

	drawDot(pos: Array<number>, direction?: number) {

		const color = this.loopColor();
		this.ctx.fillStyle = color;

		const pixelPos = [0, 0];
		this.pos.forEach((v, i) => {
			pixelPos[i] = pos[i] * this.stepLong + this.margin[i];
		});

		this.ctx.fillRect(
			pixelPos[0],
			pixelPos[1],
			this.lineWidth,
			this.lineWidth,
		);

		if (direction !== undefined) {

			const offset = this.moveOffset(direction);

			this.ctx.fillRect(
				pixelPos[0] + offset[0] * this.lineWidth,
				pixelPos[1] + offset[1] * this.lineWidth,
				this.lineWidth,
				this.lineWidth,
			);
		}
	}

	getPos(pos: Array<number>) {

		if (pos[0] < 0 || pos[1] < 0 || pos[0] >= this.size[0] || pos[1] >= this.size[1]) {
			return true;
		}

		return !!this.map[pos[1] * this.size[0] + pos[0]];
	}

	setPos(pos: Array<number>) {
		this.map[pos[1] * this.size[0] + pos[0]] = true;
	}

	moveOffset(direction: number): Array<number> {

		const offset = [0, 0];

		offset[direction % 2] += (direction < 2 ? -1 : 1);

		return offset;
	}

	move(pos: Array<number>, direction: number) {

		const n = [
			pos[0],
			pos[1],
		];

		const offset = this.moveOffset(direction);

		n[0] += offset[0];
		n[1] += offset[1];

		return n;
	}

	moveBack(pos: Array<number>, direction: number) {

		direction = (direction + 2) % 4;

		return this.move(pos, direction);
	}

	shuffleDirection() {
		return this.shuffle([0, 1, 2, 3]);
	}

	shuffle(array) {

		let currentIndex = array.length, temporaryValue, randomIndex;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {

			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}

		return array;
	}

	loopColor() {

		let i = (this.road.length + this.colorStart) % this.colorMod;
		if (!this.colorDirection) {
			i = this.colorMod - 1 - i;
		}

		const cb = 255;

		const colorBase = i % this.colorCycle;
		const step = Math.floor(i / this.colorCycle);

		const primary = Math.floor(step / 2) % 3;
		const offset = step % 2;

		const min = 30;
		const max = cb - 30;

		let color = [0, 0, 0];

		let progress = colorBase / this.colorCycle;
		if (offset) {
			progress = 1 - progress;
		}

		color[(primary + offset) % 3]     = max * (1 - 0.2 * progress) + min;
		color[(primary + 1 - offset) % 3] = max * (0.8 * progress) + min;
		color[(primary + 2) % 3]          = min * (1 - progress);

		color = color.map(Math.round);

		this.color = color;

		if (i < this.colorMod * 2) {
			// console.log('color', i, colorBase, color);
		}

		/*
		color[0] = 0;
		color[1] = 255;
		color[2] = 255;
		 */

		return 'rgb(' + color.join() + ')';
	}
}
