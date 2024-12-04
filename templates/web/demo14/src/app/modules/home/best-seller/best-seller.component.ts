import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-best-seller',
  templateUrl: './best-seller.component.html',
  styleUrls: ['./best-seller.component.scss']
})
export class BestSellerComponent implements OnInit {

  products = [
    { src: 'assets/images/product/nft/product-31.png', price: 5000, name: 'Anime01' },
    { src: 'assets/images/product/nft/product-32.png', price: 5500, name: 'Anime02' },
    { src: 'assets/images/product/nft/product-33.png', price: 6000, name: 'Anime03' },
    { src: 'assets/images/product/nft/product-31.png', price: 5000, name: 'Anime01' },
    { src: 'assets/images/product/nft/product-32.png', price: 5500, name: 'Anime02' },
    { src: 'assets/images/product/nft/product-33.png', price: 6000, name: 'Anime03' },
    { src: 'assets/images/product/nft/product-31.png', price: 5000, name: 'Anime01' },
    { src: 'assets/images/product/nft/product-32.png', price: 5500, name: 'Anime02' },
    { src: 'assets/images/product/nft/product-33.png', price: 6000, name: 'Anime03' },
    { src: 'assets/images/product/nft/product-31.png', price: 5000, name: 'Anime01' },
    { src: 'assets/images/product/nft/product-32.png', price: 5500, name: 'Anime02' },
    { src: 'assets/images/product/nft/product-33.png', price: 6000, name: 'Anime03' },
    { src: 'assets/images/product/nft/product-31.png', price: 5000, name: 'Anime01' },
    { src: 'assets/images/product/nft/product-32.png', price: 5500, name: 'Anime02' },
    { src: 'assets/images/product/nft/product-33.png', price: 6000, name: 'Anime03' },
    { src: 'assets/images/product/nft/product-31.png', price: 5000, name: 'Anime01' },
    { src: 'assets/images/product/nft/product-32.png', price: 5500, name: 'Anime02' },
    { src: 'assets/images/product/nft/product-33.png', price: 6000, name: 'Anime03' },
    { src: 'assets/images/product/nft/product-31.png', price: 5000, name: 'Anime01' },
    { src: 'assets/images/product/nft/product-32.png', price: 5500, name: 'Anime02' },
    { src: 'assets/images/product/nft/product-33.png', price: 6000, name: 'Anime03' },];

    carouselOptions: OwlOptions = {
      nav: true,
      dots: false,
      navSpeed: 900,
      loop: false,
      pullDrag: true,
      responsive: {
        0: { items: 1,},
        500: { items: 2, },
        750: { items: 3, },
        1000: { items: 4, }
      },
      slideBy: 4, // Specify the number of items to slide by
      navText:['<button class="slide-arrow prev-arrow slick-arrow" ><i class="fal fa-long-arrow-left"></i></button>','<button class="slide-arrow next-arrow slick-arrow" ><i class="fal fa-long-arrow-right"></i></button>']
    };

  constructor() { }

  ngOnInit(): void {
  }

}
