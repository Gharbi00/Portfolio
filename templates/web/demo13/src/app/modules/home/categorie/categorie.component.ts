import { Component, OnInit , ElementRef } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';

declare var $: any; 
@Component({
  selector: 'app-categorie',
  templateUrl: './categorie.component.html',
  styleUrls: ['./categorie.component.scss']
})
export class CategorieComponent implements OnInit {
  carouselOptions: OwlOptions = {

    mouseDrag: true,
    touchDrag: true,
    pullDrag: true, // Disable pulling
    dots: false, // Disable dots
    items: 6,
    nav: true, // Disable Owl Carousel navigation since you're using custom buttons
    loop: false,
    navSpeed:900,
    responsive: {
      0: { items: 1 },
      200: { items: 2},
      400: { items: 3 },
      600: { items: 4 },
      800: { items: 5 },
      1000: { items: 6 }
    },
    slideBy:6,
  navText:['<button class="slide-arrow prev-arrow slick-arrow" "><i class="fal fa-long-arrow-left"></i></button>',' <button class="slide-arrow next-arrow slick-arrow " "><i class="fal fa-long-arrow-right"></i></button>']
    
    // Add other options as needed
  };

  categories = [
    { title: 'Phones', image: './assets/images/product/categories/elec-4.png' },
    { title: 'Computers', image: './assets/images/product/categories/elec-5.png' },
    { title: 'Accessories', image: './assets/images/product/categories/elec-11.png' },
    { title: 'Laptops', image: './assets/images/product/categories/elec-6.png' },
    { title: 'Monitors', image: './assets/images/product/categories/elec-2.png' },
    { title: 'Networking', image: './assets/images/product/categories/elec-7.png' },
    { title: 'PC Gaming', image: './assets/images/product/categories/elec-8.png' },
    { title: 'Smartwatches', image: './assets/images/product/categories/elec-1.png' },
    { title: 'Headphones', image: './assets/images/product/categories/elec-9.png' },
    { title: 'Camera & Photo', image: './assets/images/product/categories/elec-10.png' },
    { title: 'Video Games', image: './assets/images/product/categories/elec-8.png' },
    { title: 'Sports', image: './assets/images/product/categories/elec-1.png' },
    { title: 'Phones', image: './assets/images/product/categories/elec-4.png' },
    { title: 'Computers', image: './assets/images/product/categories/elec-5.png' },
    { title: 'Accessories', image: './assets/images/product/categories/elec-11.png' },
    { title: 'Headphones', image: './assets/images/product/categories/elec-9.png' },
    { title: 'Camera & Photo', image: './assets/images/product/categories/elec-10.png' },
    { title: 'Headphones', image: './assets/images/product/categories/elec-9.png' },
    { title: 'Camera & Photo', image: './assets/images/product/categories/elec-10.png' },
  ];


  constructor(private el: ElementRef) {}

  moveNextGroup() {
    const owlInstance: any = document.querySelector('.owl-carousel');
    if (owlInstance) {
      owlInstance.next(6);
    }
  }

  movePrevGroup() {
    const owlInstance: any = document.querySelector('.owl-carousel');
    if (owlInstance) {
      owlInstance.prev(6);
    }
  }

  ngOnInit(): void {
  }

}
