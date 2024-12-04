import Swal from 'sweetalert2';
import { isEqual, omit } from 'lodash';
import { DOCUMENT } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { catchError, debounceTime, distinctUntilChanged, Observable, Subject, switchMap, takeUntil, throwError } from 'rxjs';

import { FormHelper } from '@sifca-monorepo/clients';
import { IPagination } from '@diktup/frontend/models';
import { BrandType, GenerateS3SignedUrlGQL } from '@sifca-monorepo/terminal-generator';
import { AmazonS3Helper, StorageHelper, ValidationHelper } from '@diktup/frontend/helpers';

import { BrandService } from '../brands.service';
import { AWS_CREDENTIALS } from '../../../../../environments/environment';
import { SharedService } from '../../../../shared/services/shared.service';
import { AltPicturesComponent } from '../../../../shared/components/alt-pictures/alt-pictures.component';

@Component({
  selector: 'sifca-monorepo-brand-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class BrandsListComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  brand: any = [];
  isLoading = true;
  initialValues: any;
  brands: BrandType[];
  brandForm: FormGroup;
  pageChanged: boolean;
  pagination: IPagination;
  isButtonDisabled = true;
  selectedBrand: BrandType;
  breadCrumbItems!: Array<{}>;
  productList!: Observable<BrandType[]>;
  validateBarcode = this.validationHelper.validateBarcode;
  brands$: Observable<BrandType[]> = this.brandService.brands$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  loadingBrands$: Observable<boolean> = this.brandService.loadingBrands$;

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    public brandService: BrandService,
    private translate: TranslateService,
    private storageHelper: StorageHelper,
    private sharedService: SharedService,
    private amazonS3Helper: AmazonS3Helper,
    private validationHelper: ValidationHelper,
    private changeDetectorRef: ChangeDetectorRef,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.brandService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.brandService.pageIndex || 0,
        size: this.brandService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.brandService.pageIndex || 0) * this.brandService.pageLimit,
        endIndex: Math.min(((this.brandService.pageIndex || 0) + 1) * this.brandService.pageLimit - 1, pagination.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
    this.brandService.brands$.pipe(takeUntil(this.unsubscribeAll)).subscribe((brands: BrandType[]) => {
      this.brands = brands;
      this.sharedService.isLoading$ = false;
      this.changeDetectorRef.markForCheck();
    });
    this.isLoading = false;
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.INVENTORY').subscribe((inventory: string) => {
      this.translate.get('MENUITEMS.TS.BRANDS').subscribe((brands: string) => {
        this.breadCrumbItems = [{ label: inventory }, { label: brands, active: true }];
      });
    });
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.changeDetectorRef.markForCheck();
          this.brandService.searchString = searchValues.searchString;
          return this.brandService.searchBrand();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.brandService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.brandService.searchBrand().subscribe();
    }
  }

  save() {
    this.isButtonDisabled = true;
    const input: any = {
      ...FormHelper.getDifference(omit(this.initialValues, 'picture'), omit(this.brandForm.value, 'picture')),
      ...(isEqual(this.initialValues.picture, this.brandForm.value.picture) ? {} : { picture: this.brandForm.value.picture }),
    };
    if (this.selectedBrand) {
      this.brandService
        .updateBrand(this.selectedBrand.id, input)
        .pipe(
          catchError((error) => {
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return throwError(() => new Error(error));
          }),
        )
        .subscribe(() => {
          this.position();
          this.modalService.dismissAll();
        });
    } else {
      this.brandService
        .createBrand(input)
        .pipe(
          catchError((error) => {
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return throwError(() => new Error(error));
          }),
        )
        .subscribe(() => {
          this.position();
          this.pagination.length++;
          this.pagination.endIndex++;
          this.modalService.dismissAll();
        });
    }
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
      this.changeDetectorRef.markForCheck();
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
          this.brandForm.patchValue({
            picture: {
              path: picture.path,
              baseUrl: picture.baseUrl,
            },
          });
          this.changeDetectorRef.markForCheck();
        });
    };
    fileInput.click();
  }

  openAltMoadal(i: number) {
    const modalRef = this.modalService.open(AltPicturesComponent, { backdrop: 'static' });
    modalRef.componentInstance.picture = this.brandForm.get('picture').value;
    modalRef.result.then((result) => {
      if (result) {
        this.brandForm.get('picture').patchValue(result.picture);
        if (this.selectedBrand) {
          this.updatePicture();
        }
      }
    });
  }

  updatePicture() {
    this.brandService
      .updateBrand(this.selectedBrand.id, this.brandForm.value)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
        this.position();
        this.changeDetectorRef.markForCheck();
      });
  }

  openDeleteModal(content: any, brand: BrandType) {
    this.selectedBrand = brand;
    this.modalService.open(content, { centered: true });
  }

  deleteBrand() {
    this.brandService
      .deleteBrand(this.selectedBrand.id)
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
        this.position();
        this.modalService.dismissAll();
      });
  }

  openBrandModal(content: any, brand: BrandType) {
    this.selectedBrand = brand;
    this.modalService.open(content, { centered: true });
    this.brandForm = this.formBuilder.group({
      name: [brand?.name || '', Validators.required],
      website: [brand?.website || ''],
      externalId: [brand?.externalId || '', Validators.required],
      picture: this.formBuilder.group({
        baseUrl: [brand?.picture?.baseUrl || ''],
        path: [brand?.picture?.path || ''],
        width: [brand?.picture?.width || ''],
        height: [brand?.picture?.height || ''],
        alt: [brand?.picture?.alt || ''],
      }),
    });
    this.initialValues = this.brandForm.value;
    this.brandForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((ivalues) => {
      this.isButtonDisabled = isEqual(ivalues, this.initialValues);
    });
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

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.brandService.pageIndex = 0;
    this.brandService.searchString = '';
  }
}
