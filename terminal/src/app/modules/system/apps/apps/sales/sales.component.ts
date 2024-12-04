import Swal from 'sweetalert2';
import { DOCUMENT, Location } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { every, filter, isEqual, map, values } from 'lodash';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { catchError, Observable, of, Subject, take, takeUntil } from 'rxjs';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';

import {
  PluginType,
  CompanyType,
  CountryType,
  GenerateS3SignedUrlGQL,
  DocumentReferenceModelEnum,
  WebsiteIntegrationMulticurrencyCurrencyType,
  DeleteFileFromAwsGQL,
} from '@sifca-monorepo/terminal-generator';
import { PosService } from '../../../../../core/services/pos.service';

import { CurrencyType, SalesIntegrationType } from '@sifca-monorepo/terminal-generator';

import { SalesService } from './sales.service';
import { IntegrationAppsService } from '../../apps.service';
import { AWS_CREDENTIALS } from '../../../../../../environments/environment';
import { AmazonS3Helper, StorageHelper } from '@diktup/frontend/helpers';
import { SharedService } from '../../../../../shared/services/shared.service';

@Component({
  selector: 'sifca-monorepo-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss'],
})
export class SalesComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  initialValues: any;
  loadingPicture = false;
  salesForm: FormGroup;
  isButtonDisabled = true;
  countries: CountryType[];
  sales: SalesIntegrationType;
  isOrderButtonDisabled = true;
  selectedCompany: CompanyType;
  isInvoiceButtonDisabled = true;
  isSettingsButtonDisabled = false;
  isQuotationButtonDisabled = true;
  isIssueNoteButtonDisabled = true;
  isInventoryButtonDisabled = true;
  isDeliveryNoteButtonDisabled = true;
  DocumentReferences = values(DocumentReferenceModelEnum);
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  plugin$: Observable<PluginType> = this.integrationAppsService.plugin$;
  currencies$: Observable<CurrencyType[]> = this.posService?.infiniteCurrencies$;
  selectedCurrency: WebsiteIntegrationMulticurrencyCurrencyType;

  get currencies(): FormArray {
    return this.salesForm.get(['multicurrency', 'currencies']) as FormArray;
  }
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private location: Location,
    private modalService: NgbModal,
    private posService: PosService,
    private formBuilder: FormBuilder,
    private salesService: SalesService,
    private translate: TranslateService,
    private sharedService: SharedService,
    private storageHelper: StorageHelper,
    private amazonS3Helper: AmazonS3Helper,
    private changeDetectorRef: ChangeDetectorRef,
    private deleteFileFromAwsGQL: DeleteFileFromAwsGQL,
    private integrationAppsService: IntegrationAppsService,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.integrationAppsService.findPluginByURL(this.location.path()).subscribe();
    this.sharedService.navigating$ = false;
  }

  ngOnInit(): void {
    this.salesService.salesIntegration$.pipe(takeUntil(this.unsubscribeAll)).subscribe((sales) => {
      this.sales = sales;
      this.salesForm = this.formBuilder.group({
        picture: this.formBuilder.group({
          baseUrl: [sales?.picture?.baseUrl || ''],
          path: [sales?.picture?.path || ''],
        }),
        document: this.formBuilder.group({
          quotation: this.formBuilder.group({
            reference: [sales?.document.quotation.reference || DocumentReferenceModelEnum.WITHOUT_PREFIX],
            prefix: [sales?.document.quotation?.prefix || ''],
            label: [sales?.document.quotation?.label || ''],
            color: [sales?.document.quotation?.color || ''],
            note: [sales?.document.quotation?.note || ''],
            validity: this.formBuilder.group({
              period: [sales?.document.quotation.validity?.period || ''],
              cycle: [sales?.document.quotation.validity?.cycle || ''],
            }),
          }),
          order: this.formBuilder.group({
            reference: [sales?.document.order.reference || DocumentReferenceModelEnum.WITHOUT_PREFIX],
            label: [sales?.document.order?.label || ''],
            prefix: [sales?.document.order?.prefix || ''],
            color: [sales?.document.order?.color || ''],
            note: [sales?.document.order?.note || ''],
            validity: this.formBuilder.group({
              period: [sales?.document.order.validity?.period || ''],
              cycle: [sales?.document.order.validity?.cycle || ''],
            }),
          }),
          invoice: this.formBuilder.group({
            reference: [sales?.document.invoice.reference || DocumentReferenceModelEnum.WITHOUT_PREFIX],
            label: [sales?.document.invoice?.label || ''],
            prefix: [sales?.document.invoice?.prefix || ''],
            color: [sales?.document.invoice?.color || ''],
            note: [sales?.document.invoice?.note || ''],
            validity: this.formBuilder.group({
              period: [sales?.document.invoice.validity?.period || ''],
              cycle: [sales?.document.invoice.validity?.cycle || ''],
            }),
          }),
          deliveryNote: this.formBuilder.group({
            reference: [sales?.document.deliveryNote.reference || DocumentReferenceModelEnum.WITHOUT_PREFIX],
            label: [sales?.document.deliveryNote?.label || ''],
            prefix: [sales?.document.deliveryNote?.prefix || ''],
            color: [sales?.document.deliveryNote?.color || ''],
            note: [sales?.document.deliveryNote?.note || ''],
            validity: this.formBuilder.group({
              period: [sales?.document.deliveryNote.validity?.period || ''],
              cycle: [sales?.document.deliveryNote.validity?.cycle || ''],
            }),
          }),
          issueNote: this.formBuilder.group({
            reference: [sales?.document.issueNote.reference || DocumentReferenceModelEnum.WITHOUT_PREFIX],
            label: [sales?.document.issueNote?.label || ''],
            prefix: [sales?.document.issueNote?.prefix || ''],
            color: [sales?.document.issueNote?.color || ''],
            note: [sales?.document.issueNote?.note || ''],
            validity: this.formBuilder.group({
              period: [sales?.document.issueNote.validity?.period || ''],
              cycle: [sales?.document.issueNote.validity?.cycle || ''],
            }),
          }),
        }),
        multicurrency: this.formBuilder.group({
          active: [this.sales?.multicurrency?.active || true],
          currencies: this.formBuilder.array(
            this?.sales?.multicurrency?.currencies?.length
              ? map(this?.sales?.multicurrency?.currencies, (curr) => {
                  return this.formBuilder.group({
                    default: [curr?.default || false],
                    currency: [curr?.currency],
                  });
                })
              : [
                  this.formBuilder.group({
                    default: [false],
                    currency: [undefined],
                  }),
                ],
          ),
        }),
      });
      const quotationValues = this.salesForm?.get(['document', 'quotation']).value;
      this.salesForm
        ?.get(['document', 'quotation'])
        ?.valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((val): void => {
          this.isQuotationButtonDisabled = isEqual(val, quotationValues);
          this.isSettingsButtonDisabled = false;
        });
      const orderValues = this.salesForm?.get(['document', 'order']).value;
      this.salesForm
        ?.get(['document', 'order'])
        ?.valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((val): void => {
          this.isOrderButtonDisabled = isEqual(val, orderValues);
          this.isSettingsButtonDisabled = false;
        });
      const invoiceValues = this.salesForm?.get(['document', 'invoice']).value;
      this.salesForm
        ?.get(['document', 'invoice'])
        ?.valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((val): void => {
          this.isInvoiceButtonDisabled = isEqual(val, invoiceValues);
          this.isSettingsButtonDisabled = false;
        });
      const deliveryNoteValues = this.salesForm?.get(['document', 'deliveryNote']).value;
      this.salesForm
        ?.get(['document', 'deliveryNote'])
        ?.valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((val): void => {
          this.isDeliveryNoteButtonDisabled = isEqual(val, deliveryNoteValues);
          this.isSettingsButtonDisabled = false;
        });
      const issueNoteValues = this.salesForm?.get(['document', 'issueNote']).value;
      this.salesForm
        ?.get(['document', 'issueNote'])
        ?.valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((val): void => {
          this.isIssueNoteButtonDisabled = isEqual(val, issueNoteValues);
          this.isSettingsButtonDisabled = false;
        });

      this.salesForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((ivalues) => {
        this.isButtonDisabled = isEqual(ivalues, this.initialValues);
      });
      this.changeDetectorRef.markForCheck();
    });
  }

  ngAfterViewInit() {
    this.posService.findCurrenciesPagination().subscribe((res) => {
      if (res) {
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  removePicture() {
    const fileName = this.salesForm.get('picture').value.path;
    this.deleteFileFromAwsGQL.fetch({ fileName }).subscribe(({ data }) => {
      if (data.deleteFileFromAws) {
        this.salesForm.get('picture').patchValue({
          baseUrl: '',
          path: '',
        });
        const input: any = {
          picture: this.salesForm.get('picture').value,
        };
        this.updateSalesIntegration(input);
        this.changeDetectorRef.markForCheck();
      }
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
          this.salesForm.get('picture').patchValue([
            {
              path: picture.path,
              baseUrl: picture.baseUrl,
            },
          ]);
          const input: any = {
            picture: {
              path: picture.path,
              baseUrl: picture.baseUrl,
            },
          };
          this.updateSalesIntegration(input);
          this.changeDetectorRef.markForCheck();
        });
    };
    fileInput.click();
  }

  loadMoreCurrencies() {
    this.posService.isLastCurrencies$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.posService.currenciesPageIndex++;
        this.posService.findCurrenciesPagination().subscribe();
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

  updateSales(field: string) {
    this.isSettingsButtonDisabled = true;
    const arg = {
      document: {
        ...(field === 'quotation'
          ? { quotation: this.salesForm.get(['document', 'quotation']).value }
          : field === 'order'
          ? { order: this.salesForm.get(['document', 'order']).value }
          : field === 'invoice'
          ? { invoice: this.salesForm.get(['document', 'invoice']).value }
          : field === 'deliveryNote'
          ? { deliveryNote: this.salesForm.get(['document', 'deliveryNote']).value }
          : { issueNote: this.salesForm.get(['document', 'issueNote']).value }),
      },
    };
    this.updateSalesIntegration(arg);
  }

  onChangeStatus(checked: boolean) {
    const input: any = {
      multicurrency: {
        active: checked,
      },
    };
    this.updateSales(input);
  }

  save() {
    const input: any = {
      multicurrency: {
        currencies: [
          ...map(this.currencies.value, (currency) => {
            return {
              currency: currency?.currency.id,
              default: currency?.default,
            };
          }),
        ],
      },
    };
    this.updateSalesIntegration(input);
  }

  deleteCurrency() {
    let currencies: WebsiteIntegrationMulticurrencyCurrencyType[] = [];
    currencies = filter(this.sales?.multicurrency?.currencies, (item) => item?.currency.id !== this.selectedCurrency?.currency?.id);
    const input: any = {
      multicurrency: {
        currencies: [
          ...map(currencies, (currency) => {
            return {
              currency: currency?.currency.id,
              default: currency?.default,
            };
          }),
        ],
      },
    };
    this.updateSalesIntegration(input);
  }

  openDeleteModal(content: any, currency: WebsiteIntegrationMulticurrencyCurrencyType) {
    this.selectedCurrency = currency;
    this.modalService.open(content, { size: 'md', centered: true });
  }

  onChangeField(checked: boolean, index: number) {
    this.sales.multicurrency.currencies[index].default = checked;
    const input: any = {
      multicurrency: {
        ...this.sales.multicurrency,
        currencies: [
          ...map(this.sales.multicurrency.currencies, (currency) => {
            return {
              currency: currency?.currency.id,
              default: currency?.default,
            };
          }),
        ],
      },
    };
    this.updateSalesIntegration(input);
  }

  onCheckStatus(currencies: WebsiteIntegrationMulticurrencyCurrencyType[]) {
    if (currencies?.length) {
      return every(currencies, (currency) => currency?.default === false);
    }
  }

  updateSalesIntegration(input: any) {
    this.salesService
      .updateSalesIntegration(this.sales.id, input)
      .pipe(
        catchError(() => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.isButtonDisabled = true;
          this.isQuotationButtonDisabled = true;
          this.isOrderButtonDisabled = true;
          this.isInvoiceButtonDisabled = true;
          this.isDeliveryNoteButtonDisabled = true;
          this.isIssueNoteButtonDisabled = true;
          this.position();
          this.modalService.dismissAll();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  openIntegrationModal(content: any) {
    this.modalService.open(content, { centered: true });
  }

  removeCurrencyField(index: number): void {
    this.currencies.removeAt(index);
    this.changeDetectorRef.markForCheck();
  }

  addCurrencyField(): void {
    const CurrencyFormGroup = this.formBuilder.group({
      currency: [undefined],
      default: [false],
    });
    this.currencies.push(CurrencyFormGroup);
    this.changeDetectorRef.markForCheck();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
