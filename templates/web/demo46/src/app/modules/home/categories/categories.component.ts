import { Component, OnInit } from '@angular/core';
import { TrendingProducts } from '../../../shared/data/slider';
import { trendingProducts } from '../../../shared/data/portfolio';
@Component({
  selector: 'app-category',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  public trendingProducts=trendingProducts;
  public TrendingProducts=TrendingProducts;

  constructor() { }

  ngOnInit(): void {
  }

}
