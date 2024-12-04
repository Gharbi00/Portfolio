import { Observable, combineLatest } from 'rxjs';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Resolve } from '@angular/router';

import { QuestWithProgressType } from '@sifca-monorepo/terminal-generator';

import { CampaignsService } from './campaigns.service';

@Injectable({
  providedIn: 'root',
})
export class CompaignResolver implements Resolve<any> {
  constructor(private campaignsService: CampaignsService) {}

  resolve(): Observable<any[]> {
    return combineLatest([this.campaignsService.getCampaignsStats(), this.campaignsService.findNonPredefinedQuestsByTarget()]);
  }
}

@Injectable({
  providedIn: 'root',
})
export class CompaignDetailsResolver implements Resolve<any> {
  constructor(private campaignService: CampaignsService, private activatedRoute: ActivatedRoute) {}

  resolve(): Observable<QuestWithProgressType> {
    return this.campaignService.getQuestById(this.activatedRoute.snapshot.paramMap.get('id'));
  }
}
