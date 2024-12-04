import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-categorie',
  templateUrl: './categorie.component.html',
  styleUrls: ['./categorie.component.scss']
})
export class CategorieComponent implements OnInit {


  categories=[
    {src:'./assets/images/product/categories/jewelry-5.png',name:'Foilbacks'},
    {src:'./assets/images/product/categories/jewelry-4.png',name:'Estate Jewellery'},
    {src:'./assets/images/product/categories/jewelry-3.png',name:'Base metals'},
    {src:'./assets/images/product/categories/jewelry-2.png',name:'Barrette'},
    {src:'./assets/images/product/categories/jewelry-6.png',name:'Kalabubu'},
    {src:'./assets/images/product/categories/jewelry-7.png',name:'Medallion'},
    {src:'./assets/images/product/categories/jewelry-8.png',name:'Nawarat ring'},
    {src:'./assets/images/product/categories/jewelry-1.png',name:'Anklet'},
    {src:'./assets/images/product/categories/jewelry-9.png',name:'Pledge Pins'},
    {src:'./assets/images/product/categories/jewelry-10.png',name:'Prayer Jewellery'},
    {src:'./assets/images/product/categories/jewelry-11.png',name:'Slave bracelet'},
    {src:'./assets/images/product/categories/jewelry-5.png',name:'Foilbacks'},
    {src:'./assets/images/product/categories/jewelry-4.png',name:'Estate Jewellery'},
    {src:'./assets/images/product/categories/jewelry-3.png',name:'Base metals'},
    {src:'./assets/images/product/categories/jewelry-2.png',name:'Barrette'},
    {src:'./assets/images/product/categories/jewelry-6.png',name:'Kalabubu'},
    {src:'./assets/images/product/categories/jewelry-7.png',name:'Medallion'},
    {src:'./assets/images/product/categories/jewelry-8.png',name:'Nawarat ring'},
    {src:'./assets/images/product/categories/jewelry-1.png',name:'Anklet'},
    {src:'./assets/images/product/categories/jewelry-9.png',name:'Pledge Pins'},
    {src:'./assets/images/product/categories/jewelry-10.png',name:'Prayer Jewellery'},
    {src:'./assets/images/product/categories/jewelry-11.png',name:'Slave bracelet'},



];

carouselOptions: OwlOptions = {
  margin:-130,
  nav:true,  
  dots:false,
  navSpeed:900,
  responsive: {
    0: { items: 1 },
 
    500: { items: 3 },

    1200: { items: 6 }
  },
  navText: [
    '<i class="fal fa-long-arrow-left"></i>',
    '<i class="fal fa-long-arrow-right"></i>'
  ],
  slideBy: 6,
  

};

  constructor() { }

  ngOnInit(): void {
  }

}
