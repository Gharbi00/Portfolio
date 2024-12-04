import { parse } from 'date-fns';
import format from 'date-fns/format';
import subYears from 'date-fns/subYears';
import subMonths from 'date-fns/subMonths';
import { map, reverse, times } from 'lodash';
import endOfToday from 'date-fns/endOfToday';
import startOfToday from 'date-fns/startOfToday';
import { isPlatformBrowser } from '@angular/common';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';

import { IPagination } from '@diktup/frontend/models';
import {
  AccountsWithStatsType,
  BoardCardType,
  CollaborationAnalyticsProjectsOverviewType,
  CollaborationAnalyticsProjectsStatusType,
  CollaborationAnalyticsStatsType,
  MessageGroupType,
  ProjectType,
} from '@sifca-monorepo/terminal-generator';

import { CollaborationAnalyticsService } from './collaboration.service';
import { SharedService } from '../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-dashboard-collaboration',
  templateUrl: './collaboration.component.html',
  styleUrls: ['./collaboration.component.scss'],
})
export class CollaborationDashboardComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChild('scrollRef') scrollRef: any;

  status7: any;
  statData!: any;
  projectPage = 0;
  currentDate: any;
  OverviewChart: any;
  isBrowser: boolean;
  filteredDate: Date;
  lastMonths: string[];
  dateNow: Date = new Date();
  breadCrumbItems!: Array<{}>;
  projectPageChanged: boolean;
  stats: CollaborationAnalyticsStatsType;
  projectsStatus: CollaborationAnalyticsProjectsStatusType;
  projectsOverview: CollaborationAnalyticsProjectsOverviewType;
  projects$: Observable<ProjectType[]> = this.collaborationAnalyticsService.projects$;
  isLastBoard$: Observable<boolean> = this.collaborationAnalyticsService.isLastBoard$;
  loadingStats$: Observable<boolean> = this.collaborationAnalyticsService.loadingStats$;
  loadingProjects$: Observable<boolean> = this.collaborationAnalyticsService.loadingProjects$;
  loadingAccounts$: Observable<boolean> = this.collaborationAnalyticsService.loadingAccounts$;
  accounts$: Observable<AccountsWithStatsType[]> = this.collaborationAnalyticsService.accounts$;
  projectsBoard$: Observable<BoardCardType[]> = this.collaborationAnalyticsService.projectsBoard$;
  messageGroups$: Observable<MessageGroupType[]> = this.collaborationAnalyticsService.messageGroups$;
  loadingProjectsBoard$: Observable<boolean> = this.collaborationAnalyticsService.loadingProjectsBoard$;
  loadingProjectStatus$: Observable<boolean> = this.collaborationAnalyticsService.loadingProjectStatus$;
  pagination: { length: any; page: any; size: any; lastPage: number; startIndex: number; endIndex: number };
  loadingProjectsOverview$: Observable<boolean> = this.collaborationAnalyticsService.loadingProjectsOverview$;

  filter = {
    from: subYears(startOfToday(), 2),
    to: endOfToday(),
  };
  selectedField: string;

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private sharedService: SharedService,
    private collaborationAnalyticsService: CollaborationAnalyticsService,
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    var dt = new Date();
    dt.setDate(dt.getDate() + 15);
    this.currentDate = { from: new Date(), to: dt };
    this.collaborationAnalyticsService.stats$.pipe(takeUntil(this.unsubscribeAll)).subscribe((stats: CollaborationAnalyticsStatsType) => {
      this.stats = stats;
      this.statData = this.transformStatsData(this.stats);
      this.changeDetectorRef.markForCheck();
    });
    this.collaborationAnalyticsService.projectsOverview$
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe((projectsOverview: CollaborationAnalyticsProjectsOverviewType) => {
        this.projectsOverview = projectsOverview;
        this.projectsOverviewChart(this.projectsOverview);
        this.changeDetectorRef.markForCheck();
      });
    this.collaborationAnalyticsService.projectsStatus$
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe((projectsStatus: CollaborationAnalyticsProjectsStatusType) => {
        this.projectsStatus = projectsStatus;
        this.projectStatusChart(this.projectsStatus);
        this.changeDetectorRef.markForCheck();
      });

    this.collaborationAnalyticsService.projectsPagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.collaborationAnalyticsService.projectsPageIndex || 0,
        size: this.collaborationAnalyticsService.projectsPageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.collaborationAnalyticsService.projectsPageIndex || 0) * this.collaborationAnalyticsService.projectsPageLimit,
        endIndex: Math.min(
          ((this.collaborationAnalyticsService.projectsPageIndex || 0) + 1) * this.collaborationAnalyticsService.projectsPageLimit - 1,
          pagination?.length - 1,
        ),
      };
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.DASHBOARDS').subscribe((dashboards: string) => {
      this.translate.get('MENUITEMS.TS.COLLABORATION').subscribe((collaboration: string) => {
        this.breadCrumbItems = [{ label: dashboards }, { label: collaboration, active: true }];
      });
    });
    this.collaborationAnalyticsService.getCollaborationAnalyticsStats(this.filter).subscribe();
    this.collaborationAnalyticsService.getCollaborationProjectsOverview(this.filter).subscribe();
    this.collaborationAnalyticsService.getCollaborationProjectsStatus(this.filter).subscribe();
    this.collaborationAnalyticsService.getProjectsByTargetWithFilter(this.filter).subscribe();
    this.collaborationAnalyticsService.getProjectsBoardCardsByTargetPaginated(this.filter).subscribe();
    this.collaborationAnalyticsService.getAccountsByTargetWithStatsPaginate().subscribe();
    this.collaborationAnalyticsService.getMessageGroupsPagination().subscribe();
    this.calculateLast4Months();
  }

  getValue(value: number): string {
    return Number.isFinite(value) ? value.toFixed(3) : '0.000';
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
    this.selectedField = field;
    this.collaborationAnalyticsService.getCollaborationProjectsOverview(filter).subscribe();
  }

  loadBoards() {
    this.collaborationAnalyticsService.boardPageIndex += 1;
    this.collaborationAnalyticsService.getProjectsBoardCardsByTargetPaginated(this.filter).subscribe();
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
    if (field === 'status') {
      this.collaborationAnalyticsService.getCollaborationProjectsStatus(filter).subscribe();
    } else if (field === 'tasks') {
      this.collaborationAnalyticsService.getProjectsBoardCardsByTargetPaginated(filter).subscribe();
    }
  }

  onChangeFilter(event: any) {
    this.filter = {
      from: event.selectedDates[0],
      to: event.selectedDates[1],
    };
    this.collaborationAnalyticsService.getCollaborationAnalyticsStats(this.filter).subscribe();
    this.collaborationAnalyticsService.getCollaborationProjectsOverview(this.filter).subscribe();
    this.collaborationAnalyticsService.getCollaborationProjectsStatus(this.filter).subscribe();
    this.collaborationAnalyticsService.getProjectsByTargetWithFilter(this.filter).subscribe();
    this.collaborationAnalyticsService.getProjectsBoardCardsByTargetPaginated(this.filter).subscribe();
  }

  ngAfterViewInit() {
    this.scrollRef.SimpleBar.getScrollElement().scrollTop = 600;
  }

  onProjectsPageChange(page: number) {
    this.projectPage = page;
    if (this.projectPage > 1) {
      this.projectPageChanged = true;
    }
    this.collaborationAnalyticsService.projectsPageIndex = page - 1;
    if (this.projectPageChanged) {
      this.collaborationAnalyticsService.getProjectsByTargetWithFilter(this.filter).subscribe();
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

  transformStatsData(apiData) {
    const transformedData = [];

    const iconMap = {
      activeProjects: 'briefcase',
      activeBoardCards: 'award',
      totalHours: 'clock',
    };

    const titleMap = {
      activeProjects: 'MENUITEMS.TS.ACTIVE_PROJECTS',
      activeBoardCards: 'MENUITEMS.TS.ACTIVE_BOARDS',
      totalHours: 'MENUITEMS.TS.TOTAL_HOURS',
    };

    for (const key in apiData) {
      if (apiData?.hasOwnProperty(key)) {
        const item = apiData[key];
        const profit = item.percentage > 0 ? 'up' : item.percentage < 0 ? 'down' : 'equal';
        const icon = iconMap[key];
        const month = titleMap[key];

        transformedData.push({
          title: month,
          value: item.value,
          icon,
          persantage: item.percentage, // .toFixed(2)
          profit,
          month,
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

  private projectsOverviewChart(apiData: any) {
    const colors = this.getChartColorsArray(['--vz-primary', '--vz-warning', '--vz-success']);

    this.translate.get('MENUITEMS.TS.NUMBER_OF_PROJECTS').subscribe((numberOfProjects: string) => {
      this.translate.get('MENUITEMS.TS.REVENUE').subscribe((revenue: string) => {
        this.translate.get('MENUITEMS.TS.ACTIVE_PROJECTS').subscribe((activeProjects: string) => {
          this.OverviewChart = {
            series: [
              {
                name: numberOfProjects,
                type: 'bar',
                data: apiData?.chart.totalProjects,
              },
              {
                name: revenue,
                type: 'area',
                data: apiData?.chart.revenue,
              },
              {
                name: activeProjects,
                type: 'bar',
                data: apiData?.chart.activeProjects,
              },
            ],
            chart: {
              height: 374,
              type: 'line',
              toolbar: {
                show: false,
              },
            },
            stroke: {
              curve: 'smooth',
              dashArray: [0, 3, 0],
              width: [0, 1, 0],
            },
            fill: {
              opacity: [1, 0.1, 1],
            },
            markers: {
              size: [0, 4, 0],
              strokeWidth: 2,
              hover: {
                size: 4,
              },
            },
            xaxis: {
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], // Define the months here
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
            colors: colors,
            tooltip: {
              shared: true,
              y: [
                {
                  formatter: function (y: any) {
                    if (typeof y !== 'undefined') {
                      return y.toFixed(0);
                    }
                    return y;
                  },
                },
                {
                  formatter: function (y: any) {
                    if (typeof y !== 'undefined') {
                      return '$' + y.toFixed(2) + 'k';
                    }
                    return y;
                  },
                },
                {
                  formatter: function (y: any) {
                    if (typeof y !== 'undefined') {
                      return y.toFixed(0);
                    }
                    return y;
                  },
                },
              ],
            },
          };
        });
      });
    });
  }

  setstatusvalue(value: any) {
    if (value == 'all') {
      this.status7.series = [125, 42, 58, 89];
    }
    if (value == '7') {
      this.status7.series = [25, 52, 158, 99];
    }
    if (value == '30') {
      this.status7.series = [35, 22, 98, 99];
    }
    if (value == '90') {
      this.status7.series = [105, 32, 68, 79];
    }
  }

  private projectStatusChart(apiData: any) {
    const colors = this.getChartColorsArray(['--vz-success', '--vz-primary', '--vz-warning', '--vz-danger']);

    const seriesData = [];
    const labels = [];

    for (const key in apiData?.chart) {
      if (apiData?.chart.hasOwnProperty(key)) {
        const item = apiData?.chart[key];
        seriesData.push(item.count);
        labels.push(key.charAt(0).toUpperCase() + key.slice(1));
      }
    }

    this.status7 = {
      series: seriesData,
      labels: labels,
      chart: {
        type: 'donut',
        height: 230,
      },
      plotOptions: {
        pie: {
          offsetX: 0,
          offsetY: 0,
          donut: {
            size: '90%',
            labels: {
              show: false,
            },
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      stroke: {
        lineCap: 'round',
        width: 0,
      },
      colors: colors,
    };
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.collaborationAnalyticsService.projectsPageIndex = 0;
    this.collaborationAnalyticsService.boardPageIndex = 0;
    this.collaborationAnalyticsService.projectsBoard$ = null;
    this.collaborationAnalyticsService.projects$ = null;
    this.collaborationAnalyticsService.accounts$ = null;
    this.collaborationAnalyticsService.accountsPageIndex = 0;
  }
}
