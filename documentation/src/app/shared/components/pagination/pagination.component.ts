import { Component, OnInit } from '@angular/core';
import { fadeAnimations } from '../../animations';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  animations: [fadeAnimations],
})
export class PaginationComponent implements  OnInit {
  currentPageIndex: number = -1;
   listSource = [
    { name: 'Introduction', route: '/' },
    { name: 'What’s new', route: '/news' },
    { name: 'Levels', route: '/levels' },
    { name: 'Wallets', route: '/wallets' },
    { name: 'Cashback', route: '/cashback' },
    { name: 'Cards', route: '/cards' },
    { name: 'Email Service', route: '/email-service' },
    { name: 'Push Notifications', route: '/push-notifications' },
    { name: 'SMS Service', route: '/sms-service' },
    { name: 'Web', route: '/web' },
    { name: 'iOS', route: '/ios' },
    { name: 'Android', route: '/android' },
    { name: 'React Native', route: '/react-native' },
    { name: 'Flutter', route: '/flutter' },
    { name: 'Generic Mobile', route: '/mobile' },
    { name: 'POS System', route: '/pos-system' },
    { name: 'Overview', route: '/overview' },
    { name: 'Authentication', route: '/authentication' },
    { name: 'Player Login', route: '/player-login' },
    { name: 'Player Check', route: '/check-api' },
    { name: 'Wallet Push', route: '/push-api' },
    { name: 'Wallet Deduct', route: '/deduct-api' },
    { name: 'Widget Setup', route: '/widget-setup' },
    { name: 'Get Outbound', id: 19, route: '/outbound-last' },
    { name: 'Ack. Outbound', id: 19, route: '/outbound-read' },
    { name: 'Magento', route: '/magento' },
    { name: 'Shopify', route: '/shopify' },
    { name: 'Prestashop', route: '/prestashop' },
    { name: 'Wordpress', route: '/wordpress' },
    { name: 'Wix', route: '/wix' },
    { name: 'npm', route: '/npm' },
    { name: 'dart', route: '/dart' },
    { name: 'gradle', route: '/gradle' },
  ];
  constructor(private router: Router) {
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      const currentRoute = this.router.url; // Remove query parameters
      this.currentPageIndex = this.listSource.findIndex(page => page.route === currentRoute);
      console.log(this.currentPageIndex); // Log here to ensure it's after the update
    });
   }

  ngOnInit(): void {

  }

  getPreviousPage(): { name: string, route: string } | null {
    return this.currentPageIndex > 0 ? this.listSource[this.currentPageIndex - 1] : null;
  }

  getNextPage(): { name: string, route: string } | null {
    return this.currentPageIndex < this.listSource.length - 1 ? this.listSource[this.currentPageIndex + 1] : null;
  }
}

