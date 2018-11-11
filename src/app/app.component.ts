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

	ngOnInit() {

		const maze = new Maze({
			lineWidth: (Math.random() * 7) | 0,
		});
		maze.drawTick();

		this.maze = maze;
	}
}
