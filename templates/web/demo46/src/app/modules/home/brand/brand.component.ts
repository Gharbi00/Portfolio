import { Component, OnInit } from '@angular/core';
import { BrandData } from '../../../shared/data/portfolio';
import { BrandCarousel } from '../../../shared/data/slider';

@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.scss']
})
export class BrandComponent implements OnInit {
  public BrandCarousel=BrandCarousel;
public BrandData=BrandData;
  constructor() { }
  

  ngOnInit(): void {
  }

}
