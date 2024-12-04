import { Component, OnInit } from '@angular/core';
import { NewProductsCarousel } from '../../../shared/data/slider';
import { NewProductsCarousel2 } from '../../../shared/data/slider';
import { NewProductsData } from '../../../shared/data/portfolio';
import { trigger,transition,keyframes,style,animate } from '@angular/animations';
import { ProductCarousel } from '../../../shared/data/slider';
import { ProductData } from '../../../shared/data/portfolio';

@Component({
  selector: 'app-new-products',
  templateUrl: './new-products.component.html',
  styleUrls: ['./new-products.component.scss'],
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
export class NewProductsComponent implements OnInit {
  public NewProductsData=NewProductsData;
  public NewProductsCarousel=NewProductsCarousel;
  public NewProductsCarousel2=NewProductsCarousel2;
  public ProductData=ProductData;
  public ProductCarousel=ProductCarousel;
  activeTab = 'tab-1'; 
  switchTab(tab: string) {
    this.activeTab = tab;
  }

  constructor() { }

  ngOnInit(): void {
  }

}
