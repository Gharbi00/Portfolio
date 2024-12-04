import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';

import { isPlatformBrowser } from '@angular/common';
import { CrmAnalyticsService } from './crm.service';
import { Observable, Subject, combineLatest, switchMap, takeUntil } from 'rxjs';
import {
  CrmAnalyticsBalanceOverviewType,
  CrmAnalyticsDealTypeType,
  CrmAnalyticsSalesForecastType,
  CrmAnalyticsStatsInfoType,
} from '@sifca-monorepo/terminal-generator';
import { fill, findIndex, indexOf, map, reduce, reverse, times, uniq, values } from 'lodash';
import {
  BoardCardPriorityEnum,
  BoardCardProcedureEnum,
  BoardCardProcedureType,
  BoardCardType,
  BoardListType,
  CrmKindEnum,
} from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import startOfToday from 'date-fns/startOfToday';
import endOfToday from 'date-fns/endOfToday';
import subYears from 'date-fns/subYears';
import subMonths from 'date-fns/subMonths';
import { format, parse } from 'date-fns';
import { SharedService } from '../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-dashboard-crm',
  templateUrl: './crm.component.html',
  styleUrls: ['./crm.component.scss'],
})
export class CrmComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  statData!: any;
  boardId: string;
  currentDate: any;
  upcommingPage = 0;
  boardCardPage = 0;
  dealTypeChart: any;
  isBrowser: boolean;
  splineAreaChart: any;
  pageChanged: boolean;
  lastMonths: string[];
  salesForecastChart: any;
  pagination: IPagination;
  dealPageChanged: boolean;
  breadCrumbItems!: Array<{}>;
  cardsPagination: IPagination;
  selectedTasks: string[] = [];
  selectedNames: string[] = [];
  selectedDeals: string[] = [];
  upcommingPageChanged: boolean;
  stats: CrmAnalyticsStatsInfoType;
  upcommingPagination: IPagination;
  boardCardsPagination: IPagination;
  dealType: CrmAnalyticsDealTypeType[];
  tasks = values(BoardCardProcedureEnum);
  priorities = values(BoardCardPriorityEnum);
  salesForecast: CrmAnalyticsSalesForecastType;
  balanceOverview: CrmAnalyticsBalanceOverviewType;
  boardList$: Observable<BoardListType[]> = this.crmAnalyticsService.boardList$;
  boardCards$: Observable<BoardCardType[]> = this.crmAnalyticsService.boardCards$;
  loadingCrmStats$: Observable<boolean> = this.crmAnalyticsService.loadingCrmStats$;
  crmSalesForecast$: Observable<boolean> = this.crmAnalyticsService.crmSalesForecast$;
  isLastProcedures$: Observable<boolean> = this.crmAnalyticsService.isLastProcedures$;
  loadingBoardCards$: Observable<boolean> = this.crmAnalyticsService.loadingBoardCards$;
  loadingGetCrmDealType$: Observable<boolean> = this.crmAnalyticsService.loadingGetCrmDealType$;
  loadingCardProcedures$: Observable<boolean> = this.crmAnalyticsService.loadingCardProcedures$;
  boardCardsByBoard$: Observable<BoardCardType[]> = this.crmAnalyticsService.boardCardsByBoard$;
  loadingBoardCardsByBoard$: Observable<boolean> = this.crmAnalyticsService.loadingBoardCardsByBoard$;
  loadingCrmBalancedOverview$: Observable<boolean> = this.crmAnalyticsService.loadingCrmBalancedOverview$;
  loadingUpcommingActivities$: Observable<boolean> = this.crmAnalyticsService.loadingUpcommingActivities$;
  upCommingActivities$: Observable<BoardCardProcedureType[]> = this.crmAnalyticsService.upCommingActivities$;
  crmBoardCardProcedures$: Observable<BoardCardProcedureType[]> = this.crmAnalyticsService.infiniteCrmBoardCardProcedures$;
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
    private crmAnalyticsService: CrmAnalyticsService,
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    var dt = new Date();
    dt.setDate(dt.getDate() + 15);
    this.currentDate = { from: new Date(), to: dt };
    this.crmAnalyticsService.stats$.pipe(takeUntil(this.unsubscribeAll)).subscribe((stats: CrmAnalyticsStatsInfoType) => {
      this.stats = stats;
      this.statData = this.transformApiData(this.stats);
      this.changeDetectorRef.markForCheck();
    });
    this.crmAnalyticsService.salesForecast$.pipe(takeUntil(this.unsubscribeAll)).subscribe((salesForecast: CrmAnalyticsSalesForecastType) => {
      this.salesForecast = salesForecast;
      this.salesForecastChartFetch(this.salesForecast);
      this.changeDetectorRef.markForCheck();
    });
    this.crmAnalyticsService.dealType$.pipe(takeUntil(this.unsubscribeAll)).subscribe((dealType: CrmAnalyticsDealTypeType[]) => {
      this.dealType = dealType;
      this.dealTypeChartFetch(this.dealType);
      this.changeDetectorRef.markForCheck();
    });
    this.crmAnalyticsService.balanceOverview$.pipe(takeUntil(this.unsubscribeAll)).subscribe((balanceOverview: CrmAnalyticsBalanceOverviewType) => {
      this.balanceOverview = balanceOverview;
      this.balanceOverviewChart(this.balanceOverview);
      this.changeDetectorRef.markForCheck();
    });

    this.crmAnalyticsService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.crmAnalyticsService.proceduresPageIndex || 0,
        size: this.crmAnalyticsService.proceduresPageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.crmAnalyticsService.proceduresPageIndex || 0) * this.crmAnalyticsService.proceduresPageLimit,
        endIndex: Math.min(
          ((this.crmAnalyticsService.proceduresPageIndex || 0) + 1) * this.crmAnalyticsService.proceduresPageLimit - 1,
          pagination?.length - 1,
        ),
      };
      this.changeDetectorRef.markForCheck();
    });

    this.crmAnalyticsService.upCommingActivitiesPagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.upcommingPagination = {
        length: pagination?.length,
        page: this.crmAnalyticsService.upcommingPageIndex || 0,
        size: this.crmAnalyticsService.upcommingPageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.crmAnalyticsService.upcommingPageIndex || 0) * this.crmAnalyticsService.upcommingPageLimit,
        endIndex: Math.min(
          ((this.crmAnalyticsService.upcommingPageIndex || 0) + 1) * this.crmAnalyticsService.upcommingPageLimit - 1,
          pagination?.length - 1,
        ),
      };
      this.changeDetectorRef.markForCheck();
    });

    this.crmAnalyticsService.cardsPagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.cardsPagination = {
        length: pagination?.length,
        page: this.crmAnalyticsService.cardsPageIndex || 0,
        size: this.crmAnalyticsService.cardsPageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.crmAnalyticsService.cardsPageIndex || 0) * this.crmAnalyticsService.cardsPageLimit,
        endIndex: Math.min(
          ((this.crmAnalyticsService.cardsPageIndex || 0) + 1) * this.crmAnalyticsService.cardsPageLimit - 1,
          pagination?.length - 1,
        ),
      };
      this.changeDetectorRef.markForCheck();
    });

    this.crmAnalyticsService.boardCardsPagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.boardCardsPagination = {
        length: pagination?.length,
        page: this.crmAnalyticsService.boardCardsPageIndex || 0,
        size: this.crmAnalyticsService.boardCardsPageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.crmAnalyticsService.boardCardsPageIndex || 0) * this.crmAnalyticsService.boardCardsPageLimit,
        endIndex: Math.min(
          ((this.crmAnalyticsService.boardCardsPageIndex || 0) + 1) * this.crmAnalyticsService.boardCardsPageLimit - 1,
          pagination?.length - 1,
        ),
      };
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.DASHBOARDS').subscribe((dashboards: string) => {
      this.translate.get('MENUITEMS.TS.CRM').subscribe((crm: string) => {
        this.breadCrumbItems = [{ label: dashboards }, { label: crm, active: true }];
      });
    });
    this.crmAnalyticsService.getCrmAnalyticsStats(this.filter).subscribe();
    this.crmAnalyticsService.getCrmAnalyticsSalesForecast(this.filter).subscribe();
    this.crmAnalyticsService.getCrmAnalyticsDealType(this.filter).subscribe();
    this.crmAnalyticsService.getCrmAnalyticsBalanceOverview(this.filter).subscribe();
    this.crmAnalyticsService.getCrmBoardCardProceduresWithFilter(this.filter).subscribe();
    this.crmAnalyticsService
      .getBoardCardsByCRMBoardWithFilterPaginated(this.filter)
      .pipe(
        switchMap((res) => {
          this.boardId = res[0]?.boardList?.board?.id;
          return combineLatest([
            this.crmAnalyticsService.getBoardListByBoard(this.boardId),
            this.crmAnalyticsService.getBoardCardsByBoardWithFilterPaginated(this.boardId),
          ]);
        }),
      )
      .subscribe();
    this.crmAnalyticsService.getUpcommingActivities(this.filter).subscribe();
    this.calculateLast4Months();
  }

  calculateLast4Months() {
    const currentDate = new Date();
    const lastMonth = subMonths(currentDate, 1);
    const last4Months = times(4, (index) => subMonths(lastMonth, index));
    this.lastMonths = reverse(map(last4Months, (date) => format(date, 'MMM yyyy')));
  }

  onChangeMonth(month: string, field: string) {
    const fromDate = parse(month, 'MMM yyyy', new Date());
    const filter = {
      from: fromDate,
      to: this.filter?.to,
    };
    if (field === 'sales') {
      this.crmAnalyticsService.getCrmAnalyticsSalesForecast(filter).subscribe();
    } else if (field === 'deal') {
      this.crmAnalyticsService.getCrmAnalyticsDealType(filter).subscribe();
    } else if (field === 'balance') {
      this.crmAnalyticsService.getCrmAnalyticsBalanceOverview(filter).subscribe();
    } else if (field === 'dealStatus') {
      this.crmAnalyticsService.getBoardCardsByCRMBoardWithFilterPaginated(filter).subscribe();
    }
  }

  onChangeDeal(isChecked: boolean, deal: string) {
    if (isChecked) {
      this.selectedDeals.push(deal);
    } else {
      const index = this.selectedDeals.indexOf(deal);
      if (index > -1) {
        this.selectedDeals.splice(index, 1);
      }
    }
    this.crmAnalyticsService.getBoardCardsByBoardWithFilterPaginated(this.boardId, this.selectedDeals as BoardCardPriorityEnum[]).subscribe();
  }

  onBoardListChange(isChecked: boolean, name: string) {
    if (isChecked) {
      this.selectedNames.push(name);
    } else {
      const index = this.selectedNames.indexOf(name);
      if (index > -1) {
        this.selectedNames.splice(index, 1);
      }
    }
    const input: any = {
      ...this.filter,
      status: this.selectedNames,
    };
    this.crmAnalyticsService.getBoardCardsByCRMBoardWithFilterPaginated(input).subscribe();
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.crmAnalyticsService.cardsPageIndex = page - 1;
    if (this.pageChanged) {
      this.crmAnalyticsService.getBoardCardsByCRMBoardWithFilterPaginated(this.filter).subscribe();
    }
  }

  onDealPageChange(page: number) {
    this.boardCardPage = page;
    if (this.boardCardPage > 1) {
      this.dealPageChanged = true;
    }
    this.crmAnalyticsService.boardCardsPageIndex = page - 1;
    if (this.dealPageChanged) {
      this.crmAnalyticsService.getBoardCardsByBoardWithFilterPaginated(this.boardId, this.selectedDeals as BoardCardPriorityEnum[]).subscribe();
    }
  }

  onActivitiesPageChange(page: number) {
    this.upcommingPage = page;
    if (this.page > 1) {
      this.upcommingPageChanged = true;
    }
    this.crmAnalyticsService.cardsPageIndex = page - 1;
    if (this.upcommingPageChanged) {
      this.crmAnalyticsService.getUpcommingActivities(this.filter).subscribe();
    }
  }

  onTaskChange(isChecked: boolean, task: string) {
    this.crmAnalyticsService.proceduresPageIndex = 0;
    this.crmAnalyticsService.infiniteCrmBoardCardProcedures$ = null;
    if (isChecked) {
      this.selectedTasks.push(task);
    } else {
      const index = this.selectedTasks.indexOf(task);
      if (index > -1) {
        this.selectedTasks.splice(index, 1);
      }
    }
    const input: any = {
      ...this.filter,
      task: this.selectedTasks,
    };
    this.crmAnalyticsService.getCrmBoardCardProceduresWithFilter(input).subscribe();
  }

  proceduresNextPage() {
    this.crmAnalyticsService.proceduresPageIndex += 1;
    this.crmAnalyticsService.getCrmBoardCardProceduresWithFilter(this.filter).subscribe();
  }

  onChangeFilter(event: any) {
    this.crmAnalyticsService.proceduresPageIndex = 0;
    this.crmAnalyticsService.cardsPageIndex = 0;
    const filter = {
      from: event.selectedDates[0],
      to: event.selectedDates[1],
    };
    this.filter = filter;
    this.crmAnalyticsService.getCrmAnalyticsStats(filter).subscribe();
    this.crmAnalyticsService.getCrmAnalyticsSalesForecast(filter).subscribe();
    this.crmAnalyticsService.getCrmAnalyticsDealType(filter).subscribe();
    this.crmAnalyticsService.getCrmAnalyticsBalanceOverview(filter).subscribe();
    this.crmAnalyticsService.getCrmBoardCardProceduresWithFilter(filter).subscribe();
    this.crmAnalyticsService.getBoardCardsByCRMBoardWithFilterPaginated(this.filter).subscribe();
    this.crmAnalyticsService.getUpcommingActivities(this.filter).subscribe();
  }

  private getChartColorsArray(colors: string[]) {
    return colors.map((value: string) => {
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

  private salesForecastChartFetch(data: any) {
    const colorsArray = ['--vz-primary', '--vz-warning', '--vz-success'];
    const colors = this.getChartColorsArray(colorsArray);
    this.translate.get('MENUITEMS.TS.GOAL').subscribe((goal: string) => {
      this.translate.get('MENUITEMS.TS.PENDING_FORCAST').subscribe((pendingForcast: string) => {
        this.translate.get('MENUITEMS.TS.REVENUE').subscribe((revenue: string) => {
          this.translate.get('MENUITEMS.TS.TOTAL_FORCAST_VALUE').subscribe((totalForcastValue: string) => {
            this.salesForecastChart = {
              series: [
                {
                  name: goal,
                  data: [data?.goal],
                },
                {
                  name: pendingForcast,
                  data: [data?.pending],
                },
                {
                  name: revenue,
                  data: [data?.revenue],
                },
              ],
              chart: {
                type: 'bar',
                height: 350,
                toolbar: {
                  show: false,
                },
              },
              plotOptions: {
                bar: {
                  horizontal: false,
                  columnWidth: '65%',
                },
              },
              stroke: {
                show: true,
                width: 5,
                colors: ['transparent'],
              },
              xaxis: {
                categories: [''],
                axisTicks: {
                  show: false,
                  borderType: 'solid',
                  color: '#78909C',
                  height: 6,
                  offsetX: 0,
                  offsetY: 0,
                },
                title: {
                  text: totalForcastValue,
                  offsetX: 0,
                  offsetY: -30,
                  style: {
                    color: '#78909C',
                    fontSize: '12px',
                    fontWeight: 400,
                  },
                },
              },
              yaxis: {
                labels: {
                  formatter: function (value: any) {
                    return '$' + value + 'k';
                  },
                },
                tickAmount: 4,
                min: 0,
              },
              fill: {
                opacity: 1,
              },
              legend: {
                show: true,
                position: 'bottom',
                horizontalAlign: 'center',
                fontWeight: 500,
                offsetX: 0,
                offsetY: -14,
                itemMargin: {
                  horizontal: 8,
                  vertical: 0,
                },
                markers: {
                  width: 10,
                  height: 10,
                },
              },
              colors: colors,
            };
          });
        });
      });
    });
  }

  setdealvalue(value: any) {
    if (value == 'today') {
      this.dealTypeChart.series = [
        {
          name: '< 100k$',
          data: [80, 50, 30, 40, 100, 20],
        },
        {
          name: '100k$ - 500k$',
          data: [20, 30, 40, 80, 20, 80],
        },
        {
          name: '500k$ <',
          data: [44, 76, 78, 13, 43, 10],
        },
      ];
    }
    if (value == 'weekly') {
      this.dealTypeChart.series = [
        {
          name: '< 100k$',
          data: [90, 40, 40, 20, 80, 50],
        },
        {
          name: '100k$ - 500k$',
          data: [50, 20, 30, 70, 30, 80],
        },
        {
          name: '500k$ <',
          data: [54, 76, 78, 23, 43, 50],
        },
      ];
    }
    if (value == 'monthly') {
      this.dealTypeChart.series = [
        {
          name: '< 100k$',
          data: [20, 50, 30, 50, 100, 80],
        },
        {
          name: '100k$ - 500k$',
          data: [80, 30, 70, 50, 30, 50],
        },
        {
          name: '500k$ <',
          data: [44, 56, 78, 53, 43, 10],
        },
      ];
    }
    if (value == 'yearly') {
      this.dealTypeChart.series = [
        {
          name: '< 100k$',
          data: [20, 50, 90, 40, 100, 20],
        },
        {
          name: '100k$ - 500k$',
          data: [50, 80, 40, 40, 10, 60],
        },
        {
          name: '500k$ <',
          data: [34, 96, 58, 23, 33, 40],
        },
      ];
    }
  }

  private dealTypeChartFetch(data: any[]) {
    if (data) {
      const years = uniq(data.map((item) => item.year.toString()));
      const colors = ['--vz-warning', '--vz-danger', '--vz-success'];
      this.dealTypeChart = {
        series: reduce(
          data,
          (accumulator, current) => {
            const index = findIndex(accumulator, {
              name: current.class === 1 ? '< 100k$' : current.class === 2 ? '100k$ - 500k$' : '500k$ <',
            });
            const yearIndex = indexOf(years, current.year.toString());
            if (index === -1) {
              const arrayData = fill(new Array(years.length), 0);
              arrayData[yearIndex] = current.value;
              accumulator.push({
                name: current.class === 1 ? '< 100k$' : current.class === 2 ? '100k$ - 500k$' : '500k$ <',
                data: arrayData,
              });
            } else {
              const arrayData = accumulator[index].data;
              arrayData[yearIndex] = current.value;
              accumulator[index] = {
                ...accumulator[index],
                data: arrayData,
              };
            }
            return accumulator;
          },
          [],
        ),
        chart: {
          height: 350,
          type: 'radar',
          dropShadow: {
            enabled: true,
            blur: 1,
            left: 1,
            top: 1,
          },
          toolbar: {
            show: false,
          },
        },
        stroke: {
          width: 2,
        },
        fill: {
          opacity: 0.2,
        },
        markers: {
          size: 0,
        },
        colors: colors.map((value) => getComputedStyle(document.documentElement).getPropertyValue(value).replace(' ', '')),
        xaxis: {
          categories: years.map((year) => year.toString()),
        },
      };
    }
  }

  setbalancevalue(value: any) {
    this.translate.get('MENUITEMS.TS.REVENUE').subscribe((revenue: string) => {
      this.translate.get('MENUITEMS.TS.EXPENSES').subscribe((expenses: string) => {
        if (value == 'today') {
          this.splineAreaChart.series = [
            {
              name: revenue,
              data: [20, 25, 30, 35, 40, 55, 70, 110, 150, 180, 210, 250],
            },
            {
              name: expenses,
              data: [12, 17, 45, 42, 24, 35, 42, 75, 102, 108, 156, 199],
            },
          ];
        }
        if (value == 'last_week') {
          this.splineAreaChart.series = [
            {
              name: revenue,
              data: [30, 35, 40, 45, 20, 45, 20, 100, 120, 150, 190, 220],
            },
            {
              name: expenses,
              data: [12, 17, 45, 52, 24, 35, 42, 75, 92, 108, 146, 199],
            },
          ];
        }
        if (value == 'last_month') {
          this.splineAreaChart.series = [
            {
              name: revenue,
              data: [20, 45, 30, 35, 40, 55, 20, 110, 100, 190, 210, 250],
            },
            {
              name: expenses,
              data: [62, 25, 45, 45, 24, 35, 42, 75, 102, 108, 150, 299],
            },
          ];
        }
        if (value == 'current_year') {
          this.splineAreaChart.series = [
            {
              name: revenue,
              data: [27, 25, 30, 75, 70, 55, 50, 120, 250, 180, 210, 250],
            },
            {
              name: expenses,
              data: [12, 17, 45, 42, 24, 35, 42, 75, 102, 108, 156, 199],
            },
          ];
        }
      });
    });
  }

  private balanceOverviewChart(apiData: any) {
    const colors = ['--vz-success', '--vz-danger'];
    this.translate.get('MENUITEMS.TS.REVENUE').subscribe((revenue: string) => {
      this.translate.get('MENUITEMS.TS.EXPENSES').subscribe((expenses: string) => {
        const seriesData = apiData?.chart.map((item: any) => {
          return {
            name: item.kind === CrmKindEnum.REVENUE ? revenue : expenses,
            data: item.data,
          };
        });

        this.splineAreaChart = {
          series: seriesData,
          chart: {
            height: 290,
            type: 'area',
            toolbar: 'false',
          },
          dataLabels: {
            enabled: false,
          },
          stroke: {
            curve: 'smooth',
            width: 2,
          },
          xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          },
          yaxis: {
            tickAmount: 5,
            min: 0,
            max: 260,
          },
          colors: this.getChartColorsArray(colors),
          fill: {
            opacity: 0.06,
            type: 'solid',
          },
        };
      });
    });
  }

  private transformApiData(apiData: any) {
    return [
      {
        title: 'MENUITEMS.TS.CAMPAIGN_SENT',
        value: apiData?.sent,
        icon: 'ri-space-ship-line',
        profit: +apiData?.sent >= 0 ? 'up' : 'down',
      },
      {
        title: 'MENUITEMS.TS.TOTAL_PROFIT',
        value: apiData?.totalProfit,
        icon: 'ri-exchange-dollar-line',
        profit: +apiData?.totalProfit >= 0 ? 'up' : 'down',
      },
      {
        title: 'MENUITEMS.TS.LEAD_CONVERSION',
        value: Math.abs(apiData?.leadConversion),
        icon: 'ri-pulse-line',
        profit: +apiData?.leadConversion >= 0 ? 'up' : 'down',
      },
      {
        title: 'MENUITEMS.TS.DAILY_AVERAGE_INCOME',
        value: apiData?.dailyIncome,
        icon: 'ri-trophy-line',
        profit: +apiData?.dailyIncome >= 0 ? 'up' : 'down',
      },
      {
        title: 'MENUITEMS.TS.TOTAL_DEALS',
        value: Math.abs(apiData?.totalDeals),
        icon: 'ri-service-line',
        profit: +apiData?.totalDeals >= 0 ? 'up' : 'down',
      },
    ];
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.crmAnalyticsService.proceduresPageIndex = 0;
    this.crmAnalyticsService.cardsPageIndex = 0;
    this.crmAnalyticsService.boardCardsPageIndex = 0;
    this.crmAnalyticsService.infiniteCrmBoardCardProcedures$ = null;
  }
}
