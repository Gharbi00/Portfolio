import { map, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { StorageHelper } from '@diktup/frontend/helpers';
import {
  GetPurchaseIntegrationByTargetGQL,
  SalesIntegrationInput,
  PurchaseIntegrationType,
  UpdatePurchaseIntegrationGQL,
} from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class PurchaseService {
  private purchaseIntegration: BehaviorSubject<PurchaseIntegrationType> = new BehaviorSubject<PurchaseIntegrationType>(null);

  pageIndex = 0;
  filterLimit = 10;
  searchString = '';
  pricePageIndex = 0;
  pricePageLimit = 10;
  priceSearchString = '';

  get purchaseIntegration$(): Observable<PurchaseIntegrationType> {
    return this.purchaseIntegration.asObservable();
  }

  constructor(
    private storageHelper: StorageHelper,
    private updatePurchaseIntegrationGQL: UpdatePurchaseIntegrationGQL,
    private getPurchaseIntegrationByTargetGQL: GetPurchaseIntegrationByTargetGQL,
  ) {}

  getPurchaseIntegrationByTarget(): Observable<PurchaseIntegrationType> {
    return this.getPurchaseIntegrationByTargetGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      tap(({ data }: any) => {
        if (data) {
          this.purchaseIntegration.next(data.getPurchaseIntegrationByTarget);
          return data.getPurchaseIntegrationByTarget;
        }
      }),
    );
  }

  updatePurchaseIntegration(id: string, input: SalesIntegrationInput): Observable<PurchaseIntegrationType> {
    return this.updatePurchaseIntegrationGQL.mutate({ id, input }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.purchaseIntegration.next(data.updatePurchaseIntegration);
          return data.updatePurchaseIntegration;
        }
      }),
    );
  }
}
