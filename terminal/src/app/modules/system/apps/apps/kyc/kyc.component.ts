import Swal from 'sweetalert2';
import { isEqual, keys, map, values } from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { catchError, Observable, of, Subject, take, takeUntil } from 'rxjs';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { LoyaltySettingsProfileCompleteLevelsType, LoyaltySettingsType, PluginType, ProfileCompleteElementsEnum, WalletType } from '@sifca-monorepo/terminal-generator';

import { IntegrationAppsService } from '../../apps.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { SharedService } from '../../../../../shared/services/shared.service';

@Component({
  selector: 'sifca-monorepo-kyc',
  templateUrl: './kyc.component.html',
  styleUrls: ['./kyc.component.scss'],
})
export class KycComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  initialValues: any;
  loyaltyForm: FormGroup;
  isButtonDisabled = true;
  loyaltySettings: LoyaltySettingsType;
  elements = values(ProfileCompleteElementsEnum);
  wallet$: Observable<WalletType[]> = this.loyaltyService.wallet$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  plugin$: Observable<PluginType> = this.integrationAppsService.plugin$;
  loyaltySettings$: Observable<LoyaltySettingsType> = this.loyaltyService.loyaltySettings$;

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  get profileCompleteLevels(): FormArray {
    return this.loyaltyForm.get(['profileComplete', 'levels']) as FormArray;
  }

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private sharedService: SharedService,
    private loyaltyService: LoyaltyService,
    private changeDetectorRef: ChangeDetectorRef,
    private integrationAppsService: IntegrationAppsService,
  ) {
    this.loyaltyService.quantitativeWalletsByOwnerPagination().subscribe();
  }

  ngOnInit(): void {
    this.loyaltyService.loyaltySettings$.pipe(takeUntil(this.unsubscribeAll)).subscribe((loyaltySettings: LoyaltySettingsType) => {
      this.loyaltySettings = loyaltySettings;
      this.loyaltyForm = this.formBuilder.group({
        profileComplete: this.formBuilder.group({
          enable: [this.loyaltySettings?.profileComplete?.enable || false],
          levels: this.formBuilder.array(
            this.loyaltySettings?.profileComplete?.levels?.length
              ? map(this.loyaltySettings?.profileComplete?.levels, (level) => {
                  return this.formBuilder.group({
                    name: [level?.name],
                    percentage: [level?.percentage || ''],
                    elements: [level?.elements?.length ? level?.elements : []],
                    remuneration: this.formBuilder.group({
                      quantitative: this.formBuilder.group({
                        amount: [level?.remuneration?.quantitative?.amount || ''],
                        wallet: [level?.remuneration?.quantitative?.wallet?.id || undefined],
                      }),
                      qualitative: this.formBuilder.group({
                        amount: [level?.remuneration?.qualitative?.amount || ''],
                      }),
                    }),
                  });
                })
              : [
                  this.formBuilder.group({
                    name: [''],
                    percentage: [''],
                    elements: [[]],
                    remuneration: this.formBuilder.group({
                      quantitative: this.formBuilder.group({
                        amount: [''],
                        wallet: [undefined],
                      }),
                      qualitative: this.formBuilder.group({
                        amount: [''],
                      }),
                    }),
                  }),
                ],
          ),
        }),
      });
      this.initialValues = this.loyaltyForm.value;
      this.loyaltyForm
        .get('profileComplete')
        .valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((ivalues) => {
          this.isButtonDisabled = isEqual(this.initialValues.profileComplete, ivalues);
        });
      this.changeDetectorRef.markForCheck();
    });
  }

  saveProfileComplete() {
    if (!this.isValidtotalPercentage(this.profileCompleteLevels)) {
      this.translate.get('COMMON.PERCENTAGE_100').subscribe((text: string) => {
        this.modalError(text);
      })
      return;
    }
    this.isButtonDisabled = true;
    let input: any = {};
    const levels: any = map(this.profileCompleteLevels.value, (level: LoyaltySettingsProfileCompleteLevelsType) => {
      return {
        ...(level?.name ? { name: level?.name } : {}),
        ...(level?.percentage ? { percentage: level?.percentage.toString() } : {}),
        ...(level.elements?.length ? { elements: level.elements } : {}),
        ...(level?.remuneration?.quantitative?.amount || level?.remuneration?.quantitative?.wallet || level?.remuneration?.qualitative?.amount
          ? {
              remuneration: {
                ...(level?.remuneration?.quantitative?.amount || level?.remuneration?.quantitative?.wallet
                  ? {
                      quantitative: {
                        ...(level?.remuneration?.quantitative?.amount ? { amount: level?.remuneration?.quantitative?.amount } : {}),
                        ...(level?.remuneration?.quantitative?.wallet ? { wallet: level?.remuneration?.quantitative?.wallet } : {}),
                      },
                    }
                  : {}),
                ...(level?.remuneration?.qualitative?.amount
                  ? {
                      qualitative: { amount: level?.remuneration?.qualitative?.amount },
                    }
                  : {}),
              },
            }
          : {}),
      };
    }).filter((level) => Object.keys(level).length > 0);
    input = {
      ...(keys(levels)?.length ? { profileComplete: { levels } } : {}),
    };
    this.updateLoyaltySettings(input);
  }

  onChangeStatus(enable: boolean) {
    this.updateLoyaltySettings({
      profileComplete: { enable },
    });
  }

  isValidtotalPercentage(formArray: FormArray) {
    const totalPercentage = formArray.controls.map((control) => control.get('percentage').value).reduce((acc, value) => acc + Number(value), 0);
    return totalPercentage === 100 ? true : false;
  }

  updateLoyaltySettings(input: any) {
    this.loyaltyService
      .updateLoyaltySettings({...input, id: this.loyaltySettings.id})
      .pipe(
        catchError(() => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.position();
          this.modalService.dismissAll();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  addLevelField(field: FormArray) {
    field.push(
      this.formBuilder.group({
        name: [],
        percentage: [''],
        elements: [[]],
        remuneration: this.formBuilder.group({
          quantitative: this.formBuilder.group({
            amount: [''],
            wallet: [undefined],
          }),
          qualitative: this.formBuilder.group({
            amount: [''],
          }),
        }),
      }),
    );
  }

  removeLevelField(field: FormArray, index: number) {
    field.removeAt(index);
  }

  loadMoreWallets() {
    this.loyaltyService.isLastWallet$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.loyaltyService.walletPageIndex++;
        this.loyaltyService.quantitativeWalletsByOwnerPagination().subscribe();
      }
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

  modalError(text?: string) {
    this.translate.get('MENUITEMS.TS.STH_WENT_WRONG').subscribe((sthWentWrong: string) => {
      Swal.fire({
        title: 'Oops...',
        text: text ? text : sthWentWrong,
        icon: 'warning',
        showCancelButton: false,
        confirmButtonColor: 'rgb(3, 142, 220)',
        cancelButtonColor: 'rgb(243, 78, 78)',
      });
    });
  }

  ngOnDestroy(): void {
    this.loyaltyService.wallet$ = null;
    this.loyaltyService.walletPageIndex = 0;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
