import { Component } from '@angular/core';
import { fadeAnimations } from '../../../shared/animations';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  animations: [fadeAnimations],
})
export class FooterComponent {}
