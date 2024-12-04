import { Component, OnInit } from '@angular/core';
import { TrendingProducts } from '../../../shared/data/slider';
import { trendingProducts } from '../../../shared/data/portfolio';
@Component({
  selector: 'app-trending-products',
  templateUrl: './trending-products.component.html',
  styleUrls: ['./trending-products.component.scss']
})
export class TrendingProductsComponent implements OnInit {
  public trendingProducts=trendingProducts;
  public TrendingProducts=TrendingProducts;

  constructor() { }

  ngOnInit(): void {
  }

}
