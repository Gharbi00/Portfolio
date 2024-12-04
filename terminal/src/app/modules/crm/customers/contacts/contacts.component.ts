import Swal from 'sweetalert2';
import { isEqual, map, omit } from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, Observable, of, ReplaySubject, Subject, switchMap, take, takeUntil, throwError } from 'rxjs';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID, QueryList, ViewChildren } from '@angular/core';

import { IPagination } from '@diktup/frontend/models';
import { AmazonS3Helper, ConvertorHelper, FormHelper, StorageHelper } from '@diktup/frontend/helpers';
import { CompanyContactType, CompanyType, GenerateS3SignedUrlGQL } from '@sifca-monorepo/terminal-generator';

import { ContactsService } from './contacts.service';
import { CompaniesService } from '../companies/companies.service';
import { NgbdContactsSortableHeader } from './contacts-sortable.directive';
import { SharedService } from '../../../../shared/services/shared.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { AWS_CREDENTIALS } from '../../../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
})
export class ContactsComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  private fileInputExcel = this.document.createElement('input');
  @ViewChildren(NgbdContactsSortableHeader) headers!: QueryList<NgbdContactsSortableHeader>;

  page = 0;
  isLoading = true;
  initialValues: any;
  selectedOption: any;
  leads: CompanyType[];
  pageChanged: boolean;
  selectedLead: any = {};
  loadingImport: boolean;
  contactsForm: FormGroup;
  pagination: IPagination;
  isButtonDisabled = true;
  companies: CompanyType[];
  selectedCompany: any = {};
  breadCrumbItems!: Array<any>;
  selectedContact: CompanyContactType;
  selectedProfile: CompanyContactType;
  selectValue = ['Lead', 'Partner', 'Exiting', 'Long-term'];
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  leads$: Observable<CompanyType[]> = this.companiesService.infiniteLeads$;
  contacts$: Observable<CompanyContactType[]> = this.contactsService.contacts$;
  loadingContacts$: Observable<boolean> = this.contactsService.loadingContacts$;
  companies$: Observable<CompanyType[]> = this.companiesService.infiniteCompanies$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;

  get pictures(): FormArray {
    return (this.contactsForm.get('media') as FormGroup).get('pictures') as FormArray;
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
    private convertorHelper: ConvertorHelper,
    private contactsService: ContactsService,
    private companiesService: CompaniesService,
    private changeDetectorRef: ChangeDetectorRef,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.contactsService.contacts$.pipe(take(1)).subscribe((contacts: CompanyContactType[]) => {
      this.selectedProfile = contacts[0];
      this.changeDetectorRef.markForCheck();
    });
    this.contactsService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.contactsService.pageIndex,
        size: this.contactsService.filterLimit,
        lastPage: pagination?.length - 1,
        startIndex: this.contactsService.pageIndex * this.contactsService.filterLimit,
        endIndex: Math.min((this.contactsService.pageIndex + 1) * this.contactsService.filterLimit - 1, pagination?.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.CRM').subscribe((crm: string) => {
      this.translate.get('MENUITEMS.TS.CONTACTS').subscribe((contacts: string) => {
        this.breadCrumbItems = [{ label: crm }, { label: contacts, active: true }];
      });
    });
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.changeDetectorRef.markForCheck();
          this.contactsService.searchString = searchValues.searchString;
          return this.contactsService.getCompanyContactsByCompanyPaginated();
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
        a.download = String('leads.xlsx');
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

  openContactModal(content: any, contact: any) {
    this.companiesService.leads$ = null;
    this.companiesService.companies$ = null;
    this.companiesService.infiniteLeads$ = null;
    this.companiesService.infiniteCompanies$ = null;
    this.companiesService.pageIndex = 0;
    this.companiesService.leadsPageIndex = 0;
    this.companiesService.searchLeadsByTarget().subscribe();
    this.companiesService.searchCustomersByTarget().subscribe();
    this.selectedContact = contact;
    this.modalService.open(content, { size: 'md', centered: true });
    this.contactsForm = this.formBuilder.group({
      ...(!this.selectedContact && { company: ['', [Validators.required]] }),
      externalId: [contact?.externalId || ''],
      firstName: [contact?.firstName || '', [Validators.required]],
      lastName: [contact?.lastName || '', [Validators.required]],
      email: [contact?.email || '', [Validators.required]],
      phone: this.formBuilder.group({
        number: [contact?.phone?.number || ''],
        countryCode: ['216'],
      }),
      media: this.formBuilder.group({
        pictures: this.formBuilder.array(
          contact?.media?.pictures?.length
            ? map(contact?.media?.pictures, (picture) => {
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
      leadScore: [contact?.leadScore || '', [Validators.required]],
      tags: [contact?.tags || ''],
      lastContacted: [contact?.lastContacted || ''],
    });
    this.initialValues = this.contactsForm.value;
    this.contactsForm.valueChanges.subscribe((ivalues) => {
      this.isButtonDisabled = isEqual(ivalues, this.initialValues);
    });
  }

  resetDate() {
    this.contactsForm.get('lastContacted').patchValue('');
  }

  loadMoreCompanies() {
    this.companiesService.isCompanyLast$.pipe(take(1)).subscribe((isCompanyLast: boolean) => {
      if (!isCompanyLast) {
        this.companiesService.leadsPageIndex += 1;
        this.companiesService.searchCustomersByTarget().subscribe();
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  loadMoreLeads() {
    this.companiesService.isLast$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.companiesService.pageIndex += 1;
        this.companiesService.searchLeadsByTarget().subscribe();
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  contactPreview(contact: CompanyContactType) {
    this.selectedProfile = contact;
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

  onSelectOption(option: string) {
    this.selectedOption = option;
  }

  onLeadChange(lead: any) {
    this.selectedLead = lead;
    this.contactsForm.get('company').patchValue(lead.id);
  }

  onCompanyChange(company: any) {
    this.selectedCompany = company;
    this.contactsForm.get('company').patchValue(company.id);
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

  deleteCompanyContact() {
    this.contactsService
      .deleteCompanyContact(this.selectedContact?.id || this.selectedProfile?.id)
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
          this.position();
          this.modalService.dismissAll();
          this.pagination.length--;
          this.pagination.endIndex--;
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  openDeleteModal(content: any, company: any) {
    this.selectedCompany = company;
    this.modalService.open(content, { centered: true });
  }

  save(): void {
    this.isButtonDisabled = true;
    const args: any = {
      ...FormHelper.getNonEmptyAndChangedValues(omit(this.contactsForm.value, 'phone', 'media'), omit(this.initialValues, 'phone', 'media')),
      ...(isEqual(this.contactsForm.get('phone').value, this.initialValues.phone) ? {} : { phone: this.contactsForm.get('phone').value }),
      ...(isEqual(this.contactsForm.get('media').value, this.initialValues.media) ? {} : { media: this.contactsForm.get('media').value }),
    };
    if (this.selectedContact) {
      this.contactsService
        .updateCompanyContact(this.selectedContact?.id, args)
        .pipe(
          catchError((error) => {
            this.modalService.dismissAll();
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return throwError(() => new Error(error));
          }),
        )
        .subscribe(() => {
          this.position();
          this.modalService.dismissAll();
          this.changeDetectorRef.markForCheck();
        });
    } else {
      this.contactsService
        .createCompanyContact(args)
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
          this.changeDetectorRef.markForCheck();
        });
    }
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.contactsService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.contactsService.getCompanyContactsByCompanyPaginated().subscribe();
    }
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.contactsService.pageIndex = 0;
    this.contactsService.searchString = '';
  }
}
