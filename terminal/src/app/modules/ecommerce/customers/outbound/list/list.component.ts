import Swal from 'sweetalert2';
import { catchError, takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject, combineLatest, of, map as rxMap } from 'rxjs';
import { Component, ChangeDetectorRef, ViewEncapsulation, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';

import { IPagination } from '@diktup/frontend/models';
import { OutboundType } from '@sifca-monorepo/terminal-generator';

import { OutboundService } from '../outbound.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'coupons-list',
  templateUrl: './list.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OutboundListComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  pageChanged: boolean;
  pagination: IPagination;
  breadCrumbItems!: Array<{}>;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  oubounds$: Observable<OutboundType[]> = this.outboundService.outbounds$;
  loadingOutbound$: Observable<boolean> = this.outboundService.loadingOutbounds$;
  selectedOutbound: OutboundType;

  constructor(
    private modalService: NgbModal,
    private translate: TranslateService,
    private sharedService: SharedService,
    private outboundService: OutboundService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  ngOnInit(): void {
    combineLatest([this.translate.get('MENUITEMS.TS.ECOMMERCE'), this.translate.get('MENUITEMS.TS.NEWSLETTER')])
      .pipe(
        rxMap(([ecommerce, newsletter]: [string, string]) => {
          this.breadCrumbItems = [{ label: ecommerce }, { label: newsletter, active: true }];
        }),
      )
      .subscribe();
    this.outboundService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.outboundService.pageIndex || 0,
        size: this.outboundService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.outboundService.pageIndex || 0) * this.outboundService.pageLimit,
        endIndex: Math.min(((this.outboundService.pageIndex || 0) + 1) * this.outboundService.pageLimit - 1, pagination?.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
  }

  openDeleteModal(content: any, outbound: OutboundType) {
    this.selectedOutbound = outbound;
    this.modalService.open(content, { centered: true });
  }

  deleteOutbound() {
    this.outboundService.deleteOutbound(this.selectedOutbound.id)
      .pipe(
        catchError(() => {
          this.modalService.dismissAll();
          this.modalError();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.position();
          this.modalService.dismissAll();
          this.changeDetectorRef.markForCheck();
        }
      })
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

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.outboundService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.outboundService.getOutboundsByTargetPagination().subscribe();
    }
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.outboundService.pageIndex = 0;
  }
}
