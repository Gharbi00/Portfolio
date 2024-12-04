import { Component, OnInit } from '@angular/core';

import { ProductsCarousel } from '../../../shared/data/slider';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

  public ProductsCarousel=ProductsCarousel;

  constructor() { }

  ngOnInit(): void {
  }

}
