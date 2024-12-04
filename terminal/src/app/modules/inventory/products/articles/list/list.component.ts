import Swal from 'sweetalert2';
import { Clipboard } from '@angular/cdk/clipboard';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbNavChangeEvent, NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { map, find, keys, omit, clone, pickBy, values, forEach, isEqual, without, includes, cloneDeep, isEqualWith } from 'lodash';
import {
  take,
  Subject,
  switchMap,
  takeUntil,
  Observable,
  catchError,
  throwError,
  debounceTime,
  map as rxMap,
  Subscription,
  combineLatest,
  ReplaySubject,
  distinctUntilChanged,
  of,
} from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import { BarcodeFilterResponseType, BarcodesFilterInput, SheetsNames } from '@sifca-monorepo/terminal-generator';
import { ConvertorHelper, FormHelper, ValidationHelper } from '@diktup/frontend/helpers';
import {
  UserType,
  BarcodeType,
  CompanyType,
  DiscountType,
  AttributeType,
  ProductStatusEnum,
  AttributeValueType,
  InternalProductType,
  ProductConditionEnum,
  ProductVarietyEnum,
} from '@sifca-monorepo/terminal-generator';

import { BarcodeService } from '../articles.service';
import { ProductsService } from '../../products/products.service';
import { ICatalogueCategoryTreeType } from '../../products/products.types';
import { SharedService } from '../../../../../shared/services/shared.service';
import { UserService } from '../../../../../core/services/user.service';
import { SupplierService } from '../../../../purchases/suppliers/suppliers.service';
import { InventoryService } from '../../../../../shared/services/inventory.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  selector: 'sifca-monorepo-articles-list',
})
export class ArticlesListComponent implements OnInit, OnDestroy {
  private fileInput = this.document.createElement('input');
  private fileInputExcel = this.document.createElement('input');
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  toPrice: any;
  fromPrice: any;
  allpublish: any;
  pageChanged: any;
  activeindex = '1';
  noBarCode = false;
  initialValues: any;
  selectedNav = 'All';
  barcode: BarcodeType;
  emailForm: FormGroup;
  barcodeForm: FormGroup;
  loadingImport: boolean;
  barcodes: BarcodeType[];
  isButtonDisabled = true;
  pagination: IPagination;
  isLoadingValues: boolean;
  priceRangeForm: FormGroup;
  breadCrumbItems!: Array<{}>;
  attributes: AttributeType[];
  selectedBarcode: BarcodeType;
  isEmailButtonDisabled = true;
  loadingImportPictures = false;
  selectedAttributeValue: string;
  isBarcodeButtonDisabled = true;
  selectedAttribute: AttributeType;
  statuses = values(ProductStatusEnum);
  navs = ['All', 'Published', 'Draft'];
  discountTypes = values(DiscountType);
  selectedAttributeNames: string[] = [];
  attributeValues: AttributeValueType[];
  selectedAttributeValues: string[] = [];
  conditions = values(ProductConditionEnum);
  attributePairs: { key: string; value: string[] }[];
  validateBarcode = this.validationHelper.validateBarcode;
  action$: Observable<string> = this.inventoryService.action$;
  pageId$: Observable<string> = this.inventoryService.pageId$;
  productSearchInput$: Subject<string> = new Subject<string>();
  supplierSearchInput$: Subject<string> = new Subject<string>();
  filterProductsSubscription: Subscription = new Subscription();
  owners$: Observable<UserType[]> = this.productsService.owners$;
  pageTitle$: Observable<string> = this.inventoryService.pageTitle$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  hasFilter$: Observable<boolean> = this.inventoryService.hasFilter$;
  parentLink$: Observable<string> = this.inventoryService.parentLink$;
  barcodes$: Observable<BarcodeType[]> = this.barcodeService.barcodes$;
  listHeader$: Observable<string[]> = this.inventoryService.listHeader$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  suppliers$: Observable<CompanyType[]> = this.suppliersService.suppliers$;
  technicians$: Observable<UserType[]> = this.productsService.technicians$;
  loadingBarcodes$: Observable<boolean> = this.barcodeService.loadingBarcodes$;
  products$: Observable<InternalProductType[]> = this.barcodeService.products$;
  toFilter$: Observable<BarcodeFilterResponseType> = this.barcodeService.toFilter$;
  ownersPagination$: Observable<IPagination> = this.productsService.ownersPagination$;
  categories$: Observable<ICatalogueCategoryTreeType[]> = this.productsService.categories$;
  isLastAttributeValues$: Observable<boolean> = this.barcodeService.isLastAttributeValues$;
  suppliersSearchString$: Observable<string> = this.suppliersService.suppliersSearchString$;
  infiniteProducts$: Observable<InternalProductType[]> = this.productsService.infiniteProducts$;
  techniciansPagination$: Observable<IPagination> = this.productsService.techniciansPagination$;
  barcodesFilterInput$: Observable<BarcodesFilterInput> = this.inventoryService.barcodesFilterInput$;

  get internalProduct(): FormControl {
    return this.barcodeForm.get('internalProduct') as FormControl;
  }
  get productAttributesValues(): FormControl {
    return this.barcodeForm.get('productAttributesValues') as FormControl;
  }
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private router: Router,
    private clipboard: Clipboard,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private sharedService: SharedService,
    private translate: TranslateService,
    private barcodeService: BarcodeService,
    private activatedRoute: ActivatedRoute,
    private convertorHelper: ConvertorHelper,
    private productsService: ProductsService,
    private suppliersService: SupplierService,
    private inventoryService: InventoryService,
    private validationHelper: ValidationHelper,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.fileInputExcel.type = 'file';
    this.fileInput.type = 'file';
    this.fileInput.name = 'file';
    this.fileInput.multiple = true;
    this.fileInput.style.display = 'none';
    this.fileInputExcel.type = 'file';
    this.fileInputExcel.name = 'file';
    this.fileInputExcel.multiple = true;
    this.fileInputExcel.style.display = 'none';
    this.fileInputExcel.addEventListener('change', () => {
      if (this.fileInputExcel.files.length) {
        this.convertFile(this.fileInputExcel.files[0]).subscribe((base64) => {
          this.loadingImport = true;
          this.productsService
            .importSimpleFullCorporateCatalogueByExcel(base64)
            .pipe(
              catchError(() => {
                this.loadingImport = false;
                this.modalService.dismissAll();
                this.modalError();
                this.changeDetectorRef.markForCheck();
                return of(null);
              }),
            )
            .subscribe(() => {
              this.modalService.dismissAll();
              this.position();
              this.loadingImport = false;
              this.changeDetectorRef.markForCheck();
            });
        });
      }
    });
    this.fileInput.addEventListener('change', () => {
      if (this.fileInput.files.length) {
        this.loadingImportPictures = true;
        this.productsService.uploadFiles(this.fileInput.files).then((res) => {
          this.modalService.dismissAll();
          this.position();
          this.loadingImportPictures = false;
        });
      }
    });
    this.barcodeService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.barcodeService.pageIndex || 0,
        size: this.barcodeService.filterLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.barcodeService.pageIndex || 0) * this.barcodeService.filterLimit,
        endIndex: Math.min(((this.barcodeService.pageIndex || 0) + 1) * this.barcodeService.filterLimit - 1, (pagination?.length || 0) - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
  }

  ngAfterViewInit() {
    this.suppliersService.searchInfiniteSuppliersByTarget().subscribe();
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.INVENTORY').subscribe((inventory: string) => {
      this.translate.get('MENUITEMS.TS.ARTICLES').subscribe((articles: string) => {
        this.breadCrumbItems = [{ label: inventory }, { label: articles, active: true }];
      });
    });
    this.barcodeService.infiniteAttributes$.pipe(takeUntil(this.unsubscribeAll)).subscribe((attributes: AttributeType[]) => {
      this.attributes = attributes;
      this.changeDetectorRef.markForCheck();
    });
    this.barcodeService.infiniteAttributeValues$.pipe(takeUntil(this.unsubscribeAll)).subscribe((attributeValues: AttributeValueType[]) => {
      this.attributeValues = attributeValues;
      this.changeDetectorRef.markForCheck();
    });
    this.barcodeService.toFilter$
      .pipe(
        take(1),
        rxMap((filter) => {
          this.toPrice = +filter?.priceRange?.max || 100;
          this.fromPrice = +filter?.priceRange?.min || 0;
          this.priceRangeForm = this.formBuilder.group({
            toPrice: [filter?.priceRange?.max || ''],
            fromPrice: [filter?.priceRange?.min || ''],
          });
          this.priceRangeForm.valueChanges.subscribe((newValues) => {
            this.toPrice = +newValues.toPrice;
            this.fromPrice = +newValues.fromPrice;
          });
        }),
      )
      .subscribe();
    this.productSearchInput$
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchString) => {
          this.barcodeService.products$ = null;
          this.barcodeService.productPageIndex = 0;
          return this.barcodeService.getSimpleProductWithFilter(searchString);
        }),
      )
      .subscribe(() => this.changeDetectorRef.markForCheck());
    this.supplierSearchInput$
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchString) => {
          this.suppliersService.suppliers$ = [];
          this.suppliersService.suppliersPageIndex = 0;
          this.suppliersService.suppliersSearchString$ = searchString;
          return this.suppliersService.searchSuppliersByTarget();
        }),
      )
      .subscribe(() => this.changeDetectorRef.markForCheck());
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.changeDetectorRef.markForCheck();
          this.barcodeService.searchString = searchValues.searchString;
          return this.barcodeService.searchSimpleBarcodesByTargetWithStock();
        }),
      )
      .subscribe(() => this.changeDetectorRef.markForCheck());
  }

  openImportModal(content: any) {
    this.modalService.open(content, { size: 'md', centered: true });
  }

  bulkUploadPicture() {
    this.fileInput.value = '';
    this.fileInput.click();
  }

  downloadDocument() {
    if (isPlatformBrowser(this.platformId)) {
      this.pageId$.pipe(take(1)).subscribe((pageId) => {
        const input: any = {
          ...(pageId === 'services'
            ? {
                sheets: [SheetsNames?.ARTICLES],
                variety: ProductVarietyEnum.SERVICE,
              }
            : {}),
          ...(pageId === 'products-articles'
            ? {
                sheets: [SheetsNames?.ARTICLES],
                variety: ProductVarietyEnum.PRODUCT,
              }
            : {}),
          ...(pageId === 'equipments-articles'
            ? {
                sheets: [SheetsNames?.ARTICLES],
                variety: ProductVarietyEnum.EQUIPMENT,
              }
            : {}),
        };
        this.productsService.getSimpleCatalogueByExcel(input).subscribe((res) => {
          const blob = this.convertorHelper.b64toBlob(res, 'application/vnd.openxmlformats-officethis.document.spreadsheetml.sheet');
          const a = this.document.createElement('a');
          this.document.body.appendChild(a);
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = String('suppliers.xlsx');
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
          this.changeDetectorRef.markForCheck();
        });
      });
    }
  }

  uploadExcel(): void {
    this.loadingImport = false;
    this.fileInputExcel.value = '';
    this.fileInputExcel.click();
  }

  convertFile(file: File): Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event) => result.next(btoa(event.target.result.toString()));
    return result;
  }

  openEmailModal(content: any) {
    this.modalService.open(content, { size: 'md', centered: true });
    this.userService.user$.pipe(take(1)).subscribe((user: UserType) => {
      this.emailForm = this.formBuilder.group({
        emails: [[user?.email], Validators.required],
      });
      const initialValues = this.emailForm.value;
      this.emailForm.valueChanges.subscribe((ivalues) => {
        this.isEmailButtonDisabled = isEqual(ivalues, initialValues);
      });
      this.changeDetectorRef.markForCheck();
    });
  }

  send() {
    this.pageId$.pipe(take(1)).subscribe((page) => {
      const input: any = {
        emails: this.emailForm.get('emails').value,
        ...(page === 'products-articles'
          ? {
              sheets: [SheetsNames?.ARTICLES],
              variety: ProductVarietyEnum.PRODUCT,
            }
          : {}),
        ...(page === 'equipments-articles'
          ? {
              sheets: [SheetsNames?.ARTICLES],
              variety: ProductVarietyEnum.EQUIPMENT,
            }
          : {}),
        ...(page === 'services'
          ? {
              sheets: [SheetsNames?.ARTICLES],
              variety: ProductVarietyEnum.SERVICE,
            }
          : {}),
      };
      this.isEmailButtonDisabled = true;
      this.barcodeService
        .sendCatalogueTemplateBymail(input)
        .pipe(
          catchError((error) => {
            this.modalService.dismissAll();
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return throwError(() => new Error(error));
          }),
        )
        .subscribe(() => {
          this.modalService.dismissAll();
          this.position();
          this.changeDetectorRef.markForCheck();
        });
    });
  }

  openBarcodeModal(content: NgbModal, barcode: BarcodeType) {
    this.selectedBarcode = barcode;
    this.selectedAttributeNames = [];
    this.selectedAttributeValues = [];
    delete this.selectedAttributeValue;
    this.barcodeService.valuesPageIndex = 0;
    this.barcodeService.infiniteAttributeValues$ = null;
    this.modalService.open(content, { size: 'lg', centered: true });
    combineLatest([this.pageId$, this.barcodeService.targetServiceProduct$])
      .pipe(
        take(1),
        rxMap(([pageId, targetServiceProduct]) => {
          this.barcodeForm = this.formBuilder.group({
            name: [barcode?.name || ''],
            ...(pageId !== 'services'
              ? {
                  productAttributesValues: [
                    barcode?.productAttributesValues?.attributesValues?.length ? map(barcode?.productAttributesValues?.attributesValues, 'id') : [],
                  ],
                }
              : {}),
            internalProduct: [
              targetServiceProduct && pageId === 'services' && !barcode?.internalProduct ? targetServiceProduct : barcode?.internalProduct,
              Validators.required,
            ],
            ...(pageId !== 'services' ? { supplier: [barcode?.supplier?.id || undefined] } : {}),
            barcode: [barcode?.barcode || '', [Validators.required, Validators.minLength(13), Validators.maxLength(13)]],
            discount: this.formBuilder.group({
              amount: [
                {
                  value: this.selectedBarcode?.discount?.amount || '0',
                  disabled: !this.selectedBarcode?.discount?.discountType || +this.selectedBarcode?.discount?.amount === 0,
                },
              ],
              discountType: [
                +this.selectedBarcode?.discount?.amount === 0 ? 'No discount' : this.selectedBarcode?.discount?.discountType || 'No discount',
              ],
            }),
            priceCredit: this.formBuilder.array(
              barcode?.priceCredit?.length
                ? map(barcode.priceCredit, (credit) => {
                    return this.formBuilder.group({
                      amount: [credit?.amount || ''],
                      periodCycle: [credit?.periodCycle || ''],
                      periodValue: [credit?.periodValue || ''],
                    });
                  })
                : [],
            ),
            price: [barcode?.price || ''],
            status: [barcode?.status || 'No status selected'],
            condition: [barcode?.condition || 'No condition selected'],
            pixel: this.formBuilder.group({
              include: [barcode?.pixel?.include || false],
            }),
            currentImageIndex: [0],
            media: this.formBuilder.group({
              pictures: this.formBuilder.array(
                barcode?.media?.pictures?.length
                  ? map(barcode?.media.pictures, (picture) => {
                      return this.formBuilder.group({
                        baseUrl: picture.baseUrl,
                        path: picture.path,
                      });
                    })
                  : [],
              ),
            }),
            // equipment only
            ...(pageId === 'equipments-articles'
              ? {
                  maintenance: this.formBuilder.group({
                    owner: [barcode?.maintenance?.owner?.id || undefined],
                    technician: [barcode?.maintenance?.technician?.id || undefined],
                    expectedMeantime: [barcode?.maintenance?.expectedMeantime || 0],
                    maintenanceDuration: [barcode?.maintenance?.maintenanceDuration || 0],
                    prevMaintenanceDuration: [barcode?.maintenance?.prevMaintenanceDuration || 0],
                  }),
                }
              : {}),
            // services only
            ...(pageId === 'services'
              ? {
                  catalogueCategory: [barcode?.catalogueCategory?.length ? barcode?.catalogueCategory[barcode?.catalogueCategory.length - 1].id : ''],
                }
              : {}),
          });
          this.barcodeForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((barcodeFormValues) => {
            if ((!barcode || barcodeFormValues?.barcode !== barcode?.barcode) && this.barcodeForm.get('barcode').valid) {
              this.barcodeService
                .getSimpleBarcodeByBarcodeAndTarget(barcodeFormValues.barcode)
                .pipe(
                  catchError((error) => {
                    if (this.barcodeForm.get('barcode').hasError('alreadyExists')) {
                      let otherErrors: string[] = [];
                      if (this.barcodeForm.get('barcode').hasError('required')) {
                        otherErrors.push('required');
                      }
                      if (this.barcodeForm.get('barcode').hasError('invalid')) {
                        otherErrors.push('invalid');
                      }
                      this.barcodeForm.get('barcode').setErrors(null);
                      if (otherErrors.length) {
                        forEach(otherErrors, (otherError) => this.barcodeForm.get('barcode').setErrors({ [otherError]: true }));
                      }
                    }
                    this.noBarCode = true;
                    return throwError(() => new Error(error));
                  }),
                )
                .subscribe((res) => {
                  if (res) {
                    this.noBarCode = false;
                    this.barcodeForm.get('barcode').setErrors({ alreadyExists: true });
                    this.translate.get('MENUITEMS.TS.BARCODE_EXISTS').subscribe((barcodeExists: string) => {
                      Swal.fire({
                        title: 'Oops...',
                        text: barcodeExists,
                        icon: 'warning',
                        showCancelButton: false,
                        confirmButtonColor: 'rgb(3, 142, 220)',
                        cancelButtonColor: 'rgb(243, 78, 78)',
                      });
                    });
                  } else {
                    if (this.barcodeForm.get('barcode').hasError('alreadyExists')) {
                      let otherErrors: string[] = [];
                      if (this.barcodeForm.get('barcode').hasError('required')) {
                        otherErrors.push('required');
                      }
                      if (this.barcodeForm.get('barcode').hasError('invalid')) {
                        otherErrors.push('invalid');
                      }
                      this.barcodeForm.get('barcode').setErrors(null);
                      if (otherErrors.length) {
                        forEach(otherErrors, (otherError) => this.barcodeForm.get('barcode').setErrors({ [otherError]: true }));
                      }
                    }
                    this.noBarCode = true;
                  }
                });
            }
            if (
              (!barcode || this.barcodeForm.get('internalProduct').value?.id !== barcode?.internalProduct?.id) &&
              this.barcodeForm.get('barcode').valid
            ) {
              this.getBarCode();
            }
            this.noBarCode = true;
            if (this.selectedBarcode) {
              const simpleFields = ['name', 'price', 'status', 'barcode', 'condition'];
              this.isButtonDisabled =
                (isEqual(
                  pickBy(barcode, (value, key) => includes(simpleFields, key) && !!value),
                  pickBy(barcodeFormValues, (value, key) => includes(simpleFields, key) && !!value),
                ) &&
                  (((!barcodeFormValues.pixel || !keys(barcodeFormValues.pixel).length) && (!barcode.pixel || !keys(barcode.pixel).length)) ||
                    (!barcode.pixel?.include && !barcodeFormValues.pixel?.include) ||
                    barcodeFormValues.pixel?.include === barcode.pixel?.include) &&
                  ((!(barcodeFormValues.discount || !keys(barcodeFormValues.discount).length) &&
                    (!barcode.discount || !keys(barcode.discount).length)) ||
                    (barcodeFormValues.discount?.discountType === 'No discount' && (!barcode.discount || !keys(barcode.discount).length)) ||
                    (barcodeFormValues.discount?.discountType === barcode.discount?.discountType &&
                      +barcodeFormValues.discount?.amount === +barcode.discount?.amount)) &&
                  barcodeFormValues.supplier === barcode.supplier?.id &&
                  barcodeFormValues.internalProduct?.id === barcode.internalProduct?.id &&
                  isEqual(
                    map(barcodeFormValues.media?.pictures, (picture) => `${picture.baseUrl}/${picture.path}`),
                    map(barcode?.media?.pictures, (picture) => `${picture.baseUrl}/${picture.path}`),
                  ) &&
                  isEqualWith(
                    barcode.priceCredit,
                    barcodeFormValues.priceCredit,
                    (credit, formCredit) =>
                      isEqual(map(credit, 'amount').sort(), map(formCredit, 'amount').sort()) &&
                      isEqual(map(credit, 'periodValue').sort(), map(formCredit, 'periodValue').sort()) &&
                      isEqual(map(credit, 'periodCycle').sort(), map(formCredit, 'periodCycle').sort()),
                  ) &&
                  isEqual(
                    clone(barcodeFormValues.productAttributesValues).sort(),
                    map(barcode.productAttributesValues.attributesValues, 'id').sort(),
                  )) ||
                this.barcodeForm.invalid;
            } else {
              this.isButtonDisabled = this.barcodeForm.invalid;
            }
            this.changeDetectorRef.markForCheck();
          });
          this.barcodeForm
            .get('discount.discountType')
            .valueChanges.pipe(
              takeUntil(this.unsubscribeAll),
              rxMap((discountType) => {
                const amountField = this.barcodeForm.get('discount.amount');
                if (discountType === 'No discount') {
                  amountField.reset(0);
                  amountField.disable();
                }
                if (discountType !== 'No discount' && !amountField.enabled) {
                  amountField.enable();
                }
              }),
            )
            .subscribe();
        }),
      )
      .subscribe();
    this.selectedAttributeValues = map(barcode?.productAttributesValues?.attributesValues, 'id');
    this.selectedAttributeNames = map(barcode?.productAttributesValues?.attributesValues, 'label');
  }

  copyText(textToCopy: string) {
    this.clipboard.copy(textToCopy);
  }

  save() {
    this.isButtonDisabled = true;
    const discount = FormHelper.getNonEmptyAndChangedValues(
      this.barcodeForm.get('discount').value,
      this.selectedBarcode?.discount ? this.selectedBarcode?.discount : {},
    );
    combineLatest([this.pageId$, this.barcodeService.targetServiceProduct$])
      .pipe(
        take(1),
        rxMap(([pageId, targetServiceProduct]) => {
          const changedValues: any = {
            ...FormHelper.getNonEmptyAndChangedValues(
              omit(this.barcodeForm.value, 'discount', 'media', 'internalProduct', 'productAttributesValues'),
              omit(this.selectedBarcode, 'discount', 'media', 'internalProduct', 'productAttributesValues'),
            ),
            ...(pageId === 'services' ||
            isEqual(
              (this.selectedBarcode?.productAttributesValues?.attributesValues?.length
                ? cloneDeep(map(this.selectedBarcode?.productAttributesValues?.attributesValues, 'id'))
                : []
              ).sort(),
              (this.selectedAttributeValues?.length ? cloneDeep(this.selectedAttributeValues) : []).sort(),
            )
              ? {}
              : { productAttributesValues: this.selectedAttributeValues }),
            ...(pageId === 'services' && targetServiceProduct
              ? { internalProduct: targetServiceProduct?.id }
              : this.selectedBarcode?.internalProduct?.id === this.barcodeForm.get('internalProduct').value?.id
              ? {}
              : { internalProduct: this.barcodeForm.get('internalProduct').value.id }),
            ...(discount?.amount && discount?.discountType !== 'No discount'
              ? {
                  discount: {
                    amount: this.barcodeForm.value?.discount?.amount,
                    discountType: this.barcodeForm.value?.discount?.discountType,
                  },
                }
              : this.selectedBarcode?.discount?.amount && this.selectedBarcode?.discount?.discountType && discount?.discountType === 'No discount'
              ? {
                  discount: {
                    amount: '0',
                    discountType: this.selectedBarcode?.discount?.discountType,
                  },
                }
              : {}),
          };
          if (this.selectedBarcode) {
            this.barcodeService
              .updateBarcode({ id: this.selectedBarcode?.id, ...changedValues })
              .pipe(
                catchError((error) => {
                  this.modalService.dismissAll();
                  this.modalError();
                  return throwError(() => new Error(error));
                }),
              )
              .subscribe((res) => {
                if (res) {
                  this.position();
                  this.modalService.dismissAll();
                }
              });
          } else {
            (this.barcodeService[pageId === 'services' ? 'createServiceProduct' : 'createBarcode'](changedValues) as any).subscribe((res: any) => {
              if (res) {
                this.modalService.dismissAll();
              }
            });
          }
        }),
      )
      .subscribe();
  }

  navigate(barcodeId: string) {
    this.router.navigate(['./' + barcodeId], { relativeTo: this.activatedRoute });
  }

  resetForm() {
    this.selectedAttributeValues = [];
    this.selectedAttributeNames = [];
    delete this.selectedAttributeValue;
    this.getBarCode();
    this.changeDetectorRef.markForCheck();
  }

  getBarCode() {
    const formValue = {
      internalProduct: this.barcodeForm.get('internalProduct').value.id,
      ...(this.selectedAttributeValues.length ? { productAttributesValues: this.selectedAttributeValues } : {}),
    };
    this.barcodeService
      .getBarcodeByProductAndAttributes(formValue)
      .pipe(
        catchError((error) => {
          return throwError(() => new Error(error));
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.barcode = res;
          this.noBarCode = false;
          this.translate.get('MENUITEMS.TS.BARCODE_COMBINATION_EXISTS').subscribe((barcodeCombinationExists: string) => {
            Swal.fire({
              title: 'Oops...',
              text: barcodeCombinationExists,
              icon: 'warning',
              showCancelButton: false,
              confirmButtonColor: 'rgb(3, 142, 220)',
              cancelButtonColor: 'rgb(243, 78, 78)',
            });
          });
        } else {
          this.noBarCode = true;
        }
        this.changeDetectorRef.markForCheck();
      });
  }

  isAttributeExist(attributeValue: any): boolean {
    let exist = false;
    if (this.selectedAttributeValues?.length) {
      this.selectedAttributeValues.filter((item) => {
        item === attributeValue.id;
        if (item === attributeValue.id) {
          exist = true;
        }
      });
    }
    return exist;
  }

  checkRadioAttributes(change: any): void {
    let attributeName = find(this.attributeValues, { id: this.selectedAttributeValue });
    if (this.selectedAttributeValue && attributeName) {
      this.selectedAttributeNames = without(this.selectedAttributeNames, attributeName.label);
      this.selectedAttributeValues = without(this.selectedAttributeValues, this.selectedAttributeValue);
    }
    this.selectedAttributeValue = change?.target?.value;
    attributeName = find(this.attributeValues, { id: this.selectedAttributeValue });
    this.selectedAttributeValues.push(change?.target?.value);
    this.selectedAttributeNames.push(attributeName?.label);
    if (this.selectedAttributeValues.length && this.barcodeForm.get('internalProduct').value) {
      this.getBarCode();
    }
    this.barcodeForm.get('productAttributesValues').patchValue(this.selectedAttributeValues);
    this.changeDetectorRef.markForCheck();
  }

  isAttributeRadioExist(attributeValue: any): boolean {
    let exist = false;
    if (this.selectedAttributeValues?.length) {
      this.selectedAttributeValues.filter((item) => {
        item === attributeValue.id;
        if (item === attributeValue.id) {
          exist = true;
        }
      });
    }
    return exist;
  }

  checkAttributes(attributeValue: AttributeValueType, change: any, index: number): void {
    if (change?.target?.checked) {
      this.selectedAttributeValues.push(attributeValue.id);
      this.selectedAttributeNames.push(attributeValue.label);
    } else {
      this.selectedAttributeValues = without(this.selectedAttributeValues, attributeValue.id);
      this.selectedAttributeNames = without(this.selectedAttributeNames, attributeValue.label);
    }
    this.barcodeForm.get('productAttributesValues').patchValue(this.selectedAttributeValues);
    if (this.selectedAttributeValues.length && this.barcodeForm.get('internalProduct').value) {
      this.getBarCode();
    }
  }

  getAttributeValues(attribute: AttributeType, event: NgbPanelChangeEvent) {
    if (event.nextState === true) {
      this.selectedAttributeValue = null;
      this.selectedAttribute = attribute;
      this.barcodeService.valuesPageIndex = 0;
      this.barcodeService.infiniteAttributeValues$ = null;
      this.barcodeService.getAttributeValuesByAttributePaginated(attribute.id).subscribe((res) => {
        if (res) {
          this.selectedAttribute = this.attributes.filter((item) => item.id === attribute.id)[0];
          if (!this.attributeValues[0]?.attribute?.isMultipleChoice) {
            this.selectedAttributeValue = find(this.attributeValues, (attributeValue) =>
              includes(this.selectedAttributeValues, attributeValue.id),
            )?.id;
          }
          this.changeDetectorRef.markForCheck();
        }
      });
    }
  }

  loadMoreProducts() {
    combineLatest([this.barcodeService.isLastProducts$, this.inventoryService.dropDownAction$])
      .pipe(take(1))
      .subscribe(([isLast, dropDownAction]) => {
        if (!isLast && dropDownAction) {
          this.barcodeService.productPageIndex += 1;
          this.barcodeService[dropDownAction]().subscribe();
        }
      });
  }

  loadMoreSuppliers() {
    combineLatest([this.suppliersService.isSuppliersLastPage$, this.inventoryService.action$])
      .pipe(take(1))
      .subscribe(([isLast, action]) => {
        if (!isLast) {
          this.suppliersService.suppliersPageIndex += 1;
          this.suppliersService.searchInfiniteSuppliersByTarget().subscribe();
        }
      });
  }

  loadMoreAttributeValues() {
    this.barcodeService.isLastAttributeValues$.pipe(take(1)).subscribe((isLast) => {
      if (!isLast) {
        this.barcodeService.valuesPageIndex += 1;
        this.barcodeService.getAttributeValuesByAttributePaginated(this.selectedAttribute.id).subscribe();
      }
    });
  }

  loadMoreAttributes() {
    this.barcodeService.isLastAttribute$.pipe(take(1)).subscribe((isLast) => {
      if (!isLast) {
        this.barcodeService.attributePageIndex += 1;
        this.barcodeService.searchAttributeByTarget().subscribe();
      }
    });
  }

  onNavChange(changeEvent: NgbNavChangeEvent) {
    this.barcodeService.pageIndex = 0;
    combineLatest([this.inventoryService.filter$, this.inventoryService.action$])
      .pipe(
        take(1),
        switchMap(([filter, action]) => {
          this.inventoryService.filter$ = {
            ...omit(filter, 'status'),
            ...(changeEvent.nextId === 'All' ? {} : { status: [changeEvent.nextId === 'Published' ? 'ACTIVE' : 'ARCHIVED'] }),
          };
          this.inventoryService.status$ = changeEvent.nextId === 'All' ? [] : [changeEvent.nextId === 'Published' ? 'ACTIVE' : 'ARCHIVED'];
          return this.barcodeService[action]();
        }),
      )
      .subscribe();
    this.selectedNav = changeEvent.nextId;
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.barcodeService.pageIndex = page - 1;
    if (this.pageChanged) {
      // this.barcodeService.getBarcodesWithVarietyAndStructureWithFilter().subscribe();
      this.inventoryService.action$
        .pipe(
          take(1),
          switchMap((action) => this.barcodeService[action]()),
        )
        .subscribe();
    }
  }

  valueChange(value: number): void {
    this.priceRangeForm.get('fromPrice').patchValue(value);
  }

  highValueChange(value: number): void {
    this.priceRangeForm.get('toPrice').patchValue(value);
  }

  updateFilter(filter: any, field: string, value: string) {
    const newValue = includes(filter && filter[field] ? filter[field] : [], value)
      ? without(filter[field], value)
      : [...(filter && filter[field] ? filter[field] : []), value];
    this.inventoryService.barcodesFilterInput$ = newValue?.length > 0 ? { ...filter, [field]: newValue } : omit(filter, field);
  }

  updatePriceFilter() {
    this.filterProducts({
      toPrice: this.priceRangeForm.value.toPrice,
      fromPrice: this.priceRangeForm.value.fromPrice,
    });
  }

  filterProducts(productsFilter: any) {
    this.barcodeService.productPageIndex = 0;
    this.filterProductsSubscription = this.inventoryService.barcodesFilterInput$
      .pipe(
        take(1),
        rxMap((filter: any) => {
          if (productsFilter?.catalogueCategory) {
            this.updateFilter(filter, 'catalogueCategory', productsFilter.catalogueCategory);
          }
          if (productsFilter?.attributesValues) {
            this.updateFilter(filter, 'attributesValues', productsFilter.attributesValues);
          }
          if (productsFilter?.toPrice || productsFilter?.fromPrice) {
            this.inventoryService.barcodesFilterInput$ = {
              ...filter,
              ...(productsFilter.toPrice ? { toPrice: `${productsFilter.toPrice}` } : {}),
              ...(productsFilter.fromPrice ? { fromPrice: `${productsFilter.fromPrice}` } : {}),
            };
          }
          this.filterProductsSubscription.unsubscribe();
        }),
        switchMap(() => this.inventoryService.action$),
        take(1),
        switchMap((action) => this.barcodeService[action]()),
      )
      .subscribe();
  }

  position() {
    this.translate.get('MENUITEMS.TS.WORK_SAVED').subscribe((workSaved: string) => {
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: workSaved,
        showConfirmButton: false,
        timer: 1500,
      });
    });
  }

  modalError() {
    this.translate.get('MENUITEMS.TS.STH_WENT_WRONG').subscribe((sthWentWrong: string) => {
      Swal.fire({
        title: 'Oops...',
        text: sthWentWrong,
        icon: 'warning',
        showCancelButton: false,
        confirmButtonColor: 'rgb(3, 142, 220)',
        cancelButtonColor: 'rgb(243, 78, 78)',
      });
    });
  }

  clearAll() {
    this.inventoryService.filter$ = {};
    this.productsService.productsPageIndex = 0;
    this.inventoryService.action$.pipe(take(1)).subscribe((action) => {
      this.productsService[action]().subscribe();
    });
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.barcodeService.pageIndex = 0;
    this.barcodeService.searchString = '';
  }
}
