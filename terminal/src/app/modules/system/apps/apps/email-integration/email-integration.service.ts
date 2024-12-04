import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { StorageHelper } from '@diktup/frontend/helpers';

import {
  EmailIntegrationInput,
  EmailIntegrationType,
  GetEmailIntegrationByTargetGQL,
  UpdateEmailIntegrationGQL,
} from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class EmailIntegrationService {
  private email: BehaviorSubject<EmailIntegrationType> = new BehaviorSubject(null);
  private loadingEmailIntegration: BehaviorSubject<boolean> = new BehaviorSubject(null);

  get email$(): Observable<EmailIntegrationType> {
    return this.email.asObservable();
  }

  get loadingEmailIntegration$(): Observable<boolean> {
    return this.loadingEmailIntegration.asObservable();
  }

  constructor(
    private storageHelper: StorageHelper,
    private updateEmailIntegrationGQL: UpdateEmailIntegrationGQL,
    private getEmailIntegrationByTargetGQL: GetEmailIntegrationByTargetGQL,
  ) {}

  getEmailIntegrationByTarget(): Observable<EmailIntegrationType> {
    this.loadingEmailIntegration.next(true);
    return this.getEmailIntegrationByTargetGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.loadingEmailIntegration.next(false);
          this.email.next(data.getEmailIntegrationByTarget);
          return data.getEmailIntegrationByTarget;
        }
      }),
    );
  }

  updateEmailIntegration(id: string, input: EmailIntegrationInput): Observable<EmailIntegrationType> {
    return this.updateEmailIntegrationGQL.mutate({ id, input }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.email.next(data.updateEmailIntegration);
          return data.updateEmailIntegration;
        }
        return null;
      }),
    );
  }
}
