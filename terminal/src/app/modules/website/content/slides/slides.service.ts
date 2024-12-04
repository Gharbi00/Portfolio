import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import {
  SlidesType,
  SlidesInput,
  UpdateSlidesInput,
  CreateSlidesGQL,
  DeleteSlidesGQL,
  UpdateSlidesGQL,
  FindSlidesByTargetPaginatedGQL,
  FindSlideByTargetAndReferenceGQL,
} from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({
  providedIn: 'root',
})
export class SlidesService {
  private slides: BehaviorSubject<SlidesType[]> = new BehaviorSubject(null);
  private slide: BehaviorSubject<SlidesType> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination | null> = new BehaviorSubject(null);

  searchString = '';
  pageIndex = 0;
  pageLimit = 10;

  constructor(
    private storageHelper: StorageHelper,
    private createSlidesGQL: CreateSlidesGQL,
    private updateSlidesGQL: UpdateSlidesGQL,
    private deleteSlidesGQL: DeleteSlidesGQL,
    private findSlidesByTargetPaginatedGQL: FindSlidesByTargetPaginatedGQL,
    private findSlideByTargetAndReferenceGQL: FindSlideByTargetAndReferenceGQL,
  ) {}

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  get slides$(): Observable<SlidesType[]> {
    return this.slides.asObservable();
  }

  get slide$(): Observable<SlidesType> {
    return this.slide.asObservable();
  }
  set slide$(value: any) {
    this.slide.next(value);
  }

  getSlides(): Observable<SlidesType[]> {
    return this.findSlidesByTargetPaginatedGQL
      .fetch({
        pagination: { page: this.pageIndex, limit: this.pageLimit },
        searchString: this.searchString,
        target: { pos: this.storageHelper.getData('posId') },
      })
      .pipe(
        tap(({ data }: any) => {
          if (data) {
            this.pagination.next({
              page: this.pageIndex,
              size: this.pageLimit,
              length: data.findSlidesByTargetPaginated?.count,
            });
            this.slides.next(data.findSlidesByTargetPaginated.objects);
            return data.findSlidesByTargetPaginated.objects;
          }
        }),
      );
  }

  findSlideByTargetAndReference(reference: string): Observable<SlidesType> {
    return this.findSlideByTargetAndReferenceGQL
      .fetch({
        reference,
        target: { pos: this.storageHelper.getData('posId') },
      })
      .pipe(
        tap(({ data }: any) => {
          if (data) {
            this.slide.next(data.findSlideByTargetAndReference);
            return data.findSlideByTargetAndReference;
          }
        }),
      );
  }

  createSlide(input: SlidesInput): Observable<SlidesType[]> {
    return this.createSlidesGQL.mutate({ input: { ...input, target: { pos: this.storageHelper.getData('posId') } } }).pipe(
      tap((response: any) => {
        if (response.data) {
          return response.data.createSlides;
        }
      }),
    );
  }

  updateSlide(id: string, input: UpdateSlidesInput): Observable<SlidesType> {
    return this.updateSlidesGQL.mutate({ id, input }).pipe(
      tap(({ data }: any) => {
        if (data) {
          this.slide.next(data.updateSlides);
          return data.updateSlides;
        }
      }),
    );
  }

  deleteSlide(id: string): Observable<SlidesType[]> {
    return this.deleteSlidesGQL.mutate({ id }).pipe(
      tap((response: any) => {
        if (response.data) {
          const slides = this.slides.value;
          slides.splice(
            slides.findIndex((s) => s.id === id),
            1,
          );
          this.slides.next(slides);
          return slides;
        }
      }),
    );
  }
}
