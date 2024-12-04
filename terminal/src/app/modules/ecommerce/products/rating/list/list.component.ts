import Swal from 'sweetalert2';
import { isEqual, reduce } from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject, catchError, of, switchMap, takeUntil, throwError } from 'rxjs';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import { CorporateRatingAssignmentType, CorporateRatingDefinitionType } from '@sifca-monorepo/terminal-generator';

import { RatingService } from '../rating.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'reviews',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewsListComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  posId: string;
  categories: any;
  reviewForm: FormGroup;
  isButtonDisabled = true;
  breadCrumbItems!: Array<{}>;
  selectedReview: CorporateRatingAssignmentType;
  ratingDefinitions: CorporateRatingDefinitionType[];
  corporateRatingAssignments: CorporateRatingAssignmentType[];
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  icons = {
    DURABILITY: 'ri-shield-check-line',
    OVERALL: 'ri-check-double-line',
    EASE_OF_USE: 'bx bxs-hand',
    QUALITY: 'ri-star-s-line',
    COMPATIBILITY: 'ri-settings-2-line',
    DESIGN: 'ri-pencil-line',
    FOOD: 'ri-restaurant-line',
    SERVICE: 'ri-service-fill',
    AMBIANCE: ' ri-thumb-up-fill',
    VALUE_FOR_MONEY: ' ri-money-dollar-circle-line',
    LOCATION: ' ri-map-pin-line',
    REPUTATION: 'ri-star-half-line',
    TOURIST_FRIENDLY: 'ri-team-line',
  };

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private reviewService: RatingService,
    private sharedService: SharedService,
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
  ) {
    this.reviewService.corporateRatingAssignments$
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe((corporateRatingAssignments: CorporateRatingAssignmentType[]) => {
        this.corporateRatingAssignments = corporateRatingAssignments;
        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.ECOMMERCE').subscribe((ecommerce: string) => {
      this.translate.get('MENUITEMS.TS.PRODUCTS').subscribe((products: string) => {
        this.breadCrumbItems = [{ label: ecommerce }, { label: products, active: true }];
      });
    });
    this.reviewService.corporateRatingAssignments$
      .pipe(
        takeUntil(this.unsubscribeAll),
        switchMap((corporateRatingAssignments: any) => {
          this.corporateRatingAssignments = corporateRatingAssignments;
          const unusedRatingDefs: CorporateRatingDefinitionType[] = reduce(
            corporateRatingAssignments,
            (acc, curr) => {
              acc = acc.concat(curr.reviewDefinition);
              return acc;
            },
            [],
          );
          return of(unusedRatingDefs);
        }),
        switchMap((unusedRatingDefs) =>
          this.reviewService.ratingDefinitions$.pipe(
            switchMap((ratingDefinitions) => {
              const filtredRatingDefinitions = ratingDefinitions.filter((r) => !unusedRatingDefs.map((u) => u.id).includes(r.id));
              return of(filtredRatingDefinitions);
            }),
          ),
        ),
      )
      .subscribe((filtredRatingDefinitions) => {
        this.ratingDefinitions = filtredRatingDefinitions;
        this.changeDetectorRef.markForCheck();
      });
  }

  onChangeStatus(id: string, field: string) {
    if (field === 'publish') {
      this.reviewService
        .updateCorporateRatingAssignment(id, true)
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
    } else {
      this.reviewService
        .updateCorporateRatingAssignment(id, false)
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

  save() {
    this.reviewService
      .createCorporateRatingAssignment(this.reviewForm.value)
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

  openDeleteModal(content: any, review: any) {
    this.selectedReview = review;
    this.modalService.open(content, { centered: true });
  }

  deleteReview() {
    this.reviewService
      .deleteCorporateRatingAssignment(this.selectedReview.id)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
        this.translate.get('MENUITEMS.TS.REVIEW_DELETED').subscribe((reviewDeleted: string) => {
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: reviewDeleted,
            showConfirmButton: false,
            timer: 1500,
          });
        });
        this.modalService.dismissAll();
        this.changeDetectorRef.markForCheck();
      });
  }

  openReviewModal(content: any) {
    this.modalService.open(content, { centered: true });
    this.reviewForm = this.formBuilder.group({
      reviewDefinition: ['', Validators.required],
      active: [false],
    });
    const initialValues = this.reviewForm.value;
    this.reviewForm.valueChanges.subscribe((ivalues) => {
      this.isButtonDisabled = isEqual(ivalues, initialValues);
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
