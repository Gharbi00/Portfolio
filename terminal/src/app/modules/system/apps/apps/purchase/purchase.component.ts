import Swal from 'sweetalert2';
import { DOCUMENT, Location } from '@angular/common';
import { every, filter, isEqual, map, values } from 'lodash';
import { catchError, Observable, of, Subject, take, takeUntil } from 'rxjs';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';

import {
  PluginType,
  CompanyType,
  CountryType,
  DocumentReferenceModelEnum,
  WebsiteIntegrationMulticurrencyCurrencyType,
  GenerateS3SignedUrlGQL,
  DeleteFileFromAwsGQL,
} from '@sifca-monorepo/terminal-generator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { CurrencyType, PurchaseIntegrationType } from '@sifca-monorepo/terminal-generator';

import { PurchaseService } from './purchase.service';
import { IntegrationAppsService } from '../../apps.service';
import { AWS_CREDENTIALS } from '../../../../../../environments/environment';
import { AmazonS3Helper, StorageHelper } from '@diktup/frontend/helpers';
import { SharedService } from '../../../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { PosService } from '../../../../../core/services/pos.service';

@Component({
  selector: 'sifca-monorepo-purchase',
  templateUrl: './purchase.component.html',
  styleUrls: ['./purchase.component.scss'],
})
export class PurchaseComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  initialValues: any;
  purchaseForm: FormGroup;
  isButtonDisabled = true;
  countries: CountryType[];
  selectedCompany: CompanyType;
  isOrderButtonDisabled = true;
  isInvoiceButtonDisabled = true;
  isSettingsButtonDisabled = false;
  isInventoryButtonDisabled = true;
  purchase: PurchaseIntegrationType;
  isDeliveryNoteButtonDisabled = true;
  DocumentReferences = values(DocumentReferenceModelEnum);
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  plugin$: Observable<PluginType> = this.integrationAppsService.plugin$;
  currencies$: Observable<CurrencyType[]> = this.posService?.infiniteCurrencies$;
  selectedCurrency: WebsiteIntegrationMulticurrencyCurrencyType;

  get currencies(): FormArray {
    return this.purchaseForm.get(['multicurrency', 'currencies']) as FormArray;
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
    private sharedService: SharedService,
    private storageHelper: StorageHelper,
    private purchaseService: PurchaseService,
    private amazonS3Helper: AmazonS3Helper,
    private translate: TranslateService,
    private changeDetectorRef: ChangeDetectorRef,
    private integrationAppsService: IntegrationAppsService,
    private deleteFileFromAwsGQL: DeleteFileFromAwsGQL,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.integrationAppsService.findPluginByURL(this.location.path()).subscribe();
    this.sharedService.navigating$ = false;
  }

  ngOnInit(): void {
    this.purchaseService.purchaseIntegration$.pipe(takeUntil(this.unsubscribeAll)).subscribe((purchase) => {
      this.purchase = purchase;
      this.purchaseForm = this.formBuilder.group({
        picture: this.formBuilder.group({
          path: [purchase?.picture?.path || ''],
          baseUrl: [purchase?.picture?.baseUrl || ''],
        }),
        document: this.formBuilder.group({
          deliveryNote: this.formBuilder.group({
            reference: [purchase?.document?.deliveryNote?.reference || DocumentReferenceModelEnum.WITHOUT_PREFIX],
            prefix: [purchase?.document?.deliveryNote?.prefix || ''],
            note: [purchase?.document?.deliveryNote.note || ''],
          }),
          inventory: this.formBuilder.group({
            reference: [purchase?.document?.inventory?.reference || DocumentReferenceModelEnum.WITHOUT_PREFIX],
            prefix: [purchase?.document?.inventory?.prefix || ''],
            note: [purchase?.document?.inventory.note || ''],
          }),
          invoice: this.formBuilder.group({
            reference: [purchase?.document?.invoice?.reference || DocumentReferenceModelEnum.WITHOUT_PREFIX],
            prefix: [purchase?.document?.invoice?.prefix || ''],
            note: [purchase?.document?.invoice.note || ''],
          }),
          order: this.formBuilder.group({
            reference: [purchase?.document?.order?.reference || DocumentReferenceModelEnum.WITHOUT_PREFIX],
            prefix: [purchase?.document?.order?.prefix || ''],
            note: [purchase?.document?.order.note || ''],
          }),
        }),
        multicurrency: this.formBuilder.group({
          active: [this.purchase?.multicurrency?.active || true],
          currencies: this.formBuilder.array(
            this?.purchase?.multicurrency?.currencies?.length
              ? map(this?.purchase?.multicurrency?.currencies, (curr) => {
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

      const inventoryValues = this.purchaseForm?.get(['document', 'inventory']).value;
      this.purchaseForm
        ?.get(['document', 'inventory'])
        ?.valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((val): void => {
          this.isInventoryButtonDisabled = isEqual(val, inventoryValues);
        });

      const orderValues2 = this.purchaseForm?.get(['document', 'order']).value;
      this.purchaseForm
        ?.get(['document', 'order'])
        ?.valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((val): void => {
          this.isOrderButtonDisabled = isEqual(val, orderValues2);
          this.isSettingsButtonDisabled = false;
        });

      const invoiceValuesValues2 = this.purchaseForm?.get(['document', 'invoice']).value;
      this.purchaseForm
        ?.get(['document', 'invoice'])
        ?.valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((val): void => {
          this.isInvoiceButtonDisabled = isEqual(val, invoiceValuesValues2);
          this.isSettingsButtonDisabled = false;
        });

      const deliveryNoteValuesValues2 = this.purchaseForm?.get(['document', 'deliveryNote']).value;
      this.purchaseForm
        ?.get(['document', 'deliveryNote'])
        ?.valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((val): void => {
          this.isDeliveryNoteButtonDisabled = isEqual(val, deliveryNoteValuesValues2);
          this.isSettingsButtonDisabled = false;
        });
      this.purchaseForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((ivalues) => {
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

  updatePurchase(field: string) {
    this.isSettingsButtonDisabled = true;
    const arg = {
      document: {
        ...(field === 'inventory'
          ? { inventory: this.purchaseForm.get(['document', 'inventory']).value }
          : field === 'order'
          ? { order: this.purchaseForm.get(['document', 'order']).value }
          : field === 'invoice'
          ? { invoice: this.purchaseForm.get(['document', 'invoice']).value }
          : { deliveryNote: this.purchaseForm.get(['document', 'deliveryNote']).value }),
      },
    };
    this.updatePurchaseIntegration(arg);
  }

  onChangeStatus(checked: boolean) {
    const input: any = {
      multicurrency: {
        active: checked,
      },
    };
    this.updatePurchase(input);
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
    this.updatePurchaseIntegration(input);
  }

  deleteCurrency() {
    let currencies: WebsiteIntegrationMulticurrencyCurrencyType[] = [];
    currencies = filter(this.purchase?.multicurrency?.currencies, (item) => item?.currency.id !== this.selectedCurrency?.currency?.id);
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
    this.updatePurchaseIntegration(input);
  }

  openDeleteModal(content: any, currency: WebsiteIntegrationMulticurrencyCurrencyType) {
    this.selectedCurrency = currency;
    this.modalService.open(content, { size: 'md', centered: true });
  }

  onChangeField(checked: boolean, index: number) {
    this.purchase.multicurrency.currencies[index].default = checked;
    const input: any = {
      multicurrency: {
        ...this.purchase.multicurrency,
        currencies: [
          ...map(this.purchase.multicurrency.currencies, (currency) => {
            return {
              currency: currency?.currency.id,
              default: currency?.default,
            };
          }),
        ],
      },
    };
    this.updatePurchaseIntegration(input);
  }

  onCheckStatus(currencies: WebsiteIntegrationMulticurrencyCurrencyType[]) {
    if (currencies?.length) {
      return every(currencies, (currency) => currency?.default === false);
    }
  }

  removePicture() {
    const fileName = this.purchaseForm.get(['picture', 'path']).value;
    this.deleteFileFromAwsGQL.fetch({ fileName }).subscribe(({ data }) => {
      if (data.deleteFileFromAws) {
        this.purchaseForm.get('picture').patchValue({
          baseUrl: '',
          path: '',
        });
        const input: any = {
          picture: this.purchaseForm.get('picture').value,
        };
        this.updatePurchaseIntegration(input);
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
          this.purchaseForm.get('picture').patchValue([
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
          this.updatePurchaseIntegration(input);
          this.changeDetectorRef.markForCheck();
        });
    };
    fileInput.click();
  }

  updatePurchaseIntegration(input: any) {
    this.purchaseService
      .updatePurchaseIntegration(this.purchase.id, input)
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
          this.isInventoryButtonDisabled = true;
          this.isOrderButtonDisabled = true;
          this.isInvoiceButtonDisabled = true;
          this.isDeliveryNoteButtonDisabled = true;
          this.isSettingsButtonDisabled = true;
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
      currency: [undefined, Validators.required],
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
