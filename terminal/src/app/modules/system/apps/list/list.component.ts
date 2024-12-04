import { find } from 'lodash';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, catchError, of, switchMap, take, takeUntil, throwError } from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import { PluginType } from '@sifca-monorepo/terminal-generator';

import { IntegrationAppsService } from '../apps.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-apps-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class AppsListComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  pageChanged: boolean;
  pagination: IPagination;
  selectedPlugin: PluginType;
  breadCrumbItems!: Array<{}>;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  plugins$: Observable<PluginType[]> = this.integrationAppsService.plugins$;
  loadingPlugins$: Observable<boolean> = this.integrationAppsService.loadingPlugins$;
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private translate: TranslateService,
    private sharedService: SharedService,
    private changeDetectorRef: ChangeDetectorRef,
    private integrationAppsService: IntegrationAppsService,
  ) {}

  ngOnInit(): void {
    this.integrationAppsService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.integrationAppsService.pageIndex || 0,
        size: this.integrationAppsService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.integrationAppsService.pageIndex || 0) * this.integrationAppsService.pageLimit,
        endIndex: Math.min(((this.integrationAppsService.pageIndex || 0) + 1) * this.integrationAppsService.pageLimit - 1, pagination?.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
    this.translate.get('MENUITEMS.TS.SYSTEM').subscribe((system: string) => {
      this.translate.get('MENUITEMS.TS.APPS').subscribe((apps: string) => {
        this.breadCrumbItems = [{ label: system }, { label: apps, active: true }];
      });
    });
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.integrationAppsService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.integrationAppsService.findPluginsWithAddedStatus().subscribe();
    }
  }

  addPlugin(plugin: any) {
    this.integrationAppsService
      .createTargetPlugin(plugin?.id)
      .pipe
      // switchMap(() => {
      //   return this.integrationAppsService.findPluginsWithAddedStatus();
      // }),
      ()
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  openDeleteTargetPlugin(content: any, plugin: PluginType) {
    this.selectedPlugin = plugin;
    this.modalService.open(content, { size: 'md', centered: true });
  }

  onRoute(url: string) {
    this.router.navigateByUrl(url);
  }

  deleteTargetPlugin() {
    this.integrationAppsService?.apps$
      .pipe(
        take(1),
        switchMap((apps) => {
          const app = find(apps, (targetPlugin) => targetPlugin?.plugin?.id === this.selectedPlugin?.id);
          if (!app) {
            this.modalService.dismissAll();
            this.modalError();
            this.changeDetectorRef.markForCheck();
            throwError(() => new Error('Target plugin not found'));
            return of(null);
          } else {
            return this.integrationAppsService.deleteTargetPlugin(app.id, this.selectedPlugin?.id);
          }
        }),
        catchError((error) => {
          this.modalService.dismissAll();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
        // switchMap(() => {
        //   return this.integrationAppsService.findPluginsWithAddedStatus();
        // }),
      )
      .subscribe(() => {
        this.modalService.dismissAll();
        this.position();
        this.changeDetectorRef.markForCheck();
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
    this.integrationAppsService.pageIndex = 0;
  }
}
