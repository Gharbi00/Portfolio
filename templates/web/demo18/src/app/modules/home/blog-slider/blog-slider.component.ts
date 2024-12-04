import { Component, OnInit } from '@angular/core';
import { BlogCarousel,MainSlider } from '../../../shared/data/slider';
import { BlogData } from '../../../shared/data/portfolio';

@Component({
  selector: 'app-blog-slider',
  templateUrl: './blog-slider.component.html',
  styleUrls: ['./blog-slider.component.scss']
})
export class BlogSliderComponent implements OnInit {
public BlogCarousel=BlogCarousel;
public BlogData=BlogData;
public MainSlider=MainSlider;
  constructor() { }

  ngOnInit(): void {
  }

}
