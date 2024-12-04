import { Injectable } from '@angular/core';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';

import {
  TaskType,
  TaskSectionType,
  TaskSectionWithTasksType,
  GetTaskGQL,
  CreateTaskGQL,
  DeleteTaskGQL,
  UpdateTaskGQL,
  ReorderTaskGQL,
  CreateTaskSectionGQL,
  DeleteTaskSectionGQL,
  UpdateTaskSectionGQL,
  ReorderTaskSectionsGQL,
  GetTaskSectionsWithTasksGQL,
} from '@sifca-monorepo/terminal-generator';

import { CreateTaskSectionInterface } from '@sifca-monorepo/api-interfaces';
import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private tags: BehaviorSubject<any[]> = new BehaviorSubject(null);
  private task: BehaviorSubject<TaskType> = new BehaviorSubject(null);
  private allTasks: BehaviorSubject<TaskType[]> = new BehaviorSubject(null);
  private taskSection: BehaviorSubject<TaskSectionWithTasksType> = new BehaviorSubject(null);
  private taskSections: BehaviorSubject<TaskSectionWithTasksType[]> = new BehaviorSubject(null);
  private tasksBySection: BehaviorSubject<TaskType[]> = new BehaviorSubject(null);

  filterLimit = 10;
  pageIndex = 0;
  searchString = '';

  get taskSections$(): Observable<TaskSectionWithTasksType[]> {
    return this.taskSections.asObservable();
  }

  get taskSection$(): Observable<TaskSectionWithTasksType> {
    return this.taskSection.asObservable();
  }
  get tasksBySection$(): Observable<TaskType[]> {
    return this.tasksBySection.asObservable();
  }

  get tags$(): Observable<any[]> {
    return this.tags.asObservable();
  }

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  get task$(): Observable<TaskType> {
    return this.task.asObservable();
  }

  get allTasks$(): Observable<TaskType[]> {
    return this.allTasks.asObservable();
  }

  constructor(
    private getTaskGQL: GetTaskGQL,
    private storageHelper: StorageHelper,
    private createTaskGQL: CreateTaskGQL,
    private deleteTaskGQL: DeleteTaskGQL,
    private updateTaskGQL: UpdateTaskGQL,
    private reorderTaskGQL: ReorderTaskGQL,
    // private reorderTaskGQL: getTaskSectionsByTargetPaginatedgql,
    private createTaskSectionGQL: CreateTaskSectionGQL,
    private updateTaskSectionGQL: UpdateTaskSectionGQL,
    private deleteTaskSectionGQL: DeleteTaskSectionGQL,
    private reorderTaskSectionsGQL: ReorderTaskSectionsGQL,
    private getTaskSectionsWithTasksGQL: GetTaskSectionsWithTasksGQL,
  ) {}

  clearSelectedSection(): void {
    this.taskSection.next(null);
  }

  clearSelectedTask(): void {
    this.task.next(null);
  }

  getSections(): Observable<TaskSectionWithTasksType[]> {
    return this.getTaskSectionsWithTasksGQL.fetch({ target: { pos: this.storageHelper.getData('posId') }, searchString: this.searchString }).pipe(
      map(({ data }) => {
        this.taskSections.next(data.getTaskSectionsWithTasks as any);
        return data.getTaskSectionsWithTasks as any;
      }),
    );
  }

  getSectionById(id: string): Observable<TaskSectionWithTasksType> {
    return this.taskSections$.pipe(
      take(1),
      map((sections) => {
        const section = sections.find((s) => s.id === id) || null;
        this.taskSection.next(section);
        return section;
      }),
      switchMap((section) => {
        if (!section) {
          return throwError(() => new Error('Could not found section with id of ' + id + '!'));
        }
        return of(section);
      }),
    );
  }

  getTaskById(id: string): Observable<TaskType> {
    return this.getTaskGQL.fetch({ id }).pipe(
      map(({ data }) => {
        this.task.next(data.getTask as any);
        return data.getTask as any;
      }),
    );
  }

  createTask(input: any): Observable<TaskType> {
    return this.createTaskGQL
      .mutate({
        title: input.title,
        priority: input.priority,
        rank: input.rank,
        taskSection: input.taskSection,
        description: input.description,
        dueDate: input.dueDate,
        tags: input.tags,
        completed: input.completed,
        archived: input.archived,
      })
      .pipe(
        tap(({ data }) => {
          const sections = this.taskSections.value;
          const index = sections.findIndex((s) => s.id === input.taskSection);
          sections[index].tasks = (sections[index].tasks?.length ? [...sections[index].tasks, data.createTask] : [data.createTask]) as any;
          this.taskSections.next(sections);
          this.task.next(data.createTask as any);
        }),
        map(({ data }) => data.createTask as any),
      );
  }

  createTaskSection(input: CreateTaskSectionInterface): Observable<any> {
    return this.createTaskSectionGQL
      .mutate({
        title: input.title,
        priority: input.priority,
        rank: input.rank,
        description: input.description,
        dueDate: input.dueDate,
        tags: input.tags,
        completed: input.completed,
        archived: input.archived,
        target: { pos: this.storageHelper.getData('posId') },
      })
      .pipe(
        map(({ data }) => {
          const sections = this.taskSections.value;
          const newSection: any = { ...data.createTaskSection, tasks: [] };
          this.taskSections.next([...sections, newSection]);
          this.taskSection.next(newSection);
          return newSection;
        }),
      );
  }

  updateTask(input: any): Observable<TaskType> {
    return this.updateTaskGQL
      .mutate({
        id: input.id,
        title: input.title,
        priority: input.priority,
        rank: input.rank,
        taskSection: input.taskSection,
        description: input.description,
        dueDate: input.dueDate,
        tags: input.tags,
        completed: input.completed,
        archived: input.archived,
      })
      .pipe(
        tap(({ data }) => {
          this.getSections().subscribe();
          this.task.next(data.updateTask as any);
          const sections = this.taskSections.value;
          sections.forEach((section) => {
            section.tasks.forEach((taskItem, index, array) => {
              if (taskItem.id === input.id) {
                array[index] = data.updateTask as any;
              }
            });
          });
          this.taskSections.next(sections);
        }),
        map(({ data }) => data.updateTask as any),
      );
  }

  updateTaskSection(input: any): Observable<TaskSectionType> {
    return this.updateTaskSectionGQL
      .mutate({
        id: input.id,
        title: input.title,
        priority: input.priority,
        rank: input.rank,
        description: input.description,
        dueDate: input.dueDate,
        tags: input.tags,
        completed: input.completed,
        archived: input.archived,
      })
      .pipe(
        tap(({ data }) => {
          const sections = this.taskSections.value;
          const index = sections.findIndex((s) => s.id === input.id);
          sections[index] = { ...data.updateTaskSection, tasks: sections[index].tasks } as any;
          this.taskSections.next(sections);
          this.taskSection.next(sections[index]);
        }),
        map(({ data }) => data.updateTaskSection as any),
      );
  }

  deleteTask(id: string): Observable<boolean> {
    return this.allTasks$.pipe(
      take(1),
      switchMap((allTasks) =>
        this.deleteTaskGQL.mutate({ id }).pipe(
          map(({ data }) => {
            if (data.deleteTask.success) {
              const sections = this.taskSections.value;
              sections.forEach((section) => {
                section.tasks.forEach((taskItem, index, array) => {
                  if (taskItem.id === id) {
                    array.splice(index, 1);
                  }
                });
              });
              this.taskSections.next(sections);
            }
            return data.deleteTask.success;
          }),
        ),
      ),
    );
  }

  deleteTaskSection(id: string): Observable<boolean> {
    return this.taskSections$.pipe(
      take(1),
      switchMap((sections) =>
        this.deleteTaskSectionGQL.mutate({ id }).pipe(
          map(({ data }) => {
            if (data.deleteTaskSection.success) {
              const index = sections.findIndex((item) => item.id === id);
              sections.splice(index, 1);
              this.taskSections.next(sections);
            }
            return data.deleteTaskSection.success;
          }),
        ),
      ),
    );
  }

  reorderTask(id: string, rank: number): Observable<any> {
    return this.reorderTaskGQL.mutate({ id, rank }).pipe(
      map(({ data }) => {
        if (data.reorderTask) {
          return data.reorderTask;
        }
      }),
      switchMap(() => {
        return this.getSections();
      }),
    );
  }

  reorderTaskSections(id: string, rank: number): Observable<any> {
    return this.reorderTaskSectionsGQL.mutate({ id, rank }).pipe(
      map(({ data }) => {
        if (data.reorderTaskSections) {
          return data.reorderTaskSections;
        }
      }),
      switchMap(() => {
        return this.getSections();
      }),
    );
  }
}
