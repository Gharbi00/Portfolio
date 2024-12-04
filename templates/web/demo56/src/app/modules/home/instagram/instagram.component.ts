import { Component, OnInit } from '@angular/core';
import { InstaData } from '../../../shared/data/portfolio';
import { InstaCarousel } from '../../../shared/data/slider';
import { BrandData } from '../../../shared/data/portfolio';
import { BrandCarousel } from '../../../shared/data/slider';

@Component({
  selector: 'app-instagram',
  templateUrl: './instagram.component.html',
  styleUrls: ['./instagram.component.scss']
})
export class InstagramComponent implements OnInit {
  public BrandCarousel=BrandCarousel;
public BrandData=BrandData;
  public InstaData=InstaData;
  public InstaCarousel=InstaCarousel;
  constructor() { }
  

  ngOnInit(): void {
  }

}
