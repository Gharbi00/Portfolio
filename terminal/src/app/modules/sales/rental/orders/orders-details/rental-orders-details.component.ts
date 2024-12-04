import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-orders-details',
  templateUrl: './rental-orders-details.component.html',
  styleUrls: ['./rental-orders-details.component.scss'],
})

/**
 * OrdersDetails Component
 */
export class RentalOrdersDetailsComponent implements OnInit {
  // bread crumb items
  breadCrumbItems!: Array<{}>;
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(private sharedService: SharedService, private translate: TranslateService) {}

  ngOnInit(): void {
    /**
     * BreadCrumb
     */
    this.translate.get('MENUITEMS.TS.INVOICING').subscribe((invoicing: string) => {
      this.translate.get('MENUITEMS.TS.ORDER_DETAILS').subscribe((orderDetails: string) => {
        this.breadCrumbItems = [{ label: invoicing }, { label: orderDetails, active: true }];
      });
    });
  }
}
