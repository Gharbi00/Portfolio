import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { cloneDeep, find, isEqual, map, omit, pick, some, values } from 'lodash';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { take, Subject, switchMap, takeUntil, catchError, Observable, throwError, debounceTime, map as rxMap, distinctUntilChanged } from 'rxjs';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';

import { IPagination } from '@diktup/frontend/models';
import { FormHelper } from '@diktup/frontend/helpers';
import { BoardCardProcedureEnum, CompanyType, UserType } from '@sifca-monorepo/terminal-generator';
import { AccountType, BoardCardType, BoardWithListsAndCardsType } from '@sifca-monorepo/terminal-generator';

import { PipelineService } from '../pipeline.service';
import { TeamService } from '../../../system/team/team.service';
import { CompaniesService } from '../../customers/companies/companies.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-archived',
  templateUrl: './archived.component.html',
  styleUrls: ['./archived.component.scss'],
})
export class ArchivedComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  owners: string;
  boardId: string;
  isLoading: boolean;
  items: any[] = [];
  scrollPosition = 0;
  cardForm: FormGroup;
  team: AccountType[];
  ownerForm: FormGroup;
  leads: CompanyType[];
  isUnArchived = false;
  pageChanged: boolean;
  selectedCompany: string;
  isButtonDisabled = true;
  pagination: IPagination;
  procedureForm: FormGroup;
  archived: BoardCardType[];
  breadCrumbItems!: Array<{}>;
  selectedCard: BoardCardType;
  selectedOwner: string[] = [];
  searchCompanyForm: FormGroup;
  isProcedureButtonDisabled = true;
  board: BoardWithListsAndCardsType;
  isArchivedButtonDisabled: boolean;
  tasks = values(BoardCardProcedureEnum);
  isOwnerLastPage$: Observable<boolean> = this.teamService.isLast$;
  team$: Observable<UserType[]> = this.teamService.infiniteUsers$;
  isLeadLastPage$: Observable<boolean> = this.companiesService.isLast$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  archived$: Observable<BoardCardType[]> = this.pipelineService.archived$;
  leads$: Observable<CompanyType[]> = this.companiesService.infiniteLeads$;
  loadingCompanies$: Observable<boolean> = this.companiesService.loadingCompanies$;
  selectedMembers: UserType[];
  navigating$: Observable<boolean> = this.sharedService.navigating$;

  get procedures() {
    return this.procedureForm?.get('procedure') as FormArray;
  }

  constructor(
    private modalService: NgbModal,
    private teamService: TeamService,
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    private activatedRoute: ActivatedRoute,
    public pipelineService: PipelineService,
    private companiesService: CompaniesService,
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
  ) {
    this.boardId = this.activatedRoute.snapshot.paramMap.get('id');
    this.pipelineService.archived$.pipe(takeUntil(this.unsubscribeAll)).subscribe((archived: BoardCardType[]) => {
      if (archived) {
        this.archived = archived;
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      }
    });
    this.companiesService.infiniteLeads$.pipe(takeUntil(this.unsubscribeAll)).subscribe((leads: any[]) => {
      this.leads = leads;
      this.changeDetectorRef.markForCheck();
    });
    this.teamService.team$.pipe(takeUntil(this.unsubscribeAll)).subscribe((team: any[]) => {
      this.team = team;
      this.changeDetectorRef.markForCheck();
    });
    this.pipelineService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.pipelineService.pageIndex,
        size: this.pipelineService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: this.pipelineService.pageIndex * this.pipelineService.pageLimit,
        endIndex: Math.min((this.pipelineService.pageIndex + 1) * this.pipelineService.pageLimit - 1, pagination?.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
    this.teamService.infiniteUsers$.pipe(takeUntil(this.unsubscribeAll)).subscribe((infiniteUsers: UserType[]) => {
      if (infiniteUsers) {
        this.iterateAssignedUsers(infiniteUsers);
      }
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.ARCHIVE').subscribe((archive: string) => {
      this.translate.get('MENUITEMS.TS.PIPELINE').subscribe((pipeline: string) => {
        this.breadCrumbItems = [
          { label: pipeline, routerLink: '/pipeline' },
          { label: archive, routerLink: '/pipeline/archived', active: true },
        ];
      });
    });
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.isLoading = true;
          this.changeDetectorRef.markForCheck();
          this.pipelineService.searchString = searchValues.searchString;
          return this.pipelineService.getArchivedBoardCardsPaginated(this.boardId);
        }),
      )
      .subscribe(() => {
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      });
  }

  async iterateAssignedUsers(infiniteUsers: UserType[]) {
    if (this.selectedCard?.assignedTo.length) {
      for (const assignedUser of this.selectedCard?.assignedTo) {
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

  openMemberModal(content: any, card?: BoardCardType) {
    this.selectedMembers = card.assignedTo;
    this.modalService.open(content, { size: 'md', centered: true });
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.pipelineService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.pipelineService.getArchivedBoardCardsPaginated(this.boardId).subscribe();
    }
  }

  unArchiveCard(archive: BoardCardType) {
    this.selectedCard = archive;
    const input: any = {
      archived: false,
    };
    this.pipelineService
      .archivedCard(input, this.selectedCard.id, true)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
        this.pagination.length--;
        this.pagination.endIndex--;
        this.isArchivedButtonDisabled = true;
        this.isUnArchived = true;
        this.translate.get('MENUITEMS.TS.UNARCHIVED').subscribe((unarchived: string) => {
          this.translate.get('MENUITEMS.TS.FILE_ARCHIVED').subscribe((fileArchived: string) => {
            Swal.fire({
              title: unarchived,
              text: fileArchived,
              confirmButtonColor: 'rgb(3, 142, 220)',
              icon: 'success',
            });
          });
        });
      });
  }

  openArchiveModal(content: NgbModal, card: BoardCardType) {
    this.teamService.infiniteUsers$ = null;
    this.companiesService.infiniteLeads$ = null;
    this.companiesService.getCompaniesByTarget().subscribe();
    this.teamService.getTeam().subscribe();
    this.selectedCard = card;
    this.selectedOwner = map(this.selectedCard?.assignedTo, 'id');
    this.owners = map(this.selectedCard?.assignedTo, 'firstName').join(', ');
    this.selectedCompany = this.selectedCard?.customer?.name || null;
    this.modalService.open(content, { size: 'md', centered: true });
    this.searchCompanyForm = this.formBuilder.group({ searchString: [card?.customer?.name || ''] });
    this.ownerForm = this.formBuilder.group({
      firstName: [this.selectedCard?.assignedTo?.length ? map(this.selectedCard?.assignedTo, 'firstName').join(', ') : ''],
    });
    this.cardForm = this.formBuilder.group({
      title: [card?.title || '', Validators.required],
      budget: [card?.budget || ''],
      assignedTo: [card?.assignedTo?.length ? map(card?.assignedTo, 'id') : []],
      dueDate: [card?.dueDate || ''],
      description: [card?.description || ''],
      customer: [card?.customer?.id || ''],
    });
    const initValues = this.cardForm?.value;
    this.cardForm?.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val: any): void => {
      this.isButtonDisabled = isEqual(val, initValues);
      if (val?.customer !== initValues?.customer) {
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

  save() {
    this.isButtonDisabled = true;
    const args: any = {
      ...(this.cardForm.get('customer').value === this.selectedCard?.customer?.id ? {} : { customer: this.cardForm.get('customer').value }),
      ...(isEqual(
        (this.selectedCard.assignedTo?.length ? cloneDeep(this.selectedCard.assignedTo) : []).sort(),
        (this.cardForm.value?.assignedTo?.length ? cloneDeep(this.cardForm.value.assignedTo) : []).sort(),
      )
        ? {}
        : { assignedTo: this.cardForm.value.assignedTo }),
      ...FormHelper.getNonEmptyAndChangedValues(
        omit(this.cardForm.value, 'assignedTo', 'customer'),
        pick(this.selectedCard, ['description', 'dueDate', 'budget', 'title']),
      ),
    };
    this.pipelineService
      .updateArchivedCard(args, this.selectedCard.id)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
        this.modalService.dismissAll();
      });
  }

  unArchive(archive: BoardCardType) {
    this.translate.get('COMMON.ARE_YOU_SURE').subscribe((areYouSure: string) => {
      this.translate.get('MENUITEMS.TS.SURE_TO_UNARCHIVE').subscribe((sureToUnarchive: string) => {
        Swal.fire({
          title: areYouSure,
          text: sureToUnarchive,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: 'rgb(3, 142, 220)',
          cancelButtonColor: 'rgb(243, 78, 78)',
          confirmButtonText: 'Yes, unArchive it!',
        }).then((result) => {
          if (result.isConfirmed) {
            this.unArchiveCard(archive);
          }
        });
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

  loadMoreOwners() {
    this.teamService.page++;
    this.teamService.getTeam().subscribe();
  }

  loadMoreLeads() {
    this.companiesService.leadsPageIndex += 1;
    this.companiesService.getCompaniesByTarget().subscribe();
  }

  onCompanyChange(company: CompanyType) {
    this.selectedCompany = company.name;
    this.cardForm.get('customer').patchValue(company.id);
  }

  onOwnerChange(owner: any, isChecked: boolean) {
    if (isChecked) {
      this.items.push(owner.user.firstName);
      this.selectedOwner.push(owner.user.id);
    } else {
      const index = this.selectedOwner.indexOf(owner.user.id);
      if (index > -1) {
        this.selectedOwner.splice(index, 1);
        this.items.splice(index, 1);
      }
    }
    this.owners = this.selectedOwner
      .map((id) => {
        const owner = this.team.find((o) => o.user.id === id);
        return owner ? owner.user.firstName : '';
      })
      .join(', ');
    this.ownerForm.get('firstName').setValue(this.owners);
    this.cardForm.get('assignedTo').patchValue(this.selectedOwner);
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.companiesService.leadsPageIndex = 0;
    this.companiesService.searchString = '';
  }
}
