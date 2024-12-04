import { values } from 'lodash';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ChangeDetectorRef, Component } from '@angular/core';

import { GenericInvoicingStatusEnum, SaleDeliveryNoteType } from '@sifca-monorepo/terminal-generator';

import { DeliveryNotesService } from '../delivery-notes.service';
import { IPagination } from '@diktup/frontend/models';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SaleInvoicesStatsType } from '@sifca-monorepo/terminal-generator';
import { SharedService } from '../../../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class DeliveryNotesListComponent {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  pageChanged: boolean;
  filterForm: FormGroup;
  pagination: IPagination;
  selectedStatus: any[] = [];
  breadCrumbItems!: Array<{}>;
  deliveryNotes: SaleDeliveryNoteType[];
  status = values(GenericInvoicingStatusEnum);
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  stats$: Observable<SaleInvoicesStatsType> = this.deliveryNotesService.stats$;
  loadingDelivries$: Observable<boolean> = this.deliveryNotesService.loadingDelivries$;
  deliveryNotes$: Observable<SaleDeliveryNoteType[]> = this.deliveryNotesService.deliveryNotes$;

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private deliveryNotesService: DeliveryNotesService,
    private formBuilder: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef,
    private sharedService: SharedService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.INVOICING').subscribe((invoicing: string) => {
      this.translate.get('MENUITEMS.TS.DELIVERY_NOTES').subscribe((deliveryNotes: string) => {
        this.breadCrumbItems = [{ label: invoicing }, { label: deliveryNotes, active: true }];
      });
    });
    this.deliveryNotesService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.deliveryNotesService.pageIndex || 0,
        size: this.deliveryNotesService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.deliveryNotesService.pageIndex || 0) * this.deliveryNotesService.pageLimit,
        endIndex: Math.min(((this.deliveryNotesService.pageIndex || 0) + 1) * this.deliveryNotesService.pageLimit - 1, pagination?.length - 1),
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
    this.deliveryNotesService.number = e;
    this.deliveryNotesService.getSaleDeliveryNotesByTargetPaginated().subscribe();
  }

  onStatusChange(status: string, isChecked: boolean) {
    if (isChecked) {
      this.deliveryNotesService.status.push(status);
    } else {
      const index = this.deliveryNotesService.status.indexOf(status);
      if (index > -1) {
        this.deliveryNotesService.status.splice(index, 1);
      }
    }
    this.selectedStatus = this.deliveryNotesService.status;
    this.deliveryNotesService.getSaleDeliveryNotesByTargetPaginated().subscribe();
  }

  onDateChange(event: any) {
    this.deliveryNotesService.from = event?.selectedDates[0];
    this.deliveryNotesService.to = event?.selectedDates[1];
    this.deliveryNotesService.getSaleDeliveryNotesByTargetPaginated().subscribe();
  }

  resetDate() {
    this.filterForm.get('date').patchValue('');
    this.deliveryNotesService.from = null;
    this.deliveryNotesService.to = null;
    this.deliveryNotesService.getSaleDeliveryNotesByTargetPaginated().subscribe();
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.deliveryNotesService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.deliveryNotesService.getSaleDeliveryNotesByTargetPaginated().subscribe();
    }
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.deliveryNotesService.pageIndex = 0;
    this.deliveryNotesService.searchString = '';
    this.deliveryNotesService.from = null;
    this.deliveryNotesService.to = null;
    this.deliveryNotesService.number = [];
    this.deliveryNotesService.status = [];
  }
}
