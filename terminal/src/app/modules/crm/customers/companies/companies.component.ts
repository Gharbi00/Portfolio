import Swal from 'sweetalert2';
import { isEqual, map, omit } from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID, QueryList, ViewChildren } from '@angular/core';
import { catchError, debounceTime, distinctUntilChanged, Observable, ReplaySubject, Subject, switchMap, take, takeUntil, throwError } from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import { AmazonS3Helper, ConvertorHelper, FormHelper, StorageHelper } from '@diktup/frontend/helpers';
import { CompanyType, CountryType, GenerateS3SignedUrlGQL } from '@sifca-monorepo/terminal-generator';
import { CompanyInput } from '@sifca-monorepo/terminal-generator';

import { CompaniesService } from './companies.service';
import { NgbdCompaniesSortableHeader } from './companies-sortable.directive';
import { SharedService } from '../../../../shared/services/shared.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { AWS_CREDENTIALS } from '../../../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { PosService } from '../../../../core/services/pos.service';

@Component({
  selector: 'sifca-monorepo-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss'],
})
export class CompaniesComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  private fileInputExcel = this.document.createElement('input');
  @ViewChildren(NgbdCompaniesSortableHeader) headers!: QueryList<NgbdCompaniesSortableHeader>;

  page = 0;
  initialValues: any;
  pageChanged: boolean;
  customerForm: FormGroup;
  loadingImport: boolean;
  pagination: IPagination;
  countries: CountryType[];
  breadCrumbItems!: Array<any>;
  selectedCompany: CompanyType;
  selectedProfile: CompanyType;
  isCompanyButtonDisabled = true;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  companies$: Observable<CompanyType[]> = this.companiesService.companies$;
  loadingCompanies$: Observable<boolean> = this.companiesService.loadingCompanies$;

  get pictures(): FormArray {
    return (this.customerForm?.get('media') as FormGroup).get('pictures') as FormArray;
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
    private companiesService: CompaniesService,
    private changeDetectorRef: ChangeDetectorRef,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.companiesService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.companiesService.pageIndex || 0,
        size: this.companiesService.filterLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.companiesService.pageIndex || 0) * this.companiesService.filterLimit,
        endIndex: Math.min(((this.companiesService.pageIndex || 0) + 1) * this.companiesService.filterLimit - 1, pagination.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
    this.companiesService.companies$.pipe(take(1)).subscribe((companies: CompanyType[]) => {
      this.selectedProfile = companies[0];
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
          this.companiesService
            .importCustomersByExcel(base64)
            .pipe(
              catchError((error) => {
                this.loadingImport = false;
                this.modalService.dismissAll();
                this.modalError();
                this.changeDetectorRef.markForCheck();
                return throwError(() => new Error(error));
              }),
            )
            .subscribe((res) => {
              this.modalService.dismissAll();
              if (res) {
                this.position();
                this.loadingImport = false;
                this.changeDetectorRef.markForCheck();
              }
            });
        });
      }
    });
  }

  ngOnInit(): void {
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.changeDetectorRef.markForCheck();
          this.companiesService.searchCustomers = searchValues.searchString;
          return this.companiesService.searchCustomersByTarget();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
    this.findCountriesPagination();
    this.translate.get('MENUITEMS.TS.CRM').subscribe((crm: string) => {
      this.translate.get('MENUITEMS.TS.COMPANIES').subscribe((companies: string) => {
        this.breadCrumbItems = [{ label: crm }, { label: companies, active: true }];
      });
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
      this.companiesService.getCustomersTemplateByExcel().subscribe((res) => {
        const blob = this.convertorHelper.b64toBlob(res, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        const a = this.document.createElement('a');
        this.document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = String('companies.xlsx');
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

  companyPreview(contact: CompanyType) {
    this.selectedProfile = contact;
  }

  saveCustomerCompnay(): void {
    this.isCompanyButtonDisabled = true;
    if (this.selectedCompany) {
      const args: any = {
        ...FormHelper.getNonEmptyAndChangedValues(
          omit(this.customerForm.value, 'legal', 'contact', 'address'),
          omit(this.initialValues, 'legal', 'contact', 'address'),
        ),
        ...(isEqual(this.customerForm.get('contact').value, this.initialValues.contact) ? {} : { contact: this.customerForm.get('contact').value }),
        ...(isEqual(this.customerForm.get('legal').value, this.initialValues.legal) ? {} : { legal: this.customerForm.get('legal').value }),
        ...(isEqual(this.customerForm.get('address').value, this.initialValues.address) ? {} : { address: this.customerForm.get('address').value }),
      };
      this.updateCustomerCompany(args);
    } else {
      const args: any = {
        ...FormHelper.getNonEmptyAndChangedValues(
          omit(this.customerForm.value, 'legal', 'contact', 'address'),
          omit(this.initialValues, 'legal', 'contact', 'address'),
        ),
        ...(isEqual(this.customerForm.get('contact').value, this.initialValues.contact) ? {} : { contact: this.customerForm.get('contact').value }),
        ...(isEqual(this.customerForm.get('legal').value, this.initialValues.legal) ? {} : { legal: this.customerForm.get('legal').value }),
        ...(isEqual(this.customerForm.get('address').value, this.initialValues.address) ? {} : { address: this.customerForm.get('address').value }),
        // ...(keys(legal)?.length ? { legal } : {}),
        // ...(keys(contact)?.length ? { contact } : {}),
        // ...(keys(address)?.length ? { address } : {}),
      };
      this.addCustomerCompany(args);
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
      this.changeDetectorRef.markForCheck();
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

  addCustomerCompany(company: any): void {
    this.companiesService
      .createCustomerCompany(company)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
        this.pagination.length++;
        this.pagination.endIndex++;
        this.modalService.dismissAll();
      });
  }

  openDeleteCompany(content: any, company: CompanyType) {
    this.selectedCompany = company;
    this.modalService.open(content, { size: 'md', centered: true });
  }

  deleteCustomerCompany() {
    this.companiesService
      .deleteCustomerCompany(this.selectedCompany.id)
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
        this.changeDetectorRef.markForCheck();
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

  updateCustomerCompany(company: CompanyInput): void {
    this.companiesService
      .updateCustomerCompany(company, this.selectedCompany.id)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe((res: any) => {
        if (res.data) {
          this.modalService.dismissAll();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  onPageChange(page: number) {
    this.page = page;
    this.companiesService.pageIndex = page - 1;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    if (this.pageChanged) {
      this.companiesService.searchCustomersByTarget().subscribe();
    }
  }

  openCompanyModal(content: any, company: CompanyType) {
    this.selectedCompany = company;
    this.modalService.open(content, { size: 'lg', centered: true });
    this.customerForm = this.formBuilder.group({
      name: [company?.name || '', Validators.required],
      description: [company?.description || ''],
      externalId: [company?.externalId || ''],
      media: this.formBuilder.group({
        pictures: this.formBuilder.array(
          company?.media?.pictures?.length
            ? map(company?.media?.pictures, (picture) => {
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
        address: [company?.address?.address || ''],
        postCode: [company?.address?.postCode || ''],
        city: [company?.address?.city || ''],
        country: [company?.address?.country?.id || ''],
      }),
      legal: this.formBuilder.group({
        vat: [company?.legal?.vat || '', Validators.required],
        register: [company?.legal?.register || '', Validators.required],
        licence: [company?.legal?.licence || ''],
      }),
      contact: this.formBuilder.group({
        website: [company?.contact?.website || ''],
        phone: this.formBuilder.group({
          number: [company?.contact?.phone?.number || ''],
          countryCode: ['216'],
        }),
        email: [company?.contact?.email || '', [Validators.email]],
      }),
    });
    this.initialValues = this.customerForm.value;
    this.customerForm.valueChanges.subscribe((ivalues) => {
      this.isCompanyButtonDisabled = isEqual(ivalues, this.initialValues);
    });
  }

  findCountriesPagination() {
    this.posService.findCountriesPagination().subscribe((res) => {
      this.countries = res;
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.companiesService.pageIndex = 0;
    this.companiesService.searchString = '';
  }
}
