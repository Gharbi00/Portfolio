import { Observable, combineLatest, map } from 'rxjs';
import { Component, OnInit } from '@angular/core';

import { QuotationType, ProductKindEnum, TaxSignEnum } from '@sifca-monorepo/terminal-generator';
import {
  SaleOrderType,
  SaleInvoiceType,
  PurchaseOrderType,
  SaleIssueNoteType,
  PurchaseInvoiceType,
  SaleDeliveryNoteType,
  PurchaseDeliveryNoteType,
} from '@sifca-monorepo/terminal-generator';

import { PreviewService } from '../preview.service';
import { ELEVOK_LOGO } from '../../../environments/environment';
import { GenericInvoicingType } from '../../modules/shared/invoicing.type';
import { SettingsService } from '../../modules/system/settings/settings.service';
import { InvoicingService } from '../../modules/shared/services/invoicing.service';
import { QuotationsService } from '../../modules/sales/quotations/quotations.service';

@Component({
  selector: 'sifca-monorepo-details',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
})
export class DocumentPreviewDetailPageComponent implements OnInit {
  elevokLogo: string;
  documentTitle: string;
  TaxSignEnum = TaxSignEnum;
  breadCrumbItems!: Array<{}>;
  ProductKindEnum = ProductKindEnum;
  quotation$: Observable<QuotationType> = this.quotationsService.quotation$;
  doc$: Observable<
    | QuotationType
    | SaleOrderType
    | SaleInvoiceType
    | SaleIssueNoteType
    | PurchaseOrderType
    | PurchaseInvoiceType
    | SaleDeliveryNoteType
    | PurchaseDeliveryNoteType
  > = this.previewService.doc$;

  constructor(
    private previewService: PreviewService,
    private settingsService: SettingsService,
    private invoicingService: InvoicingService,
    private quotationsService: QuotationsService,
  ) {
    combineLatest([this.settingsService.settings$, this.invoicingService.category$])
      .pipe(
        map(([settings, category]) => {
          this.documentTitle = category;
          this.elevokLogo =
            settings.documentLogo?.path && settings.documentLogo?.baseUrl
              ? `${settings.documentLogo?.baseUrl}/f_auto/${settings.documentLogo?.path}`
              : ELEVOK_LOGO;
        }),
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Sales' }, { label: 'Create Quotation', active: true }];
  }

  downloadDocument(item: GenericInvoicingType) {
    this.invoicingService.downloadDocument(item).subscribe();
  }
}
