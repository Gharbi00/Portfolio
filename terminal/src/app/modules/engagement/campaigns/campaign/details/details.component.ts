import { values } from 'lodash';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { QuestStatusEnum } from '@sifca-monorepo/terminal-generator';
import { QuestWithProgressType } from '@sifca-monorepo/terminal-generator';

import { CampaignsService } from '../campaigns.service';
import { LoyaltyService } from '../../../../system/apps/apps/loyalty/loyalty.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'sifca-monorepo-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class CompaignDetailsComponent implements OnInit {

  activeTab = 1;
  selectedButton = 1
  compaignId: string;
  path: string;
  status = values(QuestStatusEnum);
  quest$: Observable<QuestWithProgressType> = this.campaignService.quest$;
  loadingQuest$: Observable<boolean> = this.campaignService.isLoadingQuest$;

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private sharedService: SharedService,
    private activatedRoute: ActivatedRoute,
    private loyaltyService: LoyaltyService,
    private campaignService: CampaignsService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    const fullPath = this.router.url;
    const pathElements = fullPath.split('/');
    this.path = pathElements[pathElements.length - 1];
    if (this.path === 'overview') {
      this.activeTab = this.campaignService.activeTab$ = 1;
    } else if (this.path === 'campaign') {
      this.campaignService.activeTab$ = 2;
    } else if (this.path === 'audience') {
      this.campaignService.activeTab$ = 3;
    } else if (this.path === 'budget') {
      this.campaignService.activeTab$ = 4;
    } else if (this.path === 'remuneration') {
      this.campaignService.activeTab$ = 5;
    } else if (this.path === 'settings') {
      this.campaignService.activeTab$ = 6;
    }
    this.campaignService.activeTab$.subscribe((activeTab) => {
      this.activeTab = activeTab;
      this.changeDetectorRef.markForCheck();
    });
  }

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  ngOnInit() {
    this.compaignId = this.activatedRoute.snapshot.paramMap.get('id');
    this.loyaltyService.findLoyaltySettingsByTarget().subscribe();
    this.campaignService.getQuestById(this.compaignId).subscribe();
  }

  openPreviewQrCode(content: any) {
    this.modalService.open(content);
  }
}
