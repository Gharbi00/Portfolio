import Swal from 'sweetalert2';
import { cloneDeep, isEqual, map, omit, pick } from 'lodash';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject, catchError, debounceTime, distinctUntilChanged, switchMap, takeUntil, throwError } from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import { FormHelper } from '@diktup/frontend/helpers';
import { AccountType, BoardCategoryEnum, BoardType, ProjectType } from '@sifca-monorepo/terminal-generator';

import { TasksService } from '../tasks.service';
import { ProjectsService } from '../../projects/projects.service';
import { TeamService } from '../../../../system/team/team.service';
import { UsersModalComponent } from '../../../../../shared/components/users-modal/users-modal.component';
import { SharedService } from '../../../../../shared/services/shared.service';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-list',
  templateUrl: './boards.component.html',
  styleUrls: ['./boards.component.scss'],
})
export class BoardsComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  pageChanged: any;
  boards: BoardType[];
  boardForm: FormGroup;
  pagination: IPagination;
  selectedBoard: BoardType;
  breadCrumbItems!: Array<any>;
  isButtonDisabled: boolean = true;
  isLast$: Observable<boolean> = this.teamService.isLast$;
  isLoading$: Observable<boolean> = this.teamService.isLoading$;
  team$: Observable<AccountType[]> = this.teamService.infiniteTeam$;
  projects$: Observable<ProjectType[]> = this.projectsService.infiniteProjects$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  searchBoardForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  selectedUsers: any[] = [];
  boards$: Observable<BoardType[]> = this.tasksService.boards$;
  loadingBoards$: Observable<boolean> = this.tasksService.loadingBoards$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;

  get members() {
    return this.boardForm?.get('members') as FormArray;
  }

  constructor(
    private modalService: NgbModal,
    private teamService: TeamService,
    private formBuilder: FormBuilder,
    public tasksService: TasksService,
    private translate: TranslateService,
    private sharedService: SharedService,
    private projectsService: ProjectsService,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.tasksService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.tasksService.pageIndex || 0,
        size: this.tasksService.filterLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.tasksService.pageIndex || 0) * this.tasksService.filterLimit,
        endIndex: Math.min(((this.tasksService.pageIndex || 0) + 1) * this.tasksService.filterLimit - 1, pagination.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
    this.tasksService.boards$.pipe(takeUntil(this.unsubscribeAll)).subscribe((boards: BoardType[]) => {
      this.boards = boards;
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
    this.translate.get('MENUITEMS.TS.COLLABORATION').subscribe((collaboration: string) => {
      this.translate.get('MENUITEMS.TS.BOARDS').subscribe((boards: string) => {
        this.breadCrumbItems = [{ label: collaboration }, { label: boards, active: true }];
      });
    });
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.changeDetectorRef.markForCheck();
          this.teamService.page = 0;
          this.teamService.searchString = searchValues.searchString;
          return this.teamService.searchAccount();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
    this.searchBoardForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.changeDetectorRef.markForCheck();
          this.teamService.page = 0;
          this.tasksService.searchString = searchValues.searchString;
          return this.tasksService.getBoardsPaginated();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  deleteBoard() {
    this.tasksService.deleteBoard(this.selectedBoard?.id).subscribe((res) => {
      if (res) {
        this.position();
        this.modalService.dismissAll();
      }
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

  openDeleteModal(content: any, board: any) {
    this.selectedBoard = board;
    this.modalService.open(content);
  }

  openModal() {
    const modalRef = this.modalService.open(UsersModalComponent);
    modalRef.componentInstance.selectedUsers = this.selectedUsers;
  }

  openMemberModal(content: any, board: BoardType) {
    this.selectedBoard = board;
    this.selectedUsers = board.members;
    this.teamService.team$ = null;
    this.teamService.infiniteTeam$ = null;
    this.teamService.page = 0;
    this.boardForm = this.formBuilder.group({
      title: [board?.title || ''],
      description: [board?.description || ''],
      icon: [board?.icon || ''],
      projects: [board?.projects?.length ? map(board?.projects, 'id') : []],
      category: [board?.category || ''],
      members: this.formBuilder.array(board?.members?.length ? map(board?.members, 'id') : []),
    });
    const initValues = this.boardForm?.value;
    this.boardForm?.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val: any): void => {
      this.isButtonDisabled = isEqual(val, initValues);
    });
    this.teamService.getTeam().subscribe();
    this.modalService.open(content, { size: 'md', centered: true });
  }

  openBoardModal(content: any, board: BoardType) {
    this.modalService.open(content, { size: 'md', centered: true });
    this.projectsService.pageIndex = 0;
    this.projectsService.infiniteProjects$ = null;
    this.projectsService.getProjectsByTargetWithFilter().subscribe();
    this.selectedBoard = board;
    this.boardForm = this.formBuilder.group({
      title: [board?.title || '', Validators.required],
      description: [board?.description || ''],
      projects: [board?.projects?.length ? map(board?.projects, 'id') : [], Validators.required],
      members: this.formBuilder.array(board?.members?.length ? map(board?.members, 'id') : []),
    });
    const initValues = this.boardForm?.value;
    this.boardForm?.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val: any): void => {
      this.isButtonDisabled = isEqual(val, initValues);
    });
  }

  save() {
    this.isButtonDisabled = true;
    if (!this.selectedBoard) {
      const input: any = {
        category: BoardCategoryEnum.PROJECTS,
        ...FormHelper.getNonEmptyValues(omit(this.boardForm.value, 'projects', 'members')),
        ...(this.boardForm.get('projects').value ? { projects: this.boardForm.get('projects').value } : {}),
      };
      this.tasksService
        .createBoard(input)
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
    } else {
      const input: any = {
        id: this.selectedBoard?.id,
        ...FormHelper.getNonEmptyAndChangedValues(
          omit(this.boardForm.value, 'projects', 'members'),
          pick(this.selectedBoard, 'title', 'description'),
        ),
        ...(isEqual(
          (this.selectedBoard.projects?.length ? cloneDeep(map(this.selectedBoard.projects, 'id')) : []).sort(),
          (this.boardForm.get('projects').value?.length ? cloneDeep(this.boardForm.get('projects').value) : []).sort(),
        )
          ? {}
          : { projects: this.boardForm.get('projects').value }),
      };
      this.tasksService
        .updateBoard(input)
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
  }

  isAdded(id: string) {
    const index = this.members.value.indexOf(id);
    if (index > -1) {
      return true;
    }
    return false;
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

  invite() {
    this.isButtonDisabled = true;
    const input: any = {
      id: this.selectedBoard.id,
      title: 'My Third Project',
      members: this.members.value,
    };
    this.tasksService
      .updateBoard(input)
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

  addMember(member: any) {
    const tagFormControl = this.formBuilder.control(member.user.id);
    this.members?.push(tagFormControl);
  }

  removeMember(id: string) {
    const index = this.members.value.indexOf(id);
    this.members.removeAt(index);
  }

  loadMoreMembers() {
    this.teamService.page += 1;
    this.teamService.getTeam().subscribe();
  }

  openFilterModal(content: any) {
    this.modalService.open(content, { centered: true });
  }

  onPageChange(page: number) {
    this.page = page;
    this.tasksService.pageIndex = page - 1;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    if (this.pageChanged) {
      this.tasksService.getBoardsPaginated().subscribe();
    }
  }

  confirm(content: any, id: any) {
    this.modalService.open(content, { centered: true });
  }

  deleteData(id: any) {
    this.document.getElementById('pl1_' + id)?.remove();
  }

  activeMenu(id: any) {
    this.document.querySelector('.heart_icon_' + id)?.classList.toggle('active');
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.tasksService.pageIndex = 0;
    this.tasksService.searchString = '';
  }
}
