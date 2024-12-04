import { Component, HostListener, OnInit } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { filter } from 'rxjs/operators';
import { fadeAnimations } from '../../animations';



@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
  animations: [fadeAnimations],
  
})
export class MainLayoutComponent implements OnInit {

  showButton: boolean = false;

  scrollThreshold: number = 500;

  isCollapsed = false;
  pagesList = [
    { 
      title: 'Getting Started',
      accordionId: 1,
      accordionState:false,
      pages: [
        { name: 'Introduction', id: 1, route: '/introduction' },
        { name: 'What’s new', id: 2, route: '/news' },
      ],
    },
    {
      title: 'Configuration',
      accordionId: 2,
      accordionState:false,
      pages: [
        { name: 'Levels', id: 3, route: '/levels' },
        { name: 'Wallets', id: 4, route: '/wallets' },
        { name: 'Cashback', id: 5, route: '/cashback' },
        { name: 'Cards', id: 6, route: '/cards' },
        { name: 'Email Service', id: 7, route: '/email-service' },
        { name: 'Push Notifications', id: 8, route: '/push-notifications' },
        { name: 'SMS Service', id: 9, route: '/sms-service' },
      ],
    },
    {
      title: 'Installation',
      accordionId: 3,
      accordionState:false,
      pages: [
        { name: 'Web', id: 10, route: '/web' },
        { name: 'iOS', id: 11, route: '/ios' },
        { name: 'Android', id: 12, route: '/android' },
        { name: 'React Native', id: 13, route: '/react-native' },
        { name: 'Flutter', id: 14, route: '/flutter' },
        { name: 'Generic Mobile', id: 15, route: '/mobile' },
        { name: 'POS System', id: 16, route: '/pos-system' },
      ],
    },
    {
      title: 'Rest API',
      accordionId: 4,
      accordionState:false,
      pages: [
        { name: 'Overview', id: 17, route: '/overview' },
        { name: 'Authentication', id: 18, route: '/authentication' },
        { name: 'Player Login', id: 19, route: '/player-login' },
        { name: 'Player Check', id: 19, route: '/check-api' },
        { name: 'Wallet Push', id: 19, route: '/push-api' },
        { name: 'Wallet Deduct', id: 19, route: '/deduct-api' },
        { name: 'Player Logout', id: 19, route: '/logout-api' },
        { name: 'Widget Setup', id: 19, route: '/widget-setup' },
        { name: 'Get Outbound', id: 19, route: '/outbound-last' },
        { name: 'Ack. Outbound', id: 19, route: '/outbound-read' },
      ],
    },
    {
      title: 'Plugins',
      accordionId: 5,
      accordionState:false,
      pages: [
        { name: 'Magento', id: 21, route: '/magento' },
        { name: 'Shopify', id: 22, route: '/shopify' },
        { name: 'Prestashop', id: 23, route: '/prestashop' },
        { name: 'Wordpress', id: 24, route: '/wordpress' },
        { name: 'Wix', id: 25, route: '/wix' },
      ],
    },
    {
      title: 'Packages',
      accordionId: 6,
      accordionState:false,
      pages: [
        { name: 'npm', id: 26, route: '/npm' },
        { name: 'dart', id: 27, route: '/dart' },
        { name: 'gradle', id: 28, route: '/gradle' },
      ],
    },
  ];

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }
/*   this.router.events
  .pipe(filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd))
  .subscribe((event: NavigationEnd) => {
    const currentRoute = event.urlAfterRedirects.split('?')[0]; // Remove query parameters
    this.updateAccordionState(currentRoute);
  });
 */
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.showButton = scrollPosition >= this.scrollThreshold;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  activeAccordionId: number | null = null;
  constructor(private router: Router) {}



  ngOnInit(): void {
    this.updateAccordionState(this.router.url);

    this.router.events
    .pipe(filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      const currentRoute = event.urlAfterRedirects.split('?')[0]; // Remove query parameters
      this.updateAccordionState(currentRoute);
    });
  }

  updateAccordionState(url: string): void {
    for (const category of this.pagesList) {
      category.accordionState = category.pages.some(page => url.includes(page.route));
    }
  }

  toggleAccordion(id: number): void {
    for (const category of this.pagesList) {
      if (category.accordionId === id) {
        category.accordionState = !category.accordionState;
      } else {
        category.accordionState = false; // Close other accordions
      }
    }
  }

  isAccordionOpen(id: number): boolean {
    const category = this.pagesList.find(category => category.accordionId === id);
    return category ? category.accordionState : false;
  }
  }





