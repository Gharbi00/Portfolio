import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'sifca-positions',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './positions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PositionsComponent {}
