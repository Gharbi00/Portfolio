import Swal from 'sweetalert2';
import { DOCUMENT } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { isEqual, keys, map, omit, values } from 'lodash';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, Observable, of, Subject, switchMap, takeUntil, throwError } from 'rxjs';
import { ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { AmazonS3Helper, FormHelper, StorageHelper } from '@diktup/frontend/helpers';
import { CompanyInput, GenerateS3SignedUrlGQL } from '@sifca-monorepo/terminal-generator';
import {
  BankType,
  CompanyType,
  CountryType,
  ZoneTypesEnum,
  BankDetailsType,
  PointOfSaleType,
  BankDetailsHolderTypeEnum,
} from '@sifca-monorepo/terminal-generator';
import { AWS_CREDENTIALS } from '../../../../environments/environment';
import { CompanyService } from './company.service';
import { SharedService } from '../../../shared/services/shared.service';
import { PosService } from '../../../core/services/pos.service';


@Component({
  selector: 'sifca-monorepo-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss'],
})
export class CompanyComponent implements OnInit, OnDestroy {
  @ViewChild('dataTable') table!: MatTable<any>;
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  private unsubscribeAll: Subject<any> = new Subject<any>();

  banks: BankType[];
  imageError = false;
  bankForm: FormGroup;
  company: CompanyType;
  bankList: BankType[];
  socialForm: FormGroup;
  companyForm: FormGroup;
  loadingPicture = false;
  isButtonDisabled = true;
  countries: CountryType[];
  breadCrumbItems!: Array<{}>;
  isBankButtonDisabled = true;
  isSocialButtonDisabled = true;
  selectedBank: BankDetailsType;
  holderType = values(BankDetailsHolderTypeEnum);
  dataSource: MatTableDataSource<BankDetailsType>;
  displayedColumns: string[] = ['Bank', 'Bank Account', 'Bank IBAN', 'Holder Name', 'Holder Type', 'action'];
  initialValues: any;
  navigating$: Observable<boolean> = this.sharedService.navigating$;

  get pictures(): FormArray {
    return (this.companyForm?.get('media') as FormGroup)?.get('pictures') as FormArray;
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
    private companyService: CompanyService,
    private amazonS3Helper: AmazonS3Helper,
    private changeDetectorRef: ChangeDetectorRef,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.posService.banks$.pipe(takeUntil(this.unsubscribeAll)).subscribe((banks: BankType[]) => {
      this.bankList = banks;
      this.changeDetectorRef.markForCheck();
    });
    this.posService.pos$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pos: PointOfSaleType) => {
      this.findCountriesPagination();
      this.getBanks();
      this.posService.findSocialsPagination().subscribe((res) => {
        this.socialForm = this.formBuilder.group({
          facebook: this.formBuilder.group({
            value: [pos.socialMedia?.find((item) => item.name.code === 'FB')?.value || ''],
            name: [res?.find((item) => item.code === 'FB')?.id || ''],
          }),
          instagram: this.formBuilder.group({
            value: [pos.socialMedia?.find((item) => item.name.code === 'IG')?.value || ''],
            name: [res?.find((item) => item.code === 'IG')?.id || ''],
          }),
          twitter: this.formBuilder.group({
            value: [pos.socialMedia?.find((item) => item.name.code === 'TT')?.value || ''],
            name: [res?.find((item) => item.code === 'TT')?.id || ''],
          }),
          youtube: this.formBuilder.group({
            value: [pos.socialMedia?.find((item) => item.name.code === 'YT')?.value || ''],
            name: [res?.find((item) => item.code === 'YT')?.id || ''],
          }),
          tikTok: this.formBuilder.group({
            value: [pos.socialMedia?.find((item) => item.name.code === 'TK')?.value || ''],
            name: [res?.find((item) => item.code === 'TK')?.id || ''],
          }),
          linkedin: this.formBuilder.group({
            value: [pos.socialMedia?.find((item) => item.name.code === 'LI')?.value || ''],
            name: [res?.find((item) => item.code === 'LI')?.id || ''],
          }),
          pinterest: this.formBuilder.group({
            value: [pos.socialMedia?.find((item) => item.name.code === 'PR')?.value || ''],
            name: [res?.find((item) => item.code === 'PR')?.id || ''],
          }),
        });
        const initValues = this.socialForm?.value;
        this.socialForm?.valueChanges.subscribe((newname: any): void => {
          this.isSocialButtonDisabled = isEqual(newname, initValues);
        });
        this.changeDetectorRef.markForCheck();
      });
      this.companyService.getCompany().subscribe((res) => {
        this.company = res;
        this.dataSource = new MatTableDataSource(this.company.banks);
        this.companyForm = this.formBuilder.group({
          name: [this.company?.name || '', Validators.required],
          description: [this.company?.description || '', Validators.required],
          banks: [map(this.company?.banks, 'id')],
          media: this.formBuilder.group({
            pictures: this.formBuilder.array(
              this.company.media?.pictures?.length
                ? map(this.company?.media?.pictures, (pic) => {
                    return this.formBuilder.group({
                      baseUrl: [pic?.baseUrl || ''],
                      path: [pic?.path || ''],
                    });
                  })
                : [],
            ),
          }),
          address: this.formBuilder.group({
            address: [this.company?.address?.address || ''],
            postCode: [this.company?.address?.postCode || ''],
            city: [this.company?.address?.city || ''],
            country: [this.company?.address?.country?.id || '', Validators.required],
          }),
          legal: this.formBuilder.group({
            vat: [this.company?.legal?.vat || ''],
            register: [this.company?.legal?.register || ''],
            licence: [this.company?.legal?.licence || ''],
          }),
          contact: this.formBuilder.group({
            website: [this.company?.contact?.website || ''],
            phone: this.formBuilder.group({
              number: [this.company?.contact?.phone?.number || ''],
              countryCode: ['216'],
            }),
            email: [this.company?.contact?.email || '', [Validators.email]],
          }),
        });
        this.initialValues = this.companyForm.value;
        this.companyForm.valueChanges.subscribe((ivalues) => {
          this.isButtonDisabled = isEqual(ivalues, this.initialValues);
        });
        this.changeDetectorRef.markForCheck();
      });
    });
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.SYSTEM').subscribe((system: string) => {
      this.translate.get('MENUITEMS.TS.COMPANY').subscribe((company: string) => {
        this.breadCrumbItems = [{ label: system }, { label: company, active: true }];
      });
    });
  }

  updateCompany(company: CompanyInput): void {
    this.isButtonDisabled = true;
    this.companyService
      .updateCompany(company)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe((res: any) => {
        this.position();
        this.changeDetectorRef.markForCheck();
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
          this.pictures.patchValue([
            {
              path: picture.path,
              baseUrl: picture.baseUrl,
            },
          ]);
          const input: any = {
            media: {
              pictures: [
                {
                  path: picture.path,
                  baseUrl: picture.baseUrl,
                },
              ],
            },
          };
          this.updateCompany(input);
          this.changeDetectorRef.markForCheck();
        });
    };
    fileInput.click();
  }

  editSocial(): void {
    this.isSocialButtonDisabled = true;
    let newFormValues: any[] = [];
    if (this.socialForm?.value.facebook.value) {
      newFormValues = [...newFormValues, this.socialForm?.value.facebook];
    }
    if (this.socialForm?.value.instagram.value) {
      newFormValues = [...newFormValues, this.socialForm?.value.instagram];
    }
    if (this.socialForm?.value.twitter.value) {
      newFormValues = [...newFormValues, this.socialForm?.value.twitter];
    }
    if (this.socialForm?.value.youtube.value) {
      newFormValues = [...newFormValues, this.socialForm?.value.youtube];
    }
    if (this.socialForm?.value.tikTok.value) {
      newFormValues = [...newFormValues, this.socialForm?.value.tikTok];
    }
    if (this.socialForm?.value.linkedin.value) {
      newFormValues = [...newFormValues, this.socialForm?.value.linkedin];
    }
    if (this.socialForm?.value.pinterest.value) {
      newFormValues = [...newFormValues, this.socialForm?.value.pinterest];
    }
    const newValues: any = {
      socialMedia: newFormValues,
    };
    this.posService.update(newValues)
    .pipe(catchError(() => {
      this.modalError();
      return of(null);
    }))
    .subscribe((pos) => {
      if (pos) {
        this.position();
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  createBank() {
    this.isBankButtonDisabled = true;
    this.changeDetectorRef.markForCheck();
    this.posService
      .createBankDetails(this.bankForm.value)
      .pipe(
        catchError((error: any) => {
          this.modelTitle();
          return throwError(() => error);
        }),
        takeUntil(this.unsubscribeAll),
        switchMap((res) => {
          return this.companyService.updateCompany({ banks: map(this.company.banks, 'id') });
        }),
      )
      .subscribe(() => {
        this.bankForm.reset();
        this.modalService.dismissAll();
        this.changeDetectorRef.markForCheck();
      });
  }

  modelTitle() {
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

  openBankModal(modalContent: NgbModal, bank: BankDetailsType) {
    this.modalService.open(modalContent, { backdrop: 'static', centered: true });
    this.bankForm = this.formBuilder.group({
      account: [bank?.account || '', Validators.required],
      iban: [bank?.iban || '', Validators.required],
      bank: [bank?.bank.id || '', Validators.required],
      holder: this.formBuilder.group({
        name: [bank?.holder.name || ''],
        type: [bank?.holder.type || ''],
        address: this.formBuilder.group({
          address: [bank?.holder?.address?.address || ''],
          postCode: [bank?.holder?.address?.postCode || ''],
          city: [bank?.holder?.address?.city || ''],
          country: [bank?.holder?.address?.country.id || ''],
          location: this.formBuilder.group({
            type: [ZoneTypesEnum.POINT],
            coordinates: [[]],
          }),
        }),
      }),
    });
    const bankValues = this.bankForm.value;
    this.bankForm.valueChanges.subscribe((ivalues) => {
      this.isBankButtonDisabled = isEqual(ivalues, bankValues);
    });
    this.selectedBank = bank;
  }

  createBankDetails(bank) {
    this.isBankButtonDisabled = true;
    this.posService
      .createBankDetails(bank)
      .pipe(
        catchError((error: any) => {
          this.modelTitle();
          return throwError(() => error);
        }),
        takeUntil(this.unsubscribeAll),
        switchMap((res) => {
          return this.companyService.updateCompany({ banks: map(this.company.banks, 'id') });
        }),
      )
      .subscribe(() => {
        this.bankForm.reset();
        this.changeDetectorRef.markForCheck();
      });
  }

  updateBankDetails(bankId: string, bank) {
    this.posService
      .updateBankDetails(bankId, bank)
      .pipe(
        catchError((error: any) => {
          this.modelTitle();
          return throwError(() => error);
        }),
      )
      .subscribe(() => {
        this.modalService.dismissAll();
        this.bankForm.reset();
        this.changeDetectorRef.markForCheck();
      });
  }

  saveBank() {
    this.isBankButtonDisabled = true;
    this.selectedBank?.id ? this.updateBankDetails(this.selectedBank.id, this.bankForm.value) : this.createBankDetails(this.bankForm.value);
  }

  save(): void {
    this.isButtonDisabled = true;
    const address: any = {
      ...FormHelper.getNonEmptyAndChangedValues(this.companyForm.value.address, this.initialValues.address),
    };
    const legal: any = {
      ...FormHelper.getNonEmptyAndChangedValues(this.companyForm.value.legal, this.initialValues.legal),
    };
    const contact: any = {
      ...FormHelper.getNonEmptyAndChangedValues(this.companyForm.value.contact, this.initialValues.contact),
    };
    const input: any = {
      ...FormHelper.getNonEmptyAndChangedValues(
        omit(this.companyForm.value, 'media', 'address', 'legal', 'contact'),
        omit(this.initialValues, 'media', 'address', 'legal', 'contact'),
      ),
      ...(keys(address)?.length ? { address } : {}),
      ...(keys(legal)?.length ? { legal } : {}),
      ...(keys(contact)?.length ? { contact } : {}),
      ...(isEqual(this.initialValues.media, this.companyForm.value?.media) ? {} : { media: this.companyForm.value.media }),
    };
    this.updateCompany(input);
  }

  findCountriesPagination() {
    this.posService.findCountriesPagination().subscribe((res: any) => {
      this.countries = res;
      this.changeDetectorRef.markForCheck();
    });
  }

  getBanks() {
    this.posService.getBanks().subscribe((res: any) => {
      this.banks = res;
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

  addCompany(company: CompanyInput): void {
    this.companyService.createCompany(company).subscribe((res: any) => {
      if (res.data) {
        this.posService.update({ company: res.data.createCompany.id }).subscribe();
        this.isButtonDisabled = true;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
