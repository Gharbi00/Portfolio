import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subject, catchError, of, take, takeUntil } from 'rxjs';
import { isArray, isDate, isEqual, isObject, keys, map, transform, values } from 'lodash';
import { ViewEncapsulation, ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  ChallengeType,
  ActivityTypeType,
  LoyaltySettingsType,
  TransactionChallengeTypeEnum,
  ActivityTypeWithActiveStatusType,
} from '@sifca-monorepo/terminal-generator';

import { ChallengesService } from '../challenges.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { LoyaltyService } from '../../../../system/apps/apps/loyalty/loyalty.service';
import { QuestTypeService } from '../../../../system/apps/apps/campaigns/campaigns.service';

@Component({
  selector: 'activity-list',
  templateUrl: './activity-list.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityListComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  selectedType: any;
  initialValues: any;
  challengeId: string;
  isButtonDisabled = true;
  challengeForm: FormGroup;
  challenge: ChallengeType;
  activityTypes = values(TransactionChallengeTypeEnum);
  challenge$: Observable<ChallengeType> = this.challengeService.challenge$;
  donations$: Observable<ActivityTypeType[]> = this.questTypeService.infiniteDonations$;
  loyaltySettings$: Observable<LoyaltySettingsType> = this.loyaltyService.loyaltySettings$;
  activities$: Observable<ActivityTypeWithActiveStatusType[]> = this.questTypeService.activityTypes$;

  get activities(): FormArray {
    return this.challengeForm?.get('activities') as FormArray;
  }

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private router: Router,
    private cd: ChangeDetectorRef,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private sharedService: SharedService,
    private activatedRoute: ActivatedRoute,
    private loyaltyService: LoyaltyService,
    private questTypeService: QuestTypeService,
    private challengeService: ChallengesService,
    private challengesService: ChallengesService,
  ) {}

  ngOnInit(): void {
    this.challengeId = this.activatedRoute.snapshot.paramMap.get('id');
    this.challengeService.challenge$.pipe(takeUntil(this.unsubscribeAll)).subscribe((challenge) => {
      this.challenge = challenge;
      this.selectedType = isArray(challenge?.activities) ? 'activities' : 'donation';
      if (this.selectedType === 'donation') {
        this.loyaltyService.findLoyaltySettingsByTarget().subscribe();
        this.questTypeService.getDonationActivityTypesByTargetPaginated().subscribe();
      } else {
        this.questTypeService.getPredefinedActivityTypesByTargetWithActiveStatusPaginated().subscribe();
      }
      this.challengeForm = this.formBuilder.group({
        activities: this.formBuilder.array(
          challenge?.activities?.length
            ? map(challenge?.activities, (activity) => {
                return this.formBuilder.group({
                  activityType: [activity?.activityType || undefined],
                  predefined: [activity?.predefined || undefined],
                });
              })
            : [
                this.formBuilder.group({
                  activityType: [undefined],
                  predefined: [undefined],
                }),
              ],
        ),
        donation: this.formBuilder.group({
          objective: [challenge?.donation?.objective || undefined],
          donation: [challenge?.donation?.donation || undefined],
        }),
      });
      this.initialValues = this.challengeForm.value;
      this.challengeForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
        this.isButtonDisabled = isEqual(this.initialValues, values);
      });
      this.cd.markForCheck();
    });
  }

  save() {
    let input: any;
    this.isButtonDisabled = true;
    let activities;
    let donation;
    if (this.selectedType === 'activities') {
      activities = map(this.activities.value, (item) => {
        return {
          ...(item.activityType ? { activityType: item.activityType } : {}),
          ...(item.predefined?.id ? { predefined: item.predefined?.id } : {}),
        };
      });
    } else{
      donation = {
        ...(this.challengeForm.get(['donation', 'objective']).value ? { objective: this.challengeForm.get(['donation', 'objective']).value } : {}),
        ...(this.challengeForm.get(['donation', 'donation']).value?.id ? { donation: this.challengeForm.get(['donation', 'donation']).value?.id } : {}),
      };
    }
    input = {
      ...(this.selectedType === 'activities' ? { activities } : {}),
      ...(this.selectedType === 'donation' ? { donation } : {}),
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

  addActivityField() {
    this.activities.push(
      this.formBuilder.group({
        activityType: [undefined],
        predefined: [undefined],
      }),
    );
  }

  removeActivityField(index: number) {
    this.activities.removeAt(index);
  }

  loadMoreActivities() {
    this.questTypeService.isLastPredefinedActivity$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.questTypeService.pageIndex += 1;
        this.questTypeService.getPredefinedActivityTypesByTargetWithActiveStatusPaginated().subscribe();
      }
    });
  }

  loadMoreDonations() {
    this.questTypeService.isLastDonation$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.questTypeService.donationPageIndex += 1;
        this.questTypeService.getDonationActivityTypesByTargetPaginated().subscribe();
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
    this.questTypeService.infiniteDonations$ = null;
    this.questTypeService.activityTypes$ = null;
    this.questTypeService.pageIndex = 0;
    this.questTypeService.donationPageIndex = 0;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
