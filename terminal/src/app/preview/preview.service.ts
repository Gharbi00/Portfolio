import jwt_decode from 'jwt-decode';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';

import {
  QuotationGQL,
  SaleOrderGQL,
  QuotationType,
  SaleOrderType,
  SaleInvoiceGQL,
  SaleInvoiceType,
  PurchaseOrderGQL,
  SaleIssueNoteGQL,
  PurchaseOrderType,
  SaleIssueNoteType,
  PurchaseInvoiceGQL,
  PurchaseInvoiceType,
  SaledeliverynoteGQL,
  SaleDeliveryNoteType,
  SequenceCategoryEnum,
  PurchasedeliverynoteGQL,
  PurchaseDeliveryNoteType,
} from '@sifca-monorepo/terminal-generator';

import { InvoicingService } from '../modules/shared/services/invoicing.service';

@Injectable({ providedIn: 'root' })
export class PreviewService {
  private token: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private doc: BehaviorSubject<
    | QuotationType
    | SaleOrderType
    | SaleInvoiceType
    | SaleIssueNoteType
    | PurchaseOrderType
    | PurchaseInvoiceType
    | SaleDeliveryNoteType
    | PurchaseDeliveryNoteType
  > = new BehaviorSubject<
    | QuotationType
    | SaleOrderType
    | SaleInvoiceType
    | SaleIssueNoteType
    | PurchaseOrderType
    | PurchaseInvoiceType
    | SaleDeliveryNoteType
    | PurchaseDeliveryNoteType
  >(null);
  private data: {
    [key in SequenceCategoryEnum]: {
      serviceName:
        | 'quotationGQL'
        | 'saleOrderGQL'
        | 'saleInvoiceGQL'
        | 'purchaseOrderGQL'
        | 'saleIssueNoteGQL'
        | 'purchaseInvoiceGQL'
        | 'saleDeliveryNoteGQL'
        | 'purchaseDeliveryNoteGQL';
      resultName:
        | 'quotation'
        | 'saleOrder'
        | 'saleInvoice'
        | 'purchaseOrder'
        | 'saleIssueNote'
        | 'purchaseInvoice'
        | 'saledeliverynote'
        | 'purchasedeliverynote';
    };
  } = {
    [SequenceCategoryEnum.QUOTATION]: { serviceName: 'quotationGQL', resultName: 'quotation' },
    [SequenceCategoryEnum.SALE_ORDER]: { serviceName: 'saleOrderGQL', resultName: 'saleOrder' },
    [SequenceCategoryEnum.SALE_INVOICE]: { serviceName: 'saleInvoiceGQL', resultName: 'saleInvoice' },
    [SequenceCategoryEnum.PURCHASE_ORDER]: { serviceName: 'purchaseOrderGQL', resultName: 'purchaseOrder' },
    [SequenceCategoryEnum.SALE_ISSUE_NOTE]: { serviceName: 'saleIssueNoteGQL', resultName: 'saleIssueNote' },
    [SequenceCategoryEnum.PURCHASE_INVOICE]: { serviceName: 'purchaseInvoiceGQL', resultName: 'purchaseInvoice' },
    [SequenceCategoryEnum.SALE_DELIVERY_NOTE]: { serviceName: 'saleDeliveryNoteGQL', resultName: 'saledeliverynote' },
    [SequenceCategoryEnum.PURCHASE_DELIVERY_NOTE]: { serviceName: 'purchaseDeliveryNoteGQL', resultName: 'purchasedeliverynote' },
  };

  get doc$(): Observable<
    | QuotationType
    | SaleOrderType
    | SaleInvoiceType
    | SaleIssueNoteType
    | PurchaseOrderType
    | PurchaseInvoiceType
    | SaleDeliveryNoteType
    | PurchaseDeliveryNoteType
  > {
    return this.doc.asObservable();
  }
  set doc$(value: any) {
    this.doc.next(value);
  }
  get token$(): Observable<string> {
    return this.token.asObservable();
  }
  set token$(value: any) {
    this.token.next(value);
  }

  constructor(
    private quotationGQL: QuotationGQL,
    private saleOrderGQL: SaleOrderGQL,
    private saleInvoiceGQL: SaleInvoiceGQL,
    private invoicingService: InvoicingService,
    private purchaseOrderGQL: PurchaseOrderGQL,
    private saleIssueNoteGQL: SaleIssueNoteGQL,
    private purchaseInvoiceGQL: PurchaseInvoiceGQL,
    private saleDeliveryNoteGQL: SaledeliverynoteGQL,
    private purchaseDeliveryNoteGQL: PurchasedeliverynoteGQL,
  ) {}

  getDocumentByToken(
    token: string,
  ): Observable<
    | QuotationType
    | SaleOrderType
    | SaleInvoiceType
    | SaleIssueNoteType
    | PurchaseOrderType
    | PurchaseInvoiceType
    | SaleDeliveryNoteType
    | PurchaseDeliveryNoteType
  > {
    const { id, sub }: { id: string; sub: SequenceCategoryEnum } = jwt_decode(token);
    this.token.next(token);
    this.invoicingService.category$ = sub;
    return (this[this.data[sub].serviceName].fetch({ id }) as Observable<any>).pipe(
      map(({ data }: any) => {
        if (data) {
          this.doc.next(data[this.data[sub].resultName]);
          return data[this.data[sub].resultName] as any;
        }
      }),
    ) as Observable<any>;
    // if (sub === SequenceCategoryEnum.QUOTATION) {
    //   return this.quotationGQL.fetch({ id }).pipe(
    //     map(({ data }: any) => {
    //       if (data) {
    //         this.doc.next(data.quotation);
    //         return data.quotation as QuotationType;
    //       }
    //     }),
    //   );
    // }
    // if (sub === SequenceCategoryEnum.SALE_ORDER) {
    //   return this.saleOrderGQL.fetch({ id }).pipe(
    //     map(({ data }: any) => {
    //       if (data) {
    //         this.doc.next(data.saleOrder);
    //         return data.saleOrder as SaleOrderType;
    //       }
    //     }),
    //   );
    // }
    // if (sub === SequenceCategoryEnum.SALE_ISSUE_NOTE) {
    //   return this.saleIssueNoteGQL.fetch({ id }).pipe(
    //     map(({ data }: any) => {
    //       if (data) {
    //         this.doc.next(data.saleIssueNote);
    //         return data.saleIssueNote as SaleIssueNoteType;
    //       }
    //     }),
    //   );
    // }
    // if (sub === SequenceCategoryEnum.SALE_INVOICE) {
    //   return this.saleInvoiceGQL.fetch({ id }).pipe(
    //     map(({ data }: any) => {
    //       if (data) {
    //         this.doc.next(data.saleInvoice);
    //         return data.saleInvoice as SaleInvoiceType;
    //       }
    //     }),
    //   );
    // }
    // if (sub === SequenceCategoryEnum.SALE_DELIVERY_NOTE) {
    //   return this.saleDeliveryNoteGQL.fetch({ id }).pipe(
    //     map(({ data }: any) => {
    //       if (data) {
    //         this.doc.next(data.saledeliverynote);
    //         return data.saledeliverynote as SaleDeliveryNoteType;
    //       }
    //     }),
    //   );
    // }
    // if (sub === SequenceCategoryEnum.PURCHASE_DELIVERY_NOTE) {
    //   return this.purchaseDeliveryNoteGQL.fetch({ id }).pipe(
    //     map(({ data }: any) => {
    //       if (data) {
    //         this.doc.next(data.purchasedeliverynote);
    //         return data.purchasedeliverynote as PurchaseDeliveryNoteType;
    //       }
    //     }),
    //   );
    // }
    // if (sub === SequenceCategoryEnum.PURCHASE_INVOICE) {
    //   return this.purchaseInvoiceGQL.fetch({ id }).pipe(
    //     map(({ data }: any) => {
    //       if (data) {
    //         this.doc.next(data.purchaseInvoice);
    //         return data.purchaseInvoice as PurchaseInvoiceType;
    //       }
    //     }),
    //   );
    // }
    // if (sub === SequenceCategoryEnum.PURCHASE_ORDER) {
    //   return this.purchaseOrderGQL.fetch({ id }).pipe(
    //     map(({ data }: any) => {
    //       if (data) {
    //         this.doc.next(data.purchaseOrder);
    //         return data.purchaseOrder as PurchaseOrderType;
    //       }
    //     }),
    //   );
    // }
  }
}
