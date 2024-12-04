/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, EventEmitter, Output, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';

import { MENU } from './menu';
import { MenuItem } from './menu.model';
import { ELEVOK_LOGO, ELEVOK_SMALL_LOGO } from '../../../environments/environment';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'sifca-monorepo-two-column-sidebar',
  templateUrl: './two-column-sidebar.component.html',
  styleUrls: ['./two-column-sidebar.component.scss'],
})
export class TwoColumnSidebarComponent implements OnInit {
  menu: any;
  toggle: any = true;
  elevokLogo = ELEVOK_LOGO;
  menuItems: MenuItem[] = [];
  elevokSmallLogo = ELEVOK_SMALL_LOGO;
  @ViewChild('sideMenu') sideMenu!: ElementRef;
  @Output() mobileMenuButtonClicked = new EventEmitter();

  constructor(public translate: TranslateService, @Inject(PLATFORM_ID) private platformId: Object, @Inject(DOCUMENT) private document: Document) {
    // router.events.subscribe((val) => {
    //   this.initActiveMenu();
    // });
    translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    // Menu Items
    this.menuItems = MENU;
  }

  /***
   * Activate drop down set
   */
  // tslint:disable-next-line: use-lifecycle-interface
  ngAfterViewInit() {
    setTimeout(() => {
      this.initActiveMenu();
    }, 0);
  }

  toggleSubItem(event: any) {
    const isCurrentMenuId = event.target.closest('a.nav-link');
    // const isMenu = isCurrentMenuId.nextElementSibling as any;
    const dropDowns = Array.from(this.document.querySelectorAll('.menu-dropdown .show'));
    dropDowns.forEach((node: any) => {
      node.classList.remove('show');
    });

    const subDropDowns = Array.from(this.document.querySelectorAll('.menu-dropdown .nav-link'));
    subDropDowns.forEach((submenu: any) => {
      submenu.setAttribute('aria-expanded', 'false');
    });

    if (event.target && event.target.nextElementSibling) {
      isCurrentMenuId.setAttribute('aria-expanded', 'true');
      event.target.nextElementSibling.classList.toggle('show');
    }
  }

  toggleExtraSubItem(event: any) {
    const isCurrentMenuId = event.target.closest('a.nav-link');
    // const isMenu = isCurrentMenuId.nextElementSibling as any;
    const dropDowns = Array.from(this.document.querySelectorAll('.extra-sub-menu'));
    dropDowns.forEach((node: any) => {
      node.classList.remove('show');
    });

    const subDropDowns = Array.from(this.document.querySelectorAll('.menu-dropdown .nav-link'));
    subDropDowns.forEach((submenu: any) => {
      submenu.setAttribute('aria-expanded', 'false');
    });

    if (event.target && event.target.nextElementSibling) {
      isCurrentMenuId.setAttribute('aria-expanded', 'true');
      event.target.nextElementSibling.classList.toggle('show');
    }
  }

  updateActive(event: any) {
    const ul = this.document.getElementById('navbar-nav');
    if (ul) {
      const items = Array.from(ul.querySelectorAll('a.nav-link.active'));
      this.removeActivation(items);
    }
    this.activateParentDropdown(event.target);
  }

  // Click wise Parent active class add
  toggleParentItem(event: any) {
    const isCurrentMenuId = event.target.getAttribute('subitems');
    const isMenu = this.document.getElementById(isCurrentMenuId) as any;
    const dropDowns = Array.from(this.document.querySelectorAll('#navbar-nav .show'));
    dropDowns.forEach((node: any) => {
      node.classList.remove('show');
    });
    // tslint:disable-next-line: no-unused-expression
    isMenu ? isMenu.classList.add('show') : null;

    const ul = this.document.getElementById('two-column-menu');
    if (ul) {
      const iconItems = Array.from(ul.getElementsByTagName('a'));
      const activeIconItems = iconItems.filter((x: any) => x.classList.contains('active'));
      activeIconItems.forEach((item: any) => {
        item.classList.remove('active');
      });
    }
    event.target.classList.add('active');
    this.document.body.classList.add('twocolumn-panel');
  }

  toggleItem(event: any) {
    // show navbar-nav menu on click of icon sidebar menu
    const isCurrentMenuId = event.target.getAttribute('subitems');
    const isMenu = this.document.getElementById(isCurrentMenuId) as any;
    const dropDowns = Array.from(this.document.querySelectorAll('#navbar-nav .show'));
    dropDowns.forEach((node: any) => {
      node.classList.remove('show');
    });
    // tslint:disable-next-line: no-unused-expression
    isMenu ? isMenu.classList.add('show') : null;

    const ul = this.document.getElementById('two-column-menu');
    if (ul) {
      const iconItems = Array.from(ul.getElementsByTagName('a'));
      const activeIconItems = iconItems.filter((x: any) => x.classList.contains('active'));
      activeIconItems.forEach((item: any) => {
        item.classList.remove('active');
      });
    }
    event.target.classList.add('active');
    this.document.body.classList.remove('twocolumn-panel');
  }

  // remove active items of two-column-menu
  removeActivation(items: any) {
    items.forEach((item: any) => {
      if (item.classList.contains('menu-link')) {
        if (!item.classList.contains('active')) {
          item.setAttribute('aria-expanded', false);
        }
        item.nextElementSibling.classList.remove('show');
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

  activateIconSidebarActive(id: any) {
    // tslint:disable-next-line: quotemark
    const menu = this.document.querySelector("#two-column-menu .simplebar-content-wrapper a[subitems='" + id + "'].nav-icon");
    if (menu !== null) {
      menu.classList.add('active');
    }
  }

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
      }
      this.activateIconSidebarActive(parentCollapseDiv.getAttribute('id'));
      return false;
    }
    return false;
  }

  initActiveMenu() {
    if (isPlatformBrowser(this.platformId)) {
      const pathName = window.location.pathname;

      // Active Main Single Menu
      const mainItems = Array.from(this.document.querySelectorAll('.twocolumn-iconview li a'));
      const matchingMainMenuItem = mainItems.find((x: any) => {
        return x.pathname === pathName;
      });
      if (matchingMainMenuItem) {
        this.activateParentDropdown(matchingMainMenuItem);
      }

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
        } else {
          const id = pathName.replace('/', '');
          if (id) {
            this.document.body.classList.add('twocolumn-panel');
          }
          this.activateIconSidebarActive(id);
        }
      }
    }
  }

  /**
   * Returns true or false if given menu item has child or not
   * @param item menuItem
   */
  hasItems(item: MenuItem) {
    return item.subItems !== undefined ? item.subItems.length > 0 : false;
  }
}
