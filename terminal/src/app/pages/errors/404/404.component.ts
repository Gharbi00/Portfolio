import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'sifca-monorepo-404',
  templateUrl: './404.component.html',
  styleUrls: ['./404.component.scss'],
})
export class Error404Component implements OnInit {
  year: number = new Date().getFullYear();

  constructor() {}

  ngOnInit(): void {}
}
