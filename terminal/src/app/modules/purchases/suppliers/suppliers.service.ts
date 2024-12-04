import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable, switchMap, take } from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';
import {
  CompanyGQL,
  CompanyInput,
  BarcodeInput,
  CreateCompanyGQL,
  UpdateCompanyGQL,
  DeleteCompanyGQL,
  CreateBarcodeGQL,
  CompanyUpdateInput,
  CompanyPaginateType,
  PaginatedSupplierType,
  SuccessResponseDtoType,
  ImportSuppliersByExcelGQL,
  SearchSuppliersByTargetGQL,
  GetSuppliersTemplateByExcelGQL,
  FindSuppliersByTargetPaginatedGQL,
  SearchCustomersByTargetAndPhaseGQL,
  SearchBarcodesByTargetAndSupplierGQL,
  AnalyticsDashboardInput,
  GetSuppliersStatsGQL,
  SupplliersDashboardType,
} from '@sifca-monorepo/terminal-generator';
import { InvoicePdfType } from '@sifca-monorepo/terminal-generator';
import { BarcodeType, CompanyType, CustomerPhaseEnum, DeleteResponseDtoType, SupplierTypeEnum } from '@sifca-monorepo/terminal-generator';

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private loadingStats: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private loadingBarcodes: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private supplier: BehaviorSubject<CompanyType> = new BehaviorSubject<CompanyType>(null);
  private paginationRange: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([0]);
  private loadingSuppliers: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private suppliersSearchString: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject<IPagination>(null);
  private isSuppliersLastPage: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private barcodes: BehaviorSubject<BarcodeType[]> = new BehaviorSubject<BarcodeType[]>(null);
  private suppliers: BehaviorSubject<CompanyType[]> = new BehaviorSubject<CompanyType[]>(null);
  private suppliersKinds: BehaviorSubject<SupplierTypeEnum[]> = new BehaviorSubject<SupplierTypeEnum[]>([]);
  private suppliersStats: BehaviorSubject<SupplliersDashboardType> = new BehaviorSubject<SupplliersDashboardType>(null);

  kinds = [];
  pageIndex = 0;
  filterLimit = 10;
  searchString = '';
  suppliersLimit = 10;
  suppliersPageIndex = 0;

  get loadingStats$(): Observable<boolean> {
    return this.loadingStats.asObservable();
  }
  get suppliers$(): Observable<CompanyType[]> {
    return this.suppliers.asObservable();
  }
  set suppliers$(value: any) {
    this.suppliers.next(value);
  }
  get suppliersKinds$(): Observable<SupplierTypeEnum[]> {
    return this.suppliersKinds.asObservable();
  }
  get supplier$(): Observable<CompanyType> {
    return this.supplier.asObservable();
  }
  get suppliersSearchString$(): Observable<string> {
    return this.suppliersSearchString.asObservable();
  }
  set suppliersSearchString$(value: any) {
    this.suppliersSearchString.next(value);
  }
  get paginationRange$(): Observable<number[]> {
    return this.paginationRange.asObservable();
  }
  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }
  get isLoading$(): Observable<boolean> {
    return this.isLoading.asObservable();
  }
  get isSuppliersLastPage$(): Observable<boolean> {
    return this.isSuppliersLastPage.asObservable();
  }
  get loadingSuppliers$(): Observable<boolean> {
    return this.loadingSuppliers.asObservable();
  }
  get barcodes$(): Observable<BarcodeType[]> {
    return this.barcodes.asObservable();
  }
  get loadingBarcodes$(): Observable<boolean> {
    return this.loadingBarcodes.asObservable();
  }
  get suppliersStats$(): Observable<SupplliersDashboardType> {
    return this.suppliersStats.asObservable();
  }

  constructor(
    private companyGQL: CompanyGQL,
    private storageHelper: StorageHelper,
    private createBarcodeGQL: CreateBarcodeGQL,
    private deleteCompanyGQL: DeleteCompanyGQL,
    private updateCompanyGQL: UpdateCompanyGQL,
    private createCompanyGQL: CreateCompanyGQL,
    private getSuppliersStatsGQL: GetSuppliersStatsGQL,
    private importSuppliersByExcelGQL: ImportSuppliersByExcelGQL,
    private searchSuppliersByTargetGQL: SearchSuppliersByTargetGQL,
    private getSuppliersTemplateByExcelGQL: GetSuppliersTemplateByExcelGQL,
    private findSuppliersByTargetPaginatedGQL: FindSuppliersByTargetPaginatedGQL,
    private searchCustomersByTargetAndPhaseGQL: SearchCustomersByTargetAndPhaseGQL,
    private searchBarcodesByTargetAndSupplierGQL: SearchBarcodesByTargetAndSupplierGQL,
  ) {}

  importSuppliersByExcel(base64: string): Observable<SuccessResponseDtoType> {
    return this.importSuppliersByExcelGQL
      .mutate({
        base64,
        target: { pos: this.storageHelper.getData('posId') },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            return data.importSuppliersByExcel;
          }
        }),
      );
  }

  getSuppliersTemplateByExcel(): Observable<InvoicePdfType> {
    return this.getSuppliersTemplateByExcelGQL.fetch().pipe(
      map(({ data }: any) => {
        if (data) {
          return data.getSuppliersTemplateByExcel.content;
        }
      }),
    );
  }

  createBarcode(input: BarcodeInput): Observable<BarcodeType> {
    return this.createBarcodeGQL.mutate({ input, target: { pos: this.storageHelper.getData('posId') } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.barcodes.next([data.createBarcode, ...this.barcodes.value]);
          return data.createBarcode;
        }
      }),
    );
  }

  createCustomerCompany(input: CompanyInput): Observable<CompanyType> {
    return this.createCompanyGQL
      .mutate({
        input: {
          ...input,
          target: { pos: this.storageHelper.getData('posId') },
          supplier: { kind: SupplierTypeEnum.FRANCHISE },
          customer: { phase: CustomerPhaseEnum.CUSTOMER },
        },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.suppliers.next([data.createCompany, ...this.suppliers.value]);
            return data.createCompany;
          }
        }),
      );
  }

  updateCustomerCompany(input: CompanyUpdateInput, id: string): Observable<CompanyType> {
    return this.updateCompanyGQL
      .mutate({
        id,
        input: {
          ...input,
        },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            const index = this.suppliers.value.map((a) => a.id).indexOf(id);
            const suppliers = this.suppliers.value;
            suppliers[index] = data.updateCompany;
            this.suppliers.next(this.suppliers.value);
            return data.updateCompany;
          }
        }),
      );
  }

  deleteCustomerCompany(id: string): Observable<DeleteResponseDtoType> {
    return this.deleteCompanyGQL.mutate({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          const companies = this.suppliers.value.filter((a) => a.id !== id);
          this.suppliers.next(companies);
          return data.deleteCompany;
        }
      }),
    );
  }

  getSuppliersStats(input: AnalyticsDashboardInput): Observable<SupplliersDashboardType> {
    this.loadingStats.next(true);
    return this.getSuppliersStatsGQL
      .fetch({
        input: { from: input?.from, to: input?.to, target: { pos: this.storageHelper.getData('posId') } },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.loadingStats.next(false);
            this.suppliersStats.next(data.getSuppliersStats);
            return data.getSuppliersStats;
          }
        }),
      );
  }

  searchBarcodesByTargetAndSupplier(supplier: string): Observable<BarcodeType[]> {
    this.loadingBarcodes.next(true);
    return this.searchBarcodesByTargetAndSupplierGQL
      .fetch({
        target: { pos: this.storageHelper.getData('posId') },
        searchString: this.searchString,
        supplier,
        pagination: { page: this.pageIndex, limit: this.filterLimit },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.pagination.next({
              page: this.pageIndex,
              size: this.filterLimit,
              length: data.searchBarcodesByTargetAndSupplier?.count,
            });
            this.loadingBarcodes.next(false);
            this.barcodes.next(data.searchBarcodesByTargetAndSupplier.objects);
            return data.searchBarcodesByTargetAndSupplier.objects;
          }
        }),
      );
  }

  searchCustomersByTarget(): Observable<CompanyPaginateType> {
    return this.searchCustomersByTargetAndPhaseGQL
      .fetch({
        phase: CustomerPhaseEnum.CUSTOMER,
        target: { pos: this.storageHelper.getData('posId') },
        pagination: { page: this.pageIndex, limit: this.filterLimit },
        searchString: this.searchString,
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.suppliers.next(data.searchCustomersByTargetAndPhase.objects);
            this.pagination.next({
              page: this.pageIndex,
              size: this.filterLimit,
              length: data.searchCustomersByTargetAndPhase?.count,
            });
            return data.searchCustomersByTargetAndPhase;
          }
        }),
      );
  }

  getWarehousesByCompanyPaginated(): Observable<PaginatedSupplierType> {
    return this.findSuppliersByTargetPaginatedGQL
      .fetch({
        target: { pos: this.storageHelper.getData('posId') },
        pagination: { page: this.pageIndex, limit: this.filterLimit },
      })
      .pipe(
        map(({ data }) => {
          this.pagination.next({
            page: this.pageIndex,
            size: this.filterLimit,
            length: data.findSuppliersByTargetPaginated?.count,
          });
          this.suppliers.next(data.findSuppliersByTargetPaginated.objects as any);
          return data.findSuppliersByTargetPaginated;
        }),
      ) as Observable<any>;
  }

  searchSuppliersByTarget(): Observable<CompanyPaginateType> {
    this.isLoading.next(true);
    return this.searchSuppliersByTargetGQL
      .fetch({
        target: { pos: this.storageHelper.getData('posId') },
        searchString: this.searchString,
        ...(this.kinds?.length ? { kinds: this.kinds } : {}),
        pagination: { page: this.pageIndex, limit: this.filterLimit },
      })
      .pipe(
        map(({ data }) => {
          this.pagination.next({
            page: this.pageIndex,
            size: this.filterLimit,
            length: data.searchSuppliersByTarget?.count,
          });
          this.suppliers.next(data.searchSuppliersByTarget.objects as any);
          this.isLoading.next(false);
          return data.searchSuppliersByTarget;
        }),
      ) as Observable<any>;
  }

  searchInfiniteSuppliersByTarget(): Observable<CompanyPaginateType> {
    this.loadingSuppliers.next(true);
    return combineLatest([this.suppliers$, this.suppliersKinds$, this.suppliersSearchString$]).pipe(
      take(1),
      switchMap(([suppliers, suppliersKinds, suppliersSearchString]) => {
        return this.searchSuppliersByTargetGQL
          .fetch({
            target: { pos: this.storageHelper.getData('posId') },
            ...(suppliersKinds?.length ? { kinds: suppliersKinds } : {}),
            ...(suppliersSearchString ? { searchString: suppliersSearchString } : {}),
            pagination: { page: this.suppliersPageIndex, limit: this.suppliersLimit },
          })
          .pipe(
            map(({ data }: any) => {
              this.pagination.next({
                page: this.pageIndex,
                size: this.filterLimit,
                length: data.searchSuppliersByTarget?.count,
              });
              this.isSuppliersLastPage.next(data.searchSuppliersByTarget.isLast);
              this.suppliers.next([...(suppliers?.length ? suppliers : []), ...data.searchSuppliersByTarget.objects]);
              this.loadingSuppliers.next(false);
              return data.searchSuppliersByTarget;
            }),
          );
      }),
    );
  }

  getCompanyById(id: string): Observable<CompanyType> {
    return this.companyGQL.fetch({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.supplier.next(data.company);
          return data.company;
        }
      }),
    );
  }
}
