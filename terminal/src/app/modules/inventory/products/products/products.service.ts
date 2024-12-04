import { Injectable } from '@angular/core';
import { map as rxMap, switchMap, take, tap } from 'rxjs/operators';
import { map, forEach, filter, includes, find, slice } from 'lodash';
import { BehaviorSubject, Observable, of, lastValueFrom, combineLatest } from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import {
  BarcodeType,
  UserType,
  BarcodeInput,
  InvoicePdfType,
  BarcodeFindInput,
  InternalProductType,
  ProductAttributeType,
  InternalProductFilterType,
  InternalProductWithStockType,
  CatalogueImportValidationType,
  BarcodeGQL,
  GetAccountsGQL,
  DeleteBarcodeGQL,
  UpdateBarcodeGQL,
  CreateSimpleProductGQL,
  UpdateSimpleProductGQL,
  SearchSimpleServicesGQL,
  CreateServiceProductGQL,
  DeleteInternalProductGQL,
  BulkUpdateBarcodeMediaGQL,
  SearchSimpleEquipmentsGQL,
  GetFullCatalogueByExcelGQL,
  GetCatalogueCategoryPathGQL,
  ValidateCatalogueByExcelGQL,
  GetSimpleCatalogueByExcelGQL,
  SendSimpleCatalogueByMailGQL,
  GetSimpleProductWithFilterGQL,
  GetInternalProductBarcodesGQL,
  GetCatalogueTemplateByExcelGQL,
  GetInternalProductWithStockGQL,
  GetProductAttributesByTargetGQL,
  SearchInternalProductByTargetGQL,
  CreateBarcodeForTargetWithStockGQL,
  UpdateInternalProductAndProductGQL,
  GetBarcodeByProductAndAttributesGQL,
  ImportFullCorporateCatalogueByExcelGQL,
  GetSimpleBarcodesByBarcodesAndTargetGQL,
  AddBarcodeToInternalProductAndProductGQL,
  GetCatalogueCategoriesByLayerAndParentGQL,
  ImportSimpleFullCorporateCatalogueByExcelGQL,
  GetCatalogueCategoriesByTargetWithChildrenGQL,
  GetInternalProductStatsGQL,
  BarcodeStatsType,
  MailResponseDto,
  GenerateS3SignedUrlGQL,
} from '@sifca-monorepo/terminal-generator';

import { AWS_CREDENTIALS } from '../../../../../environments/environment';
import { ICatalogueCategoryTreeType, SortingField } from './products.types';
import { InventoryService } from '../../../../shared/services/inventory.service';
import { AmazonS3Helper, StorageHelper } from '@diktup/frontend/helpers';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private totalProducts: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private owners: BehaviorSubject<UserType[]> = new BehaviorSubject<UserType[]>(null);
  private loadingOwners: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private loadingProducts: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private isOwnersLastPage: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private technicians: BehaviorSubject<UserType[]> = new BehaviorSubject<UserType[]>(null);
  private loadingTechnicians: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject<IPagination>(null);
  private isProductsLastPage: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private barcodes: BehaviorSubject<BarcodeType[]> = new BehaviorSubject<BarcodeType[]>(null);
  private isTechniciansLastPage: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private loadingInfiniteProducts: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private ownersPagination: BehaviorSubject<IPagination> = new BehaviorSubject<IPagination>(null);
  private isInfinteProductsLastPage: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private techniciansPagination: BehaviorSubject<IPagination> = new BehaviorSubject<IPagination>(null);
  private products: BehaviorSubject<InternalProductType[]> = new BehaviorSubject<InternalProductType[]>(null);
  private internalProductStats: BehaviorSubject<BarcodeStatsType> = new BehaviorSubject<BarcodeStatsType>(null);
  private attributes: BehaviorSubject<ProductAttributeType[]> = new BehaviorSubject<ProductAttributeType[]>(null);
  private toFilter: BehaviorSubject<InternalProductFilterType> = new BehaviorSubject<InternalProductFilterType>(null);
  private infiniteProducts: BehaviorSubject<InternalProductType[]> = new BehaviorSubject<InternalProductType[]>(null);
  private product: BehaviorSubject<InternalProductWithStockType> = new BehaviorSubject<InternalProductWithStockType>(null);
  private categories: BehaviorSubject<ICatalogueCategoryTreeType[]> = new BehaviorSubject<ICatalogueCategoryTreeType[]>(null);
  private selectedCategories: BehaviorSubject<ICatalogueCategoryTreeType[]> = new BehaviorSubject<ICatalogueCategoryTreeType[]>(null);

  user = [];
  pageIndex = 0;
  ownersLimit = 20;
  filterLimit = 20;
  searchString = '';
  productsLimit = 20;
  ownersPageIndex = 0;
  techniciansLimit = 20;
  productsPageIndex = 0;
  techniciansPageIndex = 0;
  infiniteProductsLimit = 20;
  infiniteProductsPageIndex = 0;
  selectedProduct: InternalProductType;

  get categories$(): Observable<ICatalogueCategoryTreeType[]> {
    return this.categories.asObservable();
  }
  get selectedCategories$(): Observable<ICatalogueCategoryTreeType[]> {
    return this.selectedCategories.asObservable();
  }
  get totalProducts$(): Observable<number> {
    return this.totalProducts.asObservable();
  }
  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }
  get ownersPagination$(): Observable<IPagination> {
    return this.ownersPagination.asObservable();
  }
  get techniciansPagination$(): Observable<IPagination> {
    return this.techniciansPagination.asObservable();
  }
  get internalProductStats$(): Observable<BarcodeStatsType> {
    return this.internalProductStats.asObservable();
  }
  get product$(): Observable<InternalProductWithStockType> {
    return this.product.asObservable();
  }
  set product$(value: any) {
    this.product.next(value);
  }
  get products$(): Observable<InternalProductType[]> {
    return this.products.asObservable();
  }
  get infiniteProducts$(): Observable<InternalProductType[]> {
    return this.infiniteProducts.asObservable();
  }
  get isProductsLastPage$(): Observable<boolean> {
    return this.isProductsLastPage.asObservable();
  }
  get isInfinteProductsLastPage$(): Observable<boolean> {
    return this.isInfinteProductsLastPage.asObservable();
  }
  get isOwnersLastPage$(): Observable<boolean> {
    return this.isOwnersLastPage.asObservable();
  }
  get isTechniciansLastPage$(): Observable<boolean> {
    return this.isTechniciansLastPage.asObservable();
  }
  get loadingProducts$(): Observable<boolean> {
    return this.loadingProducts.asObservable();
  }
  set loadingProducts$(value: any) {
    this.loadingProducts.next(value);
  }
  get loadingInfiniteProducts$(): Observable<boolean> {
    return this.loadingInfiniteProducts.asObservable();
  }
  set loadingInfiniteProducts$(value: any) {
    this.loadingInfiniteProducts.next(value);
  }
  get loadingOwners$(): Observable<boolean> {
    return this.loadingOwners.asObservable();
  }
  set loadingOwners$(value: any) {
    this.loadingOwners.next(value);
  }
  get loadingTechnicians$(): Observable<boolean> {
    return this.loadingTechnicians.asObservable();
  }
  set loadingTechnicians$(value: any) {
    this.loadingTechnicians.next(value);
  }
  get owners$(): Observable<UserType[]> {
    return this.owners.asObservable();
  }
  set owners$(value: any) {
    this.owners.next(value);
  }
  get technicians$(): Observable<UserType[]> {
    return this.technicians.asObservable();
  }
  get toFilter$(): Observable<InternalProductFilterType> {
    return this.toFilter.asObservable();
  }
  get attributes$(): Observable<ProductAttributeType[]> {
    return this.attributes.asObservable();
  }
  get internalProductsPagination$(): Observable<InternalProductType[]> {
    return this.products.asObservable();
  }
  get barcodes$(): Observable<BarcodeType[]> {
    return this.barcodes.asObservable();
  }

  constructor(
    private getBarcodeGQL: BarcodeGQL,
    private storageHelper: StorageHelper,
    private amazonS3Helper: AmazonS3Helper,
    private getAccountsGQL: GetAccountsGQL,
    private deleteBarcodeGQL: DeleteBarcodeGQL,
    private inventoryService: InventoryService,
    private updateBarcodeGQL: UpdateBarcodeGQL,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
    private createSimpleProductGQL: CreateSimpleProductGQL,
    private updateSimpleProductGQL: UpdateSimpleProductGQL,
    private createServiceProductGQL: CreateServiceProductGQL,
    private searchSimpleServicesGQL: SearchSimpleServicesGQL,
    private deleteInternalProductGQL: DeleteInternalProductGQL,
    private searchSimpleEquipmentsGQL: SearchSimpleEquipmentsGQL,
    private bulkUpdateBarcodeMediaGQL: BulkUpdateBarcodeMediaGQL,
    private getInternalProductStatsGQL: GetInternalProductStatsGQL,
    private getFullCatalogueByExcelGQL: GetFullCatalogueByExcelGQL,
    private getCatalogueCategoryPathGQL: GetCatalogueCategoryPathGQL,
    private validateCatalogueByExcelGQL: ValidateCatalogueByExcelGQL,
    private sendSimpleCatalogueByMailGQL: SendSimpleCatalogueByMailGQL,
    private getSimpleCatalogueByExcelGQL: GetSimpleCatalogueByExcelGQL,
    private getInternalProductBarcodesGQL: GetInternalProductBarcodesGQL,
    private getSimpleProductWithFilterGQL: GetSimpleProductWithFilterGQL,
    private getCatalogueTemplateByExcelGQL: GetCatalogueTemplateByExcelGQL,
    private getInternalProductWithStockGQL: GetInternalProductWithStockGQL,
    private getProductAttributesByTargetGQL: GetProductAttributesByTargetGQL,
    private searchInternalProductByTargetGQL: SearchInternalProductByTargetGQL,
    private createBarcodeForTargetWithStockGQL: CreateBarcodeForTargetWithStockGQL,
    private updateInternalProductAndProductGQL: UpdateInternalProductAndProductGQL,
    private getBarcodeByProductAndAttributesGQL: GetBarcodeByProductAndAttributesGQL,
    private importFullCorporateCatalogueByExcelGQL: ImportFullCorporateCatalogueByExcelGQL,
    private getSimpleBarcodesByBarcodesAndTargetGQL: GetSimpleBarcodesByBarcodesAndTargetGQL,
    private addBarcodeToInternalProductAndProductGQL: AddBarcodeToInternalProductAndProductGQL,
    private getCatalogueCategoriesByLayerAndParentGQL: GetCatalogueCategoriesByLayerAndParentGQL,
    private importSimpleFullCorporateCatalogueByExcelGQL: ImportSimpleFullCorporateCatalogueByExcelGQL,
    private getCatalogueCategoriesByTargetWithChildrenGQL: GetCatalogueCategoriesByTargetWithChildrenGQL,
  ) {}

  importSimpleFullCorporateCatalogueByExcel(base64: string): Observable<InvoicePdfType> {
    return this.inventoryService.variety$.pipe(
      take(1),
      switchMap((variety) => {
        return this.importSimpleFullCorporateCatalogueByExcelGQL.mutate({
          target: { pos: this.storageHelper.getData('posId') },
          base64,
          variety,
        });
      }),
      rxMap(({ data }: any) => {
        return data.importSimpleFullCorporateCatalogueByExcelGQL;
      }),
    );
  }

  // importSimpleFullCorporateCatalogueByExcel1(base64: string): Observable<SuccessResponseDtoType> {
  //   return this.importSimpleFullCorporateCatalogueByExcelGQL
  //     .mutate({
  //       base64,
  //       target: { pos: this.storageHelper.getData('posId') },
  //     })
  //     .pipe(
  //       rxMap(({ data }) => {
  //         if (data) {
  //           return data.importSimpleFullCorporateCatalogueByExcel;
  //         }
  //       }),
  //     );
  // }

  sendSimpleCatalogueByMail(input): Observable<MailResponseDto> {
    return this.sendSimpleCatalogueByMailGQL
      .fetch({
        sheets: input?.sheets,
        variety: input?.variety,
        emails: input?.emails,
        subject: 'Your export of catalogue',
        target: { pos: this.storageHelper.getData('posId') },
      })
      .pipe(
        rxMap(({ data }: any) => {
          return data.sendSimpleCatalogueByMail;
        }),
      );
  }

  getCatalogueCategoryPath(id: string): Observable<ICatalogueCategoryTreeType[]> {
    return this.getCatalogueCategoryPathGQL.fetch({ id }).pipe(
      tap(({ data }) => this.selectedCategories.next(data?.getCatalogueCategoryPath as any)),
      rxMap(({ data }) => data?.getCatalogueCategoryPath as any),
    );
  }

  insertNodeIntoTree(category: ICatalogueCategoryTreeType, id: string, newCategories: ICatalogueCategoryTreeType[]) {
    if (category.id === id) {
      category.selected = true;
      if (newCategories) {
        category.children = newCategories;
      }
    } else if (category?.children?.length > 0) {
      for (let i = 0; i < category?.children?.length; i++) {
        this.insertNodeIntoTree(category.children[i], id, newCategories);
      }
    }
  }

  deleteSubCatFromNode(category: ICatalogueCategoryTreeType, id: string) {
    if (category.id === id) {
      category.children = [];
    } else if (category?.children?.length > 0) {
      for (let i = 0; i < category?.children?.length; i++) {
        this.deleteSubCatFromNode(category.children[i], id);
      }
    }
  }

  deleteSubCategories(category: ICatalogueCategoryTreeType): Observable<ICatalogueCategoryTreeType[]> {
    const categories = this.categories.value;
    forEach(categories, (localCategory) => {
      this.deleteSubCatFromNode(localCategory, category.id);
    });
    this.categories.next(categories);
    return of(categories);
  }

  getCategories(layer: number, parent?: string): Observable<ICatalogueCategoryTreeType[]> {
    return this.getCatalogueCategoriesByLayerAndParentGQL
      .fetch({ target: { pos: this.storageHelper.getData('posId') }, layer, ...(parent ? { parent } : {}) })
      .pipe(
        tap((response: any) => {
          if (response.data) {
            const categories = this.categories.value;
            if (!categories?.length) {
              this.categories.next(response.data.getCatalogueCategoriesByLayerAndParent);
              return response.data.getCatalogueCategoriesByLayerAndParent;
            } else {
              forEach(categories, (category, index) => {
                this.insertNodeIntoTree(category, parent, response.data.getCatalogueCategoriesByLayerAndParent);
                if (index === categories.length - 1) {
                  this.categories.next(categories);
                  return categories;
                }
              });
            }
          }
        }),
      );
  }

  getCatalogueCategoriesByTargetWithChildren(): Observable<ICatalogueCategoryTreeType[]> {
    return this.getCatalogueCategoriesByTargetWithChildrenGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          this.categories.next(data.getCatalogueCategoriesByTargetWithChildren);
          return data.getCatalogueCategoriesByTargetWithChildren;
        }
      }),
    );
  }

  getSimpleProductWithFilter(reset = false, sort: SortingField[] = [{ createdAt: -1 }]): Observable<InternalProductType[]> {
    this.loadingProducts.next(true);
    if (reset) {
      this.productsPageIndex = 0;
      this.products.next([]);
      this.totalProducts.next(0);
    }
    return this.inventoryService.filter$.pipe(
      take(1),
      switchMap((filter) =>
        this.getSimpleProductWithFilterGQL.fetch({
          sort,
          searchString: this.searchString,
          filter: { ...filter, target: { pos: [this.storageHelper.getData('posId')] } },
          pagination: { limit: this.productsLimit, page: this.productsPageIndex },
        }),
      ),
      rxMap(({ data }: any) => {
        this.pagination.next({
          page: this.productsPageIndex,
          size: this.productsLimit,
          length: data.getSimpleProductWithFilter?.count,
        });
        this.products.next(data.getSimpleProductWithFilter.objects);
        this.toFilter.next(data.getSimpleProductWithFilter.filter);
        this.loadingProducts.next(false);
        this.totalProducts.next(data.getSimpleProductWithFilter.count);
        this.isProductsLastPage.next(data.getSimpleProductWithFilter.isLast);
        return data.getSimpleProductWithFilter.objects;
      }),
    );
  }

  getInfiniteProducts(reset = false): Observable<InternalProductType[]> {
    if (reset) {
      this.infiniteProducts.next([]);
      this.infiniteProductsPageIndex = 0;
    }
    this.loadingInfiniteProducts.next(true);
    return this.inventoryService.filter$.pipe(
      take(1),
      switchMap((filter) =>
        this.getSimpleProductWithFilterGQL.fetch({
          filter: { ...filter, target: { pos: [this.storageHelper.getData('posId')] } },
          pagination: { limit: this.productsLimit, page: this.productsPageIndex },
        }),
      ),
      rxMap(({ data }: any) => {
        this.infiniteProducts.next(data.getSimpleProductWithFilter.objects);
        this.loadingInfiniteProducts.next(false);
        this.isInfinteProductsLastPage.next(data.getSimpleProductWithFilter.isLast);
        return data.getSimpleProductWithFilter.objects;
      }),
    );
  }

  getOwners(): Observable<UserType[]> {
    this.loadingOwners.next(true);
    return this.owners$.pipe(
      take(1),
      switchMap((users) => {
        return this.getAccountsGQL
          .fetch({
            target: { pos: this.storageHelper.getData('posId') },
            pagination: { page: this.ownersPageIndex, limit: this.ownersLimit },
          })
          .pipe(
            rxMap(({ data }: any) => {
              this.owners.next([...(users?.length ? users : []), ...map(data.getAccounts?.objects, 'user')]);
              this.loadingOwners.next(false);
              this.isOwnersLastPage.next(data.getAccounts?.isLast);
              this.ownersPagination.next({
                page: this.ownersPageIndex,
                size: this.ownersLimit,
                length: data.getAccounts?.count,
              });
              return map(data.getAccounts?.objects, 'user');
            }),
          );
      }),
    );
  }

  getTechnicians(): Observable<UserType[]> {
    this.loadingTechnicians.next(true);
    return this.technicians$.pipe(
      take(1),
      switchMap((technicians) => {
        return this.getAccountsGQL
          .fetch({
            target: { pos: this.storageHelper.getData('posId') },
            pagination: { page: this.techniciansPageIndex, limit: this.techniciansLimit },
          })
          .pipe(
            rxMap(({ data }: any) => {
              this.technicians.next([...(technicians?.length ? technicians : []), ...map(data.getAccounts?.objects, 'user')]);
              this.loadingTechnicians.next(false);
              this.isTechniciansLastPage.next(data.getAccounts?.isLast);
              this.techniciansPagination.next({
                page: this.techniciansPageIndex,
                size: this.techniciansLimit,
                length: data.getAccounts?.count,
              });
              return map(data.getAccounts?.objects, 'user');
            }),
          );
      }),
    );
  }

  searchServices(): Observable<InternalProductType[]> {
    this.loadingProducts.next(true);
    return combineLatest([this.inventoryService.searchString$, this.inventoryService.status$]).pipe(
      take(1),
      switchMap(([searchString, status]) =>
        this.searchSimpleServicesGQL
          .fetch({
            searchInput: {
              target: { pos: this.storageHelper.getData('posId') },
              ...(status?.length ? { status } : {}),
              ...(searchString ? { searchString } : {}),
              pagination: { limit: this.productsLimit, page: this.productsPageIndex },
            },
          })
          .pipe(
            rxMap(({ data }: any) => {
              this.products.next(data.searchSimpleServices.objects);
              this.toFilter.next(data.searchSimpleServices.filter);
              this.loadingProducts.next(false);
              this.totalProducts.next(data.searchSimpleServices.count);
              this.isProductsLastPage.next(data.searchSimpleServices.isLast);
              return data.searchSimpleServices.objects;
            }),
          ),
      ),
    );
  }

  searchSimpleEquipments(reset = false): Observable<InternalProductType[]> {
    if (reset) {
      this.productsPageIndex = 0;
      this.products.next([]);
      this.totalProducts.next(0);
    }
    this.loadingProducts.next(true);
    return combineLatest([this.inventoryService.searchString$, this.inventoryService.status$]).pipe(
      take(1),
      switchMap(([searchString, status]) =>
        this.searchSimpleEquipmentsGQL.fetch({
          searchInput: {
            ...(status?.length ? { status } : {}),
            ...(searchString ? { searchString } : {}),
            target: { pos: this.storageHelper.getData('posId') },
            pagination: { limit: this.productsLimit, page: this.productsPageIndex },
          },
        }),
      ),
      rxMap(({ data }: any) => {
        this.products.next(data.searchSimpleEquipments.objects);
        this.toFilter.next(data.searchSimpleEquipments.filter);
        this.loadingProducts.next(false);
        this.totalProducts.next(data.searchSimpleEquipments.count);
        this.isProductsLastPage.next(data.searchSimpleEquipments.isLast);
        return data.searchSimpleEquipments.objects;
      }),
    );
  }

  searchInfiniteSimpleEquipments(reset = false): Observable<InternalProductType[]> {
    if (reset) {
      this.infiniteProducts.next([]);
      this.infiniteProductsPageIndex = 0;
    }
    this.loadingInfiniteProducts.next(true);
    return combineLatest([
      this.infiniteProducts$,
      this.searchSimpleEquipmentsGQL.fetch({
        searchInput: {
          target: { pos: this.storageHelper.getData('posId') },
          pagination: { limit: this.productsLimit, page: this.productsPageIndex },
        },
      }),
    ]).pipe(
      take(1),
      rxMap(([infiniteProducts, { data }]: any[]) => {
        this.infiniteProducts.next([...(infiniteProducts?.length ? infiniteProducts : []), ...data.searchSimpleEquipments.objects]);
        this.loadingInfiniteProducts.next(false);
        this.isInfinteProductsLastPage.next(data.searchSimpleEquipments.isLast);
        return data.searchSimpleEquipments.objects;
      }),
    );
  }

  searchInternalProduct(searchString: string, pagination = { page: 0, limit: 10 }): Observable<InternalProductType[]> {
    return this.searchInternalProductByTargetGQL.fetch({ searchString, pagination, target: { pos: this.storageHelper.getData('posId') } }).pipe(
      rxMap((response) => {
        this.products.next(response.data.searchInternalProductByTarget.objects as InternalProductType[]);
        this.pagination.next({
          page: pagination?.page || 0,
          size: pagination?.limit || 10,
          length: response.data.searchInternalProductByTarget.count,
        });
        return this.products.value;
      }),
    );
  }

  getProductAttributes(): Observable<ProductAttributeType[]> {
    return this.getProductAttributesByTargetGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      tap(({ data }: any) => {
        this.attributes.next(data.getProductAttributesByTarget);
      }),
    );
  }

  getByProductAndAttributes(input: BarcodeFindInput): Observable<BarcodeType> {
    return this.getBarcodeByProductAndAttributesGQL.fetch({ input }).pipe(
      rxMap((response: any) => {
        if (response.data) {
          return response.data.getBarcodeByProductAndAttributes;
        }
      }),
    );
  }

  getInternalProductStats(internalProductId: string): Observable<BarcodeStatsType> {
    return this.getInternalProductStatsGQL.fetch({ internalProductId }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          this.internalProductStats.next(data.getInternalProductStats);
          return data.getInternalProductStats;
        }
      }),
    );
  }

  getSimpleEquipment(id: string): Observable<InternalProductWithStockType> {
    return this.getInternalProductWithStockGQL.fetch({ id }).pipe(
      rxMap(({ data }: any) => {
        this.product.next(data.getInternalProductWithStock);
        return data.getInternalProductWithStock;
      }),
    );
  }

  resetSimpleProduct() {
    this.barcodes.next([]);
    this.product.next(null);
    this.internalProductStats.next(null);
  }

  getSimpleProduct(id: string): Observable<InternalProductWithStockType> {
    if (id) {
      return combineLatest([
        this.getInternalProductWithStockGQL.fetch({ id }),
        this.getInternalProductBarcodesGQL.fetch({ id }),
        this.getInternalProductStatsGQL.fetch({ internalProductId: id }),
      ]).pipe(
        rxMap(([internalProductResponse, barcodesResponse, internalProductStatsResponse]: any) => {
          if (barcodesResponse.data?.getInternalProductBarcodes) {
            this.barcodes.next(barcodesResponse.data?.getInternalProductBarcodes);
          }
          if (internalProductResponse.data?.getInternalProductWithStock) {
            this.product.next(internalProductResponse.data?.getInternalProductWithStock);
          }
          if (internalProductStatsResponse.data?.getInternalProductStats) {
            this.internalProductStats.next(internalProductStatsResponse.data?.getInternalProductStats);
          }
          return internalProductResponse.data?.getInternalProductWithStock;
        }),
      );
    }
    return of(null);
  }

  getSimpleService(id: string): Observable<InternalProductType> {
    return this.getBarcodeGQL.fetch({ id }).pipe(
      rxMap(({ data }: any) => {
        this.product.next(data.barcode);
        return data.barcode;
      }),
    );
  }

  resetProduct() {
    this.product.next(null);
  }

  createProduct(input: any): Observable<InternalProductType> {
    return this.products$.pipe(
      take(1),
      switchMap((products) =>
        this.createSimpleProductGQL.mutate({ input: { ...input, target: { pos: this.storageHelper.getData('posId') } } }).pipe(
          rxMap(({ data }: any) => {
            this.products.next([data.createSimpleProduct, ...(products?.length ? products : [])]);
            return data.createSimpleProduct;
          }),
        ),
      ),
    );
  }

  createService(input: any): Observable<InternalProductType> {
    return this.products$.pipe(
      take(1),
      switchMap((products) =>
        this.createServiceProductGQL.mutate({ input: { ...input, target: { pos: this.storageHelper.getData('posId') } } }).pipe(
          rxMap(({ data }: any) => {
            this.products.next([data.createServiceProduct, ...(products?.length ? products : [])]);
            return data.createServiceProduct;
          }),
        ),
      ),
    );
  }

  createBarcodeForTargetWithStock(input: BarcodeInput): Observable<BarcodeType> {
    return this.createBarcodeForTargetWithStockGQL.mutate({ input, target: { pos: this.storageHelper.getData('posId') } }).pipe(
      rxMap(({ data }: any) => {
        return data.createBarcodeForTargetWithStock;
      }),
    );
  }

  getSimpleCatalogueByExcel(input): Observable<InvoicePdfType> {
    return this.getSimpleCatalogueByExcelGQL
      .fetch({
        target: { pos: this.storageHelper.getData('posId') },
        sheets: input.sheets,
        variety: input.variety,
      })
      .pipe(
        rxMap(({ data }: any) => {
          if (data) {
            return data.getSimpleCatalogueByExcel.content;
          }
        }),
      );
  }

  getFullCatalogueByExcel(): Observable<InvoicePdfType> {
    return this.getFullCatalogueByExcelGQL.fetch({ withStock: true, target: { pos: this.storageHelper.getData('posId') } }).pipe(
      rxMap(({ data }: any) => {
        return data.getFullCatalogueByExcel;
      }),
    );
  }

  getCatalogueTemplateByExcel(): Observable<InvoicePdfType> {
    return this.getCatalogueTemplateByExcelGQL.fetch({}).pipe(
      rxMap((response: any) => {
        if (response.data) {
          return response.data.getCatalogueTemplateByExcel;
        }
      }),
    );
  }

  importFullCorporateCatalogueByExcel(base64: string): Observable<InvoicePdfType> {
    return this.inventoryService.variety$.pipe(
      take(1),
      switchMap((variety) => {
        return this.importFullCorporateCatalogueByExcelGQL.mutate({
          target: { pos: this.storageHelper.getData('posId') },
          base64,
          variety,
        });
      }),
      rxMap(({ data }: any) => {
        return data.importFullCorporateCatalogueByExcel;
      }),
    );
  }

  validateCatalogueByExcel(base64: string): Observable<CatalogueImportValidationType> {
    return this.validateCatalogueByExcelGQL.fetch({ base64 }).pipe(
      rxMap((response: any) => {
        if (response.data) {
          return response.data.validateCatalogueByExcel;
        }
      }),
    );
  }

  addBarcodeToInternalProductAndProduct(barcodeId: string, productId: string, id: string): Observable<InternalProductType> {
    return this.barcodes$.pipe(
      take(1),
      switchMap((barcodes) =>
        this.addBarcodeToInternalProductAndProductGQL.mutate({ barcodeId, productId, id }).pipe(
          rxMap(({ data }: any) => {
            return data.addBarcodeToInternalProductAndProduct;
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
          rxMap((response) => {
            if (response.data.deleteBarcode.success) {
              const index = barcodes.findIndex((item) => item.id === id);
              barcodes.splice(index, 1);
              this.barcodes.next(barcodes);
            }
            return response.data.deleteBarcode.success;
          }),
        ),
      ),
    );
  }

  updateSimpleProduct(input: any): Observable<InternalProductType> {
    return this.products$.pipe(
      take(1),
      switchMap((products) =>
        this.updateSimpleProductGQL.mutate({ input }).pipe(
          rxMap(({ data }: any) => {
            const index = (products || []).findIndex((item) => item.id === input.id);
            if (index > -1) {
              this.products.next([...slice(products, 0, index), data.updateSimpleProduct, ...slice(products, index + 1)]);
            }
            return data.updateSimpleProduct;
          }),
        ),
      ),
    );
  }

  archiveProduct(input: any): Observable<InternalProductType> {
    return this.products$.pipe(
      take(1),
      switchMap((allProducts) =>
        this.updateSimpleProductGQL.mutate({ input }).pipe(
          rxMap(({ data }: any) => {
            const products = allProducts.filter((item) => item.id !== input.id);
            this.products.next(products);
            return data.updateSimpleProduct;
          }),
        ),
      ),
    );
  }

  updateSimpleService(input: any): Observable<InternalProductType> {
    return this.products$.pipe(
      take(1),
      switchMap((products) =>
        this.updateBarcodeGQL.mutate({ input }).pipe(
          rxMap(({ data }: any) => {
            const index = (products || []).findIndex((item) => item.id === input.id);
            if (index > -1) {
              this.products.next([...slice(products, 0, index), data.updateBarcode, ...slice(products, index + 1)]);
            }
            return data.updateBarcode;
          }),
        ),
      ),
    );
  }

  updateProduct(input: any): Observable<InternalProductType> {
    return this.products$.pipe(
      take(1),
      switchMap((products) =>
        this.updateInternalProductAndProductGQL.mutate(input).pipe(
          rxMap((updatedProduct: any) => {
            const index = products.findIndex((item) => item.id === input.id);
            products[index] = updatedProduct.data.updateInternalProductAndProduct;
            this.products.next(products);
            return updatedProduct.data.updateInternalProductAndProduct;
          }),
        ),
      ),
    );
  }

  deleteProduct(id: string): Observable<boolean> {
    return this.products$.pipe(
      take(1),
      switchMap((products) =>
        this.deleteInternalProductGQL.mutate({ id }).pipe(
          rxMap((response) => {
            if (response.data.deleteInternalProduct.success) {
              const index = products.findIndex((item) => item.id === id);
              products.splice(index, 1);
              this.products.next(products);
            }
            return response.data.deleteInternalProduct.success;
          }),
        ),
      ),
    );
  }

  async uploadFiles(files: FileList) {
    const barcodes = await lastValueFrom(
      this.getSimpleBarcodesByBarcodesAndTargetGQL.fetch({
        target: { pos: this.storageHelper.getData('posId') },
        barcodes: map(files, (file) => file.name.replace(/\.[^.]+$/, '')),
      }),
    );
    const existingBarcodes = map(barcodes.data.getSimpleBarcodesByBarcodesAndTarget, 'barcode');
    const filesWillUpload = filter(files, (file) => includes(existingBarcodes, file.name.replace(/\.[^.]+$/, '')));
    const responses = await Promise.all(
      map(filesWillUpload, async (file) => {
        const posId = this.storageHelper.getData('posId');
        const timestamp = Date.now();
        const fileName = `${posId}_${timestamp}_${file.name}`;
        const res = await lastValueFrom(
          this.generateS3SignedUrlGQL.fetch({
            fileName,
            fileType: file.type,
          }),
        );
        return this.amazonS3Helper.uploadS3AwsWithSignature(
          res.data.generateS3SignedUrl.message,
          file,
          fileName,
          AWS_CREDENTIALS.storage,
          AWS_CREDENTIALS.region,
        );
      }),
    );
    const input = map(responses, (picture: any) => {
      const regex = /[^_]*(\.jpeg|\.png)$/;
      const fileName = picture.path.match(regex)?.[0].split('.')[0];
      const barcode = find(barcodes.data.getSimpleBarcodesByBarcodesAndTarget, {
        barcode: fileName,
      } as any) as any;
      return {
        id: barcode.id.toString(),
        media: {
          pictures: {
            path: picture.path,
            baseUrl: picture.baseUrl,
          },
        },
      };
    });
    this.bulkUpdateBarcodeMediaGQL.mutate({ input }).subscribe();
    return filter(files, (file) => !includes(existingBarcodes, file.name.replace(/\.[^.]+$/, '')));
  }
}
