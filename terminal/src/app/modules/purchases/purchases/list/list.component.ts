import { ChangeDetectorRef, Component } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PurchasesService } from '../purchases.service';
import { GenericInvoicingStatusEnum, PurchaseOrderType, SaleInvoicesStatsType } from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { values } from 'lodash';
import { SharedService } from '../../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-orders',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class PurchasesListComponent {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  pageChanged: boolean;
  filterForm: FormGroup;
  pagination: IPagination;
  selectedStatus: any[] = [];
  breadCrumbItems!: Array<{}>;
  status = values(GenericInvoicingStatusEnum);
  stats$: Observable<SaleInvoicesStatsType> = this.purchasesService.stats$;
  loadingPurchases$: Observable<boolean> = this.purchasesService.loadingPurchases$;
  purchases$: Observable<PurchaseOrderType[]> = this.purchasesService.purchases$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private modalService: NgbModal,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private purchasesService: PurchasesService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.INVOICING').subscribe((invoicing: string) => {
      this.translate.get('MENUITEMS.TS.PURCHASE').subscribe((purchase: string) => {
        this.breadCrumbItems = [{ label: invoicing }, { label: purchase, active: true }];
      });
    });
    this.purchasesService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.purchasesService.pageIndex || 0,
        size: this.purchasesService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.purchasesService.pageIndex || 0) * this.purchasesService.pageLimit,
        endIndex: Math.min(((this.purchasesService.pageIndex || 0) + 1) * this.purchasesService.pageLimit - 1, pagination?.length - 1),
      };
      this.changeDetectorRef.markForCheck();
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

  openModal(content: any) {
    this.modalService.open(content, { size: 'md', centered: true });
  }

  onChangeNumber(e) {
    this.purchasesService.number = e;
    this.purchasesService.getPurchaseOrdersByTargetPaginated().subscribe();
  }

  onStatusChange(status: string, isChecked: boolean) {
    if (isChecked) {
      this.purchasesService.status.push(status);
    } else {
      const index = this.purchasesService.status.indexOf(status);
      if (index > -1) {
        this.purchasesService.status.splice(index, 1);
      }
    }
    this.selectedStatus = this.purchasesService.status;
    this.purchasesService.getPurchaseOrdersByTargetPaginated().subscribe();
  }

  onDateChange(event: any) {
    this.purchasesService.from = event?.selectedDates[0];
    this.purchasesService.to = event?.selectedDates[1];
    this.purchasesService.getPurchaseOrdersByTargetPaginated().subscribe();
  }

  resetDate() {
    this.filterForm.get('date').patchValue('');
    this.purchasesService.from = null;
    this.purchasesService.to = null;
    this.purchasesService.getPurchaseOrdersByTargetPaginated().subscribe();
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.purchasesService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.purchasesService.getPurchaseOrdersByTargetPaginated().subscribe();
    }
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.purchasesService.pageIndex = 0;
    this.purchasesService.searchString = '';
    this.purchasesService.from = null;
    this.purchasesService.to = null;
    this.purchasesService.number = [];
    this.purchasesService.status = [];
  }
}
