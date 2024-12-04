import { Component, OnInit } from '@angular/core';
import { mainSlider } from '../../../shared/data/portfolio';
import { MainSliderCarousel } from '../../../shared/data/slider';


@Component({
  selector: 'app-main-slider',
  templateUrl: './main-slider.component.html',
  styleUrls: ['./main-slider.component.scss']
})
export class MainSliderComponent implements OnInit {
public MainSliderCarousel=MainSliderCarousel;
public mainSlider=mainSlider;
  constructor() { }

  ngOnInit(): void {
  }

}
