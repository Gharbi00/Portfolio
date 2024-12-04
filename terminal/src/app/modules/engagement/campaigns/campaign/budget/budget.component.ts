import Swal from 'sweetalert2';
import { isEqual } from 'lodash';
import { Options } from '@angular-slider/ngx-slider';
import { TranslateService } from '@ngx-translate/core';
import { Subject, catchError, of, takeUntil } from 'rxjs';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

import { QuestWithProgressType } from '@sifca-monorepo/terminal-generator';
import { CurrencyType } from '@sifca-monorepo/terminal-generator';

import { CampaignsService } from '../campaigns.service';
import { CustomCurrencyPipe } from '../../../../../../app/shared/pipes/currency.pipe';

@Component({
  selector: 'sifca-monorepo-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss'],
})
export class BudgetComponent {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  initialValues: any;
  selectionValue = 1;
  questForm: FormGroup;
  isButtonDisabled = true;
  quantitativeSelection = 1;
  currencies: CurrencyType[];
  quest: QuestWithProgressType;
  qualitativeBarOptions: Options;
  quantitativeBarOptions: Options;

  get winners(): FormArray {
    return this.questForm.get('winners') as FormArray;
  }
  get checkpoints(): FormArray {
    return this.questForm.get('checkpoints') as FormArray;
  }

  constructor(
    private formBuilder: FormBuilder,
    private campaignService: CampaignsService,
    private changeDetectorRef: ChangeDetectorRef,
    private customCurrencyPipe: CustomCurrencyPipe,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.campaignService.quest$.pipe(takeUntil(this.unsubscribeAll)).subscribe((quest) => {
      this.quest = quest;
      this.quantitativeBarOptions = {
        floor: +quest?.questType?.quantitative?.min,
        ceil: +quest?.questType?.quantitative?.max,
        logScale: true,
        showTicks: true,
      };
      this.qualitativeBarOptions = {
        floor: +quest?.questType?.qualitative?.min,
        ceil: +quest?.questType?.qualitative?.max,
        logScale: true,
        showTicks: true,
      };
      this.questForm = this.formBuilder.group({
        budget: this.formBuilder.group({
          maxAnswers: [quest?.budget.maxAnswers || ''],
          pricePerUser: [
            this.customCurrencyPipe.transform(+quest?.budget.pricePerUser, this.quest?.questType?.wallet?.coin?.unitValue?.currency?.name) || '',
          ],
          budget: [this.customCurrencyPipe.transform(+quest?.budget.budget, this.quest?.questType?.wallet?.coin?.unitValue?.currency?.name) || ''],
          remainingBudget: [
            this.customCurrencyPipe.transform(+quest?.budget.remainingBudget, this.quest?.questType?.wallet?.coin?.unitValue?.currency?.name) || '',
          ],
          remainingCoins: [quest?.budget.remainingCoins || ''],
        }),
      });
      this.initialValues = this.questForm.value;
      this.questForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
        this.isButtonDisabled = isEqual(this.initialValues, values);
      });
      this.changeDetectorRef.markForCheck();
    });
  }

  calculateQuestBudget() {
    this.campaignService
      .calculateQuestBudget(this.quest.id, this.questForm.get(['budget', 'maxAnswers']).value)
      .pipe(
        catchError((error) => {
          if (error && !this.quest?.remuneration?.length) {
            this.translate.get('MENUITEMS.TS.PLEASE_SET_REMUNERATION').subscribe((remunurationSet: string) => {
              Swal.fire({
                title: 'Oops...',
                text: remunurationSet,
                icon: 'error',
                showCancelButton: false,
                confirmButtonColor: 'rgb(3, 142, 220)',
                cancelButtonColor: 'rgb(243, 78, 78)',
              });
            });
            this.changeDetectorRef.markForCheck();
            return of(null);
          }
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.questForm.get('budget').patchValue({
            pricePerUser: this.customCurrencyPipe.transform(+res?.pricePerUser, this.quest?.questType?.wallet?.coin?.unitValue?.currency?.name),
            budget: this.customCurrencyPipe.transform(+res?.budget, this.quest?.questType?.wallet?.coin?.unitValue?.currency?.name),
            remainingBudget: this.customCurrencyPipe.transform(+res?.remainingBudget, this.quest?.questType?.wallet?.coin?.unitValue?.currency?.name),
            remainingCoins: res?.remainingCoins,
          });
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  save() {
    this.campaignService
      .addBudgetToQuest(this.quest.id, this.questForm.get(['budget', 'maxAnswers']).value)
      .pipe(
        catchError((error) => {
          if (error && !this.quest?.remuneration?.length) {
            this.translate.get('MENUITEMS.TS.PLEASE_SET_REMUNERATION').subscribe((remunurationSet: string) => {
              Swal.fire({
                title: 'Oops...',
                text: remunurationSet,
                icon: 'error',
                showCancelButton: false,
                confirmButtonColor: 'rgb(3, 142, 220)',
                cancelButtonColor: 'rgb(243, 78, 78)',
              });
            });
            this.changeDetectorRef.markForCheck();
            return of(null);
          }
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.position();
          this.changeDetectorRef.markForCheck();
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
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
