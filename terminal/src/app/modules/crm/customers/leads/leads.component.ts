import Swal from 'sweetalert2';
import { isEqual, map, omit } from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, QueryList, ViewChildren, OnInit, ChangeDetectorRef, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { catchError, debounceTime, distinctUntilChanged, Observable, ReplaySubject, Subject, switchMap, takeUntil, throwError } from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import { AmazonS3Helper, ConvertorHelper, FormHelper, StorageHelper } from '@diktup/frontend/helpers';
import { CompanyType, CountryType, GenerateS3SignedUrlGQL } from '@sifca-monorepo/terminal-generator';
import { CompanyInput } from '@sifca-monorepo/terminal-generator';

import { CompaniesService } from '../companies/companies.service';
import { NgbdLeadsSortableHeader } from './leads-sortable.directive';
import { SharedService } from '../../../../shared/services/shared.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { AWS_CREDENTIALS } from '../../../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { PosService } from '../../../../core/services/pos.service';

@Component({
  selector: 'sifca-monorepo-leads',
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.scss'],
})
export class LeadsComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  private fileInputExcel = this.document.createElement('input');
  @ViewChildren(NgbdLeadsSortableHeader) headers!: QueryList<NgbdLeadsSortableHeader>;

  page = 0;
  pageSize: number;
  initialValues: any;
  leads: CompanyType[];
  leadsForm: FormGroup;
  collectionSize: number;
  pagination: IPagination;
  countries: CountryType[];
  selectedLead: CompanyType;
  breadCrumbItems!: Array<{}>;
  isLeadButtonDisabled = true;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  leads$: Observable<CompanyType[]> = this.companiesService.leads$;
  loadingLeads$: Observable<boolean> = this.companiesService.loadingLeads$;
  loadingImport: boolean;
  navigating$: Observable<boolean> = this.sharedService.navigating$;

  get pictures(): FormArray {
    return (this.leadsForm.get('media') as FormGroup).get('pictures') as FormArray;
  }

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private modalService: NgbModal,
    private posService: PosService,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private storageHelper: StorageHelper,
    private sharedService: SharedService,
    private amazonS3Helper: AmazonS3Helper,
    private convertorHelper: ConvertorHelper,
    private companiesService: CompaniesService,
    private changeDetectorRef: ChangeDetectorRef,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.findCountriesPagination();
    this.companiesService.leadsPagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.companiesService.pageIndex || 0,
        size: this.companiesService.filterLimit || this.pageSize,
        lastPage: pagination?.length - 1,
        startIndex: (this.companiesService.pageIndex || 0) * (this.companiesService.filterLimit || this.pageSize),
        endIndex: Math.min(
          ((this.companiesService.pageIndex || 0) + 1) * (this.companiesService.filterLimit || this.pageSize) - 1,
          pagination?.length - 1,
        ),
      };
      this.pageSize = this.companiesService.filterLimit;
      this.collectionSize = pagination?.length;
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.CRM').subscribe((crm: string) => {
      this.translate.get('MENUITEMS.TS.LEADS').subscribe((leads: string) => {
        this.breadCrumbItems = [{ label: crm }, { label: leads, active: true }];
      });
    });
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.changeDetectorRef.markForCheck();
          this.companiesService.searchString = searchValues.searchString;
          return this.companiesService.searchLeadsByTarget();
        }),
      )
      .subscribe(() => {
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
        const blob = this.convertorHelper.b64toBlob(res, 'application/vnd.openxmlformats-officethis.document.spreadsheetml.sheet');
        const a = this.document.createElement('a');
        this.document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = String('contacts.xlsx');
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

  saveLeadCompnay(): void {
    this.isLeadButtonDisabled = true;
    const args: any = {
      ...FormHelper.getNonEmptyAndChangedValues(
        omit(this.leadsForm.value, 'contact', 'media', 'address', 'legal'),
        omit(this.initialValues, 'phone', 'media', 'address', 'legal'),
      ),
      ...(isEqual(this.leadsForm.get('contact').value, this.initialValues.contact) ? {} : { contact: this.leadsForm.get('contact').value }),
      ...(isEqual(this.leadsForm.get('media').value, this.initialValues.media) ? {} : { media: this.leadsForm.get('media').value }),
      ...(isEqual(this.leadsForm.get('address').value, this.initialValues.address) ? {} : { address: this.leadsForm.get('address').value }),
      ...(isEqual(this.leadsForm.get('legal').value, this.initialValues.legal) ? {} : { legal: this.leadsForm.get('legal').value }),
    };
    if (this.selectedLead) {
      this.updateLeadCompany(args);
    } else {
      this.addLeadCompany(args);
    }
  }

  onPageChange(page: number) {
    this.page = page;
    this.companiesService.leadsPageIndex = page - 1;
    this.companiesService.searchLeadsByTarget().subscribe();
  }

  openCompanyModal(content: any, lead: CompanyType) {
    this.selectedLead = lead;
    this.modalService.open(content, { size: 'lg', centered: true });
    this.leadsForm = this.formBuilder.group({
      name: [lead?.name || '', Validators.required],
      description: [lead?.description || ''],
      externalId: [lead?.externalId || ''],
      tags: [lead?.tags || ''],
      customer: this.formBuilder.group({
        score: [lead?.customer?.score || ''],
      }),
      media: this.formBuilder.group({
        pictures: this.formBuilder.array(
          lead?.media?.pictures?.length
            ? map(lead?.media?.pictures, (picture) => {
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
        address: [lead?.address?.address || ''],
        postCode: [lead?.address?.postCode || ''],
        city: [lead?.address?.city || ''],
        country: [lead?.address?.country?.id || ''],
      }),
      legal: this.formBuilder.group({
        vat: [lead?.legal?.vat || '', Validators.required],
        register: [lead?.legal?.register || '', Validators.required],
        licence: [lead?.legal?.licence || ''],
      }),
      contact: this.formBuilder.group({
        website: [lead?.contact?.website || ''],
        phone: this.formBuilder.group({
          number: [lead?.contact?.phone?.number || ''],
          countryCode: ['216'],
        }),
        email: [lead?.contact?.email || '', [Validators.email]],
      }),
    });
    this.initialValues = this.leadsForm.value;
    this.leadsForm.valueChanges.subscribe((ivalues) => {
      this.isLeadButtonDisabled = isEqual(ivalues, this.initialValues);
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

  addLeadCompany(company: any): void {
    this.companiesService
      .createLeadCompany(company)
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

  updateLeadCompany(lead: CompanyInput): void {
    this.companiesService
      .updateLeadCompany(lead, this.selectedLead.id)
      .pipe(
        catchError((error) => {
          this.modalService.dismissAll();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe((res: any) => {
        if (res.data) {
          this.position();
          this.modalService.dismissAll();
          this.changeDetectorRef.markForCheck();
        }
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

  openDeleteLead(content: any, lead: CompanyType) {
    this.selectedLead = lead;
    this.modalService.open(content, { size: 'md', centered: true });
  }

  deleteLeadCompany() {
    this.companiesService
      .deleteLeadCompany(this.selectedLead.id)
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

  findCountriesPagination() {
    this.posService.findCountriesPagination().subscribe((res) => {
      this.countries = res;
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.companiesService.leadsPageIndex = 0;
    this.companiesService.searchString = '';
  }
}
