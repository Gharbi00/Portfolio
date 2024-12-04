import { Component, OnInit } from '@angular/core';

import { PricingModel } from './pricing.model';
import { pricingPlan } from './data';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss'],
})

/**
 * Pricing Component
 */
export class PricingComponent implements OnInit {
  // bread crumb items
  breadCrumbItems!: Array<{}>;
  pricingPlan!: PricingModel[];

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    /**
     * BreadCrumb
     */
    this.translate.get('MENUITEMS.TS.HOME').subscribe((home: string) => {
      this.translate.get('MENUITEMS.TS.PRICING').subscribe((pricing: string) => {
        this.breadCrumbItems = [{ label: home }, { label: pricing, active: true }];
      });
    });

    // Chat Data Get Function
    this._fetchData();
  }

  // Chat Data Fetch
  private _fetchData() {
    this.pricingPlan = pricingPlan;
  }
}
