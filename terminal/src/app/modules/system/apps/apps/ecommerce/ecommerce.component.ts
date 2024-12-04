import Swal from 'sweetalert2';
import CryptoJS from 'crypto-js';
import { Location } from '@angular/common';
import { Clipboard } from '@angular/cdk/clipboard';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgbModal, NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { filter, find, forEach, groupBy, includes, isEqual, map, sortBy, values } from 'lodash';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable, Subject, catchError, combineLatest, debounceTime, distinctUntilChanged, of, switchMap, take, takeUntil } from 'rxjs';

import { OrderSettingsFullType, OrderSettingsInput, OrderSettingsUpdateInput, PartnershipNetworkType, PartnershipTypeEnum } from '@sifca-monorepo/terminal-generator';
import {
  StateType,
  PluginType,
  CountryType,
  SmsActionEnum,
  PointOfSaleType,
  EmailTemplateTypeEnum,
  CorporateEmailTemplateType,
} from '@sifca-monorepo/terminal-generator';
import { LanguageType, SmsIntegrationType } from '@sifca-monorepo/terminal-generator';

import { FormHelper } from '@diktup/frontend/helpers';
import { IPagination } from '@diktup/frontend/models';

import { EcommerceService } from './ecommerce.service';
import { IntegrationAppsService } from '../../apps.service';
import { QuestTypeService } from '../campaigns/campaigns.service';
import { PosService } from '../../../../../core/services/pos.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { SmsIntegrationService } from '../sms-integration/sms-integration.service';

@Component({
  selector: 'sales',
  templateUrl: './ecommerce.component.html',
  styleUrls: ['./ecommerce.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EcommerceComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  posId: string;
  initValues: any;
  htmlText: string;
  initialValues: any;
  states: StateType[];
  pageChanged: boolean;
  selectedPartner: any;
  pos: PointOfSaleType;
  orderForm: FormGroup;
  filtereditems: any[];
  emailForm: FormGroup;
  partnerForm: FormGroup;
  partnerInitValues: any;
  loadingPicture = false;
  selectedNav = 'Pickup';
  isVisibleCode: boolean;
  buttonDisabled: boolean;
  sanitizedHtml: SafeHtml;
  countries: CountryType[];
  integrationForm: FormGroup;
  isSmsButtonDisabled = true;
  isFeesButtonDisabled = true;
  breadCrumbItems!: Array<{}>;
  selectedCountry: CountryType;
  isEmailButtonDisabled = true;
  navs = ['Pickup', 'Delivery'];
  currentLanguage: LanguageType;
  isPartnerButtonDisabled = true;
  isLocationButtonDisabled = true;
  integration: SmsIntegrationType;
  originalStates: StateType[] = [];
  orderSettings: OrderSettingsFullType;
  emails: CorporateEmailTemplateType[];
  originalCountries: CountryType[] = [];
  selectedEmail: CorporateEmailTemplateType;
  filteredEmailNames: EmailTemplateTypeEnum[];
  partnershipMarketplacePagination: IPagination;
  stateSearchInput$: Subject<string> = new Subject<string>();
  countrySearchInput$: Subject<string> = new Subject<string>();
  isLast$: Observable<boolean> = this.ecommerceService.isLast$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  plugin$: Observable<PluginType> = this.integrationAppsService.plugin$;
  loadingEmails$: Observable<boolean> = this.ecommerceService.loadingEmails$;
  emails$: Observable<CorporateEmailTemplateType[]> = this.ecommerceService.emails$;
  loadingPartnership$: Observable<boolean> = this.questTypeService.loadingPartnership$;
  smsIntegration$: Observable<SmsIntegrationType> = this.integrationService.smsIntegration$;
  loadingSmsIntegration$: Observable<boolean> = this.integrationService.loadingSmsIntegration$;
  partnership$: Observable<PartnershipNetworkType[]> = this.questTypeService.partnershipMarketplace$;
  emailNames = [
    EmailTemplateTypeEnum.INVOICE,
    EmailTemplateTypeEnum.ARTICLE_DELIVERED,
    EmailTemplateTypeEnum.ARTICLE_READY_FOR_PICKUP,
    EmailTemplateTypeEnum.ARTICLE_CANCELED,
    EmailTemplateTypeEnum.ARTICLE_CONFIRMED,
  ];
  definitions = [
    SmsActionEnum.ORDER_CREATED,
    SmsActionEnum.PRODUCT_CONFIRMED,
    SmsActionEnum.PRODUCT_DELIVERED,
    SmsActionEnum.PRODUCT_CANCELED,
    SmsActionEnum.PRODUCT_PICKUP_READY,
  ];
  defaultLanguage: any = {
    name: 'Default',
    id: '1',
  };
  isUrlButtonDisabled = true;

  get countryArray() {
    return this.orderForm.get('countryArray') as FormArray;
  }

  get extraFees() {
    return this.orderForm.get('extraFees') as FormArray;
  }

  get actions(): FormArray {
    return this.integrationForm?.get('actions') as FormArray;
  }
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private location: Location,
    private clipboard: Clipboard,
    private posService: PosService,
    private modalService: NgbModal,
    private sanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private sharedService: SharedService,
    private questTypeService: QuestTypeService,
    private ecommerceService: EcommerceService,
    private changeDetectorRef: ChangeDetectorRef,
    private integrationService: SmsIntegrationService,
    private integrationAppsService: IntegrationAppsService,
  ) {
    this.currentLanguage = this.defaultLanguage;
    this.integrationAppsService.findPluginByURL(this.location.path()).subscribe();
    this.breadCrumbItems = [{ label: 'Pages' }, { label: 'Gallery', active: true }];
    combineLatest([
      this.ecommerceService.emails$,
      this.posService.pos$,
      this.integrationService.smsIntegration$,
      this.ecommerceService.orderSettings$,
    ]).subscribe(([emails, pos, smsIntegration, orderSettings]) => {
      this.emails = emails;
      if (pos) {
        this.pos = pos;
      }
      this.selectedEmail = find(emails, (email) => this.selectedEmail?.id === email?.id) || emails[0];
      if (this.selectedEmail) {
        const bytes = CryptoJS?.enc?.Base64?.parse(this.selectedEmail?.content);
        this.htmlText = CryptoJS?.enc?.Utf8?.stringify(bytes);
        this.sanitizedHtml = this.sanitizer?.bypassSecurityTrustHtml(this.htmlText);
      }
      this.emailForm = this.formBuilder.group({
        name: [this.selectedEmail?.name || undefined, Validators.required],
        content: [this.htmlText || '', Validators.required],
      });
      this.initialValues = this.emailForm.value;
      this.emailForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
        this.isEmailButtonDisabled = isEqual(this.initialValues, values);
      });
      this.emails = filter(
        emails,
        (email) =>
          email?.name === 'INVOICE' ||
          email?.name === 'ARTICLE_DELIVERED' ||
          email?.name === 'ARTICLE_READY_FOR_PICKUP' ||
          email?.name === 'ARTICLE_CANCELED' ||
          email?.name === 'ARTICLE_CONFIRMED',
      );
      this.filteredEmailNames = this.emailNames.filter((name) => {
        return !this.emails.some((email) => email.name === name);
      });
      if (orderSettings) {
        this.orderSettings = orderSettings;
        const groupedByCountry = groupBy(this.orderSettings?.deliveryStates, 'country.id');
        this.filtereditems = values(groupedByCountry);
        this.orderForm = this.formBuilder.group({
          import: this.formBuilder.group({
            url: [orderSettings?.import?.url],
          }),
          countryArray: this.formBuilder.array(
            this.orderSettings?.deliveryCountries?.length
              ? map(this.filtereditems, (items) => {
                  return this.formBuilder.group({
                    country: [items[0]?.country, Validators.required],
                    state: [map(items), Validators.required],
                  });
                })
              : [
                  this.formBuilder.group({
                    country: [undefined, Validators.required],
                    state: [undefined, Validators.required],
                  }),
                ],
          ),
          extraFees: this.formBuilder.array(
            this.orderSettings?.extraFees?.length
              ? map(this.orderSettings?.extraFees, (fee) => {
                  return this.formBuilder.group({
                    key: [fee?.key, Validators.required],
                    value: [fee?.value, Validators.required],
                  });
                })
              : [
                  this.formBuilder.group({
                    key: [undefined, Validators.required],
                    value: [undefined, Validators.required],
                  }),
                ],
          ),
        });
        this.initValues = this.orderForm.value;
        this.orderForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((newData: any) => {
          this.isLocationButtonDisabled = isEqual(this.initValues?.countryArray, newData?.countryArray);
          this.isFeesButtonDisabled = isEqual(this.initValues?.extraFees, newData?.extraFees);
          this.isUrlButtonDisabled = isEqual(this.initValues?.import?.url, newData?.import?.url);
        });
        this.changeDetectorRef.markForCheck();
      }
      if (smsIntegration) {
        this.integration = smsIntegration;
        this.integrationForm = this.formBuilder.group({
          actions: this.formBuilder.array(
            map(this.definitions, (def, i: number) => {
              const defualtAction = find(this.integration?.actions, { definition: def });
              return this.formBuilder.group({
                definition: [
                  def === SmsActionEnum?.ORDER_CREATED
                    ? 'Order Created'
                    : def === SmsActionEnum?.PRODUCT_CONFIRMED
                    ? 'Product Confirmed'
                    : def === SmsActionEnum?.PRODUCT_DELIVERED
                    ? 'Product Delivered'
                    : def === SmsActionEnum?.PRODUCT_CANCELED
                    ? 'Product Canceled'
                    : def === SmsActionEnum?.PRODUCT_PICKUP_READY
                    ? 'Product Pickup Ready'
                    : '',
                ],
                enabled: [defualtAction?.enabled === true ? true : false],
                content: [defualtAction?.content || ''],
              });
            }),
          ),
        });
        const initialValues = this.integrationForm.value;
        this.integrationForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val) => {
          this.isSmsButtonDisabled = isEqual(val, initialValues);
        });
      }
    });
    this.questTypeService.partnershipMarketplacePagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.partnershipMarketplacePagination = {
        length: pagination?.length,
        page: this.questTypeService.partnershipMarketplacePageIndex || 0,
        size: this.questTypeService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.questTypeService.partnershipMarketplacePageIndex || 0) * this.questTypeService.pageLimit,
        endIndex: Math.min(
          ((this.questTypeService.partnershipMarketplacePageIndex || 0) + 1) * this.questTypeService.pageLimit - 1,
          pagination?.length - 1,
        ),
      };
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    this.posService.pos$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pos) => {
      this.posId = pos?.id;
    });
    this.posService?.infiniteStates$.pipe(takeUntil(this.unsubscribeAll)).subscribe((states) => {
      this.states = states;
      this.states = sortBy(states, ['name']);
      this.changeDetectorRef.markForCheck();
    });
    this.stateSearchInput$
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchString) => {
          this.filterStates(searchString);
          return of(this.states);
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });

    this.countrySearchInput$
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchString) => {
          this.filterCountries(searchString);
          return of(this.countries);
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  ngAfterViewInit() {
    this.questTypeService.getPartnershipNetworksByTargetAndPartnershipPagination(PartnershipTypeEnum.MARKETPLACE).subscribe();
    this.posService.findCountriesPagination().subscribe((res) => {
      if (res?.length) {
        this.countries = sortBy(res, ['name']);
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  onChangeImport(enable: boolean) {
    this.updateOrderSettings(this.orderSettings.id, { import: { enable } });
  }

  saveImport() {
    this.isUrlButtonDisabled = true;
    this.updateOrderSettings(this.orderSettings.id, { import: { url: this.orderForm.get(['import', 'url']).value } });
  }

  copyText(textToCopy: string) {
    this.clipboard.copy(textToCopy);
  }

  openPartnershipModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.partnerForm = this.formBuilder.group({
      partner: this.formBuilder.group({
        pos: [''],
      }),
    });
    this.partnerInitValues = this.partnerForm.value;
    this.partnerForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
      this.isPartnerButtonDisabled = isEqual(this.partnerInitValues, values);
      this.changeDetectorRef.markForCheck();
    });
  }

  deletePartnershipNetwork() {
    this.questTypeService
      .deletePartnershipNetwork(this.selectedPartner.id, PartnershipTypeEnum.MARKETPLACE)
      .pipe(
        catchError(() => {
          this.modalService.dismissAll();
          this.modalError();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.partnershipMarketplacePagination.length--;
          this.partnershipMarketplacePagination.endIndex--;
          this.modalService.dismissAll();
          this.position();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  invitePartner() {
    let errorMessage;
    this.isPartnerButtonDisabled = true;
    const input: any = {
      ...FormHelper.getChangedValues(this.partnerForm.value, this.partnerInitValues),
      partnership: [PartnershipTypeEnum.MARKETPLACE],
    };
    this.questTypeService
      .invitePartnerToNetwork(input)
      .pipe(
        catchError((error) => {
          this.translate.get(['SHARED.SHOULD_NOT_BE_EQUAL', 'SHARED.DIFFERENT_VALUE']).subscribe((translations) => {
            const errorMessageResponse = error.graphQLErrors?.[0]?.extensions?.response?.message?.[0];
            const exceptionError = error.graphQLErrors?.[0]?.extensions?.exception?.response?.error;
            if (errorMessageResponse && includes(errorMessageResponse, translations['SHARED.SHOULD_NOT_BE_EQUAL'])) {
              errorMessage = translations['SHARED.DIFFERENT_VALUE'];
            } else if (exceptionError) {
              errorMessage = exceptionError;
            }
            this.modalError(errorMessage);
          });
          this.modalService.dismissAll();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.position();
          this.modalService.dismissAll();
          this.partnershipMarketplacePagination.length++;
          this.partnershipMarketplacePagination.endIndex++;
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  openPartnerDeleteModal(content: any, partner) {
    this.selectedPartner = partner;
    this.modalService.open(content, { centered: true });
  }

  onPageChange(page: number) {
    this.page = page;
    if (page > 1) {
      this.pageChanged = true;
    }
    this.questTypeService.advertiserPageIndex = page - 1;
    if (this.pageChanged) {
      this.questTypeService.getPartnershipNetworksByTargetAndPartnershipPagination(PartnershipTypeEnum.ADVERTISER).subscribe();
    }
  }

  saveIntegration() {
    const input: any = [
      ...map(this.actions?.value, (action) => {
        return {
          ...action,
          definition:
            action?.definition === 'Order Created'
              ? SmsActionEnum?.ORDER_CREATED
              : action?.definition === 'Product Confirmed'
              ? SmsActionEnum?.PRODUCT_CONFIRMED
              : action?.definition === 'Product Delivered'
              ? SmsActionEnum?.PRODUCT_DELIVERED
              : action?.definition === 'Product Canceled'
              ? SmsActionEnum?.PRODUCT_CANCELED
              : action?.definition === 'Product Pickup Ready'
              ? SmsActionEnum?.PRODUCT_PICKUP_READY
              : '',
        };
      }),
    ];

    this.isSmsButtonDisabled = true;
    this.integrationService
      .updateSmsIntegration(this.integration?.id, { actions: input })
      .pipe(
        catchError(() => {
          this.modalService.dismissAll();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.position();
          this.currentLanguage = this.defaultLanguage;
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  openDeleteModal(content: any, email: CorporateEmailTemplateType) {
    this.selectedEmail = email;
    this.modalService.open(content, { centered: true });
  }

  onShowCode(checked: boolean) {
    this.isVisibleCode = checked ? true : false;
    const bytes = CryptoJS.enc.Base64.parse(this.selectedEmail?.content);
    this.htmlText = CryptoJS.enc.Utf8.stringify(bytes);
    this.emailForm.get('content').patchValue(this.htmlText);
  }

  openDeleteEmailModal(content: any, email: CorporateEmailTemplateType) {
    this.selectedEmail = email;
    this.modalService.open(content, { centered: true });
  }

  deleteCorporateEmailTemplate() {
    this.ecommerceService
      .deleteCorporateEmailTemplate(this.selectedEmail?.id)
      .pipe(
        catchError(() => {
          this.modalService.dismissAll();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.modalService.dismissAll();
          this.position();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  openEmailModal(content: any, email: CorporateEmailTemplateType) {
    this.selectedEmail = email;
    this.emailForm.get('name').patchValue(undefined);
    if (this.selectedEmail) {
      const bytes = CryptoJS.enc.Base64.parse(this.selectedEmail?.content);
      this.htmlText = CryptoJS.enc.Utf8.stringify(bytes);
      this.emailForm.get('content').patchValue(this.htmlText);
    } else {
      this.emailForm.get('content').patchValue('');
    }
    this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
    });
  }

  saveEmail() {
    let input: any;
    this.isEmailButtonDisabled = true;
    const textToEncode = this.emailForm.get('content').value;
    const base64String = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(textToEncode));
    input = {
      ...FormHelper.getNonEmptyValues(this.emailForm.value),
      content: base64String,
    };
    if (!this.selectedEmail) {
      this.ecommerceService
        .createCorporateEmailTemplate(input)
        .pipe(
          catchError(() => {
            this.modalService.dismissAll();
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.modalService.dismissAll();
            this.position();
            this.changeDetectorRef.markForCheck();
          }
        });
    } else {
      this.ecommerceService
        .updateCorporateEmailTemplate(this.selectedEmail?.id, input)
        .pipe(
          catchError(() => {
            this.modalService.dismissAll();
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.modalService.dismissAll();
            this.position();
            this.changeDetectorRef.markForCheck();
          }
        });
    }
  }

  selectTemplate(email: CorporateEmailTemplateType) {
    this.selectedEmail = email;
    const bytes = CryptoJS.enc.Base64.parse(email?.content);
    this.htmlText = CryptoJS.enc.Utf8.stringify(bytes);
    this.sanitizedHtml = this.sanitizer.bypassSecurityTrustHtml(this.htmlText);
    this.emailForm.get('content').patchValue(this.htmlText);
    this.emailForm.get('name').patchValue(email?.name);
    this.initialValues = this.emailForm.value;
    this.isEmailButtonDisabled = true;
    this.changeDetectorRef.markForCheck();
  }

  removeFeesField(index: number): void {
    (this.extraFees as FormArray).removeAt(index);
    this.changeDetectorRef.markForCheck();
  }

  addFeesField() {
    const keyFormGroup = this.formBuilder.group({
      key: [undefined, Validators.required],
      value: [undefined, Validators.required],
    });
    (this.extraFees as FormArray).push(keyFormGroup);
    this.changeDetectorRef.markForCheck();
  }

  filterStates(searchTerm: string) {
    if (!this.originalStates.length) {
      this.originalStates = [...this.states];
    }
    this.states = filter(this.originalStates, (state) => state.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }

  filterCountries(searchTerm: string) {
    if (!this.originalCountries.length) {
      this.originalCountries = [...this.countries];
    }
    this.countries = filter(this.originalCountries, (country) => country.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }

  onChangeState(index: number) {
    let initialId: string;
    initialId = this.selectedCountry?.id;
    this.selectedCountry = this.countryArray.value[index]?.country;
    if (initialId !== this.selectedCountry?.id && this.selectedCountry?.id) {
      setTimeout(() => {
        this.posService.infiniteStates$ = null;
        this.posService.statesPageIndex = 0;
      });
      this.posService.findStatesByCountryPagination(this.selectedCountry?.id).subscribe();
    }
  }

  save() {
    let countries = [];
    let states = [];
    forEach(this.countryArray.value, (item) => {
      countries.push(item?.country?.id);
      states.push(...map(item?.state, 'id'));
      return {
        deliveryCountries: countries,
        deliveryStates: states,
      };
    });
    const input: any = {
      deliveryCountries: countries,
      deliveryStates: states,
    };
    this.updateOrderSettings(this.orderSettings?.id, input);
  }

  saveExtraFees() {
    this.isFeesButtonDisabled = true;
    const input: any = {
      extraFees: this.extraFees.value,
    };
    this.updateOrderSettings(this.orderSettings?.id, input);
  }

  removeField(index: number): void {
    (this.countryArray as FormArray).removeAt(index);
    this.changeDetectorRef.markForCheck();
  }

  addField() {
    this.posService.infiniteStates$ = null;
    const keyFormGroup = this.formBuilder.group({
      country: [undefined, Validators.required],
      state: [undefined, Validators.required],
    });
    (this.countryArray as FormArray).push(keyFormGroup);
    this.changeDetectorRef.markForCheck();
  }

  onChangeCountry(country: CountryType, index: number) {
    this.posService.statesPageIndex = 0;
    this.posService.infiniteStates$ = null;
    (this.countryArray as FormArray).at(index).get('state').reset();
    this.selectedCountry = country;
    if (country) {
      this.posService.findStatesByCountryPagination(country?.id).subscribe();
    }
  }

  loadMoreStates() {
    this.posService.isLastStates$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.posService.statesPageIndex++;
        this.posService.findStatesByCountryPagination(this.selectedCountry?.id).subscribe();
      }
    });
  }

  onNavChange(changeEvent: NgbNavChangeEvent) {
    this.selectedNav = changeEvent.nextId;
  }

  updateOrderSettings(id: string, orderSettings: OrderSettingsUpdateInput): void {
    this.isLocationButtonDisabled = true;
    this.ecommerceService
      .updateOrderSettings(id, orderSettings)
      .pipe(
        catchError(() => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res: any) => {
        if (res) {
          this.position();
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

  modalError(text?: string) {
    this.translate.get('MENUITEMS.TS.STH_WENT_WRONG').subscribe((sthWentWrong: string) => {
      Swal.fire({
        title: 'Oops...',
        text: text ? text : sthWentWrong,
        icon: 'warning',
        showCancelButton: false,
        confirmButtonColor: 'rgb(3, 142, 220)',
        cancelButtonColor: 'rgb(243, 78, 78)',
      });
    });
  }

  createOrderSettings(orderSettings: OrderSettingsInput): void {
    this.ecommerceService.createOrderSettings(orderSettings).subscribe((res: any) => {
      if (res.data) {
        this.isLocationButtonDisabled = true;
      }
    });
  }

  updateField(datas: any): void {
    this.ecommerceService.updateOrderSettings(this.orderSettings.id, { ...datas }).subscribe();
  }

  ngOnDestroy(): void {
    this.posService.infiniteCountries$ = null;
    this.posService.infiniteStates$ = null;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
