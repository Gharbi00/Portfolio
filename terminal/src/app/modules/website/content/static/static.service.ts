import { BehaviorSubject, Observable, map } from 'rxjs';
import { Injectable } from '@angular/core';

import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';
import {
  StaticTranslationInput,
  StaticTranslationType,
  CreateStaticTranslationGQL,
  DeleteStaticTranslationGQL,
  GetStaticTranslationsByTargetAndLanguagePaginatedGQL,
  TargetHasStaticTranslationsReferenceGQL,
  UpdateStaticTranslationGQL,
  UpdateStaticTranslationInput,
  TranslationAppEnum,
} from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class StaticService {
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private staticTranslations: BehaviorSubject<StaticTranslationType[]> = new BehaviorSubject(null);
  private loadingStaticTranslations: BehaviorSubject<boolean> = new BehaviorSubject(null);

  pageIndex = 0;
  pageLimit = 10;
  language: string;

  constructor(
    private storageHelper: StorageHelper,
    private deleteStaticTranslationGQL: DeleteStaticTranslationGQL,
    private updateStaticTranslationGQL: UpdateStaticTranslationGQL,
    private createStaticTranslationGQL: CreateStaticTranslationGQL,
    private targetHasStaticTranslationsReferenceGQL: TargetHasStaticTranslationsReferenceGQL,
    private getStaticTranslationsByTargetAndLanguagePaginatedGQL: GetStaticTranslationsByTargetAndLanguagePaginatedGQL,
  ) {}

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  get staticTranslations$(): Observable<StaticTranslationType[]> {
    return this.staticTranslations.asObservable();
  }

  get loadingStaticTranslations$(): Observable<boolean> {
    return this.loadingStaticTranslations.asObservable();
  }

  getStaticTranslationsByTargetAndLanguagePaginated(): Observable<StaticTranslationType[]> {
    this.loadingStaticTranslations.next(true);
    return this.getStaticTranslationsByTargetAndLanguagePaginatedGQL
      .fetch({
        app: TranslationAppEnum.WEBSITE,
        ...(this.language ? { language: this.language } : {}),
        target: { pos: this.storageHelper.getData('posId') },
        pagination: { page: this.pageIndex, limit: this.pageLimit },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.pagination.next({
              page: this.pageIndex,
              size: this.pageLimit,
              length: data.getStaticTranslationsByTargetAndLanguagePaginated?.count,
            });
            this.loadingStaticTranslations.next(false);
            this.staticTranslations.next(data.getStaticTranslationsByTargetAndLanguagePaginated.objects);
            return data.getStaticTranslationsByTargetAndLanguagePaginated?.objects;
          }
        }),
      );
  }

  targetHasStaticTranslationsReference(reference: string): Observable<boolean> {
    return this.targetHasStaticTranslationsReferenceGQL
      .fetch({
        app: TranslationAppEnum.WEBSITE,
        reference,
        target: { pos: this.storageHelper.getData('posId') },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            return data.targetHasStaticTranslationsReference?.hasReference;
          }
        }),
      );
  }

  deleteStaticTranslation(id: string): Observable<boolean> {
    return this.deleteStaticTranslationGQL.mutate({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          const brands = this.staticTranslations.value.filter((item) => item.id !== id);
          this.staticTranslations.next(brands);
          return true;
        }
        return false;
      }),
    );
  }

  createStaticTranslation(input: StaticTranslationInput): Observable<StaticTranslationType> {
    return this.createStaticTranslationGQL.mutate({ input: { ...input, app: TranslationAppEnum.WEBSITE,  target: { pos: this.storageHelper.getData('posId') } } }).pipe(
      map((response: any) => {
        if (response.data) {
          this.staticTranslations.next([response.data.createStaticTranslation, ...(this.staticTranslations.value || [])]);
          return response.data.createStaticTranslation;
        }
      }),
    );
  }

  updateStaticTranslation(input: UpdateStaticTranslationInput): Observable<StaticTranslationType> {
    return this.updateStaticTranslationGQL.mutate({ input }).pipe(
      map(({ data }: any) => {
        if (data) {
          if (this.staticTranslations.value?.length) {
            const staticTranslations = this.staticTranslations.value;
            const index = staticTranslations?.findIndex((a) => a.id === input?.id);
            staticTranslations[index] = data.updateStaticTranslation;
            this.staticTranslations.next(staticTranslations);
          }
          return data.updateStaticTranslation;
        }
      }),
    );
  }
}
