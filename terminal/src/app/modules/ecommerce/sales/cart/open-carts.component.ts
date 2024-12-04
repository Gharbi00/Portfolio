import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'sifca-open-carts',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './open-carts.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenCartsComponent {}
