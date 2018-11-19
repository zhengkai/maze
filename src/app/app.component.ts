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

	isPanelShow = true;

	rpg = 3;

	config = {
		lineWidth: 0,
		limit: 0,
	};

	random() {
		this.config.lineWidth = (Math.random() * 7 + 1) | 0;
		this.config.limit = Infinity;
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
