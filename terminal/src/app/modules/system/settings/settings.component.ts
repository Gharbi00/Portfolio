import Swal from 'sweetalert2';
import { DOCUMENT } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { isEqual, keys, map, omit, values } from 'lodash';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { catchError, debounceTime, distinctUntilChanged, Observable, Subject, switchMap, takeUntil, throwError } from 'rxjs';

import { CompanyInput, CompanyPaginateType, GenerateS3SignedUrlGQL, TaxPaginateType } from '@sifca-monorepo/terminal-generator';
import {
  TaxType,
  PriceType,
  TaxUseEnum,
  CompanyType,
  CountryType,
  TaxSignEnum,
  DiscountType,
  LogisticStatus,
  PointOfSaleType,
  DocumentReferenceModelEnum,
} from '@sifca-monorepo/terminal-generator';
import { AmazonS3Helper, FormHelper, StorageHelper } from '@diktup/frontend/helpers';

import { SettingsService } from './settings.service';
import { CompanyService } from '../company/company.service';
import { PosService } from '../../../core/services/pos.service';
import { AWS_CREDENTIALS } from '../../../../environments/environment';
import { SharedService } from '../../../shared/services/shared.service';

@Component({
  selector: 'sifca-monorepo-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  taxes: TaxType[];
  companyId: string;
  submitted = false;
  imageError = false;
  initialValues: any;
  taxForm!: FormGroup;
  priceForm: FormGroup;
  company: CompanyType;
  selectedTax: TaxType;
  table!: MatTable<any>;
  companyForm: FormGroup;
  loadingPicture = false;
  logisticForm: FormGroup;
  settingsForm: FormGroup;
  isButtonDisabled = true;
  priceInitialValues: any;
  companies: CompanyType[];
  countries: CountryType[];
  selcetedPrice: PriceType;
  uses = values(TaxUseEnum);
  isTaxButtonDisabled = true;
  signs = values(TaxSignEnum);
  types = values(DiscountType);
  isOrderButtonDisabled = true;
  selectedCompany: CompanyType;
  isPriceButtonDisabled = true;
  settings: any;
  isTicketsButtonDisabled = true;
  isInvoiceButtonDisabled = true;
  status = values(LogisticStatus);
  isLogisticButtonDisabled = true;
  isSettingsButtonDisabled = false;
  isQuotationButtonDisabled = true;
  isIssueNoteButtonDisabled = true;
  isInventoryButtonDisabled = true;
  isDeliveryNoteButtonDisabled = true;
  dataSource: MatTableDataSource<TaxType>;
  DocumentReferences = values(DocumentReferenceModelEnum);
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  priceList$: Observable<PriceType[]> = this.settingsService.priceList$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  searchPriceForm: FormGroup = this.formBuilder.group({ searchString: [''] });

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
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private storageHelper: StorageHelper,
    private companyService: CompanyService,
    private settingsService: SettingsService,
    private amazonS3Helper: AmazonS3Helper,
    private changeDetectorRef: ChangeDetectorRef,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.findCountriesPagination();
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.changeDetectorRef.markForCheck();
          this.settingsService.searchString = searchValues.searchString;
          return this.settingsService.searchLogisticCompaniesByTarget();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
    this.searchPriceForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.changeDetectorRef.markForCheck();
          this.settingsService.priceSearchString = searchValues.searchString;
          return this.settingsService.getPricesByCompanyPaginated();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
    this.companyId = this.storageHelper.getData('company');
    this.posService.pos$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pos: PointOfSaleType) => {
      this.companyService.getCompany().subscribe((res) => {
        this.company = res;
        this.companyForm = this.formBuilder.group({
          name: [this.company?.name || '', Validators.required],
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
        });
        this.changeDetectorRef.markForCheck();
      });
    });
    this.settingsService.taxes$.pipe(takeUntil(this.unsubscribeAll)).subscribe((taxes: TaxPaginateType) => {
      this.taxes = taxes.objects;
      this.dataSource = new MatTableDataSource(taxes.objects);
      this.changeDetectorRef.markForCheck();
    });
    this.settingsService.companies$.pipe(takeUntil(this.unsubscribeAll)).subscribe((companies: CompanyPaginateType) => {
      if (companies) {
        this.companies = companies?.objects;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  ngOnInit(): void {
    this.settingsService.settings$.pipe(takeUntil(this.unsubscribeAll)).subscribe((settings: any) => {
      this.settings = settings;
      this.settingsForm = this.formBuilder.group({
        sale: this.formBuilder.group({
          quotation: this.formBuilder.group({
            reference: [settings.sale.quotation.reference || DocumentReferenceModelEnum.WITHOUT_PREFIX],
            prefix: [settings.sale.quotation?.prefix || ''],
            label: [settings.sale.quotation?.label || ''],
            color: [settings.sale.quotation?.color || ''],
            note: [settings.sale.quotation?.note || ''],
            validity: this.formBuilder.group({
              period: [settings.sale.quotation.validity?.period || ''],
              cycle: [settings.sale.quotation.validity?.cycle || ''],
            }),
          }),
          order: this.formBuilder.group({
            reference: [settings.sale.order.reference || DocumentReferenceModelEnum.WITHOUT_PREFIX],
            label: [settings.sale.order?.label || ''],
            prefix: [settings.sale.order?.prefix || ''],
            color: [settings.sale.order?.color || ''],
            note: [settings.sale.order?.note || ''],
            validity: this.formBuilder.group({
              period: [settings.sale.order.validity?.period || ''],
              cycle: [settings.sale.order.validity?.cycle || ''],
            }),
          }),
          invoice: this.formBuilder.group({
            reference: [settings.sale.invoice.reference || DocumentReferenceModelEnum.WITHOUT_PREFIX],
            label: [settings.sale.invoice?.label || ''],
            prefix: [settings.sale.invoice?.prefix || ''],
            color: [settings.sale.invoice?.color || ''],
            note: [settings.sale.invoice?.note || ''],
            validity: this.formBuilder.group({
              period: [settings.sale.invoice.validity?.period || ''],
              cycle: [settings.sale.invoice.validity?.cycle || ''],
            }),
          }),
          deliveryNote: this.formBuilder.group({
            reference: [settings.sale.deliveryNote.reference || DocumentReferenceModelEnum.WITHOUT_PREFIX],
            label: [settings.sale.deliveryNote?.label || ''],
            prefix: [settings.sale.deliveryNote?.prefix || ''],
            color: [settings.sale.deliveryNote?.color || ''],
            note: [settings.sale.deliveryNote?.note || ''],
            validity: this.formBuilder.group({
              period: [settings.sale.deliveryNote.validity?.period || ''],
              cycle: [settings.sale.deliveryNote.validity?.cycle || ''],
            }),
          }),
          issueNote: this.formBuilder.group({
            reference: [settings.sale.issueNote.reference || DocumentReferenceModelEnum.WITHOUT_PREFIX],
            label: [settings.sale.issueNote?.label || ''],
            prefix: [settings.sale.issueNote?.prefix || ''],
            color: [settings.sale.issueNote?.color || ''],
            note: [settings.sale.issueNote?.note || ''],
            validity: this.formBuilder.group({
              period: [settings.sale.issueNote.validity?.period || ''],
              cycle: [settings.sale.issueNote.validity?.cycle || ''],
            }),
          }),
        }),
        purchase: this.formBuilder.group({
          deliveryNote: this.formBuilder.group({
            reference: [settings.purchase.deliveryNote?.reference || DocumentReferenceModelEnum.WITHOUT_PREFIX],
            prefix: [settings.purchase.deliveryNote?.prefix || ''],
            note: [settings.purchase.deliveryNote.note || ''],
          }),
          inventory: this.formBuilder.group({
            reference: [settings.purchase.inventory?.reference || DocumentReferenceModelEnum.WITHOUT_PREFIX],
            prefix: [settings.purchase.inventory?.prefix || ''],
            note: [settings.purchase.inventory.note || ''],
          }),
          invoice: this.formBuilder.group({
            reference: [settings.purchase.invoice?.reference || DocumentReferenceModelEnum.WITHOUT_PREFIX],
            prefix: [settings.purchase.invoice?.prefix || ''],
            note: [settings.purchase.invoice.note || ''],
          }),
          order: this.formBuilder.group({
            reference: [settings.purchase.order?.reference || DocumentReferenceModelEnum.WITHOUT_PREFIX],
            prefix: [settings.purchase.order?.prefix || ''],
            note: [settings.purchase.order.note || ''],
          }),
        }),
        tickets: this.formBuilder.group({
          prefix: [settings.tickets.prefix || ''],
        }),
        logistic: this.formBuilder.group({
          prefix: [settings.logistic.prefix || ''],
        }),
      });
      const ticketsValues = this.settingsForm?.get(['tickets', 'prefix']).value;
      this.settingsForm
        ?.get(['tickets', 'prefix'])
        ?.valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((val): void => {
          this.isTicketsButtonDisabled = isEqual(val, ticketsValues);
        });

      const logisticValues = this.settingsForm?.get(['logistic', 'prefix']).value;
      this.settingsForm
        ?.get(['logistic', 'prefix'])
        ?.valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((val): void => {
          this.isLogisticButtonDisabled = isEqual(val, logisticValues);
        });

      const inventoryValues = this.settingsForm?.get(['purchase', 'inventory']).value;
      this.settingsForm
        ?.get(['purchase', 'inventory'])
        ?.valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((val): void => {
          this.isInventoryButtonDisabled = isEqual(val, inventoryValues);
        });

      const orderValues2 = this.settingsForm?.get(['purchase', 'order']).value;
      this.settingsForm
        ?.get(['purchase', 'order'])
        ?.valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((val): void => {
          this.isOrderButtonDisabled = isEqual(val, orderValues2);
          this.isSettingsButtonDisabled = false;
        });

      const invoiceValuesValues2 = this.settingsForm?.get(['purchase', 'invoice']).value;
      this.settingsForm
        ?.get(['purchase', 'invoice'])
        ?.valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((val): void => {
          this.isInvoiceButtonDisabled = isEqual(val, invoiceValuesValues2);
          this.isSettingsButtonDisabled = false;
        });

      const deliveryNoteValuesValues2 = this.settingsForm?.get(['purchase', 'deliveryNote']).value;
      this.settingsForm
        ?.get(['purchase', 'deliveryNote'])
        ?.valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((val): void => {
          this.isDeliveryNoteButtonDisabled = isEqual(val, deliveryNoteValuesValues2);
          this.isSettingsButtonDisabled = false;
        });

      const quotationValues = this.settingsForm?.get(['sale', 'quotation']).value;
      this.settingsForm
        ?.get(['sale', 'quotation'])
        ?.valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((val): void => {
          this.isQuotationButtonDisabled = isEqual(val, quotationValues);
          this.isSettingsButtonDisabled = false;
        });
      const orderValues = this.settingsForm?.get(['sale', 'order']).value;
      this.settingsForm
        ?.get(['sale', 'order'])
        ?.valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((val): void => {
          this.isOrderButtonDisabled = isEqual(val, orderValues);
          this.isSettingsButtonDisabled = false;
        });
      const invoiceValues = this.settingsForm?.get(['sale', 'invoice']).value;
      this.settingsForm
        ?.get(['sale', 'invoice'])
        ?.valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((val): void => {
          this.isInvoiceButtonDisabled = isEqual(val, invoiceValues);
          this.isSettingsButtonDisabled = false;
        });
      const deliveryNoteValues = this.settingsForm?.get(['sale', 'deliveryNote']).value;
      this.settingsForm
        ?.get(['sale', 'deliveryNote'])
        ?.valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((val): void => {
          this.isDeliveryNoteButtonDisabled = isEqual(val, deliveryNoteValues);
          this.isSettingsButtonDisabled = false;
        });
      const issueNoteValues = this.settingsForm?.get(['sale', 'issueNote']).value;
      this.settingsForm
        ?.get(['sale', 'issueNote'])
        ?.valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((val): void => {
          this.isIssueNoteButtonDisabled = isEqual(val, issueNoteValues);
          this.isSettingsButtonDisabled = false;
        });
      this.changeDetectorRef.markForCheck();
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

  savePrice(): void {
    this.isPriceButtonDisabled = true;
    if (this.selcetedPrice) {
      const input: any = {
        ...(this.priceForm.value.enable === this.priceInitialValues.enable ? {} : { enable: this.priceForm.value.enable }),
        ...(this.priceForm.value.label === this.priceInitialValues.label ? {} : { enable: this.priceForm.value.label }),
      };
      this.settingsService
        .updatePrice(this.selcetedPrice?.id, input)
        .pipe(
          catchError((error) => {
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return throwError(() => new Error(error));
          }),
        )
        .subscribe((res: any) => {
          if (res) {
            this.position();
            this.modalService.dismissAll();
            this.changeDetectorRef.markForCheck();
          }
        });
    } else {
      const input: any = {
        ...FormHelper.getNonEmptyValues(this.priceForm.value),
      };
      this.settingsService
        .createPrice(input)
        .pipe(
          catchError((error) => {
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return throwError(() => new Error(error));
          }),
        )
        .subscribe((res: any) => {
          if (res) {
            this.position();
            this.modalService.dismissAll();
            this.changeDetectorRef.markForCheck();
          }
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

  openUpdateListModal(content: any, price: PriceType) {
    this.selcetedPrice = price;
    this.modalService.open(content, { centered: true });
    this.priceForm = this.formBuilder.group({
      label: [price?.label || '', Validators.required],
      enable: [price?.enable || true],
    });
    this.priceInitialValues = this.priceForm.value;
    this.priceForm.valueChanges.subscribe((ivalues) => {
      this.isPriceButtonDisabled = isEqual(ivalues, this.priceInitialValues);
    });
  }

  openLogisticModal(content: any, company: any) {
    this.modalService.open(content, { size: 'lg', centered: true });
    this.selectedCompany = company;
    this.logisticForm = this.formBuilder.group({
      name: [company?.name || '', Validators.required],
      description: [company?.description || ''],
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
    this.initialValues = this.logisticForm.value;
    this.logisticForm.valueChanges.subscribe((ivalues) => {
      this.isLogisticButtonDisabled = isEqual(ivalues, this.initialValues);
    });
  }

  saveLogisticCompnay(): void {
    this.isLogisticButtonDisabled = true;
    let args: any;
    const legal = FormHelper.getNonEmptyAndChangedValues(this.logisticForm.value.legal, this.company.legal);
    const contact = {
      ...(this.company.contact.phone.number === this.logisticForm.value.contact.phone.number
        ? {}
        : { phone: { number: this.logisticForm.value.contact.phone.number, countryCode: '216' } }),
      ...FormHelper.getNonEmptyAndChangedValues(this.logisticForm.value.contact, this.company.contact),
    };
    const address = FormHelper.getNonEmptyAndChangedValues(
      {
        ...this.logisticForm.value.address,
        address: [
          this.logisticForm.value.address?.address,
          this.logisticForm.value.address?.city,
          this.logisticForm.value.address?.postCode,
          this.logisticForm.value.address?.country,
        ].join(' '),
      },
      { ...this.company.address, country: this.company.address?.country?.id },
    );
    (args = {
      ...FormHelper.getNonEmptyAndChangedValues(
        omit(this.logisticForm.value, 'address', 'legal', 'contact'),
        omit(this.initialValues, 'address', 'legal', 'contact'),
      ),
      ...(keys(address).length ? { address } : {}),
      ...(keys(legal).length ? { legal } : {}),
      ...(keys(contact).length ? { contact } : {}),
    }),
      this.selectedCompany ? this.updateLogisticCompany(args) : this.addLogisticCompany(args);
  }

  updateLogisticCompany(company: CompanyInput): void {
    this.settingsService
      .updateLogisticCompany(company, this.selectedCompany.id)
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

  addLogisticCompany(company: CompanyInput): void {
    this.settingsService
      .createLogisticCompany(company)
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

  saveTax() {
    this.isTaxButtonDisabled = true;
    const value = {
      ...FormHelper.getNonEmptyValues(this.taxForm.get('value').value),
    };
    if (!this.selectedTax) {
      const args: any = {
        ...omit(this.taxForm.value, 'value'),
        ...(keys(value)?.length ? { value } : {}),
      };
      this.settingsService
        .createTax(args)
        .pipe(
          catchError((error) => {
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
      this.settingsService
        .updateTax(this.selectedTax.id, this.taxForm.value)
        .pipe(
          catchError((error) => {
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
  }

  openTaxModal(content: any, tax: TaxType) {
    this.selectedTax = tax;
    this.modalService.open(content, { size: 'md', centered: true });
    this.taxForm = this.formBuilder.group({
      label: [tax?.label || '', [Validators.required]],
      value: this.formBuilder.group({
        sign: [tax?.value?.sign || '', [Validators.required]],
        value: [tax?.value?.value || ''],
        type: [tax?.value?.type || '', [Validators.required]],
      }),
      use: [tax?.use || '', [Validators.required]],
      product: [tax?.product || true],
      company: [this.companyId],
    });
    const ivalues = this.taxForm.value;
    this.taxForm?.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val): void => {
      this.isTaxButtonDisabled = isEqual(val, ivalues);
    });
  }

  openDeleteTax(content: any, tax: TaxType) {
    this.selectedTax = tax;
    this.modalService.open(content, { size: 'md', centered: true });
  }

  openDeleteCompany(content: any, company: CompanyType) {
    this.selectedCompany = company;
    this.modalService.open(content, { size: 'md', centered: true });
  }

  deleteLogisticCompany() {
    this.settingsService
      .deleteLogisticCompany(this.selectedCompany.id)
      .pipe(
        catchError((error) => {
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

  deleteTax() {
    this.settingsService
      .deleteTax(this.selectedTax.id)
      .pipe(
        catchError((error) => {
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

  updateCompanyTickets() {
    this.isSettingsButtonDisabled = true;
    const arg: any = {
      tickets: {
        ...this.settingsForm.get('tickets').value,
      },
    };
    this.settingsService.updateCompanySettings(this.settings.id, arg).subscribe(() => {
      this.isTicketsButtonDisabled = true;
      this.changeDetectorRef.markForCheck();
    });
  }

  updateCompanyLogistics() {
    this.isSettingsButtonDisabled = true;
    const arg: any = {
      logistic: {
        ...this.settingsForm.get('logistic').value,
      },
    };
    this.settingsService.updateCompanySettings(this.settings.id, arg).subscribe(() => {
      this.isLogisticButtonDisabled = true;
      this.changeDetectorRef.markForCheck();
    });
  }

  updateCompanySales(field: string) {
    let arg: any;
    this.isSettingsButtonDisabled = true;
    arg = {
      sale: {
        ...(field === 'quotation'
          ? { quotation: this.settingsForm.get(['sale', 'quotation']).value }
          : field === 'order'
          ? { order: this.settingsForm.get(['sale', 'order']).value }
          : field === 'invoice'
          ? { invoice: this.settingsForm.get(['sale', 'invoice']).value }
          : field === 'deliveryNote'
          ? { deliveryNote: this.settingsForm.get(['sale', 'deliveryNote']).value }
          : { issueNote: this.settingsForm.get(['sale', 'issueNote']).value }),
      },
    };
    this.settingsService.updateCompanySettings(this.settings.id, arg).subscribe(() => {
      this.isQuotationButtonDisabled = true;
      this.isOrderButtonDisabled = true;
      this.isInvoiceButtonDisabled = true;
      this.isDeliveryNoteButtonDisabled = true;
      this.isIssueNoteButtonDisabled = true;
      this.changeDetectorRef.markForCheck();
    });
  }

  updateCompanyPurchase(field: string) {
    let arg: any;
    this.isSettingsButtonDisabled = true;
    arg = {
      purchase: {
        ...(field === 'inventory'
          ? { inventory: this.settingsForm.get(['purchase', 'inventory']).value }
          : field === 'order'
          ? { order: this.settingsForm.get(['purchase', 'order']).value }
          : field === 'invoice'
          ? { invoice: this.settingsForm.get(['purchase', 'invoice']).value }
          : { deliveryNote: this.settingsForm.get(['purchase', 'deliveryNote']).value }),
      },
    };
    this.settingsService.updateCompanySettings(this.settings.id, arg).subscribe(() => {
      this.isInventoryButtonDisabled = true;
      this.isOrderButtonDisabled = true;
      this.isInvoiceButtonDisabled = true;
      this.isDeliveryNoteButtonDisabled = true;
      this.isSettingsButtonDisabled = true;
      this.changeDetectorRef.markForCheck();
    });
  }

  findCountriesPagination() {
    this.posService.findCountriesPagination().subscribe((res) => {
      this.countries = res;
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
