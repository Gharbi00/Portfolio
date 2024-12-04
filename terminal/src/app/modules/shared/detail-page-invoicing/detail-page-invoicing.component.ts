import { Observable } from 'rxjs';
import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { ProductKindEnum, TaxSignEnum } from '@sifca-monorepo/terminal-generator';

import { GenericInvoicingType } from '../invoicing.type';
import { InvoicingService } from '../services/invoicing.service';
import { SharedService } from '../../../shared/services/shared.service';
import { ELEVOK_LOGO } from '../../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-detail-page-invoicing',
  styleUrls: ['./detail-page-invoicing.component.scss'],
  templateUrl: './detail-page-invoicing.component.html',
})
export class InvoicingDetailPageComponent {
  elevokLogo = ELEVOK_LOGO;
  TaxSignEnum = TaxSignEnum;
  ProductKindEnum = ProductKindEnum;
  type$: Observable<string> = this.invoicingService.type$;
  breadCrumbItems$ = this.invoicingService.breadCrumbItems$;
  title$: Observable<string> = this.invoicingService.title$;
  pageId$: Observable<string> = this.invoicingService.pageId$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  item$: Observable<GenericInvoicingType> = this.invoicingService.item$;
  documentTitle$: Observable<string> = this.invoicingService.documentTitle$;
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private toastr: ToastrService,
    private translateService: TranslateService,
    private route: ActivatedRoute,
    private sharedService: SharedService,
    private invoicingService: InvoicingService,
  ) {}

  downloadDocument(item: GenericInvoicingType) {
    this.invoicingService.downloadDocument(item).subscribe();
  }

  sendDocumentToEmail(item: GenericInvoicingType) {
    this.translateService.get('MENUITEMS.TS.AN_EMAIL_SENT').subscribe((anEmailSent: string) => {
      this.translateService.get('MENUITEMS.TS.EMAIL_SENT').subscribe((EmailSent: string) => {
        this.invoicingService
          .sendDocumentToEmail(item)
          .subscribe((response) => this.toastr.success(EmailSent, anEmailSent, { positionClass: 'toast-bottom-right' }));
      });
    });
  }

  getLabel(value: string): string {
    return value
      .slice(0, -1)
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase();
  }

  ngOnInit(): void {
    this.translateService.get(['invoices.createInvoice', 'invoices.updateInvoice', 'invoices.invoice']).subscribe(() => {
      this.updateRouteData();
    });
  }
  updateRouteData(): void {
    const routeData = this.route.snapshot.data;
    routeData['breadCrumbItems'][0].label = this.translateService.instant('MENUITEMS.TS.INVENTORY');

    if (routeData['breadCrumbItems'][1] === 'Purchase Invoice Page Details') {
      routeData['breadCrumbItems'][1].label = this.translateService.instant('MENUITEMS.TS.PURCHASE_INVOICE_PAGE_DETAILS');
    } else if (routeData['breadCrumbItems'][1] === 'Purchase Invoice Details') {
      routeData['breadCrumbItems'][1].label = this.translateService.instant('MENUITEMS.TS.PURCHASE_INVOICE_DETAILS');
    } else if (routeData['breadCrumbItems'][1] === 'Purchase Delivery Note Page Details') {
      routeData['breadCrumbItems'][1].label = this.translateService.instant('MENUITEMS.TS.PURCHASE_DELIVERY_NOTE_DETAILS');
    } else if (routeData['breadCrumbItems'][1] === 'Purchase Delivery Note Details') {
      routeData['breadCrumbItems'][1].label = this.translateService.instant('MENUITEMS.TS.PURCHASE_DELIVERY_NOTE_DETAIL');
    } else if (routeData['breadCrumbItems'][1] === 'Purchase Page Details') {
      routeData['breadCrumbItems'][1].label = this.translateService.instant('MENUITEMS.TS.PURCHASE_PAGE_DETAILS');
    } else if (routeData['breadCrumbItems'][1] === 'Purchase Details') {
      routeData['breadCrumbItems'][1].label = this.translateService.instant('MENUITEMS.TS.PURCHASE_DETAILS');
    } else if (routeData['breadCrumbItems'][1] === 'Invoice Page Details') {
      routeData['breadCrumbItems'][1].label = this.translateService.instant('MENUITEMS.TS.INVOICE_PAGE_DETAILS');
    } else if (routeData['breadCrumbItems'][1] === 'Invoice Details') {
      routeData['breadCrumbItems'][1].label = this.translateService.instant('MENUITEMS.TS.INVOICE_DETAILS');
    } else if (routeData['breadCrumbItems'][1] === 'Delivery note Page Details') {
      routeData['breadCrumbItems'][1].label = this.translateService.instant('MENUITEMS.TS.DELIVERY_NOTE_PAGE_DETAILS');
    } else if (routeData['breadCrumbItems'][1] === 'Delivery note Details') {
      routeData['breadCrumbItems'][1].label = this.translateService.instant('MENUITEMS.TS.DELIVERY_NOTE_DETAILS');
    } else if (routeData['breadCrumbItems'][1] === 'Issue note Page Details') {
      routeData['breadCrumbItems'][1].label = this.translateService.instant('MENUITEMS.TS.ISSUE_NOTE_PAGE_DETAILS');
    } else if (routeData['breadCrumbItems'][1] === 'Order Details') {
      routeData['breadCrumbItems'][1].label = this.translateService.instant('MENUITEMS.TS.ORDER_DETAILS');
    } else if (routeData['breadCrumbItems'][1] === 'Quotation Details Page') {
      routeData['breadCrumbItems'][1].label = this.translateService.instant('MENUITEMS.TS.QUOTATION_DETAILS_PAGE');
    }
  }
}
