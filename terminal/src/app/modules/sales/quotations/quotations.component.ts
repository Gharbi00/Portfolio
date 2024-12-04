import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'sifca-quotations',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './quotations.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuotationsComponent {}
