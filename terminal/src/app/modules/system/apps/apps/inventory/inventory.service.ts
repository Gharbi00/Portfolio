import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';
import {
  InventoryIntegrationType,
  InventoryIntegrationInput,
  UpdateInventoryIntegrationGQL,
  GetInventoryIntegrationByTargetGQL,
} from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private inventoryIntegration: BehaviorSubject<InventoryIntegrationType> = new BehaviorSubject(null);

  get inventoryIntegration$(): Observable<InventoryIntegrationType> {
    return this.inventoryIntegration.asObservable();
  }
  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  constructor(
    private storageHelper: StorageHelper,
    private updateInventoryIntegrationGQL: UpdateInventoryIntegrationGQL,
    private getInventoryIntegrationByTargetGQL: GetInventoryIntegrationByTargetGQL,
  ) {}

  getInventoryIntegration(): Observable<InventoryIntegrationType> {
    return this.getInventoryIntegrationByTargetGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.inventoryIntegration.next(data.getInventoryIntegrationByTarget);
          return data.getInventoryIntegrationByTarget;
        }
      }),
    );
  }

  updateInventoryIntegration(id: string, input: InventoryIntegrationInput): Observable<InventoryIntegrationType> {
    return this.updateInventoryIntegrationGQL.mutate({ id, input }).pipe(
      map(({ data }: any) => {
        if (data) {
          return data.updateInventoryIntegration;
        }
      }),
    );
  }
}
