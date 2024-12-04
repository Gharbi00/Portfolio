import { fadeAnimations } from '../../shared/animations';
import { Component } from '@angular/core';


@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss'],
  animations: [fadeAnimations],
})
export class TransactionComponent  {

}
