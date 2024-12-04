import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { StorageHelper } from '@diktup/frontend/helpers';
import {
  IntegrationIntegrationType,
  GetIntegrationIntegrationByTargetGQL,
  AddAccessApiToTargetGQL,
  UpdateIntegrationIntegrationGQL,
  IntegrationIntegrationInput,
} from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class IntegrationService {
  private integration: BehaviorSubject<IntegrationIntegrationType> = new BehaviorSubject(null);
  private loadingIntegration: BehaviorSubject<boolean> = new BehaviorSubject(null);

  get integration$(): Observable<IntegrationIntegrationType> {
    return this.integration.asObservable();
  }

  get loadingIntegration$(): Observable<boolean> {
    return this.loadingIntegration.asObservable();
  }

  constructor(
    private storageHelper: StorageHelper,
    private addAccessApiToTargetGQL: AddAccessApiToTargetGQL,
    private updateIntegrationIntegrationGQL: UpdateIntegrationIntegrationGQL,
    private getIntegrationIntegrationByTargetGQL: GetIntegrationIntegrationByTargetGQL,
  ) {}

  addAccessApiToTarget(id: string): Observable<IntegrationIntegrationType> {
    return this.addAccessApiToTargetGQL.mutate({ id }).pipe(
      map(({ data }: any) => {
        this.integration.next(data.addAccessApiToTarget);
        return data.addAccessApiToTarget;
      }),
    );
  }

  updateIntegrationIntegration(id: string, input: IntegrationIntegrationInput): Observable<IntegrationIntegrationType> {
    return this.updateIntegrationIntegrationGQL.mutate({ id, input: { ...input, target: { pos: this.storageHelper.getData('posId') } } }).pipe(
      map(({ data }: any) => {
        this.integration.next(data.updateIntegrationIntegration);
        return data.updateIntegrationIntegration;
      }),
    );
  }

  getIntegrationIntegrationByTarget(): Observable<IntegrationIntegrationType> {
    this.loadingIntegration.next(true);
    return this.getIntegrationIntegrationByTargetGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.loadingIntegration.next(false);
          this.integration.next(data.getIntegrationIntegrationByTarget);
          return data.getIntegrationIntegrationByTarget;
        }
      }),
    );
  }
}
