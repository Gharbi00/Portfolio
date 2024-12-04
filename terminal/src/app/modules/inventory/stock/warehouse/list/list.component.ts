import { ReplaySubject, of } from 'rxjs';
import Swal from 'sweetalert2';
import { isEqual, map, omit, pick } from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { catchError, debounceTime, distinctUntilChanged, Observable, Subject, switchMap, takeUntil, throwError } from 'rxjs';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { IPagination } from '@diktup/frontend/models';
import { AmazonS3Helper, ConvertorHelper, FormHelper, StorageHelper } from '@diktup/frontend/helpers';
import { GenerateS3SignedUrlGQL, LocationType, WarehouseType } from '@sifca-monorepo/terminal-generator';

import { WarehouseService } from '../warehouse.service';
import { LocationsService } from '../../../../hr/company/locations/locations.service';
import { AWS_CREDENTIALS } from '../../../../../../environments/environment';
import { SharedService } from '../../../../../shared/services/shared.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ProductsService } from '../../../products/products/products.service';
import { SheetsNames } from '@sifca-monorepo/terminal-generator';
import { ProductVarietyEnum } from '@sifca-monorepo/terminal-generator';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-warehouse-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class WarehouseListComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  private fileInput = this.document.createElement('input');
  private fileInputExcel = this.document.createElement('input');
  page = 0;
  pageChanged: any;
  isLoading: boolean;
  pagination: IPagination;
  isButtonDisabled = true;
  warehouseForm: FormGroup;
  selectedLocation: string;
  locations: LocationType[];
  breadCrumbItems!: Array<{}>;
  warehouses: WarehouseType[] = [];
  selectedWarehouse: WarehouseType;
  searchInput$: Subject<string> = new Subject<string>();
  isLoading$: Observable<boolean> = this.warehouseService.isLoading$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  isLocationLastPage$: Observable<boolean> = this.locationsService.isLocationLastPage$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  loadingImport: boolean;
  loadingImportPictures: boolean;

  get pictures(): FormArray {
    return (this.warehouseForm.get('media') as FormGroup).get('pictures') as FormArray;
  }
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private sharedService: SharedService,
    private storageHelper: StorageHelper,
    private amazonS3Helper: AmazonS3Helper,
    private productsService: ProductsService,
    private convertorHelper: ConvertorHelper,
    public locationsService: LocationsService,
    public warehouseService: WarehouseService,
    private changeDetectorRef: ChangeDetectorRef,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
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
    this.locationsService.locations$.pipe(takeUntil(this.unsubscribeAll)).subscribe((locations: LocationType[]) => {
      this.locations = locations;
      this.changeDetectorRef.markForCheck();
    });
    this.warehouseService.warehouses$.pipe(takeUntil(this.unsubscribeAll)).subscribe((warehouses: WarehouseType[]) => {
      this.warehouses = warehouses;
      this.changeDetectorRef.markForCheck();
    });
    this.warehouseService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      if (pagination) {
        this.pagination = {
          length: pagination?.length,
          page: this.warehouseService.pageIndex || 0,
          size: this.warehouseService.filterLimit,
          lastPage: pagination?.length - 1,
          startIndex: (this.warehouseService.pageIndex || 0) * this.warehouseService.filterLimit,
          endIndex: Math.min(((this.warehouseService.pageIndex || 0) + 1) * this.warehouseService.filterLimit - 1, pagination.length - 1),
        };
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.INVENTORY').subscribe((inventory: string) => {
      this.translate.get('MENUITEMS.TS.WAREHOUSE').subscribe((warehouse: string) => {
        this.breadCrumbItems = [{ label: inventory }, { label: warehouse, active: true }];
      });
    });
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.warehouseService.isLoading$ = true;
          this.changeDetectorRef.markForCheck();
          this.warehouseService.searchString = searchValues.searchString;
          return this.warehouseService.getWarehousesByCompanyPaginated();
        }),
      )
      .subscribe(() => {
        this.warehouseService.isLoading$ = false;
        this.changeDetectorRef.markForCheck();
      });
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
        sheets: [SheetsNames?.WAREHOUSES],
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

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.warehouseService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.warehouseService.getWarehousesByCompanyPaginated().subscribe();
    }
  }

  openDeleteWarehouse(content: any, warehouse: WarehouseType) {
    this.selectedWarehouse = warehouse;
    this.modalService.open(content, { centered: true });
  }

  openWarehouseModal(content: any, warehouse: WarehouseType | null) {
    this.locationsService.getLocations().subscribe();
    this.isButtonDisabled = true;
    this.selectedWarehouse = warehouse;
    this.selectedLocation = this.selectedWarehouse?.location?.name || null;
    this.modalService.open(content, { centered: true });
    this.warehouseForm = this.formBuilder.group({
      name: [warehouse?.name || '', Validators.required],
      totalSurface: [warehouse?.totalSurface || 0, Validators.required],
      nonStorageSurface: [warehouse?.nonStorageSurface || 0, Validators.required],
      location: [warehouse?.location.id || '', Validators.required],
      media: this.formBuilder.group({
        pictures: this.formBuilder.array(
          warehouse?.media?.pictures?.length
            ? map(warehouse?.media?.pictures, (picture) => {
                return this.formBuilder.group({
                  baseUrl: [picture?.baseUrl],
                  path: [picture?.path],
                });
              })
            : [
                this.formBuilder.group({
                  path: [''],
                  baseUrl: [''],
                }),
              ],
        ),
      }),
    });
    const initialValues = this.warehouseForm.value;
    this.warehouseForm.valueChanges.subscribe((ivalues) => {
      this.isButtonDisabled = isEqual(ivalues, initialValues);
    });
  }

  deleteWarehouse() {
    this.warehouseService
      .deleteWarehouse(this.selectedWarehouse.id)
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
        this.modalService.dismissAll();
      });
  }

  onLocationChange(location: LocationType) {
    this.selectedLocation = location.name;
    this.warehouseForm.get('location').patchValue(location.id);
  }

  loadMoreLocations() {
    this.locationsService.getLocations().subscribe();
    this.locationsService.locationPage++;
  }

  upload(): void {
    const fileInput = this.document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.name = 'fileUpload';
    fileInput.id = 'fileUpload';
    fileInput.onchange = async () => {
      const file = fileInput.files[0];
      const posId = this.storageHelper.getData('posId');
      const timestamp = Date.now();
      const fileName = `${posId}_${timestamp}_${file.name}`;
      this.generateS3SignedUrlGQL
        .fetch({
          fileName,
          fileType: file.type,
        })
        .subscribe(async (res) => {
          const picture = await this.amazonS3Helper.uploadS3AwsWithSignature(
            res.data.generateS3SignedUrl.message,
            file,
            fileName,
            AWS_CREDENTIALS.storage,
            AWS_CREDENTIALS.region,
          );
          this.pictures.at(0).patchValue({
            path: picture.path,
            baseUrl: picture.baseUrl,
          });
          this.changeDetectorRef.markForCheck();
        });
    };
    fileInput.click();
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
    this.isButtonDisabled = true;
    if (!this.selectedWarehouse) {
      const args: any = {
        ...(this.warehouseForm.get('media').value?.pictures[0]?.path === '' ? {} : { media: this.warehouseForm.get('media').value }),
        ...FormHelper.getNonEmptyValues(omit(this.warehouseForm.value, 'media')),
      };
      this.warehouseService
        .createWarehouse(args)
        .pipe(
          catchError((error) => {
            if (error) {
              this.modalService.dismissAll();
              this.modalError();
              this.changeDetectorRef.markForCheck();
              return of(null);
            }
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.pagination.length++;
            this.pagination.endIndex++;
            this.modalService.dismissAll();
            this.position();
            this.changeDetectorRef.markForCheck();
          }
        });
    } else {
      const args: any = {
        ...(this.warehouseForm.get('media').value?.pictures[0]?.path === this.selectedWarehouse?.media?.pictures[0]?.path
          ? {}
          : { media: this.warehouseForm.get('media').value }),
        ...(this.warehouseForm.get('location').value === this.selectedWarehouse?.location?.id
          ? {}
          : { location: this.warehouseForm.get('location').value }),
        ...FormHelper.getNonEmptyAndChangedValues(
          omit(this.warehouseForm.value, 'media', 'location'),
          pick(this.selectedWarehouse, ['name', 'totalSurface', 'nonStorageSurface']),
        ),
      };
      this.warehouseService
        .updateWarehouse(args, this.selectedWarehouse.id)
        .pipe(
          catchError((error) => {
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return throwError(() => new Error(error));
          }),
        )
        .subscribe(() => {
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

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.warehouseService.pageIndex = 0;
    this.warehouseService.searchString = '';
  }
}
