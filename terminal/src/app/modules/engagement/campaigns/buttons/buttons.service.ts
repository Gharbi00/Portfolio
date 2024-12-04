import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import {
  ActivityTypeWithActiveStatusType, PredefinedType,
  WidgetIntegrationType,
  WidgetIntegrationInput,
  WidgetIntegrationActionsInput,
  UpdateWidgetIntegrationGQL,
  GetWidgetIntegrationByTargetGQL,
  DisableWidgetIntegrationActionGQL,
  ActivateWidgetIntegrationActionGQL,
  GetPredefinedActivityTypesByTargetWithActiveStatusPaginatedGQL,
  GetPredefinedPaginatedGQL,
  CreateActivityTypeGQL,
  UpdateActivityTypeGQL,
  ActivityTypeInput,
  ActivityTypeType,
} from '@sifca-monorepo/terminal-generator';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({
  providedIn: 'root',
})
export class ButtonsService {
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private widget: BehaviorSubject<WidgetIntegrationType> = new BehaviorSubject(null);
  private loadingActivityTypes: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private activityTypes: BehaviorSubject<ActivityTypeWithActiveStatusType[]> = new BehaviorSubject(null);
  private predefined: BehaviorSubject<PredefinedType[]> = new BehaviorSubject(null);
  private isLastPredefined: BehaviorSubject<boolean> = new BehaviorSubject(null);

  pageIndex = 0;
  posId: string;
  pageLimit = 10;
  searchString = '';
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

  constructor(
    private storageHelper: StorageHelper,
    private createActivityTypeGQL: CreateActivityTypeGQL,
    private updateActivityTypeGQL: UpdateActivityTypeGQL,
    private getPredefinedPaginatedGQL: GetPredefinedPaginatedGQL,
    private updateWidgetIntegrationGQL: UpdateWidgetIntegrationGQL,
    private getWidgetIntegrationByTargetGQL: GetWidgetIntegrationByTargetGQL,
    private disableWidgetIntegrationActionGQL: DisableWidgetIntegrationActionGQL,
    private activateWidgetIntegrationActionGQL: ActivateWidgetIntegrationActionGQL,
    private getPredefinedActivityTypesByTargetWithActiveStatusPaginatedGQL: GetPredefinedActivityTypesByTargetWithActiveStatusPaginatedGQL,
  ) {}

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
      .mutate({
        input: { ...input, predefined: { enable: true, action: input.predefined.action }, target: { pos: this.storageHelper.getData('posId') } },
      })
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
