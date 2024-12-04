import { Component, OnInit } from '@angular/core';
import { ProductImageCarousel } from '../../../shared/data/slider';
import { ProductImage } from '../../../shared/data/portfolio';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  public ProductImageCarousel=ProductImageCarousel;
  public ProductImage=ProductImage;

  constructor() { }

  ngOnInit(): void {
  }

}
