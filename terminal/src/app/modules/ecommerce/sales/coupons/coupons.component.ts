import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'coupons',
  templateUrl: './coupons.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CouponsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
