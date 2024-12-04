import { Component, OnInit, Input } from '@angular/core';

import { BoardCardType } from '@sifca-monorepo/terminal-generator';

@Component({
  selector: 'app-my-task',
  templateUrl: './my-task.component.html',
  styleUrls: ['./my-task.component.scss'],
})
export class MyTaskComponent implements OnInit {
  @Input() MyTask: BoardCardType[];

  constructor() {}

  ngOnInit(): void {}
}
