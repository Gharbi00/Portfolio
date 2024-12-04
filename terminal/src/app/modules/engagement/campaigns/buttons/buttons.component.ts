import Swal from 'sweetalert2';
import { Clipboard } from '@angular/cdk/clipboard';
import { find, forEach, isEqual, map, omit, values } from 'lodash';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subject, catchError, combineLatest, of, take, takeUntil } from 'rxjs';
import { OnDestroy, ChangeDetectorRef, ViewEncapsulation, ChangeDetectionStrategy, Component } from '@angular/core';

import { FormHelper } from '@diktup/frontend/helpers';
import {
  ActivityTypeWithActiveStatusType,
  LandingPageTypeEnum,
  PredefinedType,
  WalletType,
  WalletTypeEnum,
  WidgetIntegrationActionsType,
} from '@sifca-monorepo/terminal-generator';

import { ButtonsService } from './buttons.service';
import { TranslateService } from '@ngx-translate/core';
import { WidgetIntegrationType } from '@sifca-monorepo/terminal-generator';
import { SharedService } from '../../../../../app/shared/services/shared.service';
import { LoyaltyService } from '../../../system/apps/apps/loyalty/loyalty.service';

@Component({
  selector: 'Buttons',
  templateUrl: './buttons.component.html',
  styleUrls: ['./buttons.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonsComponent implements OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  eventChecked: boolean;
  initialValues: any;
  isChecked: boolean;
  selectedType: string;
  widgetForm: FormGroup;
  actionForm: FormGroup;
  isButtonDisabled = true;
  openedModal: NgbModalRef;
  selectedCheckIndex: number;
  activityTypeForm: FormGroup;
  checkedValues: boolean[] = [];
  widget: WidgetIntegrationType;
  isActionButtonDisabled = true;
  initialActivityTypeValues: any;
  wallets = values(WalletTypeEnum);
  pages = values(LandingPageTypeEnum);
  isActivityTypeButtonDisabled = true;
  selectedActivity: WidgetIntegrationActionsType;
  selectedActivityType: ActivityTypeWithActiveStatusType;
  wallet$: Observable<WalletType[]> = this.loyaltyService.wallet$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  predefined$: Observable<PredefinedType[]> = this.buttonsService.predefined$;
  isLastPredefined$: Observable<boolean> = this.buttonsService.isLastPredefined$;
  loadingActivityTypes$: Observable<boolean> = this.buttonsService.loadingActivityTypes$;
  activityTypes$: Observable<ActivityTypeWithActiveStatusType[]> = this.buttonsService.activityTypes$;

  get remuneration(): FormArray {
    return this.actionForm.get('remuneration') as FormArray;
  }
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private clipboard: Clipboard,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private loyaltyService: LoyaltyService,
    private changeDetectorRef: ChangeDetectorRef,
    private buttonsService: ButtonsService,
    private sharedService: SharedService,
  ) {}

  ngOnInit(): void {
    this.loyaltyService.walletPageIndex = 0;
    this.loyaltyService.wallet$ = [];
    this.buttonsService.widget$.pipe(takeUntil(this.unsubscribeAll)).subscribe((widget: WidgetIntegrationType) => {
      this.widget = widget;
      this.selectedType = widget?.icon ? 'icon' : 'picture';
      this.widgetForm = this.formBuilder.group({
        icon: [widget?.icon || ''],
        picture: this.formBuilder.group({
          baseUrl: [widget?.picture?.baseUrl || ''],
          path: [widget?.picture?.path || ''],
        }),
        content: this.formBuilder.group({
          pages: [widget?.content?.pages || []],
        }),
      });
      this.initialValues = this.widgetForm.value;
      this.widgetForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((ivalues) => {
        this.isButtonDisabled = isEqual(ivalues, this.initialValues);
      });
      this.changeDetectorRef.markForCheck();
    });
    this.activityTypes$.pipe(takeUntil(this.unsubscribeAll)).subscribe((activivties) => {
      forEach(activivties, (activity) => {
        this.checkedValues.push(activity.isActive);
      });
    });
  }

  ngAfterViewInit() {
    combineLatest([this.loyaltyService.quantitativeWalletsByOwnerPagination(), this.buttonsService.getPredefinedPaginated()]).subscribe();
  }

  saveAction() {
    this.isActionButtonDisabled = true;
    let remuneration = this.remuneration.value.filter((rem) => rem.amount);
    remuneration = map(this.remuneration.value, (rem) => {
      return {
        ...rem,
        amount: rem?.amount.toString(),
        wallet: rem?.wallet?.id,
      };
    });
    const input: any = {
      ...(remuneration?.length ? { remuneration } : {}),
      ...(this.actionForm.get('recurrence').value.cycle >= 0 && this.actionForm.get('recurrence').value.cycle !== null
        ? {
            recurrence: this.actionForm.get('recurrence').value,
          }
        : {}),
      activity: this.selectedActivityType?.id,
    };
    this.buttonsService
      .activateWidgetIntegrationAction(this.widget?.id, input)
      .pipe(
        catchError(() => {
          this.openedModal.dismiss();
          this.checkedValues[this.selectedCheckIndex] = false;
          this.modalError();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.openedModal.close(res);
          this.position();
          this.changeDetectorRef.markForCheck();
        }
      });
  }
  loadMoreWallets() {
    this.loyaltyService.isLastWallet$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.loyaltyService.walletPageIndex++;
        this.loyaltyService.quantitativeWalletsByOwnerPagination().subscribe();
      }
    });
  }

  loadMorePredefined() {
    this.buttonsService.isLastPredefined$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.buttonsService.predefinedPageIndex++;
        this.buttonsService.getPredefinedPaginated().subscribe();
      }
    });
  }

  saveActivityType() {
    let field: string;
    this.isActivityTypeButtonDisabled = true;
    field = this.selectedActivityType ? 'updateActivityType' : 'createActivityType';
    const input: any = {
      ...FormHelper.getDifference(omit(this.initialActivityTypeValues, 'predefined'), omit(this.activityTypeForm.value, 'predefined')),
      ...(this.initialActivityTypeValues?.predefined?.action === this.activityTypeForm.value?.predefined?.action
        ? {}
        : { predefined: { action: this.activityTypeForm.value.predefined?.action?.id } }),
    };
    const args = this.selectedActivityType ? [this.selectedActivityType.id, input] : [input];
    this.buttonsService[field](...args)
      .pipe(
        catchError(() => {
          this.modalService.dismissAll();
          this.modalError();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.checkedValues.unshift(false);
          this.modalService.dismissAll();
          this.position();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  openActivityTypeModal(content: any, activityType: ActivityTypeWithActiveStatusType) {
    this.selectedActivityType = activityType;
    this.activityTypeForm = this.formBuilder.group({
      title: [activityType?.title || ''],
      code: [activityType?.code || ''],
      description: [activityType?.description || ''],
      predefined: this.formBuilder.group({
        action: [activityType?.predefined?.action || undefined],
      }),
    });
    this.initialActivityTypeValues = this.activityTypeForm.value;
    this.activityTypeForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val) => {
      this.isActivityTypeButtonDisabled = isEqual(this.initialActivityTypeValues, val);
    });
    this.modalService.open(content, { centered: true });
  }

  openActivityModal(event: any, content: any, activity: ActivityTypeWithActiveStatusType, i: number) {
    this.eventChecked = event ? true : false;
    this.isActionButtonDisabled = false;
    this.selectedActivityType = activity;
    this.selectedCheckIndex = i;
    this.selectedActivity = find(this.widget?.actions, (action) => action.definition?.id === activity?.id);
    if (event?.target?.checked || this.eventChecked === false) {
      this.isChecked = true;
      this.actionForm = this.formBuilder.group({
        recurrence: this.formBuilder.group({
          enable: [this.selectedActivity?.recurrence?.enable || false],
          cycle: [this.selectedActivity?.recurrence?.cycle || undefined],
        }),
        remuneration: this.formBuilder.array(
          this.selectedActivity?.remuneration?.length
            ? map(this.selectedActivity?.remuneration, (rem, i) => {
                return this.formBuilder.group({
                  walletType: [rem?.walletType || (i === 0 ? WalletTypeEnum.QUALITATIVE : WalletTypeEnum.QUANTITATIVE)],
                  amount: [rem?.amount || ''],
                  ...(i === 1 ? { wallet: [rem?.wallet] } : {}),
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
                  wallet: [undefined],
                }),
              ],
        ),
      });
      this.openedModal = this.modalService.open(content, { centered: true, backdrop: 'static' });
      if (this.eventChecked === true) {
        this.openedModal.dismissed.subscribe((res) => {
          this.checkedValues[this.selectedCheckIndex] = false;
          this.changeDetectorRef.markForCheck();
        });
      }
    } else if (event?.target?.checked === false) {
      this.isChecked = false;
      this.buttonsService
        .disableWidgetIntegrationAction(this.widget.id, this.selectedActivityType.id)
        .pipe(
          catchError(() => {
            this.modalError();
            return of(null);
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.position();
            this.changeDetectorRef.markForCheck();
          }
        });
    }
  }

  copyText(textToCopy: string) {
    this.clipboard.copy(textToCopy);
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

  ngOnDestroy(): void {
    this.buttonsService.activityTypes$ = null;
    this.loyaltyService.walletPageIndex = 0;
    this.loyaltyService.wallet$ = null;
    this.buttonsService.predefinedPageIndex = 0;
    this.buttonsService.predefined$ = null;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
