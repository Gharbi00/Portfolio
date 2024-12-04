import { values } from 'lodash';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { ChallengeType, QuestStatusEnum } from '@sifca-monorepo/terminal-generator';
import { QuestWithProgressType } from '@sifca-monorepo/terminal-generator';

import { ChallengesService } from '../challenges.service';
import { SharedService } from '../../../../../shared/services/shared.service';

@Component({
  selector: 'sifca-monorepo-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class ChallengeDetailsComponent implements OnInit {
  activeTab: number;
  compaignId: string;
  path: string;
  quest: QuestWithProgressType;
  status = values(QuestStatusEnum);
  loadingChallenge$: Observable<boolean> = this.challengesService.loadingChallenge$;
  challenge$: Observable<ChallengeType> = this.challengesService.challenge$;
  challengeId: string;

  constructor(
    private router: Router,
    private sharedService: SharedService,
    private activatedRoute: ActivatedRoute,
    private challengesService: ChallengesService,
  ) {
    const fullPath = this.router.url;
    const pathElements = fullPath.split('/');
    this.path = pathElements[pathElements.length - 1];
    if (this.path === 'leaderboard') {
      this.activeTab = 1;
    } else if (this.path === 'activities') {
      this.activeTab = 2;
    } else if (this.path === 'audience') {
      this.activeTab = 3;
    } else if (this.path === 'winners') {
      this.activeTab = 4;
    } else if (this.path === 'settings') {
      this.activeTab = 5;
    }
  }

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  ngOnInit() {
    this.challengeId = this.activatedRoute.snapshot.paramMap.get('id');
    this.challengesService.getChallengeById(this.challengeId).subscribe();
  }
}
