import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { isEqual, keys, omit, values } from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subject, catchError, of, takeUntil } from 'rxjs';
import { OnInit, Component, OnDestroy, ChangeDetectorRef, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

import { FormHelper } from '@diktup/frontend/helpers';
import { LoyaltySettingsType } from '@sifca-monorepo/terminal-generator';
import { PluginType, WidgetIntegrationActionsType } from '@sifca-monorepo/terminal-generator';
import { WalletType, WalletTypeEnum, LandingPageTypeEnum } from '@sifca-monorepo/terminal-generator';
import { EmailIntegrationType } from '@sifca-monorepo/terminal-generator';

import { IntegrationAppsService } from '../../apps.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { EmailIntegrationService } from './email-integration.service';
import { SharedService } from '../../../../../shared/services/shared.service';

@Component({
  selector: 'email-integration',
  templateUrl: './email-integration.component.html',
  styleUrls: ['./email-integration.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailIntegrationComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  initialValues: any;
  isChecked: boolean;
  selectedType: string;
  emailForm: FormGroup;
  widgetForm: FormGroup;
  actionForm: FormGroup;
  isButtonDisabled = true;
  openedModal: NgbModalRef;
  selectedCheckIndex: number;
  email: EmailIntegrationType;
  isEmailButtonDisabled = true;
  checkedValues: boolean[] = [];
  isActionButtonDisabled = true;
  wallets = values(WalletTypeEnum);
  pages = values(LandingPageTypeEnum);
  selectedActivity: WidgetIntegrationActionsType;
  wallet$: Observable<WalletType[]> = this.loyaltyService.wallet$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  plugin$: Observable<PluginType> = this.integrationAppsService.plugin$;
  email$: Observable<EmailIntegrationType> = this.emailIntegrationService.email$;
  loyaltySettings$: Observable<LoyaltySettingsType> = this.loyaltyService.loyaltySettings$;
  loadingActivityTypes$: Observable<boolean> = this.emailIntegrationService.loadingEmailIntegration$;

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
    private location: Location,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private sharedService: SharedService,
    private loyaltyService: LoyaltyService,
    private changeDetectorRef: ChangeDetectorRef,
    private integrationAppsService: IntegrationAppsService,
    private emailIntegrationService: EmailIntegrationService,
  ) {
    this.integrationAppsService.findPluginByURL(this.location.path()).subscribe();
  }

  ngOnInit(): void {
    this.loyaltyService.walletPageIndex = 0;
    this.loyaltyService.wallet$ = [];
    this.emailIntegrationService.email$.pipe(takeUntil(this.unsubscribeAll)).subscribe((email: EmailIntegrationType) => {
      this.email = email;
      this.emailForm = this.formBuilder.group({
        server: this.formBuilder.group({
          secure: [email?.server?.secure || ''],
          port: [email?.server?.port || ''],
          host: [email?.server?.host || ''],
          auth: this.formBuilder.group({
            pass: [email?.server?.auth?.pass || ''],
            user: [email?.server?.auth?.user || ''],
          }),
        }),
      });
      this.initialValues = this.emailForm.value;
      this.emailForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val) => {
        this.isEmailButtonDisabled = isEqual(this.initialValues, val);
      });
      this.changeDetectorRef.markForCheck();
    });
  }

  onChange(checked: boolean) {
    this.emailIntegrationService
      .updateEmailIntegration(this.email.id, { server: { secure: checked } })
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
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  save() {
    this.isEmailButtonDisabled = true;
    const auth = {
      ...FormHelper.getDifference(this.initialValues.server.auth, this.emailForm.get(['server', 'auth']).value),
    };
    const server = {
      ...FormHelper.getDifference(omit(this.initialValues.server, 'auth'), omit(this.emailForm.get('server').value, 'auth')),
      ...(keys(auth)?.length ? { auth } : {}),
    };
    const input: any = {
      ...FormHelper.getDifference(omit(this.initialValues, 'server'), omit(this.emailForm.value, 'server')),
      ...(keys(server)?.length ? { server } : {}),
    };
    this.emailIntegrationService
      .updateEmailIntegration(this.email.id, input)
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
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  openEmailModal(content: any) {
    this.modalService.open(content, { centered: true });
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
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
