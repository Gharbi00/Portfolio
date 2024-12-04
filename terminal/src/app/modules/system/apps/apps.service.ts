import { map, find, findIndex } from 'lodash';
import { Injectable } from '@angular/core';
import { map as rxMap, take } from 'rxjs/operators';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';
import {
  TargetPluginType,
  CreateTargetPluginGQL,
  DeleteTargetPluginGQL,
  GetTargetPluginsByTargetGQL,
  PluginType,
  ErpElementsEnum,
  FindPluginByUrlGQL,
  PluginPaginatedType,
  GaRecommendedEventsEnum,
  FindPluginsPaginationGQL,
  PixelRecommendedEventsEnum,
  FbPixelType,
  FbCatalogSyncType,
  FbPixelUpdateInput,
  ErpIntegrationType,
  GoogleAnalyticsType,
  GetFbPixelByTargetGQL,
  UpdateFbCatalogSyncGQL,
  UpdateFacebookPixelGQL,
  UpdateErpIntegrationGQL,
  UpdateGoogleAnalyticsGQL,
  FbCatalogSyncUpdateInput,
  ErpIntegrationUpdateInput,
  GoogleAnalyticsUpdateInput,
  GetFbCatalogSyncByTargetGQL,
  GetErpIntegrationByTargetGQL,
  GetGoogleAnalyticsByTargetGQL,
  UpdateFacebookPixelEventStatusGQL,
  UpdateErpIntegrationEventStatusGQL,
  UpdateGoogleAnalyticsEventStatusGQL,
} from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class IntegrationAppsService {
  private plugin: BehaviorSubject<PluginType> = new BehaviorSubject(null);
  private fBPixel: BehaviorSubject<FbPixelType> = new BehaviorSubject(null);
  private plugins: BehaviorSubject<any[]> = new BehaviorSubject(null);
  private loadingPlugins: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private apps: BehaviorSubject<TargetPluginType[]> = new BehaviorSubject(null);
  private fbCatalogue: BehaviorSubject<FbCatalogSyncType> = new BehaviorSubject(null);
  private erpIntegration: BehaviorSubject<ErpIntegrationType> = new BehaviorSubject(null);
  private googleAnalytics: BehaviorSubject<GoogleAnalyticsType> = new BehaviorSubject(null);

  pageIndex = 0;
  pageLimit = 20;

  get apps$(): Observable<TargetPluginType[]> {
    return this.apps.asObservable();
  }
  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }
  get plugins$(): Observable<PluginType[]> {
    return this.plugins.asObservable();
  }
  get plugin$(): Observable<PluginType> {
    return this.plugin.asObservable();
  }
  get googleAnalytics$(): Observable<GoogleAnalyticsType> {
    return this.googleAnalytics.asObservable();
  }
  get erpIntegration$(): Observable<ErpIntegrationType> {
    return this.erpIntegration.asObservable();
  }
  get fBPixel$(): Observable<FbPixelType> {
    return this.fBPixel.asObservable();
  }
  get fbCatalogue$(): Observable<FbCatalogSyncType> {
    return this.fbCatalogue.asObservable();
  }
  get loadingPlugins$(): Observable<boolean> {
    return this.loadingPlugins.asObservable();
  }

  constructor(
    private storageHelper: StorageHelper,
    private findPluginByURLGQL: FindPluginByUrlGQL,
    private deleteTargetPluginGQL: DeleteTargetPluginGQL,
    private createTargetPluginGQL: CreateTargetPluginGQL,
    private getFbPixelByTargetGQL: GetFbPixelByTargetGQL,
    private updateFbCatalogSyncGQL: UpdateFbCatalogSyncGQL,
    private updateFacebookPixelGQL: UpdateFacebookPixelGQL,
    private updateErpIntegrationGQL: UpdateErpIntegrationGQL,
    private updateGoogleAnalyticsGQL: UpdateGoogleAnalyticsGQL,
    private findPluginsPaginationGQL: FindPluginsPaginationGQL,
    private getTargetPluginsByTargetGQL: GetTargetPluginsByTargetGQL,
    private getFbCatalogSyncByTargetGQL: GetFbCatalogSyncByTargetGQL,
    private getErpIntegrationByTargetGQL: GetErpIntegrationByTargetGQL,
    private getGoogleAnalyticsByTargetGQL: GetGoogleAnalyticsByTargetGQL,
    private updateFacebookPixelEventStatusGQL: UpdateFacebookPixelEventStatusGQL,
    private updateErpIntegrationEventStatusGQL: UpdateErpIntegrationEventStatusGQL,
    private updateGoogleAnalyticsEventStatusGQL: UpdateGoogleAnalyticsEventStatusGQL,
  ) {}

  getTargetPluginsByTarget(): Observable<TargetPluginType[]> {
    return this.getTargetPluginsByTargetGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      rxMap((response: any) => {
        if (response.data) {
          this.apps.next(response.data.getTargetPluginsByTarget);
          return response.data.getTargetPluginsByTarget;
        }
        return [];
      }),
    );
  }

  findPluginByURL(url: string): Observable<PluginType> {
    return this.findPluginByURLGQL.fetch({ url }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          this.plugin.next(data.findPluginByURL);
          return data.findPluginByURL;
        }
        return [];
      }),
    );
  }

  getGoogleAnalyticsByTarget(): Observable<GoogleAnalyticsType> {
    return this.getGoogleAnalyticsByTargetGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      rxMap(({ data }: any) => {
        this.googleAnalytics.next(data.getGoogleAnalyticsByTarget);
        return data.getGoogleAnalyticsByTarget;
      }),
    );
  }

  getErpIntegrationByTarget(): Observable<ErpIntegrationType> {
    return this.getErpIntegrationByTargetGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      rxMap(({ data }: any) => {
        this.erpIntegration.next(data.getErpIntegrationByTarget);
        return data.getErpIntegrationByTarget;
      }),
    );
  }

  getFBPixelByTarget(): Observable<FbPixelType> {
    return this.getFbPixelByTargetGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          this.fBPixel.next(data.getFBPixelByTarget);
          return data.getFBPixelByTarget;
        }
      }),
    );
  }

  getFBCatalogSyncByTarget(): Observable<FbCatalogSyncType> {
    return this.getFbCatalogSyncByTargetGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      rxMap(({ data }: any) => {
        this.fbCatalogue.next(data.getFBCatalogSyncByTarget);
        return data.getFBCatalogSyncByTarget;
      }),
    );
  }

  findPluginsPagination(): Observable<PluginPaginatedType> {
    return this.findPluginsPaginationGQL.fetch({ pagination: { page: this.pageIndex, limit: this.pageLimit } }).pipe(
      rxMap((response: any) => {
        this.pagination.next({
          page: this.pageIndex,
          size: this.pageLimit,
          length: response.data.findPluginsPagination?.count,
        });
        this.plugins.next(response.data.findPluginsPagination.objects);
        return response.data.findPluginsPagination;
      }),
    );
  }

  findPluginsWithAddedStatus(): Observable<any[]> {
    this.loadingPlugins.next(true);
    return forkJoin([
      this.getTargetPluginsByTargetGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }),
      this.findPluginsPaginationGQL.fetch({ pagination: { page: this.pageIndex, limit: this.pageLimit } }),
    ]).pipe(
      take(1),
      rxMap((response: any) => {
        const plugins = map(response[1].data.findPluginsPagination.objects, (plugin: any) => {
          if (find(response[0].data.getTargetPluginsByTarget, (targetPlugin) => targetPlugin.plugin.id === plugin.id)) {
            return { ...plugin, isAdded: true };
          }
          return { ...plugin, isAdded: false };
        });
        this.pagination.next({
          page: this.pageIndex,
          size: this.pageLimit,
          length: response[1].data.findPluginsPagination?.count,
        });
        this.loadingPlugins.next(false);
        this.apps.next(response[0].data.getTargetPluginsByTarget);
        this.plugins.next(plugins);
        return plugins;
      }),
    );
  }

  createTargetPlugin(pluginId: string): Observable<TargetPluginType[]> {
    return this.createTargetPluginGQL.mutate({ input: { plugin: pluginId, target: { pos: this.storageHelper.getData('posId') } } }).pipe(
      rxMap((response: any) => {
        if (response.data) {
          const index = findIndex(this.plugins.value, (plugin) => plugin?.id === pluginId);
          this.plugins.value[index].isAdded = true;
          this.apps.next([response.data.createTargetPlugin, ...this.apps.value]);
          return [response.data.createTargetPlugin, ...this.apps.value];
        }
      }),
    );
  }

  deleteTargetPlugin(id: string, selectedPluginId?: string): Observable<any[]> {
    return this.deleteTargetPluginGQL.mutate({ id }).pipe(
      rxMap((response: any) => {
        if (response.data) {
          const index = findIndex(this.plugins.value, (plugin) => plugin?.id === selectedPluginId);
          this.plugins.value[index].isAdded = false;
          return response.data.deleteTargetPlugin;
        }
      }),
    );
  }

  updateGoogleAnalytics(input: GoogleAnalyticsUpdateInput): Observable<GoogleAnalyticsType> {
    return this.updateGoogleAnalyticsGQL.mutate({ input }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          this.googleAnalytics.next(data.updateGoogleAnalytics);
          return data.updateGoogleAnalytics;
        }
      }),
    );
  }
  updateFacebookPixel(input: FbPixelUpdateInput): Observable<FbPixelType> {
    return this.updateFacebookPixelGQL.mutate({ input }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          this.fBPixel.next(data.updateFacebookPixel);
          return data.updateFacebookPixel;
        }
      }),
    );
  }
  updateGoogleAnalyticsEventStatus(event: GaRecommendedEventsEnum, status: boolean, id: string): Observable<GoogleAnalyticsType> {
    return this.updateGoogleAnalyticsEventStatusGQL.mutate({ event, status, id }).pipe(
      rxMap((response: any) => {
        if (response.data) {
          return response.data.updateGoogleAnalyticsEventStatus;
        }
      }),
    );
  }
  updateErpIntegrationEventStatus(event: ErpElementsEnum, status: boolean, id: string): Observable<ErpIntegrationType> {
    return this.updateErpIntegrationEventStatusGQL.mutate({ event, status, id }).pipe(
      rxMap((response: any) => {
        if (response.data) {
          return response.data.updateErpIntegrationEventStatus;
        }
      }),
    );
  }
  updateErpIntegration(input: ErpIntegrationUpdateInput): Observable<ErpIntegrationType> {
    return this.updateErpIntegrationGQL.mutate({ input }).pipe(
      rxMap((response: any) => {
        if (response.data) {
          return response.data.updateErpIntegration;
        }
      }),
    );
  }
  updateFacebookPixelEventStatus(event: PixelRecommendedEventsEnum, status: boolean, id: string): Observable<FbPixelType[]> {
    return this.updateFacebookPixelEventStatusGQL.mutate({ event, status, id }).pipe(
      rxMap((response: any) => {
        if (response.data) {
          return response.data.updateFacebookPixelEventStatus;
        }
      }),
    );
  }

  updateFBCatalogSync(input: FbCatalogSyncUpdateInput): Observable<FbCatalogSyncType> {
    return this.updateFbCatalogSyncGQL.mutate({ input }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          this.fbCatalogue.next(data.updateFBCatalogSync);
          return data.updateFBCatalogSync;
        }
      }),
    );
  }
}
