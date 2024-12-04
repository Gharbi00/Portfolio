import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  CreateLandingPageGQL,
  FindLandingPagesByTargetAndTypeAndStatusPaginatedGQL,
  LandingPageGQL,
  PublishLandingPageGQL,
  UpdateLandingPageGQL,
  UpdateLandingPageStatusGQL,
  UpdateLandingPagesInput,
  LandingPageTypeEnum,
  LandingPagesInput,
  LandingPagesType,
  VisibilityStatusEnum,
} from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({
  providedIn: 'root',
})
export class PagesService {
  private pagination: BehaviorSubject<IPagination | null> = new BehaviorSubject(null);
  private landingPage: BehaviorSubject<LandingPagesType | null> = new BehaviorSubject(null);
  private landingPages: BehaviorSubject<LandingPagesType[] | null> = new BehaviorSubject(null);

  pageIndex = 0;
  filterLimit = 9;
  searchString = '';
  pageType: LandingPageTypeEnum;
  status?: VisibilityStatusEnum;

  constructor(
    private storageHelper: StorageHelper,
    private landingPageGQL: LandingPageGQL,
    private createLandingPageGQL: CreateLandingPageGQL,
    private updateLandingPageGQL: UpdateLandingPageGQL,
    private publishLandingPageGQL: PublishLandingPageGQL,
    private updateLandingPageStatusGQL: UpdateLandingPageStatusGQL,
    private findLandingPagesByTargetAndTypeAndStatusPaginatedGQL: FindLandingPagesByTargetAndTypeAndStatusPaginatedGQL,
  ) {}

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  get landingPage$(): Observable<LandingPagesType> {
    return this.landingPage.asObservable();
  }
  set landingPage$(value: any) {
    this.landingPage.next(value);
  }

  /**
   * Getter for landing pages
   */
  get landingPages$(): Observable<LandingPagesType[]> {
    return this.landingPages.asObservable();
  }
  /**
   * landingPage by id
   */
  landingPageById(id: string): Observable<LandingPagesType> {
    return this.landingPageGQL.fetch({ id }).pipe(
      tap((response: any) => {
        if (response.data) {
          this.landingPage.next(response.data.landingPage);
          return response.data.landingPage;
        }
      }),
    );
  }

  findLandingPagesByTargetAndTypeAndStatusPaginated(): Observable<LandingPagesType[]> {
    return this.findLandingPagesByTargetAndTypeAndStatusPaginatedGQL
      .fetch({
        pagination: { page: this.pageIndex, limit: this.filterLimit },
        target: { pos: this.storageHelper.getData('posId') },
        ...(this.status ? { status: this.status } : {}),
        ...(this.pageType ? { pageType: this.pageType } : {}),
        searchString: this.searchString,
      })
      .pipe(
        tap((response: any) => {
          if (response.data) {
            this.pagination.next({
              page: this.pageIndex,
              size: this.filterLimit,
              length: response.data.findLandingPagesByTargetAndTypeAndStatusPaginated?.count,
            });
            this.landingPages.next(response.data.findLandingPagesByTargetAndTypeAndStatusPaginated.objects);
            return response.data.findLandingPagesByTargetAndTypeAndStatusPaginated.objects;
          }
        }),
      );
  }

  createPage(input: LandingPagesInput): Observable<LandingPagesType[]> {
    return this.createLandingPageGQL.mutate({ input: { ...input, target: { pos: this.storageHelper.getData('posId') } } }).pipe(
      tap((response: any) => {
        if (response.data) {
          return response.data.createLandingPage;
        }
      }),
    );
  }

  updateLandingPageStatus(status: VisibilityStatusEnum, id: string): Observable<LandingPagesType> {
    return this.updateLandingPageStatusGQL.mutate({ status, id }).pipe(
      tap(({ data }: any) => {
        if (data) {
          const landingPages = this.landingPages.value;
          const index = landingPages?.findIndex((a) => a.id === id);
          landingPages[index] = data.updateLandingPageStatus;
          this.landingPages.next(landingPages);
          return data.updateLandingPageStatus;
        }
      }),
    );
  }

  updateLandingPage(id: string, input: UpdateLandingPagesInput): Observable<LandingPagesType> {
    return this.updateLandingPageGQL.mutate({ id, input }).pipe(
      tap((response: any) => {
        if (response.data) {
          this.landingPage.next(response.data.updateLandingPage);
          return response.data.updateLandingPage;
        }
      }),
    );
  }

  /**
   * updateLandingPage
   */
  publishLandingPage(id: string): Observable<LandingPagesType[]> {
    return this.publishLandingPageGQL.mutate({ id }).pipe(
      tap((response: any) => {
        if (response.data) {
          const pages = this.landingPages.value;
          const index = pages.findIndex((p) => p.id === id);
          pages[index] = response.data.publishLandingPage;
          this.landingPages.next(pages);
          return pages;
        }
      }),
    );
  }
}
