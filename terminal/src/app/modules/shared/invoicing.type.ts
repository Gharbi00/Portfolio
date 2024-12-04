import {
  QuotationType,
  SaleOrderType,
  SaleInvoiceType,
  PurchaseOrderType,
  SaleIssueNoteType,
  PurchaseInvoiceType,
  SaleDeliveryNoteType,
  PurchaseDeliveryNoteType,
} from '@sifca-monorepo/terminal-generator';

export type GenericInvoicingType =
  | QuotationType
  | SaleOrderType
  | SaleInvoiceType
  | SaleIssueNoteType
  | SaleDeliveryNoteType
  | PurchaseOrderType
  | PurchaseDeliveryNoteType
  | PurchaseInvoiceType;
export type InvoicingServiceNameType =
  | 'notesService'
  | 'ordersService'
  | 'purchasesService'
  | 'issueNotesService'
  | 'quotationsService'
  | 'deliveryNotesService'
  | 'salesInvoicesService'
  | 'purchaseInvoicesService';
export type InvoicingMethodNameType =
  | 'createQuotation'
  | 'createSaleOrder'
  | 'updateQuotation'
  | 'updateSaleOrder'
  | 'createSaleInvoice'
  | 'updateSaleInvoice'
  | 'createPurchaseOrder'
  | 'createSaleIssueNote'
  | 'updatePurchaseOrder'
  | 'updateSaleIssueNote'
  | 'createPurchaseInvoice'
  | 'updatePurchaseInvoice'
  | 'createSaleDeliveryNote'
  | 'updateSaleDeliveryNote'
  | 'createPurchaseDeliveryNote'
  | 'updatePurchaseDeliveryNote';
