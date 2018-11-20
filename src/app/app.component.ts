import { Component, OnInit } from '@angular/core';
import { Maze } from './maze';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
	title = 'maze';

	maze: Maze;
	domMaze: HTMLCanvasElement;

	fullspeed = true;

	isPanelShow = true;

	config = {
		lineWidth: 0,
		limit: 0,
	};

	changeSpeed(c?: boolean) {
		this.fullspeed = (c === undefined) ? !this.fullspeed : c;
		this.config.limit = this.fullspeed ? Infinity : 30;
	}

	random() {

		while (true) {
			const lineWidth = (Math.random() * 7 + 1) | 0;
			if (this.config.lineWidth !== lineWidth) {
				this.config.lineWidth = lineWidth;
				break;
			}
		}
		this.changeSpeed(Math.random() < 0.5);

		if (this.maze && this.maze.stop) {
			this.goMaze();
		}
	}

	goMaze() {

		if (this.maze) {
			this.maze.stop = true;
		}

		const maze = new Maze(this.config, this.domMaze);
		maze.drawTick();
		this.maze = maze;
	}

	ngOnInit() {

		const panel = <HTMLCanvasElement> document.getElementById('menu');
		const domMaze = <HTMLCanvasElement> document.getElementById('mazeCanvas');
		domMaze.addEventListener('mousedown', () => {
			this.isPanelShow = !this.isPanelShow;
			panel.style.display = this.isPanelShow ? 'block' : 'none';
			// console.log('click', this.isPanelShow, panel.style.display);
		});
		this.domMaze = domMaze;

		this.random();
		this.goMaze();
	}
}
