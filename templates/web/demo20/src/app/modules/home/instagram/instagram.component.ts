import { Component, OnInit } from '@angular/core';
import { InstaData } from '../../../shared/data/portfolio';
import { BrandCarousel, InstaCarousel } from '../../../shared/data/slider';
import { BrandData } from '../../../shared/data/portfolio';

@Component({
  selector: 'app-instagram',
  templateUrl: './instagram.component.html',
  styleUrls: ['./instagram.component.scss']
})
export class InstagramComponent implements OnInit {
public BrandData=BrandData;
  public InstaData=InstaData;
  public InstaCarousel=InstaCarousel;
  public BrandCarousel=BrandCarousel;
  constructor() { }
  

  ngOnInit(): void {
  }

}
