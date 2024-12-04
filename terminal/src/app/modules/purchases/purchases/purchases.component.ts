import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'sifca-purchases',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './purchases.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchasesComponent {}
