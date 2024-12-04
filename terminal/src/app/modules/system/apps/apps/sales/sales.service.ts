import { tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { StorageHelper } from '@diktup/frontend/helpers';
import {
  GetSalesIntegrationByTargetGQL,
  SalesIntegrationInput,
  SalesIntegrationType,
  UpdateSalesIntegrationGQL,
} from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class SalesService {
  private salesIntegration: BehaviorSubject<SalesIntegrationType> = new BehaviorSubject<SalesIntegrationType>(null);

  pageIndex = 0;
  filterLimit = 10;
  searchString = '';
  pricePageIndex = 0;
  pricePageLimit = 10;
  priceSearchString = '';

  get salesIntegration$(): Observable<SalesIntegrationType> {
    return this.salesIntegration.asObservable();
  }

  constructor(
    private storageHelper: StorageHelper,
    private updateSalesIntegrationGQL: UpdateSalesIntegrationGQL,
    private getSalesIntegrationByTargetGQL: GetSalesIntegrationByTargetGQL,
  ) {}

  getSalesIntegrationByTarget(): Observable<SalesIntegrationType> {
    return this.getSalesIntegrationByTargetGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      tap(({ data }: any) => {
        if (data) {
          this.salesIntegration.next(data.getSalesIntegrationByTarget);
          return data.getSalesIntegrationByTarget;
        }
      }),
    );
  }

  updateSalesIntegration(id: string, input: SalesIntegrationInput): Observable<SalesIntegrationType> {
    return this.updateSalesIntegrationGQL.mutate({ id, input }).pipe(
      tap(({ data }: any) => {
        if (data) {
          this.salesIntegration.next(data.updateSalesIntegration);
          return data.updateSalesIntegration;
        }
      }),
    );
  }
}
