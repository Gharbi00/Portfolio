import { Component, OnInit } from '@angular/core';
import { MainSlider } from '../../../shared/data/slider';
import { mainSlider } from '../../../shared/data/portfolio';
import { trigger,state,style,transition,animate } from '@angular/animations';

@Component({
  selector: 'app-main-slider',
  templateUrl: './main-slider.component.html',
  styleUrls: ['./main-slider.component.scss'],
  animations: [
    trigger('activeSlide', [
      state('active', style({
        transform: 'scale(1.4)',
        opacity: 1,
      })),
      state('inActive', style({
        transform: 'scale(0.7)',
        opacity: 0.8,
      })),
      transition('active => inActive', [
        animate('0.5s')
      ]),
      transition('inActive => active', [
        animate('0.5s')
      ])
    ])
  ]
})
export class MainSliderComponent implements OnInit {
  public MainSlider=MainSlider;
  public mainSlider=mainSlider;
  constructor() { }

  




  ngOnInit(): void {


  }

}
