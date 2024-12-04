import { Component, Inject, OnInit } from '@angular/core';

import {
  LAYOUT_VERTICAL,
  LAYOUT_HORIZONTAL,
  LAYOUT_TWOCOLUMN,
  // LAYOUT_MODE,
  // LAYOUT_WIDTH,
  // LAYOUT_POSITION,
  // SIDEBAR_SIZE,
  // SIDEBAR_COLOR,
  // TOPBAR,
} from './layout.model';
import { DOCUMENT } from '@angular/common';
import { IndexService } from '../modules/index/index.service';

@Component({
  selector: 'sifca-monorepo-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})

/**
 * Layout Component
 */
export class LayoutComponent implements OnInit {
  layoutType!: string;

  constructor(@Inject(DOCUMENT) private document: Document, private indexService: IndexService) {}

  ngOnInit(): void {
    this.layoutType = LAYOUT_VERTICAL;
    this.document.body.setAttribute('layout', this.layoutType);
    this.indexService.getMenuBadges().subscribe();
    // listen to event and change the layout, theme, etc
    // this.eventService.subscribe('changeLayout', (layout) => {
    //   this.layoutType = layout;
    // });
  }

  /**
   * Check if the vertical layout is requested
   */
  isVerticalLayoutRequested() {
    return this.layoutType === LAYOUT_VERTICAL;
  }

  /**
   * Check if the horizontal layout is requested
   */
  isHorizontalLayoutRequested() {
    return this.layoutType === LAYOUT_HORIZONTAL;
  }

  /**
   * Check if the horizontal layout is requested
   */
  isTwoColumnLayoutRequested() {
    return this.layoutType === LAYOUT_TWOCOLUMN;
  }
}
