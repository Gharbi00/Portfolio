import { Component, OnInit } from '@angular/core';
import { ExclusiveProductsCarousel } from '../../../shared/data/slider';
import { exclusiveProducts } from '../../../shared/data/portfolio';

@Component({
  selector: 'app-exclusive-porducts',
  templateUrl: './exclusive-porducts.component.html',
  styleUrls: ['./exclusive-porducts.component.scss']
})
export class ExclusivePorductsComponent implements OnInit {
  public exclusiveProducts=exclusiveProducts;
  public ExclusiveProductsCarousel=ExclusiveProductsCarousel;
  constructor() { }

  ngOnInit(): void {
  }

}
