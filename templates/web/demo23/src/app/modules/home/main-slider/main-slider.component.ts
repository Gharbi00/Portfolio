import { Component, OnInit } from '@angular/core';
import { MainSlider } from '../../../shared/data/slider';
import { mainSlider } from '../../../shared/data/portfolio';

@Component({
  selector: 'app-main-slider',
  templateUrl: './main-slider.component.html',
  styleUrls: ['./main-slider.component.scss']
})
export class MainSliderComponent implements OnInit {
  public MainSlider=MainSlider;
  public mainSlider=mainSlider;
  constructor() { }

  ngOnInit(): void {
  }

}
