import { Component, OnInit,Input} from '@angular/core';
import { SpecialProductsCarousel } from '../../../shared/data/slider';
import { SpecialProductsData } from '../../../shared/data/portfolio';
import { trigger,transition,keyframes,style,animate } from '@angular/animations';

@Component({
  selector: 'app-special-porducts',
  templateUrl: './special-porducts.component.html',
  styleUrls: ['./special-porducts.component.scss'],
  animations: [
    trigger('tabAnimation', [


      transition('* => *', [
        animate('1s ease-in-out', keyframes([
          style({ opacity: 0, transform: 'scale(0.8)', offset: 0 }),
          style({ opacity: 0.5, transform: 'scale(1.1)', offset: 0.5 }),
          style({ opacity: 1, transform: 'scale(1)', offset: 1 }),
        ])),
      ]),

      // Leaving effect
      transition(':leave', [
        animate('0.5s ease-out', keyframes([
          style({ opacity: 1, transform: 'scale(1) translateY(0)', offset: 0 }),
          style({ opacity: 0.5, transform: 'scale(1.1) translateY(10px)', offset: 0.3 }),
          style({ opacity: 0, transform: 'scale(0.8) translateY(20px)', offset: 1 }),
        ])),
      ]),
    ]),
  ], 
})
export class SpecialPorductsComponent implements OnInit {
public SpecialProductsCarousel=SpecialProductsCarousel;
public SpecialProductsData=SpecialProductsData;
public NotDisplayed:boolean=false;
@Input() shouldDisplayBloc: boolean = false;
  constructor() { }

  ngOnInit(): void {
  }
  activeTab = 'tab-1'; 
  switchTab(tab: string) {
    this.activeTab = tab;
  }
}
