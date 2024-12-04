import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-product1',
  templateUrl: './product1.component.html',
  styleUrls: ['./product1.component.scss']
})
export class Product1Component implements OnInit {
  products = [
    { src: 'assets/images/product/fashion/product-34.png', oldPrice: 50,newPrice:40, name: 'KIDS’ DOLLS',description:'Manhattan Toy Wee Baby Stella Peach 12" Soft Baby Doll', rating:1500,offer:'SOLD OUT' },
    { src: 'assets/images/product/fashion/product-34.png', oldPrice: 50,newPrice:40, name: 'KIDS’ DOLLS',description:'Business Women Suit Set 3 Pieces Notch Lapel Single Breasted Vest ', rating:1500,offer:'TOP SELLING' },
    { src: 'assets/images/product/fashion/product-34.png', oldPrice: 50,newPrice:40, name: 'KIDS’ DOLLS',description:'Skechers Mens Energy Afterburn Lace-Up Sneaker', rating:1500,offer:'20% OFF' },    
    { src: 'assets/images/product/fashion/product-34.png', oldPrice: 50,newPrice:40, name: 'KIDS’ DOLLS',description:'Men’s Suit Separates with Performance Stretch Fabric', rating:1500,offer:'SALE' },    
    { src: 'assets/images/product/fashion/product-34.png', oldPrice: 50,newPrice:40, name: 'KIDS’ DOLLS',description:'Manhattan Toy Wee Baby Stella Peach 12" Soft Baby Doll', rating:1500,offer:'SOLD OUT' },
    { src: 'assets/images/product/fashion/product-34.png', oldPrice: 50,newPrice:40, name: 'KIDS’ DOLLS',description:'Business Women Suit Set 3 Pieces Notch Lapel Single Breasted Vest ', rating:1500,offer:'TOP SELLING' },
    { src: 'assets/images/product/fashion/product-34.png', oldPrice: 50,newPrice:40, name: 'KIDS’ DOLLS',description:'Skechers Mens Energy Afterburn Lace-Up Sneaker', rating:1500,offer:'20% OFF' },    
    { src: 'assets/images/product/fashion/product-34.png', oldPrice: 50,newPrice:40, name: 'KIDS’ DOLLS',description:'Men’s Suit Separates with Performance Stretch Fabric', rating:1500,offer:'SALE' },    
    { src: 'assets/images/product/fashion/product-34.png', oldPrice: 50,newPrice:40, name: 'KIDS’ DOLLS',description:'Manhattan Toy Wee Baby Stella Peach 12" Soft Baby Doll', rating:1500,offer:'SOLD OUT' },
    { src: 'assets/images/product/fashion/product-34.png', oldPrice: 50,newPrice:40, name: 'KIDS’ DOLLS',description:'Business Women Suit Set 3 Pieces Notch Lapel Single Breasted Vest ', rating:1500,offer:'TOP SELLING' },
    { src: 'assets/images/product/fashion/product-34.png', oldPrice: 50,newPrice:40, name: 'KIDS’ DOLLS',description:'Skechers Mens Energy Afterburn Lace-Up Sneaker', rating:1500,offer:'20% OFF' },    
    { src: 'assets/images/product/fashion/product-34.png', oldPrice: 50,newPrice:40, name: 'KIDS’ DOLLS',description:'Men’s Suit Separates with Performance Stretch Fabric', rating:1500,offer:'SALE' },    
    { src: 'assets/images/product/fashion/product-34.png', oldPrice: 50,newPrice:40, name: 'KIDS’ DOLLS',description:'Manhattan Toy Wee Baby Stella Peach 12" Soft Baby Doll', rating:1500,offer:'SOLD OUT' },
    { src: 'assets/images/product/fashion/product-34.png', oldPrice: 50,newPrice:40, name: 'KIDS’ DOLLS',description:'Business Women Suit Set 3 Pieces Notch Lapel Single Breasted Vest ', rating:1500,offer:'TOP SELLING' },
    { src: 'assets/images/product/fashion/product-34.png', oldPrice: 50,newPrice:40, name: 'KIDS’ DOLLS',description:'Skechers Mens Energy Afterburn Lace-Up Sneaker', rating:1500,offer:'20% OFF' },    
    { src: 'assets/images/product/fashion/product-34.png', oldPrice: 50,newPrice:40, name: 'KIDS’ DOLLS',description:'Men’s Suit Separates with Performance Stretch Fabric', rating:1500,offer:'SALE' },    
    { src: 'assets/images/product/fashion/product-34.png', oldPrice: 50,newPrice:40, name: 'KIDS’ DOLLS',description:'Manhattan Toy Wee Baby Stella Peach 12" Soft Baby Doll', rating:1500,offer:'SOLD OUT' },
    { src: 'assets/images/product/fashion/product-34.png', oldPrice: 50,newPrice:40, name: 'KIDS’ DOLLS',description:'Business Women Suit Set 3 Pieces Notch Lapel Single Breasted Vest ', rating:1500,offer:'TOP SELLING' },
    { src: 'assets/images/product/fashion/product-34.png', oldPrice: 50,newPrice:40, name: 'KIDS’ DOLLS',description:'Skechers Mens Energy Afterburn Lace-Up Sneaker', rating:1500,offer:'20% OFF' },    
    { src: 'assets/images/product/fashion/product-34.png', oldPrice: 50,newPrice:40, name: 'KIDS’ DOLLS',description:'Men’s Suit Separates with Performance Stretch Fabric', rating:1500,offer:'SALE' },    
    { src: 'assets/images/product/fashion/product-34.png', oldPrice: 50,newPrice:40, name: 'KIDS’ DOLLS',description:'Manhattan Toy Wee Baby Stella Peach 12" Soft Baby Doll', rating:1500,offer:'SOLD OUT' },
    { src: 'assets/images/product/fashion/product-34.png', oldPrice: 50,newPrice:40, name: 'KIDS’ DOLLS',description:'Business Women Suit Set 3 Pieces Notch Lapel Single Breasted Vest ', rating:1500,offer:'TOP SELLING' },
    { src: 'assets/images/product/fashion/product-34.png', oldPrice: 50,newPrice:40, name: 'KIDS’ DOLLS',description:'Skechers Mens Energy Afterburn Lace-Up Sneaker', rating:1500,offer:'20% OFF' },    
    { src: 'assets/images/product/fashion/product-34.png', oldPrice: 50,newPrice:40, name: 'KIDS’ DOLLS',description:'Men’s Suit Separates with Performance Stretch Fabric', rating:1500,offer:'SALE' },    
    { src: 'assets/images/product/fashion/product-34.png', oldPrice: 50,newPrice:40, name: 'KIDS’ DOLLS',description:'Manhattan Toy Wee Baby Stella Peach 12" Soft Baby Doll', rating:1500,offer:'SOLD OUT' },
    { src: 'assets/images/product/fashion/product-34.png', oldPrice: 50,newPrice:40, name: 'KIDS’ DOLLS',description:'Business Women Suit Set 3 Pieces Notch Lapel Single Breasted Vest ', rating:1500,offer:'TOP SELLING' },
    { src: 'assets/images/product/fashion/product-34.png', oldPrice: 50,newPrice:40, name: 'KIDS’ DOLLS',description:'Skechers Mens Energy Afterburn Lace-Up Sneaker', rating:1500,offer:'20% OFF' },    
    { src: 'assets/images/product/fashion/product-34.png', oldPrice: 50,newPrice:40, name: 'KIDS’ DOLLS',description:'Men’s Suit Separates with Performance Stretch Fabric', rating:1500,offer:'SALE' },    
  ];

    carouselOptions: OwlOptions = {
    
      nav: true,
      dots: false,
      navSpeed: 900,
      items: 2,
      loop: false,
      pullDrag: true,
      responsive:{
        0:{items:1},

        600:{items:2},
       
      },
      slideBy: 2, // Specify the number of items to slide by
      navText:['<button class="slide-arrow prev-arrow slick-arrow" ><i class="fal fa-long-arrow-left"></i></button>','<button class="slide-arrow next-arrow slick-arrow" ><i class="fal fa-long-arrow-right"></i></button>']
    };
 

  constructor() { }

  ngOnInit(): void {
  }

}
