import { includes } from 'lodash';
import { Observable, map } from 'rxjs';
import { Component, OnInit } from '@angular/core';

import { ProductKindEnum, QuotationType } from '@sifca-monorepo/terminal-generator';
import {
  SaleOrderType,
  SaleInvoiceType,
  PurchaseOrderType,
  SaleIssueNoteType,
  PurchaseInvoiceType,
  SaleDeliveryNoteType,
  SequenceCategoryEnum,
  PurchaseDeliveryNoteType,
} from '@sifca-monorepo/terminal-generator';

import { PreviewService } from '../preview.service';
import { GenericInvoicingType } from '../../modules/shared/invoicing.type';
import { InvoicingService } from '../../modules/shared/services/invoicing.service';
import { SharedService } from '../../shared/services/shared.service';

@Component({
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  selector: 'sifca-monorepo-orders-details',
})
export class DocumentPreviewDetailsComponent implements OnInit {
  breadCrumbItems!: Array<{}>;
  ProductKindEnum = ProductKindEnum;
  SequenceCategoryEnum = SequenceCategoryEnum;
  token$: Observable<string> = this.previewService.token$;
  category$: Observable<SequenceCategoryEnum> = this.invoicingService.category$;
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

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }
  constructor(private sharedService: SharedService, private previewService: PreviewService, private invoicingService: InvoicingService) {}

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Sales' }, { label: 'Quotation Details', active: true }];
  }

  downloadDocument(item: GenericInvoicingType) {
    this.invoicingService.downloadDocument(item).subscribe();
  }

  inPurchasePages() {
    return this.invoicingService.category$.pipe(
      map((category) =>
        includes([SequenceCategoryEnum.PURCHASE_ORDER, SequenceCategoryEnum.PURCHASE_INVOICE, SequenceCategoryEnum.PURCHASE_DELIVERY_NOTE], category),
      ),
    );
  }
}
