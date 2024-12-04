import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map, switchMap, take } from 'rxjs';

import { ConvertorHelper, StorageHelper } from '@diktup/frontend/helpers';
import { CompanyType, CorporateUserType, PriceType } from '@sifca-monorepo/terminal-generator';
import { GetCorporateUsersByTargetGQL, GetEnabledPricesByCompanyGQL } from '@sifca-monorepo/terminal-generator';
import {
  DiscountDtoInput,
  ProductTaxesInput,
  SequenceCategoryEnum,
  InvoicingProductsInput,
  GetPricesCalculationsGQL,
  CreateInvoicingPdfDocumentGQL,
  InvoicingPricesCalculationType,
  SendInvoicingPdfDocumentByEmailGQL,
} from '@sifca-monorepo/terminal-generator';

import { BreadCrumbItemsInterface } from '@sifca-monorepo/api-interfaces';

import { GenericInvoicingType } from '../invoicing.type';
import { UserService } from '../../../core/services/user.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class InvoicingService {
  private type: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private title: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private pageId: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private subType: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private isAvoir: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private parentPage: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private commentHolder: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private documentTitle: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private commentService: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private prices: BehaviorSubject<PriceType[]> = new BehaviorSubject<PriceType[]>(null);
  private commentServiceAttribute: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private users: BehaviorSubject<CorporateUserType[]> = new BehaviorSubject<CorporateUserType[]>(null);
  private item: BehaviorSubject<GenericInvoicingType> = new BehaviorSubject<GenericInvoicingType>(null);
  private selectedCustomerSupplier: BehaviorSubject<CompanyType> = new BehaviorSubject<CompanyType>(null);
  private loadingSelectedCustomerSupplier: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private category: BehaviorSubject<SequenceCategoryEnum> = new BehaviorSubject<SequenceCategoryEnum>(null);
  private breadCrumbItems: BehaviorSubject<BreadCrumbItemsInterface> = new BehaviorSubject<BreadCrumbItemsInterface>(null);

  companyId: string;

  get item$(): Observable<GenericInvoicingType> {
    return this.item.asObservable();
  }
  set item$(value: any) {
    this.item.next(value);
  }
  get category$(): Observable<SequenceCategoryEnum> {
    return this.category.asObservable();
  }
  set category$(value: any) {
    this.category.next(value);
  }
  get selectedCustomerSupplier$(): Observable<CompanyType> {
    return this.selectedCustomerSupplier.asObservable();
  }
  set selectedCustomerSupplier$(value: any) {
    this.selectedCustomerSupplier.next(value);
  }
  get type$(): Observable<string> {
    return this.type.asObservable();
  }
  set type$(value: any) {
    this.type.next(value);
  }
  get commentHolder$(): Observable<string> {
    return this.commentHolder.asObservable();
  }
  set commentHolder$(value: any) {
    this.commentHolder.next(value);
  }
  get commentService$(): Observable<string> {
    return this.commentService.asObservable();
  }
  set commentService$(value: any) {
    this.commentService.next(value);
  }
  get commentServiceAttribute$(): Observable<string> {
    return this.commentServiceAttribute.asObservable();
  }
  set commentServiceAttribute$(value: any) {
    this.commentServiceAttribute.next(value);
  }
  get loadingSelectedCustomerSupplier$(): Observable<boolean> {
    return this.loadingSelectedCustomerSupplier.asObservable();
  }
  set loadingSelectedCustomerSupplier$(value: any) {
    this.loadingSelectedCustomerSupplier.next(value);
  }
  get isAvoir$(): Observable<boolean> {
    return this.isAvoir.asObservable();
  }
  set isAvoir$(value: any) {
    this.isAvoir.next(value);
  }
  get subType$(): Observable<string> {
    return this.subType.asObservable();
  }
  set subType$(value: any) {
    this.subType.next(value);
  }
  get pageId$(): Observable<string> {
    return this.pageId.asObservable();
  }
  set pageId$(value: any) {
    this.pageId.next(value);
  }
  get parentPage$(): Observable<string> {
    return this.parentPage.asObservable();
  }
  set parentPage$(value: any) {
    this.parentPage.next(value);
  }
  get title$(): Observable<string> {
    return this.title.asObservable();
  }
  set title$(value: any) {
    this.title.next(value);
  }
  get documentTitle$(): Observable<string> {
    return this.documentTitle.asObservable();
  }
  set documentTitle$(value: any) {
    this.documentTitle.next(value);
  }
  get breadCrumbItems$(): Observable<BreadCrumbItemsInterface> {
    return this.breadCrumbItems.asObservable();
  }
  set breadCrumbItems$(value: any) {
    this.breadCrumbItems.next(value);
  }
  get prices$(): Observable<PriceType[]> {
    return this.prices.asObservable();
  }
  get users$(): Observable<CorporateUserType[]> {
    return this.users.asObservable();
  }

  constructor(
    private userService: UserService,
    private storageHelper: StorageHelper,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
    private convertorHelper: ConvertorHelper,
    private getPricesCalculationsGQL: GetPricesCalculationsGQL,
    private getCorporateUsersByTargetGQL: GetCorporateUsersByTargetGQL,
    private getEnabledPricesByCompanyGQL: GetEnabledPricesByCompanyGQL,
    private createInvoicingPdfDocumentGQL: CreateInvoicingPdfDocumentGQL,
    private sendInvoicingPdfDocumentByEmailGQL: SendInvoicingPdfDocumentByEmailGQL,
  ) {}

  resetItem() {
    this.item.next(null);
    this.selectedCustomerSupplier.next(null);
  }

  getPrices(): Observable<PriceType[]> {
    this.companyId = this.storageHelper.getData('company');
    return this.getEnabledPricesByCompanyGQL.fetch({ company: this.companyId }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.prices.next(data.getEnabledPricesByCompany);
          return data.getEnabledPricesByCompany;
        }
      }),
    );
  }

  getUsers(): Observable<CorporateUserType[]> {
    return this.getCorporateUsersByTargetGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      map(({ data }: any) => {
        this.users.next(data.getCorporateUsersByTarget);
        return data.getCorporateUsersByTarget;
      }),
    );
  }

  getPricesCalculations(
    products: InvoicingProductsInput[],
    taxes: ProductTaxesInput[],
    discount: DiscountDtoInput,
    isAvoir = false,
  ): Observable<InvoicingPricesCalculationType> {
    return this.getPricesCalculationsGQL.fetch({ input: { products, taxes, discount, isAvoir } }).pipe(
      map(({ data }: any) => {
        if (data) {
          return data.getPricesCalculations;
        }
      }),
    );
  }

  sendInvoicingPdfDocumentByEmail(emails: string[], document: any): Observable<any> {
    return this.sendInvoicingPdfDocumentByEmailGQL.fetch({ document, emails, subject: 'invoice' }).pipe(
      map(({ data }: any) => {
        if (data) {
          return data.sendInvoicingPDFDocumentByEmail;
        }
      }),
    );
  }

  createInvoicingPdfDocument(document: any): Observable<any> {
    return this.createInvoicingPdfDocumentGQL.fetch({ document }).pipe(
      map(({ data }: any) => {
        if (data) {
          return data.createInvoicingPDFDocument;
        }
      }),
    );
  }

  downloadDocument(item: GenericInvoicingType) {
    if (isPlatformBrowser(this.platformId)) {
      return this.category$.pipe(
        take(1),
        switchMap((category) => this.createInvoicingPdfDocument({ id: item.id, category, name: category })),
        take(1),
        map((createInvoicingDocumentResponse) => {
          const blob = this.convertorHelper.b64toBlob(createInvoicingDocumentResponse.content, 'pdf');
          const a = this.document.createElement('a');
          this.document.body.appendChild(a);
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = String('invoicing.pdf');
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
          return createInvoicingDocumentResponse;
        }),
      );
    }
  }

  sendDocumentToEmail(item: GenericInvoicingType, emails?: string[]) {
    return combineLatest([this.userService.currentUser$, this.category$]).pipe(
      take(1),
      map(([currentUser, category]) => ({
        document: { id: item.id, category, name: category },
        emails: emails.length ? emails : [currentUser.email],
      })),
      switchMap((input) => this.sendInvoicingPdfDocumentByEmail(input.emails, input.document)),
    );
  }
}
