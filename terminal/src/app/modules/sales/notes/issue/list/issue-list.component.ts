import { Observable, Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ChangeDetectorRef, Component } from '@angular/core';

import { IPagination } from '@diktup/frontend/models';

import { IssueNotesService } from '../issue-notes.service';
import { GenericInvoicingStatusEnum, SaleIssueNoteStatsType, SaleIssueNoteType } from '@sifca-monorepo/terminal-generator';
import { values } from 'lodash';
import { SharedService } from '../../../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-list',
  templateUrl: './issue-list.component.html',
  styleUrls: ['./issue-list.component.scss'],
})
export class IssueNotesListComponent {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  pageChanged: boolean;
  filterForm: FormGroup;
  pagination: IPagination;
  selectedStatus: any[] = [];
  breadCrumbItems!: Array<{}>;
  status = values(GenericInvoicingStatusEnum);
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  loadingIssues$: Observable<boolean> = this.issueNotesService.loadingIssues$;
  stats$: Observable<SaleIssueNoteStatsType> = this.issueNotesService.stats$;
  issueNotes$: Observable<SaleIssueNoteType[]> = this.issueNotesService.issueNotes$;

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private issueNotesService: IssueNotesService,
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.INVOICING').subscribe((invoicing: string) => {
      this.translate.get('MENUITEMS.TS.INVOICE_LIST').subscribe((invoiceList: string) => {
        this.breadCrumbItems = [{ label: invoicing }, { label: invoiceList, active: true }];
      });
    });
    this.issueNotesService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.issueNotesService.pageIndex || 0,
        size: this.issueNotesService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.issueNotesService.pageIndex || 0) * this.issueNotesService.pageLimit,
        endIndex: Math.min(((this.issueNotesService.pageIndex || 0) + 1) * this.issueNotesService.pageLimit - 1, pagination?.length - 1),
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
    this.issueNotesService.number = e;
    this.issueNotesService.getSaleIssueNotesByTargetPaginated().subscribe();
  }

  onStatusChange(status: string, isChecked: boolean) {
    if (isChecked) {
      this.issueNotesService.status.push(status);
    } else {
      const index = this.issueNotesService.status.indexOf(status);
      if (index > -1) {
        this.issueNotesService.status.splice(index, 1);
      }
    }
    this.selectedStatus = this.issueNotesService.status;
    this.issueNotesService.getSaleIssueNotesByTargetPaginated().subscribe();
  }

  onDateChange(event: any) {
    this.issueNotesService.from = event?.selectedDates[0];
    this.issueNotesService.to = event?.selectedDates[1];
    this.issueNotesService.getSaleIssueNotesByTargetPaginated().subscribe();
  }

  resetDate() {
    this.filterForm.get('date').patchValue('');
    this.issueNotesService.from = null;
    this.issueNotesService.to = null;
    this.issueNotesService.getSaleIssueNotesByTargetPaginated().subscribe();
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.issueNotesService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.issueNotesService.getSaleIssueNotesByTargetPaginated().subscribe();
    }
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.issueNotesService.pageIndex = 0;
    this.issueNotesService.searchString = '';
    this.issueNotesService.from = null;
    this.issueNotesService.to = null;
    this.issueNotesService.number = [];
    this.issueNotesService.status = [];
  }
}
