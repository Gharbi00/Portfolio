import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-wallet',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './wallet.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletComponent {}
