import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-categorie',
  templateUrl: './categorie.component.html',
  styleUrls: ['./categorie.component.scss']
})
export class CategorieComponent implements OnInit {


  categories=[
    {src:'./assets/images/product/categories/cat-10.png',name:'Music'},
    {src:'./assets/images/product/categories/cat-10.png',name:'Sports'},
    {src:'./assets/images/product/categories/cat-10.png',name:'Utility'},
    {src:'./assets/images/product/categories/cat-10.png',name:'Virtual World'},
    {src:'./assets/images/product/categories/cat-10.png',name:'Photography'},
    {src:'./assets/images/product/categories/cat-10.png',name:'Art'},
    {src:'./assets/images/product/categories/cat-10.png',name:'Music'},
    {src:'./assets/images/product/categories/cat-10.png',name:'Music'},
    {src:'./assets/images/product/categories/cat-10.png',name:'Sports'},
    {src:'./assets/images/product/categories/cat-10.png',name:'Utility'},
    {src:'./assets/images/product/categories/cat-10.png',name:'Virtual World'},
    {src:'./assets/images/product/categories/cat-10.png',name:'Photography'},
    {src:'./assets/images/product/categories/cat-10.png',name:'Art'},
    {src:'./assets/images/product/categories/cat-10.png',name:'Utility'},
    {src:'./assets/images/product/categories/cat-10.png',name:'Virtual World'},
    {src:'./assets/images/product/categories/cat-10.png',name:'Photography'},
    {src:'./assets/images/product/categories/cat-10.png',name:'Utility'},
    {src:'./assets/images/product/categories/cat-10.png',name:'Virtual World'},
    {src:'./assets/images/product/categories/cat-10.png',name:'Photography'},
    {src:'./assets/images/product/categories/cat-10.png',name:'Virtual World'},
    {src:'./assets/images/product/categories/cat-10.png',name:'Photography'},



];

carouselOptions: OwlOptions = {
  margin:-130,
  nav:true,  
  dots:false,
  navSpeed:900,
  responsive: {
    0: { items: 1 },
 
    600: { items: 3 },

    1200: { items: 6 }
  },
  navText: [
    '<button class="slide-arrow prev-arrow slick-arrow" "><i class="fal fa-long-arrow-left"></i></button>',
    '<button class="slide-arrow next-arrow slick-arrow " "><i class="fal fa-long-arrow-right"></i></button>'
  ],
  slideBy: 6,
  

};

  constructor() { }

  ngOnInit(): void {
  }

}
