import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';

@Component({
  selector: 'sifca-monorepo-horizontal',
  templateUrl: './horizontal.component.html',
  styleUrls: ['./horizontal.component.scss'],
})

/**
 * Horizontal Component
 */
export class HorizontalComponent implements OnInit {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngOnInit(): void {
    this.document.documentElement.setAttribute('data-layout', 'horizontal');
    this.document.documentElement.setAttribute('data-topbar', 'light');
    this.document.documentElement.setAttribute('data-sidebar', 'dark');
    this.document.documentElement.setAttribute('data-sidebar-size', 'lg');
    this.document.documentElement.setAttribute('data-layout-style', 'default');
    this.document.documentElement.setAttribute('data-layout-mode', 'light');
    this.document.documentElement.setAttribute('data-layout-width', 'fluid');
    this.document.documentElement.setAttribute('data-layout-position', 'fixed');
    this.document.documentElement.setAttribute('data-preloader', 'disable');
  }

  /**
   * on settings button clicked from topbar
   */
  onSettingsButtonClicked() {
    this.document.body.classList.toggle('right-bar-enabled');
    const rightBar = this.document.getElementById('theme-settings-offcanvas');
    if (rightBar != null) {
      rightBar.classList.toggle('show');
      rightBar.setAttribute('style', 'visibility: visible;');
    }
  }

  /**
   * On mobile toggle button clicked
   */
  onToggleMobileMenu() {
    if (this.document.documentElement.clientWidth <= 1024) {
      this.document.body.classList.toggle('menu');
    }
  }
}
