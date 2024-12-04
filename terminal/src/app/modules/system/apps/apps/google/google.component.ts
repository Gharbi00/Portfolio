import { Observable, Subject, catchError, takeUntil, throwError } from 'rxjs';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GaRecommendedEventsEnum, GoogleAnalyticsType, PluginType } from '@sifca-monorepo/terminal-generator';
import { IntegrationAppsService } from '../../apps.service';
import { isEqual, map } from 'lodash';
import Swal from 'sweetalert2';
import { SharedService } from '../../../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'google',
  templateUrl: './google.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoogleComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  eventsForm: FormGroup;
  plugins: PluginType[];
  settingsForm: FormGroup;
  isButtonDisabled = true;
  notificationsForm: FormGroup;
  googleAnalytics: GoogleAnalyticsType;
  plugin$: Observable<PluginType> = this.integrationAppsService.plugin$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private integrationAppsService: IntegrationAppsService,
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
  ) {
    this.integrationAppsService.plugins$.pipe(takeUntil(this.unsubscribeAll)).subscribe((plugins: PluginType[]) => {
      this.plugins = plugins;
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    this.integrationAppsService.googleAnalytics$.subscribe((googleAnalytics: GoogleAnalyticsType) => {
      this.googleAnalytics = googleAnalytics;
      this.eventsForm = this.formBuilder.group({
        events: this.formBuilder.array(
          this.googleAnalytics.events?.length
            ? map(this.googleAnalytics.events, (ev) => {
                return this.formBuilder.group({
                  event: [ev?.event],
                  status: [ev?.active],
                });
              })
            : [],
        ),
      });
      this.settingsForm = this.formBuilder.group({
        id: [this.googleAnalytics.id],
        googleTagId: [this.googleAnalytics?.googleTagId || ''],
      });
      const initialValues = this.settingsForm.value;
      this.settingsForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((ivalues) => {
        this.isButtonDisabled = isEqual(ivalues, initialValues);
      });
      this.changeDetectorRef.markForCheck();
    });
  }

  onChange(event: any, field: GaRecommendedEventsEnum) {
    this.integrationAppsService
      .updateGoogleAnalyticsEventStatus(field, event, this.googleAnalytics.id)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.position();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  onSettingsChange(event: any) {
    this.isButtonDisabled = true;
    const value: any = {
      id: this.googleAnalytics.id,
      active: event?.target?.checked,
      googleTagId: this.googleAnalytics?.googleTagId ? this.googleAnalytics?.googleTagId : '',
    };
    this.integrationAppsService
      .updateGoogleAnalytics(value)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.position();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  save(): void {
    this.isButtonDisabled = true;
    this.integrationAppsService
      .updateGoogleAnalytics(this.settingsForm.value)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.position();
          this.changeDetectorRef.markForCheck();
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
