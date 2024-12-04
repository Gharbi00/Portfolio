import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {

  categories = [{src1 :'assets/images/product/electric/product-01.png',src2:'assets/images/product/electric/product-08.png',reduction:'20% Off' },

  {src1 :'assets/images/product/electric/product-01.png',src2:'assets/images/product/electric/product-08.png',reduction:'20% Off' },
  {src1 :'assets/images/product/electric/product-01.png',src2:'assets/images/product/electric/product-08.png',reduction:'20% Off' },
  {src1 :'assets/images/product/electric/product-01.png',src2:'assets/images/product/electric/product-08.png',reduction:'20% Off' },
  {src1 :'assets/images/product/electric/product-01.png',src2:'assets/images/product/electric/product-08.png',reduction:'20% Off' },
  {src1 :'assets/images/product/electric/product-01.png',src2:'assets/images/product/electric/product-08.png',reduction:'20% Off' },
  {src1 :'assets/images/product/electric/product-01.png',src2:'assets/images/product/electric/product-08.png',reduction:'20% Off' },
  {src1 :'assets/images/product/electric/product-01.png',src2:'assets/images/product/electric/product-08.png',reduction:'20% Off' },
  {src1 :'assets/images/product/electric/product-01.png',src2:'assets/images/product/electric/product-08.png',reduction:'20% Off' },
  {src1 :'assets/images/product/electric/product-01.png',src2:'assets/images/product/electric/product-08.png',reduction:'20% Off' },
  {src1 :'assets/images/product/electric/product-01.png',src2:'assets/images/product/electric/product-08.png',reduction:'20% Off' },
  {src1 :'assets/images/product/electric/product-01.png',src2:'assets/images/product/electric/product-08.png',reduction:'20% Off' },
  {src1 :'assets/images/product/electric/product-01.png',src2:'assets/images/product/electric/product-08.png',reduction:'20% Off' },
  {src1 :'assets/images/product/electric/product-01.png',src2:'assets/images/product/electric/product-08.png',reduction:'20% Off' },
  {src1 :'assets/images/product/electric/product-01.png',src2:'assets/images/product/electric/product-08.png',reduction:'20% Off' },
  {src1 :'assets/images/product/electric/product-01.png',src2:'assets/images/product/electric/product-08.png',reduction:'20% Off' },
  {src1 :'assets/images/product/electric/product-01.png',src2:'assets/images/product/electric/product-08.png',reduction:'20% Off' },
  {src1 :'assets/images/product/electric/product-01.png',src2:'assets/images/product/electric/product-08.png',reduction:'20% Off' },

]; // Add your category data here

  carouselOptions: OwlOptions = {
    items: 4,
    loop: true,
    nav: true,
    dots:false,
    navSpeed:900,
    responsive: {
      0: { items: 1 },
      500: { items: 2},
      800: { items: 3 },
      1000: { items: 4 },

    },
    slideBy:4,
    navText:['<button class="slide-arrow prev-arrow slick-arrow" style=""><i class="fal fa-long-arrow-left"></i></button>','<button class="slide-arrow next-arrow slick-arrow" style=""><i class="fal fa-long-arrow-right"></i></button>']
  };

  constructor() { }

  ngOnInit(): void {
  }

}
