/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, EventEmitter, Output, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
// import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

// Menu Pachage
// import MetisMenu from 'metismenujs';

import { MENU } from './menu';
import { MenuItem } from './menu.model';
import { ELEVOK_LOGO, ELEVOK_SMALL_LOGO } from '../../../environments/environment';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'sifca-monorepo-horizontal-topbar',
  templateUrl: './horizontal-topbar.component.html',
  styleUrls: ['./horizontal-topbar.component.scss'],
})
export class HorizontalTopbarComponent implements OnInit {
  menu: any;
  elevokLogo = ELEVOK_LOGO;
  elevokSmallLogo = ELEVOK_SMALL_LOGO;
  menuItems: MenuItem[] = [];
  @ViewChild('sideMenu') sideMenu!: ElementRef;
  @Output() mobileMenuButtonClicked = new EventEmitter();

  constructor(public translate: TranslateService, @Inject(PLATFORM_ID) private platformId: Object, @Inject(DOCUMENT) private document: Document) {
    translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    // Menu Items
    this.menuItems = MENU;
  }

  /***
   * Activate droup down set
   */
  // tslint:disable-next-line: use-lifecycle-interface
  ngAfterViewInit() {
    this.initActiveMenu();
  }

  removeActivation(items: any) {
    items.forEach((item: any) => {
      if (item.classList.contains('menu-link')) {
        if (!item.classList.contains('active')) {
          item.setAttribute('aria-expanded', false);
        }
        // tslint:disable-next-line: no-unused-expression
        item.nextElementSibling ? item.nextElementSibling.classList.remove('show') : null;
      }
      if (item.classList.contains('nav-link')) {
        if (item.nextElementSibling) {
          item.nextElementSibling.classList.remove('show');
        }
        item.setAttribute('aria-expanded', false);
      }
      item.classList.remove('active');
    });
  }

  // remove active items of two-column-menu
  activateParentDropdown(item: any) {
    // navbar-nav menu add active
    item.classList.add('active');
    const parentCollapseDiv = item.closest('.collapse.menu-dropdown');
    if (parentCollapseDiv) {
      // to set aria expand true remaining
      parentCollapseDiv.classList.add('show');
      parentCollapseDiv.parentElement.children[0].classList.add('active');
      parentCollapseDiv.parentElement.children[0].setAttribute('aria-expanded', 'true');
      if (parentCollapseDiv.parentElement.closest('.collapse.menu-dropdown')) {
        parentCollapseDiv.parentElement.closest('.collapse').classList.add('show');
        if (parentCollapseDiv.parentElement.closest('.collapse').previousElementSibling) {
          parentCollapseDiv.parentElement.closest('.collapse').previousElementSibling.classList.add('active');
        }
        parentCollapseDiv.parentElement.closest('.collapse').previousElementSibling.setAttribute('aria-expanded', 'true');
      }
      return false;
    }
    return false;
  }

  updateActive(event: any) {
    const ul = this.document.getElementById('navbar-nav');

    if (ul) {
      const items = Array.from(ul.querySelectorAll('a.nav-link'));
      this.removeActivation(items);
    }
    this.activateParentDropdown(event.target);
  }

  initActiveMenu() {
    if (isPlatformBrowser(this.platformId)) {
      const pathName = window.location.pathname;
      const ul = this.document.getElementById('navbar-nav');

      if (ul) {
        const items = Array.from(ul.querySelectorAll('a.nav-link'));
        const activeItems = items.filter((x: any) => x.classList.contains('active'));
        this.removeActivation(activeItems);
        const matchingMenuItem = items.find((x: any) => {
          return x.pathname === pathName;
        });
        if (matchingMenuItem) {
          this.activateParentDropdown(matchingMenuItem);
        }
      }
    }
  }

  toggleSubItem(event: any) {
    if (event.target && event.target.nextElementSibling) {
      event.target.nextElementSibling.classList.toggle('show');
    }
  }

  toggleItem(event: any) {
    const isCurrentMenuId = event.target.closest('a.nav-link');

    const isMenu = isCurrentMenuId.nextElementSibling as any;
    const dropDowns = Array.from(this.document.querySelectorAll('#navbar-nav .show'));
    dropDowns.forEach((node: any) => {
      node.classList.remove('show');
    });

    // tslint:disable-next-line: no-unused-expression
    isMenu ? isMenu.classList.add('show') : null;

    const ul = this.document.getElementById('navbar-nav');
    if (ul) {
      const iconItems = Array.from(ul.getElementsByTagName('a'));
      const activeIconItems = iconItems.filter((x: any) => x.classList.contains('active'));
      activeIconItems.forEach((item: any) => {
        item.setAttribute('aria-expanded', 'false');
        item.classList.remove('active');
      });
    }
    if (isCurrentMenuId) {
      this.activateParentDropdown(isCurrentMenuId);
    }
  }

  /**
   * Returns true or false if given menu item has child or not
   * @param item menuItem
   */
  hasItems(item: MenuItem) {
    return item.subItems !== undefined ? item.subItems.length > 0 : false;
  }

  /**
   * remove active and mm-active class
   */
  _removeAllClass(className: any) {
    const els = this.document.getElementsByClassName(className);
    while (els[0]) {
      els[0].classList.remove(className);
    }
  }
}
