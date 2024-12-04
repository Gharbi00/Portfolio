import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-testimonial',
  templateUrl: './testimonial.component.html',
  styleUrls: ['./testimonial.component.scss']
})
export class TestimoialComponent implements OnInit {

  testomonials=[
    {src:'./assets/images/testimonial/image-2.png',
    description:'“ It’s amazing how much easier it has been to meet new people and create instantly non connections. I have the exact same personal the only thing that has changed is my mind set and a few behaviors. “',
    name:'James C. Anderson',
    designation:'Head Of Idea'},
    {src:'./assets/images/testimonial/image-2.png',
    description:'“ It’s amazing how much easier it has been to meet new people and create instantly non connections. I have the exact same personal the only thing that has changed is my mind set and a few behaviors. “',
    name:'James C. Anderson',
    designation:'Head Of Idea'},
    {src:'./assets/images/testimonial/image-2.png',
    description:'“ It’s amazing how much easier it has been to meet new people and create instantly non connections. I have the exact same personal the only thing that has changed is my mind set and a few behaviors. “',
    name:'James C. Anderson',
    designation:'Head Of Idea'},
    {src:'./assets/images/testimonial/image-2.png',
    description:'“ It’s amazing how much easier it has been to meet new people and create instantly non connections. I have the exact same personal the only thing that has changed is my mind set and a few behaviors. “',
    name:'James C. Anderson',
    designation:'Head Of Idea'},
    {src:'./assets/images/testimonial/image-2.png',
    description:'“ It’s amazing how much easier it has been to meet new people and create instantly non connections. I have the exact same personal the only thing that has changed is my mind set and a few behaviors. “',
    name:'James C. Anderson',
    designation:'Head Of Idea'},
    {src:'./assets/images/testimonial/image-2.png',
    description:'“ It’s amazing how much easier it has been to meet new people and create instantly non connections. I have the exact same personal the only thing that has changed is my mind set and a few behaviors. “',
    name:'James C. Anderson',
    designation:'Head Of Idea'},
    {src:'./assets/images/testimonial/image-2.png',
    description:'“ It’s amazing how much easier it has been to meet new people and create instantly non connections. I have the exact same personal the only thing that has changed is my mind set and a few behaviors. “',
    name:'James C. Anderson',
    designation:'Head Of Idea'},
    {src:'./assets/images/testimonial/image-2.png',
    description:'“ It’s amazing how much easier it has been to meet new people and create instantly non connections. I have the exact same personal the only thing that has changed is my mind set and a few behaviors. “',
    name:'James C. Anderson',
    designation:'Head Of Idea'},
    {src:'./assets/images/testimonial/image-2.png',
    description:'“ It’s amazing how much easier it has been to meet new people and create instantly non connections. I have the exact same personal the only thing that has changed is my mind set and a few behaviors. “',
    name:'James C. Anderson',
    designation:'Head Of Idea'},
    {src:'./assets/images/testimonial/image-2.png',
    description:'“ It’s amazing how much easier it has been to meet new people and create instantly non connections. I have the exact same personal the only thing that has changed is my mind set and a few behaviors. “',
    name:'James C. Anderson',
    designation:'Head Of Idea'},
  
  ];
  carouselOptions:OwlOptions ={
    nav:true,
    navSpeed:1200,
    pullDrag:true,
    items:3,
    dots:false,
    responsive:{
      0: { items: 1 },

      700: { items: 2 },
      1000: { items: 3},
  
   

    },
    slideBy:1,
    navText: [
      '<button class="slide-arrow prev-arrow slick-arrow" "><i class="fal fa-long-arrow-left"></i></button>',
      '<button class="slide-arrow next-arrow slick-arrow " "><i class="fal fa-long-arrow-right"></i></button>'
    ],
  }


  constructor() { }

  ngOnInit(): void {
  }

}
