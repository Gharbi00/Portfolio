import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, EventEmitter, Output, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';

import { MENU, MenuItem } from './menu';
import { ELEVOK_LOGO, ELEVOK_SMALL_LOGO } from '../../../environments/environment';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { GetMenuBadgesType } from '@sifca-monorepo/terminal-generator';
import { Observable } from 'rxjs';
import { IndexService } from '../../modules/index/index.service';

@Component({
  selector: 'sifca-monorepo-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  @ViewChild('sideMenu') sideMenu!: ElementRef;
  @Output() mobileMenuButtonClicked = new EventEmitter();

  menu: any;
  toggle: any = true;
  elevokLogo = ELEVOK_LOGO;
  menuItems: MenuItem[] = [];
  elevokSmallLogo = ELEVOK_SMALL_LOGO;
  menuBadges$: Observable<GetMenuBadgesType> = this.indexService.menuBadges$;


  constructor(public translate: TranslateService, private indexService: IndexService, @Inject(PLATFORM_ID) private platformId: Object, @Inject(DOCUMENT) private document: Document) {
    translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    // Menu Items
    this.menuItems = MENU;
  }

  /***
   * Activate droup down set
   */
  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initActiveMenu();
      });
    }
  }

  removeActivation(items: any) {
    items.forEach((item: any) => {
      if (item.classList.contains('menu-link')) {
        if (!item.classList.contains('active')) {
          item.setAttribute('aria-expanded', false);
        }
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

  toggleSubItem(event: any) {
    let isCurrentMenuId = event.target.closest('a.nav-link');
    let isMenu = isCurrentMenuId.nextElementSibling as any;
    if (isMenu.classList.contains('show')) {
      isMenu.classList.remove('show');
      isCurrentMenuId.setAttribute('aria-expanded', 'false');
    } else {
      let dropDowns = Array.from(this.document.querySelectorAll('.sub-menu'));
      dropDowns.forEach((node: any) => {
        node.classList.remove('show');
      });

      let subDropDowns = Array.from(this.document.querySelectorAll('.menu-dropdown .nav-link'));
      subDropDowns.forEach((submenu: any) => {
        submenu.setAttribute('aria-expanded', 'false');
      });

      if (event.target && event.target.nextElementSibling) {
        isCurrentMenuId.setAttribute('aria-expanded', 'true');
        event.target.nextElementSibling.classList.toggle('show');
      }
    }
  }

  toggleExtraSubItem(event: any) {
    let isCurrentMenuId = event.target.closest('a.nav-link');
    let isMenu = isCurrentMenuId.nextElementSibling as any;
    if (isMenu.classList.contains('show')) {
      isMenu.classList.remove('show');
      isCurrentMenuId.setAttribute('aria-expanded', 'false');
    } else {
      let dropDowns = Array.from(this.document.querySelectorAll('.extra-sub-menu'));
      dropDowns.forEach((node: any) => {
        node.classList.remove('show');
      });

      let subDropDowns = Array.from(this.document.querySelectorAll('.menu-dropdown .nav-link'));
      subDropDowns.forEach((submenu: any) => {
        submenu.setAttribute('aria-expanded', 'false');
      });

      if (event.target && event.target.nextElementSibling) {
        isCurrentMenuId.setAttribute('aria-expanded', 'true');
        event.target.nextElementSibling.classList.toggle('show');
      }
    }
  }

  // Click wise Parent active class add
  toggleParentItem(event: any) {
    let isCurrentMenuId = event.target.closest('a.nav-link');
    let dropDowns = Array.from(this.document.querySelectorAll('#navbar-nav .show'));
    dropDowns.forEach((node: any) => {
      node.classList.remove('show');
    });
    const ul = this.document.getElementById('navbar-nav');
    if (ul) {
      const iconItems = Array.from(ul.getElementsByTagName('a'));
      let activeIconItems = iconItems.filter((x: any) => x.classList.contains('active'));
      activeIconItems.forEach((item: any) => {
        item.setAttribute('aria-expanded', 'false');
        item.classList.remove('active');
      });
    }
    isCurrentMenuId.setAttribute('aria-expanded', 'true');
    if (isCurrentMenuId) {
      this.activateParentDropdown(isCurrentMenuId);
    }
  }

  toggleItem(event: any) {
    let isCurrentMenuId = event.target.closest('a.nav-link');
    let isMenu = isCurrentMenuId.nextElementSibling as any;
    if (isMenu.classList.contains('show')) {
      isMenu.classList.remove('show');
      isCurrentMenuId.setAttribute('aria-expanded', 'false');
    } else {
      let dropDowns = Array.from(this.document.querySelectorAll('#navbar-nav .show'));
      dropDowns.forEach((node: any) => {
        node.classList.remove('show');
      });
      isMenu ? isMenu.classList.add('show') : null;
      const ul = this.document.getElementById('navbar-nav');
      if (ul) {
        const iconItems = Array.from(ul.getElementsByTagName('a'));
        let activeIconItems = iconItems.filter((x: any) => x.classList.contains('active'));
        activeIconItems.forEach((item: any) => {
          item.setAttribute('aria-expanded', 'false');
          item.classList.remove('active');
        });
      }
      isCurrentMenuId.setAttribute('aria-expanded', 'true');
      if (isCurrentMenuId) {
        this.activateParentDropdown(isCurrentMenuId);
      }
    }
  }

  // remove active items of two-column-menu
  activateParentDropdown(item: any) {
    item.classList.add('active');
    let parentCollapseDiv = item.closest('.collapse.menu-dropdown');

    if (parentCollapseDiv) {
      // to set aria expand true remaining
      parentCollapseDiv.classList.add('show');
      parentCollapseDiv.parentElement.children[0].classList.add('active');
      parentCollapseDiv.parentElement.children[0].setAttribute('aria-expanded', 'true');
      if (parentCollapseDiv.parentElement.closest('.collapse.menu-dropdown')) {
        parentCollapseDiv.parentElement.closest('.collapse').classList.add('show');
        if (parentCollapseDiv.parentElement.closest('.collapse').previousElementSibling)
          parentCollapseDiv.parentElement.closest('.collapse').previousElementSibling.classList.add('active');
        if (parentCollapseDiv.parentElement.closest('.collapse').previousElementSibling.closest('.collapse')) {
          parentCollapseDiv.parentElement.closest('.collapse').previousElementSibling.closest('.collapse').classList.add('show');
          parentCollapseDiv.parentElement
            .closest('.collapse')
            .previousElementSibling.closest('.collapse')
            .previousElementSibling.classList.add('active');
        }
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

  /**
   * Returns true or false if given menu item has child or not
   * @param item menuItem
   */
  hasItems(item: MenuItem) {
    return item.subItems !== undefined ? item.subItems.length > 0 : false;
  }

  /**
   * Toggle the menu bar when having mobile screen
   */
  toggleMobileMenu() {
    const sidebarsize = this.document.documentElement.getAttribute('data-sidebar-size');
    if (sidebarsize === 'sm-hover-active') {
      this.document.documentElement.setAttribute('data-sidebar-size', 'sm-hover');
    } else {
      this.document.documentElement.setAttribute('data-sidebar-size', 'sm-hover-active');
    }
  }

  /**
   * SidebarHide modal
   * @param content modal content
   */
  SidebarHide() {
    this.document.body.classList.remove('vertical-sidebar-enable');
  }
}