import { Observable, Subject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, Input, Inject, PLATFORM_ID } from '@angular/core';

import { AccountsWithStatsType } from '@sifca-monorepo/terminal-generator';
import { CollaborationAnalyticsService } from '../../../../modules/dashboards/collaboration/collaboration.service';

@Component({
  selector: 'app-team-members',
  templateUrl: './team-members.component.html',
  styleUrls: ['./team-members.component.scss'],
})
export class TeamMembersComponent implements OnInit {
  // Team Members
  @Input() teamMembers: AccountsWithStatsType[];
  private unsubscribeAll: Subject<any> = new Subject<any>();

  isLastMember$: Observable<boolean> = this.collaborationAnalyticsService.isLastMember$;
  isBrowser: boolean;
  apxCharts: any[] = [];
  constructor(@Inject(PLATFORM_ID) private platformId: Object, private collaborationAnalyticsService: CollaborationAnalyticsService) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.teamMembers.forEach((member) => {
      const chartData = {
        series: [member.progress],
        chart: {
          type: 'radialBar',
          width: 36,
          height: 36,
          sparkline: {
            enabled: true,
          },
        },
        dataLabels: {
          enabled: false,
        },
        plotOptions: {
          radialBar: {
            hollow: {
              margin: 0,
              size: '50%',
            },
            track: {
              margin: 1,
            },
            dataLabels: {
              show: false,
            },
          },
        },
        colors: ['#405189'],
      };
      this.apxCharts.push(chartData);
    });
  }

  loadMembers() {
    this.collaborationAnalyticsService.accountsPageIndex += 1;
    this.collaborationAnalyticsService.getAccountsByTargetWithStatsPaginate().subscribe();
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
