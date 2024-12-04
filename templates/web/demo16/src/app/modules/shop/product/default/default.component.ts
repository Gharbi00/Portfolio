import { Component, OnInit } from '@angular/core';
import { trigger, transition, animate, style } from '@angular/animations';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss'],
  animations: [
    trigger('translate', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }), // start from right
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0%)' })), // end at 0%
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateX(-100%)' })), // exit to left
      ]),
    ]),
  ],
})
export class DefaultComponent implements OnInit {

  images = [
    'assets/images/product/product-big-04.png',
    'assets/images/product/product-big-05.png',
    'assets/images/product/product-big-06.png',
    'assets/images/product/product-big-07.png',
    'assets/images/product/product-big-08.png'
  ];
  products=[
    {name:'Remote control',reduction:'25% OFF',oldPrice:'50',newPrice:'38',src:'assets/images/product/electric/product-01.png'},
    {name:'keyboard',reduction:'25% OFF',oldPrice:'50',newPrice:'38',src:'assets/images/product/electric/product-02.png'},
    {name:'Watch',reduction:'25% OFF',oldPrice:'50',newPrice:'38',src:'assets/images/product/electric/product-02.png'},
    {name:'HD Camera',reduction:'25% OFF',oldPrice:'50',newPrice:'38',src:'assets/images/product/electric/product-03.png'},
    {name:'Playstation',reduction:'25% OFF',oldPrice:'50',newPrice:'38',src:'assets/images/product/electric/product-04.png'},
    {name:'Remote control',reduction:'25% OFF',oldPrice:'50',newPrice:'38',src:'assets/images/product/electric/product-01.png'},
    {name:'Watch',reduction:'25% OFF',oldPrice:'50',newPrice:'38',src:'assets/images/product/electric/product-02.png'},
    {name:'HD Camera',reduction:'25% OFF',oldPrice:'50',newPrice:'38',src:'assets/images/product/electric/product-03.png'},
    {name:'Playstation',reduction:'25% OFF',oldPrice:'50',newPrice:'38',src:'assets/images/product/electric/product-04.png'},

  ];

  carouselOptions: OwlOptions = {
    items: 4,
    loop: true,
    nav: true,
    dots:false,
    navSpeed:1000,
    responsive: {
      0: { items: 1 },
      400: { items: 2},
      800: { items: 3 },
      1100: { items: 4 },

    },
    navText:['<button class="slide-arrow prev-arrow slick-arrow" style=""><i class="fal fa-long-arrow-left"></i></button>','<button class="slide-arrow next-arrow slick-arrow" style=""><i class="fal fa-long-arrow-right"></i></button>']
  };



  selectedImage: string = 'assets/images/product/product-big-04.png'; // Initialize with the default image
  thumbnails: string[] = [
    'assets/images/product/product-thumb/thumb-01.png',
    'assets/images/product/product-thumb/thumb-02.png',
    'assets/images/product/product-thumb/thumb-03.png',
    'assets/images/product/product-thumb/thumb-04.png',
    'assets/images/product/product-thumb/thumb-05.png'
  ];
  animateImageChange: boolean = false;
  
  changeImage(image: string,event: Event): void {
    event.preventDefault();
    this.selectedImage = image;
    this.animateImageChange = !this.animateImageChange; 
  }
  



  constructor() { }

  ngOnInit(): void {
  }

}
