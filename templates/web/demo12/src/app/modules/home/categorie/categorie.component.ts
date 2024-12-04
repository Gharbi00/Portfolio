import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-categorie',
  templateUrl: './categorie.component.html',
  styleUrls: ['./categorie.component.scss']
})
export class CategorieComponent implements OnInit {


  categories=[
    {src:'./assets/images/product/categories/furni-1.png',name:'Sofa'},
    {src:'./assets/images/product/categories/furni-2.png',name:'Desk Table'},
    {src:'./assets/images/product/categories/furni-3.png',name:'Long Chair'},
    {src:'./assets/images/product/categories/furni-4.png',name:'Arm Chair'},
    {src:'./assets/images/product/categories/furni-5.png',name:'Mirror Table'},
    {src:'./assets/images/product/categories/furni-6.png',name:'Table'},
    {src:'./assets/images/product/categories/furni-7.png',name:'Round Table'},
    {src:'./assets/images/product/categories/furni-8.png',name:'Neon Sofa'},
    {src:'./assets/images/product/categories/furni-9.png',name:'Reading'},
    {src:'./assets/images/product/categories/furni-10.png',name:'Foilbacks'},
    {src:'./assets/images/product/categories/furni-11.png',name:'Wear Drove'},
    {src:'./assets/images/product/categories/furni-12.png',name:'Sofa Set'},
    {src:'./assets/images/product/categories/furni-1.png',name:'Sofa'},
    {src:'./assets/images/product/categories/furni-2.png',name:'Desk Table'},
    {src:'./assets/images/product/categories/furni-3.png',name:'Long Chair'},
    {src:'./assets/images/product/categories/furni-4.png',name:'Arm Chair'},
    {src:'./assets/images/product/categories/furni-5.png',name:'Mirror Table'},
    {src:'./assets/images/product/categories/furni-6.png',name:'Vintage Table'},
    {src:'./assets/images/product/categories/furni-7.png',name:'Round Table'},
    {src:'./assets/images/product/categories/furni-8.png',name:'Neon Sofa'},
    {src:'./assets/images/product/categories/furni-9.png',name:'Reading'},
    {src:'./assets/images/product/categories/furni-10.png',name:'Foilbacks'},
    {src:'./assets/images/product/categories/furni-11.png',name:'Wear Drove'},
    {src:'./assets/images/product/categories/furni-12.png',name:'Sofa Set'},




];

carouselOptions: OwlOptions = {
  
 
  autoplay:true,

 margin:10,
  loop:true,
  nav:false,  
  dots:false,
  slideBy:6,
  items:8,
  responsive: {
    0: { items: 1 },
    500: { items: 2 },
    600: { items: 3 },
    700: { items: 4 },
    800: { items: 5 },
 
    1000: { items: 6 },

  
  },
  

  autoplayTimeout:3000,
  autoplaySpeed:700,
  
  

};

  constructor() { }

  ngOnInit(): void {
  }

}
