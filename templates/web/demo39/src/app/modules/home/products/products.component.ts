import { Component, OnInit } from '@angular/core';
import { SalesData } from '../../../shared/data/portfolio';
import { SalesCarousel } from '../../../shared/data/slider';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  public SalesData=SalesData;
  public SalesCarousel=SalesCarousel;

  constructor() { }

  ngOnInit(): void {
  }

}
