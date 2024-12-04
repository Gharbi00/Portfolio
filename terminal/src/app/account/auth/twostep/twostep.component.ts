import { Component } from '@angular/core';

import { ELEVOK_LOGO } from '../../../../environments/environment';

@Component({
  selector: 'sifca-monorepo-twostep',
  templateUrl: './twostep.component.html',
  styleUrls: ['./twostep.component.scss'],
})
export class TwoStepComponent {
  elevokLogo = ELEVOK_LOGO;
  year: number = new Date().getFullYear();
  config = {
    allowNumbersOnly: true,
    length: 4,
    isPasswordInput: false,
    disableAutoFocus: false,
    placeholder: '',
    inputStyles: {
      width: '80px',
      height: '50px',
    },
  };
}
