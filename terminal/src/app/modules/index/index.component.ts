import Swal from 'sweetalert2';
import parse from 'date-fns/parse';
import format from 'date-fns/format';
import subYears from 'date-fns/subYears';
import subMonths from 'date-fns/subMonths';
import endOfToday from 'date-fns/endOfToday';
import startOfToday from 'date-fns/startOfToday';
import { circle, latLng, tileLayer } from 'leaflet';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { isEqual, map, reverse, times, values } from 'lodash';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  of,
  Subject,
  forkJoin,
  switchMap,
  takeUntil,
  catchError,
  Observable,
  debounceTime,
  Subscription,
  combineLatest,
  BehaviorSubject,
  distinctUntilChanged,
} from 'rxjs';

import {
  AccountType,
  PointOfSaleType,
  ActiveQuestsStatsType,
  MainDashboardStatsType,
  AnalyticsUsersByDeviceType,
} from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';
import { CorporateUserDashType, DashboardEnum } from '@sifca-monorepo/terminal-generator';

import { featuredData } from './data';
import { IndexService } from './index.service';
import { BitcoinChart } from '../engagement/wallet/data';
import { AuthService } from '../../core/auth/auth.service';
import { SharedService } from '../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-analytics',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export class IndexComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject<IPagination>(null);
  private subscription: Subscription;

  itemPage = 0;
  TopPages: any;
  pageLimit = 5;
  activeTab = 1;
  statData!: any;
  userId: string;
  searchValue = '';
  BitcoinChart: any;
  basicBarChart: any;
  initialValues: any;
  featuredData!: any[];
  lastMonths: string[];
  account: AccountType;
  searchedItems: any[];
  pageChanged: boolean;
  basicColumnChart: any;
  simpleDonutChart: any;
  basicHeatmapChart: any;
  isButtonDisabled = true;
  dashboardForm: FormGroup;
  paginations: IPagination;
  posList: PointOfSaleType[];
  breadCrumbItems!: Array<{}>;
  isSearchButtonDisabled = true;
  dashTypes = values(DashboardEnum);
  dashboards: CorporateUserDashType[];
  filteredDashboards: DashboardEnum[];
  activeQuests: ActiveQuestsStatsType;
  mainDashboard: MainDashboardStatsType;
  selectedDashboard: CorporateUserDashType;
  usersByDevice: AnalyticsUsersByDeviceType;
  loadingItems$: Observable<boolean> = this.indexService.loadingItems$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  loadingActiveQuests$: Observable<boolean> = this.indexService.loadingActiveQuests$;
  activeQuests$: Observable<ActiveQuestsStatsType> = this.indexService.activeQuests$;
  loadingMainDashboard$: Observable<boolean> = this.indexService.loadingMainDashboard$;
  loadingUsersByDevice$: Observable<boolean> = this.indexService.loadingUsersByDevice$;
  mainDashboard$: Observable<MainDashboardStatsType> = this.indexService.mainDashboard$;
  loadingCorporateDashboard$: Observable<boolean> = this.indexService.loadingCorporateDashboard$;

  filter = {
    from: subYears(startOfToday(), 20),
    to: endOfToday(),
  };
  Responsive = {
    infinite: true,
    slidesToShow: 3,
    autoplay: true,
    dots: false,
    arrows: false,
  };
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
  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }
  set pagination$(value: any) {
    this.pagination.next(value);
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
    private authService: AuthService,
    private sharedService: SharedService,
    private indexService: IndexService,
    private translate: TranslateService,
    private storageHelper: StorageHelper,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    combineLatest([
      this.indexService.getMainDashboardStats(),
      this.indexService.getAnalyticsUsersByDevice(this.filter),
      this.indexService.getActiveQuestsStats(),
    ]).subscribe();
    this.calculateLast4Months();
    this.BitcoinChart = BitcoinChart;
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.isSearchButtonDisabled = false;
          this.searchValue = searchValues?.searchString;
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe();
    this.indexService.loadingItems$ = true;
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.HOME').subscribe((home: string) => {
      this.breadCrumbItems = [{ label: 'sifca' }, { label: home, active: true }];
    });
    this.userId = this.storageHelper.getData('currentUserId');
    this.featuredData = featuredData;

    this.authService.account$.subscribe((account) => {
      this.account = account;
      this.posList = account?.targets?.pos;
      this.changeDetectorRef.markForCheck();
    });

    this.indexService.dashboards$.pipe(takeUntil(this.unsubscribeAll)).subscribe((dashboards) => {
      this.dashboards = dashboards;
      this.filteredDashboards = this.dashTypes.filter((name) => {
        return !this.dashboards.some((template) => template?.dashboard === name);
      });
      this.changeDetectorRef.markForCheck();
    });

    this.indexService.mainDashboard$.pipe(takeUntil(this.unsubscribeAll)).subscribe((mainDashboard) => {
      this.mainDashboard = mainDashboard;
      this.statData = this.transformApiData(mainDashboard);
      this.changeDetectorRef.markForCheck();
    });

    this.indexService.usersByDevice$.pipe(takeUntil(this.unsubscribeAll)).subscribe((usersByDevice) => {
      this.usersByDevice = usersByDevice;
      this.transformDeviceChart(usersByDevice);
      this.changeDetectorRef.markForCheck();
    });

    this.indexService.activeQuests$.pipe(takeUntil(this.unsubscribeAll)).subscribe((activeQuests) => {
      this.activeQuests = activeQuests;
      this.changeDetectorRef.markForCheck();
    });

    this.indexService.currentTab$.pipe(takeUntil(this.unsubscribeAll)).subscribe((tab) => {
      this.activeTab = tab;
      this.changeDetectorRef.markForCheck();
    });

    combineLatest([
      this.indexService.quests$,
      this.indexService.simpleProducts$,
      this.indexService.corporateUsers$,
      this.indexService.projects$,
      this.indexService.blogs$,
      this.indexService.barcodes$,
    ]).subscribe(([res1, res2, res3, res4, res5, res6]) => {
      this.indexService.searchString = this.searchValue;
      switch (this.activeTab) {
        case 1:
          this.searchedItems = [
            {
              items: res1,
              label: 'campaigns',
              router: 'engagement/campaigns/campaigns',
            },

            {
              items: res2,
              label: 'products',
              router: 'inventory/products/products',
            },
            ,
            {
              items: res3,
              label: 'customers',
              router: 'ecommerce/customers/customers',
            },
            ,
            {
              items: res4,
              label: 'projects',
              router: 'collaboration/projects/all',
            },
            {
              items: res5,
              label: 'blogs',
              router: 'website/blog',
            },
            {
              items: res6,
              label: 'articles',
              router: 'inventory/products/articles',
            },
          ];
          break;
        case 2:
          this.searchedItems = res1;
          this.indexService.loadingItems$ = false;
          break;
        case 3:
          this.searchedItems = res2;
          this.indexService.loadingItems$ = false;
          break;
        case 4:
          this.searchedItems = res3;
          this.indexService.loadingItems$ = false;
          break;
        case 5:
          this.searchedItems = res4;
          this.indexService.loadingItems$ = false;
          break;
        case 6:
          this.searchedItems = res5;
          this.indexService.loadingItems$ = false;
          break;
        case 7:
          this.searchedItems = res6;
          this.indexService.loadingItems$ = false;
          break;
        default:
          break;
      }
      this.indexService.loadingItems$ = false;
      this.updatePagination();
      this.changeDetectorRef.markForCheck();
    });
  }

  getColorClass(index: number): string {
    const colors = ['text-primary', 'text-secondary', 'text-success', 'text-danger'];
    return colors[index % colors.length];
  }

  searchItems() {
    this.isSearchButtonDisabled = true;
    this.searchedItems = null;
    this.switchItems();
  }

  updatePagination() {
    this.indexService.pagination$.subscribe((pagination) => {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
      this.pagination$ = pagination;
      this.subscription = this.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((paginateResponse: IPagination) => {
        this.paginations = {
          length: paginateResponse?.length,
          page: this.indexService.pageIndex || 0,
          size: this.pageLimit,
          lastPage: paginateResponse?.length - 1,
          startIndex: (this.indexService.pageIndex || 0) * this.pageLimit,
          endIndex: Math.min(((this.indexService.pageIndex || 0) + 1) * this.pageLimit - 1, paginateResponse?.length - 1),
        };
        this.changeDetectorRef.markForCheck();
      });
    });
  }

  switchItems() {
    this.indexService.loadingItems$ = true;
    this.indexService.searchString = this.searchValue;
    switch (this.activeTab) {
      case 1:
        forkJoin([
          this.indexService.findNonPredefinedQuestsByTarget(5),
          this.indexService.getSimpleProductWithFilter(5),
          this.indexService.searchCorporateUsersByTarget(5),
          this.indexService.getProjectsByTargetWithFilter(5),
          this.indexService.findBlogsByTargetPaginated(5),
          this.indexService.getBarcodesByTargetPaginated(5),
        ]).subscribe();
        break;
      case 2:
        this.indexService.findNonPredefinedQuestsByTarget(5).subscribe();
        break;
      case 3:
        this.indexService.getSimpleProductWithFilter(5).subscribe();
        break;
      case 4:
        this.indexService.searchCorporateUsersByTarget(5).subscribe();
        break;
      case 5:
        this.indexService.getProjectsByTargetWithFilter(5).subscribe();
        break;
      case 6:
        this.indexService.findBlogsByTargetPaginated(5).subscribe();
        break;
      case 7:
        this.indexService.getBarcodesByTargetPaginated(5).subscribe();
        break;
      default:
        break;
    }
  }

  onNavChange(event) {
    this.searchedItems = null;
    this.itemPage = 0;
    this.indexService.pageIndex = 0;
    this.isSearchButtonDisabled = this.searchValue === '' ? true : false;
    this.indexService.currentTab$ = event?.nextId;
    this.switchItems();
  }

  onPageChange(page: number) {
    this.itemPage = page;
    if (this.itemPage > 1) {
      this.pageChanged = true;
    }
    this.indexService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.switchItems();
    }
  }

  private transformApiData(apiData: any) {
    return [
      {
        title: 'Team',
        value: apiData?.team?.value,
        icon: 'users',
        percentage: apiData?.team?.percentage,
        profit: +apiData?.team?.percentage > 0 ? 'up' : +apiData?.team?.percentage === 0 ? 'equal' : 'down',
        icon_bg_color: 'bg-primary',
      },
      {
        title: 'Products',
        value: apiData?.products?.value,
        icon: 'box',
        percentage: apiData?.products?.percentage,
        profit: +apiData?.products?.percentage > 0 ? 'up' : +apiData?.products?.percentage === 0 ? 'equal' : 'down',
        icon_bg_color: 'bg-warning',
      },
      {
        title: 'Campaigns',
        value: apiData?.campaigns?.value,
        icon: 'radio',
        percentage: apiData?.campaigns?.percentage,
        profit: +apiData?.campaigns?.percentage > 0 ? 'up' : +apiData?.campaigns?.percentage === 0 ? 'equal' : 'down',
        icon_bg_color: 'bg-warning',
      },
      {
        title: 'Customers',
        value: apiData?.customers?.value,
        icon: 'user-plus',
        percentage: apiData?.customers?.percentage,
        profit: +apiData?.customers?.percentage > 0 ? 'up' : +apiData?.customers?.percentage === 0 ? 'equal' : 'down',
        icon_bg_color: 'bg-success',
      },
    ];
  }

  async transformDeviceChart(apiData: any) {
    const colors = this.getChartColorsArray(['--vz-primary', '--vz-success', '--vz-warning', '--vz-danger', '--vz-info']);
    const series = [apiData?.desktop?.value, apiData?.mobile?.value, apiData?.tablet?.value, apiData?.unknown?.value];
    if (apiData?.length) {
      for (const item of apiData) {
        series.push(+item.value);
        // labels.push(apiData?.);
      }
    }
    this.translate.get('MENUITEMS.TS.DESKTOP').subscribe((desktop: string) => {
      this.translate.get('MENUITEMS.TS.MOBILE').subscribe((mobile: string) => {
        this.translate.get('MENUITEMS.TS.TABLET').subscribe((tablet: string) => {
          this.translate.get('MENUITEMS.TS.UNKNOWN').subscribe((unknown: string) => {
            this.simpleDonutChart = {
              series,
              labels: [desktop, mobile, tablet, unknown],
              chart: {
                height: 333,
                type: 'donut',
              },
              legend: {
                position: 'bottom',
              },
              stroke: {
                show: false,
              },
              dataLabels: {
                dropShadow: {
                  enabled: false,
                },
              },
              colors,
            };
          });
        });
      });
    });
  }

  calculateLast4Months() {
    const currentDate = new Date();
    const lastMonth = subMonths(currentDate, 1);
    const last4Months = times(4, (index) => subMonths(lastMonth, index));
    this.lastMonths = reverse(map(last4Months, (date) => format(date, 'MMM yyyy')));
  }

  onChangeMonth(month: string) {
    let filter;
    if (month !== 'All') {
      const fromDate = parse(month, 'MMM yyyy', new Date());
      filter = {
        from: fromDate,
        to: this.filter?.to,
      };
    } else {
      filter = {
        from: subYears(startOfToday(), 20),
        to: endOfToday(),
      };
    }
    this.indexService.getAnalyticsUsersByDevice(filter).subscribe();
  }

  sectionDropped(event: CdkDragDrop<any[]>): void {
    const item = this.dashboards[event.previousIndex];
    let newRank = event.currentIndex === 0 ? 1 : this.dashboards[event.currentIndex].rank;
    moveItemInArray(this.dashboards, event.previousIndex, event.currentIndex);
    const input: any = {
      dashboardId: item?.id,
      newRank,
    };
    this.indexService
      .reorderCorporateDashboard(input)
      .pipe(
        catchError(() => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
        // switchMap(() => {
        //   return this.campaignService.getQuestActivitiesByQuestPaginated(this.questId);
        // }),
      )
      .subscribe((res) => {
        if (res) {
          this.position();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  openDashboardModal(content: any, dashboard: CorporateUserDashType) {
    this.selectedDashboard = dashboard;
    this.modalService.open(content, { centered: true });
    this.dashboardForm = this.formBuilder.group({
      dashboard: [dashboard?.dashboard || undefined, Validators.required],
    });
    this.initialValues = this.dashboardForm.value;
    this.dashboardForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((ivalues) => {
      this.isButtonDisabled = isEqual(ivalues, this.initialValues);
    });
  }

  save() {
    this.isButtonDisabled = true;
    const input: any = {
      user: this.userId,
      ...(this.selectedDashboard ? { id: this.selectedDashboard.id } : {}),
      ...(this.dashboardForm.get('dashboard').value === this.initialValues.dashboard ? {} : { dashboard: this.dashboardForm.get('dashboard').value }),
      ...(this.selectedDashboard ? { rank: this.selectedDashboard?.rank } : { rank: this.dashboards?.length + 1 }),
    };
    if (this.selectedDashboard) {
      this.indexService
        .updateCorporateDashboard(input)
        .pipe(
          catchError(() => {
            this.modalError();
            this.modalService.dismissAll();
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
    } else {
      this.indexService
        .createCorporateDashboard(input)
        .pipe(
          catchError(() => {
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
  }

  openDeleteModal(content: any, dashboard: CorporateUserDashType) {
    this.selectedDashboard = dashboard;
    this.modalService.open(content, { centered: true });
  }

  deleteDashboard() {
    this.indexService
      .deleteCorporateDashboard(this.selectedDashboard.id)
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

  num: number = 0;
  option = {
    startVal: this.num,
    useEasing: true,
    duration: 2,
    decimalPlaces: 2,
  };

  private getChartColorsArray(colors: any) {
    return map(colors, (value: any) => {
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

  /**
   * Simple Donut Chart
   */
  setdevicevalue(value: any) {
    if (value == 'today') {
      this.simpleDonutChart.series = [78.56, 105.02, 42.89];
    }
    if (value == 'last_week') {
      this.simpleDonutChart.series = [48.56, 95.02, 52.89];
    }
    if (value == 'last_month') {
      this.simpleDonutChart.series = [28.56, 58.02, 92.89];
    }
    if (value == 'current_year') {
      this.simpleDonutChart.series = [18.56, 105.02, 102.89];
    }
  }

  /**
   * Sale Location Map
   */
  options = {
    layers: [
      tileLayer(
        'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoidGhlbWVzYnJhbmQiLCJhIjoiY2xmbmc3bTV4MGw1ejNzbnJqOWpubzhnciJ9.DNkdZVKLnQ6I9NOz7EED-w',
        {
          id: 'mapbox/light-v9',
          tileSize: 512,
          zoomOffset: 0,
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        },
      ),
    ],
    zoom: 1.1,
    center: latLng(28, 1.5),
  };
  layers = [
    circle([41.9, 12.45], { color: '#435fe3', opacity: 0.5, weight: 10, fillColor: '#435fe3', fillOpacity: 1, radius: 400000 }),
    circle([12.05, -61.75], { color: '#435fe3', opacity: 0.5, weight: 10, fillColor: '#435fe3', fillOpacity: 1, radius: 400000 }),
    circle([1.3, 103.8], { color: '#435fe3', opacity: 0.5, weight: 10, fillColor: '#435fe3', fillOpacity: 1, radius: 400000 }),
  ];

  ngOnDestroy() {
    this.indexService.pageIndex = 0;
    this.indexService.searchString = '';
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
