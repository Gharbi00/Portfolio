import { map, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import {
  PurchaseIntegrationType,
  HelpdeskIntegrationType,
  HelpdeskIntegrationInput,
  UpdateHelpdeskIntegrationGQL,
  GetHelpdeskIntegrationByTargetGQL,
} from '@sifca-monorepo/terminal-generator';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({
  providedIn: 'root',
})
export class HelpdeskService {
  private helpDesk: BehaviorSubject<HelpdeskIntegrationType> = new BehaviorSubject<HelpdeskIntegrationType>(null);

  get helpDesk$(): Observable<HelpdeskIntegrationType> {
    return this.helpDesk.asObservable();
  }

  constructor(
    private storageHelper: StorageHelper,
    private updateHelpdeskIntegrationGQL: UpdateHelpdeskIntegrationGQL,
    private getHelpdeskIntegrationByTargetGQL: GetHelpdeskIntegrationByTargetGQL,
  ) {}

  getHelpdeskIntegrationByTarget(): Observable<HelpdeskIntegrationType> {
    return this.getHelpdeskIntegrationByTargetGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      tap(({ data }: any) => {
        if (data) {
          this.helpDesk.next(data.getHelpdeskIntegrationByTarget);
          return data.getHelpdeskIntegrationByTarget;
        }
      }),
    );
  }

  updateHelpdeskIntegration(id: string, input: HelpdeskIntegrationInput): Observable<PurchaseIntegrationType> {
    return this.updateHelpdeskIntegrationGQL.mutate({ id, input: { ...input, target: { pos: this.storageHelper.getData('posId') } } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.helpDesk.next(data.updateHelpdeskIntegration);
          return data.updateHelpdeskIntegration;
        }
      }),
    );
  }
}
