import { Observable, Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import { IPagination } from '@diktup/frontend/models';
import { ProductClicksType } from '@sifca-monorepo/terminal-generator';

import { ClicksService } from '../clicks.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'clicks',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClicksListComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  pageChanged: boolean;
  pagination: IPagination;
  breadCrumbItems!: Array<{}>;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  clicks$: Observable<ProductClicksType[]> = this.clicksService.clicks$;
  loadingClicks$: Observable<boolean> = this.clicksService.loadingClicks$;

  searchForm: FormGroup = this.formBuilder.group({
    searchString: [''],
  });

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private formBuilder: FormBuilder,
    private clicksService: ClicksService,
    private translate: TranslateService,
    private sharedService: SharedService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.clicksService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.clicksService.pageIndex || 0,
        size: this.clicksService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.clicksService.pageIndex || 0) * this.clicksService.pageLimit,
        endIndex: Math.min(((this.clicksService.pageIndex || 0) + 1) * this.clicksService.pageLimit - 1, pagination.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.clicksService.searchString = searchValues.searchString;
          return this.clicksService.findProductClicksByOwnerPaginated();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnInit(): void {
    this.translate
      .get(['MENUITEMS.TS.ECOMMERCE', 'MENUITEMS.TS.PRODUCTS'])
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe((translations) => {
        this.breadCrumbItems = [{ label: translations['MENUITEMS.TS.ECOMMERCE'] }, { label: translations['MENUITEMS.TS.PRODUCTS'], active: true }];
      });
  }


  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.clicksService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.clicksService.findProductClicksByOwnerPaginated().subscribe();
    }
  }


  ngOnDestroy(): void {
    this.clicksService.searchString = '';
    this.clicksService.pageIndex = 0;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
