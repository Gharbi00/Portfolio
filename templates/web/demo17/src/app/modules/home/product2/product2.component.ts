import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-product2',
  templateUrl: './product2.component.html',
  styleUrls: ['./product2.component.scss']
})
export class Product2Component implements OnInit {
  products = [
    { src: './assets/images/product/categories/women.png', name: 'Womens' },
    { src: './assets/images/product/categories/women.png', name: 'Kids' },
    { src: './assets/images/product/categories/women.png', name: 'Baby' },
    { src: './assets/images/product/categories/women.png', name: 'Garden' },
    { src: './assets/images/product/categories/women.png', name: 'Phone' },
    { src: './assets/images/product/categories/women.png', name: 'Beauty' },
    { src: './assets/images/product/categories/women.png', name: 'Cleaner' },
    { src: './assets/images/product/categories/women.png', name: 'Pets' },
    { src: './assets/images/product/categories/women.png', name: 'Toys' },
    { src: './assets/images/product/categories/women.png', name: 'Mens' },
    { src: './assets/images/product/categories/women.png', name: 'Womens' },
    { src: './assets/images/product/categories/women.png', name: 'Kids' },
    { src: './assets/images/product/categories/women.png', name: 'Baby' },
    { src: './assets/images/product/categories/women.png', name: 'Garden' },
    { src: './assets/images/product/categories/women.png', name: 'Phone' },
    { src: './assets/images/product/categories/women.png', name: 'Beauty' },
    { src: './assets/images/product/categories/women.png', name: 'Cleaner' },
    { src: './assets/images/product/categories/women.png', name: 'Pets' },
    { src: './assets/images/product/categories/women.png', name: 'Toys' },
    { src: './assets/images/product/categories/women.png', name: 'Mens' },
    { src: './assets/images/product/categories/women.png', name: 'Womens' },
    { src: './assets/images/product/categories/women.png', name: 'Kids' },
    { src: './assets/images/product/categories/women.png', name: 'Baby' },
    { src: './assets/images/product/categories/women.png', name: 'Garden' },
    { src: './assets/images/product/categories/women.png', name: 'Phone' },
    { src: './assets/images/product/categories/women.png', name: 'Beauty' },
    { src: './assets/images/product/categories/women.png', name: 'Cleaner' },
    { src: './assets/images/product/categories/women.png', name: 'Pets' },
    { src: './assets/images/product/categories/women.png', name: 'Toys' },
    { src: './assets/images/product/categories/women.png', name: 'Mens' },]

    carouselOptions: OwlOptions = {
    
      nav: true,
      dots: false,
      navSpeed: 900,
      items: 5,
      responsive:{
        0:{items:1},
        500:{items:2},
        700:{items:3},
        1000:{items:4},
        1200:{items:5}

      },
      pullDrag: true,
      slideBy: 5, // Specify the number of items to slide by
      navText:['<i class="fal fa-long-arrow-left"></i>','<i class="fal fa-long-arrow-right"></i>']
    };
  constructor() { }

  ngOnInit(): void {
  }

}
