import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import {
  LanguageType,
  QuestActionType,
  WidgetIntegrationType,
  PerformPredefinedQuestByUserGQL,
} from '@sifca-monorepo/widget-generator';

@Injectable({
  providedIn: 'root',
})
export class CircularMenuService {
  private messageNotification: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private languageSubject: BehaviorSubject<LanguageType> = new BehaviorSubject(null);
  private walletPushNotification: BehaviorSubject<boolean> = new BehaviorSubject(null);
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

  get language$(): Observable<LanguageType> {
    return this.languageSubject.asObservable();
  }

  constructor(
    private performPredefinedQuestByUserGQL: PerformPredefinedQuestByUserGQL,
  ) {}

  public setLanguage(lang: any) {
    this.languageSubject.next(lang);
  }

  performPredefinedQuestByUser(quest: string): Observable<QuestActionType> {
    return this.performPredefinedQuestByUserGQL.mutate({ quest }).pipe(
      map(({ data }) => {
        return data.performPredefinedQuestByUser as any;
      }),
    );
  }
}
