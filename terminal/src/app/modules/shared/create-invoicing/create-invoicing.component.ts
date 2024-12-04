import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import {
  of,
  take,
  Subject,
  pairwise,
  startWith,
  switchMap,
  takeUntil,
  Observable,
  map as rxMap,
  debounceTime,
  combineLatest,
  distinctUntilChanged,
} from 'rxjs';
import {
  map,
  find,
  omit,
  pick,
  keys,
  slice,
  sumBy,
  filter,
  reduce,
  sortBy,
  without,
  forEach,
  isEqual,
  includes,
  template,
  findLastIndex,
} from 'lodash';

import { FormHelper, StorageHelper } from '@diktup/frontend/helpers';
import { BarcodeWithStockType, InvoicingPricesCalculationType } from '@sifca-monorepo/terminal-generator';
import {
  TaxType,
  PriceType,
  CompanyType,
  ProjectType,
  TaxSignEnum,
  DiscountType,
  BankDetailsType,
  ProductKindEnum,
} from '@sifca-monorepo/terminal-generator';

import { InvoicingService } from '../services/invoicing.service';
import { NotesService } from '../../purchases/note/notes.service';
import { CompanyService } from '../../system/company/company.service';
import { SalesOrdersService } from '../../sales/orders/orders.service';
import { SharedService } from '../../../shared/services/shared.service';
import { SettingsService } from '../../system/settings/settings.service';
import { ELEVOK_LOGO } from '../../../../environments/environment';
import { SaleInvoicesService } from '../../sales/invoices/invoices.service';
import { QuotationsService } from '../../sales/quotations/quotations.service';
import { PurchasesService } from '../../purchases/purchases/purchases.service';
import { IssueNotesService } from '../../sales/notes/issue/issue-notes.service';
import { CompaniesService } from '../../crm/customers/companies/companies.service';
import { DocumentReferenceModelFrontEnum } from '../document-reference-model.enum';
import { BarcodeService } from '../../inventory/products/articles/articles.service';
import { PurchaseInvoicesService } from '../../purchases/invoices/invoices.service';
import { ProjectsService } from '../../collaboration/projects/projects/projects.service';
import { DeliveryNotesService } from '../../sales/notes/delivery/delivery-notes.service';
import { GenericInvoicingType, InvoicingMethodNameType, InvoicingServiceNameType } from '../invoicing.type';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-create-invoicing',
  templateUrl: './create-invoicing.component.html',
  styleUrls: ['./create-invoicing.component.scss'],
})
export class CreateInvoicingComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  target: any;
  hasTaxes = false;
  elevokLogo: string;
  submitted = false;
  paymentSign = '$';
  itemInMove: number;
  hasDiscount = false;
  toPayLoading = false;
  totalLoading = false;
  documentTitle: string;
  subTotalLoading = false;
  openedModal: NgbModalRef;
  invoicingForm!: FormGroup;
  isRentFormButtonDisabled = true;
  globalSelectedTaxes: any[] = [];
  ProductKindEnum = ProductKindEnum;
  type$ = this.invoicingService.type$;
  isQuotationFormButtonDisabled = true;
  title$ = this.invoicingService.title$;
  pageId$ = this.invoicingService.pageId$;
  barcodesInput$: Subject<string> = new Subject<string>();
  projectsInput$: Subject<string> = new Subject<string>();
  customersInput$: Subject<string> = new Subject<string>();
  breadCrumbItems$ = this.invoicingService.breadCrumbItems$;
  isAvoir$: Observable<boolean> = this.invoicingService.isAvoir$;
  company$: Observable<CompanyType> = this.companyService.company$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  prices$: Observable<PriceType[]> = this.quotationsService.prices$;
  allTaxes$: Observable<TaxType[]> = this.settingsService.allTaxes$;
  priceCalculationFields = ['price', 'taxes', 'discount', 'quantity'];
  isLeadLastPage$: Observable<boolean> = this.companiesService.isLast$;
  item$: Observable<GenericInvoicingType> = this.invoicingService.item$;
  settings$: Observable<any> = this.settingsService.settings$;
  companies$: Observable<CompanyType[]> = this.companiesService.infiniteLeads$;
  projects$: Observable<ProjectType[]> = this.projectsService.infiniteProjects$;
  loadingBarcodes$: Observable<boolean> = this.articlesService.loadingBarcodes$;
  globalTaxes$: Observable<TaxType[]> = this.settingsService.visibleGlobalTaxes$;
  selectedBank$: Observable<BankDetailsType> = this.companyService.selectedBank$;
  barcodes$: Observable<BarcodeWithStockType[]> = this.articlesService.infinitBarcodes$;
  selectedCustomerSupplier$: Observable<CompanyType> = this.invoicingService.selectedCustomerSupplier$;
  loadingSelectedCustomerSupplier$: Observable<boolean> = this.invoicingService.loadingSelectedCustomerSupplier$;
  rentForm: FormGroup = this.formBuilder.group({
    index: [null],
    location: [''],
    description: [''],
    range: [null, [Validators.required]],
  });
  tableHeaders = [
    { className: 'product-id', label: `#` },
    { className: 'product-name', label: `MODULES.INVOICING.SHARED.PRODUCT_DETAILS` },
    { className: 'product-quantity', label: `MODULES.INVOICING.SHARED.QUANTITY` },
    { className: 'product-price', label: `MODULES.INVOICING.SHARED.UNIT_HT` },
    { className: 'product-discount', label: `MODULES.INVOICING.SHARED.DISCOUNT` },
    { className: 'product-taxes', label: `MODULES.INVOICING.SHARED.TAXES` },
    { className: 'total-product-price', label: `MODULES.INVOICING.SHARED.TOTAL_HT` },
    { className: 'product-removal', label: `` },
  ];

  get details() {
    return (this.invoicingForm?.get('details') || []) as FormArray;
  }
  get products() {
    return (this.invoicingForm?.get('products') || []) as FormArray;
  }
  get customerDetails() {
    return (this.invoicingForm?.get('customer.details') || []) as FormArray;
  }
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private router: Router,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private notesService: NotesService,
    private storageHelper: StorageHelper,
    private sharedService: SharedService,
    private companyService: CompanyService,
    private articlesService: BarcodeService,
    private projectsService: ProjectsService,
    private settingsService: SettingsService,
    private ordersService: SalesOrdersService,
    private companiesService: CompaniesService,
    private invoicingService: InvoicingService,
    private purchasesService: PurchasesService,
    private issueNotesService: IssueNotesService,
    private changeDetectorRef: ChangeDetectorRef,
    private quotationsService: QuotationsService,
    private salesInvoicesService: SaleInvoicesService,
    private deliveryNotesService: DeliveryNotesService,
    private purchaseInvoicesService: PurchaseInvoicesService,
  ) {
    this.target = { pos: this.storageHelper.getData('posId') };
    this.rentForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        rxMap((newValues) => {
          const controlValue = this.products.at(newValues.index).get('product.rent').value;
          this.isRentFormButtonDisabled =
            controlValue.end && controlValue.start
              ? this.rentForm.invalid ||
                (new Date(controlValue.end).getTime() === new Date(newValues.range?.to).getTime() &&
                  new Date(controlValue.start).getTime() === new Date(newValues.range?.from).getTime() &&
                  controlValue.location === newValues.location &&
                  controlValue.description === newValues.description)
              : this.rentForm.invalid;
        }),
      )
      .subscribe();
    combineLatest([
      this.settingsService.settings$,
      this.companyService.selectedBank$,
      this.invoicingService.item$,
      this.invoicingService.type$,
      this.invoicingService.isAvoir$,
      this.invoicingService.subType$,
    ])
      .pipe(
        take(1),
        switchMap(([settings, selectedBank, item, type, isAvoir, subType]) => {
          const compiled = template(DocumentReferenceModelFrontEnum[settings[type][subType].reference]);
          const number = compiled({
            number: 'XXXXXX',
            prefix: settings[type][subType].prefix,
            year: item?.date && !isAvoir ? new Date(item?.date).getFullYear() : new Date().getFullYear(),
          });
          this.documentTitle = settings[type][subType]?.label;
          this.elevokLogo =
            settings.documentLogo?.path && settings.documentLogo?.baseUrl
              ? `${settings.documentLogo?.baseUrl}/f_auto/${settings.documentLogo?.path}`
              : ELEVOK_LOGO;
          if ((item as any)?.customer?.customer?.id || (item as any)?.supplier?.supplier?.id) {
            this.invoicingService.selectedCustomerSupplier$ = (item as any)?.customer?.customer?.id
              ? (item as any)?.customer
              : (item as any)?.supplier;
          }
          this.invoicingForm = this.formBuilder.group({
            taxes: [[]],
            rent: [false],
            status: [item?.status || ''],
            project: [item?.project?.id || null],
            bank: [item?.id || selectedBank?.id || ''],
            toPay: [isAvoir ? `-${item?.toPay}` : item?.toPay || ''],
            number: [item?.number && !isAvoir ? item?.number : number || ''],
            totalTax: [isAvoir ? `-${item?.totalTax}` : item?.totalTax || ''],
            date: [item?.date && !isAvoir ? item?.date : new Date().toISOString()],
            // Still need work
            note: [item?.note || settings[type][subType].note],
            company: [item?.target?.pos?.company?.id || settings.company?.id || '', [Validators.required]],
            target: this.formBuilder.group({
              pos: [item?.target?.pos?.id ? item?.target?.pos?.id : this.target.pos, [Validators.required]],
            }),
            totalPrice: this.formBuilder.group({
              net: [isAvoir ? `-${item?.totalPrice?.net}` : item?.totalPrice?.net || '0'],
              gross: [isAvoir ? `-${item?.totalPrice?.gross}` : item?.totalPrice?.gross || '0'],
            }),
            // no global discount for now.
            discount: this.formBuilder.group({ amount: ['0'], discountType: [DiscountType.PERCENTAGE] }),
            details: this.formBuilder.array(item?.details?.length ? map(item?.details, (group) => this.formBuilder.group(group)) : []),
            customer: this.formBuilder.group(
              {
                customer: [(item as any)?.customer?.customer?.id || null, [Validators.required]],
                details: this.formBuilder.array(
                  (item as any)?.customer?.details?.length ? map((item as any)?.customer?.details, (detail) => this.formBuilder.group(detail)) : [],
                ),
              },
              { validators: Validators.required },
            ),
            products: this.formBuilder.array(
              item?.products?.length
                ? map(item?.products, (product) =>
                    this.formBuilder.group({
                      text: [product.text || ''],
                      value: [isAvoir && +product.value > 0 && product.kind === ProductKindEnum.SUBTOTAL ? `-${product.value}` : product.value || ''],
                      kind: [product.kind || ProductKindEnum.PRODUCT, [Validators.required]],
                      product: this.formBuilder.group({
                        descriptionVisible: [false],
                        quantity: [product.product?.quantity || 1],
                        label: [product.product?.label || ''],
                        article: [product.product?.article?.id || null],
                        description: [product.product?.description || ''],
                        barcode: product.product?.article?.barcode || '',
                        total: [isAvoir ? `-${product.product?.total}` : product.product?.total || ''],
                        price: [isAvoir ? `-${product.product?.price}` : product.product?.price || '0'],
                        taxes: [product.product?.taxes?.length ? map(product.product?.taxes, 'tax.id') : []],
                        priceList: [product.product?.article?.priceList?.length ? product.product?.article?.priceList : []],
                        discount: this.formBuilder.group({
                          discountType: [product.product?.discount?.discountType || DiscountType.PERCENTAGE],
                          amount: [
                            isAvoir && +product.product?.discount?.amount > 0
                              ? `+${product.product?.discount?.amount}`
                              : !!+product.product?.discount?.amount
                              ? `-${product.product?.discount?.amount}`
                              : '0',
                          ],
                        }),
                        rent: this.formBuilder.group({
                          end: [product.product?.rent?.end || ''],
                          start: [product.product?.rent?.start || ''],
                          location: [product.product?.rent?.location || ''],
                          description: [product.product?.rent?.description || ''],
                        }),
                      }),
                    }),
                  )
                : [
                    this.formBuilder.group({
                      kind: [ProductKindEnum.PRODUCT, [Validators.required]],
                      product: this.formBuilder.group({
                        label: [''],
                        total: [''],
                        taxes: [[]],
                        price: ['0'],
                        barcode: [''],
                        quantity: [1],
                        priceList: [[]],
                        article: [null],
                        description: [''],
                        descriptionVisible: [false],
                        discount: this.formBuilder.group({ amount: '0', discountType: [DiscountType.PERCENTAGE] }),
                        rent: this.formBuilder.group({
                          end: [''],
                          start: [''],
                          location: [''],
                          description: [''],
                        }),
                      }),
                    }),
                  ],
              { validators: Validators.required },
            ),
          });
          if (item?.taxes?.length) {
            this.hasTaxes = true;
            forEach(sortBy(item?.taxes, ['rank']), (tax) => this.addTax(tax.tax));
          }
          return this.invoicingForm.valueChanges.pipe(
            takeUntil(this.unsubscribeAll),
            startWith(null as string),
            pairwise(),
            rxMap(([oldValues, newValues]) => {
              if (
                (newValues.customer?.customer && oldValues?.customer?.customer !== newValues.customer?.customer) ||
                (newValues.supplier?.supplier && oldValues?.supplier?.supplier !== newValues.supplier?.supplier)
              ) {
                this.invoicingService.loadingSelectedCustomerSupplier$ = true;
                this.companyService
                  .getCompanyById(newValues.customer?.customer || newValues.supplier?.supplier)
                  .pipe(take(1))
                  .subscribe();
              }
              if (!oldValues) {
                this.isQuotationFormButtonDisabled = true;
                return;
              }
              if (item?.id) {
                this.isQuotationFormButtonDisabled =
                  this.invoicingForm.invalid ||
                  (!keys(
                    FormHelper.getNonEmptyAndChangedValues(
                      pick(newValues, ['note', 'toPay', 'number', 'totalPrice', 'totalTax']),
                      pick(item, ['note', 'toPay', 'number', 'totalPrice', 'totalTax']),
                    ),
                  ).length &&
                    isEqual(new Date(newValues.date), new Date(item.date)) &&
                    isEqual(sortBy(newValues.details, ['key']), sortBy(item.details, ['key'])) &&
                    isEqual(
                      sortBy(
                        map(newValues.taxes, (tax, index: number) => ({ tax, rank: (index + 1).toString() })),
                        ['rank'],
                      ),
                      sortBy(
                        map(item.taxes, (tax) => ({ ...tax, tax: tax.tax.id })),
                        ['rank'],
                      ),
                    ) &&
                    newValues.bank.id === item.bank?.id &&
                    newValues.project === item.project?.id &&
                    newValues.totalPrice?.net === item.totalPrice?.net &&
                    newValues.totalPrice?.gross === item.totalPrice?.gross &&
                    newValues.customer?.customer === (item as any).customer?.customer?.id &&
                    isEqual(sortBy(newValues.customer?.details, ['key', 'value']), sortBy((item as any).customer?.details, ['key', 'value'])) &&
                    newValues.products?.length === item.products?.length &&
                    reduce(
                      newValues.products,
                      (accumulator: boolean, current: any, index: number) => {
                        const controlValue = sortBy(item.products, ['rank'])[index];
                        accumulator = accumulator && current.kind === controlValue.kind;
                        if (current.kind === ProductKindEnum.SECTION || current.kind === ProductKindEnum.TEXT) {
                          return accumulator && controlValue.text === current.text;
                        }
                        if (current.kind === ProductKindEnum.SUBTOTAL) {
                          return accumulator && controlValue.value === current.value.toString();
                        }
                        if (current.kind === ProductKindEnum.PRODUCT) {
                          return (
                            accumulator &&
                            ((!current.product.article && !current.product.barcode) ||
                              isEqual(
                                {
                                  ...omit(current.product, ['rent', 'barcode', 'description', 'priceList', 'descriptionVisible']),
                                  description: current.product?.description || '',
                                  discount: {
                                    amount: current.product.discount?.amount.toString(),
                                    discountType: current.product.discount?.discountType,
                                  },
                                },
                                {
                                  ...omit(controlValue.product, ['rent', 'description']),
                                  article: controlValue.product.article.id,
                                  taxes: map(controlValue.product.taxes, 'tax.id'),
                                  description: controlValue.product?.description || '',
                                  discount: {
                                    amount: controlValue.product.discount?.amount.toString(),
                                    discountType: controlValue.product.discount?.discountType,
                                  },
                                },
                              ))
                          );
                        }
                        return accumulator;
                      },
                      true,
                    ));
                return;
              }
              this.isQuotationFormButtonDisabled = this.invoicingForm.invalid;
            }),
          );
        }),
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.translate.get(['invoices.createInvoice', 'invoices.updateInvoice', 'invoices.invoice']).subscribe(() => {
      // Once translations are loaded, update the route data
      this.updateRouteData();
    });
    this.barcodesInput$
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((term) => {
          this.articlesService.searchString = term;
          return this.articlesService.searchSimpleBarcodesByTargetWithStock(true);
        }),
      )
      .subscribe(() => this.changeDetectorRef.markForCheck());
    this.projectsInput$
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((term) => {
          this.projectsService.searchString = term;
          return this.projectsService.getProjectsByTargetWithFilter(null, true);
        }),
      )
      .subscribe(() => this.changeDetectorRef.markForCheck());
    this.customersInput$
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((term) => {
          this.companiesService.searchString = term;
          return this.companiesService.getCompaniesByTarget(true);
        }),
      )
      .subscribe(() => this.changeDetectorRef.markForCheck());
  }
  updateRouteData(): void {
    // Access route data using ActivatedRoute
    const routeData = this.route.snapshot.data;
    routeData['breadCrumbItems'][0].label = this.translate.instant('MENUITEMS.TS.INVENTORY');
    if (routeData['breadCrumbItems'][1] === 'Create Invoice') {
      routeData['breadCrumbItems'][1].label = this.translate.instant('MENUITEMS.TS.CREATE_INVOICE');
    } else if (routeData['breadCrumbItems'][1] === 'Update Invoice') {
      routeData['breadCrumbItems'][1].label = this.translate.instant('MENUITEMS.TS.UPDATE_INVOICE');
    } else if (routeData['breadCrumbItems'][1] === 'Create Purchase Note') {
      routeData['breadCrumbItems'][1].label = this.translate.instant('MENUITEMS.TS.CREATE_PURCHASE_NOTE');
    } else if (routeData['breadCrumbItems'][1] === 'Update Purchase Note') {
      routeData['breadCrumbItems'][1].label = this.translate.instant('MENUITEMS.TS.UPDATE_PRUCHASE_NOTE');
    } else if (routeData['breadCrumbItems'][1] === 'Create Purchase') {
      routeData['breadCrumbItems'][1].label = this.translate.instant('MENUITEMS.TS.CREATE_PURCHASE');
    } else if (routeData['breadCrumbItems'][1] === 'Update Purchase') {
      routeData['breadCrumbItems'][1].label = this.translate.instant('MENUITEMS.TS.UPDATE_PURCHASE');
    } else if (routeData['breadCrumbItems'][1] === 'Create Invoice') {
      routeData['breadCrumbItems'][1].label = this.translate.instant('MENUITEMS.TS.CREATE_INVOICE');
    } else if (routeData['breadCrumbItems'][1] === 'Update Invoice') {
      routeData['breadCrumbItems'][1].label = this.translate.instant('MENUITEMS.TS.UPDATE_INVOICE');
    } else if (routeData['breadCrumbItems'][1] === 'Create Delivery Note') {
      routeData['breadCrumbItems'][1].label = this.translate.instant('MENUITEMS.TS.CREATE_DELIVERY_NOTE');
    } else if (routeData['breadCrumbItems'][1] === 'Update Delivery Note') {
      routeData['breadCrumbItems'][1].label = this.translate.instant('MENUITEMS.TS.UPDATE_DELIVERY_NOTE');
    } else if (routeData['breadCrumbItems'][1] === 'Create Issue note') {
      routeData['breadCrumbItems'][1].label = this.translate.instant('MENUITEMS.TS.CREATE_ISSUE_NOTE');
    } else if (routeData['breadCrumbItems'][1] === 'Update Issue note') {
      routeData['breadCrumbItems'][1].label = this.translate.instant('MENUITEMS.TS.UPDATE_ISSUE_NOTE');
    } else if (routeData['breadCrumbItems'][1] === 'Create Order') {
      routeData['breadCrumbItems'][1].label = this.translate.instant('MENUITEMS.TS.CREATE_ORDER');
    } else if (routeData['breadCrumbItems'][1] === 'Update Order') {
      routeData['breadCrumbItems'][1].label = this.translate.instant('MENUITEMS.TS.UPDATE_ORDER');
    } else if (routeData['breadCrumbItems'][1] === 'Create Quotation') {
      routeData['breadCrumbItems'][1].label = this.translate.instant('MENUITEMS.TS.CREATE_QUOTATION');
    } else if (routeData['breadCrumbItems'][1] === 'Update Quotation') {
      routeData['breadCrumbItems'][1].label = this.translate.instant('MENUITEMS.TS.UPDATE_QUOTATION');
    }
  }

  onBarcodeChange(index: number, event: any) {
    const currentProduct = this.products.at(index);
    let patchValue = {
      label: event.name,
      barcode: event.barcode,
      priceList: event.priceList,
      price: event.price.toString(),
      taxes: map(event.taxes, 'tax.id'),
      total: (+event.price * +currentProduct.get('product.quantity').value).toString(),
    };
    if (event.discount?.discountType && event.discount?.amount) {
      currentProduct.get('product.discount').patchValue({ amount: event.discount.amount.toString(), discountType: event.discount.discountType });
      patchValue.total = (
        (event.price -
          (event.discount.discountType === DiscountType.AMOUNT ? +event.discount.amount : (+event.price * +event.discount.amount) / 100)) *
        +currentProduct.get('product.quantity').value
      ).toString();
    }
    currentProduct.get('product').patchValue(patchValue);
    this.totalLoading = true;
    this.calculateTotal();
    this.changeDetectorRef.markForCheck();
  }

  updatePrice(price: any, index: number) {
    this.products.at(index).get('product.price').patchValue(price.value);
    this.recalculateProductTotal(index);
    this.changeDetectorRef.markForCheck();
  }

  getBarcodeNameFromIndex(index: number) {
    return this.products.at(index).get('product.label').value;
  }

  getTaxesFromIndex(index: number) {
    return this.settingsService.allTaxes$.pipe(
      take(1),
      rxMap((taxes) => filter(taxes, (tax) => includes((this.products.at(index).get('product.taxes') as FormArray).value, tax.id))),
    );
  }

  changeRentStatus(content: any, index: number) {
    this.rentForm.patchValue({
      index,
      location: this.products.at(index).get('product.rent').value.location || '',
      description: this.products.at(index).get('product.rent').value.description || '',
      range:
        this.products.at(index).get('product.rent').value.start && this.products.at(index).get('product.rent').value.end
          ? {
              to: new Date(this.products.at(index).get('product.rent').value.end),
              from: new Date(this.products.at(index).get('product.rent').value.start),
            }
          : null,
    });
    this.openedModal = this.modalService.open(content, { centered: true });
    this.openedModal.closed
      .pipe(
        take(1),
        rxMap((data) => {
          if (!data?.range?.to || !data?.range?.from) {
            this.products.at(index).get('product.rent').reset();
            return;
          }
          this.products
            .at(index)
            .get('product.rent')
            .patchValue({
              end: data.range.to,
              start: data.range.from,
              ...(data.location ? { location: data.location } : {}),
              ...(data.description ? { description: data.description } : {}),
            });
        }),
      )
      .subscribe(() => this.changeDetectorRef.markForCheck());
  }

  resetRent() {
    this.rentForm.reset({ index: this.rentForm.value.index });
    this.openedModal.close();
    this.products.at(this.rentForm.value.index).get('product.rent').reset();
    this.changeDetectorRef.markForCheck();
  }

  saveRent() {
    this.openedModal.close(this.rentForm.value);
  }

  recalculateProductTotal(index: number) {
    const currentProduct = this.products.at(index);
    let finalPrice =
      +currentProduct.get('product.price').value -
      (currentProduct.get('product.discount.discountType').value === DiscountType.AMOUNT
        ? +currentProduct.get('product.discount.amount').value
        : (+currentProduct.get('product.price').value * +currentProduct.get('product.discount.amount').value) / 100);
    currentProduct.get('product.total').patchValue((+finalPrice * +currentProduct.get('product.quantity').value).toString());
    this.totalLoading = true;
    this.recalculateSubTotals();
    this.calculateTotal();
    this.changeDetectorRef.markForCheck();
  }

  recalculateSubTotals() {
    this.subTotalLoading = true;
    let subTotal = 0;
    forEach(this.products.value, (product, index: number) => {
      if (product.kind === ProductKindEnum.PRODUCT) {
        subTotal += +product.product.total;
      }
      if (product.kind === ProductKindEnum.SUBTOTAL) {
        this.products.at(index).get('value').patchValue(subTotal);
        subTotal = 0;
      }
    });
    this.subTotalLoading = false;
    this.changeDetectorRef.markForCheck();
  }

  calculateTotal() {
    this.toPayLoading = true;
    this.invoicingService.isAvoir$
      .pipe(
        take(1),
        switchMap((isAvoir) =>
          this.invoicingService.getPricesCalculations(
            reduce(
              this.products.value,
              (accumulator: any, current) => {
                if (current.kind === ProductKindEnum.PRODUCT) {
                  accumulator.push({
                    ...omit(current.product, ['priceList', 'quantity', 'barcode', 'descriptionVisible']),
                    quantity: current.product.quantity || 1,
                    taxes: map(current.product.taxes, (tax: string, index: number) => ({ tax, rank: index + 1 })),
                    discount: {
                      amount: current.product.discount.amount.toString(),
                      discountType: current.product.discount.discountType,
                    },
                  });
                }
                return accumulator;
              },
              [],
            ) as any,
            map(this.invoicingForm.get('taxes').value, (tax: string, index: number) => ({ tax, rank: index + 1 })),
            this.invoicingForm.get('discount').value,
            isAvoir,
          ),
        ),
        rxMap((calculations: InvoicingPricesCalculationType) => {
          return this.invoicingForm.patchValue({
            toPay: (+calculations.toPay).toFixed(3).toString(),
            totalTax: (+calculations.totalTax).toFixed(3).toString(),
            totalPrice: {
              net: (+calculations.totalPrice.net).toFixed(3).toString(),
              gross: (+calculations.totalPrice.gross).toFixed(3).toString(),
            },
          });
        }),
      )
      .subscribe(() => {
        this.totalLoading = false;
        this.toPayLoading = false;
        this.changeDetectorRef.markForCheck();
      });
  }

  resetProduct(index: number) {
    this.products.at(index)?.get('product.label').reset();
    this.products.at(index)?.get('product.article').reset();
    this.products.at(index)?.get('product.barcode').reset();
  }

  addGlobalDiscount() {
    this.hasDiscount = true;
  }

  addGlobalTaxes() {
    this.hasTaxes = true;
  }

  resetCustomer() {
    this.companyService.selectedCustomer$ = null;
    this.invoicingService.selectedCustomerSupplier$ = null;
    this.invoicingForm.get('customer.customer').reset('');
  }

  resetBank() {
    this.companyService.selectedBank$ = null;
    this.invoicingForm.get('bank').reset();
  }

  selectBank(event: any) {
    this.companyService.selectedBank$ = event;
    this.invoicingForm.get('bank').patchValue(event.id);
  }

  save() {
    this.isQuotationFormButtonDisabled = true;
    combineLatest([this.invoicingService.item$, this.invoicingService.isAvoir$, this.invoicingService.pageId$])
      .pipe(
        take(1),
        rxMap(([item, isAvoir, pageId]) => {
          const newItem =
            item && !isAvoir
              ? {
                  id: item.id,
                  ...FormHelper.getNonEmptyAndChangedValues(
                    pick(this.invoicingForm.value, ['note', 'toPay', 'number', 'totalTax']),
                    pick(item, ['note', 'toPay', 'number', 'totalTax']),
                  ),
                  ...(!isEqual(sortBy(this.invoicingForm.value.details, ['key']), sortBy(item.details, ['key']))
                    ? { details: this.invoicingForm.value.details }
                    : {}),
                  ...(this.invoicingForm.value.bank !== item.bank.id ? { bank: this.invoicingForm.value.bank } : {}),
                  ...(!isEqual(new Date(this.invoicingForm.value.date), new Date(item.date)) ? { date: this.invoicingForm.value.date } : {}),
                  // no global discount in quotation backend yet
                  // ...(this.quotationForm.value.discount?.amount !== quotation.discount?.amount ||
                  // this.quotationForm.value.discount?.discountType
                  //   ? { discount: this.quotationForm.value.discount }
                  //   : {}),
                  ...(!isEqual(
                    sortBy(
                      map(this.invoicingForm.value.taxes, (tax, index: number) => ({ tax, rank: (index + 1).toString() })),
                      ['rank'],
                    ),
                    sortBy(
                      map(item.taxes, (tax) => ({ ...tax, tax: tax.tax.id })),
                      ['rank'],
                    ),
                  )
                    ? { taxes: map(this.invoicingForm.value.taxes, (tax, index: number) => ({ tax, rank: index + 1 })) }
                    : {}),
                  ...(this.invoicingForm.value.products?.length !== item.products?.length ||
                  reduce(
                    this.invoicingForm.value.products,
                    (accumulator: boolean, current: any, index: number) => {
                      const controlValue = sortBy(item.products, ['rank'])[index];
                      return (
                        accumulator ||
                        controlValue.kind !== current.kind ||
                        controlValue.rank !== index.toString() ||
                        (current.kind === ProductKindEnum.SECTION || current.kind === ProductKindEnum.TEXT
                          ? current.text !== controlValue.text
                          : false) ||
                        (current.kind === ProductKindEnum.PRODUCT
                          ? !isEqual(
                              {
                                ...omit(current.product, ['rent', 'barcode', 'discount', 'priceList', 'description', 'descriptionVisible']),
                                ...(current.product.description ? { description: current.product.description } : {}),
                                ...(current.product.discount?.amount && current.product.discount?.discountType
                                  ? {
                                      discount: {
                                        amount: current.product.discount?.amount.toString(),
                                        discountType: current.product.discount?.discountType,
                                      },
                                    }
                                  : {}),
                              },
                              {
                                ...omit(controlValue?.product, ['rent', 'discount', 'description']),
                                article: controlValue?.product?.article.id,
                                taxes: map(controlValue?.product?.taxes, 'tax.id'),
                                ...(controlValue?.product?.description ? { description: controlValue?.product?.description } : {}),
                                ...(controlValue?.product?.discount?.amount && controlValue?.product?.discount?.discountType
                                  ? {
                                      discount: {
                                        amount: controlValue?.product?.discount?.amount.toString(),
                                        discountType: controlValue?.product?.discount?.discountType,
                                      },
                                    }
                                  : {}),
                              },
                            )
                          : false)
                      );
                    },
                    false,
                  )
                    ? {
                        products: map(this.invoicingForm.value.products, (product, index: number) => ({
                          rank: index + 1,
                          kind: product.kind,
                          ...(product.text && product.kind === ProductKindEnum.TEXT && product.kind === ProductKindEnum.SECTION
                            ? { text: product.text }
                            : {}),
                          ...(product.value && product.kind === ProductKindEnum.SUBTOTAL ? { value: product.value.toString() } : {}),
                          ...(product.product && product.kind === ProductKindEnum.PRODUCT
                            ? {
                                product: {
                                  ...omit(product.product, ['rent', 'barcode', 'discount', 'priceList', 'description', 'descriptionVisible']),
                                  ...(product.product.description ? { description: product.product.description } : {}),
                                  ...(product.product.discount?.amount
                                    ? {
                                        discount: {
                                          amount: product.product.discount.amount.toString(),
                                          discountType: product.product.discount.discountType,
                                        },
                                      }
                                    : {}),
                                  ...(product.product?.rent?.start && product.product?.rent?.end
                                    ? {
                                        rent: {
                                          end: product.product.rent.end,
                                          start: product.product.rent.start,
                                          ...(product.product?.rent?.location ? { location: product.product?.rent?.location } : {}),
                                          ...(product.product?.rent?.description ? { description: product.product?.rent?.description } : {}),
                                        },
                                      }
                                    : {}),
                                  taxes: map(product.product.taxes, (tax, i) => ({ tax, rank: i + 1 })),
                                },
                              }
                            : {}),
                        })),
                      }
                    : {}),
                  ...(this.invoicingForm.value.totalPrice?.net !== item.totalPrice?.net ||
                  this.invoicingForm.value.totalPrice?.gross !== item.totalPrice?.gross
                    ? { totalPrice: { net: this.invoicingForm.value.totalPrice.net, gross: this.invoicingForm.value.totalPrice.gross } }
                    : {}),
                  ...(this.invoicingForm.value.customer?.customer !== (item as any).customer?.customer?.id ||
                  !isEqual(
                    sortBy(this.invoicingForm.value.customer?.details, ['key', 'value']),
                    sortBy((item as any).customer?.details, ['key', 'value']),
                  )
                    ? {
                        customer: {
                          ...(this.invoicingForm.value.customer?.customer ? { customer: this.invoicingForm.value.customer?.customer } : {}),
                          ...(this.invoicingForm.value.customer?.details?.length ? { details: this.invoicingForm.value.customer?.details } : {}),
                        },
                      }
                    : {}),
                }
              : {
                  ...pick(this.invoicingForm.value, ['date', 'note', 'toPay', 'number', 'target', 'company', 'project', 'totalPrice', 'totalTax']),
                  ...(this.invoicingForm.value.bank ? { bank: this.invoicingForm.value.bank } : {}),
                  ...(this.invoicingForm.value.details?.length ? { details: this.invoicingForm.value.details } : {}),
                  // no global discount in quotation backend yet
                  // ...(this.quotationForm.value.discount?.amount ? { discount: this.quotationForm.value.discount } : {}),
                  ...(this.invoicingForm.value.taxes.length
                    ? { taxes: map(this.invoicingForm.value.taxes, (tax, index: number) => ({ tax, rank: index + 1 })) }
                    : {}),
                  ...(this.invoicingForm.value.products?.length
                    ? {
                        products: map(this.invoicingForm.value.products, (product, index: number) => ({
                          kind: product.kind,
                          rank: index + 1,
                          ...(product.text ? { text: product.text } : {}),
                          ...(product.value ? { value: product.value.toString() } : {}),
                          ...(product.product?.article
                            ? {
                                product: {
                                  ...omit(product.product, ['rent', 'barcode', 'discount', 'priceList', 'description', 'descriptionVisible']),
                                  ...(product.product.description ? { description: product.product.description } : {}),
                                  ...(product.product.discount?.amount
                                    ? {
                                        discount: {
                                          amount: product.product.discount.amount.toString(),
                                          discountType: product.product.discount.discountType,
                                        },
                                      }
                                    : {}),
                                  ...(product.product?.rent?.start && product.product?.rent?.end
                                    ? {
                                        rent: {
                                          end: product.product.rent.end,
                                          start: product.product.rent.start,
                                          ...(product.product?.rent?.location ? { location: product.product?.rent?.location } : {}),
                                          ...(product.product?.rent?.description ? { description: product.product?.rent?.description } : {}),
                                        },
                                      }
                                    : {}),
                                  ...(product.product.taxes?.length ? { taxes: map(product.product.taxes, (tax, i) => ({ tax, rank: i + 1 })) } : {}),
                                },
                              }
                            : {}),
                        })),
                      }
                    : {}),
                  ...(this.invoicingForm.value.totalPrice
                    ? { totalPrice: { net: this.invoicingForm.value.totalPrice.net, gross: this.invoicingForm.value.totalPrice.gross } }
                    : {}),
                  ...(this.invoicingForm.value.customer?.customer || this.invoicingForm.value.customer?.details.length
                    ? {
                        customer: {
                          ...(this.invoicingForm.value.customer?.customer ? { customer: this.invoicingForm.value.customer?.customer } : {}),
                          ...(this.invoicingForm.value.customer?.details?.length ? { details: this.invoicingForm.value.customer?.details } : {}),
                        },
                      }
                    : {}),
                };
          let args: any[];
          let methodName: InvoicingMethodNameType;
          let serviceName: InvoicingServiceNameType;
          switch (pageId) {
            case 'quotations':
              args = [newItem];
              serviceName = 'quotationsService';
              methodName = newItem.id ? 'updateQuotation' : 'createQuotation';
              break;
            case 'salesOrders':
              args = [newItem.id ? newItem.id : newItem, ...(newItem.id ? [omit(newItem, 'id') as any] : [])];
              serviceName = 'ordersService';
              methodName = newItem.id ? 'updateSaleOrder' : 'createSaleOrder';
              break;
            case 'salesInvoices':
              args = [newItem.id ? newItem.id : newItem, ...(newItem.id ? [omit(newItem, 'id') as any] : [])];
              serviceName = 'salesInvoicesService';
              methodName = newItem.id && isAvoir ? 'updateSaleInvoice' : 'createSaleInvoice';
              break;
            case 'salesIssueNotes':
              args = [newItem.id ? newItem.id : newItem, ...(newItem.id ? [omit(newItem, 'id') as any] : [])];
              serviceName = 'issueNotesService';
              methodName = newItem.id ? 'updateSaleIssueNote' : 'createSaleIssueNote';
              break;
            case 'salesDeliveryNotes':
              args = [newItem.id ? newItem.id : newItem, ...(newItem.id ? [omit(newItem, 'id') as any] : [])];
              serviceName = 'deliveryNotesService';
              methodName = newItem.id ? 'updateSaleDeliveryNote' : 'createSaleDeliveryNote';
              break;
            case 'purchaseNotes':
              args = [
                newItem.id
                  ? newItem.id
                  : {
                      ...omit(newItem, ['id', 'customer']),
                      supplier: {
                        supplier: newItem.customer.customer,
                        ...(newItem.customer.details?.length ? { details: newItem.customer.details } : {}),
                      },
                    },
                ...(newItem.id
                  ? [
                      {
                        ...omit(newItem, ['id', 'customer']),
                        supplier: {
                          supplier: newItem.customer.customer,
                          ...(newItem.customer.details?.length ? { details: newItem.customer.details } : {}),
                        },
                      } as any,
                    ]
                  : []),
              ];
              serviceName = 'notesService';
              methodName = newItem.id ? 'updatePurchaseDeliveryNote' : 'createPurchaseDeliveryNote';
              break;
            case 'purchaseOrders':
              args = [
                newItem.id
                  ? newItem.id
                  : {
                      ...omit(newItem, ['id', 'customer']),
                      supplier: {
                        supplier: newItem.customer.customer,
                        ...(newItem.customer.details?.length ? { details: newItem.customer.details } : {}),
                      },
                    },
                ...(newItem.id
                  ? [
                      {
                        ...omit(newItem, ['id', 'customer']),
                        supplier: {
                          supplier: newItem.customer.customer,
                          ...(newItem.customer.details?.length ? { details: newItem.customer.details } : {}),
                        },
                      } as any,
                    ]
                  : []),
              ];
              serviceName = 'purchasesService';
              methodName = newItem.id ? 'updatePurchaseOrder' : 'createPurchaseOrder';
              break;
            case 'purchaseInvoices':
              args = [
                newItem.id
                  ? newItem.id
                  : {
                      ...omit(newItem, ['id', 'customer']),
                      supplier: {
                        supplier: newItem.customer.customer,
                        ...(newItem.customer.details?.length ? { details: newItem.customer.details } : {}),
                      },
                    },
                ...(newItem.id
                  ? [
                      {
                        ...omit(newItem, ['id', 'customer']),
                        supplier: {
                          supplier: newItem.customer.customer,
                          ...(newItem.customer.details?.length ? { details: newItem.customer.details } : {}),
                        },
                      } as any,
                    ]
                  : []),
              ];
              serviceName = 'purchaseInvoicesService';
              methodName = newItem.id ? 'updatePurchaseInvoice' : 'createPurchaseInvoice';
              break;
          }
          return { serviceName, methodName, args };
        }),
        switchMap(({ serviceName, methodName, args }) =>
          combineLatest([this[serviceName][methodName](...args) as Observable<any>, this.invoicingService.parentPage$]),
        ),
        take(1),
        rxMap(([res, parentPage]) => this.router.navigate([`${parentPage}/page`, res.id])),
      )
      .subscribe();
  }

  addCustomerField() {
    this.customerDetails.push(this.formBuilder.group({ key: '', value: '' }));
  }

  removeCustomerField(index: number) {
    this.customerDetails.removeAt(index);
  }

  addField() {
    this.details.push(this.formBuilder.group({ key: '', value: '' }));
  }

  removeField(index: number) {
    this.details.removeAt(index);
  }

  loadMoreCompanies() {
    this.companiesService.isLast$
      .pipe(
        take(1),
        switchMap((isLast: boolean) => {
          if (isLast) {
            return of(null);
          }
          this.companiesService.leadsPageIndex += 1;
          this.companiesService.getCompaniesByTarget();
        }),
      )
      .subscribe();
  }

  loadMoreProjects() {
    this.projectsService.isLast$
      .pipe(
        take(1),
        switchMap((isLast: boolean) => {
          if (isLast) {
            return of(null);
          }
          this.projectsService.pageIndex += 1;
          this.projectsService.getProjectsByTargetWithFilter();
        }),
      )
      .subscribe();
  }

  loadMoreBarcodes() {
    this.articlesService.isBarcodeLastPage$
      .pipe(
        take(1),
        switchMap((isLast: boolean) => {
          if (isLast) {
            return of(null);
          }
          this.articlesService.pageIndex += 1;
          return this.articlesService.searchSimpleBarcodesByTargetWithStock();
        }),
      )
      .subscribe();
  }

  addTax(event: TaxType, element?: NgSelectComponent) {
    combineLatest([this.invoicingService.isAvoir$, this.settingsService.visibleGlobalTaxes$])
      .pipe(
        take(1),
        rxMap(([isAvoir, globalTaxes]) => {
          if (event) {
            this.invoicingForm.get('taxes').patchValue([...this.invoicingForm.get('taxes').value, event.id]);
            const price = !this.globalSelectedTaxes.length
              ? +this.invoicingForm.get('totalPrice.gross').value
              : +this.globalSelectedTaxes[this.globalSelectedTaxes.length - 1].newPrice;
            const initialaxValue = event.value.type === DiscountType.PERCENTAGE ? (+event.value.value * price) / 100 : +event.value.value;
            const taxValue =
              (event.value.sign === TaxSignEnum.NEGATIVE && !isAvoir) || (event.value.sign === TaxSignEnum.POSITIVE && isAvoir)
                ? -initialaxValue
                : initialaxValue;
            const newPrice = price + taxValue;
            this.globalSelectedTaxes.push({
              taxValue,
              newPrice,
              id: event.id,
              label: event.label,
              isNegative: event.value.sign === TaxSignEnum.NEGATIVE,
            });
            if (element) {
              element.clearModel();
            }
            this.settingsService.visibleGlobalTaxes$ = filter(globalTaxes, (tax) => tax.id !== event.id);
            this.calculateTotal();
          }
        }),
      )
      .subscribe();
  }

  removeTax(index: number, tax: any) {
    combineLatest([this.settingsService.visibleGlobalTaxes$, this.settingsService.globalTaxes$])
      .pipe(
        take(1),
        rxMap(([visibleGlobalTaxes, globalTaxes]) => {
          this.invoicingForm.get('taxes').patchValue(without(this.invoicingForm.get('taxes').value, tax.id));
          this.globalSelectedTaxes = [...this.globalSelectedTaxes.slice(0, index), ...this.globalSelectedTaxes.slice(index + 1)];
          const taxToRemove = find(globalTaxes, { id: tax.id });
          this.settingsService.visibleGlobalTaxes$ = [...visibleGlobalTaxes, taxToRemove];
          this.calculateTotal();
        }),
      )
      .subscribe();
  }

  addItem(kind: ProductKindEnum): void {
    const products: any = slice(this.products.value, findLastIndex(this.products.value, { kind: ProductKindEnum.SUBTOTAL }) + 1);
    this.products.push(
      this.formBuilder.group({
        kind: [kind, [Validators.required]],
        ...(kind === ProductKindEnum.SUBTOTAL ? { value: [sumBy(products, (product: any) => +(product.product?.total || 0))] } : {}),
        ...(kind === ProductKindEnum.SECTION || kind === ProductKindEnum.TEXT ? { text: [''] } : {}),
        ...(kind === ProductKindEnum.PRODUCT
          ? {
              product: this.formBuilder.group({
                label: [''],
                total: [''],
                taxes: [[]],
                price: [null],
                barcode: [''],
                quantity: [1],
                article: [null],
                priceList: [[]],
                description: [''],
                descriptionVisible: [false],
                discount: this.formBuilder.group({ amount: '0', discountType: [DiscountType.PERCENTAGE] }),
                rent: this.formBuilder.group({
                  end: [''],
                  start: [''],
                  location: [''],
                  description: [''],
                }),
              }),
            }
          : {}),
      }),
    );
  }

  removeItem(index: number) {
    const item = this.products.at(index);
    this.products.removeAt(index);
    if (item.value.kind === ProductKindEnum.PRODUCT || item.value.kind === ProductKindEnum.SUBTOTAL) {
      this.totalLoading = true;
      this.calculateTotal();
    }
    if (item.value.kind === ProductKindEnum.SUBTOTAL) {
      this.recalculateSubTotals();
    }
  }

  onDrop(event: CdkDragDrop<any[]>) {
    this.moveItemInFormArray(this.products, event.previousIndex, event.currentIndex);
    const currentControl = this.products.at(event.currentIndex);
    if (currentControl.value.kind !== ProductKindEnum.PRODUCT && currentControl.value.kind !== ProductKindEnum.SUBTOTAL) {
      return;
    }
    this.recalculateSubTotals();
  }

  moveItemInFormArray(formArray: FormArray, fromIndex: number, toIndex: number): void {
    const dir = toIndex > fromIndex ? 1 : -1;
    const item = formArray.at(fromIndex);
    for (let i = fromIndex; i * dir < toIndex * dir; i = i + dir) {
      const current = formArray.at(i + dir);
      formArray.setControl(i, current);
    }
    formArray.setControl(toIndex, item);
  }

  downloadDocument() {
    this.item$
      .pipe(
        take(1),
        switchMap((item) => this.invoicingService.downloadDocument(item)),
      )
      .subscribe();
  }

  sendDocumentToEmail() {
    this.translate.get('MENUITEMS.TS.AN_EMAIL_SENT').subscribe((anEmailSent: string) => {
      this.translate.get('MENUITEMS.TS.EMAIL_SENT').subscribe((EmailSent: string) => {
        this.item$
          .pipe(
            take(1),
            switchMap((item) => this.invoicingService.sendDocumentToEmail(item)),
          )
          .subscribe((response) => {
            this.toastr.success(EmailSent, anEmailSent, { positionClass: 'toast-bottom-right' });
          });
      });
    });
  }

  getLabel(value: string): string {
    return value
      .slice(0, -1)
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase();
  }
}
