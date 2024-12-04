import { Observable } from 'rxjs';
import { Resolve } from '@angular/router';
import { Injectable } from '@angular/core';

import { QuestTypeType } from '@sifca-monorepo/terminal-generator';

import { QuestTypeService } from './campaigns.service';

@Injectable({
  providedIn: 'root',
})
export class CampaignTypeResolver implements Resolve<any> {
  constructor(private questTypeService: QuestTypeService) {}

  resolve(): Observable<QuestTypeType[]> {
    return this.questTypeService.getQuestTypesByTargetPaginated();
  }
}
