import Swal from 'sweetalert2';
import { REGEX } from '@diktup/frontend/config';
import { isEqual, keys, omit, values } from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, debounceTime, distinctUntilChanged, switchMap, take, takeUntil } from 'rxjs/operators';
import { Observable, Subject, of, throwError } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, PLATFORM_ID, ViewEncapsulation } from '@angular/core';

import { IPagination } from '@diktup/frontend/models';
import { CouponType, UserType } from '@sifca-monorepo/terminal-generator';
import { DiscountType } from '@sifca-monorepo/terminal-generator';
import { ConvertorHelper, FormHelper, StorageHelper } from '@diktup/frontend/helpers';

import { CouponsService } from '../coupons.service';
import { UserService } from '../../../../../core/services/user.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'coupons-list',
  templateUrl: './list.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CouponsListComponent implements OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  initValues: any;
  pageChanged: boolean;
  couponForm: FormGroup;
  filterForm: FormGroup;
  pagination: IPagination;
  isButtonDisabled = true;
  selectedCoupon: CouponType;
  breadCrumbItems!: Array<{}>;
  isFilterButtonDisabled = true;
  discountTypes: string[] = values(DiscountType);
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  coupons$: Observable<CouponType[]> = this.couponsService.coupons$;
  loadingCoupons$: Observable<boolean> = this.couponsService.loadingCoupons$;
  searchForm: FormGroup = this.formBuilder.group({
    searchString: [''],
  });
  chanedValues: any;
  isEmailButtonDisabled = true;
  emailForm: FormGroup;
  filtredCoupons: any;

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private modalService: NgbModal,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private sharedService: SharedService,
    private storageHelper: StorageHelper,
    private couponsService: CouponsService,
    private convertorHelper: ConvertorHelper,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.changeDetectorRef.markForCheck();
          this.couponsService.searchString = searchValues.searchString;
          return this.couponsService.findCouponsByTargetWithFilterPaginated();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
    this.couponsService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.couponsService.pageIndex || 0,
        size: this.couponsService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.couponsService.pageIndex || 0) * this.couponsService.pageLimit,
        endIndex: Math.min(((this.couponsService.pageIndex || 0) + 1) * this.couponsService.pageLimit - 1, pagination.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
  }

  openEmailModal(content: any) {
    this.modalService.open(content, { size: 'md', centered: true });
    this.userService.user$.pipe(take(1)).subscribe((user: UserType) => {
      this.emailForm = this.formBuilder.group({
        emails: [[user?.email], Validators.required],
      });
      const initialValues = this.emailForm.value;
      this.emailForm.valueChanges.subscribe((ivalues) => {
        this.isEmailButtonDisabled = isEqual(ivalues, initialValues);
      });
      this.changeDetectorRef.markForCheck();
    });
  }

  send() {
    this.isEmailButtonDisabled = true;
    this.couponsService
      .sendCouponsBymail(this.emailForm.get('emails').value, this.filtredCoupons)
      .pipe(
        catchError((error) => {
          if (error) {
            this.modalService.dismissAll();
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
          }
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.modalService.dismissAll();
          this.position();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  downloadDocument() {
    if (isPlatformBrowser(this.platformId)) {
      this.couponsService.getCouponsByExcel(this.filtredCoupons).subscribe((res) => {
        const blob = this.convertorHelper.b64toBlob(res, 'xlsx');
        const a = this.document.createElement('a');
        this.document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = String('coupons.xlsx');
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      });
    }
  }

  openFilterModal(content: any) {
    this.isFilterButtonDisabled = true;
    this.modalService.open(content, { centered: true });
    this.filterForm = this.formBuilder.group({
      discountType: [this.chanedValues?.discountType || 'All'],
      expired: [this.chanedValues?.expired || false],
      redeemed: [this.chanedValues?.redeemed || false],
      couponCode: [this.chanedValues?.couponCode || ''],
    });
    this.initValues = this.filterForm.value;
    this.filterForm.valueChanges.subscribe((ivalues) => {
      this.isFilterButtonDisabled = isEqual(ivalues, this.initValues);
    });
    this.sharedService.resetFilter$.pipe(takeUntil(this.unsubscribeAll)).subscribe((reset) => {
      if (reset) {
        this.resetForm();
      }
    });
  }

  resetForm() {
    this.filterForm.reset();
  }

  saveFilter() {
    const input: any = {
      ...(this.filterForm.get('discountType').value === 'All' ? { discountType: null } : { discountType: this.filterForm.get('discountType').value }),
      ...FormHelper.getNonEmptyValues(omit(this.filterForm.value, 'discountType')),
    };
    this.chanedValues = this.filterForm.value;
    this.modalService.dismissAll();
    this.couponsService.findCouponsByTargetWithFilterPaginated(input).subscribe(() => {
      this.filtredCoupons = input;
    });
  }

  openCouponModal(content: any, coupon: CouponType) {
    this.selectedCoupon = coupon;
    this.modalService.open(content, { centered: true });
    this.couponForm = this.formBuilder.group({
      from: [coupon?.from || ''],
      to: [coupon?.to || ''],
      quantity: [1, Validators.required],
      discount: this.formBuilder.group({
        discountType: [coupon?.discount?.discountType || '', [Validators.required]],
        amount: [coupon?.discount?.amount || '0', [Validators.required, Validators.pattern(REGEX.ONLY_POSITIVE)]],
      }),
    });
    this.initValues = this.couponForm.value;
    this.couponForm.valueChanges.subscribe((pageValues) => {
      this.isButtonDisabled = isEqual(pageValues, this.initValues);
    });
  }

  generateCoupon() {
    this.isButtonDisabled = true;
    const discount = {
      ...FormHelper.getNonEmptyValues(this.couponForm.value.discount),
    };
    const input: any = {
      ...FormHelper.getNonEmptyValues(omit(this.couponForm.value, 'discount')),
      ...(keys(discount)?.length ? { discount } : {}),
    };
    this.couponsService
      .generateCoupons({ ...input, target: { pos: this.storageHelper.getData('posId') } })
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
        this.position();
        this.modalService.dismissAll();
        this.changeDetectorRef.markForCheck();
      });
  }

  addCoupon() {
    this.isButtonDisabled = true;
    if (this.selectedCoupon) {
      const discount = {
        ...FormHelper.getNonEmptyValues(this.couponForm.value.discount),
      };
      const input: any = {
        ...FormHelper.getNonEmptyAndChangedValues(omit(this.couponForm.value, 'discount', 'quantity'), omit(this.initValues, 'discount')),
        ...(keys(discount)?.length ? { discount } : {}),
      };
      this.couponsService.updateCoupon(this.selectedCoupon?.id, input).subscribe((res: any) => {
        if (res) {
          this.position();
          this.modalService.dismissAll();
          this.changeDetectorRef.markForCheck();
        }
      });
    } else {
      const discount = {
        ...FormHelper.getNonEmptyValues(this.couponForm.value.discount),
      };
      const input: any = {
        ...FormHelper.getNonEmptyValues(omit(this.couponForm.value, 'discount', 'quantity')),
        ...(keys(discount)?.length ? { discount } : {}),
      };
      this.couponsService
        .createCoupon({ ...input, target: { pos: this.storageHelper.getData('posId') } })
        .pipe(
          catchError((error) => {
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return throwError(() => new Error(error));
          }),
        )
        .subscribe(() => {
          this.position();
          this.pagination.length += 1;
          this.pagination.endIndex += 1;
          this.modalService.dismissAll();
          this.changeDetectorRef.markForCheck();
        });
    }
  }

  openDisableCouponModal(content: any, coupon: CouponType) {
    this.selectedCoupon = coupon;
    this.modalService.open(content, { centered: true });
  }

  disableCoupon(): void {
    this.couponsService
      .disableCoupon(this.selectedCoupon.id)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
        this.position();
        this.modalService.dismissAll();
      });
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.couponsService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.couponsService.findCouponsByTargetWithFilterPaginated().subscribe();
    }
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

  compare(toDate: any) {
    return new Date(toDate) < new Date();
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.couponsService.pageIndex = 0;
    this.couponsService.searchString = '';
  }
}
