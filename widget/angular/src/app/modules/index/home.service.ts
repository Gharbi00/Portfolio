import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { GetWidgetIntegrationByTargetGQL, PerformPredefinedQuestByUserGQL, QuestActionType, WidgetIntegrationType } from '@sifca-monorepo/widget-generator';
import { StorageHelper } from '@diktup/frontend/helpers';
import { LanguageType } from '@sifca-monorepo/widget-generator';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private languageSubject: BehaviorSubject<LanguageType> = new BehaviorSubject(null);
  private authenticated: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private walletPushNotification: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private messageNotification: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private widgetSettings: BehaviorSubject<WidgetIntegrationType> = new BehaviorSubject(null);

  get widgetSettings$(): Observable<WidgetIntegrationType> {
    return this.widgetSettings;
  }

  get walletPushedNotification$(): Observable<boolean> {
    return this.walletPushNotification.asObservable();
  }
  set walletPushedNotification$(value: any) {
    this.walletPushNotification.next(value);
  }
  get messageNotification$(): Observable<boolean> {
    return this.messageNotification.asObservable();
  }
  set messageNotification$(value: any) {
    this.messageNotification.next(value);
  }

  get authenticated$(): Observable<boolean> {
    return this.authenticated.asObservable();
  }
  set authenticated$(value: any) {
    this.authenticated.next(value);
  }
  get language$(): Observable<LanguageType> {
    return this.languageSubject.asObservable();
  }

  constructor(private getWidgetIntegrationByTargetGQL: GetWidgetIntegrationByTargetGQL, private performPredefinedQuestByUserGQL: PerformPredefinedQuestByUserGQL, private storageHelper: StorageHelper) {
    const accessToken = this.storageHelper.getData('elvkwdigttoken');
    if (accessToken) {
      this.authenticated.next(true);
    } else {
      this.authenticated.next(false);
    }
  }

  public setLanguage(lang: any) {
    this.languageSubject.next(lang);
  }

  getWidgetIntegrationByTarget(): Observable<WidgetIntegrationType> {
    return this.getWidgetIntegrationByTargetGQL.fetch({ target: { pos: (window as any).widgetInit.appId } }).pipe(
      map(({ data }) => {
        this.widgetSettings.next(data.getWidgetIntegrationByTarget as any);
        return data.getWidgetIntegrationByTarget as any;
      }),
    );
  }

  performPredefinedQuestByUser(quest: string): Observable<QuestActionType> {
    return this.performPredefinedQuestByUserGQL.mutate({ quest }).pipe(
      map(({ data }) => {
        return data.performPredefinedQuestByUser as any;
      }),
    );
  }
}
