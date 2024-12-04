import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { cloneDeep, find, isEqual, map, omit, pick, some, values } from 'lodash';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { take, Subject, switchMap, takeUntil, catchError, Observable, throwError, debounceTime, map as rxMap, distinctUntilChanged } from 'rxjs';
import Swal from 'sweetalert2';

import { FormHelper } from '@diktup/frontend/helpers';
import { BoardCardProcedureEnum, CompanyType, ListWithCardsType, UserType } from '@sifca-monorepo/terminal-generator';
import { AccountType, BoardCardType, BoardWithListsAndCardsType } from '@sifca-monorepo/terminal-generator';

import { PipelineService } from './pipeline.service';
import { TeamService } from '../../system/team/team.service';
import { CompaniesService } from '../customers/companies/companies.service';
import { SharedService } from '../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-deals',
  templateUrl: './pipeline.component.html',
  styleUrls: ['./pipeline.component.scss'],
})
export class PipelineComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  submitted = false;
  scrollPosition = 0;
  cardForm: FormGroup;
  team: AccountType[];
  leads: CompanyType[];
  selectedCompany: string;
  isButtonDisabled = true;
  procedureForm: FormGroup;
  breadCrumbItems!: Array<{}>;
  selectedCard: BoardCardType;
  searchCompanyForm: FormGroup;
  isProcedureButtonDisabled = true;
  board: BoardWithListsAndCardsType;
  isArchivedButtonDisabled: boolean;
  tasks = values(BoardCardProcedureEnum);
  isOwnerLastPage$: Observable<boolean> = this.teamService.isLast$;
  isLeadLastPage$: Observable<boolean> = this.companiesService.isLast$;
  team$: Observable<UserType[]> = this.teamService.infiniteUsers$;
  archived$: Observable<BoardCardType[]> = this.pipelineService.archived$;
  leads$: Observable<CompanyType[]> = this.companiesService.infiniteLeads$;
  loadingCompanies$: Observable<boolean> = this.companiesService.loadingCompanies$;
  boardId: string;
  totalCount = 0;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  filetredBoardList: ListWithCardsType[];
  allBoardLists: ListWithCardsType[];
  initValues: any;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  loadingCrm$: Observable<boolean> = this.pipelineService.loadingCrm$;

  get procedures() {
    return this.procedureForm?.get('procedure') as FormArray;
  }

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private modalService: NgbModal,
    private teamService: TeamService,
    private formBuilder: FormBuilder,
    private sharedService: SharedService,
    public pipelineService: PipelineService,
    private companiesService: CompaniesService,
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
  ) {
    this.pipelineService.board$.pipe(takeUntil(this.unsubscribeAll)).subscribe((board: BoardWithListsAndCardsType) => {
      this.board = board;
      this.filetredBoardList = board.boardLists;
      this.allBoardLists = this.filetredBoardList;
      this.boardId = board.id;
      this.changeDetectorRef.markForCheck();
    });
    this.companiesService.infiniteLeads$.pipe(takeUntil(this.unsubscribeAll)).subscribe((leads: any[]) => {
      this.leads = leads;
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
    this.translate.get('MENUITEMS.TS.CRM').subscribe((crm: string) => {
      this.translate.get('MENUITEMS.TS.PIPELINE').subscribe((pipeline: string) => {
        this.breadCrumbItems = [{ label: crm }, { label: pipeline, active: true }];
      });
    });
  }

  async iterateAssignedUsers(infiniteUsers: UserType[]) {
    if (this.selectedCard?.assignedTo) {
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

  filterCards(card: BoardCardType) {
    return new RegExp(this.searchForm.get('searchString').value, 'i').test(card.title);
  }

  countTotal(list: ListWithCardsType) {
    this.totalCount = 0;
    list.boardCards.forEach((card) => {
      this.totalCount += Number(card.budget);
    });
    return this.totalCount;
  }

  openCardModal(content: NgbModal, card: BoardCardType) {
    this.teamService.page = 0;
    this.companiesService.leadsPageIndex = 0;
    this.teamService.infiniteUsers$ = null;
    this.companiesService.infiniteLeads$ = null;
    this.companiesService.getCompaniesByTarget().subscribe();
    this.teamService.getTeam().subscribe();
    this.selectedCard = card;
    this.selectedCompany = this.selectedCard?.customer?.name || null;
    this.modalService.open(content, { size: 'md', centered: true });
    this.searchCompanyForm = this.formBuilder.group({ searchString: [card?.customer?.name || ''] });
    this.cardForm = this.formBuilder.group({
      boardList: [this.board?.boardLists[0]?.id],
      title: [card?.title || '', Validators.required],
      budget: [card?.budget || ''],
      assignedTo: [card?.assignedTo?.length ? map(card?.assignedTo, 'id') : []],
      dueDate: [card?.dueDate || ''],
      description: [card?.description || ''],
      customer: [card?.customer?.id || ''],
    });
    this.initValues = this.cardForm?.value;
    this.cardForm?.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val: any): void => {
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
    if (!this.selectedCard) {
      const args: any = {
        ...FormHelper.getNonEmptyValues(this.cardForm.value),
      };
      this.pipelineService
        .createBoardCard(args)
        .pipe(
          catchError((error) => {
            if (error) {
              this.modalService.dismissAll();
              this.modalError();
              this.changeDetectorRef.markForCheck();
              return throwError(() => new Error(error));
            }
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.position();
            this.modalService.dismissAll();
          }
        });
    } else {
      const args: any = {
        ...(this.cardForm.get('customer').value === this.selectedCard?.customer?.id ? {} : { customer: this.cardForm.get('customer').value }),
        ...(isEqual(
          (this.initValues.assignedTo?.length ? cloneDeep(this.initValues.assignedTo) : []).sort(),
          (this.cardForm.value?.assignedTo?.length ? cloneDeep(this.cardForm.value.assignedTo) : []).sort(),
        )
          ? {}
          : { assignedTo: this.cardForm.value.assignedTo }),
        ...FormHelper.getNonEmptyAndChangedValues(
          omit(this.cardForm.value, 'boardList', 'assignedTo', 'customer'),
          pick(this.selectedCard, ['description', 'dueDate', 'budget', 'title']),
        ),
      };
      this.pipelineService
        .updateBoardCard(args, this.selectedCard.id)
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
        });
    }
  }

  saveProcedure() {
    this.isProcedureButtonDisabled = true;
    this.pipelineService
      .updateBoardCard(this.procedureForm.value, this.selectedCard.id)
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

  nextStep(index: number, card: any) {
    this.selectedCard = card;
    const input: any = {
      boardList: this.board?.boardLists[index + 1]?.id,
    };
    this.pipelineService
      .updateBoardCard(input, this.selectedCard.id)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
        switchMap(() => {
          return this.pipelineService.getCRMBoard();
        }),
      )
      .subscribe(() => {
        this.modalService.dismissAll();
      });
  }

  openProcedureModal(content: NgbModal, card: any) {
    this.selectedCard = card;
    this.modalService.open(content, { size: 'lg', centered: true });
    this.procedureForm = this.formBuilder.group({
      procedure: this.formBuilder.array(
        card.procedure?.length
          ? map(card.procedure, (proc) => {
              return this.formBuilder.group({
                title: [proc?.title || '', Validators.required],
                task: [proc?.task || '', Validators.required],
                time: [proc?.time || '', Validators.required],
              });
            })
          : [
              this.formBuilder.group({
                title: ['', Validators.required],
                task: ['', Validators.required],
                time: ['', Validators.required],
              }),
            ],
      ),
    });
    const initValues = this.procedureForm?.value;
    this.procedureForm?.valueChanges.subscribe((val: any): void => {
      this.isProcedureButtonDisabled = isEqual(val, initValues);
    });
  }

  openArchiveModal(content: any, card: any) {
    this.selectedCard = card;
    this.modalService.open(content, { centered: true });
  }

  archiveCard() {
    const input: any = {
      archived: true,
    };
    this.pipelineService
      .archivedCard(input, this.selectedCard.id, false)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
        this.isArchivedButtonDisabled = true;
        this.modalService.dismissAll();
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

  addProcedureField(): void {
    const procedureFormGroup = this.formBuilder.group({
      title: ['', Validators.required],
      task: ['', Validators.required],
      time: ['', Validators.required],
    });
    (this.procedureForm?.get('procedure') as FormArray)?.push(procedureFormGroup);
    this.changeDetectorRef.markForCheck();
  }

  removeProcedureField(index: number): void {
    const proceduresFormArray = this.procedures as FormArray;
    proceduresFormArray.removeAt(index);
    this.changeDetectorRef.markForCheck();
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
}
