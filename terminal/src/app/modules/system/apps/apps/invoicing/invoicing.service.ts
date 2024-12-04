import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { StorageHelper } from '@diktup/frontend/helpers';
import { TaxType, CreateTaxGQL, DeleteTaxGQL, GetTaxesByCompanyPaginatedGQL, TaxInput, UpdateTaxGQL } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class InvoicingService {
  private taxes: BehaviorSubject<TaxType[]> = new BehaviorSubject<TaxType[]>(null);

  get taxes$(): Observable<TaxType[]> {
    return this.taxes.asObservable();
  }

  constructor(
    private deleteTaxGQL: DeleteTaxGQL,
    private createTaxGQL: CreateTaxGQL,
    private updateTaxGQL: UpdateTaxGQL,
    private storageHelper: StorageHelper,
    private getTaxesByCompanyPaginatedGQL: GetTaxesByCompanyPaginatedGQL,
  ) {}

  getTaxesByCompanyPaginated(): Observable<TaxType[]> {
    return this.getTaxesByCompanyPaginatedGQL.fetch({ company: this.storageHelper.getData('company') }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.taxes.next(data.getTaxesByCompanyPaginated.objects);
          return data.getTaxesByCompanyPaginated.objects;
        }
      }),
    );
  }

  createTax(input: TaxInput): Observable<TaxType> {
    return this.createTaxGQL.mutate({ input }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.taxes.next([data.createTax, ...(this.taxes.value || [])]);
          return data.createTax;
        }
      }),
    );
  }

  updateTax(id: string, input: TaxInput): Observable<TaxType> {
    return this.updateTaxGQL.mutate({ id, input }).pipe(
      map(({ data }: any) => {
        if (data) {
          const taxes = this.taxes.value;
          const index = this.taxes.value?.findIndex((a) => a.id === id);
          taxes[index] = data.updateTax;
          this.taxes.next(taxes);
          return data.updateTax;
        }
      }),
    );
  }

  deleteTax(id: string): Observable<TaxType> {
    return this.deleteTaxGQL.mutate({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          const taxes = this.taxes.value.filter((a) => a.id !== id);
          this.taxes.next(taxes);
          return data.deleteTax;
        }
      }),
    );
  }
}
