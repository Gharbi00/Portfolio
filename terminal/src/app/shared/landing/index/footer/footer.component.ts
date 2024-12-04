import { Component, OnInit } from '@angular/core';
import { ELEVOK_LOGO } from '../../../../../environments/environment';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})

/**
 * Footer Component
 */
export class FooterComponent {
  elevokLogo = ELEVOK_LOGO;
}
