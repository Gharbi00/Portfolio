import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, map as rxMap, switchMap, take } from 'rxjs/operators';

import { IPagination } from '@diktup/frontend/models';
import {
  MailResponseDto,
  BarcodeStatsType,
  DiscountDtoInput,
  ProductTaxesInput,
  BarcodeWithStockType,
  InvoicingProductsInput,
  InvoicingPricesCalculationType,
  InvoicePdfType,
  UserType,
  BarcodeType,
  BarcodeInput,
  AttributeType,
  BarcodeWithVarietyAndStructureFilterInput,
  BarcodeFindInput,
  SuccessResponseDtoType,
  BarcodeWithStockPaginatedType,
  BarcodeFilterResponseType,
  AttributeValuePaginateType,
  BarcodeUpdateInput,
  AttributeValueType,
  BarcodePaginateType,
  InternalProductType,
  GetPricesCalculationsGQL,
  GetBarcodeStatsGQL,
  DeleteBarcodeGQL,
  UpdateBarcodeGQL,
  CreateBarcodeGQL,
  GetServiceProductGQL,
  GetBarcodeWithStockGQL,
  CreateServiceProductGQL,
  SearchBarcodesByTargetGQL,
  SearchAttributeByTargetGQL,
  GetSimpleProductWithFilterGQL,
  GetSimpleServicesWithFilterGQL,
  GetCatalogueTemplateByExcelGQL,
  SendCatalogueTemplateBymailGQL,
  ImportServicesCatalogueByExcelGQL,
  CreateBarcodeForTargetWithStockGQL,
  SearchBarcodesByTargetWithStockGQL,
  GetBarcodeByProductAndAttributesGQL,
  GetSimpleBarcodeByBarcodeAndTargetGQL,
  AddBarcodeToInternalProductAndProductGQL,
  SearchSimpleBarcodesByTargetWithStockGQL,
  GetAttributeValuesByAttributePaginatedGQL,
  GetBarcodesWithVarietyAndStructureWithFilterGQL,
  GetBarcodesByTargetWithInternalProductPaginatedGQL,
} from '@sifca-monorepo/terminal-generator';

import { ProductsService } from '../products/products.service';
import { InventoryService } from '../../../../shared/services/inventory.service';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({
  providedIn: 'root',
})
export class BarcodeService {
  owners$: Observable<UserType[]> = this.productsService.owners$;
  technicians$: Observable<UserType[]> = this.productsService.technicians$;
  ownersPagination$: Observable<IPagination> = this.productsService.ownersPagination$;
  private isLastProducts: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private barcode: BehaviorSubject<BarcodeType> = new BehaviorSubject<BarcodeType>(null);
  private loadingBarcodes: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private isLastAttribute: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private barcodeSearchString: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private isBarcodeLastPage: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject<IPagination>(null);
  private barcodes: BehaviorSubject<BarcodeType[]> = new BehaviorSubject<BarcodeType[]>(null);
  private isLastAttributeValues: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  techniciansPagination$: Observable<IPagination> = this.productsService.techniciansPagination$;
  private valuesPagination: BehaviorSubject<IPagination> = new BehaviorSubject<IPagination>(null);
  private infinitBarcodes: BehaviorSubject<BarcodeWithStockType[]> = new BehaviorSubject<BarcodeWithStockType[]>(null);
  private attributesPagination: BehaviorSubject<IPagination> = new BehaviorSubject<IPagination>(null);
  private barcodeStats: BehaviorSubject<BarcodeStatsType> = new BehaviorSubject<BarcodeStatsType>(null);
  private infiniteAttributes: BehaviorSubject<AttributeType[]> = new BehaviorSubject<AttributeType[]>(null);
  private products: BehaviorSubject<InternalProductType[]> = new BehaviorSubject<InternalProductType[]>(null);
  private barcodeWithStock: BehaviorSubject<BarcodeWithStockType> = new BehaviorSubject<BarcodeWithStockType>(null);
  private toFilter: BehaviorSubject<BarcodeFilterResponseType> = new BehaviorSubject<BarcodeFilterResponseType>(null);
  private targetServiceProduct: BehaviorSubject<InternalProductType> = new BehaviorSubject<InternalProductType>(null);
  private infiniteAttributeValues: BehaviorSubject<AttributeValueType[]> = new BehaviorSubject<AttributeValueType[]>(null);
  private filter: BehaviorSubject<BarcodeWithVarietyAndStructureFilterInput> = new BehaviorSubject<BarcodeWithVarietyAndStructureFilterInput>(null);

  pageIndex = 0;
  filterLimit = 10;
  searchString = '';
  valuesPageIndex = 0;
  productPageIndex = 0;
  attributePageIndex = 0;

  get barcodeSearchString$(): Observable<string> {
    return this.barcodeSearchString.asObservable();
  }
  set barcodeSearchString$(value: any) {
    this.barcodeSearchString.next(value);
  }
  get loadingBarcodes$(): Observable<boolean> {
    return this.loadingBarcodes.asObservable();
  }
  set loadingBarcodes$(value: any) {
    this.loadingBarcodes.next(value);
  }
  set filter$(value: any) {
    this.filter.next(value);
  }
  get filter$(): Observable<BarcodeWithVarietyAndStructureFilterInput> {
    return this.filter.asObservable();
  }
  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }
  get attributesPagination$(): Observable<IPagination> {
    return this.attributesPagination.asObservable();
  }
  get barcodes$(): Observable<BarcodeType[]> {
    return this.barcodes.asObservable();
  }
  get infinitBarcodes$(): Observable<BarcodeWithStockType[]> {
    return this.infinitBarcodes.asObservable();
  }
  set infinitBarcodes$(value: any) {
    this.infinitBarcodes.next(value);
  }
  get barcode$(): Observable<BarcodeType> {
    return this.barcode.asObservable();
  }
  get barcodeWithStock$(): Observable<BarcodeWithStockType> {
    return this.barcodeWithStock.asObservable();
  }
  set barcodeWithStock$(value: any) {
    this.barcodeWithStock.next(value);
  }
  get barcodeStats$(): Observable<BarcodeStatsType> {
    return this.barcodeStats.asObservable();
  }
  set barcode$(value: any) {
    this.barcode.next(value);
  }
  get isBarcodeLastPage$(): Observable<boolean> {
    return this.isBarcodeLastPage.asObservable();
  }
  get infiniteAttributes$(): Observable<AttributeType[]> {
    return this.infiniteAttributes.asObservable();
  }
  set infiniteAttributes$(value: any) {
    this.infiniteAttributes.next(value);
  }
  get isLastAttributeValues$(): Observable<boolean> {
    return this.isLastAttributeValues.asObservable();
  }
  get infiniteAttributeValues$(): Observable<AttributeValueType[]> {
    return this.infiniteAttributeValues.asObservable();
  }
  set infiniteAttributeValues$(value: any) {
    this.infiniteAttributeValues.next(value);
  }
  get valuesPagination$(): Observable<IPagination> {
    return this.valuesPagination.asObservable();
  }
  get isLastAttribute$(): Observable<boolean> {
    return this.isLastAttribute.asObservable();
  }
  get isLastProducts$(): Observable<boolean> {
    return this.isLastProducts.asObservable();
  }
  get toFilter$(): Observable<BarcodeFilterResponseType> {
    return this.toFilter.asObservable();
  }
  get targetServiceProduct$(): Observable<InternalProductType> {
    return this.targetServiceProduct.asObservable();
  }
  get products$(): Observable<InternalProductType[]> {
    return this.products.asObservable();
  }
  set products$(value: any) {
    this.products.next(value);
  }

  constructor(
    private storageHelper: StorageHelper,
    private productsService: ProductsService,
    private createBarcodeGQL: CreateBarcodeGQL,
    private deleteBarcodeGQL: DeleteBarcodeGQL,
    private inventoryService: InventoryService,
    private updateBarcodeGQL: UpdateBarcodeGQL,
    private getBarcodeStatsGQL: GetBarcodeStatsGQL,
    private getServiceProductGQL: GetServiceProductGQL,
    private getBarcodeWithStockGQL: GetBarcodeWithStockGQL,
    private createServiceProductGQL: CreateServiceProductGQL,
    private getPricesCalculationsGQL: GetPricesCalculationsGQL,
    private searchBarcodesByTargetGQL: SearchBarcodesByTargetGQL,
    private searchAttributeByTargetGQL: SearchAttributeByTargetGQL,
    private getSimpleProductWithFilterGQL: GetSimpleProductWithFilterGQL,
    private getCatalogueTemplateByExcelGQL: GetCatalogueTemplateByExcelGQL,
    private sendCatalogueTemplateBymailGQL: SendCatalogueTemplateBymailGQL,
    private getSimpleServicesWithFilterGQL: GetSimpleServicesWithFilterGQL,
    private importServicesCatalogueByExcelGQL: ImportServicesCatalogueByExcelGQL,
    private searchBarcodesByTargetWithStockGQL: SearchBarcodesByTargetWithStockGQL,
    private createBarcodeForTargetWithStockGQL: CreateBarcodeForTargetWithStockGQL,
    private getBarcodeByProductAndAttributesGQL: GetBarcodeByProductAndAttributesGQL,
    private getSimpleBarcodeByBarcodeAndTargetGQL: GetSimpleBarcodeByBarcodeAndTargetGQL,
    private searchSimpleBarcodesByTargetWithStockGQL: SearchSimpleBarcodesByTargetWithStockGQL,
    private addBarcodeToInternalProductAndProductGQL: AddBarcodeToInternalProductAndProductGQL,
    private getAttributeValuesByAttributePaginatedGQL: GetAttributeValuesByAttributePaginatedGQL,
    private getBarcodesWithVarietyAndStructureWithFilterGQL: GetBarcodesWithVarietyAndStructureWithFilterGQL,
    private getBarcodesByTargetWithInternalProductPaginatedGQL: GetBarcodesByTargetWithInternalProductPaginatedGQL,
  ) {}

  importServicesCatalogueByExcel(base64: string): Observable<SuccessResponseDtoType> {
    return this.inventoryService.variety$.pipe(
      take(1),
      switchMap((variety) => {
        return this.importServicesCatalogueByExcelGQL
          .mutate({
            base64,
            variety,
            target: { pos: this.storageHelper.getData('posId') },
          })
          .pipe(
            map(({ data }: any) => {
              if (data) {
                return data.importServicesCatalogueByExcel;
              }
            }),
          );
      }),
    );
  }

  sendCatalogueTemplateBymail(emails: string): Observable<MailResponseDto> {
    return this.sendCatalogueTemplateBymailGQL
      .fetch({
        emails,
        subject: 'Your export of catalogue template',
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            return data.sendCatalogueTemplateBymail;
          }
        }),
      );
  }

  getCatalogueTemplateByExcel(): Observable<InvoicePdfType> {
    return this.getCatalogueTemplateByExcelGQL.fetch().pipe(
      map(({ data }: any) => {
        if (data) {
          return data.getCatalogueTemplateByExcel.content;
        }
      }),
    );
  }

  getPricesCalculations(
    products: InvoicingProductsInput[],
    taxes: ProductTaxesInput[],
    discount: DiscountDtoInput,
  ): Observable<InvoicingPricesCalculationType> {
    return this.getPricesCalculationsGQL.fetch({ input: { products, taxes, discount } }).pipe(
      map(({ data }: any) => {
        if (data) {
          return data.getPricesCalculations;
        }
      }),
    );
  }

  getBarcodeByProductAndAttributes(input: BarcodeFindInput): Observable<BarcodeType> {
    return this.getBarcodeByProductAndAttributesGQL.fetch({ input }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          return data.getBarcodeByProductAndAttributes;
        }
      }),
    );
  }

  getSimpleBarcodeByBarcodeAndTarget(barcode: string): Observable<BarcodeType> {
    return this.getSimpleBarcodeByBarcodeAndTargetGQL.fetch({ barcode, target: { pos: this.storageHelper.getData('posId') } }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          return data.getSimpleBarcodeByBarcodeAndTarget;
        }
      }),
    );
  }

  getSimpleProductWithFilter(searchString: string = ''): Observable<InternalProductType[]> {
    return this.getSimpleProductWithFilterGQL
      .fetch({
        searchString,
        filter: { target: { pos: [this.storageHelper.getData('posId')] } },
        pagination: { page: this.productPageIndex, limit: this.filterLimit },
      })
      .pipe(
        rxMap(({ data }: any) => {
          this.products.next([...(this.products.value || []), ...data.getSimpleProductWithFilter.objects]);
          this.isLastProducts.next(data.getSimpleProductWithFilter.isLast);
          return data.getSimpleProductWithFilter.objects;
        }),
      );
  }

  searchAttributeByTarget(reset = false): Observable<AttributeValuePaginateType> {
    if (reset) {
      this.attributePageIndex = 0;
      this.infiniteAttributeValues.next([]);
    }
    return combineLatest([this.inventoryService.variety$, this.infiniteAttributes$]).pipe(
      take(1),
      switchMap(([variety, infiniteAttributes]) => {
        return this.searchAttributeByTargetGQL
          .fetch({
            variety,
            target: { pos: this.storageHelper.getData('posId') },
            searchString: this.searchString,
            pagination: { page: this.attributePageIndex, limit: this.filterLimit },
          })
          .pipe(
            rxMap(({ data }: any) => {
              if (data) {
                this.attributesPagination.next({
                  page: this.pageIndex,
                  size: this.filterLimit,
                  length: data.searchAttributeByTarget?.count,
                });
                this.isLastAttribute.next(data.searchAttributeByTarget.isLast);
                this.infiniteAttributes.next([...(infiniteAttributes?.length ? infiniteAttributes : []), ...data.searchAttributeByTarget.objects]);
                return data.searchAttributeByTarget.objects;
              }
            }),
          );
      }),
    );
  }

  getAttributeValuesByAttributePaginated(attributId: string): Observable<AttributeValueType[]> {
    return this.getAttributeValuesByAttributePaginatedGQL
      .fetch({ attributId, pagination: { page: this.valuesPageIndex, limit: this.filterLimit } })
      .pipe(
        rxMap(({ data }: any) => {
          if (data) {
            this.isLastAttributeValues.next(data.getAttributeValuesByAttributePaginated.isLast);
            this.infiniteAttributeValues.next([
              ...(this.infiniteAttributeValues.value || []),
              ...data.getAttributeValuesByAttributePaginated.objects,
            ]);
            this.valuesPagination.next({
              page: this.valuesPageIndex,
              size: this.filterLimit,
              length: data.getAttributeValuesByAttributePaginated?.count,
            });
            return data.getAttributeValuesByAttributePaginated.objects;
          }
        }),
      );
  }

  getBarcodesByTargetPaginated(reset: boolean = false): Observable<BarcodeType[]> {
    this.loadingBarcodes.next(true);
    if (reset) {
      this.pageIndex = 0;
      this.barcodes.next([]);
      this.pagination.next({
        page: 0,
        length: 0,
        size: this.filterLimit,
      });
    }
    return combineLatest([this.barcodes$, this.barcodeSearchString$]).pipe(
      take(1),
      switchMap(([barcodes, searchString]) =>
        this.getBarcodesByTargetWithInternalProductPaginatedGQL
          .fetch({
            target: { pos: this.storageHelper.getData('posId') },
            searchString,
            pagination: { page: this.pageIndex, limit: this.filterLimit },
          })
          .pipe(
            rxMap(({ data }: any) => {
              this.barcodes.next([...(barcodes?.length ? barcodes : []), ...data.getBarcodesByTargetWithInternalProductPaginated.objects]);
              this.pagination.next({
                page: this.pageIndex,
                size: this.filterLimit,
                length: data.getBarcodesByTargetWithInternalProductPaginated?.count,
              });
              this.isBarcodeLastPage.next(data.getBarcodesByTargetWithInternalProductPaginated.isLast);
              this.loadingBarcodes.next(false);
              return data.getBarcodesByTargetWithInternalProductPaginated.objects;
            }),
          ),
      ),
    );
  }

  searchBarcodesByTarget(): Observable<BarcodePaginateType> {
    this.loadingBarcodes.next(true);
    return this.searchBarcodesByTargetGQL
      .fetch({
        searchString: this.searchString,
        target: { pos: this.storageHelper.getData('posId') },
        pagination: { page: this.pageIndex, limit: this.filterLimit },
      })
      .pipe(
        rxMap(({ data }: any) => {
          this.loadingBarcodes.next(false);
          this.infinitBarcodes.next([...(this.infinitBarcodes.value || []), ...data.searchBarcodesByTarget.objects]);
          this.barcodes.next(data.searchBarcodesByTarget.objects);
          this.pagination.next({
            page: this.pageIndex,
            size: this.filterLimit,
            length: data.getBarcodesWithVarietyAndStructureWithFilter?.count,
          });
          return data.searchBarcodesByTarget;
        }),
      );
  }

  searchBarcodesByTargetWithStock(): Observable<BarcodeWithStockPaginatedType> {
    this.loadingBarcodes.next(true);
    return this.searchBarcodesByTargetWithStockGQL
      .fetch({
        searchString: this.searchString,
        target: { pos: this.storageHelper.getData('posId') },
        pagination: { page: this.pageIndex, limit: this.filterLimit },
      })
      .pipe(
        rxMap(({ data }: any) => {
          this.loadingBarcodes.next(false);
          this.infinitBarcodes.next([...(this.infinitBarcodes.value || []), ...data.searchBarcodesByTargetWithStock.objects]);
          this.barcodes.next(data.searchBarcodesByTargetWithStock.objects);
          this.pagination.next({
            page: this.pageIndex,
            size: this.filterLimit,
            length: data.searchBarcodesByTargetWithStock?.count,
          });
          return data.searchBarcodesByTargetWithStock;
        }),
      );
  }

  getBarcodesWithVarietyAndStructureWithFilter(reset: boolean = false): Observable<BarcodePaginateType> {
    this.loadingBarcodes.next(true);
    if (reset) {
      this.pageIndex = 0;
      this.barcodes.next([]);
    }
    return combineLatest([this.inventoryService.filter$, this.inventoryService.variety$]).pipe(
      take(1),
      switchMap(([filter, variety]) => {
        return this.getBarcodesWithVarietyAndStructureWithFilterGQL.fetch({
          filter: { ...filter, variety: [variety], searchString: this.searchString },
          target: { pos: this.storageHelper.getData('posId') },
          pagination: { page: this.pageIndex, limit: this.filterLimit },
        });
      }),
      rxMap(({ data }: any) => {
        this.loadingBarcodes.next(false);
        this.infinitBarcodes.next([...(this.infinitBarcodes.value || []), ...data.getBarcodesWithVarietyAndStructureWithFilter.objects]);
        this.barcodes.next(data.getBarcodesWithVarietyAndStructureWithFilter.objects);
        this.pagination.next({
          page: this.pageIndex,
          size: this.filterLimit,
          length: data.getBarcodesWithVarietyAndStructureWithFilter?.count,
        });
        return data.getBarcodesWithVarietyAndStructureWithFilter;
      }),
    );
  }

  getBarcodesWithVarietyFilter(reset: boolean = false): Observable<BarcodePaginateType> {
    this.loadingBarcodes.next(true);
    if (reset) {
      this.pageIndex = 0;
      this.barcodes.next([]);
    }
    return this.inventoryService.variety$.pipe(
      take(1),
      switchMap((variety) =>
        this.getBarcodesWithVarietyAndStructureWithFilterGQL.fetch({
          filter: { ...this.filter.value, variety: [], searchString: this.searchString },
          target: { pos: this.storageHelper.getData('posId') },
          pagination: { page: this.pageIndex, limit: this.filterLimit },
        }),
      ),
      rxMap(({ data }: any) => {
        if (data) {
          this.loadingBarcodes.next(false);
          this.infinitBarcodes.next([...(this.infinitBarcodes.value || []), ...data.getBarcodesWithVarietyAndStructureWithFilter.objects]);
          this.barcodes.next(data.getBarcodesWithVarietyAndStructureWithFilter.objects);
          this.isBarcodeLastPage.next(data.getBarcodesWithVarietyAndStructureWithFilter.isLast);
          this.pagination.next({
            page: this.pageIndex,
            size: this.filterLimit,
            length: data.getBarcodesWithVarietyAndStructureWithFilter?.count,
          });
          return data.getBarcodesWithVarietyAndStructureWithFilter;
        }
      }),
    );
  }

  getTargetServiceProduct(): Observable<InternalProductType> {
    return this.getServiceProductGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      take(1),
      rxMap(({ data }: any) => {
        if (data?.getServiceProduct) {
          this.targetServiceProduct.next(data.getServiceProduct);
          return data.getServiceProduct;
        }
        return null;
      }),
    );
  }

  getSimpleServicesWithFilter(reset: boolean = false): Observable<BarcodePaginateType> {
    this.loadingBarcodes.next(true);
    if (reset) {
      this.pageIndex = 0;
      this.barcodes.next([]);
      this.inventoryService.barcodesFilterInput$ = {};
    }
    return this.inventoryService.barcodesFilterInput$.pipe(
      take(1),
      switchMap((filter) =>
        this.getSimpleServicesWithFilterGQL.fetch({
          filter,
          target: { pos: this.storageHelper.getData('posId') },
          searchString: this.searchString,
          pagination: { page: this.pageIndex, limit: this.filterLimit },
        }),
      ),
      rxMap(({ data }: any) => {
        if (data?.getSimpleServicesWithFilter) {
          this.loadingBarcodes.next(false);
          this.infinitBarcodes.next([...(this.infinitBarcodes.value || []), ...data.getSimpleServicesWithFilter.objects]);
          this.barcodes.next(data.getSimpleServicesWithFilter.objects);
          this.pagination.next({
            page: this.pageIndex,
            size: this.filterLimit,
            length: data.getSimpleServicesWithFilter?.count,
          });
          this.toFilter.next(data.getSimpleServicesWithFilter?.filter);
          return data.getSimpleServicesWithFilter;
        }
        return null;
      }),
    );
  }

  searchSimpleBarcodesByTargetWithStock(reset: boolean = false): Observable<BarcodeWithStockPaginatedType> {
    this.loadingBarcodes.next(true);
    if (reset) {
      this.pageIndex = 0;
      this.barcodes.next([]);
      this.infinitBarcodes.next([]);
    }
    return this.searchSimpleBarcodesByTargetWithStockGQL
      .fetch({
        searchString: this.searchString,
        target: { pos: this.storageHelper.getData('posId') },
        pagination: { page: this.pageIndex, limit: this.filterLimit },
      })
      .pipe(
        rxMap(({ data }: any) => {
          this.loadingBarcodes.next(false);
          this.infinitBarcodes.next([...(this.infinitBarcodes.value || []), ...data.searchSimpleBarcodesByTargetWithStock.objects]);
          this.barcodes.next(data.searchSimpleBarcodesByTargetWithStock.objects);
          this.pagination.next({
            page: this.pageIndex,
            size: this.filterLimit,
            length: data.searchSimpleBarcodesByTargetWithStock?.count,
          });
          return data.searchSimpleBarcodesByTargetWithStock;
        }),
      );
  }

  getBarcodeById(id: string): Observable<BarcodeType> {
    return this.getBarcodeWithStockGQL.fetch({ id }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          this.barcodeWithStock.next(data.getBarcodeWithStock);
          return data.getBarcodeWithStock;
        }
      }),
    );
  }

  getBarcodeStats(barcodeId: string): Observable<BarcodeStatsType> {
    return this.getBarcodeStatsGQL.fetch({ barcodeId }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          this.barcodeStats.next(data.getBarcodeStats);
          return data.getBarcodeStats;
        }
      }),
    );
  }

  createBarcodeForTargetWithStock(input: BarcodeInput): Observable<BarcodeType> {
    return this.createBarcodeForTargetWithStockGQL.mutate({ input, target: { pos: this.storageHelper.getData('posId') } }).pipe(
      rxMap(({ data }: any) => {
        return data.createBarcodeForTargetWithStock;
      }),
    );
  }

  addBarcodeToInternalProductAndProduct(barcodeId: string, productId: string, id: string): Observable<InternalProductType> {
    return this.addBarcodeToInternalProductAndProductGQL.mutate({ barcodeId, productId, id }).pipe(
      rxMap(({ data }: any) => {
        return data.addBarcodeToInternalProductAndProduct;
      }),
    );
  }

  updateBarcode(input: BarcodeUpdateInput): Observable<BarcodeType> {
    return this.barcodes$.pipe(
      take(1),
      switchMap((barcodesWithStock) =>
        this.updateBarcodeGQL
          .mutate({
            input,
          })
          .pipe(
            rxMap(({ data }: any) => {
              if (data) {
                const index = barcodesWithStock?.findIndex((a) => a.id === input.id);
                if (index > -1) {
                  barcodesWithStock[index] = data.updateBarcode;
                  this.barcodes.next(barcodesWithStock);
                }
                this.barcodeWithStock.next(data.updateBarcode);
                return data.updateBarcode;
              }
              return null;
            }),
          ),
      ),
    );
  }

  createBarcode(input: BarcodeInput): Observable<BarcodeType> {
    return this.createBarcodeGQL
      .mutate({
        target: { pos: this.storageHelper.getData('posId') },
        input,
      })
      .pipe(
        rxMap(({ data }: any) => {
          if (data) {
            this.barcodes.next([data.createBarcode, ...(this.barcodes.value || [])]);
            return data.createBarcode;
          }
          return null;
        }),
      );
  }

  createServiceProduct(input: any): Observable<InternalProductType> {
    return this.barcodes$.pipe(
      take(1),
      switchMap((barcodes) =>
        this.createServiceProductGQL.mutate({ input, target: { pos: this.storageHelper.getData('posId') } }).pipe(
          rxMap(({ data }: any) => {
            this.barcodes.next([data.createServiceProduct, ...(barcodes || [])]);
            return data.createServiceProduct;
          }),
        ),
      ),
    );
  }

  deleteBarcode(id: string): Observable<boolean> {
    return this.barcodes$.pipe(
      take(1),
      switchMap((barcodes) =>
        this.deleteBarcodeGQL.mutate({ id }).pipe(
          rxMap(({ data }: any) => {
            if (data.deleteBarcode) {
              const index = barcodes.findIndex((item) => item.id === id);
              barcodes.splice(index, 1);
              this.barcodes.next(barcodes);
              return true;
            }
            return false;
          }),
        ),
      ),
    );
  }
}
