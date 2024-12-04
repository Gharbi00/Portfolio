import { Component, OnInit } from '@angular/core';
import { CategoriesData } from '../../../shared/data/portfolio';
import { CategoriesCarousel } from '../../../shared/data/slider';
@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
  public CategoriesData=CategoriesData;
  public CategoriesCarousel=CategoriesCarousel;
  constructor() { }

  ngOnInit(): void {
  }

}
