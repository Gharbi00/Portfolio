import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'outbound',
  templateUrl: './outbound.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OutboundComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
