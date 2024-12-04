import { Injectable, HostListener } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Menu
export interface Menu {
	path?: string;
	title?: string;
	type?: string;
	megaMenu?: boolean;
	image?: string;
	active?: boolean;
	badge?: boolean;
	badgeText?: string;
	children?: Menu[];
}

@Injectable({
	providedIn: 'root'
})

export class NavService {

	constructor() { }

	public screenWidth: any;
	public leftMenuToggle: boolean = false;
	public mainMenuToggle: boolean = false;

	// Windows width
	@HostListener('window:resize', ['$event'])
	onResize(event?) {
		this.screenWidth = window.innerWidth;
	}

	MENUITEMS: Menu[] = [

		{
		 path: '/shop',  type: 'sub' ,title: 'Shop', active: false, 
		},
		{
			path: '/about-us',  type: 'sub' ,title: 'About', active: false, 
		   },
		   {
			path: '/blog',  type: 'sub' ,title: 'Blog', active: false, 
		   },
		   {
			path: '/contact',  type: 'sub' ,title: 'Contact', active: false, 
		   },



	];

	LEFTMENUITEMS: Menu[] = [
		{
			title: 'clothing', type: 'sub', megaMenu: true, active: false, children: [
			  {
				  title: 'mens fashion',  type: 'link', active: false, children: [
					  { path: '/', title: 'sports wear',  type: 'link' },
					  { path: '/', title: 'top',  type: 'link' },
					  { path: '/', title: 'bottom',  type: 'link' },
					  { path: '/', title: 'ethic wear',  type: 'link' },
					  { path: '/', title: 'sports wear',  type: 'link' },
					  { path: '/', title: 'shirts',  type: 'link' },
					  { path: '/', title: 'bottom',  type: 'link' },
					  { path: '/', title: 'ethic wear',  type: 'link' },
					  { path: '/', title: 'sports wear',  type: 'link' }
				  ]
			  },
			  {
				  title: 'women fashion',  type: 'link', active: false, children: [
					  { path: '/', title: 'dresses',  type: 'link' },
					  { path: '/', title: 'skirts',  type: 'link' },
					  { path: '/', title: 'westarn wear',  type: 'link' },
					  { path: '/', title: 'ethic wear',  type: 'link' },
					  { path: '/', title: 'bottom',  type: 'link' },
					  { path: '/', title: 'ethic wear',  type: 'link' },
					  { path: '/', title: 'sports wear',  type: 'link' },
					  { path: '/', title: 'sports wear',  type: 'link' },
					  { path: '/', title: 'bottom wear',  type: 'link' }
				  ]
			  },
			]
		},
		{
			title: 'bags', type: 'sub', active: false, children: [
			  { path: '/', title: 'shopper bags', type: 'link' },
			  { path: '/', title: 'laptop bags', type: 'link' },
			  { path: '/', title: 'clutches', type: 'link' },
			  {
				  path: '/', title: 'purses', type: 'link', active: false, children: [
					  { path: '/', title: 'purses',  type: 'link' },
					  { path: '/', title: 'wallets',  type: 'link' },
					  { path: '/', title: 'leathers',  type: 'link' },
					  { path: '/', title: 'satchels',  type: 'link' }
				  ]
			  },
			]
		},
		{
			title: 'footwear', type: 'sub', active: false, children: [
			  { path: '/', title: 'sport shoes', type: 'link' },
			  { path: '/', title: 'formal shoes', type: 'link' },
			  { path: '/', title: 'casual shoes', type: 'link' }
			]
		},
		{
			path: '/', title: 'watches', type: 'link'
		},
		{
			title: 'Accessories', type: 'sub', active: false, children: [
			  { path: '/', title: 'fashion jewellery', type: 'link' },
			  { path: '/', title: 'caps and hats', type: 'link' },
			  { path: '/', title: 'precious jewellery', type: 'link' },
			  {
				  path: '/', title: 'more..', type: 'link', active: false, children: [
					  { path: '/', title: 'necklaces',  type: 'link' },
					  { path: '/', title: 'earrings',  type: 'link' },
					  { path: '/', title: 'rings & wrist wear',  type: 'link' },
					  {
						  path: '/', title: 'more...',  type: 'link', active: false, children: [
							  { path: '/', title: 'ties',  type: 'link' },
							  { path: '/', title: 'cufflinks',  type: 'link' },
							  { path: '/', title: 'pockets squares',  type: 'link' },
							  { path: '/', title: 'helmets',  type: 'link' },
							  { path: '/', title: 'scarves',  type: 'link' },
							  {
								  path: '/', title: 'more...',  type: 'link', active: false, children: [
									  { path: '/', title: 'accessory gift sets',  type: 'link' },
									  { path: '/', title: 'travel accessories',  type: 'link' },
									  { path: '/', title: 'phone cases',  type: 'link' }
								  ]
							  },
						]
					  }
				  ]
			  },
			]
		},
		{
			path: '/', title: 'house of design', type: 'link'
		},
		{
			title: 'beauty & personal care', type: 'sub', active: false, children: [
			  { path: '/', title: 'makeup', type: 'link' },
			  { path: '/', title: 'skincare', type: 'link' },
			  { path: '/', title: 'premium beaty', type: 'link' },
			  {
				  path: '/', title: 'more..', type: 'link', active: false, children: [
					  { path: '/', title: 'fragrances',  type: 'link' },
					  { path: '/', title: 'luxury beauty',  type: 'link' },
					  { path: '/', title: 'hair care',  type: 'link' },
					  { path: '/', title: 'tools & brushes',  type: 'link' }
				  ]
			  },
			]
		},
		{
			path: '/', title: 'home & decor', type: 'link'
		},
		{
			path: '/', title: 'kitchen', type: 'link'
		}
	];

	// Array
	items = new BehaviorSubject<Menu[]>(this.MENUITEMS);
	leftMenuItems = new BehaviorSubject<Menu[]>(this.LEFTMENUITEMS);

}
