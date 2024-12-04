import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { CompanyType, CountryType, GenerateS3SignedUrlGQL, SupplierType, SupplierTypeEnum } from '@sifca-monorepo/terminal-generator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, ReplaySubject, Subject, catchError, debounceTime, distinctUntilChanged, switchMap, takeUntil, throwError } from 'rxjs';
import { SupplierService } from '../suppliers.service';
import { IPagination } from '@diktup/frontend/models';
import { isEqual, keys, map, omit, values } from 'lodash';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AWS_CREDENTIALS } from '../../../../../environments/environment';
import { AmazonS3Helper, ConvertorHelper, FormHelper, StorageHelper } from '@diktup/frontend/helpers';
import Swal from 'sweetalert2';
import { SharedService } from '../../../../shared/services/shared.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { PosService } from '../../../../core/services/pos.service';

@Component({
  selector: 'sifca-monorepo-suppliers-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class SuppliersListComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  private fileInputExcel = this.document.createElement('input');

  page = 0;
  initialValues: any;
  selectedKinds = [];
  pageChanged: boolean;
  loadingImport: boolean;
  pagination: IPagination;
  supplierForm: FormGroup;
  isButtonDisabled = true;
  countries: CountryType[];
  breadCrumbItems!: Array<{}>;
  selectedSupplier: CompanyType;
  kinds = values(SupplierTypeEnum);
  supplierList!: Observable<SupplierType[]>;
  isLoading$: Observable<boolean> = this.supplierService.isLoading$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  suppliers$: Observable<CompanyType[]> = this.supplierService.suppliers$;

  get pictures(): FormArray {
    return (this.supplierForm.get('media') as FormGroup).get('pictures') as FormArray;
  }
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private posService: PosService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private sharedService: SharedService,
    private storageHelper: StorageHelper,
    private amazonS3Helper: AmazonS3Helper,
    private convertorHelper: ConvertorHelper,
    private supplierService: SupplierService,
    private changeDetectorRef: ChangeDetectorRef,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.findCountriesPagination();
    this.supplierService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.supplierService.pageIndex || 0,
        size: this.supplierService.filterLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.supplierService.pageIndex || 0) * this.supplierService.filterLimit,
        endIndex: Math.min(((this.supplierService.pageIndex || 0) + 1) * this.supplierService.filterLimit - 1, pagination.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
    this.fileInputExcel.type = 'file';
    this.fileInputExcel.name = 'file';
    this.fileInputExcel.multiple = true;
    this.fileInputExcel.style.display = 'none';
    this.fileInputExcel.addEventListener('change', () => {
      if (this.fileInputExcel.files.length) {
        this.convertFile(this.fileInputExcel.files[0]).subscribe((base64) => {
          this.loadingImport = true;
          this.supplierService
            .importSuppliersByExcel(base64)
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
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.INVOICING').subscribe((invoicing: string) => {
      this.translate.get('MENUITEMS.TS.SUPPLIER').subscribe((supplier: string) => {
        this.breadCrumbItems = [{ label: invoicing }, { label: supplier, active: true }];
      });
    });
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.changeDetectorRef.markForCheck();
          this.supplierService.searchString = searchValues.searchString;
          return this.supplierService.searchSuppliersByTarget();
        }),
      )
      .subscribe(() => {
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

  downloadExcel() {
    if (isPlatformBrowser(this.platformId)) {
      this.supplierService.getSuppliersTemplateByExcel().subscribe((res) => {
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

  uploadExcel(): void {
    this.loadingImport = false;
    this.fileInputExcel.value = '';
    this.fileInputExcel.click();
  }

  openImportModal(content: any) {
    this.modalService.open(content, { size: 'md', centered: true });
  }

  onKindChange(kind: string, isChecked: boolean) {
    if (isChecked) {
      this.supplierService.kinds.push(kind);
    } else {
      const index = this.supplierService.kinds.indexOf(kind);
      if (index > -1) {
        this.supplierService.kinds.splice(index, 1);
      }
    }
    this.selectedKinds = this.supplierService.kinds;
    this.supplierService.searchSuppliersByTarget().subscribe();
  }

  openCompanyModal(content: any, supplier: CompanyType) {
    this.selectedSupplier = supplier;
    this.modalService.open(content, { size: 'lg', centered: true });
    this.supplierForm = this.formBuilder.group({
      name: [supplier?.name || '', Validators.required],
      description: [supplier?.description || ''],
      externalId: [supplier?.externalId || ''],
      supplier: this.formBuilder.group({
        kind: [supplier?.supplier?.kind || '', Validators.required],
      }),
      media: this.formBuilder.group({
        pictures: this.formBuilder.array(
          supplier?.media?.pictures?.length
            ? map(supplier?.media?.pictures, (picture) => {
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
      address: this.formBuilder.group({
        address: [supplier?.address?.address || ''],
        postCode: [supplier?.address?.postCode || ''],
        city: [supplier?.address?.city || ''],
        country: [supplier?.address?.country?.id || ''],
      }),
      legal: this.formBuilder.group({
        vat: [supplier?.legal?.vat || ''],
        register: [supplier?.legal?.register || ''],
        licence: [supplier?.legal?.licence || ''],
      }),
      contact: this.formBuilder.group({
        website: [supplier?.contact?.website || ''],
        phone: this.formBuilder.group({
          number: [supplier?.contact?.phone?.number || ''],
          countryCode: ['216'],
        }),
        email: [supplier?.contact?.email || ''],
      }),
    });
    this.initialValues = this.supplierForm.value;
    this.supplierForm.valueChanges.subscribe((ivalues) => {
      this.isButtonDisabled = isEqual(ivalues, this.initialValues);
    });
  }

  save(): void {
    this.isButtonDisabled = true;
    const address: any = {
      ...FormHelper.getNonEmptyAndChangedValues(this.supplierForm.value.address, this.initialValues.address),
    };
    const legal: any = {
      ...FormHelper.getNonEmptyAndChangedValues(this.supplierForm.value.legal, this.initialValues.legal),
    };
    const contact: any = {
      ...FormHelper.getNonEmptyAndChangedValues(this.supplierForm.value.contact, this.initialValues.contact),
    };
    const args: any = {
      ...FormHelper.getNonEmptyAndChangedValues(
        omit(this.supplierForm.value, 'media', 'address', 'legal', 'contact'),
        omit(this.initialValues, 'media', 'address', 'legal', 'contact'),
      ),
      ...(keys(address)?.length ? { address } : {}),
      ...(keys(legal)?.length ? { legal } : {}),
      ...(keys(contact)?.length ? { contact } : {}),
      ...(isEqual(this.initialValues.media, this.supplierForm.value?.media) ? {} : { media: this.supplierForm.value.media }),
    };
    if (this.selectedSupplier) {
      this.supplierService
        .updateCustomerCompany(args, this.selectedSupplier.id)
        .pipe(
          catchError((error) => {
            this.modalService.dismissAll();
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return throwError(() => new Error(error));
          }),
        )
        .subscribe((res: any) => {
          this.position();
          this.modalService.dismissAll();
          this.changeDetectorRef.markForCheck();
        });
    } else {
      this.supplierService
        .createCustomerCompany(args)
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

  findCountriesPagination() {
    this.posService.findCountriesPagination().subscribe((res) => {
      this.countries = res;
      this.changeDetectorRef.markForCheck();
    });
  }

  openDeleteCompany(content: any, supplier: CompanyType) {
    this.selectedSupplier = supplier;
    this.modalService.open(content, { size: 'md', centered: true });
  }

  deleteCustomerCompany() {
    this.supplierService
      .deleteCustomerCompany(this.selectedSupplier.id)
      .pipe(
        catchError((error) => {
          this.modalService.dismissAll();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
        this.pagination.length--;
        this.pagination.endIndex--;
        this.modalService.dismissAll();
        this.position();
        this.changeDetectorRef.markForCheck();
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

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.supplierService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.supplierService.searchCustomersByTarget().subscribe();
    }
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.supplierService.pageIndex = 0;
    this.supplierService.searchString = '';
  }
}
