import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-new-arrivals',
  templateUrl: './new-arrivals.component.html',
  styleUrls: ['./new-arrivals.component.scss']
})
export class NewArrivalsComponent implements OnInit {


  products = [
    { src: 'assets/images/product/jewellery/product-6.png', oldPrice: 50,newPrice:40, name: 'Stainless Chair' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 60,newPrice:50, name: 'Leather Sofa' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 30,newPrice:20, name: 'Neue Sofa Chair' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 50,newPrice:40, name: 'Wooden Sofa Chair' },
    { src: 'assets/images/product/jewellery/product-6.png', oldPrice: 50,newPrice:40, name: 'Stainless Chair' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 60,newPrice:50, name: 'Leather Sofa' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 30,newPrice:20, name: 'Neue Sofa Chair' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 50,newPrice:40, name: 'Wooden Sofa Chair' },
    { src: 'assets/images/product/jewellery/product-6.png', oldPrice: 50,newPrice:40, name: 'Stainless Chair' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 60,newPrice:50, name: 'Leather Sofa' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 30,newPrice:20, name: 'Neue Sofa Chair' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 50,newPrice:40, name: 'Wooden Sofa Chair' },
    { src: 'assets/images/product/jewellery/product-6.png', oldPrice: 50,newPrice:40, name: 'Stainless Chair' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 60,newPrice:50, name: 'Leather Sofa' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 30,newPrice:20, name: 'Neue Sofa Chair' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 50,newPrice:40, name: 'Wooden Sofa Chair' },
    { src: 'assets/images/product/jewellery/product-6.png', oldPrice: 50,newPrice:40, name: 'Stainless Chair' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 60,newPrice:50, name: 'Leather Sofa' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 30,newPrice:20, name: 'Neue Sofa Chair' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 50,newPrice:40, name: 'Wooden Sofa Chair' },
  ];

    carouselOptions: OwlOptions = {
    
      nav: true,
      dots: false,
      navSpeed: 900,
      items: 4,
      loop: false,
      pullDrag: true,
      responsive:{
        0: { items: 1 },
        600: { items: 2 },
        800: { items: 3},
        1000: { items: 4 }

      },
      slideBy: 4, // Specify the number of items to slide by
      navText:['<button class="slide-arrow prev-arrow slick-arrow" ><i class="fal fa-long-arrow-left"></i></button>','<button class="slide-arrow next-arrow slick-arrow" ><i class="fal fa-long-arrow-right"></i></button>']
    };
  constructor() { }

  ngOnInit(): void {
  }

}
