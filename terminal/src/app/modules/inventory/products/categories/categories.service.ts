import { map, slice } from 'lodash';
import { Injectable } from '@angular/core';
import { findIndex, forEach } from 'lodash-es';
import { tap, take, map as rxMap, switchMap } from 'rxjs/operators';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';

import {

  CatalogueCategoryType,
  CatalogueCategoryInput,
  CatalogueCategoryUpdateInput,
  CatalogueCategoryGQL,
  CreateCatalogueCategoryGQL,
  DeleteCatalogueCategoryGQL,
  UpdateCatalogueCategoryGQL,
  ReorderCatalogueCategoriesGQL,
  GetCatalogueCategoriesByLayerAndParentGQL,
} from '@sifca-monorepo/terminal-generator';
import { StorageHelper } from '@diktup/frontend/helpers';

import { ICatalogueCategoryTreeType } from './categories.types';
import { InventoryService } from '../../../../shared/services/inventory.service';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private tags: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(null);
  private category: BehaviorSubject<ICatalogueCategoryTreeType> = new BehaviorSubject<ICatalogueCategoryTreeType>(null);
  private categories: BehaviorSubject<ICatalogueCategoryTreeType[]> = new BehaviorSubject<ICatalogueCategoryTreeType[]>(null);
  private loadingCategories: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  get categories$(): Observable<ICatalogueCategoryTreeType[]> {
    return this.categories.asObservable();
  }
  get loadingCategories$(): Observable<boolean> {
    return this.loadingCategories.asObservable();
  }

  get category$(): Observable<ICatalogueCategoryTreeType> {
    return this.category.asObservable();
  }
  set category$(value: any) {
    this.category.next(value);
  }
  get tags$(): Observable<any[]> {
    return this.tags.asObservable();
  }

  constructor(
    private storageHelper: StorageHelper,
    private inventoryService: InventoryService,
    private catalogueCategoryGQL: CatalogueCategoryGQL,
    private createCatalogueCategoryGQL: CreateCatalogueCategoryGQL,
    private updateCatalogueCategoryGQL: UpdateCatalogueCategoryGQL,
    private deleteCatalogueCategoryGQL: DeleteCatalogueCategoryGQL,
    private reorderCatalogueCategoriesGQL: ReorderCatalogueCategoriesGQL,
    private getCatalogueCategoriesByLayerAndParentGQL: GetCatalogueCategoriesByLayerAndParentGQL,
  ) {}

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

  deleteNodeFromTree(node: ICatalogueCategoryTreeType, nodeId: string) {
    if (node.children != null) {
      for (let i = 0; i < node.children.length; i++) {
        const filtered = node.children.filter((f) => f.id === nodeId);
        if (filtered && filtered.length > 0) {
          node.children = node.children.filter((f) => f.id !== nodeId);
          return;
        }
        this.deleteNodeFromTree(node.children[i], nodeId);
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

  getCategories(layer: number, parent?: string, reset = false, loading = true): Observable<ICatalogueCategoryTreeType[]> {
    if (reset) {
      this.categories.next([]);
    }
    if (loading) {
      this.loadingCategories.next(true);
    }
    return this.inventoryService.variety$.pipe(
      take(1),
      switchMap((variety) =>
        combineLatest([
          this.getCatalogueCategoriesByLayerAndParentGQL.fetch({
            target: { pos: this.storageHelper.getData('posId') },
            layer,
            variety,
            ...(parent && { parent }),
          }),
          this.categories$,
        ]),
      ),
      take(1),
      rxMap(([response, categories]: any) => {
        if (response.data) {
          this.loadingCategories.next(false);
          if (!categories?.length) {
            this.categories.next(response.data.getCatalogueCategoriesByLayerAndParent);
            return response.data.getCatalogueCategoriesByLayerAndParent;
          } else {
            forEach(categories, (category) => this.insertNodeIntoTree(category, parent, response.data.getCatalogueCategoriesByLayerAndParent));
            this.categories.next(categories);
            return categories;
          }
        }
      }),
    );
  }

  catalogueCategory(id: string): Observable<CatalogueCategoryType> {
    return this.catalogueCategoryGQL.fetch({ id }).pipe(
      tap((response: any) => {
        if (response.data) {
          this.category.next(response.data.catalogueCategory);
          return response.data.catalogueCategory;
        }
      }),
    );
  }

  createCatalogueCategory(input: CatalogueCategoryInput): Observable<ICatalogueCategoryTreeType[]> {
    return this.inventoryService.variety$.pipe(
      take(1),
      switchMap((variety) =>
        combineLatest([
          this.createCatalogueCategoryGQL.mutate({ input: { ...input, target: { pos: this.storageHelper.getData('posId') }, variety } }),
          this.categories$,
        ]),
      ),
      take(1),
      switchMap(([{ data }, categories]: any) => {
        if (data) {
          if (!categories?.length || input.layer === 1) {
            this.categories.next([...categories, data.createCatalogueCategory]);
            return of([data.createCatalogueCategory]);
          }
          return this.getCategories(input.layer, input.parent);
        }
      }),
    );
  }

  updateCategory(categories: ICatalogueCategoryTreeType[], category: ICatalogueCategoryTreeType) {
    const index = findIndex(categories, { id: category.id });
    if (index > -1) {
      return [...slice(categories, 0, index), category, ...slice(categories, index + 1)];
    }
    return map(categories, (cat) => {
      if (cat.children?.length) {
        return {
          ...cat,
          children: this.updateCategory(cat.children, category),
        };
      }
      return cat;
    });
  }

  updateCatalogueCategory(input: CatalogueCategoryUpdateInput, layer?: number): Observable<ICatalogueCategoryTreeType[]> {
    return this.updateCatalogueCategoryGQL.mutate({ input }).pipe(
      tap((response: any) => {
        if (response.data) {
          this.categories.next(this.updateCategory(this.categories.value, response.data.updateCatalogueCategory));
        }
      }),
    );
  }

  deleteCatalogueCategory(categoryId: string): Observable<ICatalogueCategoryTreeType[]> {
    return this.deleteCatalogueCategoryGQL.mutate({ id: categoryId }).pipe(
      rxMap(({ data }: any) => {
        if (data?.deleteCatalogueCategory.success) {
          const categories = this.categories.value;
          if (categories?.length) {
            const index = categories.findIndex((c) => c.id === categoryId);
            if (index > -1) {
              categories.splice(index, 1);
            } else {
              forEach(categories, (icategory) => {
                this.deleteNodeFromTree(icategory, categoryId);
              });
            }
          }
          this.categories.next(categories);
          return categories;
        }
      }),
    );
  }

  deleteSubCategories(category: ICatalogueCategoryTreeType): Observable<ICatalogueCategoryTreeType[]> {
    const categories = this.categories.value;
    forEach(categories, (icategory) => {
      this.deleteSubCatFromNode(icategory, category.id);
    });
    this.categories.next(categories);
    return of(categories);
  }

  reorderCatalogueCategories(catalogCategoryId: string, newRank: number): Observable<ICatalogueCategoryTreeType[]> {
    return this.reorderCatalogueCategoriesGQL.mutate({ catalogCategoryId, target: { pos: this.storageHelper.getData('posId') }, newRank }).pipe(
      tap((response: any) => {
        if (response.data) {
          return this.getCategories(1, null, false, false).subscribe();
        }
      }),
    );
  }
}
