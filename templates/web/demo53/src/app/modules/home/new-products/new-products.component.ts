import { Component, OnInit } from '@angular/core';
import { NewProductsCarousel } from '../../../shared/data/slider';
import { NewProductsCarousel2 } from '../../../shared/data/slider';
import { NewProductsData } from '../../../shared/data/portfolio';

@Component({
  selector: 'app-new-products',
  templateUrl: './new-products.component.html',
  styleUrls: ['./new-products.component.scss']
})
export class NewProductsComponent implements OnInit {
  public NewProductsData=NewProductsData;
  public NewProductsCarousel=NewProductsCarousel;
  public NewProductsCarousel2=NewProductsCarousel2;

  constructor() { }

  ngOnInit(): void {
  }

}
