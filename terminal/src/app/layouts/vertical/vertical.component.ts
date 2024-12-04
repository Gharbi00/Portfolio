/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { EventService } from '../../core/services/event.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'sifca-monorepo-vertical',
  templateUrl: './vertical.component.html',
  styleUrls: ['./vertical.component.scss'],
})
export class VerticalComponent implements OnInit {
  isCondensed = false;

  constructor(private eventService: EventService, @Inject(PLATFORM_ID) private platformId: Object, @Inject(DOCUMENT) private document: Document) {}

  ngOnInit(): void {
    this.document.documentElement.setAttribute('data-layout', 'vertical');
    this.document.documentElement.setAttribute('data-topbar', 'light');
    this.document.documentElement.setAttribute('data-sidebar', 'dark');
    this.document.documentElement.setAttribute('data-sidebar-size', 'lg');
    this.document.documentElement.setAttribute('data-layout-style', 'default');
    this.document.documentElement.setAttribute('data-layout-mode', 'light');
    this.document.documentElement.setAttribute('data-layout-width', 'fluid');
    this.document.documentElement.setAttribute('data-layout-position', 'fixed');
    this.document.documentElement.setAttribute('data-preloader', 'disable');
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('resize', () => {
        if (this.document.documentElement.clientWidth <= 767) {
          this.document.documentElement.setAttribute('data-sidebar-size', '');
        } else if (this.document.documentElement.clientWidth <= 1024) {
          this.document.documentElement.setAttribute('data-sidebar-size', 'sm');
        } else if (this.document.documentElement.clientWidth >= 1024) {
          this.document.documentElement.setAttribute('data-sidebar-size', 'lg');
        }
      });
    }
  }

  /**
   * On mobile toggle button clicked
   */
  onToggleMobileMenu() {
    this.document.body.classList.toggle('sidebar-enable');
    const currentSIdebarSize = this.document.documentElement.getAttribute('data-sidebar-size');
    if (this.document.documentElement.clientWidth >= 767) {
      if (currentSIdebarSize == null) {
        this.document.documentElement.getAttribute('data-sidebar-size') == null ||
        this.document.documentElement.getAttribute('data-sidebar-size') === 'lg'
          ? this.document.documentElement.setAttribute('data-sidebar-size', 'sm')
          : this.document.documentElement.setAttribute('data-sidebar-size', 'lg');
      } else if (currentSIdebarSize === 'md') {
        this.document.documentElement.getAttribute('data-sidebar-size') === 'md'
          ? this.document.documentElement.setAttribute('data-sidebar-size', 'sm')
          : this.document.documentElement.setAttribute('data-sidebar-size', 'md');
      } else {
        this.document.documentElement.getAttribute('data-sidebar-size') === 'sm'
          ? this.document.documentElement.setAttribute('data-sidebar-size', 'lg')
          : this.document.documentElement.setAttribute('data-sidebar-size', 'sm');
      }
    }
    // if (this.document.documentElement.clientWidth <= 767) {
    if (this.document.documentElement.clientWidth <= 767) {
      this.document.body.classList.toggle('vertical-sidebar-enable');
    }
    this.isCondensed = !this.isCondensed;
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

  onResize(event: any) {
    if (this.document.body.getAttribute('layout') === 'twocolumn') {
      if (event.target.innerWidth <= 767) {
        this.eventService.broadcast('changeLayout', 'vertical');
      } else {
        this.eventService.broadcast('changeLayout', 'twocolumn');
        this.document.body.classList.remove('twocolumn-panel');
        this.document.body.classList.remove('vertical-sidebar-enable');
      }
    }
  }
}
