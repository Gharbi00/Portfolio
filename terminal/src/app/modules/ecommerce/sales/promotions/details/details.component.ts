import { cloneDeep, isEqual, map, omit, values } from 'lodash-es';
import { Router, ActivatedRoute } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, Observable, Subject, switchMap, take, takeUntil, throwError } from 'rxjs';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import { BarcodeType, PromotionStatusEnum, PromotionType } from '@sifca-monorepo/terminal-generator';
import { BarcodeWithStockType, DiscountType } from '@sifca-monorepo/terminal-generator';

import { PromotionsService } from '../promotions.service';
import { FormHelper } from '@diktup/frontend/helpers';
import { BarcodeService } from '../../../../inventory/products/articles/articles.service';
import Swal from 'sweetalert2';
import { SharedService } from '../../../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'promotion-details',
  templateUrl: './details.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromotionComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  posId: string;
  breadCrumbItems!: Array<{}>;
  promo: PromotionType;
  status = values(PromotionStatusEnum);
  barcodes: BarcodeType[];
  selectedBarcodes: BarcodeType[];
  promotionForm: FormGroup;
  isButtonDisabled = true;
  discountTypes: string[] = values(DiscountType);
  searchForm: FormGroup = this.formBuilder.group({
    searchString: [''],
  });
  barcodeSearchInput$: Subject<string> = new Subject<string>();
  barcodes$: Observable<BarcodeWithStockType[]> = this.barcodeService.infinitBarcodes$;
  initialValues: any;
  navigating$: Observable<boolean> = this.sharedService.navigating$;

  get promotion(): FormArray {
    return this.promotionForm.get('promotion') as FormArray;
  }

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private activatedRoute: ActivatedRoute,
    private promotionsService: PromotionsService,
    private barcodeService: BarcodeService,
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
  ) {
    this.barcodeSearchInput$
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchString) => {
          this.barcodeService.infinitBarcodes$ = null;
          this.barcodeService.pageIndex = 0;
          this.barcodeService.searchString = searchString;
          return barcodeService.getBarcodesWithVarietyFilter();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.ECOMMERCE').subscribe((ecommerce: string) => {
      this.translate.get('MENUITEMS.TS.PROMOTIONS').subscribe((promotions: string) => {
        this.breadCrumbItems = [{ label: ecommerce }, { label: promotions, active: true }];
      });
    });
    this.promotionsService.promotion$.pipe(takeUntil(this.unsubscribeAll)).subscribe((promotion: PromotionType) => {
      this.promo = promotion;
      this.promotionForm = this.formBuilder.group({
        startDate: [promotion?.startDate || '', Validators.required],
        endDate: [promotion?.endDate || '', Validators.required],
        status: [promotion?.status || PromotionStatusEnum.ONGOING],
        promotion: this.formBuilder.array(
          promotion?.promotion?.length
            ? map(promotion?.promotion, (promo) =>
                this.formBuilder.group({
                  barcode: [promo?.barcode || undefined, Validators.required],
                  discount: this.formBuilder.group({
                    discountType: [promo?.discount?.discountType || ''],
                    amount: [promo?.discount?.amount || ''],
                  }),
                }),
              )
            : [
                this.formBuilder.group({
                  barcode: ['', Validators.required],
                  discount: this.formBuilder.group({
                    discountType: ['', Validators.required],
                    amount: ['', Validators.required],
                  }),
                }),
              ],
        ),
      });
      this.initialValues = this.promotionForm.value;
      this.promotionForm.valueChanges.subscribe((ivalues) => {
        this.isButtonDisabled = isEqual(this.initialValues, ivalues);
      });
      this.changeDetectorRef.markForCheck();
    });
  }

  loadMoreBarcodes() {
    this.barcodeService.isBarcodeLastPage$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.barcodeService.pageIndex++;
        this.barcodeService.getBarcodesWithVarietyFilter().subscribe();
      }
    });
  }

  addPromotionField(): void {
    const promotion = this.formBuilder.group({
      barcode: ['', Validators.required],
      discount: this.formBuilder.group({
        discountType: ['', Validators.required],
        amount: ['', Validators.required],
      }),
    });
    (this.promotion as FormArray).push(promotion);
    this.changeDetectorRef.markForCheck();
  }

  cancel(): void {
    this.router.navigate(['..'], { relativeTo: this.activatedRoute });
    this.changeDetectorRef.markForCheck();
  }

  onChange(event) {
    this.promotionForm.get('status').patchValue(event.target.checked ? PromotionStatusEnum.ONGOING : PromotionStatusEnum.DRAFT);
  }

  removePromotionField(index: number): void {
    const promotionArray = this.promotion as FormArray;
    promotionArray.removeAt(index);
    this.changeDetectorRef.markForCheck();
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

  save(): void {
    const promotion = {
      promotion: this.promotionForm.value?.promotion?.length
        ? this.promotionForm.value?.promotion.map((promo) => ({
            barcode: promo.barcode?.id || '',
            discount: {
              discountType: promo?.discount?.discountType || '',
              amount: promo?.discount?.amount || '',
            },
          }))
        : [
            {
              barcode: '',
              discount: {
                discountType: '',
                amount: '',
              },
            },
          ],
    };
    this.isButtonDisabled = true;
    if (this.promo) {
      const input: any = {
        ...FormHelper.getNonEmptyAndChangedValues(omit(this.promotionForm.value, 'promotion'), omit(this.initialValues, 'promotion')),
        ...(isEqual(
          (this.initialValues.promotion?.length ? cloneDeep(this.initialValues.promotion) : []).sort(),
          (this.promotionForm.value?.promotion?.length ? cloneDeep(this.promotionForm.value.promotion) : []).sort(),
        )
          ? {}
          : { promotion: promotion.promotion }),
      };
      this.promotionsService
        .updatePromotion(this.promo?.id, input)
        .pipe(
          catchError((error) => {
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return throwError(() => new Error(error));
          }),
        )
        .subscribe((res: any) => {
          if (res) {
            this.position();
            this.router.navigate(['..'], { relativeTo: this.activatedRoute });
            this.changeDetectorRef.markForCheck();
          }
        });
    } else {
      const input: any = {
        ...FormHelper.getNonEmptyValues(omit(this.promotionForm.value, 'promotion')),
        ...(isEqual(
          (this.initialValues.promotion?.length ? cloneDeep(this.initialValues.promotion) : []).sort(),
          (this.promotionForm.value?.promotion?.length ? cloneDeep(this.promotionForm.value.promotion) : []).sort(),
        )
          ? {}
          : { promotion: promotion.promotion }),
      };
      this.promotionsService.createPromotion(input).subscribe((res: any) => {
        if (res) {
          this.position();
          this.router.navigate(['..'], { relativeTo: this.activatedRoute });
          this.changeDetectorRef.markForCheck();
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.promotionsService.promotion$ = null;
    this.barcodeService.infinitBarcodes$ = null;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
