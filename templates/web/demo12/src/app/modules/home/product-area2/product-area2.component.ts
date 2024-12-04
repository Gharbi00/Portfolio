import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-product-area2',
  templateUrl: './product-area2.component.html',
  styleUrls: ['./product-area2.component.scss']
})
export class ProductArea2Component implements OnInit {
  products = [
    { src: 'assets/images/product/jewellery/product-6.png', oldPrice: 50,newPrice:40, name: 'Stainless Chair' ,reduction:20},
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 60,newPrice:50, name: 'Leather Sofa',reduction:20 },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 30,newPrice:20, name: 'Neue Sofa Chair',reduction:20 },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 50,newPrice:40, name: 'Wooden Sofa Chair',reduction:20 },
    { src: 'assets/images/product/jewellery/product-6.png', oldPrice: 50,newPrice:40, name: 'Stainless Chair' ,reduction:20},
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 60,newPrice:50, name: 'Leather Sofa' ,reduction:20},
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 30,newPrice:20, name: 'Neue Sofa Chair' ,reduction:20},
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 50,newPrice:40, name: 'Wooden Sofa Chair' ,reduction:20},
    { src: 'assets/images/product/jewellery/product-6.png', oldPrice: 50,newPrice:40, name: 'Stainless Chair' ,reduction:20},
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 60,newPrice:50, name: 'Leather Sofa' ,reduction:20},
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 30,newPrice:20, name: 'Neue Sofa Chair' ,reduction:20},
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 50,newPrice:40, name: 'Wooden Sofa Chair' ,reduction:20},
    { src: 'assets/images/product/jewellery/product-6.png', oldPrice: 50,newPrice:40, name: 'Stainless Chair' ,reduction:20},
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 60,newPrice:50, name: 'Leather Sofa' ,reduction:20},
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 30,newPrice:20, name: 'Neue Sofa Chair' ,reduction:20},
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 50,newPrice:40, name: 'Wooden Sofa Chair' ,reduction:20},
    { src: 'assets/images/product/jewellery/product-6.png', oldPrice: 50,newPrice:40, name: 'Stainless Chair' ,reduction:20},
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 60,newPrice:50, name: 'Leather Sofa' ,reduction:20},
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 30,newPrice:20, name: 'Neue Sofa Chair' ,reduction:20},
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 50,newPrice:40, name: 'Wooden Sofa Chair' ,reduction:20},
  ];

    carouselOptions: OwlOptions = {
    
      nav: true,
      dots: false,
      navSpeed: 900,
      items: 4,
      pullDrag: true,
      responsive:{
        0: { items: 1 },
 
        600: { items: 2 },
        800: { items: 3},
    
        1000: { items: 4 }

      },
      slideBy: 4, // Specify the number of items to slide by
      navText:['<i class="fal fa-long-arrow-left"></i>','<i class="fal fa-long-arrow-right"></i>']
    };
  constructor() { }

  ngOnInit(): void {
  }

}
