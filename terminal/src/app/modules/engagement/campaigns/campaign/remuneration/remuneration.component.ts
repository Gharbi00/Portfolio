import Swal from 'sweetalert2';
import { isEqual, map } from 'lodash';
import { Options } from '@angular-slider/ngx-slider';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subject, catchError, of, takeUntil } from 'rxjs';

import { CurrencyType, LoyaltySettingsType } from '@sifca-monorepo/terminal-generator';

import { CampaignsService } from '../campaigns.service';
import { LoyaltyService } from '../../../../system/apps/apps/loyalty/loyalty.service';
import { QuestWithProgressType, WalletTypeEnum } from '@sifca-monorepo/terminal-generator';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-remuneration',
  templateUrl: './remuneration.component.html',
  styleUrls: ['./remuneration.component.scss'],
})
export class RemunerationComponent {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  initialValues: any;
  selectionValue = 1;
  questForm: FormGroup;
  isButtonDisabled = true;
  quantitativeSelection = 4;
  currencies: CurrencyType[];
  quest: QuestWithProgressType;
  qualitativeBarOptions: Options;
  quantitativeBarOptions: Options;
  loyaltySettings$: Observable<LoyaltySettingsType> = this.loyaltyService.loyaltySettings$;

  get remuneration(): FormArray {
    return this.questForm.get('remuneration') as FormArray;
  }

  get winners(): FormArray {
    return this.questForm.get('winners') as FormArray;
  }

  get checkpoints(): FormArray {
    return this.questForm.get('checkpoints') as FormArray;
  }

  constructor(
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private loyaltyService: LoyaltyService,
    private campaignService: CampaignsService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.loyaltyService.findLoyaltySettingsByTarget().subscribe();
  }

  ngOnInit() {
    this.campaignService.quest$.pipe(takeUntil(this.unsubscribeAll)).subscribe((quest) => {
      this.quest = quest;
      this.quantitativeBarOptions = {
        floor: +quest?.questType?.quantitative?.min || 1,
        ceil: +quest?.questType?.quantitative?.max || 100,
        logScale: true,
        showTicks: true,
      };
      this.qualitativeBarOptions = {
        floor: +quest?.questType?.qualitative?.min || 1,
        ceil: +quest?.questType?.qualitative?.max || 100,
        logScale: true,
        showTicks: true,
      };
      this.questForm = this.formBuilder.group({
        remuneration: this.formBuilder.array(
          this.quest?.remuneration?.length
            ? map(this.quest?.remuneration, (rem, i) => {
                return this.formBuilder.group({
                  walletType: [
                    rem?.walletType || (rem?.walletType === WalletTypeEnum.QUALITATIVE ? WalletTypeEnum.QUALITATIVE : WalletTypeEnum.QUANTITATIVE),
                  ],
                  amount: [+rem?.amount || ''],
                  ...(rem?.walletType === WalletTypeEnum.QUANTITATIVE ? { wallet: [this.quest?.questType?.wallet?.id] } : {}),
                });
              })
            : [
                this.formBuilder.group({
                  walletType: [WalletTypeEnum.QUALITATIVE],
                  amount: [''],
                }),
                this.formBuilder.group({
                  walletType: [WalletTypeEnum.QUANTITATIVE],
                  amount: [''],
                  wallet: [this.quest?.questType?.wallet?.id],
                }),
              ],
        ),
      });
      this.initialValues = this.questForm.value;
      console.log("🚀 ~ RemunerationComponent ~ this.campaignService.quest$.pipe ~ this.initialValues:", this.initialValues)
      this.questForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
        console.log('🚀 ~ RemunerationComponent ~ this.questForm.valueChanges.subscribe ~ values:', values);
        this.isButtonDisabled = isEqual(this.initialValues, values);
      });
      this.changeDetectorRef.markForCheck();
    });
  }

  save() {
    let remuneration = this.remuneration.value.filter((rem) => rem.amount);
    remuneration = map(this.remuneration.value, (rem) => {
      return {
        ...rem,
        amount: rem?.amount.toString(),
        wallet: rem?.wallet,
      };
    }).filter((rem) => rem?.amount);
    this.isButtonDisabled = true;
    const input: any = {
      ...(remuneration?.length ? { remuneration } : {}),
    };
    this.campaignService
      .updateQuest(this.quest?.id, input)
      .pipe(
        catchError(() => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res: any) => {
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
