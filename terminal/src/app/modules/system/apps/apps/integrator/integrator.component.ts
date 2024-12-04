import { Observable, Subject, catchError, throwError } from 'rxjs';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ErpElementsEnum, ErpIntegrationType, PluginType } from '@sifca-monorepo/terminal-generator';
import { IntegrationAppsService } from '../../apps.service';
import { map } from 'lodash';
import Swal from 'sweetalert2';
import { SharedService } from '../../../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'integrator',
  templateUrl: './integrator.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntegratorComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  eventsForm: FormGroup;
  plugins: PluginType[];
  erpIntegration: ErpIntegrationType;
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
  ) {}

  ngOnInit(): void {
    this.integrationAppsService.erpIntegration$.subscribe((erpIntegration: ErpIntegrationType) => {
      this.erpIntegration = erpIntegration;
      this.eventsForm = this.formBuilder.group({
        events: this.formBuilder.array(
          this.erpIntegration.events?.length
            ? map(this.erpIntegration.events, (ev) => {
                return this.formBuilder.group({
                  event: [ev?.event],
                  status: [ev?.active],
                });
              })
            : [],
        ),
      });
      this.changeDetectorRef.markForCheck();
    });
  }

  onChange(event: any, field: ErpElementsEnum) {
    this.integrationAppsService
      .updateErpIntegrationEventStatus(field, event, this.erpIntegration.id)
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
    const value: any = {
      id: this.erpIntegration.id,
      active: event?.target?.checked,
    };
    this.integrationAppsService
      .updateErpIntegration(value)
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
