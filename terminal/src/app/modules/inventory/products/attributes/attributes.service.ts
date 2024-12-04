import { pick, findIndex } from 'lodash';
import { Injectable } from '@angular/core';
import { tap, map, take, switchMap } from 'rxjs/operators';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import {
  AttributeType,
  AttributeValueType,
  AttributeValueInput,
  ProductAttributeType,
  AttributeCreateInput,
  AttributeUpdateInput,
  DeleteResponseDtoType,
  DeleteAttributeGQL,
  CreateAttributeGQL,
  UpdateAttributeGQL,
  AttributeValueUpdateInput,
  AttributeValuePaginateType,
  UpdateAttributeValueGQL,
  DeleteAttributeValueGQL,
  CreateAttributeValueGQL,
  UpdateProductAttributeGQL,
  SearchAttributeByTargetGQL,
  GetAttributeValuesByTargetPaginatedGQL,
  GetAttributeValuesByAttributePaginatedGQL,
} from '@sifca-monorepo/terminal-generator';

import { InventoryService } from '../../../../shared/services/inventory.service';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({
  providedIn: 'root',
})
export class AttributesService {
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private isLastAttribute: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingAttributes: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private selectedAttribute: BehaviorSubject<string> = new BehaviorSubject(null);
  private attributes: BehaviorSubject<AttributeType[]> = new BehaviorSubject(null);
  private valuesPagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private isLastAttributeValues: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private productAttributes: BehaviorSubject<AttributeValueType[]> = new BehaviorSubject(null);

  pageIndex = 0;
  filterLimit = 10;
  searchString = '';
  valuesPageIndex = 0;
  valuesFilterLimit = 10;

  get attributes$(): Observable<AttributeType[]> {
    return this.attributes.asObservable();
  }
  get isLastAttributeValues$(): Observable<boolean> {
    return this.isLastAttributeValues.asObservable();
  }
  get productAttributes$(): Observable<AttributeValueType[]> {
    return this.productAttributes.asObservable();
  }
  get selectedAttribute$(): Observable<string> {
    return this.selectedAttribute.asObservable();
  }
  set selectedAttribute$(value: any) {
    this.selectedAttribute.next(value);
  }
  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }
  get valuesPagination$(): Observable<IPagination> {
    return this.valuesPagination.asObservable();
  }
  get isLastAttribute$(): Observable<boolean> {
    return this.isLastAttribute.asObservable();
  }
  get loadingAttributes$(): Observable<boolean> {
    return this.loadingAttributes.asObservable();
  }

  constructor(
    private storageHelper: StorageHelper,
    private inventoryService: InventoryService,
    private createAttributeGQL: CreateAttributeGQL,
    private deleteAttributeGQL: DeleteAttributeGQL,
    private updateAttributeGQL: UpdateAttributeGQL,
    private createAttributeValueGQL: CreateAttributeValueGQL,
    private deleteAttributeValueGQL: DeleteAttributeValueGQL,
    private updateAttributeValueGQL: UpdateAttributeValueGQL,
    private updateProductAttributeGQL: UpdateProductAttributeGQL,
    private searchAttributeByTargetGQL: SearchAttributeByTargetGQL,
    private getAttributeValuesByTargetPaginatedGQL: GetAttributeValuesByTargetPaginatedGQL,
    private getAttributeValuesByAttributePaginatedGQL: GetAttributeValuesByAttributePaginatedGQL,
  ) {}

  getAttributeValuesByTargetPaginated(): Observable<AttributeValuePaginateType> {
    return this.getAttributeValuesByTargetPaginatedGQL
      .fetch({ target: { pos: this.storageHelper.getData('posId') }, pagination: { page: this.valuesPageIndex, limit: this.valuesFilterLimit } })
      .pipe(
        tap(({ data }: any) => {
          if (data) {
            this.productAttributes.next(data.getAttributeValuesByTargetPaginated.objects);
            this.attributes.next(data.getAttributeValuesByTargetPaginated.objects);
            return data.getAttributeValuesByTargetPaginated.objects;
          }
        }),
      );
  }

  searchAttributeByTarget(): Observable<AttributeValuePaginateType> {
    this.loadingAttributes.next(true);
    return this.inventoryService.variety$.pipe(
      take(1),
      switchMap((variety) =>
        this.searchAttributeByTargetGQL.fetch({
          variety,
          target: { pos: this.storageHelper.getData('posId') },
          searchString: this.searchString,
          pagination: { page: this.pageIndex, limit: this.filterLimit },
        }),
      ),
      tap(({ data }: any) => {
        if (data) {
          this.pagination.next({
            page: this.pageIndex,
            size: this.filterLimit,
            length: data.searchAttributeByTarget?.count,
          });
          this.loadingAttributes.next(false);
          this.isLastAttribute.next(data.searchAttributeByTarget.isLast);
          this.attributes.next(data.searchAttributeByTarget.objects);
          return data.searchAttributeByTarget.objects;
        }
      }),
    );
  }

  getAttributeValuesByAttributePaginated(attributId: string): Observable<AttributeValuePaginateType> {
    return this.getAttributeValuesByAttributePaginatedGQL
      .fetch({ attributId, pagination: { page: this.valuesPageIndex, limit: this.valuesFilterLimit } })
      .pipe(
        tap(({ data }: any) => {
          if (data) {
            this.isLastAttributeValues.next(data.getAttributeValuesByAttributePaginated.isLast);
            this.productAttributes.next(data.getAttributeValuesByAttributePaginated.objects);
            this.valuesPagination.next({
              page: this.valuesPageIndex,
              size:
                this.valuesFilterLimit > data.getAttributeValuesByAttributePaginated?.count
                  ? data.getAttributeValuesByAttributePaginated?.count
                  : this.valuesFilterLimit,
              length: data.getAttributeValuesByAttributePaginated?.count,
            });
          }
        }),
      );
  }

  deleteAttributeValue(id: string): Observable<DeleteResponseDtoType> {
    return this.deleteAttributeValueGQL.mutate({ id }).pipe(
      take(1),
      map(({ data }: any) => {
        if (data) {
          const productAttributes = this.productAttributes.value.filter((a) => a.id !== id);
          this.productAttributes.next(productAttributes);
          // this.valuesPagination.next({
          //   page: 0,
          //   size: this.valuesFilterLimit,
          //   length: Math.ceil(this.productAttributes.value.length / this.valuesFilterLimit),
          // });
          return data.deleteAttributeValue;
        }
      }),
    );
  }

  addProductAttributeValue(input: AttributeValueInput): Observable<ProductAttributeType[]> {
    return this.createAttributeValueGQL.mutate({ input: { ...input, target: { pos: this.storageHelper.getData('posId') } } }).pipe(
      take(1),
      tap(({ data }: any) => {
        if (data) {
          this.productAttributes.next([data.createAttributeValue, ...this.productAttributes.value]);
          // this.valuesPagination.next({
          //   page: 0,
          //   size:
          //     this.valuesFilterLimit > this.productAttributes.value.length
          //       ? this.productAttributes.value.length
          //       : this.valuesFilterLimit,
          //   length: Math.ceil(this.productAttributes.value.length / this.valuesFilterLimit),
          // });
          return [data.createAttribute, ...this.productAttributes.value];
        }
      }),
    );
  }

  addAttribute(input: AttributeCreateInput): Observable<AttributeType[]> {
    return combineLatest([
      this.attributes$,
      this.createAttributeGQL.mutate({ input: { ...input, target: { pos: this.storageHelper.getData('posId') } } }),
    ]).pipe(
      take(1),
      map(([attributes, { data }]: any) => {
        if (data) {
          this.attributes.next([data.createAttribute, ...(attributes.length ? attributes : [])]);
          return [data.createAttribute, ...(attributes.length ? attributes : [])];
        }
      }),
    );
  }

  updateProductAttribute(productAttribute: ProductAttributeType): Observable<ProductAttributeType[]> {
    return combineLatest([
      this.productAttributes$,
      this.updateProductAttributeGQL.mutate({
        input: pick(productAttribute, ['isRequired', 'isMultipleChoice', 'id', 'attribute', 'reference', 'possibleValues']) as any,
      }),
    ]).pipe(
      take(1),
      map(([productAttributes, { data }]: any) => {
        if (data) {
          const index = findIndex(productAttributes, { id: productAttribute.id });
          productAttributes[index] = data.updateProductAttribute;
          this.productAttributes.next(productAttributes);
          return productAttributes;
        }
      }),
    );
  }

  updateAttribute(attribute: AttributeUpdateInput): Observable<AttributeType[]> {
    return combineLatest([this.attributes$, this.updateAttributeGQL.mutate({ input: attribute })]).pipe(
      take(1),
      map(([attributes, { data }]: any) => {
        if (data) {
          const index = findIndex(attributes, { id: attribute.id });
          attributes[index] = data.updateAttribute;
          this.attributes.next(attributes);
          return attributes;
        }
      }),
    );
  }

  updateAttributeValue(attributeValue: AttributeValueUpdateInput): Observable<AttributeValueType[]> {
    return combineLatest([this.productAttributes$, this.updateAttributeValueGQL.mutate({ input: attributeValue })]).pipe(
      take(1),
      map(([productAttributes, { data }]: any) => {
        if (data) {
          const index = findIndex(productAttributes, { id: attributeValue.id });
          productAttributes[index] = data.updateAttributeValue;
          this.productAttributes.next(productAttributes);
          return productAttributes;
        }
      }),
    );
  }

  deleteAttribute(id: string): Observable<AttributeType[]> {
    return this.deleteAttributeGQL.mutate({ id }).pipe(
      take(1),
      map(({ data }: any) => {
        if (data) {
          const attributes = this.attributes.value.filter((a) => a.id !== id);
          this.attributes.next(attributes);
          return data.deleteAttribute;
        }
      }),
    );
  }
}
