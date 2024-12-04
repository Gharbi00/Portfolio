import { ChangeDetectorRef, Component } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { PurchaseInvoicesService } from '../invoices.service';
import { GenericInvoicingStatusEnum, PurchaseInvoiceType } from '@sifca-monorepo/terminal-generator';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IPagination } from '@diktup/frontend/models';
import { values } from 'lodash';
import { SaleInvoicesStatsType } from '@sifca-monorepo/terminal-generator';
import { SharedService } from '../../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class PurchaseInvoicesListComponent {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  pageChanged: boolean;
  filterForm: FormGroup;
  pagination: IPagination;
  selectedStatus: any[] = [];
  breadCrumbItems!: Array<{}>;
  status = values(GenericInvoicingStatusEnum);
  loadingInvoices$: Observable<boolean> = this.invoicesService.loadingInvoices$;
  invoices$: Observable<PurchaseInvoiceType[]> = this.invoicesService.invoices$;
  stats$: Observable<SaleInvoicesStatsType> = this.invoicesService.stats$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private sharedService: SharedService,
    private invoicesService: PurchaseInvoicesService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.INVOICING').subscribe((invoicing: string) => {
      this.translate.get('MENUITEMS.TS.INVOICES').subscribe((invoices: string) => {
        this.breadCrumbItems = [{ label: invoicing }, { label: invoices, active: true }];
      });
    });

    this.invoicesService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.invoicesService.pageIndex || 0,
        size: this.invoicesService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.invoicesService.pageIndex || 0) * this.invoicesService.pageLimit,
        endIndex: Math.min(((this.invoicesService.pageIndex || 0) + 1) * this.invoicesService.pageLimit - 1, pagination?.length - 1),
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

  onChangeNumber(e) {
    this.invoicesService.number = e;
    this.invoicesService.getPurchaseInvoicesByTargetPaginated().subscribe();
  }

  onStatusChange(status: string, isChecked: boolean) {
    if (isChecked) {
      this.invoicesService.status.push(status);
    } else {
      const index = this.invoicesService.status.indexOf(status);
      if (index > -1) {
        this.invoicesService.status.splice(index, 1);
      }
    }
    this.selectedStatus = this.invoicesService.status;
    this.invoicesService.getPurchaseInvoicesByTargetPaginated().subscribe();
  }

  onDateChange(event: any) {
    this.invoicesService.from = event?.selectedDates[0];
    this.invoicesService.to = event?.selectedDates[1];
    this.invoicesService.getPurchaseInvoicesByTargetPaginated().subscribe();
  }

  resetDate() {
    this.filterForm.get('date').patchValue('');
    this.invoicesService.from = null;
    this.invoicesService.to = null;
    this.invoicesService.getPurchaseInvoicesByTargetPaginated().subscribe();
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.invoicesService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.invoicesService.getPurchaseInvoicesByTargetPaginated().subscribe();
    }
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.invoicesService.pageIndex = 0;
    this.invoicesService.searchString = '';
    this.invoicesService.from = null;
    this.invoicesService.to = null;
    this.invoicesService.number = [];
    this.invoicesService.status = [];
  }
}
