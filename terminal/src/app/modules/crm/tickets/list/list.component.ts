import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { find, isEqual, map, some, values } from 'lodash';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChangeDetectorRef, Component, Inject, OnDestroy, PLATFORM_ID, QueryList, ViewChildren } from '@angular/core';
import { take, Subject, takeUntil, switchMap, Observable, catchError, throwError, map as rxMap, debounceTime, distinctUntilChanged } from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import { ConvertorHelper, FormHelper } from '@diktup/frontend/helpers';
import { TicketStatsType } from '@sifca-monorepo/terminal-generator';
import { UserType, TicketType, AccountType, CompanyType, TicketStatusEnum, TicketPriorityEnum } from '@sifca-monorepo/terminal-generator';

import { TicketsService } from '../tickets.service';
import { TeamService } from '../../../system/team/team.service';
import { NgbdListSortableHeader } from './list-sortable.directive';
import { UserService } from '../../../../core/services/user.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { CompaniesService } from '../../customers/companies/companies.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class TicketsListComponent implements OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  @ViewChildren(NgbdListSortableHeader) headers!: QueryList<NgbdListSortableHeader>;

  page = 0;
  initValues: any;
  leads: CompanyType[];
  pageChanged: boolean;
  filterForm: FormGroup;
  emailForm!: FormGroup;
  ticketForm!: FormGroup;
  pagination: IPagination;
  accounts: AccountType[];
  selectedCompany: string;
  isButtonDisabled = true;
  masterSelected!: boolean;
  selectedTicket: TicketType;
  selectedStatus: any[] = [];
  breadCrumbItems!: Array<{}>;
  CustomersData!: TicketType[];
  searchCompanyForm: FormGroup;
  isEmailButtonDisabled = true;
  ownersPagination: IPagination;
  selectedPriorities: any[] = [];
  status = values(TicketStatusEnum);
  priorities = values(TicketPriorityEnum);
  team$: Observable<UserType[]> = this.teamService.infiniteUsers$;
  stats$: Observable<TicketStatsType> = this.ticketsService.stats$;
  isOwnerLastPage$: Observable<boolean> = this.teamService.isLast$;
  tickets$: Observable<TicketType[]> = this.ticketsService.tickets$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  isLeadLastPage$: Observable<boolean> = this.companiesService.isLast$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  teamPagination$: Observable<IPagination> = this.teamService.pagination$;
  leads$: Observable<CompanyType[]> = this.companiesService.infiniteLeads$;
  loadingTickets$: Observable<boolean> = this.ticketsService.loadingTickets$;

  constructor(
    private modalService: NgbModal,
    private userService: UserService,
    private teamService: TeamService,
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private ticketsService: TicketsService,
    private convertorHelper: ConvertorHelper,
    private companiesService: CompaniesService,
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.ticketsService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.ticketsService.pageIndex || 0,
        size: this.ticketsService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.ticketsService.pageIndex || 0) * this.ticketsService.pageLimit,
        endIndex: Math.min(((this.ticketsService.pageIndex || 0) + 1) * this.ticketsService.pageLimit - 1, pagination.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
    this.teamService.team$.pipe(takeUntil(this.unsubscribeAll)).subscribe((team: AccountType[]) => {
      this.accounts = team;
      this.changeDetectorRef.markForCheck();
    });
    this.teamService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.ownersPagination = pagination;
      this.changeDetectorRef.markForCheck();
    });
    this.teamService.infiniteUsers$.pipe(takeUntil(this.unsubscribeAll)).subscribe((infiniteUsers: UserType[]) => {
      if (infiniteUsers) {
        this.iterateAssignedUsers(infiniteUsers);
      }
      this.changeDetectorRef.markForCheck();
    });
  }

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.CRM').subscribe((crm: string) => {
      this.translate.get('MENUITEMS.TS.TICKET_LIST').subscribe((ticketList: string) => {
        this.breadCrumbItems = [{ label: crm }, { label: ticketList, active: true }];
      });
    });
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.changeDetectorRef.markForCheck();
          this.ticketsService.searchString = searchValues.searchString;
          return this.ticketsService.getTicketsByTargetWithFilter();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
    this.filterForm = this.formBuilder.group({
      status: [[]],
      priority: [[]],
      date: [''],
    });
    this.filterForm?.valueChanges.subscribe((val): void => {
      if (val.priority === 'all') {
        this.ticketsService.priority = [];
      }
      if (val.date?.from && val.date?.to) {
        this.ticketsService.from = val?.date?.from;
        this.ticketsService.to = val?.date?.to;
        this.ticketsService.getTicketsByTargetWithFilter().subscribe();
      }
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

  async iterateAssignedUsers(infiniteUsers: UserType[]) {
    if (this.selectedTicket?.assignedTo?.length) {
      for (const assignedUser of this.selectedTicket?.assignedTo) {
        const isIdExists = some(infiniteUsers, (user) => user.id === assignedUser.id);
        if (!isIdExists) {
          this.teamService.page += 1;
          await new Promise((resolve) => {
            this.teamService.getTeam().subscribe();
          });
        }
      }
    }
  }

  openEmailModal(content: any) {
    this.modalService.open(content, { size: 'md', centered: true });
    this.userService.user$.pipe(take(1)).subscribe((user: UserType) => {
      this.emailForm = this.formBuilder.group({
        emails: [[user?.email], Validators.required],
      });
      const initialValues = this.emailForm.value;
      this.emailForm.valueChanges.subscribe((ivalues) => {
        this.isEmailButtonDisabled = isEqual(ivalues, initialValues);
      });
      this.changeDetectorRef.markForCheck();
    });
  }

  send() {
    this.isEmailButtonDisabled = true;
    this.ticketsService
      .sendTicketsBymail(this.emailForm.get('emails').value)
      .pipe(
        catchError((error) => {
          this.modalService.dismissAll();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
        this.modalService.dismissAll();
        this.position();
        this.changeDetectorRef.markForCheck();
      });
  }

  downloadDocument() {
    if (isPlatformBrowser(this.platformId)) {
      this.ticketsService.getTicketsByExcel().subscribe((res) => {
        const blob = this.convertorHelper.b64toBlob(res, 'xlsx');
        const a = this.document.createElement('a');
        this.document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = String('tickets.xlsx');
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      });
    }
  }

  onPriorityChange(priority: string, isChecked: boolean) {
    if (isChecked) {
      this.ticketsService.priority.push(priority);
    } else {
      const index = this.ticketsService.priority.indexOf(priority);
      if (index > -1) {
        this.ticketsService.priority.splice(index, 1);
      }
    }
    this.selectedPriorities = this.ticketsService.priority;
    this.ticketsService.getTicketsByTargetWithFilter().subscribe();
  }

  onStatusChange(status: string, isChecked: boolean) {
    if (isChecked) {
      this.ticketsService.status.push(status);
    } else {
      const index = this.ticketsService.status.indexOf(status);
      if (index > -1) {
        this.ticketsService.status.splice(index, 1);
      }
    }
    this.selectedStatus = this.ticketsService.status;
    this.ticketsService.getTicketsByTargetWithFilter().subscribe();
  }

  openFilterModal(content: any) {
    this.modalService.open(content, { size: 'md', centered: true });
  }

  resetDate(field?: string) {
    if (field === 'filter') {
      this.filterForm.get('date').reset();
      this.ticketsService.from = null;
      this.ticketsService.to = null;
      this.ticketsService.getTicketsByTargetWithFilter().subscribe();
    } else {
      this.ticketForm.get('deadline').reset();
    }
  }

  openTicketModal(content: NgbModal, ticket: TicketType) {
    this.selectedTicket = ticket;
    this.teamService.page = 0;
    this.companiesService.leadsPageIndex = 0;
    this.teamService.infiniteUsers$ = null;
    this.companiesService.infiniteLeads$ = null;
    this.companiesService.getCompaniesByTarget().subscribe();
    this.teamService.getTeam().subscribe();
    this.selectedCompany = this.selectedTicket?.customer?.name || null;
    this.modalService.open(content, { size: 'md', centered: true });
    this.searchCompanyForm = this.formBuilder.group({ searchString: [ticket?.customer?.name || ''] });
    this.ticketForm = this.formBuilder.group({
      name: [ticket?.name || '', [Validators.required]],
      assignedTo: [ticket?.assignedTo?.length ? map(ticket?.assignedTo, 'id') : []],
      deadline: [ticket?.deadline || ''],
      description: [ticket?.description || ''],
      customer: [ticket?.customer?.id || ''],
      status: [ticket?.status || ''],
      priority: [ticket?.priority || ''],
    });
    this.initValues = this.ticketForm?.value;
    this.ticketForm?.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val: any): void => {
      this.isButtonDisabled = isEqual(val, this.initValues);
      if (val?.customer !== this.initValues?.customer) {
        this.leads$
          .pipe(
            take(1),
            rxMap((leads) => {
              const company = find(leads, { id: val.customer });
              this.searchCompanyForm.get('searchString').patchValue(company.name, { emitEvent: false });
            }),
          )
          .subscribe();
      }
    });
    this.searchCompanyForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.companiesService.searchString = searchValues.searchString;
          return this.companiesService.getCompaniesByTarget(true);
        }),
      )
      .subscribe(() => {
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

  save() {
    this.isButtonDisabled = true;
    const args: any = {
      ...FormHelper.getNonEmptyAndChangedValues(this.ticketForm.value, this.initValues),
    };
    if (!this.selectedTicket) {
      this.ticketsService
        .createTicket(args)
        .pipe(
          catchError((error) => {
            this.modalService.dismissAll();
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return throwError(() => new Error(error));
          }),
        )
        .subscribe(() => {
          this.pagination.length++;
          this.pagination.endIndex++;
          this.position();
          this.modalService.dismissAll();
          this.changeDetectorRef.markForCheck();
        });
    } else {
      this.ticketsService
        .updateTicket(args, this.selectedTicket.id)
        .pipe(
          catchError((error) => {
            this.modalService.dismissAll();
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return throwError(() => new Error(error));
          }),
        )
        .subscribe(() => {
          this.position();
          this.modalService.dismissAll();
          this.changeDetectorRef.markForCheck();
        });
    }
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

  loadMoreOwners() {
    this.teamService.isLast$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.teamService.page += 1;
        this.teamService.getTeam().subscribe();
      }
    });
  }

  loadMoreLeads() {
    this.companiesService.leadsPageIndex += 1;
    this.companiesService.getCompaniesByTarget().subscribe();
  }

  onCompanyChange(company: CompanyType) {
    this.selectedCompany = company.name;
    this.ticketForm.get('customer').patchValue(company.id);
  }

  onScroll({ end }) {
    if (this.accounts.length <= this.ownersPagination.length) {
      return;
    }

    if (end + 2 >= this.accounts.length) {
      this.loadMoreOwners();
    }
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.ticketsService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.ticketsService.getTicketsByTargetWithFilter().subscribe();
    }
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.ticketsService.pageIndex = 0;
    this.ticketsService.searchString = '';
  }
}
