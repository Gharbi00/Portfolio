import { Component, OnInit,Input } from '@angular/core';
import { ProductCarousel } from '../../../shared/data/slider';
import { ProductData } from '../../../shared/data/portfolio';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  @Input() dynamicValue: string ;

public ProductCarousel=ProductCarousel;
public ProductData=ProductData;
  constructor() { }

  ngOnInit(): void {
  }

  toggleButton(product: any) {
    product.showButton = !product.showButton;
}

}
