import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import {
  PredefinedType,
  WidgetVisualsType,
  TranslationAppEnum,
  WidgetVisualsInput,
  InitWidgetVisualsGQL,
  ResetWidgetVisualGQL,
  StaticTranslationType,
  DeleteWidgetVisualsGQL,
  UpdateWidgetVisualsGQL,
  RefreshWidgetVisualsGQL,
  InitStaticTranslationsGQL,
  ResetStaticTranslationGQL,
  UpdateStaticTranslationGQL,
  DeleteStaticTranslationGQL,
  UpdateStaticTranslationInput,
  RefreshStaticTranslationsGQL,
  ActivityTypeWithActiveStatusType,
  TargetHasStaticTranslationsReferenceGQL,
  GetWidgetVisualsByTargetAndAppPaginatedGQL,
  GetStaticTranslationsByTargetAndLanguagePaginatedGQL,
} from '@sifca-monorepo/terminal-generator';
import {
  ActivityTypeType,
  ActivityTypeInput,
  WidgetIntegrationType,
  CreateActivityTypeGQL,
  UpdateActivityTypeGQL,
  WidgetIntegrationInput,
  GetPredefinedPaginatedGQL,
  UpdateWidgetIntegrationGQL,
  WidgetIntegrationActionsInput,
  GetWidgetIntegrationByTargetGQL,
  DisableWidgetIntegrationActionGQL,
  ActivateWidgetIntegrationActionGQL,
  GetPredefinedActivityTypesByTargetWithActiveStatusPaginatedGQL,
} from '@sifca-monorepo/terminal-generator';
import { StorageHelper } from '@diktup/frontend/helpers';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class WidgetService {
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private isLastPredefined: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private selectedStaticApp: BehaviorSubject<string> = new BehaviorSubject('web');
  private selectedVisualsApp: BehaviorSubject<string> = new BehaviorSubject('web');
  private predefined: BehaviorSubject<PredefinedType[]> = new BehaviorSubject(null);
  private widget: BehaviorSubject<WidgetIntegrationType> = new BehaviorSubject(null);
  private loadingActivityTypes: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private visualsPagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private loadingStaticTranslations: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private widgetVisuals: BehaviorSubject<WidgetVisualsType[]> = new BehaviorSubject(null);
  private loadingVisualsTranslations: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private staticTranslations: BehaviorSubject<StaticTranslationType[]> = new BehaviorSubject(null);
  private activityTypes: BehaviorSubject<ActivityTypeWithActiveStatusType[]> = new BehaviorSubject(null);

  pageIndex = 0;
  posId: string;
  pageLimit = 10;
  searchString = '';
  staticPageIndex = 0;
  staticPageLimit = 10;
  visualsPageIndex = 0;
  visualsPageLimit = 50;
  predefinedPageIndex = 0;
  predefinedPageLimit = 10;

  get isLastPredefined$(): Observable<boolean> {
    return this.isLastPredefined.asObservable();
  }
  get activityTypes$(): Observable<ActivityTypeWithActiveStatusType[]> {
    return this.activityTypes.asObservable();
  }
  set activityTypes$(value: any) {
    this.activityTypes.next(value);
  }

  get selectedStaticApp$(): Observable<string> {
    return this.selectedStaticApp.asObservable();
  }
  set selectedStaticApp$(value: any) {
    this.selectedStaticApp.next(value);
  }

  get selectedVisualsApp$(): Observable<string> {
    return this.selectedVisualsApp.asObservable();
  }
  set selectedVisualsApp$(value: any) {
    this.selectedVisualsApp.next(value);
  }

  get predefined$(): Observable<PredefinedType[]> {
    return this.predefined.asObservable();
  }
  set predefined$(value: any) {
    this.predefined.next(value);
  }

  get widget$(): Observable<WidgetIntegrationType> {
    return this.widget.asObservable();
  }
  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }
  get loadingActivityTypes$(): Observable<boolean> {
    return this.loadingActivityTypes.asObservable();
  }

  get loadingStaticTranslations$(): Observable<boolean> {
    return this.loadingStaticTranslations.asObservable();
  }

  get staticTranslations$(): Observable<StaticTranslationType[]> {
    return this.staticTranslations.asObservable();
  }
  set staticTranslations$(value: any) {
    this.staticTranslations.next(value);
  }

  get loadingVisualsTranslations$(): Observable<boolean> {
    return this.loadingVisualsTranslations.asObservable();
  }

  get visualsPagination$(): Observable<IPagination> {
    return this.visualsPagination.asObservable();
  }

  get widgetVisuals$(): Observable<WidgetVisualsType[]> {
    return this.widgetVisuals.asObservable();
  }

  constructor(
    private http: HttpClient,
    private storageHelper: StorageHelper,
    private initWidgetVisualsGQL: InitWidgetVisualsGQL,
    private resetWidgetVisualGQL: ResetWidgetVisualGQL,
    private createActivityTypeGQL: CreateActivityTypeGQL,
    private updateActivityTypeGQL: UpdateActivityTypeGQL,
    private updateWidgetVisualsGQL: UpdateWidgetVisualsGQL,
    private deleteWidgetVisualsGQL: DeleteWidgetVisualsGQL,
    private refreshWidgetVisualsGQL: RefreshWidgetVisualsGQL,
    private resetStaticTranslationGQL: ResetStaticTranslationGQL,
    private initStaticTranslationsGQL: InitStaticTranslationsGQL,
    private getPredefinedPaginatedGQL: GetPredefinedPaginatedGQL,
    private updateStaticTranslationGQL: UpdateStaticTranslationGQL,
    private deleteStaticTranslationGQL: DeleteStaticTranslationGQL,
    private updateWidgetIntegrationGQL: UpdateWidgetIntegrationGQL,
    private refreshStaticTranslationsGQL: RefreshStaticTranslationsGQL,
    private getWidgetIntegrationByTargetGQL: GetWidgetIntegrationByTargetGQL,
    private disableWidgetIntegrationActionGQL: DisableWidgetIntegrationActionGQL,
    private activateWidgetIntegrationActionGQL: ActivateWidgetIntegrationActionGQL,
    private targetHasStaticTranslationsReferenceGQL: TargetHasStaticTranslationsReferenceGQL,
    private getWidgetVisualsByTargetAndAppPaginatedGQL: GetWidgetVisualsByTargetAndAppPaginatedGQL,
    private getStaticTranslationsByTargetAndLanguagePaginatedGQL: GetStaticTranslationsByTargetAndLanguagePaginatedGQL,
    private getPredefinedActivityTypesByTargetWithActiveStatusPaginatedGQL: GetPredefinedActivityTypesByTargetWithActiveStatusPaginatedGQL,
  ) {}
  private ipApiUrl = 'https://jsonip.com';

  getPublicIp(): Observable<{ ip: string }> {
    return this.http.get<{ ip: string }>(this.ipApiUrl);
  }

  getWidgetVisualsByTargetAndAppPaginated(app: TranslationAppEnum): Observable<WidgetVisualsType[]> {
    this.loadingVisualsTranslations.next(true);
    return this.getWidgetVisualsByTargetAndAppPaginatedGQL
      .fetch({
        app,
        target: { pos: this.storageHelper.getData('posId') },
        pagination: { page: this.visualsPageIndex, limit: this.visualsPageLimit },
      })
      .pipe(
        map(({ data }: any) => {
          this.loadingVisualsTranslations.next(false);
          if (data) {
            this.visualsPagination.next({
              page: this.visualsPageIndex,
              size: this.visualsPageLimit,
              length: data.getWidgetVisualsByTargetAndAppPaginated?.count,
            });
            this.widgetVisuals.next(data.getWidgetVisualsByTargetAndAppPaginated.objects);
            return data.getWidgetVisualsByTargetAndAppPaginated?.objects;
          }
        }),
      );
  }

  refreshWidgetVisuals(app: TranslationAppEnum): Observable<WidgetVisualsType[]> {
    this.loadingVisualsTranslations.next(true);
    return this.refreshWidgetVisualsGQL
      .mutate({
        app,
        target: { pos: this.storageHelper.getData('posId') },
        pagination: { page: this.visualsPageIndex, limit: this.visualsPageLimit },
      })
      .pipe(
        map(({ data }: any) => {
          this.loadingVisualsTranslations.next(false);
          if (data) {
            this.visualsPagination.next({
              page: this.visualsPageIndex,
              size: this.visualsPageLimit,
              length: data.refreshWidgetVisuals?.count,
            });
            this.widgetVisuals.next(data.refreshWidgetVisuals.objects);
            return data.refreshWidgetVisuals?.objects;
          }
        }),
      );
  }

  resetWidgetVisual(app: TranslationAppEnum, reference: string): Observable<WidgetVisualsType> {
    return this.resetWidgetVisualGQL.mutate({ target: { pos: this.storageHelper.getData('posId') }, reference, app }).pipe(
      map(({ data }: any) => {
        if (data) {
          if (this.widgetVisuals.value?.length) {
            const widgetVisuals = this.widgetVisuals.value;
            const index = widgetVisuals?.findIndex((a) => a.reference === reference);
            widgetVisuals[index] = data.resetWidgetVisual;
            this.widgetVisuals.next(widgetVisuals);
          }
          return data.resetWidgetVisual;
        }
      }),
    );
  }

  initStaticTranslations(app: TranslationAppEnum, language: string): Observable<StaticTranslationType[]> {
    return this.initStaticTranslationsGQL
      .mutate({
        app,
        language,
        target: { pos: this.storageHelper.getData('posId') },
        pagination: { page: this.staticPageIndex, limit: this.staticPageLimit },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.pagination.next({
              page: this.staticPageIndex,
              size: this.staticPageLimit,
              length: data.initStaticTranslations?.count,
            });
            this.loadingStaticTranslations.next(false);
            this.staticTranslations.next(data.initStaticTranslations.objects);
            return data.initStaticTranslations;
          }
        }),
      );
  }

  getStaticTranslationsByTargetAndLanguagePaginated(language: string, app: TranslationAppEnum): Observable<StaticTranslationType[]> {
    this.loadingStaticTranslations.next(true);
    return this.getStaticTranslationsByTargetAndLanguagePaginatedGQL
      .fetch({
        app,
        language,
        searchString: this.searchString,
        target: { pos: this.storageHelper.getData('posId') },
        pagination: { page: this.staticPageIndex, limit: this.staticPageLimit },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.pagination.next({
              page: this.staticPageIndex,
              size: this.staticPageLimit,
              length: data.getStaticTranslationsByTargetAndLanguagePaginated?.count,
            });
            this.loadingStaticTranslations.next(false);
            this.staticTranslations.next(data.getStaticTranslationsByTargetAndLanguagePaginated.objects);
            return data.getStaticTranslationsByTargetAndLanguagePaginated?.objects;
          }
        }),
      );
  }

  refreshStaticTranslations(app: TranslationAppEnum, language: string): Observable<boolean> {
    return this.refreshStaticTranslationsGQL
      .mutate({
        app,
        language,
        target: { pos: this.storageHelper.getData('posId') },
        pagination: { page: this.staticPageIndex, limit: this.staticPageLimit },
      })
      .pipe(
        map(({ data }: any) => {
          this.loadingStaticTranslations.next(false);
          if (data) {
            this.pagination.next({
              page: this.staticPageIndex,
              size: this.staticPageLimit,
              length: data.refreshStaticTranslations?.count,
            });
            this.staticTranslations.next(data.refreshStaticTranslations.objects);
            return data.refreshStaticTranslations?.objects;
          }
        }),
      );
  }

  deleteStaticTranslation(id: string): Observable<boolean> {
    return this.deleteStaticTranslationGQL.mutate({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          const translations = this.staticTranslations.value.filter((item) => item.id !== id);
          this.staticTranslations.next(translations);
          return true;
        }
        return false;
      }),
    );
  }

  deleteWidgetVisuals(id: string): Observable<boolean> {
    return this.deleteWidgetVisualsGQL.mutate({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          const visuals = this.widgetVisuals.value.filter((item) => item.id !== id);
          this.widgetVisuals.next(visuals);
          return true;
        }
        return false;
      }),
    );
  }

  updateStaticTranslation(input: UpdateStaticTranslationInput): Observable<StaticTranslationType> {
    return this.updateStaticTranslationGQL.mutate({ input }).pipe(
      map(({ data }: any) => {
        if (data) {
          if (this.staticTranslations.value?.length) {
            const staticTranslations = this.staticTranslations.value;
            const index = staticTranslations?.findIndex((a) => a.id === input?.id);
            staticTranslations[index] = data.updateStaticTranslation;
            this.staticTranslations.next(staticTranslations);
          }
          return data.updateStaticTranslation;
        }
      }),
    );
  }

  updateWidgetVisuals(input: WidgetVisualsInput, id: string): Observable<StaticTranslationType> {
    return this.updateWidgetVisualsGQL.mutate({ id, input }).pipe(
      map(({ data }: any) => {
        if (data) {
          if (this.widgetVisuals.value?.length) {
            const widgetVisuals = this.widgetVisuals.value;
            const index = widgetVisuals?.findIndex((a) => a.id === id);
            widgetVisuals[index] = data.updateWidgetVisuals;
            this.widgetVisuals.next(widgetVisuals);
          }
          return data.updateWidgetVisuals;
        }
      }),
    );
  }

  initWidgetVisuals(app: TranslationAppEnum): Observable<StaticTranslationType[]> {
    return this.initWidgetVisualsGQL.mutate({ app, target: { pos: this.storageHelper.getData('posId') } }).pipe(
      map(({ data }: any) => {
        if (data) {
          return data.initWidgetVisuals;
        }
      }),
    );
  }

  resetStaticTranslation(app: TranslationAppEnum, reference: string, language: string): Observable<StaticTranslationType> {
    return this.resetStaticTranslationGQL.mutate({ target: { pos: this.storageHelper.getData('posId') }, reference, app, language }).pipe(
      map(({ data }: any) => {
        if (data) {
          if (this.staticTranslations.value?.length) {
            const staticTranslations = this.staticTranslations.value;
            const index = staticTranslations?.findIndex((a) => a.reference === reference);
            staticTranslations[index] = data.resetStaticTranslation;
            this.staticTranslations.next(staticTranslations);
          }
          return data.resetStaticTranslation;
        }
      }),
    );
  }

  targetHasStaticTranslationsReference(reference: string): Observable<boolean> {
    return this.targetHasStaticTranslationsReferenceGQL
      .fetch({
        app: TranslationAppEnum.WIDGET_WEB,
        reference,
        target: { pos: this.storageHelper.getData('posId') },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            return data.targetHasStaticTranslationsReference?.hasReference;
          }
        }),
      );
  }

  getPredefinedActivityTypesPaginated(): Observable<ActivityTypeWithActiveStatusType[]> {
    this.loadingActivityTypes.next(true);
    return this.getPredefinedActivityTypesByTargetWithActiveStatusPaginatedGQL
      .fetch({ target: { pos: this.storageHelper.getData('posId') }, pagination: { page: this.pageIndex, limit: this.pageLimit } })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.loadingActivityTypes.next(false);
            this.activityTypes.next(data.getPredefinedActivityTypesByTargetWithActiveStatusPaginated.objects);
            return data.getPredefinedActivityTypesByTargetWithActiveStatusPaginated.objects;
          }
        }),
      );
  }

  updateActivityType(id: string, input: ActivityTypeInput): Observable<ActivityTypeType> {
    return this.updateActivityTypeGQL.mutate({ id, input }).pipe(
      map(({ data }: any) => {
        if (data) {
          const activityTypes = this.activityTypes.value;
          const index = this.activityTypes.value?.findIndex((a) => a.id === id);
          activityTypes[index] = data.updateActivityType;
          this.activityTypes.next(activityTypes);
          return data.updateActivityType;
        }
        return null;
      }),
    );
  }

  createActivityType(input: ActivityTypeInput): Observable<ActivityTypeType> {
    return this.createActivityTypeGQL
      .mutate({ input: { ...input, predefined: { enable: false }, target: { pos: this.storageHelper.getData('posId') } } })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.activityTypes.next([data.createActivityType, ...(this.activityTypes.value || [])]);
            return data.createActivityType;
          }
        }),
      );
  }

  getPredefinedPaginated(): Observable<PredefinedType[]> {
    return this.getPredefinedPaginatedGQL.fetch({ pagination: { page: this.predefinedPageIndex, limit: this.predefinedPageLimit } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.isLastPredefined.next(data.getPredefinedPaginated.isLast);
          this.predefined.next([...(this.predefined.value || []), ...data.getPredefinedPaginated.objects]);
          return data.getPredefinedPaginated.objects;
        }
      }),
    );
  }

  getWidgetIntegrationByTarget(): Observable<WidgetIntegrationType> {
    return this.getWidgetIntegrationByTargetGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.widget.next(data.getWidgetIntegrationByTarget);
          return data.getWidgetIntegrationByTarget;
        }
      }),
    );
  }

  updateWidgetIntegration(id: string, input: WidgetIntegrationInput): Observable<WidgetIntegrationType> {
    return this.updateWidgetIntegrationGQL.mutate({ id, input }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.widget.next(data.updateWidgetIntegration);
          return data.updateWidgetIntegration;
        }
      }),
    );
  }

  activateWidgetIntegrationAction(id: string, input: WidgetIntegrationActionsInput): Observable<WidgetIntegrationType> {
    return this.activateWidgetIntegrationActionGQL.mutate({ id, input: { ...input, target: { pos: this.storageHelper.getData('posId') } } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.widget.next(data.activateWidgetIntegrationAction);
          return data.activateWidgetIntegrationAction;
        }
        return of(null);
      }),
    );
  }

  disableWidgetIntegrationAction(id: string, activity): Observable<WidgetIntegrationType> {
    return this.disableWidgetIntegrationActionGQL.mutate({ id, input: { activity, target: { pos: this.storageHelper.getData('posId') } } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.widget.next(data.disableWidgetIntegrationAction);
          return data.disableWidgetIntegrationAction;
        }
        return of(null);
      }),
    );
  }
}
