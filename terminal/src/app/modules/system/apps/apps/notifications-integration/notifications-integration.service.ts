import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { StorageHelper } from '@diktup/frontend/helpers';

import {
  NotificationIntegrationInput,
  NotificationIntegrationType,
  GetNotificationIntegrationByTargetGQL,
  UpdateNotificationIntegrationGQL,
} from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class NotificationIntegrationService {
  private notification: BehaviorSubject<NotificationIntegrationType> = new BehaviorSubject(null);
  private loadingNotifications: BehaviorSubject<boolean> = new BehaviorSubject(null);

  get notification$(): Observable<NotificationIntegrationType> {
    return this.notification.asObservable();
  }

  get loadingNotifications$(): Observable<boolean> {
    return this.loadingNotifications.asObservable();
  }

  constructor(
    private storageHelper: StorageHelper,
    private updateNotificationIntegrationGQL: UpdateNotificationIntegrationGQL,
    private getNotificationIntegrationByTargetGQL: GetNotificationIntegrationByTargetGQL,
  ) {}

  getNotificationIntegrationByTarget(): Observable<NotificationIntegrationType> {
    this.loadingNotifications.next(true);
    return this.getNotificationIntegrationByTargetGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.loadingNotifications.next(false);
          this.notification.next(data.getNotificationIntegrationByTarget);
          return data.getNotificationIntegrationByTarget;
        }
      }),
    );
  }

  updateNotificationIntegration(id: string, input: NotificationIntegrationInput): Observable<NotificationIntegrationType> {
    return this.updateNotificationIntegrationGQL.mutate({ id, input }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.notification.next(data.updateNotificationIntegration);
          return data.updateNotificationIntegration;
        }
        return null;
      }),
    );
  }
}
