import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-new-arrivals',
  templateUrl: './new-arrivals.component.html',
  styleUrls: ['./new-arrivals.component.scss']
})
export class NewArrivalsComponent implements OnInit {


  products = [
    { src: 'assets/images/product/jewellery/product-6.png', oldPrice: 100.00,newPrice:78.00, name: 'Calvin Klein womens Solid Sheath With Chiffon Bell Sleeves Dress' ,rating:6400 ,offer:'20% OFF'},
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 20.00,newPrice:17.00, name: 'Gildan Mens Ultra Cotton T-Shirt, Style G2000,',rating:6400 ,offer:'SALE' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 12.00,newPrice:5.22, name: 'Essentials Mens Regular-Fit Short-Sleeve Crewneck T-Shirt',rating:6400 ,offer:'TOP SELLING' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 120.00,newPrice:100.00, name: '2.4G Remote Control Rc BB-8 Droid Football Robot',rating:6400 ,offer:'SOLD OUT' },
    { src: 'assets/images/product/jewellery/product-6.png', oldPrice: 100.00,newPrice:78.00, name: 'Calvin Klein womens Solid Sheath With Chiffon Bell Sleeves Dress' ,rating:6400 ,offer:'20% OFF'},
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 20.00,newPrice:17.00, name: 'Gildan Mens Ultra Cotton T-Shirt, Style G2000,',rating:6400 ,offer:'SALE' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 12.00,newPrice:5.22, name: 'Essentials Mens Regular-Fit Short-Sleeve Crewneck T-Shirt',rating:6400 ,offer:'TOP SELLING' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 120.00,newPrice:100.00, name: '2.4G Remote Control Rc BB-8 Droid Football Robot',rating:6400 ,offer:'SOLD OUT' },
    { src: 'assets/images/product/jewellery/product-6.png', oldPrice: 100.00,newPrice:78.00, name: 'Calvin Klein womens Solid Sheath With Chiffon Bell Sleeves Dress' ,rating:6400 ,offer:'20% OFF'},
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 20.00,newPrice:17.00, name: 'Gildan Mens Ultra Cotton T-Shirt, Style G2000,',rating:6400 ,offer:'SALE' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 12.00,newPrice:5.22, name: 'Essentials Mens Regular-Fit Short-Sleeve Crewneck T-Shirt',rating:6400 ,offer:'TOP SELLING' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 120.00,newPrice:100.00, name: '2.4G Remote Control Rc BB-8 Droid Football Robot',rating:6400 ,offer:'SOLD OUT' },
    { src: 'assets/images/product/jewellery/product-6.png', oldPrice: 100.00,newPrice:78.00, name: 'Calvin Klein womens Solid Sheath With Chiffon Bell Sleeves Dress' ,rating:6400 ,offer:'20% OFF'},
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 20.00,newPrice:17.00, name: 'Gildan Mens Ultra Cotton T-Shirt, Style G2000,',rating:6400 ,offer:'SALE' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 12.00,newPrice:5.22, name: 'Essentials Mens Regular-Fit Short-Sleeve Crewneck T-Shirt',rating:6400 ,offer:'TOP SELLING' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 120.00,newPrice:100.00, name: '2.4G Remote Control Rc BB-8 Droid Football Robot',rating:6400 ,offer:'SOLD OUT' },
    { src: 'assets/images/product/jewellery/product-6.png', oldPrice: 100.00,newPrice:78.00, name: 'Calvin Klein womens Solid Sheath With Chiffon Bell Sleeves Dress' ,rating:6400 ,offer:'20% OFF'},
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 20.00,newPrice:17.00, name: 'Gildan Mens Ultra Cotton T-Shirt, Style G2000,',rating:6400 ,offer:'SALE' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 12.00,newPrice:5.22, name: 'Essentials Mens Regular-Fit Short-Sleeve Crewneck T-Shirt',rating:6400 ,offer:'TOP SELLING' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 120.00,newPrice:100.00, name: '2.4G Remote Control Rc BB-8 Droid Football Robot',rating:6400 ,offer:'SOLD OUT' },
    { src: 'assets/images/product/jewellery/product-6.png', oldPrice: 100.00,newPrice:78.00, name: 'Calvin Klein womens Solid Sheath With Chiffon Bell Sleeves Dress' ,rating:6400 ,offer:'20% OFF'},
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 20.00,newPrice:17.00, name: 'Gildan Mens Ultra Cotton T-Shirt, Style G2000,',rating:6400 ,offer:'SALE' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 12.00,newPrice:5.22, name: 'Essentials Mens Regular-Fit Short-Sleeve Crewneck T-Shirt',rating:6400 ,offer:'TOP SELLING' },
    { src: 'assets/images/product/fashion/product-20.png', oldPrice: 120.00,newPrice:100.00, name: '2.4G Remote Control Rc BB-8 Droid Football Robot',rating:6400 ,offer:'SOLD OUT' },
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
