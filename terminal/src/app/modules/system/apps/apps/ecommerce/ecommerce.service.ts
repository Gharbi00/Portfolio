import { Injectable } from '@angular/core';
import {
  CorporateEmailTemplateInput,
  CorporateEmailTemplateType,
  EmailTemplateTypeEnum,
  OrderSettingsInput,
  OrderSettingsFullType,
  DeliveryZonesInput,
  DeliveryZonesType,
  CreateCorporateEmailTemplateGQL,
  DeleteCorporateEmailTemplateGQL,
  GetCorporateEmailsByTargetPaginatedGQL,
  UpdateCorporateEmailTemplateGQL,
  CreateOrderSettingsGQL,
  GetOrderSettingsByTargetGQL,
  UpdateOrderSettingsGQL,
  UpdateDeliveryZoneGQL,
  CreateDeliveryZoneGQL,
  FindDeliveryZonesByTargetGQL,
  ReorderDeliveryZonesGQL,
  DeleteDeliveryZoneGQL,
  OrderSettingsUpdateInput,
} from '@sifca-monorepo/terminal-generator';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { StorageHelper } from '@diktup/frontend/helpers';
import { filter, findIndex } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class EcommerceService {
  private isLast: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingEmails: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private deliveryZones: BehaviorSubject<DeliveryZonesType[]> = new BehaviorSubject(null);
  private orderSettings: BehaviorSubject<OrderSettingsFullType> = new BehaviorSubject(null);
  private emails: BehaviorSubject<CorporateEmailTemplateType[]> = new BehaviorSubject(null);

  constructor(
    private storageHelper: StorageHelper,
    private updateDeliveryZoneGQL: UpdateDeliveryZoneGQL,
    private deleteDeliveryZoneGQL: DeleteDeliveryZoneGQL,
    private createDeliveryZoneGQL: CreateDeliveryZoneGQL,
    private updateOrderSettingsGQL: UpdateOrderSettingsGQL,
    private createOrderSettingsGQL: CreateOrderSettingsGQL,
    private reorderDeliveryZonesGQL: ReorderDeliveryZonesGQL,
    private getOrderSettingsByTargetGQL: GetOrderSettingsByTargetGQL,
    private findDeliveryZonesByTargetGQL: FindDeliveryZonesByTargetGQL,
    private deleteCorporateEmailTemplateGQL: DeleteCorporateEmailTemplateGQL,
    private updateCorporateEmailTemplateGQL: UpdateCorporateEmailTemplateGQL,
    private createCorporateEmailTemplateGQL: CreateCorporateEmailTemplateGQL,
    private getCorporateEmailsByTargetPaginatedGQL: GetCorporateEmailsByTargetPaginatedGQL,
  ) {}

  get orderSettings$(): Observable<OrderSettingsFullType> {
    return this.orderSettings.asObservable();
  }

  get deliveryZones$(): Observable<DeliveryZonesType[]> {
    return this.deliveryZones.asObservable();
  }

  get emails$(): Observable<CorporateEmailTemplateType[]> {
    return this.emails.asObservable();
  }

  get isLast$(): Observable<boolean> {
    return this.isLast.asObservable();
  }

  get loadingEmails$(): Observable<boolean> {
    return this.loadingEmails.asObservable();
  }

  getCorporateEmailsByTargetPaginated(): Observable<CorporateEmailTemplateType[]> {
    this.loadingEmails.next(true);
    return this.getCorporateEmailsByTargetPaginatedGQL
      .fetch({ target: { pos: this.storageHelper.getData('posId') }, pagination: { page: 0, limit: 20 } })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.loadingEmails.next(false);
            // this.emails.next(data.getCorporateEmailsByTargetPaginated.objects);
            this.emails.next(
              filter(data.getCorporateEmailsByTargetPaginated.objects, (email) =>
                [
                  EmailTemplateTypeEnum.INVOICE,
                  EmailTemplateTypeEnum.ARTICLE_DELIVERED,
                  EmailTemplateTypeEnum.ARTICLE_READY_FOR_PICKUP,
                  EmailTemplateTypeEnum.ARTICLE_CANCELED,
                  EmailTemplateTypeEnum.ARTICLE_CONFIRMED,
                ].some((template) => email.name.includes(template)),
              ),
            );
            this.isLast.next(data.getCorporateEmailsByTargetPaginated.isLast);
            return data.getCorporateEmailsByTargetPaginated.objects;
          }
        }),
      );
  }

  createCorporateEmailTemplate(input: CorporateEmailTemplateInput): Observable<CorporateEmailTemplateType> {
    return this.createCorporateEmailTemplateGQL.mutate({ input: { ...input, target: { pos: this.storageHelper.getData('posId') } } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.emails.next([data.createCorporateEmailTemplate, ...(this.emails.value || [])]);
          return data.createCorporateEmailTemplate;
        }
      }),
    );
  }

  deleteCorporateEmailTemplate(id: string): Observable<CorporateEmailTemplateInput> {
    return this.deleteCorporateEmailTemplateGQL.mutate({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          const emails = this.emails.value.filter((item) => item.id !== id);
          this.emails.next(emails);
          return data.deleteCorporateEmailTemplate;
        }
      }),
    );
  }

  updateCorporateEmailTemplate(id: string, input: CorporateEmailTemplateInput): Observable<CorporateEmailTemplateType> {
    return this.updateCorporateEmailTemplateGQL.mutate({ id, input }).pipe(
      map(({ data }: any) => {
        if (data) {
          const index = findIndex(this.emails.value, (email) => email?.id === id);
          this.emails.value[index] = data.updateCorporateEmailTemplate;
          this.emails.next(this.emails.value);
          return data.updateCorporateEmailTemplate;
        }
      }),
    );
  }

  getOrderSettings(): Observable<OrderSettingsFullType> {
    return this.getOrderSettingsByTargetGQL
      .fetch({
        target: { pos: this.storageHelper.getData('posId') },
      })
      .pipe(
        tap((response: any) => {
          if (response.data) {
            this.orderSettings.next(response.data.getOrderSettingsByTarget);
            return response.data.getOrderSettingsByTarget;
          }
          if (response.errors) {
            return this.createOrderSettings({ target: { pos: this.storageHelper.getData('posId') } });
          }
        }),
      );
  }

  findDeliveryZonesByTarget(): Observable<DeliveryZonesType[]> {
    return this.findDeliveryZonesByTargetGQL
      .fetch({
        target: { pos: this.storageHelper.getData('posId') },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.deliveryZones.next(data.findDeliveryZonesByTarget);
            return data.findDeliveryZonesByTarget;
          }
        }),
      );
  }

  createOrderSettings(input: OrderSettingsInput): Observable<OrderSettingsFullType> {
    return this.createOrderSettingsGQL.mutate({ input }).pipe(
      tap((response: any) => {
        if (response.data) {
          this.orderSettings.next(response.data.createOrderSettings);
          return response.data.createOrderSettings;
        }
      }),
    );
  }

  updateOrderSettings(id: string, input: OrderSettingsUpdateInput): Observable<OrderSettingsFullType> {
    return this.updateOrderSettingsGQL.mutate({ id, input }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.orderSettings.next(data.updateOrderSettings);
          return data.updateOrderSettings;
        }
      }),
    );
  }

  updateDeliveryZone(id: string, input: DeliveryZonesInput): Observable<DeliveryZonesType> {
    return this.updateDeliveryZoneGQL.mutate({ id, input }).pipe(
      tap(({ data }: any) => {
        if (data) {
          const zones = this.deliveryZones.value;
          const index = this.deliveryZones.value?.findIndex((a) => a.id === id);
          zones[index] = data.updateDeliveryZone;
          this.deliveryZones.next(zones);
          return data.updateDeliveryZone;
        }
      }),
    );
  }

  reorderDeliveryZones(deliveryZoneId: string, newOrder: number): Observable<DeliveryZonesType[]> {
    return this.reorderDeliveryZonesGQL.mutate({ target: { pos: this.storageHelper.getData('posId') }, deliveryZoneId, newOrder }).pipe(
      tap(({ data }: any) => {
        if (data) {
          this.deliveryZones.next(data.reorderDeliveryZones);
          return data.reorderDeliveryZones;
        }
      }),
    );
  }

  createDeliveryZone(input: DeliveryZonesInput): Observable<DeliveryZonesType> {
    return this.createDeliveryZoneGQL.mutate({ input: { ...input, target: { pos: this.storageHelper.getData('posId') } } }).pipe(
      tap(({ data }: any) => {
        if (data) {
          this.deliveryZones.next([data.createDeliveryZone, ...(this.deliveryZones.value || [])]);
          return data.createDeliveryZone;
        }
      }),
    );
  }

  deleteDeliveryZone(id: string): Observable<boolean> {
    return this.deleteDeliveryZoneGQL.mutate({ id }).pipe(
      map((response: any) => {
        if (response.data.deleteDeliveryZone) {
          const zones = this.deliveryZones.value.filter((item) => item.id !== id);
          this.deliveryZones.next(zones);
          return true;
        }
        return false;
      }),
    );
  }
}
