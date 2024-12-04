import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Resolve } from '@angular/router';

import { PipelineService } from './pipeline.service';
import { BoardWithListsAndCardsType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class PipelineResolver implements Resolve<any> {
  constructor(private pipelineService: PipelineService) {}

  resolve(): Observable<BoardWithListsAndCardsType> {
    return this.pipelineService.getCRMBoard();
  }
}
