import parse from 'date-fns/parse';
import format from 'date-fns/format';
import { SwiperOptions } from 'swiper';
import subYears from 'date-fns/subYears';
import subMonths from 'date-fns/subMonths';
import endOfToday from 'date-fns/endOfToday';
import { FormBuilder } from '@angular/forms';
import startOfToday from 'date-fns/startOfToday';
import { circle, latLng, tileLayer } from 'leaflet';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, take, takeUntil } from 'rxjs';
import { isEqual, map, reverse, times, values } from 'lodash';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';

import {
  OrderStatus,
  OrderTypeEnum,
  PaymentStatusEnum,
  MarketPlaceOrderDtoType,
  SalesAnalyticsStatsType,
  SalesAnalyticsRevenueStatsType,
  EcommerceAnalyticsBestSellerType,
  SalesAnalyticsSalesByCountryType,
  SalesAnalyticsTopCatalogueCategoriesType,
} from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { ConvertorHelper } from '@diktup/frontend/helpers';
import { UserType } from '@sifca-monorepo/terminal-generator';
import { PaymentMethodsEnum } from '@sifca-monorepo/terminal-generator';

import { TopSelling } from './data';
import { EcommerceAnalyticsService } from './ecommerce.service';
import { UserService } from '../../../core/services/user.service';
import { SharedService } from '../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard-ecommerce',
  templateUrl: './ecommerce.component.html',
  styleUrls: ['./ecommerce.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EcommerceDashboardComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  layers: any;
  name: string;
  orderPage = 0;
  statData!: any;
  excelForm: any;
  TopSelling: any;
  isBrowser: boolean;
  filteredDate: Date;
  analyticsChart!: any;
  pageChanged: boolean;
  lastMonths: string[];
  selectedFilter: string;
  salesCategoryChart!: any;
  orderPageChanged: boolean;
  dateNow: Date = new Date();
  breadCrumbItems!: Array<{}>;
  orderPagination: IPagination;
  isExcelButtonDisabled = true;
  stats: SalesAnalyticsStatsType;
  bestSellerPagination: IPagination;
  orderStatus = values(OrderStatus);
  orderTypes = values(OrderTypeEnum);
  payments = values(PaymentMethodsEnum);
  currentDate: { from: Date; to: Date };
  paymentStatus = values(PaymentStatusEnum);
  revenueChart: SalesAnalyticsRevenueStatsType;
  salesByLocation: SalesAnalyticsSalesByCountryType;
  salesByCategory: SalesAnalyticsTopCatalogueCategoriesType[];
  loadingStats$: Observable<boolean> = this.ecommerceAnalyticsService.loadingStats$;
  loadingRevenue$: Observable<boolean> = this.ecommerceAnalyticsService.loadingRevenue$;
  loadingBestSeller$: Observable<boolean> = this.ecommerceAnalyticsService.loadingBestSeller$;
  targetOrderUsers$: Observable<UserType[]> = this.ecommerceAnalyticsService.targetOrderUsers$;
  targetOrderNumbers$: Observable<string[]> = this.ecommerceAnalyticsService.targetOrderNumbers$;
  loadingTopCatalogue$: Observable<boolean> = this.ecommerceAnalyticsService.loadingTopCatalogue$;
  loadingTargetOrders$: Observable<boolean> = this.ecommerceAnalyticsService.loadingTargetOrders$;
  targetOrders$: Observable<MarketPlaceOrderDtoType[]> = this.ecommerceAnalyticsService.targetOrders$;
  loadingSalesByLocation$: Observable<boolean> = this.ecommerceAnalyticsService.loadingSalesByLocation$;
  bestSeller$: Observable<EcommerceAnalyticsBestSellerType[]> = this.ecommerceAnalyticsService.bestSeller$;

  options = {
    layers: [
      tileLayer(
        'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZGlrdHVwIiwiYSI6ImNsbXJyMjYzbDA0aGsybnF3cGlqZnJjOHoifQ.dFKing6Eh07o5yx5ljZyIQ',
        {
          id: 'mapbox/light-v9',
          tileSize: 512,
          zoomOffset: -1,
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        },
      ),
    ],
    zoom: 1.1,
    center: latLng(28, 1.5),
  };
  vertical: SwiperOptions = {
    pagination: { el: '.swiper-pagination', clickable: true },
    direction: 'vertical',
    slidesPerView: 2,
    spaceBetween: 0,
    mousewheel: true,
  };
  filter = {
    from: subYears(startOfToday(), 2),
    to: endOfToday(),
  };

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private sharedService: SharedService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private translate: TranslateService,
    private convertorHelper: ConvertorHelper,
    private changeDetectorRef: ChangeDetectorRef,
    private ecommerceAnalyticsService: EcommerceAnalyticsService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.userService.user$.subscribe((user) => {
      this.name = user.firstName;
    });
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.currentDate = { from: firstDay, to: lastDay };
    this.ecommerceAnalyticsService.stats$.pipe(takeUntil(this.unsubscribeAll)).subscribe((stats: SalesAnalyticsStatsType) => {
      this.stats = stats;
      this.statData = this.transformStatsData(this.stats);
      this.changeDetectorRef.markForCheck();
    });
    this.ecommerceAnalyticsService.revenueChart$.pipe(takeUntil(this.unsubscribeAll)).subscribe((revenueChart: SalesAnalyticsRevenueStatsType) => {
      this.revenueChart = revenueChart;
      this.transformRevenueChart(this.revenueChart);
      this.changeDetectorRef.markForCheck();
    });
    this.ecommerceAnalyticsService.salesByLocation$
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe((salesByLocation: SalesAnalyticsSalesByCountryType) => {
        this.salesByLocation = salesByLocation;
        this.layers = this.salesByLocation?.layers?.map((item) => {
          return circle([+item.coordination.lat, +item.coordination.lng], {
            color: '#435fe3',
            opacity: 0.5,
            weight: 10,
            fillColor: '#435fe3',
            fillOpacity: 1,
            radius: item.radius,
          });
        });
        this.changeDetectorRef.markForCheck();
      });
    this.ecommerceAnalyticsService.salesByCategory$
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe((salesByCategory: SalesAnalyticsTopCatalogueCategoriesType[]) => {
        this.salesByCategory = salesByCategory;
        this.salesByCategoryChart(this.salesByCategory);
        this.changeDetectorRef.markForCheck();
      });

    this.ecommerceAnalyticsService.bestSellerPagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.bestSellerPagination = {
        length: pagination?.length,
        page: this.ecommerceAnalyticsService.bestSellerIndex || 0,
        size: this.ecommerceAnalyticsService.bestSellerLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.ecommerceAnalyticsService.bestSellerIndex || 0) * this.ecommerceAnalyticsService.bestSellerLimit,
        endIndex: Math.min(
          ((this.ecommerceAnalyticsService.bestSellerIndex || 0) + 1) * this.ecommerceAnalyticsService.bestSellerLimit - 1,
          pagination?.length - 1,
        ),
      };
      this.changeDetectorRef.markForCheck();
    });

    this.ecommerceAnalyticsService.orderPagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.orderPagination = {
        length: pagination?.length,
        page: this.ecommerceAnalyticsService.orderPageIndex || 0,
        size: this.ecommerceAnalyticsService.orderPageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.ecommerceAnalyticsService.orderPageIndex || 0) * this.ecommerceAnalyticsService.orderPageLimit,
        endIndex: Math.min(
          ((this.ecommerceAnalyticsService.orderPageIndex || 0) + 1) * this.ecommerceAnalyticsService.orderPageLimit - 1,
          pagination?.length - 1,
        ),
      };
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.DASHBOARDS').subscribe((dashboards: string) => {
      this.translate.get('MENUITEMS.TS.ECOMMERCE').subscribe((ecommerce: string) => {
        this.breadCrumbItems = [{ label: dashboards }, { label: ecommerce, active: true }];
      });
    });
    this.ecommerceAnalyticsService.getEcommerceRevenueChartStats(this.filter).subscribe();
    this.ecommerceAnalyticsService.findTargetOrderNumber(this.filter).subscribe();
    this.ecommerceAnalyticsService.getEcommerceSalesByLocation(this.filter).subscribe();
    this.ecommerceAnalyticsService.getEcommerceTopCatalogueCategories(this.filter).subscribe();
    this.ecommerceAnalyticsService.getEcommerceAnalyticsStats(this.filter).subscribe();
    this.ecommerceAnalyticsService.getEcommerceBestSellerProductsWithFilterPaginated(this.filter).subscribe();
    this.ecommerceAnalyticsService.findTargetOrders(this.filter).subscribe();

    this.calculateLast4Months();
    this.TopSelling = TopSelling;
  }

  monthFilter(field: string) {
    this.filteredDate =
      field === 'All'
        ? subYears(this.dateNow, 2)
        : field === '6M'
        ? subMonths(this.dateNow, 6)
        : field === '1M'
        ? subMonths(this.dateNow, 1)
        : field === '1Y'
        ? subYears(this.dateNow, 1)
        : null;

    const filter = {
      from: this.filteredDate,
      to: endOfToday(),
    };
    this.selectedFilter = field;
    this.ecommerceAnalyticsService.getEcommerceRevenueChartStats(filter).subscribe();
  }

  loadMoreNumbers() {
    this.ecommerceAnalyticsService.isLastNumbers$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.ecommerceAnalyticsService.orderNumberPageIndex++;
        this.ecommerceAnalyticsService.findTargetOrderNumber(this.filter).subscribe();
      }
    });
  }

  getValue(value: number): string {
    return Number.isFinite(value) ? value.toFixed(3) : '0.000';
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.ecommerceAnalyticsService.bestSellerIndex = page - 1;
    if (this.pageChanged) {
      this.ecommerceAnalyticsService.getEcommerceBestSellerProductsWithFilterPaginated(this.filter).subscribe();
    }
  }

  onOrderPageChange(page: number) {
    this.orderPage = page;
    if (this.orderPage > 1) {
      this.orderPageChanged = true;
    }
    this.ecommerceAnalyticsService.orderPageIndex = page - 1;
    if (this.orderPageChanged) {
      this.ecommerceAnalyticsService.findTargetOrders(this.filter).subscribe();
    }
  }

  calculateLast4Months() {
    const currentDate = new Date();
    const lastMonth = subMonths(currentDate, 1);
    const last4Months = times(4, (index) => subMonths(lastMonth, index));
    this.lastMonths = reverse(map(last4Months, (date) => format(date, 'MMM yyyy')));
  }

  onChangeFilter(event: any) {
    const filter = {
      from: event.selectedDates[0],
      to: event.selectedDates[1],
    };
    this.filter = filter;
    this.ecommerceAnalyticsService.getEcommerceRevenueChartStats(this.filter).subscribe();
    this.ecommerceAnalyticsService.getEcommerceSalesByLocation(this.filter).subscribe();
    this.ecommerceAnalyticsService.getEcommerceTopCatalogueCategories(this.filter).subscribe();
    this.ecommerceAnalyticsService.getEcommerceAnalyticsStats(this.filter).subscribe();
    this.ecommerceAnalyticsService.getEcommerceBestSellerProductsWithFilterPaginated(this.filter).subscribe();
    this.ecommerceAnalyticsService.findTargetOrders(this.filter).subscribe();
  }

  resetDate(field: string) {
    this.excelForm.get(field).reset();
  }

  openExportModal(content: any) {
    this.modalService.open(content, { centered: true });
    this.excelForm = this.formBuilder.group({
      paymentMethod: [undefined],
      orderType: [undefined],
      orderStatus: [undefined],
      paymentStatus: [undefined],
      number: [undefined],
      from: [undefined],
      to: [undefined],
      user: [undefined],
    });
    const initValues = this.excelForm.value;
    this.excelForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
      this.isExcelButtonDisabled = isEqual(values, initValues);
    });
  }

  exportExcel() {
    this.isExcelButtonDisabled = true;
    this.ecommerceAnalyticsService.getTargetOrdersByExcel(this.excelForm.value).subscribe((res) => {
      const blob = this.convertorHelper.b64toBlob(res.content, 'xlsx');
      const a = this.document.createElement('a');
      this.document.body.appendChild(a);
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = String('orders.xlsx');
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    });
  }

  onChangeMonth(month: string, field: string) {
    const fromDate = parse(month, 'MMM yyyy', new Date());
    const filter = {
      from: fromDate,
      to: this.filter?.to,
    };
    if (field === 'bestSeller') {
      this.ecommerceAnalyticsService.getEcommerceBestSellerProductsWithFilterPaginated(filter).subscribe();
    } else if (field === 'topCatalogue') {
      this.ecommerceAnalyticsService.getEcommerceTopCatalogueCategories(filter).subscribe();
    }
  }

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

  async salesByCategoryChart(apiData: any) {
    const colors = this.getChartColorsArray(['--vz-primary', '--vz-success', '--vz-warning', '--vz-danger', '--vz-info']);
    const series = [];
    const labels = [];
    if (apiData?.length) {
      for (const item of apiData) {
        series.push(+item.value);
        labels.push(item.category.name);
      }
    }

    this.salesCategoryChart = {
      series,
      labels,
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
  }

  transformStatsData(apiData: any): any[] {
    const transformedData = [];
    this.translate.get('MENUITEMS.TS.TOTAL_EARNINGS').subscribe((totalEarnings: string) => {
      this.translate.get('MENUITEMS.TS.ORDERS').subscribe((orders: string) => {
        this.translate.get('MENUITEMS.TS.PARTIALY_PAID_INVOICE').subscribe((partialyPaid: string) => {
          this.translate.get('MENUITEMS.TS.UNPAID_INVOICES').subscribe((unpaidInvoices: string) => {
            const titleMap = {
              totalEarnings: totalEarnings,
              orders: orders,
              partiallyPaidInvoices: partialyPaid,
              unpaidInvoices: unpaidInvoices,
            };

            for (const key in apiData) {
              if (apiData?.hasOwnProperty(key)) {
                const item = apiData[key];
                const profit = item.percentage > 0 ? 'up' : item.percentage < 0 ? 'down' : 'equal';
                const icon_bg_color = item.percentage > 0 ? 'bg-success' : item.percentage < 0 ? 'bg-info' : 'bg-danger';

                let icon = '';
                let link = '';

                switch (key) {
                  case 'totalEarnings':
                    icon = 'bx-dollar-circle';
                    link = 'View net earnings';
                    break;
                  case 'orders':
                    icon = 'bx-shopping-bag';
                    link = 'View all orders';
                    break;
                  case 'partiallyPaidInvoices':
                    icon = 'bx bx-pie-chart-alt';
                    link = 'See details';
                    break;
                  case 'unpaidInvoices':
                    icon = 'bx-wallet';
                    link = 'Withdraw money';
                    break;
                }

                transformedData.push({
                  title: titleMap[key],
                  value: item.value,
                  icon,
                  percentage: item.percentage, // .toFixed(2)
                  profit,
                  icon_bg_color,
                  link,
                });
              }
            }
          });
        });
      });
    });

    return transformedData;
  }

  private transformRevenueChart(apiData: any) {
    const colorsArray = ['--vz-success', '--vz-primary', '--vz-danger', '--vz-warning'];
    const colors = this.getChartColorsArray(colorsArray);
    apiData = {
      ...apiData,
      chart: {
        orders: apiData?.chart?.orders?.map((value: string) => parseFloat(value).toFixed(3)) ?? [],
        paid: apiData?.chart?.paid?.map((value: string) => parseFloat(value).toFixed(3)) ?? [],
        unpaid: apiData?.chart?.unpaid?.map((value: string) => parseFloat(value).toFixed(3)) ?? [],
        partiallyPaid: apiData?.chart?.partiallyPaid?.map((value: string) => parseFloat(value).toFixed(3)) ?? [],
      },
    };
    this.translate.get('MENUITEMS.TS.PAID').subscribe((paid: string) => {
      this.translate.get('MENUITEMS.TS.ORDERS').subscribe((orders: string) => {
        this.translate.get('MENUITEMS.TS.PARTIALY_PAID').subscribe((partialyPaid: string) => {
          this.translate.get('MENUITEMS.TS.UNPAID').subscribe((unpaid: string) => {
            this.analyticsChart = {
              chart: {
                height: 370,
                type: 'line',
                toolbar: {
                  show: false,
                },
              },
              stroke: {
                curve: 'straight',
                dashArray: [0, 0, 8],
                width: [2, 0, 2.2],
              },
              colors: colors,
              series: [
                {
                  name: orders,
                  type: 'area',
                  data: apiData?.chart?.orders,
                },
                {
                  name: paid,
                  type: 'bar',
                  data: apiData?.chart?.paid,
                },
                {
                  name: unpaid,
                  type: 'line',
                  data: apiData?.chart?.unpaid,
                },
                {
                  name: partialyPaid,
                  type: 'line',
                  data: apiData?.chart?.partiallyPaid,
                },
              ],
              fill: {
                opacity: [0.1, 0.9, 1],
              },
              labels: apiData?.labels,
              markers: {
                size: [0, 0, 0],
                strokeWidth: 2,
                hover: {
                  size: 4,
                },
              },
              xaxis: {
                categories: apiData?.categories,
                axisTicks: {
                  show: false,
                },
                axisBorder: {
                  show: false,
                },
              },
              grid: {
                show: true,
                xaxis: {
                  lines: {
                    show: true,
                  },
                },
                yaxis: {
                  lines: {
                    show: false,
                  },
                },
                padding: {
                  top: 0,
                  right: -2,
                  bottom: 15,
                  left: 10,
                },
              },
              legend: {
                show: true,
                horizontalAlign: 'center',
                offsetX: 0,
                offsetY: -5,
                markers: {
                  width: 9,
                  height: 9,
                  radius: 6,
                },
                itemMargin: {
                  horizontal: 10,
                  vertical: 0,
                },
              },
              plotOptions: {
                bar: {
                  columnWidth: '30%',
                  barHeight: '70%',
                },
              },
            };
          });
        });
      });
    });
  }

  toggleActivity() {
    const recentActivity = document.querySelector('.layout-rightside-col');
    if (recentActivity != null) {
      recentActivity.classList.toggle('d-none');
    }

    if (document.documentElement.clientWidth <= 767) {
      const recentActivity = document.querySelector('.layout-rightside-col');
      if (recentActivity != null) {
        recentActivity.classList.add('d-block');
        recentActivity.classList.remove('d-none');
      }
    }
  }

  sidebarHide() {
    const recentActivity = document.querySelector('.layout-rightside-col');
    if (recentActivity != null) {
      recentActivity.classList.remove('d-block');
    }
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.ecommerceAnalyticsService.orderNumberPageIndex = 0;
    this.ecommerceAnalyticsService.targetOrderNumbers$ = null;
  }
}
