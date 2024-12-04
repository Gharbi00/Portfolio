import { fadeAnimations } from '../../shared/animations';
import { Component } from '@angular/core';


@Component({
  selector: 'app-dashborad',
  templateUrl: './dashborad.component.html',
  styleUrls: ['./dashborad.component.scss'],
  animations: [fadeAnimations],
})
export class DashboardComponent  {
}
