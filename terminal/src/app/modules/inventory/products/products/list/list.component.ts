import Swal from 'sweetalert2';
import { omit, includes, without, forEach, isEqual } from 'lodash';
import { Options } from '@angular-slider/ngx-slider';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID, QueryList, ViewChildren } from '@angular/core';
import {
  map as rxMap,
  take,
  Subject,
  switchMap,
  takeUntil,
  Observable,
  catchError,
  throwError,
  Subscription,
  debounceTime,
  combineLatest,
  ReplaySubject,
  distinctUntilChanged,
  of,
} from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import { InternalProductType, ProductStatusEnum, ProductVarietyEnum, UserType } from '@sifca-monorepo/terminal-generator';
import { InternalProductFilterType, InternalProductFilterInput, SheetsNames } from '@sifca-monorepo/terminal-generator';

import { ProductsService } from '../products.service';
import { GlobalComponent } from '../../../../../global-component';
import { SharedService } from '../../../../../shared/services/shared.service';
import { InventoryService } from '../../../../../shared/services/inventory.service';
import { NgbdProductsSortableHeader, SortEvent } from '../products-sortable.directive';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ConvertorHelper } from '@diktup/frontend/helpers';
import { UserService } from '../../../../../core/services/user.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  selector: 'sifca-monorepo-products-list',
})
export class ProductsListComponent implements OnInit, OnDestroy {
  private fileInput = this.document.createElement('input');
  private fileInputExcel = this.document.createElement('input');
  private unsubscribeAll: Subject<any> = new Subject<any>();

  @ViewChildren(NgbdProductsSortableHeader) headers!: QueryList<NgbdProductsSortableHeader>;

  page = 1;
  user = [];
  total: any;
  pageSize = 5;
  endIndex = 9;
  minValue = 0;
  toPrice: any;
  deleteId: any;
  fromPrice: any;
  totalrate: any;
  startIndex = 0;
  Brand: any = [];
  totalbrand: any;
  allproduct: any;
  searchTerm = '';
  sortColumn = '';
  allpublish: any;
  maxValue = 1000;
  Rating: any = [];
  totalRecords = 0;
  allproducts: any;
  defaultLimit = 5;
  totalpublish: any;
  activeindex = '1';
  totaldiscount: any;
  sortDirection = '';
  searchproducts: any;
  selectedNav = 'ALL';
  includes = includes;
  pageChanged: boolean;
  selectedProduct: any;
  emailForm: FormGroup;
  publishedproduct: any;
  allLimits: any[] = [];
  loadingImport: boolean;
  totalpublishRecords = 0;
  pagination: IPagination;
  contactsForm!: FormGroup;
  isLoading: boolean = true;
  checkedValGet: any[] = [];
  priceRangeForm: FormGroup;
  total$: Observable<number>;
  breadCrumbItems!: Array<{}>;
  discountRates: number[] = [];
  isEmailButtonDisabled = true;
  url = GlobalComponent.API_URL;
  multiDefaultOption = 'Watches';
  loadingImportPictures: boolean;
  content!: InternalProductType[];
  products: InternalProductType[];
  navs = ['ALL', 'PUBLISHED', 'ARCHIVED'];
  selectedAccount = 'This is a placeholder';
  options: Options = { floor: 0, ceil: 1000 };
  productList!: Observable<InternalProductType[]>;
  productsLimit: number = this.productsService.productsLimit;
  action$: Observable<string> = this.inventoryService.action$;
  pageId$: Observable<string> = this.inventoryService.pageId$;
  filterProductsSubscription: Subscription = new Subscription();
  pageTitle$: Observable<string> = this.inventoryService.pageTitle$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  hasFilter$: Observable<boolean> = this.inventoryService.hasFilter$;
  productsPageIndex: number = this.productsService.productsPageIndex;
  parentLink$: Observable<string> = this.inventoryService.parentLink$;
  listHeader$: Observable<string[]> = this.inventoryService.listHeader$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  totalProducts$: Observable<number> = this.productsService.totalProducts$;
  Default = [{ name: 'Watches' }, { name: 'Headset' }, { name: 'Sweatshirt' }];
  loadingProducts$: Observable<boolean> = this.productsService.loadingProducts$;
  products$: Observable<InternalProductType[]> = this.productsService.products$;
  filter$: Observable<InternalProductFilterInput> = this.inventoryService.filter$;
  toFilter$: Observable<InternalProductFilterType> = this.productsService.toFilter$;
  isProductsLastPage$: Observable<boolean> = this.productsService.isProductsLastPage$;
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private sharedService: SharedService,
    private productsService: ProductsService,
    private convertorHelper: ConvertorHelper,
    private translate: TranslateService,
    private inventoryService: InventoryService,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
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
              catchError((error) => {
                this.loadingImport = false;
                this.modalService.dismissAll();
                this.modalError();
                this.changeDetectorRef.markForCheck();
                return throwError(() => new Error(error));
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
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.INVENTORY').subscribe((inventory: string) => {
      this.translate.get('MENUITEMS.TS.EQUIPMENTS').subscribe((equipments: string) => {
        this.breadCrumbItems = [{ label: inventory }, { label: equipments, active: true }];
      });
    });
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.changeDetectorRef.markForCheck();
          this.productsService.searchString = searchValues.searchString;
          return this.productsService.getSimpleProductWithFilter();
        }),
      )
      .subscribe(() => this.changeDetectorRef.markForCheck());
    this.contactsForm = this.formBuilder.group({
      subItem: this.formBuilder.array([]),
    });
    this.inventoryService.filter$
      .pipe(
        take(1),
        rxMap((filter) => {
          this.toPrice = +filter?.toPrice || 100;
          this.fromPrice = +filter?.fromPrice || 0;
          this.priceRangeForm = this.formBuilder.group({
            toPrice: [filter?.toPrice || ''],
            fromPrice: [filter?.fromPrice || ''],
          });
          this.priceRangeForm.valueChanges.subscribe((newValues) => {
            this.toPrice = +newValues.toPrice;
            this.fromPrice = +newValues.fromPrice;
          });
        }),
      )
      .subscribe();

    this.toFilter$
      .pipe(
        rxMap((filter) => {
          forEach(filter.productAttributesValues, (attribute) => {
            this.allLimits = [
              ...this.allLimits,
              {
                min: attribute.attributeValues.length < 5 ? attribute.attributeValues.length : 5,
              },
            ];
          });
        }),
      )
      .subscribe();
  }

  bulkUploadPicture() {
    this.fileInput.value = '';
    this.fileInput.click();
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

  downloadExcel() {
    if (isPlatformBrowser(this.platformId)) {
      this.pageTitle$.pipe(take(1)).subscribe((pageTitle) => {
        const input: any = {
          sheets: [SheetsNames?.PRODUCTS],
          ...(pageTitle === 'Products'
            ? {
                variety: ProductVarietyEnum.PRODUCT,
              }
            : {}),
          ...(pageTitle === 'Equipments'
            ? {
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
          a.download = String('products.xlsx');
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
          this.changeDetectorRef.markForCheck();
        });
      });
    }
  }

  openImportModal(content: any) {
    this.modalService.open(content, { size: 'md', centered: true });
  }

  send() {
    this.pageId$.pipe(take(1)).subscribe((pageTitle) => {
      const input: any = {
        emails: this.emailForm.get('emails').value,
        ...(pageTitle === 'products'
          ? {
              sheets: [SheetsNames?.PRODUCTS],
              variety: ProductVarietyEnum.PRODUCT,
            }
          : {}),
        ...(pageTitle === 'equipments'
          ? {
              sheets: [SheetsNames?.PRODUCTS],
              variety: ProductVarietyEnum.EQUIPMENT,
            }
          : {}),
      };
      this.isEmailButtonDisabled = true;
      this.productsService
        .sendSimpleCatalogueByMail(input)
        .pipe(
          catchError(() => {
            this.modalService.dismissAll();
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.modalService.dismissAll();
            this.position();
            this.changeDetectorRef.markForCheck();
          }
        });
    });
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

  loadPage(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.productsService.productsPageIndex = page - 1;
    if (this.pageChanged) {
      this.inventoryService.action$
        .pipe(
          take(1),
          switchMap((action) => this.productsService[action]()),
        )
        .subscribe();
    }
  }

  loadPage1(page: number) {
    this.productsService.productsPageIndex = page - 1;
    this.inventoryService.action$
      .pipe(
        take(1),
        switchMap((action) => this.productsService[action]()),
      )
      .subscribe();
  }

  onNavChange(changeEvent: NgbNavChangeEvent) {
    this.productsService.productsPageIndex = 0;
    combineLatest([this.inventoryService.filter$, this.inventoryService.action$])
      .pipe(
        take(1),
        switchMap(([filter, action]) => {
          this.inventoryService.filter$ = {
            ...omit(filter, 'status'),
            ...(changeEvent.nextId === 'ALL' ? {} : { status: [changeEvent.nextId === 'PUBLISHED' ? 'ACTIVE' : 'ARCHIVED'] }),
          };
          this.inventoryService.status$ = changeEvent.nextId === 'ALL' ? [] : [changeEvent.nextId === 'PUBLISHED' ? 'ACTIVE' : 'ARCHIVED'];
          return this.productsService[action]();
        }),
      )
      .subscribe();
    this.selectedNav = changeEvent.nextId;
  }

  onSort({ column, direction }: SortEvent) {
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    // this.service.sortColumn = column;
    // this.service.sortDirection = direction;
  }

  openDeleteProduct(content: any, product: any) {
    this.selectedProduct = product;
    this.modalService.open(content, { centered: true });
  }

  archiveProduct() {
    this.productsService
      .archiveProduct({ id: this.selectedProduct?.id, status: ProductStatusEnum.ARCHIVED })
      .pipe(
        catchError(() => {
          this.modalService.dismissAll();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.modalService.dismissAll();
          this.position();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  onCheckboxChange(e: any) {
    var checkboxes: any = this.document.getElementsByName('checkAll');
    var checkedVal: any[] = [];
    var result;
    for (var i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        result = checkboxes[i].value;
        checkedVal.push(result);
      }
    }
    this.checkedValGet = checkedVal;
    var checkBoxCount: any = this.document.getElementById('select-content') as HTMLElement;
    checkBoxCount.innerHTML = checkedVal.length;
    checkedVal.length > 0
      ? ((this.document.getElementById('selection-element') as HTMLElement).style.display = 'block')
      : ((this.document.getElementById('selection-element') as HTMLElement).style.display = 'none');
  }

  changeBrand(e: any) {
    if (e.target.checked) {
      this.Brand.push(e.target.defaultValue);
    } else {
      for (var i = 0; i < this.Brand.length; i++) {
        if (this.Brand[i] === e.target.defaultValue) {
          this.Brand.splice(i, 1);
        }
      }
    }
    this.totalbrand = this.Brand.length;
  }

  changeDiscount(e: any) {
    if (e.target.checked) {
      this.discountRates.push(e.target.defaultValue);

      // this.productList.subscribe(x => {
      //   this.products = x.filter((product: any) => {
      //     return product.rating > e.target.defaultValue;
      //   });
      // });
    } else {
      for (var i = 0; i < this.discountRates.length; i++) {
        if (this.discountRates[i] === e.target.defaultValue) {
          this.discountRates.splice(i, 1);
        }
      }
    }
    this.totaldiscount = this.discountRates.length;
  }

  changeRating(e: any, rate: any) {
    if (e.target.checked) {
      this.Rating.push(e.target.defaultValue);
      this.products = this.allproducts.filter((product: any) => {
        return product.rating > rate;
      });
    } else {
      for (var i = 0; i < this.Rating.length; i++) {
        if (this.Rating[i] === e.target.defaultValue) {
          this.Rating.splice(i, 1);
        }
      }
      if (this.activeindex == '1') {
        this.products = this.allproducts.filter((product: any) => {
          return product.discount !== rate;
        });
        this.total = this.products.length;
        this.pageSize = this.products.length;
      } else if (this.activeindex == '2') {
        this.publishedproduct = this.allpublish.filter((product: any) => {
          return product.discount !== rate;
        });
        this.totalpublish = this.publishedproduct.length;
        this.pageSize = this.publishedproduct.length;
      }
    }
    this.totalrate = this.Rating.length;
  }

  updateFilter(filter: any, field: string, value: string) {
    const newValue = includes(filter && filter[field] ? filter[field] : [], value)
      ? without(filter && filter[field] ? filter[field] : [], value)
      : [...(filter && filter[field] ? filter[field] : []), value];
    const newFilter = newValue?.length > 0 ? { [field]: newValue } : {};
    if (newValue?.length > 0) {
      this.inventoryService.filter$ = { ...filter, [field]: newValue };
    } else {
      this.inventoryService.filter$ = { ...omit(filter, field), ...newFilter };
    }
  }

  updatePriceFilter() {
    this.filterProducts({
      toPrice: this.priceRangeForm.value.toPrice,
      fromPrice: this.priceRangeForm.value.fromPrice,
    });
  }

  filterProducts(productsFilter: any) {
    this.productsService.productsPageIndex = 0;
    this.filterProductsSubscription = this.inventoryService.filter$
      .pipe(
        take(1),
        rxMap((filter: any) => {
          if (productsFilter?.brands) {
            this.updateFilter(filter, 'brands', productsFilter.brands);
          }
          if (productsFilter?.catalogueCategory) {
            this.updateFilter(filter, 'catalogueCategory', productsFilter.catalogueCategory);
          }
          if (productsFilter?.attributesValues) {
            this.updateFilter(filter, 'attributesValues', productsFilter.attributesValues);
          }
          if (productsFilter?.toPrice || productsFilter?.fromPrice) {
            this.inventoryService.filter$ = {
              ...filter,
              ...(productsFilter.toPrice ? { toPrice: `${productsFilter.toPrice}` } : {}),
              ...(productsFilter.fromPrice ? { fromPrice: `${productsFilter.fromPrice}` } : {}),
            };
          }
          this.filterProductsSubscription.unsubscribe();
        }),
        switchMap(() => this.inventoryService.action$),
        take(1),
        switchMap((action) => this.productsService[action]()),
      )
      .subscribe();
  }

  search(value: string) {
    this.inventoryService.action$
      .pipe(
        take(1),
        switchMap((action) => {
          this.inventoryService.searchString$ = value;
          return this.productsService[action]();
        }),
      )
      .subscribe();
  }

  valueChange(value: number): void {
    this.priceRangeForm.get('fromPrice').patchValue(value);
  }

  highValueChange(value: number): void {
    this.priceRangeForm.get('toPrice').patchValue(value);
  }

  clearAll() {
    this.inventoryService.filter$ = {};
    this.productsService.productsPageIndex = 0;
    this.inventoryService.action$.pipe(take(1)).subscribe((action) => {
      this.productsService[action]().subscribe();
    });
  }

  godetail(id: any) {
    return;
  }

  gopublishdetail(id: any) {
    return;
  }

  ngOnDestroy() {
    this.productsService.searchString = '';
    this.productsService.pageIndex = 0;
  }
}
