import { Component, OnInit, Input, HostListener } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Input() class: string = 'header-2';
  @Input() themeLogo: string = '../assets/images/icon/logo/f11.png'; // Default Logo
  @Input() topbar: boolean = true; // Default True
  @Input() sticky: boolean = false; // Default false
  
  public stick: boolean = false;

  constructor() {window.addEventListener('scroll', this.handleScroll.bind(this)) }

  ngOnInit(): void {
  }

  // @HostListener Decorator
  @HostListener("window:scroll", [])
  
  onWindowScroll() {
    let number = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (number >= 150 && window.innerWidth > 400) { 
      this.stick = true;
    } else {
      this.stick = false;
    }
  }
  handleScroll() {
    const scrollPosition = window.scrollY;
    const scrollableDiv = document.querySelector('.scrollable-div') as HTMLElement;

    if (scrollPosition >= 480) {
      scrollableDiv.classList.add('fixed-div');
    } else {
      scrollableDiv.classList.remove('fixed-div');
    }
  }
  
  

}