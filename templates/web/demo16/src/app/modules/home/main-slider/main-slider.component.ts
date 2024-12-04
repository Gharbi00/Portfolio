import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
@Component({
  selector: 'app-main-slider',
  templateUrl: './main-slider.component.html',
  styleUrls: ['./main-slider.component.scss']
})
export class MainSliderComponent implements OnInit {
  products = [
    { src: 'assets/images/product/product-40.png', name: 'Bloosom Smat Watch',  },
    { src: 'assets/images/product/product-46.png', name: 'Delux Brand Watch',  },
    { src: 'assets/images/product/product-40.png', name: 'Bloosom Smat Watch', },

/*     { src: 'assets/images/product/nft/product-17.png', name: 'Wild Safari', price: 3900 },
    { src: 'assets/images/product/nft/product-17.png', name: 'Ocean Serenity', price: 3100 },
    { src: 'assets/images/product/nft/product-17.png', name: 'City Lights', price: 4500 },
    { src: 'assets/images/product/nft/product-17.png', name: 'Digital Harmony', price: 3200 },
    { src: 'assets/images/product/nft/product-17.png', name: 'Mystic Sunset', price: 3700 } */



  ];

  carouselOptions: OwlOptions = {
    
    center: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    dotsSpeed: 900,
    dotsEach:true,
    items:1,
    slideBy:1,
    


  }






  constructor() { }


  ngOnInit(): void {
  }

}
