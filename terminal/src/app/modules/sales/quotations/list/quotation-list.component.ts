import { values } from 'lodash';
import { Observable, Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FlatpickrDirective } from 'angularx-flatpickr';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';

import { IPagination } from '@diktup/frontend/models';
import { QuotationsStatsType } from '@sifca-monorepo/terminal-generator';
import { GenericInvoicingStatusEnum, QuotationType } from '@sifca-monorepo/terminal-generator';

import { QuotationsService } from '../quotations.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-list',
  templateUrl: './quotation-list.component.html',
  styleUrls: ['./quotation-list.component.scss'],
})
export class QuotationsListComponent {
  @ViewChild(FlatpickrDirective) flatpickrDirective: FlatpickrDirective;
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  pageChanged: boolean;
  filterForm: FormGroup;
  pagination: IPagination;
  selectedStatus: any[] = [];
  breadCrumbItems!: Array<{}>;
  status = values(GenericInvoicingStatusEnum);
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  stats$: Observable<QuotationsStatsType> = this.quotationsService.stats$;
  quotations$: Observable<QuotationType[]> = this.quotationsService.quotations$;
  loadingQuotations$: Observable<boolean> = this.quotationsService.loadingQuotations$;
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }
  constructor(
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private quotationsService: QuotationsService,
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
  ) {
    this.quotationsService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.quotationsService.pageIndex || 0,
        size: this.quotationsService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.quotationsService.pageIndex || 0) * this.quotationsService.pageLimit,
        endIndex: Math.min(((this.quotationsService.pageIndex || 0) + 1) * this.quotationsService.pageLimit - 1, pagination.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.INVOICING').subscribe((invoicing: string) => {
      this.translate.get('MENUITEMS.TS.QUOTATIONS').subscribe((quotations: string) => {
        this.breadCrumbItems = [{ label: invoicing }, { label: quotations, active: true }];
      });
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
    this.quotationsService.number = e;
    this.quotationsService.getQuotationsByTargetPaginated().subscribe();
  }

  onStatusChange(status: string, isChecked: boolean) {
    if (isChecked) {
      this.quotationsService.status.push(status);
    } else {
      const index = this.quotationsService.status.indexOf(status);
      if (index > -1) {
        this.quotationsService.status.splice(index, 1);
      }
    }
    this.selectedStatus = this.quotationsService.status;
    this.quotationsService.getQuotationsByTargetPaginated().subscribe();
  }

  onDateChange(event: any) {
    this.quotationsService.from = event?.selectedDates[0];
    this.quotationsService.to = event?.selectedDates[1];
    this.quotationsService.getQuotationsByTargetPaginated().subscribe();
  }

  resetDate() {
    this.filterForm.get('date').patchValue('');
    this.quotationsService.from = null;
    this.quotationsService.to = null;
    this.quotationsService.getQuotationsByTargetPaginated().subscribe();
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.quotationsService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.quotationsService.getQuotationsByTargetPaginated().subscribe();
    }
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.quotationsService.from = null;
    this.quotationsService.to = null;
    this.quotationsService.number = [];
    this.quotationsService.status = [];
    this.quotationsService.pageIndex = 0;
    this.quotationsService.searchString = '';
  }
}
