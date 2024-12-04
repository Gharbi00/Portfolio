import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { DndDropEvent } from 'ngx-drag-drop';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { cloneDeep, isEqual, map, omit, pick, some, values } from 'lodash';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject, catchError, debounceTime, distinctUntilChanged, switchMap, take, takeUntil, throwError } from 'rxjs';

import { FormHelper } from '@diktup/frontend/helpers';
import {
  UserType,
  ProjectType,
  BoardCardType,
  ListWithCardsType,
  BoardCardPriorityEnum,
  BoardWithListsAndCardsType,
} from '@sifca-monorepo/terminal-generator';

import { TasksService } from '../tasks.service';
import { ProjectsService } from '../../projects/projects.service';
import { TeamService } from '../../../../system/team/team.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-kanban',
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.scss'],
})
export class TasksKanbanComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  submitted = false;
  cardForm: FormGroup;
  boardForm: FormGroup;
  selctedIndex: number;
  isButtonDisabled = true;
  isLoading: boolean = true;
  isCardButtonDisabled = true;
  selectedCard: BoardCardType;
  breadCrumbItems!: Array<any>;
  selectedList: ListWithCardsType;
  board: BoardWithListsAndCardsType;
  priorities = values(BoardCardPriorityEnum);
  isLast$: Observable<boolean> = this.teamService.isLast$;
  isLoading$: Observable<boolean> = this.teamService.isLoading$;
  team$: Observable<UserType[]> = this.teamService.infiniteUsers$;
  projects$: Observable<ProjectType[]> = this.projectsService.infiniteProjects$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  initialValues: any;
  selectedUsers: UserType[];

  get members() {
    return this.boardForm?.get('members') as FormArray;
  }

  constructor(
    private modalService: NgbModal,
    private teamService: TeamService,
    private formBuilder: FormBuilder,
    public tasksService: TasksService,
    private sharedService: SharedService,
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService,
    public projectsService: ProjectsService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.teamService.infiniteUsers$.pipe(takeUntil(this.unsubscribeAll)).subscribe((infiniteUsers: UserType[]) => {
      if (infiniteUsers && this.selectedCard) {
        this.iterateAssignedUsers(infiniteUsers);
      }
      this.changeDetectorRef.markForCheck();
    });
    this.tasksService.board$.pipe(takeUntil(this.unsubscribeAll)).subscribe((board: BoardWithListsAndCardsType) => {
      this.board = board;
      this.sharedService.isLoading$ = false;
      this.changeDetectorRef.markForCheck();
    });
    this.isLoading = false;
  }

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.COLLABORATION').subscribe((collaboration: string) => {
      this.translate.get('MENUITEMS.TS.KANBAN_BOARD').subscribe((kanbanBoard: string) => {
        this.breadCrumbItems = [{ label: collaboration }, { label: kanbanBoard, active: true }];
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

  openArchiveModal(content: any, card: any) {
    this.selectedCard = card;
    this.modalService.open(content, { centered: true });
  }

  archiveCard() {
    const input: any = {
      archived: true,
    };
    this.tasksService
      .archivedCardList(input, this.selectedCard.id)
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

  openMemberModal(content: any) {
    this.teamService.team$ = null;
    this.teamService.infiniteTeam$ = null;
    this.teamService.page = 0;
    this.selectedUsers = this.board?.members;
    this.boardForm = this.formBuilder.group({
      members: this.formBuilder.array(this.board?.members?.length ? map(this.board?.members, 'id') : []),
    });
    const initValues = this.boardForm?.value;
    this.boardForm?.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val: any): void => {
      this.isButtonDisabled = isEqual(val, initValues);
    });
    this.teamService.getTeam().subscribe();
    this.modalService.open(content, { size: 'md', centered: true });
  }

  isAdded(id: string) {
    const index = this.members.value.indexOf(id);
    if (index > -1) {
      return true;
    }
    return false;
  }

  invite() {
    this.isButtonDisabled = true;
    const input: any = {
      id: this.board.id,
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
        switchMap(() => {
          return this.tasksService.getBoard(this.activatedRoute.snapshot.paramMap.get('id'));
        }),
      )
      .subscribe(() => {
        this.modalService.dismissAll();
      });
  }

  addMember(member: any) {
    const tagFormControl = this.formBuilder.control(member.id);
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

  openListModal(content: any, list: ListWithCardsType) {
    this.selectedList = list;
    this.modalService.open(content, { size: 'md', centered: true });
    this.boardForm = this.formBuilder.group({
      name: [list?.name || '', Validators.required],
    });
    const initValues = this.boardForm?.value;
    this.boardForm?.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val: any): void => {
      this.isButtonDisabled = isEqual(val, initValues);
    });
  }

  save() {
    if (!this.selectedList) {
      this.isButtonDisabled = true;
      const input: any = {
        rank: this.board?.boardLists?.length ? this.board.boardLists[this.board.boardLists.length - 1].rank + 1 : 1,
        board: this.board.id,
        name: this.boardForm.get('name').value,
      };
      this.tasksService
        .createList(input)
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
        id: this.selectedList.id,
        rank: this.board?.boardLists?.length ? this.board.boardLists[this.board.boardLists.length - 1].rank + 1 : 1,
        board: this.board.id,
        name: this.boardForm.get('name').value,
      };
      this.tasksService
        .updateList(input)
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

  openCardModal(content: any, card: BoardCardType, listId: string, index?: number) {
    this.selctedIndex = index;
    this.selectedCard = card;
    this.teamService.team$ = null;
    this.teamService.infiniteUsers$ = null;
    this.teamService.page = 0;
    this.projectsService.pageIndex = 0;
    this.projectsService.infiniteProjects$ = null;
    this.teamService.getTeam().subscribe();
    this.projectsService.getProjectsByTargetWithFilter().subscribe();
    this.modalService.open(content, { size: 'md', centered: true });
    this.cardForm = this.formBuilder.group({
      title: [card?.title || '', Validators.required],
      description: [card?.description || ''],
      dueDate: [card?.dueDate || ''],
      priority: [card?.priority || ''],
      tags: [card?.tags?.length ? card?.tags : []],
      boardList: [listId, [Validators.required]],
      project: [card?.project?.id],
      assignedTo: [card?.assignedTo?.length ? map(card?.assignedTo, 'id') : []],
    });
    this.initialValues = this.cardForm?.value;
    this.cardForm?.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val: any): void => {
      this.isCardButtonDisabled = isEqual(val, this.initialValues);
    });
  }

  saveCard() {
    this.isCardButtonDisabled = true;
    if (!this.selectedCard) {
      const input: any = {
        ...FormHelper.getNonEmptyValues(omit(this.cardForm.value, 'tags', 'assignedTo', 'project')),
        rank: this.board?.boardLists?.length
          ? this.board?.boardLists[this.selctedIndex]?.boardCards[this.board?.boardLists[this.selctedIndex]?.boardCards?.length - 1]?.rank + 1 || 1
          : 1,
        ...(this.cardForm.get('tags').value?.lnegth ? { tags: this.cardForm.get('tags').value } : {}),
        ...(this.cardForm.get('assignedTo').value?.length ? { assignedTo: this.cardForm.get('assignedTo').value } : {}),
        ...(this.cardForm.get('project').value ? { project: this.cardForm.get('project').value } : {}),
      };
      this.tasksService
        .createCard(input)
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
        id: this.selectedCard?.id,
        ...FormHelper.getNonEmptyAndChangedValues(
          omit(this.cardForm.value, 'tags', 'assignedTo'),
          pick(this.selectedCard, 'title', 'description', 'dueDate', 'priority'),
        ),
        ...(isEqual(
          (this.selectedCard.tags?.length ? cloneDeep(this.selectedCard.tags) : []).sort(),
          (this.cardForm.value?.tags?.length ? cloneDeep(this.cardForm.value?.tags) : []).sort(),
        )
          ? {}
          : { tags: this.cardForm.value.tags }),

        ...(isEqual(
          (this.initialValues.assignedTo?.length ? cloneDeep(this.initialValues.assignedTo) : []).sort(),
          (this.cardForm.value?.assignedTo?.length ? cloneDeep(this.cardForm.value.assignedTo) : []).sort(),
        )
          ? {}
          : { assignedTo: this.cardForm.get('assignedTo').value }),
      };
      this.tasksService
        .updateCard(input)
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

  onDragged(item: any, list: any[]) {
    const index = list.indexOf(item);
    list.splice(index, 1);
  }

  removeItem(item: any, list: any[]): void {
    const index = list.indexOf(item);
    list.splice(index, 1);
  }

  onDrop(event: DndDropEvent, filteredList?: any[], i?: number) {
    let rank = event.index === 0 ? 0 : this.board.boardLists[i].boardCards[event.index - 1].rank + 1;
    if (filteredList && event.dropEffect === 'move') {
      let index = event.index;
      if (typeof index === 'undefined') {
        index = this.board.boardLists[i].boardCards.length;
      }
      this.board.boardLists[i].boardCards.splice(index, 0, event.data);
      this.tasksService.updateBoardCardList(event.data.id, this.board.boardLists[i].id, rank).subscribe();
    }
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
