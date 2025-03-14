import { Component, OnInit, OnDestroy } from '@angular/core';
import { CategorySlider, ProductSlider } from '../../shared/data/slider';
import { Product } from '../../shared/classes/product';
import { ProductService } from '../../shared/services/product.service';
import { customSlider } from '../../shared/data/slider';
import { NewProductsCarousel2 } from '../../shared/data/slider';
import { NewProductsData } from '../../shared/data/portfolio';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  public NewProductsData=NewProductsData;
public NewProductsCarousel2=NewProductsCarousel2;
  public themeLogo: string = '../assets/images/icon/logo/22.png'; // Change Logo
  public customSlider=customSlider;
  public products: Product[] = [];
  public productCollections: any[] = [];
  public active;

  public CategorySliderConfig: any = CategorySlider;
  public ProductSliderConfig: any = ProductSlider;

  constructor(public productService: ProductService,
    ) { 
    this.productService.getProducts.subscribe(response => {
      this.products = response.filter(item => item.type == 'home');
      // Get Product Collection
      this.products.filter((item) => {
        item.collection.filter((collection) => {
          const index = this.productCollections.indexOf(collection);
          if (index === -1) this.productCollections.push(collection);
        })
      })
    });
  }

  

  // sliders
  public sliders = [{
    title: 'special offer',
    subTitle: 'men home',
    image: 'assets/images/slider/23.jpg'
  }, {
    title: 'special offer',
    subTitle: 'men home',
    image: 'assets/images/slider/24.jpg'
  }];


  public sizes = ['size 06', 'size 07', 'size 08', 'size 09', 'size 10'];

  // Categories
  public categories = [{
    image: 'assets/images/icon/cat1.png',
    title: 'sport home'
  }, {
    image: 'assets/images/icon/cat2.png',
    title: 'casual home'
  }, {
    image: 'assets/images/icon/cat3.png',
    title: 'formal home'
  }, {
    image: 'assets/images/icon/cat4.png',
    title: 'flat'
  }, {
    image: 'assets/images/icon/cat5.png',
    title: 'heels'
  }, {
    image: 'assets/images/icon/cat6.png',
    title: 'boots'
  }, {
    image: 'assets/images/icon/cat1.png',
    title: 'sport home'
  }];

  // Collection banner
  public collections1 = [{
    image: 'assets/images/collection/home/1.png',
    save: 'save 50%',
    title: 'men'
  }, {
    image: 'assets/images/collection/home/2.png',
    save: 'save 50%',
    title: 'women'
  }];

  // Collection banner
  public collections2 = [{
    image: 'assets/images/categories/14.png',
    title: 'men'
  }, {
    image: 'assets/images/categories/15.png',
    title: 'women'
  }, {
    image: 'assets/images/categories/16.png',
    title: 'kids'
  }];

  // Blog
  public blogs = [{
    image: 'assets/images/blog/33.jpg',
    date: '25 January 2018',
    title: 'Lorem ipsum dolor sit consectetur adipiscing elit,',
    by: 'John Dio'
  }, {
    image: 'assets/images/blog/34.jpg',
    date: '26 January 2018',
    title: 'Lorem ipsum dolor sit consectetur adipiscing elit,',
    by: 'John Dio'
  }, {
    image: 'assets/images/blog/35.jpg',
    date: '27 January 2018',
    title: 'Lorem ipsum dolor sit consectetur adipiscing elit,',
    by: 'John Dio'
  }, {
    image: 'assets/images/blog/36.jpg',
    date: '28 January 2018',
    title: 'Lorem ipsum dolor sit consectetur adipiscing elit,',
    by: 'John Dio'
  }];

  // Logo
  public logos = [{
    image: 'assets/images/logos/1.png',
  }, {
    image: 'assets/images/logos/2.png',
  }, {
    image: 'assets/images/logos/3.png',
  }, {
    image: 'assets/images/logos/4.png',
  }, {
    image: 'assets/images/logos/5.png',
  }, {
    image: 'assets/images/logos/6.png',
  }, {
    image: 'assets/images/logos/7.png',
  }, {
    image: 'assets/images/logos/8.png',
  }];

  ngOnInit(): void {
    // Change color for this layout
    document.documentElement.style.setProperty('--theme-deafult', '#3fdda7');
  }

  ngOnDestroy(): void {
    // Remove Color
    document.documentElement.style.removeProperty('--theme-deafult');
  }

  // Product Tab collection
  getCollectionProducts(collection) {
    return this.products.filter((item) => {
      return item.collection.find(i => i === collection);
    });
  }
  
}
