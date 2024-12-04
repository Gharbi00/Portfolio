import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-crm-stat',
  templateUrl: './crm-stat.component.html',
  styleUrls: ['./crm-stat.component.scss'],
})

/**
 * Crm Stat Component
 */
export class CrmStatComponent implements OnInit {
  @Input() title: string | undefined;
  @Input() value: any | undefined;
  @Input() icon: string | undefined;
  @Input() profit: string | undefined;

  constructor() {}

  ngOnInit(): void {}

  getValue(value: number, field?: string): string {
    if (field !== 'percentage') {
      return Number.isFinite(value) ? value.toFixed(3) : '0.000';
    } else {
      return Number.isFinite(value) ? value.toFixed(2) : '0.00';
    }
  }

  isNumber(value: any): boolean {
    return typeof value === 'string' ? false : true;
  }
}
