import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'sifca-delivery-notes',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './delivery-notes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliveryNotesComponent {}
