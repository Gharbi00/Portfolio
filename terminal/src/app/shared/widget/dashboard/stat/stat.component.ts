import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-stat',
  templateUrl: './stat.component.html',
  styleUrls: ['./stat.component.scss'],
})
export class StatComponent implements OnInit {
  @Input() title: string | undefined;
  @Input() value: any | undefined;
  @Input() icon: string | undefined;
  @Input() persantage: string | undefined;
  @Input() profit: string | undefined;
  @Input() icon_bg_color: string | undefined;
  @Input() link: string | undefined;

  constructor() {}

  ngOnInit(): void {}

  getValue(value: number): string {
    return Number.isFinite(value) ? value.toFixed(3) : '0.000';
  }
}