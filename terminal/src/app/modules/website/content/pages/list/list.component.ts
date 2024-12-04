import Swal from 'sweetalert2';
import { values } from 'lodash';
import { Observable, Subject, throwError } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import { IPagination } from '@diktup/frontend/models';
import { LandingPageTypeEnum, LandingPagesType, VisibilityStatusEnum } from '@sifca-monorepo/terminal-generator';

import { PagesService } from '../pages.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'content-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentListComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  pageChanged: boolean;
  pagination: IPagination;
  pages: LandingPagesType[];
  breadCrumbItems!: Array<{}>;
  filtredPages: LandingPagesType[];
  status = values(VisibilityStatusEnum);
  pageTypes = values(LandingPageTypeEnum);
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private pagesService: PagesService,
    private sharedService: SharedService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.changeDetectorRef.markForCheck();
          this.pagesService.searchString = searchValues.searchString;
          return this.pagesService.findLandingPagesByTargetAndTypeAndStatusPaginated();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.WEBSITE').subscribe((website: string) => {
      this.translate.get('MENUITEMS.TS.PAGES').subscribe((pages: string) => {
        this.breadCrumbItems = [{ label: website }, { label: pages, active: true }];
      });
    });
    this.pagesService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.pagesService.pageIndex ? this.pagesService.pageIndex + 1 : 1,
        size: this.pagesService.filterLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.pagesService.pageIndex || 0) * this.pagesService.filterLimit,
        endIndex: Math.min(((this.pagesService.pageIndex || 0) + 1) * this.pagesService.filterLimit - 1, pagination?.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
    this.pagesService.landingPages$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pages: LandingPagesType[]) => {
      this.filtredPages = this.pages = pages;
      this.changeDetectorRef.markForCheck();
    });
  }

  changeStatus(status: any, id: string) {
    this.pagesService
      .updateLandingPageStatus(status, id)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
        this.position();
        this.changeDetectorRef.markForCheck();
      });
  }

  position() {
    this.translate.get('MENUITEMS.TS.WORK_SAVED').subscribe((workSaved: string) => {
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: workSaved,
        showConfirmButton: false,
        timer: 1500,
      });
    });
  }

  modalError() {
    this.translate.get('MENUITEMS.TS.STH_WENT_WRONG').subscribe((sthWrong: string) => {
      Swal.fire({
        title: 'Oops...',
        text: sthWrong,
        icon: 'warning',
        showCancelButton: false,
        confirmButtonColor: 'rgb(3, 142, 220)',
        cancelButtonColor: 'rgb(243, 78, 78)',
      });
    });
  }

  onPageChange(page: number) {
    this.page = page;
    this.pagesService.pageIndex = page - 1;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    if (this.pageChanged) {
      this.pagesService.findLandingPagesByTargetAndTypeAndStatusPaginated().subscribe();
    }
  }

  filterBy(event: any, field?: string) {
    if (field === 'pageType') {
      event.target.value !== 'All' ? (this.pagesService.pageType = event.target.value) : (this.pagesService.pageType = null);
    } else {
      event.target.value !== 'All' ? (this.pagesService.status = event.target.value) : (this.pagesService.status = null);
    }
    this.pagesService.pageIndex = 0;
    this.pagesService.findLandingPagesByTargetAndTypeAndStatusPaginated().subscribe();
  }

  toggle(event: any, id: string) {
    if (event.target.checked) {
      this.pagesService.publishLandingPage(id).subscribe((res) => {
        if (res) {
          this.changeDetectorRef.markForCheck();
        }
      });
    }
  }

  ngOnDestroy() {
    this.pagesService.pageIndex = 0;
    this.pagesService.searchString = '';
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
