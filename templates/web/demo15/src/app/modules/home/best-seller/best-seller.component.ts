import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-best-seller',
  templateUrl: './best-seller.component.html',
  styleUrls: ['./best-seller.component.scss']
})
export class BestSellerComponent implements OnInit {

  products = [
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 50,newPrice:40, name: 'Modern Hoddie' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 50,newPrice:40, name: 'Modern Hoddie' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 50,newPrice:40, name: 'Modern Hoddie' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 50,newPrice:40, name: 'Modern Hoddie' },
  
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 50,newPrice:40, name: 'Modern Hoddie' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 50,newPrice:40, name: 'Modern Hoddie' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 50,newPrice:40, name: 'Modern Hoddie' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 50,newPrice:40, name: 'Modern Hoddie' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 50,newPrice:40, name: 'Modern Hoddie' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 50,newPrice:40, name: 'Modern Hoddie' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 50,newPrice:40, name: 'Modern Hoddie' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 50,newPrice:40, name: 'Modern Hoddie' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 50,newPrice:40, name: 'Modern Hoddie' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 50,newPrice:40, name: 'Modern Hoddie' },
  ];

    carouselOptions: OwlOptions = {
    
      nav: true,
      dots: false,
      navSpeed: 900,
      items: 4,
      loop: false,
      pullDrag: true,
      responsive:{
        0:{items:1},
        500:{items:2},
        800:{items:3},
        1000:{items:4},
      },

      slideBy: 4, // Specify the number of items to slide by
      navText:['<button class="slide-arrow prev-arrow slick-arrow" ><i class="fal fa-long-arrow-left"></i></button>','<button class="slide-arrow next-arrow slick-arrow" ><i class="fal fa-long-arrow-right"></i></button>']
    };

  constructor() { }

  ngOnInit(): void {
  }

}
