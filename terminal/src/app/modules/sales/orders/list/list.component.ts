import { ChangeDetectorRef, Component } from '@angular/core';
import { Observable, Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { NgbModal, NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { SalesOrdersService } from '../orders.service';
import { GenericInvoicingStatusEnum, SaleOrderType } from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { values } from 'lodash';
import { SaleOrdersStatsType } from '@sifca-monorepo/terminal-generator';
import { SharedService } from '../../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-orders',
  templateUrl: './list.component.html',
})
export class OrdersListComponent {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  pageChanged: boolean;
  filterForm: FormGroup;
  ordersForm!: FormGroup;
  pagination: IPagination;
  selectedStatus: any[] = [];
  breadCrumbItems!: Array<{}>;
  status = values(GenericInvoicingStatusEnum);
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  orders$: Observable<SaleOrderType[]> = this.ordersService.orders$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  loadingOrders$: Observable<boolean> = this.ordersService.loadingOrders$;
  stats$: Observable<SaleOrdersStatsType> = this.ordersService.stats$;
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private ordersService: SalesOrdersService,
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
  ) {
    this.ordersService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.ordersService.pageIndex || 0,
        size: this.ordersService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.ordersService.pageIndex || 0) * this.ordersService.pageLimit,
        endIndex: Math.min(((this.ordersService.pageIndex || 0) + 1) * this.ordersService.pageLimit - 1, pagination.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.changeDetectorRef.markForCheck();
          this.ordersService.searchString = searchValues.searchString;
          return this.ordersService.getSaleOrdersByTargetPaginated();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.INVOICING').subscribe((invoicing: string) => {
      this.translate.get('MENUITEMS.TS.ORDERS').subscribe((orders: string) => {
        this.breadCrumbItems = [{ label: invoicing }, { label: orders, active: true }];
      });
    });
    this.ordersForm = this.formBuilder.group({
      orderId: '#VZ2101',
      ids: [''],
      customer: ['', [Validators.required]],
      product: ['', [Validators.required]],
      orderDate: ['', [Validators.required]],
      amount: ['', [Validators.required]],
      payment: ['', [Validators.required]],
      status: ['', [Validators.required]],
    });
    this.filterForm = this.formBuilder.group({
      date: [''],
    });
    this.sharedService.resetFilter$.pipe(takeUntil(this.unsubscribeAll)).subscribe((reset) => {
      if (reset) {
        this.reset();
      }
    });
  }

  reset() {
    this.filterForm.reset();
  }

  onChangeNumber(e) {
    this.ordersService.number = e;
    this.ordersService.getSaleOrdersByTargetPaginated().subscribe();
  }

  onStatusChange(status: string, isChecked: boolean) {
    if (isChecked) {
      this.ordersService.status.push(status);
    } else {
      const index = this.ordersService.status.indexOf(status);
      if (index > -1) {
        this.ordersService.status.splice(index, 1);
      }
    }
    this.selectedStatus = this.ordersService.status;
    this.ordersService.getSaleOrdersByTargetPaginated().subscribe();
  }

  onDateChange(event: any) {
    this.ordersService.from = event?.selectedDates[0];
    this.ordersService.to = event?.selectedDates[1];
    this.ordersService.getSaleOrdersByTargetPaginated().subscribe();
  }

  resetDate() {
    this.filterForm.get('date').patchValue('');
    this.ordersService.from = null;
    this.ordersService.to = null;
    this.ordersService.getSaleOrdersByTargetPaginated().subscribe();
  }

  onNavChange(changeEvent: NgbNavChangeEvent) {
    // if (changeEvent.nextId === 1) {
    //   this.service.status = '';
    // }
    // if (changeEvent.nextId === 2) {
    //   this.service.status = 'Delivered';
    // }
    // if (changeEvent.nextId === 3) {
    //   this.service.status = 'Pickups';
    // }
    // if (changeEvent.nextId === 4) {
    //   this.service.status = 'Returns';
    // }
    // if (changeEvent.nextId === 5) {
    //   this.service.status = 'Cancelled';
    // }
  }

  openModal(content: any) {
    this.modalService.open(content, { size: 'md', centered: true });
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.ordersService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.ordersService.getSaleOrdersByTargetPaginated().subscribe();
    }
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.ordersService.pageIndex = 0;
    this.ordersService.from = null;
    this.ordersService.to = null;
    this.ordersService.number = [];
    this.ordersService.status = [];
    this.ordersService.searchString = '';
  }
}
