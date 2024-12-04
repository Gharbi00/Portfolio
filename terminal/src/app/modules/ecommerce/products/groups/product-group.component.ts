import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'product-group',
  templateUrl: './product-group.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductGroupComponent {}
