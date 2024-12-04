import { Component, OnInit } from '@angular/core';

import { InstaCarousel } from '../../../shared/data/slider';
import { BrandData } from '../../../shared/data/portfolio';

@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.scss']
})
export class BrandComponent implements OnInit {
  public BrandData = BrandData;
  public InstaCarousel = InstaCarousel;
  constructor() { }


  ngOnInit(): void {
  }

}
