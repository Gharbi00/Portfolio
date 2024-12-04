import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { StorageHelper } from '@diktup/frontend/helpers';
import { GetSmsIntegrationByTargetGQL, SmsIntegrationInput, SmsIntegrationType, UpdateSmsIntegrationGQL } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class SmsIntegrationService {
  private smsIntegration: BehaviorSubject<SmsIntegrationType> = new BehaviorSubject(null);
  private loadingSmsIntegration: BehaviorSubject<boolean> = new BehaviorSubject(null);

  get smsIntegration$(): Observable<SmsIntegrationType> {
    return this.smsIntegration.asObservable();
  }

  get loadingSmsIntegration$(): Observable<boolean> {
    return this.loadingSmsIntegration.asObservable();
  }

  constructor(
    private storageHelper: StorageHelper,
    private updateSmsIntegrationGQL: UpdateSmsIntegrationGQL,
    private getSmsIntegrationByTargetGQL: GetSmsIntegrationByTargetGQL,
  ) {}

  getSmsIntegrationByTarget(): Observable<SmsIntegrationType> {
    this.loadingSmsIntegration.next(true);
    return this.getSmsIntegrationByTargetGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.loadingSmsIntegration.next(false);
          this.smsIntegration.next(data.getSmsIntegrationByTarget);
          return data.getSmsIntegrationByTarget;
        }
      }),
    );
  }

  updateSmsIntegration(id: string, input: SmsIntegrationInput): Observable<SmsIntegrationType> {
    return this.updateSmsIntegrationGQL.mutate({ id, input }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.smsIntegration.next(data.updateSmsIntegration);
          return data.updateSmsIntegration;
        }
        return null;
      }),
    );
  }
}
