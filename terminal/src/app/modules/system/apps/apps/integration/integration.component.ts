// integration

import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { Clipboard } from '@angular/cdk/clipboard';
import { Observable, Subject, catchError, of, take, switchMap } from 'rxjs';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import { PluginType } from '@sifca-monorepo/terminal-generator';
import { IntegrationIntegrationType } from '@sifca-monorepo/terminal-generator';

import { IntegrationService } from './integration.service';
import { IntegrationAppsService } from '../../apps.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'integration',
  templateUrl: './integration.component.html',
  styleUrls: ['./integration.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntegrationComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  navigating$: Observable<boolean> = this.sharedService.navigating$;
  plugin$: Observable<PluginType> = this.integrationAppsService.plugin$;
  loadingIntegration$: Observable<boolean> = this.integrationService.loadingIntegration$;
  integration$: Observable<IntegrationIntegrationType> = this.integrationService.integration$;
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }
  constructor(
    private location: Location,
    private clipboard: Clipboard,
    private sharedService: SharedService,
    private translate: TranslateService,
    private changeDetectorRef: ChangeDetectorRef,
    private integrationService: IntegrationService,
    private integrationAppsService: IntegrationAppsService,
  ) {}

  ngOnInit(): void {
    this.integrationAppsService.findPluginByURL(this.location.path()).subscribe();
    this.sharedService.navigating$ = false;
  }

  copyText(textToCopy: string) {
    this.clipboard.copy(textToCopy);
  }

  onChangeIntegration(event: any, field: string) {
    const input: any = {
      endpoints: {
        ...(field === 'sales' ? { sales: event } : {}),
        ...(field === 'purchase' ? { purchase: event } : {}),
        ...(field === 'loyalty'
          ? {
              loyalty: {
                onsiteconverter: event,
              },
            }
          : {}),
      },
    };
    this.integrationService.integration$
      .pipe(
        take(1),
        switchMap((integration) => {
          return this.integrationService.updateIntegrationIntegration(integration?.id, input);
        }),
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

  createAccessApi() {
    this.translate.get('MENUITEMS.TS.CREATE_ACCESS_API').subscribe((createAccessApi: string) => {
      Swal.fire({
        title: createAccessApi,
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: 'rgb(3, 142, 220)',
        cancelButtonColor: 'rgb(243, 78, 78)',
      }).then((result) => {
        if (result?.isConfirmed) {
          this.integrationService.integration$
            .pipe(
              take(1),
              switchMap((integration) => {
                return this.integrationService.addAccessApiToTarget(integration.id);
              }),
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
