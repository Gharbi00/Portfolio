import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';

import { circle, latLng, tileLayer } from 'leaflet';
import { UserService } from '../../../core/services/user.service';

import { isPlatformBrowser } from '@angular/common';
import { AnalyticsService } from './analytics.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import {
  AnalyticsAudienceMetricsType,
  AnalyticsAudienceSessionsByCountryType,
  AnalyticsSessionsByCountriesType,
  AnalyticsStatsType,
  AnalyticsTopOperatingSystemsType,
  AnalyticsTopPagesType,
  // AnalyticsTopReferralPagesType,
  AnalyticsUsersByCountryType,
  AnalyticsUsersByDeviceType,
} from '@sifca-monorepo/terminal-generator';
import { capitalize, keys, map, reverse, times, values } from 'lodash';
import endOfToday from 'date-fns/endOfToday';
import startOfToday from 'date-fns/startOfToday';
import parse from 'date-fns/parse';
import subYears from 'date-fns/subYears';
import subMonths from 'date-fns/subMonths';
import format from 'date-fns/format';
import { SharedService } from '../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-dashboard-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  layers!: any;
  name: string;
  statData!: any;
  currentDate: any;
  filteredDate: Date;
  basicBarChart: any;
  isBrowser: boolean;
  audienceMetrics: any;
  basicColumnChart: any;
  simpleDonutChart: any;
  basicHeatmapChart: any;
  topOperatingSystem: any;
  stats: AnalyticsStatsType;
  dateNow: Date = new Date();
  breadCrumbItems!: Array<{}>;
  topPages: AnalyticsTopPagesType[];
  usersByDevice: AnalyticsUsersByDeviceType;
  userByCountries: AnalyticsUsersByCountryType;
  sessionsByCountries: AnalyticsSessionsByCountriesType[];
  sessionByCountry: AnalyticsAudienceSessionsByCountryType[];
  loadingStats$: Observable<boolean> = this.analyticsService.loadingStats$;
  loadingTopPages$: Observable<boolean> = this.analyticsService.loadingTopPages$;
  topPages$: Observable<AnalyticsTopPagesType[]> = this.analyticsService.topPages$;
  loadingUsersDevice$: Observable<boolean> = this.analyticsService.loadingUsersDevice$;
  loadingUserByCountry$: Observable<boolean> = this.analyticsService.loadingUserByCountry$;
  loadingAnalyticsMetrics$: Observable<boolean> = this.analyticsService.loadingAnalyticsMetrics$;
  loadingOperatingSystems$: Observable<boolean> = this.analyticsService.loadingOperatingSystems$;
  loadingAnalyticsAudience$: Observable<boolean> = this.analyticsService.loadingAnalyticsAudience$;
  loadingSessionsByCountries$: Observable<boolean> = this.analyticsService.loadingSessionsByCountries$;

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
  filter = {
    from: subYears(startOfToday(), 2),
    to: endOfToday(),
  };
  lastMonths: string[];
  selectedField: string;

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private userService: UserService,
    private sharedService: SharedService,
    private analyticsService: AnalyticsService,
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.userService.user$.subscribe((user) => {
      this.name = user.firstName;
    });
    var dt = new Date();
    dt.setDate(dt.getDate() + 15);
    this.currentDate = { from: '2023-06-10T08:06:15.426Z', to: new Date() };
    this.analyticsService.stats$.pipe(takeUntil(this.unsubscribeAll)).subscribe((stats: AnalyticsStatsType) => {
      this.stats = stats;
      this.statData = this.transformStatsData();
      this.changeDetectorRef.markForCheck();
    });
    this.analyticsService.userByCountries$.pipe(takeUntil(this.unsubscribeAll)).subscribe((userByCountries: AnalyticsUsersByCountryType) => {
      this.userByCountries = userByCountries;
      this.layers = this.transformUserByCountryData();
      this.changeDetectorRef.markForCheck();
    });
    this.analyticsService.sessionsByCountries$
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe((sessionsByCountries: AnalyticsSessionsByCountriesType[]) => {
        this.sessionsByCountries = sessionsByCountries;
        this.sessionsByCountriesChart(this.sessionsByCountries);
        this.changeDetectorRef.markForCheck();
      });
    this.analyticsService.audienceMetrics$.pipe(takeUntil(this.unsubscribeAll)).subscribe((audienceMetrics: AnalyticsAudienceMetricsType) => {
      this.audienceMetrics = audienceMetrics;
      this.audienceMetricsChart(this.audienceMetrics?.chart);
      this.changeDetectorRef.markForCheck();
    });
    this.analyticsService.sessionByCountry$
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe((sessionByCountry: AnalyticsAudienceSessionsByCountryType[]) => {
        this.sessionByCountry = sessionByCountry;
        this.audienceSessionsByCountryHeatmap(this.sessionByCountry);
      });
    this.analyticsService.usersByDevice$.pipe(takeUntil(this.unsubscribeAll)).subscribe((usersByDevice: AnalyticsUsersByDeviceType) => {
      this.usersByDevice = usersByDevice;
      this.usersByDeviceChart(this.usersByDevice);
      this.changeDetectorRef.markForCheck();
    });
    this.analyticsService.topOperatingSystem$
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe((topOperatingSystem: AnalyticsTopOperatingSystemsType) => {
        this.topOperatingSystem = topOperatingSystem;
        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.DASHBOARDS').subscribe((dashboards: string) => {
      this.translate.get('MENUITEMS.TS.ANALYTICS').subscribe((analytics: string) => {
        this.breadCrumbItems = [{ label: dashboards }, { label: analytics, active: true }];
      });
    });
    this.analyticsService.getAnalyticsStats({ from: this.filter?.from, to: this.filter?.to }).subscribe();
    this.analyticsService.getAnalyticsUserByCountry({ from: this.filter?.from, to: this.filter?.to }).subscribe();
    this.analyticsService.getAnalyticsSessionsByCountries({ from: this.filter?.from, to: this.filter?.to }).subscribe();
    this.analyticsService.getAnalyticsAudienceSessionsByCountry({ from: this.filter?.from, to: this.filter?.to }).subscribe();
    this.analyticsService.getAnalyticsAudienceMetrics({ from: this.filter?.from, to: this.filter?.to }).subscribe();
    this.analyticsService.getAnalyticsUsersByDevice({ from: this.filter?.from, to: this.filter?.to }).subscribe();
    this.analyticsService.getAnalyticsTopOperatingSystems({ from: this.filter?.from, to: this.filter?.to }).subscribe();
    this.analyticsService.getAnalyticsTopPages({ from: this.filter?.from, to: this.filter?.to }).subscribe();

    this.calculateLast4Months();
  }

  getValue(value: number): string {
    return Number.isFinite(value) ? value.toFixed(3) : '0.000';
  }

  monthFilter(field: string, item: string) {
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
    this.selectedField = field;
    if (item === 'sessionsByCountry') {
      this.analyticsService.getAnalyticsSessionsByCountries(filter).subscribe();
    } else {
      this.analyticsService.getAnalyticsAudienceMetrics(filter).subscribe();
    }
  }

  calculateLast4Months() {
    const currentDate = new Date();
    const lastMonth = subMonths(currentDate, 1);
    const last4Months = times(4, (index) => subMonths(lastMonth, index));
    this.lastMonths = reverse(map(last4Months, (date) => format(date, 'MMM yyyy')));
  }

  onChangeMonth(month: string, field: string) {
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
    if (field === 'sessionsByCountry') {
      this.analyticsService.getAnalyticsAudienceSessionsByCountry(filter).subscribe();
    } else if (field === 'userByDevice') {
      this.analyticsService.getAnalyticsUsersByDevice(filter).subscribe();
    } else {
      this.analyticsService.getAnalyticsTopPages(filter).subscribe();
    }
  }

  onChangeFilter(event: any) {
    const filter = {
      from: event.selectedDates[0],
      to: event.selectedDates[1],
    };
    this.analyticsService.getAnalyticsStats(filter).subscribe();
    this.analyticsService.getAnalyticsUserByCountry(filter).subscribe();
    this.analyticsService.getAnalyticsSessionsByCountries(filter).subscribe();
    this.analyticsService.getAnalyticsAudienceMetrics(filter).subscribe();
    this.analyticsService.getAnalyticsAudienceSessionsByCountry(filter).subscribe();
    this.analyticsService.getAnalyticsUsersByDevice(filter).subscribe();
    this.analyticsService.getAnalyticsTopOperatingSystems(filter).subscribe();
    this.analyticsService.getAnalyticsTopPages(filter).subscribe();
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

  selectvalue(x: any) {
    if (x === 'all') {
      this.sessionsByCountriesChart(this.sessionsByCountries);
    }
    if (x === '1M') {
      this.sessionsByCountriesChart(this.sessionsByCountries);
    }
    if (x === '6M') {
      this.sessionsByCountriesChart(this.sessionsByCountries);
    }
  }

  private sessionsByCountriesChart(data: any[]) {
    const colors = data?.map((item) => `--vz-${item.color}`);
    const categories = data?.map((item) => capitalize(item.country.name));
    this.translate.get('MENUITEMS.TS.SESSIONS').subscribe((sessions: string) => {
      this.basicBarChart = {
        series: [
          {
            data: data?.map((item) => item?.value),
            name: sessions,
          },
        ],
        chart: {
          type: 'bar',
          height: 436,
          toolbar: {
            show: false,
          },
        },
        plotOptions: {
          bar: {
            borderRadius: 4,
            horizontal: true,
            distributed: true,
            dataLabels: {
              position: 'top',
            },
          },
        },
        dataLabels: {
          enabled: true,
          offsetX: 32,
          style: {
            fontSize: '12px',
            fontWeight: 400,
            colors: ['#adb5bd'],
          },
        },
        colors: colors?.map((color) => getComputedStyle(document.documentElement).getPropertyValue(color)),
        legend: {
          show: false,
        },
        grid: {
          show: false,
        },
        xaxis: {
          categories: categories,
        },
      };
    });
  }

  changeAudienceMetricsInterval(chartData: any) {
    // TODO: change this to switch dates
    if (chartData) {
      this.translate.get('MENUITEMS.TS.LAST_YEAR').subscribe((lastYear: string) => {
        this.translate.get('MENUITEMS.TS.CURRENT_YEAR').subscribe((currentYear: string) => {
          this.basicColumnChart.series = [
            {
              name: lastYear,
              data: this.audienceMetrics.chart.last,
            },
            {
              name: currentYear,
              data: this.audienceMetrics.chart.current,
            },
          ];
        });
      });
    }
  }

  private audienceMetricsChart(chartData: any) {
    const colors = ['--vz-success', '--vz-gray-300'];
    const categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    this.translate.get('MENUITEMS.TS.LAST_YEAR').subscribe((lastYear: string) => {
      this.translate.get('MENUITEMS.TS.CURRENT_YEAR').subscribe((currentYear: string) => {
        this.basicColumnChart = {
          series: [
            {
              name: lastYear,
              data: chartData?.last,
            },
            {
              name: currentYear,
              data: chartData?.current,
            },
          ],
          chart: {
            type: 'bar',
            height: 306,
            stacked: true,
            toolbar: {
              show: false,
            },
          },
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: '20%',
              borderRadius: 6,
            },
          },
          dataLabels: {
            enabled: false,
          },
          legend: {
            show: true,
            position: 'bottom',
            horizontalAlign: 'center',
            fontWeight: 400,
            fontSize: '8px',
            offsetX: 0,
            offsetY: 0,
            markers: {
              width: 9,
              height: 9,
              radius: 4,
            },
          },
          stroke: {
            show: true,
            width: 2,
            colors: ['transparent'],
          },
          grid: {
            show: false,
          },
          colors: colors.map((color) => getComputedStyle(document.documentElement).getPropertyValue(color)), // Resolve CSS variables
          xaxis: {
            categories: categories,
            axisTicks: {
              show: false,
            },
          },
          yaxis: {
            title: {
              text: '$ (thousands)',
            },
          },
          fill: {
            opacity: 1,
          },
          tooltip: {
            y: {
              formatter: function (val: any) {
                return '$ ' + val + ' thousands';
              },
            },
          },
        };
      });
    });
  }

  private audienceSessionsByCountryHeatmap(heatmapData: any) {
    const colors = this.getChartColorsArray(['--vz-success', '--vz-info']);
    if (heatmapData?.length) {
      this.basicHeatmapChart = {
        series: heatmapData?.map((item: any) => {
          return {
            name: item.day,
            data: item.data.map((dataItem: any) => {
              return {
                x: dataItem.week,
                y: dataItem.value,
              };
            }),
          };
        }),
        chart: {
          height: 400,
          type: 'heatmap',
          offsetX: 0,
          offsetY: -8,
          toolbar: {
            show: false,
          },
        },
        dataLabels: {
          enabled: false,
        },
        legend: {
          show: true,
          horizontalAlign: 'center',
          offsetX: 0,
          offsetY: 20,
          markers: {
            width: 20,
            height: 6,
            radius: 2,
          },
          itemMargin: {
            horizontal: 12,
            vertical: 0,
          },
        },
        colors: colors,
        plotOptions: {
          heatmap: {
            colorScale: {
              ranges: [
                {
                  from: 0,
                  to: 50,
                  name: '0-50',
                  color: colors[0],
                },
                {
                  from: 51,
                  to: 100,
                  name: '51-100',
                  color: colors[1],
                },
              ],
            },
          },
        },
        xaxis: {
          type: 'category',
          categories: heatmapData[0]?.data.map((dataItem: any) => dataItem.week),
          labels: {
            style: {
              fontSize: '12px',
            },
          },
        },
        yaxis: {
          type: 'category',
          categories: heatmapData?.map((item: any) => item.day),
          labels: {
            style: {
              fontSize: '12px',
            },
          },
        },
        tooltip: {
          y: {
            formatter: function (y: any) {
              if (typeof y !== 'undefined') {
                return y.toFixed(0) + 'k';
              }
              return y;
            },
          },
        },
      };
    }
  }

  private usersByDeviceChart(data: any) {
    const colors = this.getChartColorsArray(['--vz-primary', '--vz-warning', '--vz-info']);
    const seriesData = data ? values(data)?.map((item: any) => item.value) : null;
    const labels = keys(data);
    this.simpleDonutChart = {
      series: seriesData,
      labels: labels,
      chart: {
        type: 'donut',
        height: 219,
      },
      plotOptions: {
        pie: {
          donut: {
            size: '76%',
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false,
        position: 'bottom',
        horizontalAlign: 'center',
        offsetX: 0,
        offsetY: 0,
        markers: {
          width: 20,
          height: 6,
          radius: 2,
        },
        itemMargin: {
          horizontal: 12,
          vertical: 0,
        },
      },
      stroke: {
        width: 0,
      },
      yaxis: {
        labels: {
          formatter: function (value: any) {
            return value + 'k' + ' Users';
          },
        },
        tickAmount: 4,
        min: 0,
      },
      colors: colors,
    };
  }

  transformStatsData() {
    const statData = [];
    const mappings = {
      users: {
        title: 'MENUITEMS.TS.USERS',
        icon: 'users',
        profit: 'up',
        icon_bg_color: 'bg-primary',
      },
      sessions: {
        title: 'MENUITEMS.TS.SESSIONS',
        icon: 'activity',
        profit: 'down',
        icon_bg_color: 'bg-danger',
      },
      conversions: {
        title: 'MENUITEMS.TS.CONVERSIONS',
        icon: 'clock',
        profit: 'down',
        icon_bg_color: 'bg-warning',
      },
      impressions: {
        title: 'MENUITEMS.TS.IMPRESSIONS',
        icon: 'external-link',
        profit: 'up',
        icon_bg_color: 'bg-success',
      },
    };
    for (const key in this.stats) {
      if (this.stats.hasOwnProperty(key) && mappings.hasOwnProperty(key)) {
        const mapping = mappings[key];
        const apiItem = this.stats[key];
        const statItem = {
          title: mapping.title,
          value: apiItem.value,
          icon: mapping.icon,
          persantage: apiItem.percentage,
          profit: apiItem.percentage >= 0 ? 'up' : 'down',
          icon_bg_color: mapping.icon_bg_color,
        };
        statData.push(statItem);
      }
    }
    return statData;
  }

  transformUserByCountryData() {
    const layers = [];
    for (const item of this.userByCountries?.layers || []) {
      const { coordination, radius } = item;
      const circleLayer = circle(latLng(+coordination.lat, +coordination.lng), {
        color: '#435fe3',
        opacity: 0.5,
        weight: 10,
        fillColor: '#435fe3',
        fillOpacity: 1,
        radius: radius,
      });
      layers.push(circleLayer);
    }
    return layers;
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
