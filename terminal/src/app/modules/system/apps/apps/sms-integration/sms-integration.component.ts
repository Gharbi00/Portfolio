import Swal from 'sweetalert2';
import { isEqual, keys, values } from 'lodash';
import { Location } from '@angular/common';
import { Observable, Subject, catchError, of, takeUntil } from 'rxjs';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import { PluginType } from '@sifca-monorepo/terminal-generator';
import { SmsGatewayEnum, SmsIntegrationType } from '@sifca-monorepo/terminal-generator';

import { IntegrationAppsService } from '../../apps.service';
import { SmsIntegrationService } from './sms-integration.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormHelper } from '@diktup/frontend/helpers';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sms-integration',
  templateUrl: './sms-integration.component.html',
  styleUrls: ['./sms-integration.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SmsIntegrationComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  initialValues: any;
  isButtonDisabled = true;
  integrationForm: FormGroup;
  integration: SmsIntegrationType;
  gateways = values(SmsGatewayEnum);
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  plugin$: Observable<PluginType> = this.integrationAppsService.plugin$;
  integration$: Observable<SmsIntegrationType> = this.integrationService.smsIntegration$;
  loadingIntegration$: Observable<boolean> = this.integrationService.loadingSmsIntegration$;

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private location: Location,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private sharedService: SharedService,
    private changeDetectorRef: ChangeDetectorRef,
    private integrationService: SmsIntegrationService,
    private integrationAppsService: IntegrationAppsService,
  ) {}

  ngOnInit(): void {
    this.integrationAppsService.findPluginByURL(this.location.path()).subscribe();
    this.integrationService.smsIntegration$.pipe(takeUntil(this.unsubscribeAll)).subscribe((integration) => {
      this.integration = integration;
      this.integrationForm = this.formBuilder.group({
        gateway: [integration?.gateway || undefined],
        access: this.formBuilder.group({
          sender: [integration?.access?.sender || ''],
          key: [integration?.access?.key || ''],
        }),
      });
      this.initialValues = this.integrationForm.value;
      this.integrationForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val) => {
        this.isButtonDisabled = isEqual(val, this.initialValues);
      });
    });
    this.sharedService.navigating$ = false;
  }

  save() {
    this.isButtonDisabled = true;
    const access: any = {
      ...FormHelper.getDifference(this.initialValues?.access, this.integrationForm.get('access').value),
    };
    const input: any = {
      ...(this.initialValues.gateway === this.integrationForm.get('gateway').value ? {} : { gateway: this.integrationForm.get('gateway').value }),
      ...(keys(access)?.length ? { access } : {}),
    };
    this.integrationService
      .updateSmsIntegration(this.integration?.id, input)
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

  ngOnDestroy(): void {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
