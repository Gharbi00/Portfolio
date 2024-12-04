import Swal from 'sweetalert2';
import { isEqual, omit } from 'lodash';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subject, catchError, of, throwError } from 'rxjs';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import { FbPixelType, PluginType } from '@sifca-monorepo/terminal-generator';

import { IntegrationAppsService } from '../../../apps.service';
import { SharedService } from '../../../../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'pixel',
  templateUrl: './pixel.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PixelComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  fBPixel: FbPixelType;
  settingsForm: FormGroup;
  isButtonDisabled = true;
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
    private changeDetectorRef: ChangeDetectorRef,
    private integrationAppsService: IntegrationAppsService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.integrationAppsService.fBPixel$.subscribe((res) => {
      this.fBPixel = res;
      this.settingsForm = this.formBuilder.group({
        id: [this.fBPixel.id],
        pixelId: [this.fBPixel?.pixelId || ''],
        active: [this.fBPixel?.active || ''],
      });
      const initialValues = this.settingsForm.value;
      this.settingsForm.valueChanges.subscribe((ivalues) => {
        this.isButtonDisabled = isEqual(ivalues, initialValues);
      });
      this.changeDetectorRef.markForCheck();
    });
  }

  onSettingChange(event: any) {
    this.isButtonDisabled = true;
    const value: any = {
      id: this.fBPixel.id,
      active: event?.target?.checked,
    };
    this.integrationAppsService
      .updateFacebookPixel(value)
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

  onChange(event: any, field: any) {
    this.integrationAppsService
      .updateFacebookPixelEventStatus(field, event, this.fBPixel.id)
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
    const input: any = {
      ...omit(this.settingsForm.value, 'active'),
    };
    this.integrationAppsService
      .updateFacebookPixel(input)
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
