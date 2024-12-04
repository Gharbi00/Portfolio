import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-main-slider',
  templateUrl: './main-slider.component.html',
  styleUrls: ['./main-slider.component.scss']
})
export class MainSliderComponent implements OnInit {
  slides = [
    { SlideImage: 'assets/images/product/product-38.png', SlideTitle: 'Product 1', authors:['assets/images/others/author4.png','assets/images/others/author2.png','assets/images/others/author1.png','assets/images/others/author3.png'] ,thumbImage: 'assets/images/product/product-38.png', ThumbTitle: 'Thumb 1', Thumbprice: '$49.00'  },
    { SlideImage: 'assets/images/product/product-38.png', SlideTitle: 'Product 1', authors:['assets/images/others/author4.png','assets/images/others/author2.png','assets/images/others/author1.png','assets/images/others/author3.png']  ,thumbImage: 'assets/images/product/product-38.png', ThumbTitle: 'Thumb 1', Thumbprice: '$49.00'  },
    { SlideImage: 'assets/images/product/product-38.png', SlideTitle: 'Product 1', authors:['assets/images/others/author4.png','assets/images/others/author2.png','assets/images/others/author1.png','assets/images/others/author3.png']  ,thumbImage: 'assets/images/product/product-38.png', ThumbTitle: 'Thumb 1', Thumbprice: '$49.00'  },
    { SlideImage: 'assets/images/product/product-38.png', SlideTitle: 'Product 1', authors:['assets/images/others/author4.png','assets/images/others/author2.png','assets/images/others/author1.png','assets/images/others/author3.png']  ,thumbImage: 'assets/images/product/product-38.png', ThumbTitle: 'Thumb 1', Thumbprice: '$49.00'  },
    
    // Add more slides as needed
  ];
  yourIndexForColLg5: number = 2;


  sliderOptions :OwlOptions= {
    items: 1,
    margin: 10,
    nav: false,
    dots: true,
    dotsSpeed:1200,
    slideBy:1,
    responsive:{
      0:{items:1}
    }
    
  
  };
  




  constructor() { }

  ngOnInit(): void {
  }

}
