import parse from 'date-fns/parse';
import format from 'date-fns/format';
import subYears from 'date-fns/subYears';
import subMonths from 'date-fns/subMonths';
import { map, reverse, times } from 'lodash';
import endOfToday from 'date-fns/endOfToday';
import startOfToday from 'date-fns/startOfToday';
import { circle, latLng, tileLayer } from 'leaflet';
import { isPlatformBrowser } from '@angular/common';
import { Observable, Subject, takeUntil } from 'rxjs';
import { SwiperComponent, SwiperDirective } from 'ngx-swiper-wrapper';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';

import { IPagination } from '@diktup/frontend/models';
import {
  EcommerceAnalyticsBestSellerType,
  SaleOrderType,
  SalesAnalyticsRevenueStatsType,
  SalesAnalyticsSalesByCountryType,
  SalesAnalyticsStatsType,
  SalesAnalyticsTopCatalogueCategoriesType,
} from '@sifca-monorepo/terminal-generator';

import { TopSelling } from './data';
import { SalesAnalyticsService } from './sales.service';
import { SharedService } from '../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-dashboard',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesDashboardComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChild(SwiperDirective) directiveRef?: SwiperDirective;
  @ViewChild(SwiperComponent, { static: false }) componentRef?: SwiperComponent;

  page = 0;
  layers: any;
  statData!: any;
  TopSelling: any;
  currentDate: any;
  isBrowser: boolean;
  lastMonths: string[];
  filteredDate: Date;
  analyticsChart!: any;
  pageChanged: boolean;
  selectedFilter: string;
  pagination: IPagination;
  salesCategoryChart!: any;
  dateNow: Date = new Date();
  breadCrumbItems!: Array<{}>;
  stats: SalesAnalyticsStatsType;
  bestSellerPagination: IPagination;
  revenueChart: SalesAnalyticsRevenueStatsType;
  salesByLocation: SalesAnalyticsSalesByCountryType;
  salesByCategory: SalesAnalyticsTopCatalogueCategoriesType[];
  saleOrder$: Observable<SaleOrderType[]> = this.salesAnalyticsService.saleOrder$;
  loadingRevenue$: Observable<boolean> = this.salesAnalyticsService.loadingRevenue$;
  loadingLocation$: Observable<boolean> = this.salesAnalyticsService.loadingLocation$;
  loadingSaleOrder$: Observable<boolean> = this.salesAnalyticsService.loadingSaleOrder$;
  loadingSalesCategory$: Observable<boolean> = this.salesAnalyticsService.loadingSalesCategory$;
  loadingOrderBestSeller$: Observable<boolean> = this.salesAnalyticsService.loadingOrderBestSeller$;
  bestSeller$: Observable<EcommerceAnalyticsBestSellerType[]> = this.salesAnalyticsService.bestSeller$;
  filter = {
    from: subYears(startOfToday(), 2),
    to: endOfToday(),
  };
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
  orderPageChanged: any;
  orderPage = 0;

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private sharedService: SharedService,
    private salesAnalyticsService: SalesAnalyticsService,
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    var dt = new Date();
    dt.setDate(dt.getDate() + 15);
    this.currentDate = { from: new Date(), to: dt };

    this.salesAnalyticsService.saleOrdersPagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.salesAnalyticsService.saleOrderPageIndex || 0,
        size: this.salesAnalyticsService.saleOrderPageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.salesAnalyticsService.saleOrderPageIndex || 0) * this.salesAnalyticsService.saleOrderPageLimit,
        endIndex: Math.min(
          ((this.salesAnalyticsService.saleOrderPageIndex || 0) + 1) * this.salesAnalyticsService.saleOrderPageLimit - 1,
          pagination?.length - 1,
        ),
      };
      this.changeDetectorRef.markForCheck();
    });

    this.salesAnalyticsService.bestSellerPagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.bestSellerPagination = {
        length: pagination?.length,
        page: this.salesAnalyticsService.bestSellerPageIndex || 0,
        size: this.salesAnalyticsService.bestSellerPageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.salesAnalyticsService.bestSellerPageIndex || 0) * this.salesAnalyticsService.bestSellerPageLimit,
        endIndex: Math.min(
          ((this.salesAnalyticsService.bestSellerPageIndex || 0) + 1) * this.salesAnalyticsService.bestSellerPageLimit - 1,
          pagination?.length - 1,
        ),
      };
      this.changeDetectorRef.markForCheck();
    });

    this.salesAnalyticsService.stats$.pipe(takeUntil(this.unsubscribeAll)).subscribe((stats: SalesAnalyticsStatsType) => {
      this.stats = stats;
      this.statData = this.transformStatsData(this.stats);
      this.changeDetectorRef.markForCheck();
    });
    this.salesAnalyticsService.revenueChart$.pipe(takeUntil(this.unsubscribeAll)).subscribe((revenueChart: SalesAnalyticsRevenueStatsType) => {
      this.revenueChart = revenueChart;
      this.transformRevenueChart(this.revenueChart);
      this.changeDetectorRef.markForCheck();
    });
    this.salesAnalyticsService.salesByLocation$
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe((salesByLocation: SalesAnalyticsSalesByCountryType) => {
        this.salesByLocation = salesByLocation;
        if (salesByLocation) {
          this.layers = this.salesByLocation?.layers.map((item) => {
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
        }
      });
    this.salesAnalyticsService.salesByCategory$
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe((salesByCategory: SalesAnalyticsTopCatalogueCategoriesType[]) => {
        this.salesByCategory = salesByCategory;
        this.salesByCategoryChart(this.salesByCategory);
        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.DASHBOARDS').subscribe((dashboards: string) => {
      this.translate.get('MENUITEMS.TS.DASHBOARD').subscribe((dashboard: string) => {
        this.breadCrumbItems = [{ label: dashboards }, { label: dashboard, active: true }];
      });
    });
    this.salesAnalyticsService.getSalesAnalyticsStats(this.filter).subscribe();
    this.salesAnalyticsService.getSalesRevenueChartStats(this.filter).subscribe();
    this.salesAnalyticsService.getSalesByLocation(this.filter).subscribe();
    this.salesAnalyticsService.getSalesTopCatalogueCategories(this.filter).subscribe();
    this.salesAnalyticsService.getSaleOrdersByTargetPaginated(this.filter).subscribe();
    this.salesAnalyticsService.getSalesOrdersBestSellerProductsWithFilterPaginated(this.filter).subscribe();

    this.calculateLast4Months();
    this.TopSelling = TopSelling;
  }

  calculateLast4Months() {
    const currentDate = new Date();
    const lastMonth = subMonths(currentDate, 1);
    const last4Months = times(4, (index) => subMonths(lastMonth, index));
    this.lastMonths = reverse(map(last4Months, (date) => format(date, 'MMM yyyy')));
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
    this.salesAnalyticsService.getSalesRevenueChartStats(filter).subscribe();
  }

  onChangeMonth(month: string, field: string) {
    const fromDate = parse(month, 'MMM yyyy', new Date());
    const filter = {
      from: fromDate,
      to: this.filter?.to,
    };
    if (field === 'bestSelling') {
      this.salesAnalyticsService.getSalesOrdersBestSellerProductsWithFilterPaginated(filter).subscribe();
    } else if (field === 'categories') {
      this.salesAnalyticsService.getSalesTopCatalogueCategories(filter).subscribe();
    }
  }

  onRecentOrderPageChange(page: number) {
    this.orderPage = page;
    if (this.orderPage > 1) {
      this.orderPageChanged = true;
    }
    this.salesAnalyticsService.saleOrderPageIndex = page - 1;
    if (this.orderPageChanged) {
      this.salesAnalyticsService.getSaleOrdersByTargetPaginated(this.filter).subscribe();
    }
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.salesAnalyticsService.bestSellerPageIndex = page - 1;
    if (this.pageChanged) {
      this.salesAnalyticsService.getSalesOrdersBestSellerProductsWithFilterPaginated(this.filter).subscribe();
    }
  }

  getValue(value: number): string {
    return Number.isFinite(value) ? value.toFixed(3) : '0.000';
  }

  onChangeFilter(event: any) {
    this.filter = {
      from: event.selectedDates[0],
      to: event.selectedDates[1],
    };
    this.salesAnalyticsService.getSalesAnalyticsStats(this.filter).subscribe();
    this.salesAnalyticsService.getSalesRevenueChartStats(this.filter).subscribe();
    this.salesAnalyticsService.getSalesByLocation(this.filter).subscribe();
    this.salesAnalyticsService.getSalesTopCatalogueCategories(this.filter).subscribe();
    this.salesAnalyticsService.getSalesOrdersBestSellerProductsWithFilterPaginated(this.filter).subscribe();
    this.salesAnalyticsService.getSaleOrdersByTargetPaginated(this.filter).subscribe();
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

  private transformRevenueChart(apiData: any) {
    const colorsArray = ['--vz-success', '--vz-primary', '--vz-danger', '--vz-warning'];
    const colors = this.getChartColorsArray(colorsArray);
    this.translate.get('MENUITEMS.TS.EARNINGS').subscribe((earnings: string) => {
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
                  name: earnings,
                  type: 'bar',
                  data: apiData?.chart?.paid,
                },
                {
                  name: partialyPaid,
                  type: 'line',
                  data: apiData?.chart?.partiallyPaid,
                },
                {
                  name: unpaid,
                  type: 'line',
                  data: apiData?.chart?.unpaid,
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

  async salesByCategoryChart(apiData: any) {
    const colors = this.getChartColorsArray(['--vz-primary', '--vz-success', '--vz-warning', '--vz-danger', '--vz-info']);
    const series = [];
    const labels = [];
    if (apiData?.length) {
      for (const item of apiData) {
        series.push(item.value);
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

    const titleMap = {
      totalEarnings: 'Total Earnings', //'MENUITEMS.TS.TOTAL_EARNINGS'
      orders: 'Orders', //'MENUITEMS.TS.ORDERS'
      partiallyPaidInvoices: 'Parialy Paid Invoice', //'MENUITEMS.TS.PARTIALY_PAID_INVOICE'
      unpaidInvoices: 'Unpaid Invoice', //'MENUITEMS.TS.UNPAID_INVOICES'
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

    return transformedData;
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

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.salesAnalyticsService.bestSellerPageIndex = 0;
    this.salesAnalyticsService.saleOrderPageIndex = 0;
  }
}
