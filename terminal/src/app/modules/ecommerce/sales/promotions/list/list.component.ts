import { OnInit, Component, OnDestroy, ChangeDetectorRef, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import Swal from 'sweetalert2';
import { isEqual, values } from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { IPagination } from '@diktup/frontend/models';
import { PromotionStatusEnum, PromotionType } from '@sifca-monorepo/terminal-generator';

import { PromotionsService } from '../promotions.service';
import { FormHelper } from '@diktup/frontend/helpers';
import { SharedService } from '../../../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'promotions-list',
  templateUrl: './list.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromotionsListComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  endDate: string;
  isLoading = false;
  startDate: string;
  pageChanged: boolean;
  filtredStatuses = [];
  filterForm: FormGroup;
  pagination: IPagination;
  paginationRange: number[];
  selectedStatus: any[] = [];
  breadCrumbItems!: Array<{}>;
  promotions: PromotionType[];
  isFilterButtonDisabled = true;
  selectedPromotion: PromotionType;
  status = values(PromotionStatusEnum);
  statuses = values(PromotionStatusEnum);
  searchInputControl: FormControl = new FormControl();
  promotions$: Observable<PromotionType[]> = this.promotionsService.promotions$;
  loadingPromotions$: Observable<boolean> = this.promotionsService.loadingPromotions$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;

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
    private modalService: NgbModal,
    private sharedService: SharedService,
    private promotionsService: PromotionsService,
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
  ) {
    this.promotionsService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.promotionsService.pageIndex || 0,
        size: this.promotionsService.filterLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.promotionsService.pageIndex || 0) * this.promotionsService.filterLimit,
        endIndex: Math.min(((this.promotionsService.pageIndex || 0) + 1) * this.promotionsService.filterLimit - 1, pagination?.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.changeDetectorRef.markForCheck();
          this.promotionsService.searchString = searchValues.searchString;
          return this.promotionsService.getPromotionsByTargetPagination();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  saveFilter() {
    this.startDate = this.filterForm.get('startDate').value;
    this.endDate = this.filterForm.get('endDate').value;
    const input: any = {
      ...FormHelper.getNonEmptyValues(this.filterForm.value),
    };
    this.modalService.dismissAll();
    this.promotionsService
      .getPromotionsByTargetPagination(input)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe();
  }

  onStatusChange(status: string, isChecked: boolean) {
    if (isChecked) {
      this.filtredStatuses.push(status);
    } else {
      const index = this.filtredStatuses.indexOf(status);
      if (index > -1) {
        this.filtredStatuses.splice(index, 1);
      }
    }
    this.selectedStatus = this.filtredStatuses;
    this.filterForm.get('statuses').patchValue(this.filtredStatuses);
  }

  onDateChange(event: any) {
    this.promotionsService.startDate = event?.selectedDates[0];
    this.promotionsService.endDate = event?.selectedDates[1];
    this.promotionsService.getPromotionsByTargetPagination().subscribe();
  }

  openFilterModal(content: any) {
    this.isFilterButtonDisabled = true;
    this.modalService.open(content, { centered: true });
    this.filterForm = this.formBuilder.group({
      startDate: [this.startDate || ''],
      endDate: [this.endDate || ''],
      statuses: [[]],
    });
    const initialValues = this.filterForm.value;
    this.filterForm.valueChanges.subscribe((ivalues) => {
      this.isFilterButtonDisabled = isEqual(ivalues, initialValues);
    });
    this.sharedService.resetFilter$.pipe(takeUntil(this.unsubscribeAll)).subscribe((reset) => {
      if (reset) {
        this.reset();
      }
    });
  }

  reset() {
    this.filterForm.reset();
  }

  resetDate(field: String) {
    if (field === 'startDate') {
      this.filterForm.get('startDate').patchValue('');
    } else {
      this.filterForm.get('endDate').patchValue('');
    }
  }

  openDeleteModal(content: any, promotion: PromotionType) {
    this.selectedPromotion = promotion;
    this.modalService.open(content, { centered: true });
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.promotionsService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.promotionsService.getPromotionsByTargetPagination().subscribe();
    }
  }

  deletePromotion(): void {
    this.promotionsService
      .deletePromotion(this.selectedPromotion.id)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
        this.position();
        this.pagination.length--;
        this.pagination.endIndex--;
        this.modalService.dismissAll();
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
    this.translate.get('MENUITEMS.TS.STH_WENT_WRONG').subscribe((sthWentWrong: string) => {
      Swal.fire({
        title: 'Oops...',
        text: sthWentWrong,
        icon: 'warning',
        showCancelButton: false,
        confirmButtonColor: 'rgb(3, 142, 220)',
        cancelButtonColor: 'rgb(243, 78, 78)',
      });
    });
  }

  pageChangedEvent(event: { previousPageIndex?: number; pageIndex: number; pageSize: number; length?: number }) {
    this.promotionsService.filterLimit = event.pageSize;
    this.promotionsService.pageIndex = event.pageIndex;
    this.promotionsService.getPromotionsByTargetPagination().subscribe();
    this.changeDetectorRef.markForCheck();
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.promotionsService.pageIndex = 0;
    this.promotionsService.searchString = '';
  }
}
