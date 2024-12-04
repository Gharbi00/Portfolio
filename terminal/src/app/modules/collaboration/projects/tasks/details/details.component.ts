import Swal from 'sweetalert2';
import { DOCUMENT, DatePipe, isPlatformBrowser } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, catchError, combineLatest, takeUntil, throwError } from 'rxjs';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { cloneDeep, findIndex, isEqual, map, omit, pick, values } from 'lodash';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';

import { AmazonS3Helper, ConvertorHelper, FormHelper, StorageHelper } from '@diktup/frontend/helpers';
import {
  AccountType,
  BoardCardForListType,
  BoardCardPriorityEnum,
  CommentType,
  GenerateS3SignedUrlGQL,
  TimeTrackType,
  UserType,
} from '@sifca-monorepo/terminal-generator';

import { TasksService } from '../tasks.service';
import { ProjectsService } from '../../projects/projects.service';
import { TeamService } from '../../../../system/team/team.service';
import { CommentService } from '../../../../../shared/services/comment.service';
import { DocumentService } from '../../../../../shared/services/document.service';
import { TimeEntriesService } from '../../../../../shared/services/time-entries.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { FileSystemDirectoryEntry, FileSystemFileEntry, NgxFileDropEntry } from 'ngx-file-drop';
import { AWS_CREDENTIALS } from '../../../../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class TaskDetailsComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  allTime: number;
  cardForm: FormGroup;
  boardForm: FormGroup;
  selectedIndex: number;
  currentUserId: string;
  times: TimeTrackType[];
  trackerForm: FormGroup;
  comments: CommentType[];
  isButtonDisabled = true;
  isMemberLoading: boolean;
  isfileUploading: boolean;
  card: BoardCardForListType;
  selectedMembers: UserType[] = [];
  isTaskButtonDisabled = true;
  isTimeButtonDisabled = true;
  breadCrumbItems!: Array<any>;
  isBoardButtonDisabled = true;
  selectedTracker: TimeTrackType;
  priorities = values(BoardCardPriorityEnum);
  isLast$: Observable<boolean> = this.teamService.isLast$;
  team$: Observable<AccountType[]> = this.teamService.infiniteTeam$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  isAddTaskDisabled = false;
  isAttachmentsTab: boolean;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  public files: NgxFileDropEntry[] = [];

  get tasks() {
    return this.cardForm?.get('tasks') as FormArray;
  }

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private teamService: TeamService,
    private tasksService: TasksService,
    private storageHelper: StorageHelper,
    private sharedService: SharedService,
    private commentService: CommentService,
    private amazonS3Helper: AmazonS3Helper,
    private projectsService: ProjectsService,
    private documentService: DocumentService,
    private convertorHelper: ConvertorHelper,
    private changeDetectorRef: ChangeDetectorRef,
    private timeEntriesService: TimeEntriesService,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.currentUserId = this.storageHelper.getData('currentUserId');
    this.tasksService.card$.pipe(takeUntil(this.unsubscribeAll)).subscribe((card: BoardCardForListType) => {
      this.card = card;
      this.cardForm = this.formBuilder.group({
        task: [''],
        tasks: this.formBuilder.array(
          this.card.tasks?.length
            ? map(this.card.tasks, (task) => {
                return this.formBuilder.group({
                  task: [task?.task],
                  done: [task?.done || false],
                });
              })
            : [],
        ),
      });
      this.cardForm?.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val) => {
        this.isTaskButtonDisabled = val.task === '' ? true : false;
      });
      this.boardForm = this.formBuilder.group({
        tags: [this.card?.tags?.length ? this.card?.tags : []],
        priority: [this.card?.priority || ''],
        description: [this.card?.description || ''],
        dueDate: [this.card?.dueDate || ''],
        title: [this.card?.title || '', Validators.required],
      });
      const initVals = this.boardForm?.value;
      this.boardForm?.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val: any): void => {
        this.isBoardButtonDisabled = isEqual(val, initVals);
      });
      this.selectedMembers = card?.assignedTo || [];
      this.changeDetectorRef.markForCheck();
    });
    this.commentService.comments$.pipe(takeUntil(this.unsubscribeAll)).subscribe((comments: CommentType[]) => {
      this.comments = comments;
      this.changeDetectorRef.markForCheck();
    });
    this.timeEntriesService.times$.pipe(takeUntil(this.unsubscribeAll)).subscribe((times: TimeTrackType[]) => {
      this.times = times;
      this.getTotalDuration();
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
      this.translate.get('MENUITEMS.TS.TASK_DETAILS').subscribe((taskDetails: string) => {
        this.breadCrumbItems = [{ label: collaboration }, { label: taskDetails, active: true }];
      });
    });
  }

  editTask(index: number) {
    this.selectedIndex = index;
    this.cardForm.get('task').patchValue(this.tasks.at(this.selectedIndex).value.task);
  }

  addSubTaskField(): void {
    this.isAddTaskDisabled = true;
    this.selectedIndex = 0;
    this.selectedIndex = this.tasks.value.length;
    const taskFormControl = this.formBuilder.group({
      task: ['', Validators.required],
      done: [false],
    });
    this.tasks?.push(taskFormControl);
    this.changeDetectorRef.markForCheck();
  }

  saveTask() {
    this.tasks.at(this.selectedIndex)?.get('task').patchValue(this.cardForm?.get('task').value);
    this.isTaskButtonDisabled = true;
    const input: any = {
      id: this.card.id,
      tasks: this.tasks.value,
    };
    this.tasksService
      .updateBoardCard(input)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
        this.selectedIndex = -1;
        this.isAddTaskDisabled = false;
        this.modalService.dismissAll();
        this.changeDetectorRef.markForCheck();
      });
  }

  onChangeTags() {
    const input: any = {
      id: this.card.id,
      tags: this.boardForm.get('tags').value,
    };
    this.tasksService
      .updateBoardCard(input)
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

  isCurrentUser(id: string) {
    if (this.currentUserId === id) {
      return true;
    }
    return false;
  }

  openEditModal(content: any) {
    this.modalService.open(content, { size: 'md', centered: true });
  }

  save() {
    this.isBoardButtonDisabled = true;
    const input: any = {
      id: this.card.id,
      ...FormHelper.getNonEmptyAndChangedValues(omit(this.boardForm.value, 'tags'), pick(this.card, ['title', 'priority', 'dueDate'])),
      ...(isEqual(
        (this.card.tags?.length ? cloneDeep(this.card.tags) : []).sort(),
        (this.boardForm.value?.tags?.length ? cloneDeep(this.boardForm.value.tags) : []).sort(),
      )
        ? {}
        : { tags: this.boardForm.value.tags }),
    };
    this.tasksService
      .updateBoardCard(input)
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

  getDuration(dateX: string, dateY: string): string {
    const datePipe1 = new DatePipe('en-US');
    const date1 = datePipe1.transform(dateX, 'yyyy-MM-ddTHH:mm:ss');
    const datePipe2 = new DatePipe('en-US');
    const date2 = datePipe2.transform(dateY, 'yyyy-MM-ddTHH:mm:ss');
    const diff = new Date(date1).getTime() - new Date(date2).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} hrs ${minutes} min`;
  }

  getTotalDuration(): string {
    let totalHours = 0;
    let totalMinutes = 0;
    for (const dateRange of this.times) {
      if (dateRange.end) {
        const duration = this.getDuration(dateRange.end, dateRange.start);
        const hours = duration.split(' ')[0];
        const minutes = duration.split(' ')[2];
        totalHours += Number(hours?.trim());
        totalMinutes += Number(minutes?.trim());
      }
    }
    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes = totalMinutes % 60;
    return `${totalHours} hrs ${totalMinutes} min`;
  }

  openTimeModal(content: any, time: TimeTrackType) {
    this.selectedTracker = time;
    this.modalService.open(content, { size: 'md', centered: true });
    this.trackerForm = this.formBuilder.group({
      title: [time?.title || '', Validators.required],
    });
    const initValues = this.trackerForm?.value;
    this.trackerForm?.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val: any): void => {
      this.isTimeButtonDisabled = isEqual(val, initValues);
    });
  }

  saveTracker() {
    if (!this.selectedTracker) {
      const currentDate = new Date();
      const input: any = {
        user: this.currentUserId,
        start: currentDate,
        title: this.trackerForm.get('title').value,
        holder: {
          card: this.card.id,
        },
      };
      this.timeEntriesService
        .createTimeTrack(input)
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
        user: this.currentUserId,
        title: this.trackerForm.get('title').value,
        holder: {
          card: this.card.id,
        },
      };
      this.timeEntriesService
        .updateTimeTrack(input, this.selectedTracker.id)
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

  checkEnd() {
    if (!this.times?.length || this.times[0]?.end) {
      return true;
    }
    return false;
  }

  stop() {
    const currentDate = new Date();
    const input: any = {
      user: this.currentUserId,
      end: currentDate,
      holder: {
        card: this.card.id,
      },
    };
    this.timeEntriesService
      .updateTimeTrack(input, this.times[0].id)
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

  onCheckTask(isChecked: boolean, index: number) {
    if (isChecked) {
      this.tasks.at(index).get('done').patchValue(true);
    } else {
      this.tasks.at(index).get('done').patchValue(false);
    }
    this.saveTask();
  }
  onCheckTask1(isChecked: boolean, index: number) {
    if (isChecked) {
      this.tasks.at(index).get('done').patchValue(true);
    } else {
      this.tasks.at(index).get('done').patchValue(false);
    }
    const input: any = {
      id: this.card.id,
      tasks: this.tasks.value,
    };
    this.tasksService
      .updateBoardCard(input)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
        this.selectedIndex = -1;
        this.isAddTaskDisabled = false;
        this.modalService.dismissAll();
        this.changeDetectorRef.markForCheck();
      });
  }

  openDeleteTask(content: any) {
    this.modalService.open(content, { centered: true });
  }

  deleteTask(): void {
    const tasksArray = this.tasks as FormArray;
    tasksArray.removeAt(this.selectedIndex);
    this.saveTask();
    this.changeDetectorRef.markForCheck();
  }

  openMemberModal(content: any) {
    this.teamService.page = 0;
    this.teamService.team$ = null;
    this.teamService.infiniteTeam$ = null;
    this.isMemberLoading = true;
    this.teamService.getTeam().subscribe((res) => {
      if (res) {
        this.isMemberLoading = false;
        this.changeDetectorRef.markForCheck();
      }
    });
    this.modalService.open(content, { size: 'md', centered: true });
  }

  loadMoreMembers() {
    this.teamService.page += 1;
    this.teamService.getTeam().subscribe();
    this.changeDetectorRef.markForCheck();
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
      id: this.card.id,
      assignedTo: map(this.selectedMembers, 'id'),
    };
    this.tasksService
      .updateBoardCard(input)
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

  addMember(member: UserType) {
    this.isButtonDisabled = false;
    this.selectedMembers.push(member);
    this.changeDetectorRef.markForCheck();
  }

  removeUser(id: string) {
    const index1 = findIndex(this.selectedMembers, (o) => o.id === id);
    this.selectedMembers.splice(index1, 1);
    const input: any = {
      id: this.card.id,
      assignedTo: map(this.selectedMembers, 'id'),
    };
    this.tasksService
      .updateBoardCard(input)
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

  removeMember(id: string) {
    this.isButtonDisabled = false;
    const index = findIndex(this.selectedMembers, (o) => o.id === id);
    this.selectedMembers.splice(index, 1);
    this.changeDetectorRef.markForCheck();
  }

  isAdded(id: string) {
    const index = findIndex(this.selectedMembers, (o) => o.id === id);
    if (index > -1) {
      return true;
    }
    return false;
  }

  // TODO: delete
  addedFile(isAttachmentsTab: boolean) {
    this.isAttachmentsTab = isAttachmentsTab;
    const fileInput = this.document.createElement('input');
    fileInput.type = 'file';
    fileInput.name = 'fileUpload';
    fileInput.id = 'fileUpload';
    fileInput.onchange = async () => {
      const file = fileInput.files[0];
      if (file?.size > 2000000) {
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
        return;
      }
      const posId = this.storageHelper.getData('posId');
      const timestamp = Date.now();
      const fileName = `${posId}_${timestamp}_${file.name}`;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        combineLatest([this.generateS3SignedUrlGQL.fetch({ fileName, fileType: file.type }), this.projectsService.findContentTypeByType(file.type)])
          .pipe(
            catchError((error) => {
              this.modalError();
              this.isfileUploading = false;
              this.changeDetectorRef.markForCheck();
              return throwError(() => new Error(error));
            }),
          )
          .subscribe(async ([res, result]) => {
            const picture = await this.amazonS3Helper.uploadS3AwsWithSignature(
              res.data.generateS3SignedUrl.message,
              file,
              fileName,
              AWS_CREDENTIALS.storage,
              AWS_CREDENTIALS.region,
            );
            this.projectsService
              .createDocument({
                owner: this.currentUserId,
                name: file.name,
                content: {
                  type: result.id,
                  url: picture.baseUrl + '/' + picture.path,
                },
                size: file.size,
              })
              .subscribe((response: any) => {
                const input: any = {
                  id: this.card.id,
                  attachments: [response.id, ...map(this.card.attachments, 'id')],
                };
                this.tasksService
                  .updateBoardCard(input)
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
                this.isfileUploading = false;
                this.changeDetectorRef.markForCheck();
              });
          });
      };
    };
    fileInput.click();
  }

  public dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const droppedFile of files) {
      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          // Here you can access the real file

          /**
          // You could upload it like this:
          const formData = new FormData()
          formData.append('logo', file, relativePath)

          // Headers
          const headers = new HttpHeaders({
            'security-token': 'mytoken'
          })

          this.http.post('https://mybackend.com/api/upload/sanitize-and-save-logo', formData, { headers: headers, responseType: 'blob' })
          .subscribe(data => {
            // Sanitized logo returned from backend
          })
          **/
        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
      }
    }
  }

  public fileOver(event) {
  }

  public fileLeave(event) {
  }

  removeDocument(id: string): void {
    const attachments = this.card.attachments;
    const index = attachments.findIndex((item) => item.id === id);
    attachments.splice(index, 1);
    const input: any = {
      id: this.card.id,
      attachments: map(this.card.attachments, 'id'),
    };
    this.tasksService
      .updateBoardCard(input)
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

  downloadDocument(id: string) {
    if (isPlatformBrowser(this.platformId)) {
      this.documentService.findDocumentById(id).subscribe((res) => {
        const blob = this.convertorHelper.b64toBlob(res.content.base64, res.content.type.type);
        const a = this.document.createElement('a');
        this.document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = String(res.name);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      });
    }
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
