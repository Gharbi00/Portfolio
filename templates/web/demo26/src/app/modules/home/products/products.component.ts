import { Component, OnInit,Input } from '@angular/core';
import { ProductCarousel } from '../../../shared/data/slider';
import { ProductData } from '../../../shared/data/portfolio';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  @Input() Title: string ;
  @Input() subTitle: string ;

public ProductCarousel=ProductCarousel;
public ProductData=ProductData;
  constructor() { }

  ngOnInit(): void {
  }

}
