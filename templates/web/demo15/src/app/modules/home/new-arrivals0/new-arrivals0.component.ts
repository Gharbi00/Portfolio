import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-new-arrivals0',
  templateUrl: './new-arrivals0.component.html',
  styleUrls: ['./new-arrivals0.component.scss']
})
export class NewArrivals0Component implements OnInit {
  products = [
    {src :'assets/images/product/electric/product-06.png',oldPrice:'50',newPrice:'40',name:'Top Handle Handbag' },
     {src :'assets/images/product/electric/product-06.png',oldPrice:'50',newPrice:'40',name:'Top Handle Handbag' },
     {src :'assets/images/product/electric/product-06.png',oldPrice:'50',newPrice:'40',name:'Top Handle Handbag' },
     {src :'assets/images/product/electric/product-06.png',oldPrice:'50',newPrice:'40',name:'Top Handle Handbag' },
     {src :'assets/images/product/electric/product-06.png',oldPrice:'50',newPrice:'40',name:'Top Handle Handbag' },
     {src :'assets/images/product/electric/product-06.png',oldPrice:'50',newPrice:'40',name:'Top Handle Handbag' },
     {src :'assets/images/product/electric/product-06.png',oldPrice:'50',newPrice:'40',name:'Top Handle Handbag' },
     {src :'assets/images/product/electric/product-06.png',oldPrice:'50',newPrice:'40',name:'Top Handle Handbag' },
     {src :'assets/images/product/electric/product-06.png',oldPrice:'50',newPrice:'40',name:'Top Handle Handbag' },
     {src :'assets/images/product/electric/product-06.png',oldPrice:'50',newPrice:'40',name:'Top Handle Handbag' },
     {src :'assets/images/product/electric/product-06.png',oldPrice:'50',newPrice:'40',name:'Top Handle Handbag' },
     {src :'assets/images/product/electric/product-06.png',oldPrice:'50',newPrice:'40',name:'Top Handle Handbag' },
     {src :'assets/images/product/electric/product-06.png',oldPrice:'50',newPrice:'40',name:'Top Handle Handbag' },
     {src :'assets/images/product/electric/product-06.png',oldPrice:'50',newPrice:'40',name:'Top Handle Handbag' },
     {src :'assets/images/product/electric/product-06.png',oldPrice:'50',newPrice:'40',name:'Top Handle Handbag' },
     {src :'assets/images/product/electric/product-06.png',oldPrice:'50',newPrice:'40',name:'Top Handle Handbag' },
     {src :'assets/images/product/electric/product-06.png',oldPrice:'50',newPrice:'40',name:'Top Handle Handbag' },
     {src :'assets/images/product/electric/product-06.png',oldPrice:'50',newPrice:'40',name:'Top Handle Handbag' },
     {src :'assets/images/product/electric/product-06.png',oldPrice:'50',newPrice:'40',name:'Top Handle Handbag' },
     {src :'assets/images/product/electric/product-06.png',oldPrice:'50',newPrice:'40',name:'Top Handle Handbag' },
     {src :'assets/images/product/electric/product-06.png',oldPrice:'50',newPrice:'40',name:'Top Handle Handbag' },


];





  carouselOptions: OwlOptions = {
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    nav: true,
    navSpeed: 900,
    items:4,
    responsive:{
      0:{items:1},
      500:{items:2},
      800:{items:3},
      1000:{items:4},
    },
    slideBy:4,
    navText:['<button class="slide-arrow prev-arrow slick-arrow" style=""><i class="fal fa-long-arrow-left"></i></button>','<button class="slide-arrow next-arrow slick-arrow" style=""><i class="fal fa-long-arrow-right"></i></button>'],


  }

  constructor() { }

  ngOnInit(): void {
  }

}
