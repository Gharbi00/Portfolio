import { Component, Inject, OnInit } from '@angular/core';

import { discoverModel } from './discover.model';
import { discoverData } from './data';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.scss'],
})

/**
 * Discover Component
 */
export class DiscoverComponent implements OnInit {
  discoverData!: discoverModel[];

  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngOnInit(): void {
    /**
     * fetches data
     */
    this._fetchData();
  }

  /**
   * User grid data fetches
   */
  private _fetchData() {
    this.discoverData = discoverData;
  }

  /**
   * Active Toggle navbar
   */
  activeMenu(id: any) {
    this.document.querySelector('.heart_icon_' + id)?.classList.toggle('active');
  }
}
