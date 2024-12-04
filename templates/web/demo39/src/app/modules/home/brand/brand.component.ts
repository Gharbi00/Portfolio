import { Component, OnInit } from '@angular/core';
import { BrandCarousel } from '../../../shared/data/slider';
import { BrandData } from '../../../shared/data/portfolio';

@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.scss']
})
export class BrandComponent implements OnInit {
public BrandData=BrandData;

  public BrandCarousel=BrandCarousel;
  constructor() { }
  

  ngOnInit(): void {
  }

}
