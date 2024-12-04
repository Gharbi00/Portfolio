import { Component } from '@angular/core';

import { ELEVOK_LOGO } from '../../../../environments/environment';

@Component({
  selector: 'sifca-monorepo-success-msg',
  templateUrl: './success-msg.component.html',
  styleUrls: ['./success-msg.component.scss'],
})

/**
 * Success Msg Basic Component
 */
export class SuccessMsgComponent {
  elevokLogo = ELEVOK_LOGO;
  year: number = new Date().getFullYear();

  // constructor() {}
}
