import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { cloneDeep, isEqual, map, omit, pick, some, values } from 'lodash';
import { NgbdListViewSortableHeader } from './list-sortable.directive';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap, take, takeUntil, throwError } from 'rxjs';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';

import { IPagination } from '@diktup/frontend/models';
import { FormHelper } from '@diktup/frontend/helpers';
import { BoardCardPriorityEnum, BoardCardType, BoardListType, CompanyType, ProjectType, UserType } from '@sifca-monorepo/terminal-generator';

import { TasksService } from '../tasks.service';
import { ProjectsService } from '../../projects/projects.service';
import { TeamService } from '../../../../system/team/team.service';
import { CompaniesService } from '../../../../crm/customers/companies/companies.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-task-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class TasksListViewComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChildren(NgbdListViewSortableHeader) headers!: QueryList<NgbdListViewSortableHeader>;

  page = 0;
  boardId: string;
  initValues: any;
  pageChanged = false;
  boardForm: FormGroup;
  filterForm: FormGroup;
  boards: BoardCardType[];
  pagination: IPagination;
  isButtonDisabled = true;
  selectedUsers: UserType[];
  selectedCard: BoardCardType;
  breadCrumbItems!: Array<any>;
  isFilterButtonDisabled = true;
  isArchivedButtonDisabled: boolean;
  priorities = values(BoardCardPriorityEnum);
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  boardCards$: Observable<BoardCardType[]> = this.tasksService.boardCards$;
  team$: Observable<UserType[]> = this.teamService.infiniteUsers$;
  projects$: Observable<ProjectType[]> = this.projectsService.infiniteProjects$;
  boardList$: Observable<BoardListType[]> = this.tasksService.boardList$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  loadingBoardCards$: Observable<boolean> = this.tasksService.loadingBoardCards$;
  companies$: Observable<CompanyType[]> = this.companiesService.infiniteLeads$;

  constructor(
    private modalService: NgbModal,
    private teamService: TeamService,
    private formBuilder: FormBuilder,
    private tasksService: TasksService,
    private translate: TranslateService,
    private sharedService: SharedService,
    private activatedRoute: ActivatedRoute,
    private projectsService: ProjectsService,
    private companiesService: CompaniesService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.tasksService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.tasksService.pageIndex || 0,
        size: this.tasksService.filterLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.tasksService.pageIndex || 0) * this.tasksService.filterLimit,
        endIndex: Math.min(((this.tasksService.pageIndex || 0) + 1) * this.tasksService.filterLimit - 1, pagination?.length - 1),
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

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  ngOnInit(): void {
    this.boardId = this.activatedRoute.snapshot.paramMap.get('id');
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.changeDetectorRef.markForCheck();
          this.tasksService.searchString = searchValues.searchString;
          return this.tasksService.getBoardCardsByBoardWithFilterPaginated(this.boardId);
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
    this.translate.get('MENUITEMS.TS.COLLABORATION').subscribe((collaboration: string) => {
      this.translate.get('MENUITEMS.TS.TASK_LIST').subscribe((taskList: string) => {
        this.breadCrumbItems = [{ label: collaboration }, { label: taskList, active: true }];
      });
    });
    this.filterForm = this.formBuilder.group({
      customer: [],
      priority: [[]],
      projects: [[]],
      boardList: [[]],
      assignedTo: [[]],
    });
    this.filterForm?.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val): void => {
      this.isFilterButtonDisabled = false;
      this.changeDetectorRef.markForCheck();
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
    if (this.selectedCard?.assignedTo?.length) {
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

  openArchiveModal(content: any, board: any) {
    this.selectedCard = board;
    this.modalService.open(content, { centered: true });
  }

  archiveCard() {
    const input: any = {
      archived: true,
    };
    this.tasksService
      .archivedCard(input, this.selectedCard.id)
      .pipe(
        catchError((error) => {
          if (error) {
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
          }
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.pagination.length--;
          this.pagination.endIndex--;
          this.isArchivedButtonDisabled = true;
          this.modalService.dismissAll();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  filter() {
    this.isFilterButtonDisabled = true;
    const input: any = {
      ...(this.filterForm.get('customer').value ? { customer: this.filterForm.get('customer').value } : {}),
      ...(this.filterForm.get('priority').value?.length ? { priority: this.filterForm.get('priority').value } : {}),
      ...(this.filterForm.get('boardList').value?.length ? { boardList: this.filterForm.get('boardList').value } : {}),
      ...(this.filterForm.get('assignedTo').value?.length ? { assignedTo: this.filterForm.get('assignedTo').value } : {}),
      ...(this.filterForm.get('projects').value?.length ? { projects: this.filterForm.get('projects').value } : {}),
    };
    this.tasksService
      .getBoardCardsByBoardWithFilterPaginated(this.boardId, input)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
        this.modalService.dismissAll();
        this.changeDetectorRef.markForCheck();
      });
  }

  onBoardListChange(id: string) {
    this.boardForm.get('boardList').patchValue(id);
  }

  openFilterModal(content: any) {
    this.teamService.page = 0;
    this.companiesService.leadsPageIndex = 0;
    this.teamService.infiniteTeam$ = null;
    this.projectsService.pageIndex = 0;
    this.projectsService.infiniteProjects$ = null;
    this.companiesService.infiniteLeads$ = null;
    this.teamService.getTeam().subscribe();
    this.projectsService.getProjectsByTargetWithFilter().subscribe();
    this.companiesService.getCompaniesByTarget().subscribe();
    this.tasksService.getBoardListByBoard(this.boardId).subscribe();
    this.modalService.open(content, { centered: true });
  }

  openBoardModal(content: any, board: BoardCardType) {
    this.teamService.page = 0;
    this.companiesService.leadsPageIndex = 0;
    this.projectsService.getProjectsByTargetWithFilter().subscribe();
    this.teamService.infiniteUsers$ = null;
    this.companiesService.infiniteLeads$ = null;
    this.selectedUsers = board?.assignedTo;
    this.teamService.getTeam().subscribe();
    this.companiesService.getCompaniesByTarget().subscribe();
    this.tasksService.getBoardListByBoard(this.boardId).subscribe();
    this.selectedCard = board;
    this.boardForm = this.formBuilder.group({
      title: [board?.title || '', Validators.required],
      description: [board?.description || ''],
      dueDate: [board?.dueDate || ''],
      priority: [board?.priority || ''],
      customer: [board?.customer?.id || ''],
      tags: [board?.tags?.length ? board?.tags : []],
      project: [board?.project?.id || ''],
      assignedTo: [board?.assignedTo?.length ? map(board?.assignedTo, 'id') : []],
      ...(!this.selectedCard && { boardList: [board?.boardList || '', [Validators.required]] }),
    });
    this.initValues = this.boardForm?.value;
    this.boardForm?.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val: any): void => {
      this.isButtonDisabled = isEqual(val, this.initValues);
    });
    this.modalService.open(content, { size: 'md', centered: true });
  }

  save() {
    this.isButtonDisabled = true;
    if (!this.selectedCard) {
      const input: any = {
        ...FormHelper.getNonEmptyValues(omit(this.boardForm.value, 'customer', 'tags', 'assignedTo', 'project')),
        ...(this.boardForm.get('project').value !== this.initValues.project ? { project: this.boardForm.value.project } : {}),
        ...(this.boardForm.get('customer').value ? { customer: this.boardForm.get('customer').value } : {}),
        ...(this.boardForm.get('tags').value?.lnegth ? { tags: this.boardForm.get('tags').value } : {}),
        ...(this.boardForm.get('assignedTo').value?.length ? { assignedTo: this.boardForm.get('assignedTo').value } : {}),
      };
      this.tasksService
        .createBoardCard(input)
        .pipe(
          catchError((error) => {
            if (error) {
              this.modalError();
              this.changeDetectorRef.markForCheck();
              return of(null);
            }
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.pagination.length += 1;
            this.pagination.endIndex += 1;
            this.modalService.dismissAll();
            this.changeDetectorRef.markForCheck();
          }
        });
    } else {
      const input: any = {
        id: this.selectedCard?.id,
        ...(isEqual(this.boardForm.get('customer').value, this.initValues?.customer) ? {} : { customer: this.boardForm.get('customer').value }),
        ...FormHelper.getNonEmptyAndChangedValues(
          omit(this.boardForm.value, 'tags', 'customer', 'assignedTo', 'project'),
          pick(this.selectedCard, 'title', 'description', 'dueDate', 'priority'),
        ),
        ...(this.boardForm.get('project').value !== this.initValues.project ? { project: this.boardForm.value.project } : {}),
        ...(isEqual(
          (this.selectedCard.tags?.length ? cloneDeep(this.selectedCard.tags) : []).sort(),
          (this.boardForm.value?.tags?.length ? cloneDeep(this.boardForm.value.tags) : []).sort(),
        )
          ? {}
          : { tags: this.boardForm.value.tags }),
        ...(isEqual(
          (this.selectedCard.assignedTo?.length ? cloneDeep(this.selectedCard.assignedTo) : []).sort(),
          (this.boardForm.value?.assignedTo?.length ? cloneDeep(this.boardForm.value.assignedTo) : []).sort(),
        )
          ? {}
          : { assignedTo: this.boardForm.value.assignedTo }),
      };
      this.tasksService
        .updateBoardCard(input)
        .pipe(
          catchError((error) => {
            if (error) {
              this.modalError();
              this.changeDetectorRef.markForCheck();
              return of(null);
            }
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.modalService.dismissAll();
            this.changeDetectorRef.markForCheck();
          }
        });
    }
  }

  loadMoreOwners() {
    this.teamService.isLast$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.teamService.page++;
        this.teamService.getTeam().subscribe();
      }
    });
  }

  loadMoreProjects() {
    this.projectsService.isLast$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.teamService.page++;
        this.teamService.getTeam().subscribe();
      }
    });
  }

  loadMoreCompanies() {
    this.companiesService.isLast$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.companiesService.leadsPageIndex += 1;
        this.companiesService.getCompaniesByTarget().subscribe();
      }
      this.changeDetectorRef.markForCheck();
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

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.tasksService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.tasksService.getBoardCardsByBoardWithFilterPaginated(this.boardId).subscribe();
    }
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.tasksService.pageIndex = 0;
    this.tasksService.searchString = '';
  }
}
