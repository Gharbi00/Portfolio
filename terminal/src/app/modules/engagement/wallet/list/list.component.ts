import Swal from 'sweetalert2';
import format from 'date-fns/format';
import isEqual from 'date-fns/isEqual';
import subYears from 'date-fns/subYears';
import { forEach, map, omit, values } from 'lodash';
import subMonths from 'date-fns/subMonths';
import endOfToday from 'date-fns/endOfToday';
import startOfToday from 'date-fns/startOfToday';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ChangeDetectorRef, Component, QueryList, ViewChildren } from '@angular/core';
import { Observable, Subject, catchError, combineLatest, debounceTime, distinctUntilChanged, of, switchMap, take, takeUntil } from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import { FormHelper, StorageHelper } from '@diktup/frontend/helpers';
import { WalletTransactionsStatsChartType, WalletTransactionsStatsType, WalletTypeEnum } from '@sifca-monorepo/terminal-generator';
import {
  CoinType,
  CorporateUserType,
  PointOfSaleType,
  TransactionTypeEnum,
  UserType,
  WalletTopupType,
  WalletTransactionType,
  WalletType,
} from '@sifca-monorepo/terminal-generator';

import { WalletModel } from '../wallet.model';
import { WalletService } from '../wallet.service';
import { NgbdWalletSortableHeader } from '../wallet-sortable.directive';
import { PosService } from '../../../../../app/core/services/pos.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { UserService } from '../../../../../app/core/services/user.service';
import { LoyaltyService } from '../../../system/apps/apps/loyalty/loyalty.service';
import { CustomersService } from '../../../ecommerce/customers/customers/customers.service';
import { BitcoinChart, litecoinChart, EatherreumChart, BinanceChart, DashChart, TetherChart, NeoChart } from '../data';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-wallet-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class WalletListComponent {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChildren(NgbdWalletSortableHeader) headers!: QueryList<NgbdWalletSortableHeader>;

  page = 0;
  NeoChart: any;
  DashChart: any;
  user: UserType;
  TetherChart: any;
  BitcoinChart: any;
  BinanceChart: any;
  filteredDate: Date;
  litecoinChart: any;
  coinForm: FormGroup;
  EatherreumChart: any;
  pos: PointOfSaleType;
  pageChanged: boolean;
  marketGraphChart: any;
  dateNow: Date = new Date();
  total$: Observable<number>;
  breadCrumbItems!: Array<{}>;
  selectedField: string = 'country';
  reasons = values(TransactionTypeEnum);
  WalletList$!: Observable<WalletModel[]>;
  coins$: Observable<CoinType[]> = this.walletService.coins$;
  wallet$: Observable<WalletType[]> = this.loyaltyService.wallet$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  loadingCoins$: Observable<boolean> = this.walletService.loadingCoins$;
  loadingTopups$: Observable<boolean> = this.walletService.loadingTopups$;
  stats$: Observable<WalletTransactionsStatsType> = this.walletService.stats$;
  walletTopup$: Observable<WalletTopupType[]> = this.walletService.walletTopup$;
  topupPagination$: Observable<IPagination> = this.walletService.topupPagination$;
  loadingWalletChart$: Observable<boolean> = this.walletService.loadingWalletChart$;
  loadingTransactions$: Observable<boolean> = this.walletService.loadingTransactions$;
  userSearchInput$: Subject<string> = new Subject<string>();
  users$: Observable<CorporateUserType[]> = this.customersService.infiniteContacts$;
  transactions$: Observable<WalletTransactionType[]> = this.walletService.transactions$;
  transactionPagination$: Observable<IPagination> = this.walletService.transactionPagination$;

  config = {
    initialSlide: 0,
    slidesPerView: 1,
    spaceBetween: 25,
    breakpoints: {
      768: {
        slidesPerView: 2,
      },
      1200: {
        slidesPerView: 3,
      },
      1599: {
        slidesPerView: 4,
      },
    },
  };
  config2 = {
    initialSlide: 0,
    slidesPerView: 1,
  };

  filter = {
    from: subYears(startOfToday(), 20),
    to: endOfToday(),
  };
  walletChart: WalletTransactionsStatsChartType;
  selectedCategoryField: string;
  selectedMonthField: string;
  wallet: WalletType[];
  currency: string;
  filterForm: FormGroup;
  initialValues: any;
  isFilterButtonDisabled = true;
  selectedWalletId: string;
  walletForm: FormGroup;
  isWalletButtonDisabled = true;
  initValues: any;

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private sharedService: SharedService,
    private userService: UserService,
    private storageHelper: StorageHelper,
    private customersService: CustomersService,
    private posService: PosService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private loyaltyService: LoyaltyService,
    public walletService: WalletService,
    public changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
  ) {
    this.WalletList$ = walletService.countries$;
    this.total$ = walletService.total$;
    this.sharedService.resetFilter$.pipe(takeUntil(this.unsubscribeAll)).subscribe((reset) => {
      if (reset) {
        this.reset();
      }
    })
  }

  ngOnInit(): void {
    this.loyaltyService.wallet$ = null;
    this.walletService.pageLimit = 5;
    this.walletService.transactionPageLimit = 8;
    this.translate.get('MENUITEMS.TS.ENGAGEMENT').subscribe((engagement: string) => {
      this.translate.get('MENUITEMS.TS.MY_WALLET').subscribe((myWallet: string) => {
        this.breadCrumbItems = [{ label: engagement }, { label: myWallet, active: true }];
      });
    });
    this.filterForm = this.formBuilder.group({
      from: [subYears(startOfToday(), 20)],
      to: [endOfToday()],
      reason: [undefined],
      transactionId: [undefined],
      includeAllCustomers: [false],
      affected: this.formBuilder.array([
        this.formBuilder.group({
          user: [undefined],
        }),
      ]),
    });
    this.initialValues = this.filterForm.value;
    this.filterForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
      this.isFilterButtonDisabled = false;
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
    this.posService.pos$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pos) => {
      this.pos = pos;
    });
    const countryId = this.pos?.locations?.[0]?.country?.id;
    this.walletService.loadingWalletChart$ = true;
    combineLatest([
      this.loyaltyService.quantitativeWalletsByOwnerPagination(),
      this.walletService.getWalletTransactionsByAffectedPaginated({
        from: subYears(startOfToday(), 20),
        to: endOfToday(),
        affected: [{ pos: this.storageHelper.getData('posId') }],
      }),
      this.walletService.getWalletTopupsByTargetPaginated(),
      this.walletService.getWalletTransactionsStatsByAffected(),
      countryId ? this.walletService.getCoinsByCountryPaginated(countryId) : this.walletService.getCoinsByCountryPaginated(),
    ])
      .pipe(
        switchMap(([res]) => {
          this.selectedWalletId = res?.[0]?.id;
          if (this.selectedWalletId) {
            return this.walletService.getWalletTransactionsStatsChartWithFilter({ ...this.filter, wallet: this.selectedWalletId } as any);
          }
          this.walletService.loadingWalletChart$ = false;
          return of(null);
        }),
      )
      .subscribe();

    this.walletService.dateFilter$.pipe(takeUntil(this.unsubscribeAll)).subscribe((dateFilter) => {
      this.filter = dateFilter;
    });

    this.userService.user$.pipe(takeUntil(this.unsubscribeAll)).subscribe((user) => {
      this.user = user;
    });

    this.loyaltyService.wallet$.pipe(takeUntil(this.unsubscribeAll)).subscribe((wallet) => {
      if (wallet?.length) {
        this.wallet = wallet;
        this.currency = this.wallet[0]?.coin?.unitValue?.currency?.name;
      }
    });

    this.walletService.walletChart$.pipe(takeUntil(this.unsubscribeAll)).subscribe((walletChart) => {
      if (walletChart && this.wallet?.length) {
        this.walletChart = walletChart;
        this._marketGraphChart(walletChart, '["--vz-info"]');
      }
    });
    this.walletService.selectedField$.subscribe((selectedField) => {
      this.selectedField = selectedField;
    });
    this.walletService.selectedCategoryField$.subscribe((selectedCategoryField) => {
      this.selectedCategoryField = selectedCategoryField;
    });
    this.fetchData();
    this.sharedService.resetFilter$.pipe(takeUntil(this.unsubscribeAll)).subscribe((reset) => {
      if (reset) {
        this.reset();
      }
    });
  }

  ngAfterViewInit() {
    this.customersService.searchCorporateUsersByTarget().subscribe();
  }

  onChangeWallet(wallet: string) {
    this.walletService.getWalletTransactionsStatsChartWithFilter({ ...this.filter, wallet } as any).subscribe();
  }

  openWalletModal(content) {
    this.modalService.open(content, { centered: true });
    this.walletForm = this.formBuilder.group({
      amount: ['0'],
      fee: [''],
      walletType: [WalletTypeEnum.QUANTITATIVE],
      coin: [undefined],
    });
    this.initValues = this.walletForm.value;
    this.walletForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
      this.isWalletButtonDisabled = isEqual(values, this.initValues);
    });
  }

  saveWallet() {
    const input: any = {
      ...FormHelper.getNonEmptyValues(this.walletForm.value),
    };
    this.loyaltyService
      .createWallet(input)
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
          this.modalService.dismissAll();
          this.changeDetectorRef.markForCheck();
        }
      });
  }


  reset() {
    this.walletService.from = subYears(startOfToday(), 20);
    this.walletService.to = endOfToday();
    this.filterForm.patchValue({
      from: this.walletService.from,
      to: this.walletService.to,
      reason: undefined,
      transactionId: undefined,
      includeAllCustomers: false,
    });
    forEach(this.filterForm.get('affected').value, (control, i: number) => {
      if (i === 0) {
        (this.filterForm.get('affected') as FormArray).at(0).patchValue({ user: undefined });
      } else {
        (this.filterForm.get('affected') as FormArray).removeAt(i);
      }
    });
  }

  filterTransactions() {
    this.walletService.from = this.filterForm.value.from;
    this.walletService.to = this.filterForm.value.to;
    this.modalService.dismissAll();
    const affected = map(this.filterForm.get('affected').value, (item, i) => {
      return {
        ...(item?.user ? { user: item?.user } : {}),
      };
    }).filter((item) => item?.user);
    const input: any = {
      ...FormHelper.getDifference(omit(this.initialValues, 'affected', 'from', 'to'), omit(this.filterForm.value, 'affected', 'from', 'to')),
      ...(this.filterForm.get('includeAllCustomers').value === true
        ? { affected: [{ pos: this.storageHelper.getData('posId') }] }
        : affected?.length
        ? {
          affected
          }
        : {}),
      from: this.walletService.from,
      to: this.walletService.to,
    };
    this.walletService.transactionPageIndex = 0;
    this.walletService
      .getWalletTransactionsByAffectedPaginated(input)
      .pipe(
        catchError(() => {
          this.modalService.dismissAll();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
        this.changeDetectorRef.markForCheck();
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

  addAffectedField() {
    (this.filterForm.get('affected') as FormArray).push(
      this.formBuilder.group({
        user: [undefined],
      }),
    );
  }

  removeAffectedField(index: number) {
    (this.filterForm.get('affected') as FormArray).removeAt(index);
  }

  openFilterModal(content: any) {
    this.isFilterButtonDisabled = true;
    this.modalService.open(content, { centered: true });
  }

  resetDate(field: string) {
    this.filterForm.get(field).reset();
  }

  onPageChange(page: number) {
    let param: string;
    param = this.selectedField === 'country' ? 'getCoinsByCountryPaginated' : 'getCoinsByCategoryPaginated';
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.walletService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.walletService[param].subscribe();
    }
  }

  openCoinModal(modal, coin: CoinType) {
    this.modalService.open(modal);
    this.coinForm = this.formBuilder.group({
      name: [coin?.name || ''],
      code: [coin?.code || ''],
      picture: this.formBuilder.group({
        baseUrl: [coin?.picture?.baseUrl || ''],
        path: [coin?.picture?.path || ''],
      }),
      unitValue: this.formBuilder.group({
        amount: [coin?.unitValue?.amount || ''],
        currency: [coin?.unitValue?.currency?.name || undefined],
      }),
      country: [coin?.country?.name || undefined],
    });
  }

  monthFilter(field: string) {
    this.filteredDate =
      field === 'All'
        ? subYears(this.dateNow, 20)
        : field === '6M'
        ? subMonths(this.dateNow, 6)
        : field === '1M'
        ? subMonths(this.dateNow, 1)
        : field === '1Y'
        ? subYears(this.dateNow, 1)
        : null;
    this.filter = {
      from: this.filteredDate,
      to: endOfToday(),
    };
    this.selectedMonthField = field;
    this.walletService.getWalletTransactionsStatsChartWithFilter(this.filter as any).subscribe();
  }

  onChangeCoin(field: string) {
    this.walletService.selectedField$ = field;
    if (field === 'country') {
      this.walletService.getCoinsByCountryPaginated(this.pos?.locations?.[0]?.country?.id || null).subscribe(() => {
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        });
      });
    } else {
      this.walletService.getCoinsByCategoryPaginated().subscribe(() => {
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        });
      });
    }
  }

  onChangeCategory(field: string) {
    this.walletService.selectedCategoryField$ = field;
    const filter: any = {
      ...(field === 'overall' ? { from: subYears(startOfToday(), 20) } : { from: startOfToday() }),
      to: endOfToday(),
      affected: [{ pos: this.storageHelper.getData('posId') }],
    };
    this.walletService.getWalletTransactionsByAffectedPaginated(filter).subscribe();
  }

  private getChartColorsArray(colors: any) {
    colors = JSON.parse(colors);
    return colors.map(function (value: any) {
      var newValue = value.replace(' ', '');
      if (newValue.indexOf(',') === -1) {
        var color = getComputedStyle(document.documentElement).getPropertyValue(newValue);
        if (color) {
          color = color.replace(' ', '');
          return color;
        } else return newValue;
      } else {
        var val = value.split(',');
        if (val.length == 2) {
          var rgbaColor = getComputedStyle(document.documentElement).getPropertyValue(val[0]);
          rgbaColor = 'rgba(' + rgbaColor + ',' + val[1] + ')';
          return rgbaColor;
        } else {
          return newValue;
        }
      }
    });
  }

  private _marketGraphChart(walletChart: WalletTransactionsStatsChartType, colors: any) {
    colors = this.getChartColorsArray(colors);
    this.translate.get('MENUITEMS.TS.BALANCE').subscribe((balance: string) => {
      this.marketGraphChart = {
        series: [
          {
            name: balance,
            data: walletChart?.chart,
          },
        ],
        chart: {
          id: 'area-datetime',
          type: 'area',
          height: 320,
          zoom: {
            autoScaleYaxis: true,
          },
          toolbar: {
            show: false,
          },
        },
        yaxis: {
          title: {
            text: (this.currency || '$') + ' (thousands)',
          },
        },
        dataLabels: {
          enabled: false,
        },
        markers: {
          size: 0,
        },
        xaxis: {
          type: 'datetime',
          ...(walletChart?.chart?.length ? { min: new Date(format(walletChart?.chart[0][0], 'dd MMM yyyy')).getTime() } : {}),
          tickAmount: 6,
        },
        tooltip: {
          x: {
            format: 'dd MMM yyyy',
          },
          y: {
            formatter: (y: any) => {
              if (typeof y !== 'undefined') {
                return this.currency + ' ' + y.toFixed(2) + 'k';
              }
              return y;
            },
          },
        },
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            inverseColors: false,
            opacityFrom: 0.45,
            opacityTo: 0.05,
            stops: [20, 100, 100, 100],
          },
        },
        colors: colors,
      };
    });

    this.changeDetectorRef.markForCheck();
  }

  private fetchData() {
    this.BitcoinChart = BitcoinChart;
    this.litecoinChart = litecoinChart;
    this.EatherreumChart = EatherreumChart;
    this.BinanceChart = BinanceChart;
    this.DashChart = DashChart;
    this.TetherChart = TetherChart;
    this.NeoChart = NeoChart;
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

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.customersService.pageIndex = 0;
    this.walletService.from = subYears(startOfToday(), 20);
    this.walletService.to = endOfToday();
    this.customersService.infiniteContacts$ = null;
    this.walletService.transactionPageIndex = 0;
    this.loyaltyService.walletPageIndex = 0;
    this.loyaltyService.wallet$ = null;
  }
}
