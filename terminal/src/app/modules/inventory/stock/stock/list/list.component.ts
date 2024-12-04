import Swal from 'sweetalert2';
import { filter, isEqual, map, omit } from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { catchError, debounceTime, distinctUntilChanged, Observable, of, ReplaySubject, Subject, switchMap, take, takeUntil, throwError } from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import { ConvertorHelper, FormHelper, ValidationHelper } from '@diktup/frontend/helpers';
import { BarcodeWithStockType } from '@sifca-monorepo/terminal-generator';
import { BarcodeType, ProductVarietyEnum, StockType, WarehouseType } from '@sifca-monorepo/terminal-generator';

import { StockService } from '../stock.service';
import { WarehouseService } from '../../warehouse/warehouse.service';
import { BarcodeService } from '../../../products/articles/articles.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { SheetsNames } from '@sifca-monorepo/terminal-generator';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ProductsService } from '../../../products/products/products.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-stock',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class StockListComponent implements OnInit, AfterViewInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  private fileInput = this.document.createElement('input');
  private fileInputExcel = this.document.createElement('input');

  page = 0;
  data: string;
  posId: string;
  initValues: any;
  initialValues: any;
  stockForm: FormGroup;
  pageChanged: boolean;
  pagination: IPagination;
  isButtonDisabled = true;
  barcodes: BarcodeType[];
  selectedBarcode: string;
  initStockForm: FormGroup;
  stocks: StockType[] = [];
  paginationRange: number[];
  selectedWarehouse: string;
  breadCrumbItems!: Array<{}>;
  warehouses: WarehouseType[];
  editQuantityForm: FormGroup;
  isWizardButtonDisabled = true;
  isQuantityButtonDisabled = true;
  selectedWarehouses: string[] = [];
  selectedStock: StockType | null = null;
  validateBarcode = this.validationHelper.validateBarcode;
  isOutOfStock: 'both' | 'inStock' | 'outOfStock' = 'both';
  barcodeSearchInput$: Subject<string> = new Subject<string>();
  stocks$: Observable<StockType[]> = this.stockService.stocks$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  loadingStocks$: Observable<boolean> = this.stockService.loadingStocks$;
  warehouses$: Observable<WarehouseType[]> = this.warehouseService.warehouses$;
  searchBarcodeForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  isBarcodeLastPage$: Observable<boolean> = this.barcodeService.isBarcodeLastPage$;
  barcodes$: Observable<BarcodeWithStockType[]> = this.barcodeService.infinitBarcodes$;
  isWarehouseLastPage$: Observable<boolean> = this.warehouseService.isWarehouseLastPage$;
  loadingImport: boolean;
  loadingImportPictures: boolean;
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    public stockService: StockService,
    private sharedService: SharedService,
    public barcodeService: BarcodeService,
    public convertorHelper: ConvertorHelper,
    private productsService: ProductsService,
    public warehouseService: WarehouseService,
    private validationHelper: ValidationHelper,
    private translate: TranslateService,
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
    this.barcodeSearchInput$
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchString) => {
          this.barcodeService.infinitBarcodes$ = null;
          this.barcodeService.pageIndex = 0;
          this.barcodeService.searchString = searchString;
          return barcodeService.getBarcodesWithVarietyAndStructureWithFilter();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
    this.warehouseService.infinitWarehouses$.pipe(takeUntil(this.unsubscribeAll)).subscribe((warehouses: WarehouseType[]) => {
      this.warehouses = warehouses;
      this.changeDetectorRef.markForCheck();
    });
    this.stockService.stocks$.pipe(takeUntil(this.unsubscribeAll)).subscribe((stocks: StockType[]) => {
      this.stocks = stocks;
      this.sharedService.isLoading$ = false;
      this.changeDetectorRef.markForCheck();
    });
    this.stockService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.stockService.pageIndex || 0,
        size: this.stockService.filterLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.stockService.pageIndex || 0) * this.stockService.filterLimit,
        endIndex: Math.min(((this.stockService.pageIndex || 0) + 1) * this.stockService.filterLimit - 1, pagination.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.INVENTORY').subscribe((inventory: string) => {
      this.translate.get('MENUITEMS.TS.STOCK').subscribe((stock: string) => {
        this.breadCrumbItems = [{ label: inventory }, { label: stock, active: true }];
      });
    });
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.changeDetectorRef.markForCheck();
          this.stockService.searchString = searchValues.searchString;
          return this.stockService.searchStocksByTarget();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  ngAfterViewInit() {
    this.warehouseService.getWarehousesByCompanyPaginated().subscribe();
  }

  convertFile(file: File): Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event) => result.next(btoa(event.target.result.toString()));
    return result;
  }

  uploadExcel(): void {
    this.loadingImport = false;
    this.fileInputExcel.value = '';
    this.fileInputExcel.click();
  }

  bulkUploadPicture() {
    this.fileInput.value = '';
    this.fileInput.click();
  }

  openImportModal(content: any) {
    this.modalService.open(content, { size: 'md', centered: true });
  }

  downloadExcel() {
    if (isPlatformBrowser(this.platformId)) {
      const input: any = {
        sheets: [SheetsNames?.STOCK],
        variety: ProductVarietyEnum.PRODUCT,
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
    }
  }

  onWarehouseFilter(warehouse: WarehouseType, isChecked: boolean) {
    if (isChecked) {
      this.stockService.warehouses.push(warehouse?.id);
    } else {
      const index = this.stockService.warehouses.indexOf(warehouse?.id);
      if (index > -1) {
        this.stockService.warehouses.splice(index, 1);
      }
    }

    this.warehouseService.warehouses$.pipe(take(1)).subscribe((warehouses: WarehouseType[]) => {
      this.selectedWarehouses = map(
        filter(warehouses, (warehouse: WarehouseType) => {
          return this.stockService.warehouses.includes(warehouse?.id);
        }),
        (warehouse: WarehouseType) => warehouse?.name,
      );
    });

    this.stockService.searchStocksByTarget().subscribe();
  }

  outOfStockChange(event: any) {
    this.stockForm.get('outOfStock').patchValue(event.target.checked);
  }

  wizardOutOfStockChange(event: any) {
    this.initStockForm.get('outOfStock').patchValue(event.target.checked);
  }

  openStockModal(content: any, stock: StockType) {
    this.isButtonDisabled = true;
    this.selectedStock = stock;
    this.modalService.open(content, { centered: true });
    this.stockForm = this.formBuilder.group({
      warehouse: [stock.warehouse, Validators.required],
      stockCapacity: [stock.stockCapacity, Validators.required],
      minimumStockQuantity: [stock.minimumStockQuantity, Validators.required],
      outOfStock: [stock?.outOfStock || false, Validators.required],
    });
    this.initValues = this.stockForm.value;
    this.stockForm.valueChanges.subscribe((ivalues) => {
      this.isButtonDisabled = isEqual(ivalues, this.initValues);
    });
  }

  openWizardModal(content: any) {
    this.selectedBarcode = null;
    this.selectedWarehouse = null;
    this.warehouseService.infinitWarehouses$ = null;
    this.barcodeService.infinitBarcodes$ = null;
    this.barcodeService.pageIndex = 0;
    this.warehouseService.pageIndex = 0;
    this.warehouseService.getWarehousesByCompanyPaginated().subscribe();
    this.barcodeService.getBarcodesWithVarietyAndStructureWithFilter().subscribe();
    this.modalService.open(content, { size: 'md', centered: true });
    this.initStockForm = this.formBuilder.group({
      warehouse: ['', Validators.required],
      barcode: [, Validators.required],
      stockCapacity: [this.selectedStock?.stockCapacity ? this.selectedStock?.stockCapacity : 0, Validators.required],
      minimumStockQuantity: [this.selectedStock?.minimumStockQuantity ? this.selectedStock?.minimumStockQuantity : 0, Validators.required],
      outOfStock: [this.selectedStock?.outOfStock === false || true],
    });
    this.initialValues = omit(this.initStockForm.value, 'warehouse', 'barcode');
    this.initStockForm.valueChanges.subscribe((ivalues) => {
      this.isWizardButtonDisabled = isEqual(ivalues, this.initialValues);
    });
  }

  getStocks() {
    this.stockService
      .searchStocksByTarget(this.isOutOfStock === 'both' ? undefined : this.isOutOfStock === 'outOfStock' ? true : false)
      .subscribe((paginatedResponse) => {
        this.stocks = paginatedResponse.objects;
        this.changeDetectorRef.markForCheck();
        this.pagination = {
          length: paginatedResponse.count,
          page: this.pagination?.page || 0,
          size: this.pagination?.size || 20,
          lastPage: paginatedResponse.count - 1,
          startIndex: (this.pagination?.page || 0) * (this.pagination?.size || 20),
          endIndex: ((this.pagination?.page || 0) + 1) * (this.pagination?.size || 20) - 1,
        };
        this.changeDetectorRef.markForCheck();
      });
  }

  getStock() {
    this.selectedStock = null;
    this.isWizardButtonDisabled = true;
    this.stockService.getStock(this.initStockForm.get('barcode').value, this.initStockForm.get('warehouse').value).subscribe((res) => {
      if (res) {
        this.selectedStock = res;
        this.initStockForm.get('minimumStockQuantity').patchValue(res.minimumStockQuantity);
        this.initStockForm.get('stockCapacity').patchValue(res.stockCapacity);
        this.initStockForm.get('outOfStock').patchValue(res.outOfStock);
        this.initialValues = omit(this.initStockForm.value, 'warehouse', 'barcode');
      } else {
        this.selectedStock = null;
        this.initStockForm.get('minimumStockQuantity').patchValue('');
        this.initStockForm.get('stockCapacity').patchValue('');
        this.initStockForm.get('outOfStock').patchValue(true);
      }
      this.changeDetectorRef.markForCheck();
    });
  }

  openRemoveStockModal(content: any, stock: StockType, field: string) {
    this.data = field;
    this.selectedStock = stock;
    this.modalService.open(content, { centered: true });
    this.editQuantityForm = this.formBuilder.group({
      quantity: [0, Validators.required],
    });
    const initialValues = this.editQuantityForm.value;
    this.editQuantityForm.valueChanges.subscribe((ivalues) => {
      this.isQuantityButtonDisabled = isEqual(ivalues, initialValues);
      if (ivalues.quantity > this.selectedStock.currentStock && field === 'remove') {
        this.isQuantityButtonDisabled = true;
      }
    });
  }

  saveQuntity() {
    this.isQuantityButtonDisabled = true;
    let field: string;
    field = this.data === 'remove' ? 'removeFromStock' : 'addToStock';
    this.stockService[field](this.selectedStock.id, this.editQuantityForm.get('quantity').value, this.selectedStock.warehouse.id)
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
      });
  }

  saveWizard() {
    if (this.selectedStock) {
      this.stockService
        .updateStock(this.selectedStock.id, this.initStockForm.value)
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
          this.changeDetectorRef.markForCheck();
        });
    } else {
      this.stockService
        .initStock(this.initStockForm.get('barcode').value, this.initStockForm.get('warehouse').value)
        .pipe(
          catchError((error) => {
            this.modalService.dismissAll();
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return throwError(() => new Error(error));
          }),
        )
        .subscribe(() => {
          this.pagination.length++;
          this.pagination.endIndex++;
          this.position();
          this.modalService.dismissAll();
        });
    }
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

  openDeleteModal(deleteModal: NgbModal, stock: StockType) {
    this.selectedStock = stock;
    this.modalService.open(deleteModal, { centered: true });
  }

  deleteStock() {
    this.stockService
      .deleteStock(this.selectedStock.id)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
        this.pagination.length--;
        this.pagination.endIndex--;
        this.changeDetectorRef.markForCheck();
      });
  }

  onWarehouseChange(warehouse: WarehouseType) {
    this.selectedWarehouse = warehouse.name;
    this.initStockForm.get('warehouse').patchValue(warehouse.id);
  }

  onBarcodeChange(barcode: BarcodeType) {
    this.selectedBarcode = barcode?.name;
    this.initStockForm.get('barcode').patchValue(barcode.id);
    this.searchBarcodeForm = this.formBuilder.group({ searchString: [barcode?.name] });
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

  save() {
    const input: any = {
      ...(this.stockForm.get('outOfStock').value === this.initValues.outOfStock ? {} : { outOfStock: this.stockForm.get('outOfStock').value }),
      ...FormHelper.getNonEmptyAndChangedValues(omit(this.stockForm.value, 'outOfStock'), omit(this.initValues, 'outOfStock')),
    };
    this.stockService
      .updateStock(this.selectedStock.id, input)
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
        this.changeDetectorRef.markForCheck();
      });
  }

  requiredChange(event: any) {
    this.stockForm.get('outOfStock').patchValue(event.target.checked);
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.stockService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.stockService.getStocks().subscribe();
    }
  }

  loadMoreWarhouses() {
    this.warehouseService.getWarehousesByCompanyPaginated().subscribe();
    this.warehouseService.pageIndex++;
  }

  loadMoreBarcodes() {
    this.barcodeService.getBarcodesWithVarietyAndStructureWithFilter().subscribe();
    this.barcodeService.pageIndex++;
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.stockService.pageIndex = 0;
    this.stockService.searchString = '';
  }
}
