import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-new-arrivals',
  templateUrl: './new-arrivals.component.html',
  styleUrls: ['./new-arrivals.component.scss']
})
export class NewArrivalsComponent implements OnInit {


  products = [
    {src :'assets/images/product/jewellery/product-1.png',oldPrice:'50',newPrice:'40',name:'Diamond Locket',reduction:'20% OFF' },
    {src :'assets/images/product/jewellery/product-1.png',oldPrice:'50',newPrice:'40',name:'Diamond Locket',reduction:'20% OFF' },
    {src :'assets/images/product/jewellery/product-1.png',oldPrice:'50',newPrice:'40',name:'Diamond Locket',reduction:'20% OFF' },
    {src :'assets/images/product/jewellery/product-1.png',oldPrice:'50',newPrice:'40',name:'Diamond Locket',reduction:'20% OFF' },
    {src :'assets/images/product/jewellery/product-1.png',oldPrice:'50',newPrice:'40',name:'Diamond Locket',reduction:'20% OFF' },
    {src :'assets/images/product/jewellery/product-1.png',oldPrice:'50',newPrice:'40',name:'Diamond Locket',reduction:'20% OFF' },
    {src :'assets/images/product/jewellery/product-1.png',oldPrice:'50',newPrice:'40',name:'Diamond Locket',reduction:'20% OFF' },
    {src :'assets/images/product/jewellery/product-1.png',oldPrice:'50',newPrice:'40',name:'Diamond Locket',reduction:'20% OFF' },
    {src :'assets/images/product/jewellery/product-1.png',oldPrice:'50',newPrice:'40',name:'Diamond Locket',reduction:'20% OFF' },
    {src :'assets/images/product/jewellery/product-1.png',oldPrice:'50',newPrice:'40',name:'Diamond Locket',reduction:'20% OFF' },
    {src :'assets/images/product/jewellery/product-1.png',oldPrice:'50',newPrice:'40',name:'Diamond Locket',reduction:'20% OFF' },
    {src :'assets/images/product/jewellery/product-1.png',oldPrice:'50',newPrice:'40',name:'Diamond Locket',reduction:'20% OFF' },
    {src :'assets/images/product/jewellery/product-1.png',oldPrice:'50',newPrice:'40',name:'Diamond Locket',reduction:'20% OFF' },
    {src :'assets/images/product/jewellery/product-1.png',oldPrice:'50',newPrice:'40',name:'Diamond Locket',reduction:'20% OFF' },
    {src :'assets/images/product/jewellery/product-1.png',oldPrice:'50',newPrice:'40',name:'Diamond Locket',reduction:'20% OFF' },
    {src :'assets/images/product/jewellery/product-1.png',oldPrice:'50',newPrice:'40',name:'Diamond Locket',reduction:'20% OFF' },
    {src :'assets/images/product/jewellery/product-1.png',oldPrice:'50',newPrice:'40',name:'Diamond Locket',reduction:'20% OFF' },
    {src :'assets/images/product/jewellery/product-1.png',oldPrice:'50',newPrice:'40',name:'Diamond Locket',reduction:'20% OFF' },
    {src :'assets/images/product/jewellery/product-1.png',oldPrice:'50',newPrice:'40',name:'Diamond Locket',reduction:'20% OFF' },
    {src :'assets/images/product/jewellery/product-1.png',oldPrice:'50',newPrice:'40',name:'Diamond Locket',reduction:'20% OFF' },


];





  carouselOptions: OwlOptions = {
    
    
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    nav: true,
    navSpeed: 900,
    dots:false,
    items:4,
    slideBy:4,
    navText:['<button class="slide-arrow prev-arrow slick-arrow" style=""><i class="fal fa-long-arrow-left"></i></button>','<button class="slide-arrow next-arrow slick-arrow" style=""><i class="fal fa-long-arrow-right"></i></button>'],
    responsive:{
      0:{items:1},
      500:{items:2},
      800:{items:3},
      1000:{items:4},
    },

  }
  constructor() { }

  ngOnInit(): void {
  }

}
