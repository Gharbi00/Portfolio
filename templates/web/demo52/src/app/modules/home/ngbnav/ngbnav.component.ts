import { Component, OnInit } from '@angular/core';
import { trigger,transition,keyframes,style,animate } from '@angular/animations';
import { ProductData } from '../../../shared/data/portfolio';
import { ProductCarousel } from '../../../shared/data/slider';
@Component({
  selector: 'app-ngbnav',
  templateUrl: './ngbnav.component.html',
  styleUrls: ['./ngbnav.component.scss'],
  animations: [
    trigger('tabAnimation', [


      transition('* => *', [
        animate('1s ease-in-out', keyframes([
          style({ opacity: 0, transform: 'scale(0.8)', offset: 0 }),
          style({ opacity: 0.5, transform: 'scale(1)', offset: 0.5 }),
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
export class NgbnavComponent implements OnInit {

public ProductsData=ProductData;
public ProductCarousel=ProductCarousel;

  constructor() { }

  activeTab = 'tab-1'; 
  switchTab(tab: string) {
    this.activeTab = tab;
  }

  ngOnInit(): void {
  }

}
