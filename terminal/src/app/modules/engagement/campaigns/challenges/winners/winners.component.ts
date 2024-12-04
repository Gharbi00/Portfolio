import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap, take, takeUntil } from 'rxjs';
import { filter, isArray, isDate, isEqual, isObject, keys, map, transform } from 'lodash';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ViewEncapsulation, ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { ChallengesService } from '../challenges.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { BarcodeWithPublicPriceFullType, ChallengeType } from '@sifca-monorepo/terminal-generator';

@Component({
  selector: 'winners',
  templateUrl: './winners.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WinnersComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  initialValues: any;
  challengeId: string;
  isButtonDisabled = true;
  challengeForm: FormGroup;
  infiniteBarcodes: BarcodeWithPublicPriceFullType[];
  originalBarcodes: BarcodeWithPublicPriceFullType[] = [];
  barcodesSearchInput$: Subject<string> = new Subject<string>();

  infinitBarcodes$: Observable<BarcodeWithPublicPriceFullType[]> = this.challengesService.infinitBarcodes$;
  challenge: ChallengeType;

  get winners(): FormArray {
    return this.challengeForm?.get('winners') as FormArray;
  }

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private sharedService: SharedService,
    private activatedRoute: ActivatedRoute,
    private challengeService: ChallengesService,
    private challengesService: ChallengesService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.barcodesSearchInput$
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.challengeService.barcodePageIndex = 0;
          this.challengeService.infinitBarcodes$ = null;
          if (searchValues) {
            this.challengeService.searchString = searchValues;
          } else {
            this.challengeService.searchString = ''
          }
          return this.challengeService.getBarcodesWithVarietyAndStructureWithFilter();
        }),
      )
      .subscribe(() => this.changeDetectorRef.markForCheck());
  }

  ngOnInit(): void {
    this.challengeService.getBarcodesWithVarietyAndStructureWithFilter().subscribe();
    this.challengeId = this.activatedRoute.snapshot.paramMap.get('id');
    this.challengeService.challenge$.pipe(takeUntil(this.unsubscribeAll)).subscribe((challenge) => {
      this.challenge = challenge;
      this.challengeForm = this.formBuilder.group({
        winners: this.formBuilder.array(
          challenge?.winners?.length
            ? map(challenge?.winners, (winner, i) => {
                return this.formBuilder.group({
                  rank: [i + 1],
                  reward: [winner?.reward?.id || undefined],
                });
              })
            : [],
        ),
      });
      this.initialValues = this.challengeForm.value;
      this.challengeForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
        this.isButtonDisabled = isEqual(this.initialValues, values);
      });
    });
  }

  filterBarcodes(searchTerm: string) {
    if (!this.originalBarcodes?.length) {
      this.originalBarcodes = [...this.infiniteBarcodes];
    }
    this.infiniteBarcodes = filter(this.originalBarcodes, (barcode) => barcode.name.toLowerCase().includes(searchTerm?.toLowerCase()));
  }

  save() {
    let input: any;
    this.isButtonDisabled = true;
    input = {
      ...this.getChangedValues(this.challengeForm.value, this.initialValues),
    };
    this.challengesService
      .updateChallenge(this.challengeId, input)
      .pipe(
        catchError(() => {
          this.modalService.dismissAll();
          this.modalError();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.modalService.dismissAll();
          this.position();
        }
      });
  }

  exit() {
    this.router.navigate(['/engagement/campaigns/challenges'], { relativeTo: this.activatedRoute });
  }

  public getChangedValues(formValue: any, controlValue: any): any {
    return transform(
      formValue,
      (result: any, value: any, key: string) => {
        if (isObject(value) && !isArray(value) && !isDate(value)) {
          const changes = this.getChangedValues(value, controlValue[key]);
          if (keys(changes).length > 0) {
            result[key] = changes;
          }
          return;
        }
        if ((value !== '0.000' || isArray(value) || isDate(value)) && !isEqual((controlValue || {})[key], value)) {
          result[key] = value;
          return;
        }
      },
      {},
    );
  }

  addWinnerField() {
    this.winners.push(
      this.formBuilder.group({
        rank: [this.winners.value.length + 1],
        reward: [undefined, Validators.required],
      }),
    );
  }

  removeWinnerField(index: number) {
    this.winners.removeAt(index);
    const winnersArray = this.challengeForm.get('winners') as FormArray;
    winnersArray.controls.forEach((control, i) => {
      control.get('rank').setValue(i + 1);
    });
  }

  loadMoreBarcodes() {
    this.challengesService.isLastBarcode$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.challengesService.barcodePageIndex += 1;
        this.challengesService.getBarcodesWithVarietyAndStructureWithFilter().subscribe();
      }
    });
  }

  modalError() {
    this.translate.get('MENUITEMS.TS.STH_WENT_WRONG').subscribe((sthWentWrong: string) => {
      Swal.fire({
        title: 'Oops...',
        text: sthWentWrong,
        icon: 'error',
        showCancelButton: false,
        confirmButtonColor: 'rgb(3, 142, 220)',
        cancelButtonColor: 'rgb(243, 78, 78)',
      });
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

  ngOnDestroy() {
    this.challengesService.barcodePageIndex = 0;
    this.challengesService.infinitBarcodes$ = null;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}

