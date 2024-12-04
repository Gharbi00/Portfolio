import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbNav, NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable, Subject, combineLatest, of, throwError } from 'rxjs';
import { cloneDeep, find, forEach, groupBy, isEqual, keys, map, omit, pickBy, sum, values } from 'lodash';
import { catchError, debounceTime, distinctUntilChanged, map as rxMap, switchMap, take, takeUntil } from 'rxjs/operators';
import { ViewEncapsulation, ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef, AfterViewInit, ViewChild } from '@angular/core';

import {
  App,
  UserRole,
  UserType,
  CountryType,
  PaymentType,
  DiscountType,
  ZoneTypesEnum,
  InstallmentType,
  PaymentStatusEnum,
  WebsiteIntegrationType,
} from '@sifca-monorepo/terminal-generator';
import {
  CountryEnum,
  OrderTypeEnum,
  FullAddressType,
  InstallmentInput,
  CorporateUserType,
  DeliveryZonesType,
  InternalProductType,
  BarcodeWithStockType,
  OrderSettingsFullType,
  MarketPlaceOrderWithCartFeesEnum,
} from '@sifca-monorepo/terminal-generator';
import { REGEX } from '@diktup/frontend/config';
import { FormHelper } from '@diktup/frontend/helpers';
import { StateType, UserExistType } from '@sifca-monorepo/terminal-generator';

import { OrdersService } from '../orders.service';
import { PosService } from '../../../../../core/services/pos.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { CustomersService } from '../../../customers/customers/customers.service';
import { BarcodeService } from '../../../../inventory/products/articles/articles.service';
import { EcommerceService } from '../../../../system/apps/apps/ecommerce/ecommerce.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'order-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersDetailsComponent implements OnInit, AfterViewInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  private amount: BehaviorSubject<number | null> = new BehaviorSubject(null);
  @ViewChild('articleSelect', { static: false }) articleSelect: NgSelectComponent;
  @ViewChild('customNav', { static: true }) navTabs: NgbNav;

  step = 1;
  index = 0;
  resAmount = 0;
  pageIndex = 0;
  toPay: number;
  addView = false;
  selectedNav = 1;
  initValues: any;
  rStrings: string;
  deliveryFees = 0;
  initialValues: any;
  deliveryView = true;
  totalLoading = false;
  isLastUsers: boolean;
  searchString: string;
  orderForm: FormGroup;
  dateNow = new Date();
  priceForm: FormGroup;
  selectedIndex: number;
  selectedShipIndex = 0;
  selectedUser: UserType;
  users: UserType[] = [];
  allStates: StateType[];
  customerForm: FormGroup;
  isButtonDisabled = true;
  shippingForm: FormGroup;
  selectedInstIndex: number;
  installmentForm: FormGroup;
  breadCrumbItems!: Array<{}>;
  allCountries: CountryType[];
  isShipButtonDisabled = true;
  isInstButtonDisabled = true;
  filteredStates: StateType[];
  selectedCountry: CountryType;
  filteredItems: StateType[][];
  isOrderButtonDisabled: boolean;
  countries = values(CountryEnum);
  filteredCountries: CountryType[];
  orderTypes = values(OrderTypeEnum);
  CalculateTotalPriceForm: FormGroup;
  cords: { lng: number; lat: number };
  discountTypes = values(DiscountType);
  selectedShipAddress: FullAddressType;
  orderSettings: OrderSettingsFullType;
  selectedInstallement: InstallmentType;
  barcodeList: InternalProductType[] = [];
  installmentsList: InstallmentInput[] = [];
  websiteIntegration: WebsiteIntegrationType;
  selectedProduct: { barcode: any; quantity: number };
  userSearchInput$: Subject<string> = new Subject<string>();
  barcodeSearchInput$: Subject<string> = new Subject<string>();
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  loadingUsers$: Observable<boolean> = this.ordersService.loadingUsers$;
  paymentMethods$: Observable<PaymentType[]> = this.posService.paymentMethods$;
  users$: Observable<CorporateUserType[]> = this.customersService.infiniteContacts$;
  barcodes$: Observable<BarcodeWithStockType[]> = this.barcodeService.infinitBarcodes$;
  totalFees = 0;
  deliveryZones: DeliveryZonesType[];
  selectedZoneIndex: number;
  selectedZone: DeliveryZonesType;

  get amount$(): Observable<number> {
    return this.amount.asObservable();
  }

  get installments() {
    return this.orderForm.get('installments') as FormArray;
  }

  get products() {
    return this.orderForm.get('products') as FormArray;
  }

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private route: Router,
    private modalService: NgbModal,
    private posService: PosService,
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private ordersService: OrdersService,
    private barcodeService: BarcodeService,
    private activatedRoute: ActivatedRoute,
    private customersService: CustomersService,
    private ecommerceService: EcommerceService,
    private translate: TranslateService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.rStrings = this.randomString(40, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
    combineLatest([
      this.posService.allStates$,
      this.posService.allCountries$,
      this.ordersService.orderSettings$,
      this.ecommerceService.deliveryZones$,
    ])
      .pipe(
        takeUntil(this.unsubscribeAll),
        switchMap(([allStates, allCountries, orderSettings, deliveryZones]: any[]) => {
          if (deliveryZones?.length) {
            this.deliveryZones = deliveryZones;
          }
          if (orderSettings) {
            this.orderSettings = orderSettings;
            this.totalFees = sum(map(this.orderSettings?.extraFees, (fees) => +fees?.value));
            if (this.orderSettings.deliveryCountries?.length) {
              this.filteredCountries = this.orderSettings.deliveryCountries;
            } else if (allStates?.length) {
              this.filteredStates = allStates;
            }
            if (this.orderSettings.deliveryStates?.length) {
            } else if (allCountries?.length) {
              this.filteredCountries = allCountries;
            }
          }
          return of(null);
        }),
        catchError(() => {
          return of(null);
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnInit(): void {
    this.customerForm = this.formBuilder.group({
      title: [''],
      about: [''],
      apps: [App.SIFCA],
      lastName: [''],
      password: [this.rStrings],
      firstName: [''],
      roles: [[UserRole.CONSUMER]],
      email: ['', [Validators.compose([Validators.required, Validators.email])]],
      residentialAddress: this.formBuilder.group({
        address: [''],
        country: [''],
        state: [''],
        postCode: [''],
        city: [''],
      }),
    });
    this.initialValues = this.customerForm.value;
    this.customerForm.valueChanges.subscribe((ivalues) => {
      this.isButtonDisabled = isEqual(ivalues, this.initialValues);
    });
    this.barcodeSearchInput$
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchString) => {
          this.barcodeService.pageIndex = 0;
          this.barcodeService.infinitBarcodes$ = null;
          this.barcodeService.searchString = searchString;
          return this.barcodeService.getBarcodesWithVarietyFilter();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
    this.userSearchInput$
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchString: any) => {
          this.customersService.pageIndex = 0;
          this.customersService.infiniteContacts$ = null;
          this.customersService.searchString.next(searchString);
          return this.customersService.searchCorporateUsersByTarget();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
    this.priceForm = this.formBuilder.group({
      toPay: [],
      totalTax: [],
      deliveryFees: ['0'],
      totalPrice: this.formBuilder.group({
        net: [],
        gross: [],
      }),
    });
    this.orderForm = this.formBuilder.group({
      user: [undefined, Validators.required],
      fees: this.formBuilder.group({
        feesType: [MarketPlaceOrderWithCartFeesEnum?.CUSTOM],
        amount: ['0'],
      }),
      orderType: ['DELIVERY', Validators.required],
      deliveryAddress: this.formBuilder.group({
        country: [''],
        state: [''],
        city: [''],
        address: [this.selectedShipAddress?.address || ''],
        postCode: [''],
        location: this.formBuilder.group({
          type: [ZoneTypesEnum.POINT],
          coordinates: [[]],
        }),
      }),
      installments: this.formBuilder.array([]),
      orderTime: [new Date()],
      discount: this.formBuilder.group({
        discountType: [],
        amount: [''],
      }),
      products: this.formBuilder.array([], Validators.required),
    });
    const initialValues = this.orderForm.value;
    this.orderForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((ivalues) => {
      this.isOrderButtonDisabled = isEqual(initialValues, ivalues);
    });
    this.amount$.subscribe((amount: number) => {
      this.resAmount = amount;
    });
  }

  ngAfterViewInit() {
    this.findCountriesAndIntegrationOrderSettingsAndDeliveryZones();
    this.customersService.searchCorporateUsersByTarget().subscribe();
  }

  onChangeCountry(country: CountryType) {
    this.posService.statesPageIndex = 0;
    this.posService.infiniteStates$ = null;
    this.selectedCountry = country;
    if (country) {
      this.posService.findStatesByCountryPagination(country?.id).subscribe();
    }
  }

  openEditAddressModal(content: any, index: number) {
    this.step = 1;
    this.selectedIndex = index;
    this.onSelectShip(index);
    this.modalService.open(content, { centered: true });
    this.shippingForm = this.formBuilder.group({
      address: [this.selectedShipAddress?.address || '', Validators.required],
      country: [this.selectedShipAddress?.country?.id || undefined, Validators.required],
      state: [this.selectedShipAddress?.state?.id || undefined, Validators.required],
      postCode: [this.selectedShipAddress?.postCode || '', Validators.required],
      city: [this.selectedShipAddress?.city || '', Validators.required],
      location: this.formBuilder.group({
        type: [ZoneTypesEnum.POINT],
        coordinates: [
          [
            this.selectedShipAddress?.location?.coordinates?.length ? this.selectedShipAddress?.location?.coordinates[0] : null,
            this.selectedShipAddress?.location?.coordinates?.length ? this.selectedShipAddress?.location?.coordinates[1] : null,
          ],
        ],
      }),
    });
    this.initValues = this.shippingForm.value;
    this.shippingForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((ivalues) => {
      this.isShipButtonDisabled = isEqual(this.initValues, ivalues);
    });
    this.shippingForm
      .get('country')
      .valueChanges.pipe(takeUntil(this.unsubscribeAll))
      .subscribe((value) => {
        this.shippingForm.get('state').patchValue(undefined);
        this.filteredStates = find(this.filteredItems, (countryArray) => countryArray.some((state) => state.country.id === value));
      });
    const groupedByCountry = groupBy(this.orderSettings?.deliveryStates, 'country.id');
    this.filteredItems = values(groupedByCountry);
    this.filteredStates = find(this.filteredItems, (countryArray) =>
      countryArray.some((state) => state.country.id === this.shippingForm?.value.country),
    );
    this.cords = {
      lng: this.selectedShipAddress?.location?.coordinates?.length ? this.selectedUser?.shippingAddress[index]?.location?.coordinates[0] : null,
      lat: this.selectedShipAddress?.location?.coordinates?.length ? this.selectedUser?.shippingAddress[index]?.location?.coordinates[1] : null,
    };
  }

  loadMoreCountries() {
    this.posService.isLastCountries$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.posService.countriesPageIndex++;
        this.posService.findCountriesPagination().subscribe();
      }
    });
  }

  onChangeDiscount(discount) {
    if (!discount) {
      this.orderForm.get('discount').reset();
    }
  }

  reviewAmount(): void {
    let products = [];
    this.totalLoading = true;
    forEach(this.products.value, (barcode) => {
      const product = {
        barcode: barcode?.id,
        // price: barcode?.price,
        quantity: barcode?.quantity,
      };
      products.push(product);
    });
    const input: any = {
      ...(this.orderForm.get('deliveryAddress').value.country
        ? {
            deliveryAddress: {
              ...FormHelper.getNonEmptyValues(omit(this.orderForm.get('deliveryAddress').value, 'location')),
              ...(this.orderForm.get('deliveryAddress').value?.location?.coordinates?.length
                ? {
                    location: {
                      type: this.orderForm.get('deliveryAddress').value?.location?.type,
                      coordinates: this.orderForm.get('deliveryAddress').value?.location?.coordinates,
                    },
                  }
                : {}),
            },
          }
        : {}),
      fees: {
        feesType: this.orderForm.get(['fees', 'feesType']).value,
        amount: this.deliveryFees.toString() || '0',
      },
      products,
      ...(this.orderSettings?.extraFees?.length ? { extraFees: this.orderSettings?.extraFees } : {}),
      orderType: this.orderForm.get('orderType').value,
      ...(this.orderForm.get(['discount', 'amount']).value
        ? {
            discount: {
              amount: this.orderForm.get(['discount', 'amount']).value.toString(),
              discountType: this.orderForm.get(['discount', 'discountType']).value,
            },
          }
        : {}),
    };
    this.ordersService.calculateTargetShoppingCart(input).subscribe((res) => {
      this.totalLoading = false;
      this.priceForm.patchValue({
        toPay: (+res.price?.toPay?.afterReduction).toFixed(3).toString(),
        totalTax: (+res.taxValue?.afterReduction).toFixed(3).toString(),
        totalPrice: {
          net: (+res.price?.net?.afterReduction).toFixed(3).toString(),
          gross: (+res.price?.gross?.afterReduction).toFixed(3).toString(),
        },
      });
      this.resAmount = this.toPay = +res.price?.toPay?.afterReduction;
      this.changeDetectorRef.markForCheck();
    });
  }

  addOrder() {
    this.isOrderButtonDisabled = true;
    const modifiedInstallmentsArray = map(this.installments.value, (installment) => {
      return {
        paymentStatus: installment?.paymentStatus,
        ...(installment?.deadline && installment?.deadline !== '' ? { deadline: installment?.deadline } : {}),
        amount: installment.amount.toString(),
        paymentMethod: installment?.paymentMethod?.id,
      };
    });
    const modifiedProducts = map(this.products.value, (prod) => {
      return {
        barcode: prod?.id,
        quantity: prod?.quantity,
      };
    });
    let currency: string;
    if (this.websiteIntegration?.multicurrency?.active === false) {
      currency = this.websiteIntegration?.multicurrency?.currencies[0]?.currency?.id;
    } else if (this.websiteIntegration?.multicurrency?.active === true) {
      // TODO to Implement later
      currency = null;
    } else {
      this.translate.get('MENUITEMS.TS.MULTICURRENCY_CONFIGURATION').subscribe((multicurrencyConfiguration: string) => {
        Swal.fire({
          title: 'Oops...',
          text: multicurrencyConfiguration,
          icon: 'warning',
          showCancelButton: false,
          confirmButtonColor: 'rgb(3, 142, 220)',
          cancelButtonColor: 'rgb(243, 78, 78)',
        });
      });
    }
    const input: any = {
      currency,
      ...(this.orderForm.get('deliveryAddress').value.country
        ? { ...omit(this.orderForm.value, 'discount', 'fees') }
        : { ...omit(this.orderForm.value, 'discount', 'deliveryAddress', 'fees') }),
      ...(this.orderForm.get('deliveryAddress').value.country
        ? {
            deliveryAddress: {
              ...FormHelper.getNonEmptyValues(omit(this.orderForm.get('deliveryAddress').value, 'location')),
              ...(this.orderForm.get('deliveryAddress').value?.location?.coordinates?.length
                ? {
                    location: {
                      type: this.orderForm.get('deliveryAddress').value?.location?.type,
                      coordinates: this.orderForm.get('deliveryAddress').value?.location?.coordinates,
                    },
                  }
                : {}),
            },
          }
        : {}),
      ...(this.orderForm.get(['discount', 'amount']).value
        ? {
            discount: {
              amount: this.orderForm.get(['discount', 'amount']).value.toString(),
              discountType: this.orderForm.get(['discount', 'discountType']).value,
            },
          }
        : {}),
      user: this.orderForm.get('user').value.id,
      installments: modifiedInstallmentsArray,
      products: modifiedProducts,
      ...(this.orderSettings?.extraFees?.length ? { extraFees: this.orderSettings?.extraFees } : {}),
      fees: {
        feesType: this.orderForm.get(['fees', 'feesType']).value,
        amount: this.deliveryFees.toString() || '0',
      },
    };
    this.ordersService
      .createTargetOrderWithCart(input)
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
        this.route.navigate(['..'], { relativeTo: this.activatedRoute });
        this.changeDetectorRef.markForCheck();
      });
  }

  findCountriesAndIntegrationOrderSettingsAndDeliveryZones() {
    combineLatest([
      this.posService.findCountriesPagination(),
      this.posService.getWebsiteIntegrationByTarget(),
      this.ordersService.getOrderSettings(),
      this.ecommerceService.findDeliveryZonesByTarget(),
    ]).subscribe(([res, response]) => {
      this.allCountries = res;
      this.websiteIntegration = response;
    });
  }

  onChangeShippingFees(field: string) {
    this.deliveryFees = 0;
    if (field === 'DEFAULT') {
      this.orderForm.get(['fees', 'feesType']).patchValue('DEFAULT');
    } else {
      this.orderForm.get(['fees', 'feesType']).patchValue('CUSTOM');
    }
    this.orderForm.get(['fees', 'amount']).patchValue('0');
    this.reviewAmount();
    this.priceForm.get('deliveryFees').patchValue(0);
  }

  onChangeCustomFees(event: any) {
    this.deliveryFees = +event?.target?.value;
    this.orderForm.get(['fees', 'amount']).patchValue(this.deliveryFees.toString());
    this.reviewAmount();
    this.priceForm.get('deliveryFees').patchValue(+event?.target?.value);
  }

  deleteInstall(i: number) {
    this.installments.removeAt(i);
    this.installmentsList.splice(i, 1);
    this.saveInstall();
  }

  saveInstall() {
    let totalInstallments = 0;
    forEach(this.installments.value, (inst) => {
      totalInstallments = totalInstallments + +inst.amount;
    });
    this.resAmount = +(this.toPay - totalInstallments).toFixed(3);
  }

  saveInstallment() {
    let totalInstallments = 0;
    if (!this.selectedInstallement) {
      this.installmentsList = [...this.installmentsList, this.installmentForm.value];
      this.installments.push(this.addInstallmentForm(this.installmentForm.value));
    } else {
      this.installmentsList[this.selectedInstIndex] = this.installmentForm.value;
      this.installments.at(this.selectedInstIndex).patchValue({
        ...this.installmentForm.value,
        fullPaymentMethod: this.installmentForm.get('paymentMethod').value,
      });
    }
    this.modalService.dismissAll();
    forEach(this.installmentsList, (inst) => {
      totalInstallments = totalInstallments + +inst.amount;
    });
    this.resAmount = +(this.toPay - totalInstallments).toFixed(3);
  }

  openInstallmentModal(content: any, installment: InstallmentType, index: number) {
    this.selectedInstIndex = index;
    this.selectedInstallement = installment;
    this.posService.paymentMethods$.pipe(take(1)).subscribe((payment) => {
      if (payment?.length) {
        return;
      }
      this.posService.findPaymentsPagination().subscribe();
    });
    this.modalService.open(content, { centered: true });
    this.installmentForm = this.formBuilder.group({
      amount: [installment?.amount, [Validators.required, Validators.pattern(REGEX.ONLY_POSITIVE)]],
      paymentMethod: [installment?.paymentMethod || undefined, Validators.required],
      paymentStatus: [PaymentStatusEnum.OPEN],
      deadline: [installment?.deadline || ''],
    });
    const initialValues = this.installmentForm.value;
    this.installmentForm.valueChanges.subscribe((ivalues) => {
      this.isInstButtonDisabled = isEqual(ivalues, initialValues);
    });
  }

  addInstallmentForm(installment: any): FormGroup {
    return this.formBuilder.group({
      amount: [installment?.amount, Validators.required],
      paymentMethod: [installment?.paymentMethod, Validators.required],
      fullPaymentMethod: [installment?.paymentMethod, Validators.required],
      paymentStatus: [installment?.paymentStatus, Validators.required],
      deadline: [installment?.deadline],
    });
  }

  resetDate() {
    this.installmentForm.get('deadline').reset();
  }

  goToPayment() {
    this.orderForm.get('deliveryAddress').patchValue({
      country: this.selectedShipAddress?.country?.id || '',
      state: this.selectedShipAddress?.state?.id || '',
      city: this.selectedShipAddress?.city || '',
      address: this.selectedShipAddress?.address || '',
      postCode: this.selectedShipAddress?.postCode || '',
      location: {
        type: ZoneTypesEnum?.POINT,
        coordinates: this.selectedShipAddress?.location?.coordinates || undefined,
      },
    });
    this.selectedNav = 4;
  }

  goToInfo() {
    this.selectedNav = 2;
  }

  backToShip() {
    this.selectedNav = 3;
  }

  backToArticle() {
    this.selectedNav = 1;
  }

  onNavChange(changeEvent: NgbNavChangeEvent) {
    this.selectedNav = changeEvent.nextId;
  }

  backToPersonalInfo() {
    this.selectedNav = 2;
  }

  pickAddress(event) {
    this.cords = event.coords;
    this.shippingForm.get(['location', 'coordinates']).patchValue([event.coords.lng, event.coords.lat]);
  }

  next(): void {
    this.step = 2;
  }

  saveShipAddress() {
    this.isShipButtonDisabled = true;
    if (this.selectedShipAddress) {
      this.selectedUser.shippingAddress.splice(this.selectedIndex, 1);
    }
    const args = [
      ...(this.selectedUser?.shippingAddress?.length
        ? map(this.selectedUser?.shippingAddress, (address) => {
            return {
              ...pickBy(omit(address, 'country', 'state', 'location'), (value) => value !== null),
              ...(address?.country ? { country: address?.country?.id } : {}),
              ...(address?.state ? { state: address?.state?.id } : {}),
              ...(address?.location?.coordinates?.length && address.location?.coordinates[0] !== null
                ? {
                    location: {
                      type: address.location?.type || ZoneTypesEnum?.POINT,
                      coordinates: address.location?.coordinates,
                    },
                  }
                : {}),
            };
          })
        : []),
      {
        ...FormHelper.getNonEmptyValues(omit(this.shippingForm.value, 'location')),
        ...(this.shippingForm.value.location?.coordinates?.length &&
        this.shippingForm.value.location?.coordinates[0] !== null &&
        this.shippingForm.value.location?.coordinates[0] !== undefined
          ? {
              location: {
                type: this.shippingForm.value.location?.type,
                coordinates: this.shippingForm.value.location?.coordinates,
              },
            }
          : {}),
      },
    ];
    const input: any = {
      shippingAddress: [...args],
    };
    this.customersService
      .updateUser(this.selectedUser.id, input)
      .pipe(
        catchError((error) => {
          this.modalService.dismissAll();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.orderForm.get('user').patchValue(res);
          this.selectedUser = res;
          this.modalService.dismissAll();
          this.position();
          this.onSelectShip(0);
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  deleteShippingAddress() {
    const shippAddresses: any = cloneDeep([
      ...(this.selectedUser?.shippingAddress?.slice(0, this.selectedIndex) || []),
      ...(this.selectedUser?.shippingAddress?.slice(this.selectedIndex + 1) || []),
    ]);
    const args = map(shippAddresses, (address) => {
      return {
        ...pickBy(omit(address, 'country', 'state', 'location'), (value) => value !== null),
        ...(address?.country ? { country: address?.country?.id } : {}),
        ...(address?.state ? { state: address?.state?.id } : {}),
        ...(address?.location?.coordinates?.length &&
        address.location?.coordinates[0] !== null &&
        this.shippingForm.value.location?.coordinates[0] !== undefined
          ? {
              location: {
                type: address.location?.type || ZoneTypesEnum?.POINT,
                coordinates: address.location?.coordinates,
              },
            }
          : {}),
      };
    });
    const input: any = {
      shippingAddress: args,
    };
    this.customersService
      .updateUser(this.selectedUser.id, input)
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
          this.orderForm.get('user').patchValue(res);
          this.selectedUser = res;
          this.modalService.dismissAll();
          this.position();
          this.onSelectShip(0);
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  openDeleteModal(content: any, index: number) {
    this.modalService.open(content, { centered: true });
    this.selectedIndex = index;
  }

  onSelectShip(i: number) {
    this.selectedShipIndex = i;
    this.selectedShipAddress = this.selectedUser?.shippingAddress[i];
  }

  onSelectZone(index: number) {
    this.selectedZoneIndex = index;
    if (index > -1) {
      this.selectedZone = this.deliveryZones[index];
      this.priceForm.get('deliveryFees').patchValue(this.selectedZone?.extraFees);
      this.deliveryFees = +this.selectedZone?.extraFees;
      // this.extraFees = +this.selectedZone?.extraFees;
      this.orderForm.get(['fees', 'amount']).patchValue('');
    }
    this.reviewAmount();
  }

  onSelectUser(event) {
    this.orderForm.get('user').patchValue(event);
    this.selectedUser = event;
    this.selectedShipAddress = this.selectedUser?.shippingAddress[0];
  }

  onChangeOrderType(event) {
    this.orderForm.get('orderType').patchValue(event);
    this.deliveryView = event === 'DELIVERY' ? true : false;
  }

  randomString(length, chars) {
    let result = '';
    for (let i = length; i > 0; --i) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
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

  saveCustomer() {
    const residentialAddress = {
      ...FormHelper.getNonEmptyValues(omit(this.customerForm.get('residentialAddress').value, 'country', 'city', 'address', 'state', 'postCode')),
      ...(this.customerForm.get('residentialAddress.country').value === this.initialValues.residentialAddress.country
        ? {}
        : { country: this.customerForm.get('residentialAddress.country').value }),

      ...(this.customerForm.get('residentialAddress.city').value === this.initialValues.residentialAddress.city
        ? {}
        : { city: this.customerForm.get('residentialAddress.city').value }),

      ...(this.customerForm.get('residentialAddress.address').value === this.initialValues.residentialAddress.address
        ? {}
        : { address: this.customerForm.get('residentialAddress.address').value }),

      ...(this.customerForm.get('residentialAddress.state').value === this.initialValues.residentialAddress.state
        ? {}
        : { state: this.customerForm.get('residentialAddress.state').value }),

      ...(this.customerForm.get('residentialAddress.postCode').value === this.initialValues.residentialAddress.postCode
        ? {}
        : { postCode: this.customerForm.get('residentialAddress.postCode').value }),
    };
    const input: any = {
      ...FormHelper.getNonEmptyValues(omit(this.customerForm.value, 'residentialAddress')),
      ...(keys(residentialAddress).length ? { residentialAddress } : {}),
    };
    this.customersService
      .isLoginForTargetExist(this.customerForm.value.email)
      .pipe(
        rxMap((response: UserExistType) => {
          if (response.exist) {
            this.translate.get('MENUITEMS.TS.USER_EXISTS').subscribe((emailExists: string) => {
              Swal.fire({
                title: 'Oops...',
                text: emailExists,
                icon: 'warning',
                showCancelButton: false,
                confirmButtonColor: 'rgb(3, 142, 220)',
                cancelButtonColor: 'rgb(243, 78, 78)',
              });
            });
            return;
          }
          this.customersService
            .addUserForTarget(input)
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
        }),
      )
      .subscribe((res: any) => {
        this.orderForm.get('user').patchValue(res);
        this.exitAddView();
        this.changeDetectorRef.markForCheck();
      });
  }

  goToShipping() {
    this.selectedNav = 3;
  }

  exitAddView() {
    this.addView = false;
  }

  addCustomer() {
    this.addView = true;
  }

  createProductFormGroup(barcode): FormGroup {
    return this.formBuilder.group({
      barcode: [barcode?.barcode || ''],
      name: [barcode?.name || ''],
      price: [barcode?.price || ''],
      id: [barcode?.id],
      discount: this.formBuilder.group({
        discountType: [this.orderForm.get(['discount', 'discountType']).value || 'AMOUNT'],
        amount: [this.orderForm.get(['discount', 'amount']).value],
      }),
      quantity: [1],
    });
  }

  selectArticle(barcode: any): void {
    this.selectedProduct = {
      barcode: barcode,
      quantity: 1,
    };
  }

  removeArticle(i: number) {
    this.products.removeAt(i);
    this.reviewAmount();
  }

  getPriceBeforReduction(index: number) {
    if (this.products.value[index]?.discount?.discountType === DiscountType.AMOUNT) {
      return Number(this.products.value[index]?.price) + Number(this.products.value[index]?.discount?.amount);
    }
    if (this.products.value[index]?.discount?.discountType === DiscountType.PERCENTAGE) {
      return Number(this.products.value[index]?.price) / (1 - Number(this.products.value[index]?.discount?.amount) / 100);
    }
  }

  addProduct() {
    const index = this.products?.value?.findIndex((o) => o?.barcode === this.selectedProduct?.barcode?.barcode);
    if (index > -1) {
      this.addQuantity(index);
    } else {
      this.products.push(this.createProductFormGroup(this.selectedProduct?.barcode));
    }
    // this.articleSelect.clearModel();
    this.reviewAmount();
  }

  itemInCart(item): boolean {
    return this.products?.value?.findIndex((o) => o.id === item.id) > -1;
  }

  addQuantity(i: number): void {
    this.products.at(i).patchValue({ quantity: this.products.value[i].quantity + 1 });
    this.reviewAmount();
  }

  minusQuntity(i: number): void {
    this.products.at(i).patchValue({ quantity: this.products.value[i].quantity - 1 });
    this.reviewAmount();
  }

  loadMoreBarcodes() {
    this.barcodeService.isBarcodeLastPage$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.barcodeService.pageIndex++;
        this.barcodeService.getBarcodesWithVarietyFilter().subscribe();
      }
    });
  }

  loadMoreUsers() {
    this.customersService.isLast$.pipe(take(1)).subscribe((isLast) => {
      if (!isLast) {
        this.customersService.pageIndex += 1;
        this.customersService.searchCorporateUsersByTarget().subscribe();
      }
    });
  }

  removeProduct(i: number): void {
    this.products.removeAt(i);
    this.barcodeList.splice(i, 1);
    this.reviewAmount();
    this.changeDetectorRef.markForCheck();
  }

  removeInstallment(i: number): void {
    this.installments.removeAt(i);
    this.installmentsList.splice(i, 1);
    this.reviewAmount();
    this.changeDetectorRef.markForCheck();
  }

  ngOnDestroy() {
    this.customersService.infiniteContacts$ = null;
    this.customersService.pageIndex = 0;
  }
}
