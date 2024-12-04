import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subject, catchError, of, takeUntil } from 'rxjs';
import { map, values, isEqual, transform, isObject, isArray, keys, isDate } from 'lodash';
import { OnInit, Component, OnDestroy, ChangeDetectorRef, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

import { ApiMethods, NotificationIntegrationType, PluginType, ProvidersEnum } from '@sifca-monorepo/terminal-generator';

import { IntegrationAppsService } from '../../apps.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { NotificationIntegrationService } from './notifications-integration.service';

@Component({
  selector: 'notifications-integration',
  templateUrl: './notifications-integration.component.html',
  styleUrls: ['./notifications-integration.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationIntegrationComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  initialValues: any;
  notificationForm: FormGroup;
  methods = values(ApiMethods);
  isNotifButtonDisabled = true;
  providers = values(ProvidersEnum);
  notification: NotificationIntegrationType;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  plugin$: Observable<PluginType> = this.integrationAppsService.plugin$;
  loadingNotifications$: Observable<boolean> = this.notificationService.loadingNotifications$;
  notification$: Observable<NotificationIntegrationType> = this.notificationService.notification$;

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  get webHeaders(): FormArray {
    return this.notificationForm?.get(['web', 'settings', 'api', 'headers']) as FormArray;
  }

  get webParams(): FormArray {
    return this.notificationForm?.get(['web', 'settings', 'api', 'params']) as FormArray;
  }

  get mobileHeaders(): FormArray {
    return this.notificationForm?.get(['mobile', 'settings', 'api', 'headers']) as FormArray;
  }

  get mobileParams(): FormArray {
    return this.notificationForm?.get(['mobile', 'settings', 'api', 'params']) as FormArray;
  }

  get webProvider() {
    return this.notificationForm?.get(['web', 'provider']);
  }

  get mobileProvider() {
    return this.notificationForm?.get(['mobile', 'provider']);
  }

  constructor(
    private location: Location,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private sharedService: SharedService,
    private changeDetectorRef: ChangeDetectorRef,
    private integrationAppsService: IntegrationAppsService,
    private notificationService: NotificationIntegrationService,
  ) {
    this.integrationAppsService.findPluginByURL(this.location.path()).subscribe();
  }

  ngOnInit(): void {
    this.notificationService.notification$.pipe(takeUntil(this.unsubscribeAll)).subscribe((notif) => {
      this.notification = notif;
      this.notificationForm = this.formBuilder.group({
        web: this.formBuilder.group({
          provider: [notif?.web?.provider],
          settings: this.formBuilder.group({
            api: this.formBuilder.group({
              link: [notif?.web?.settings?.api?.link || ''],
              method: [notif?.web?.settings?.api?.method || undefined],
              headers: this.formBuilder.array(
                notif?.web?.settings?.api?.headers?.length
                  ? map(notif?.web?.settings?.api?.headers, (header) => {
                      return this.formBuilder.group({
                        key: [header?.key || ''],
                        value: [header?.value || ''],
                      });
                    })
                  : [
                      this.formBuilder.group({
                        key: [''],
                        value: [''],
                      }),
                    ],
              ),
              params: this.formBuilder.array(
                notif?.web?.settings?.api?.params?.length
                  ? map(notif?.web?.settings?.api?.params, (param) => {
                      return this.formBuilder.group({
                        key: [param?.key || ''],
                        value: [param?.value || ''],
                      });
                    })
                  : [
                      this.formBuilder.group({
                        key: [''],
                        value: [''],
                      }),
                    ],
              ),
              paramsConfig: this.formBuilder.group({
                key: [notif?.web?.settings?.api?.paramsConfig?.key || ''],
                value: [notif?.web?.settings?.api?.paramsConfig?.value || ''],
                title: [notif?.web?.settings?.api?.paramsConfig?.title || ''],
                description: [notif?.web?.settings?.api?.paramsConfig?.description || ''],
                userId: [notif?.web?.settings?.api?.paramsConfig?.userId || ''],
                picture: [notif?.web?.settings?.api?.paramsConfig?.picture || ''],
              }),
            }),
            firebase: this.formBuilder.group({
              clientId: [notif?.web?.settings?.firebase?.clientId || ''],
              projectId: [notif?.web?.settings?.firebase?.projectId || undefined],
              privateKey: [notif?.web?.settings?.firebase?.privateKey || undefined],
              clientEmail: [notif?.web?.settings?.firebase?.clientEmail || undefined],
              privateKeyId: [notif?.web?.settings?.firebase?.privateKeyId || undefined],
              clientX509CertUrl: [notif?.web?.settings?.firebase?.clientX509CertUrl || undefined],
            }),
          }),
          enable: [notif?.web?.enable || false],
        }),
        mobile: this.formBuilder.group({
          provider: [notif?.mobile?.provider],
          enable: [notif?.mobile?.enable || false],
          settings: this.formBuilder.group({
            api: this.formBuilder.group({
              link: [notif?.mobile?.settings?.api?.link || ''],
              method: [notif?.mobile?.settings?.api?.method || undefined],
              headers: this.formBuilder.array(
                notif?.mobile?.settings?.api?.headers?.length
                  ? map(notif?.mobile?.settings?.api?.headers, (header) => {
                      return this.formBuilder.group({
                        key: [header?.key || ''],
                        value: [header?.value || ''],
                      });
                    })
                  : [
                      this.formBuilder.group({
                        key: [''],
                        value: [''],
                      }),
                    ],
              ),
              params: this.formBuilder.array(
                notif?.mobile?.settings?.api?.params?.length
                  ? map(notif?.mobile?.settings?.api?.params, (param) => {
                      return this.formBuilder.group({
                        key: [param?.key || ''],
                        value: [param?.value || ''],
                      });
                    })
                  : [
                      this.formBuilder.group({
                        key: [''],
                        value: [''],
                      }),
                    ],
              ),
              paramsConfig: this.formBuilder.group({
                key: [notif?.mobile?.settings?.api?.paramsConfig?.key || ''],
                value: [notif?.mobile?.settings?.api?.paramsConfig?.value || ''],
                title: [notif?.mobile?.settings?.api?.paramsConfig?.title || ''],
                description: [notif?.mobile?.settings?.api?.paramsConfig?.description || ''],
                userId: [notif?.mobile?.settings?.api?.paramsConfig?.userId || ''],
                picture: [notif?.mobile?.settings?.api?.paramsConfig?.picture || ''],
              }),
            }),
            firebase: this.formBuilder.group({
              clientId: [notif?.mobile?.settings?.firebase?.clientId || ''],
              projectId: [notif?.mobile?.settings?.firebase?.projectId || undefined],
              privateKey: [notif?.mobile?.settings?.firebase?.privateKey || undefined],
              clientEmail: [notif?.mobile?.settings?.firebase?.clientEmail || undefined],
              privateKeyId: [notif?.mobile?.settings?.firebase?.privateKeyId || undefined],
              clientX509CertUrl: [notif?.mobile?.settings?.firebase?.clientX509CertUrl || undefined],
            }),
          }),
        }),
      });
      this.initialValues = this.notificationForm.value;
      this.notificationForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val) => {
        this.isNotifButtonDisabled = isEqual(this.initialValues, val);
      });
      this.changeDetectorRef.markForCheck();
    });
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

  save() {
    this.isNotifButtonDisabled = true;
    const input: any = {
      ...this.getChangedValues(this.notificationForm.value, this.initialValues),
    };
    this.notificationService
      .updateNotificationIntegration(this.notification.id, input)
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

  removeHeaderField(index: number, field: string) {
    if (field === 'web') {
      this.webHeaders.removeAt(index);
    } else {
      this.mobileHeaders.removeAt(index);
    }
  }

  addHeaderField(field: string) {
    if (field === 'web') {
      this.webHeaders.push(
        this.formBuilder.group({
          key: [''],
          value: [''],
        }),
      );
    } else {
      this.mobileHeaders.push(
        this.formBuilder.group({
          key: [''],
          value: [''],
        }),
      );
    }
  }

  removeParamField(index: number, field: string) {
    if (field === 'web') {
      this.webParams.removeAt(index);
    } else {
      this.mobileParams.removeAt(index);
    }
  }

  addParamField(field: string) {
    if (field === 'web') {
      this.webParams.push(
        this.formBuilder.group({
          key: [''],
          value: [''],
        }),
      );
    } else {
      this.mobileParams.push(
        this.formBuilder.group({
          key: [''],
          value: [''],
        }),
      );
    }
  }

  onChange(checked: boolean, field: string, param: string) {
    const input: any = {
      ...(field === 'web' && param === 'enable' ? { web: { enable: checked } } : {}),
      ...(field === 'mobile' && param === 'enable' ? { mobile: { enable: checked } } : {}),
    };
    this.notificationService
      .updateNotificationIntegration(this.notification.id, input)
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
