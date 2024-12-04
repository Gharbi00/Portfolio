import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { cloneDeep, isEqual, omit, pick, values } from 'lodash';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap, takeUntil, throwError } from 'rxjs';

import { FormHelper } from '@diktup/frontend/helpers';
import { GenericTaskType, TaskPriorityEnum, TaskSectionWithTasksType } from '@sifca-monorepo/terminal-generator';

import { TodoService } from '../todo.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-todo-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class TodoListComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChild('dataTable') table!: MatTable<GenericTaskType>;

  selectedIndex = 0;
  taskForm: FormGroup;
  sectionForm: FormGroup;
  isButtonDisabled = true;
  selectedTask: GenericTaskType;
  isSectionButtonDisabled = true;
  sections: TaskSectionWithTasksType[];
  priorities = values(TaskPriorityEnum);
  selectedSection: TaskSectionWithTasksType;
  dataSource: MatTableDataSource<GenericTaskType>;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  displayedColumns: string[] = ['task', 'dueDate', 'status', 'priority', 'action'];
  isLoading: boolean;
  navigating$: Observable<boolean> = this.sharedService.navigating$;

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    public todoService: TodoService,
    private sharedService: SharedService,
    private changeDetectorRef: ChangeDetectorRef,
    private translate: TranslateService,
  ) {
    this.todoService.taskSections$.pipe(takeUntil(this.unsubscribeAll)).subscribe((taskSections: TaskSectionWithTasksType[]) => {
      this.sections = taskSections;
      this.selectedSection = this.sections[this.selectedIndex];
      this.dataSource = new MatTableDataSource(this.sections[this.selectedIndex]?.tasks);
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
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.isLoading = true;
          this.changeDetectorRef.markForCheck();
          this.todoService.searchString = searchValues.searchString;
          return this.todoService.getSections();
        }),
      )
      .subscribe(() => {
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      });
  }

  taskDropped(event: CdkDragDrop<GenericTaskType[]>): void {
    const item = this.sections[this.selectedIndex].tasks[event.previousIndex];
    let rank = event.currentIndex === 0 ? 1 : this.sections[this.selectedIndex].tasks[event.currentIndex].rank;
    moveItemInArray(this.sections[this.selectedIndex].tasks, event.previousIndex, event.currentIndex);
    this.todoService
      .reorderTask(item.id, rank)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  sectionDropped(event: CdkDragDrop<GenericTaskType[]>): void {
    const item = this.sections[event.previousIndex];
    let rank = event.currentIndex === 0 ? 1 : this.sections[event.currentIndex].rank;
    moveItemInArray(this.sections, event.previousIndex, event.currentIndex);
    this.todoService
      .reorderTaskSections(item.id, rank)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  switchTasks(field: string) {
    if (this.selectedIndex < this.sections?.length - 1 && field === '+') {
      this.selectedIndex += 1;
    } else if (this.selectedIndex > 0 && field === '-') {
      this.selectedIndex -= 1;
    }
    this.selectedSection = this.sections[this.selectedIndex];
    this.dataSource = new MatTableDataSource(this.sections[this.selectedIndex].tasks);
  }

  openDeleteTask(content: any, task: GenericTaskType) {
    this.selectedTask = task;
    this.modalService.open(content, { centered: true });
  }

  deleteTask() {
    this.todoService
      .deleteTask(this.selectedTask.id)
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

  openDeleteSection(content: any, section: TaskSectionWithTasksType) {
    this.selectedSection = section;
    this.modalService.open(content, { centered: true });
  }

  deleteSection() {
    this.todoService
      .deleteTaskSection(this.selectedSection.id)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
        this.selectedIndex = 0;
        this.modalService.dismissAll();
      });
  }

  openTaskModal(content: any, task: GenericTaskType) {
    this.selectedTask = task;
    this.modalService.open(content, { size: 'md', centered: true });
    this.taskForm = this.formBuilder.group({
      title: [task?.title || '', Validators.required],
      description: [task?.description || ''],
      dueDate: [task?.dueDate || ''],
      priority: [task?.priority || '', Validators.required],
      tags: [task?.tags?.length ? task?.tags : []],
      archived: [task?.archived || ''],
      completed: [task?.completed || ''],
    });
    const initValues = this.taskForm?.value;
    this.taskForm?.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val: any): void => {
      this.isButtonDisabled = isEqual(val, initValues);
    });
  }

  openSectionModal(content: any, section: TaskSectionWithTasksType) {
    this.selectedSection = section;
    this.modalService.open(content, { size: 'md', centered: true });
    this.sectionForm = this.formBuilder.group({
      title: [section?.title || '', Validators.required],
      description: [section?.description || ''],
      dueDate: [section?.dueDate || ''],
      priority: [section?.priority || '', Validators.required],
      tags: [section?.tags?.length ? section?.tags : []],
      archived: [section?.archived || ''],
      completed: [section?.completed || ''],
    });
    const initValues = this.sectionForm?.value;
    this.sectionForm?.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val: any): void => {
      this.isSectionButtonDisabled = isEqual(val, initValues);
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

  saveSection() {
    this.isButtonDisabled = true;
    if (!this.selectedSection) {
      const input: any = {
        rank: this.sections.length ? this.sections[this.sections.length - 1]?.rank + 1 : 1,
        ...FormHelper.getNonEmptyValues(omit(this.sectionForm.value, 'tags', 'completed', 'archived', 'rank')),
        ...(this.sectionForm.get('tags').value?.lnegth ? { tags: this.sectionForm.get('tags').value } : {}),
      };
      this.todoService
        .createTaskSection(input)
        .pipe(
          catchError((error) => {
            if (error) {
              this.modalService.dismissAll();
              this.modalError();
              this.changeDetectorRef.markForCheck();
              return of(null);
            }
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.modalService.dismissAll();
            this.position();
            this.changeDetectorRef.markForCheck();
          }
        });
    } else {
      const input: any = {
        id: this.selectedSection?.id,
        ...FormHelper.getNonEmptyAndChangedValues(
          omit(this.sectionForm.value, 'tags'),
          pick(this.selectedSection, 'title', 'description', 'dueDate', 'priority', 'completed'),
        ),
        ...(isEqual(
          (this.selectedSection.tags?.length ? cloneDeep(this.selectedSection.tags) : []).sort(),
          (this.sectionForm.value?.tags?.length ? cloneDeep(this.sectionForm.value?.tags) : []).sort(),
        )
          ? {}
          : { tags: this.sectionForm.value.tags }),
      };
      this.todoService
        .updateTaskSection(input)
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

  saveTask() {
    this.isButtonDisabled = true;
    if (!this.selectedTask) {
      const input: any = {
        taskSection: this.selectedSection.id,
        rank: this.sections[this.selectedIndex]?.tasks.length
          ? this.sections[this.selectedIndex]?.tasks[this.sections[this.selectedIndex]?.tasks?.length - 1].rank + 1
          : 1,
        ...FormHelper.getNonEmptyValues(omit(this.taskForm.value, 'tags', 'completed', 'archived', 'rank')),
        ...(this.taskForm.get('tags').value?.lnegth ? { tags: this.taskForm.get('tags').value } : {}),
      };
      this.todoService
        .createTask(input)
        .pipe(
          catchError((error) => {
            this.modalService.dismissAll();
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return throwError(() => new Error(error));
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.modalService.dismissAll();
            this.position();
            this.changeDetectorRef.markForCheck();
          }
        });
    } else {
      const input: any = {
        id: this.selectedTask?.id,
        ...FormHelper.getNonEmptyAndChangedValues(
          omit(this.taskForm.value, 'tags'),
          pick(this.selectedTask, 'title', 'description', 'dueDate', 'priority', 'completed'),
        ),
        ...(isEqual(
          (this.selectedTask.tags?.length ? cloneDeep(this.selectedTask.tags) : []).sort(),
          (this.taskForm.value?.tags?.length ? cloneDeep(this.taskForm.value?.tags) : []).sort(),
        )
          ? {}
          : { tags: this.taskForm.value.tags }),
      };
      this.todoService
        .updateTask(input)
        .pipe(
          catchError((error) => {
            this.modalService.dismissAll();
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return throwError(() => new Error(error));
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.modalService.dismissAll();
            this.position();
            this.changeDetectorRef.markForCheck();
          }
        });
    }
  }

  checkTask(e: any, task: GenericTaskType) {
    this.selectedTask = task;
    const checkboxes: any = e.target.closest('tr').querySelector('#todo' + task.id);
    const input: any = {
      id: this.selectedTask.id,
      completed: checkboxes.checked,
    };
    this.todoService
      .updateTask(input)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
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

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
