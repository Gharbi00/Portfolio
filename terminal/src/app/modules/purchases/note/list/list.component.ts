import { ChangeDetectorRef, Component } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { NotesService } from '../notes.service';
import { GenericInvoicingStatusEnum, PurchaseDeliveryNoteType } from '@sifca-monorepo/terminal-generator';
import { values } from 'lodash';
import { IPagination } from '@diktup/frontend/models';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SaleInvoicesStatsType } from '@sifca-monorepo/terminal-generator';
import { SharedService } from '../../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class NotesListComponent {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  pageChanged: boolean;
  ordersForm: FormGroup;
  filterForm: FormGroup;
  pagination: IPagination;
  selectedStatus: any[] = [];
  breadCrumbItems!: Array<{}>;
  notes: PurchaseDeliveryNoteType[];
  status = values(GenericInvoicingStatusEnum);
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  loadingNotes$: Observable<boolean> = this.notesService.loadingNotes$;
  stats$: Observable<SaleInvoicesStatsType> = this.notesService.stats$;
  notes$: Observable<PurchaseDeliveryNoteType[]> = this.notesService.notes$;
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private notesService: NotesService,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private sharedService: SharedService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.INVOICING').subscribe((invoicing: string) => {
      this.translate.get('MENUITEMS.TS.NOTES_LIST').subscribe((notesList: string) => {
        this.breadCrumbItems = [{ label: invoicing }, { label: notesList, active: true }];
      });
    });
    this.notesService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.notesService.pageIndex || 0,
        size: this.notesService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.notesService.pageIndex || 0) * this.notesService.pageLimit,
        endIndex: Math.min(((this.notesService.pageIndex || 0) + 1) * this.notesService.pageLimit - 1, pagination?.length - 1),
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
    this.notesService.number = e;
    this.notesService.getPurchaseDeliveryNotesByTargetPaginated().subscribe();
  }

  onStatusChange(status: string, isChecked: boolean) {
    if (isChecked) {
      this.notesService.status.push(status);
    } else {
      const index = this.notesService.status.indexOf(status);
      if (index > -1) {
        this.notesService.status.splice(index, 1);
      }
    }
    this.selectedStatus = this.notesService.status;
    this.notesService.getPurchaseDeliveryNotesByTargetPaginated().subscribe();
  }

  onDateChange(event: any) {
    this.notesService.from = event?.selectedDates[0];
    this.notesService.to = event?.selectedDates[1];
    this.notesService.getPurchaseDeliveryNotesByTargetPaginated().subscribe();
  }

  resetDate() {
    this.filterForm.get('date').patchValue('');
    this.notesService.from = null;
    this.notesService.to = null;
    this.notesService.getPurchaseDeliveryNotesByTargetPaginated().subscribe();
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.notesService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.notesService.getPurchaseDeliveryNotesByTargetPaginated().subscribe();
    }
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.notesService.pageIndex = 0;
    this.notesService.searchString = '';
    this.notesService.from = null;
    this.notesService.to = null;
    this.notesService.number = [];
    this.notesService.status = [];
  }
}
