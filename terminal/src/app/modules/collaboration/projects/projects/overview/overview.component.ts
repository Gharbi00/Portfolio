import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { findIndex, forEach, isEqual, map, omit } from 'lodash';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject, catchError, combineLatest, debounceTime, distinctUntilChanged, of, switchMap, takeUntil, throwError } from 'rxjs';
import { ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, QueryList, ViewChild, ViewChildren } from '@angular/core';

import { AmazonS3Helper, ConvertorHelper, FormHelper, StorageHelper } from '@diktup/frontend/helpers';
import { AccountType, CommentType, GenerateS3SignedUrlGQL, ProjectRoleEnum, ProjectType, UserType } from '@sifca-monorepo/terminal-generator';

import { ProjectsService } from '../projects.service';
import { TeamService } from '../../../../system/team/team.service';
import { NgbdTeamSortableHeader } from './overview-sortable.directive';
import { SharedService } from '../../../../../shared/services/shared.service';
import { CommentService } from '../../../../../shared/services/comment.service';
import { DocumentService } from '../../../../../shared/services/document.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { FileSystemDirectoryEntry, FileSystemFileEntry, NgxFileDropEntry } from 'ngx-file-drop';
import { AWS_CREDENTIALS } from '../../../../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class ProjectOverviewComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  @ViewChildren(NgbdTeamSortableHeader) headers!: QueryList<NgbdTeamSortableHeader>;

  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  limit = 6;
  isLast: boolean;
  isLoaded = false;
  replies: any[] = [];
  team: AccountType[];
  project: ProjectType;
  selectedItem: string;
  currentUserId: string;
  selectedIndex: number;
  commentForm: FormGroup;
  projectForm: FormGroup;
  comments: CommentType[];
  isButtonDisabled = true;
  uploadingFiles: boolean;
  isfileUploading = false;
  isMemberLoading: boolean;
  selectedCommentId: string;
  selectedProject: ProjectType;
  selectedLead: UserType[] = [];
  selectedMembers: UserType[] = [];
  public files: NgxFileDropEntry[] = [];
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });

  get members() {
    return this.projectForm?.get('members') as FormArray;
  }
  get resources() {
    return this.projectForm?.get('resources') as FormArray;
  }
  get attachments() {
    return this.projectForm?.get('attachments') as FormArray;
  }

  constructor(
    private modalService: NgbModal,
    private teamService: TeamService,
    private formBuilder: FormBuilder,
    private storageHelper: StorageHelper,
    private sharedService: SharedService,
    private translate: TranslateService,
    private amazonS3Helper: AmazonS3Helper,
    private commentService: CommentService,
    public documentService: DocumentService,
    private projectsService: ProjectsService,
    private convertorHelper: ConvertorHelper,
    private changeDetectorRef: ChangeDetectorRef,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    // this.commentService.comments$.pipe(takeUntil(this.unsubscribeAll)).subscribe((comments: CommentType[]) => {
    //   this.comments = comments;
    //   this.changeDetectorRef.markForCheck();
    // });
    this.teamService.isLast$.pipe(takeUntil(this.unsubscribeAll)).subscribe((isLast: boolean) => {
      this.isLast = isLast;
      this.changeDetectorRef.markForCheck();
    });
    this.teamService.infiniteTeam$.pipe(takeUntil(this.unsubscribeAll)).subscribe((team: AccountType[]) => {
      if (team) {
        this.team = team;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  ngOnInit(): void {
    this.currentUserId = this.storageHelper.getData('currentUserId');
    this.projectsService.project$.pipe(takeUntil(this.unsubscribeAll)).subscribe((project: ProjectType) => {
      this.project = project;
      this.commentForm = this.formBuilder.group({
        user: [this.currentUserId],
        comment: ['', Validators.required],
        reply: [''],
        attachments: [[]],
        holder: this.formBuilder.group({
          project: [this.project?.id],
        }),
      });
      this.projectForm = this.formBuilder.group({
        tags: [project?.tags?.length ? project?.tags : []],
        attachments: this.formBuilder.array(project?.attachments?.length ? project?.attachments : []),
        resources: this.formBuilder.array(project?.resources?.length ? project?.resources : []),
        members: this.formBuilder.array(
          project?.members?.length
            ? map(project?.members, (m) => {
                return this.formBuilder.group({
                  member: m.member?.id,
                  role: m.role,
                });
              })
            : [],
        ),
      });
      const initValues = this.projectForm?.value;
      this.projectForm?.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val: any): void => {
        this.isButtonDisabled = isEqual(val, initValues);
        this.changeDetectorRef.markForCheck();
      });
      this.selectedLead = [];
      this.selectedMembers = [];
      forEach(project?.members, (member) => {
        if (member?.role === 'LEAD') {
          this.selectedLead.push(member?.member);
        } else if (member?.role === 'MEMBER') {
          this.selectedMembers.push(member?.member);
        }
      });
      this.changeDetectorRef.markForCheck();
    });
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.isMemberLoading = true;
          this.team = null;
          this.changeDetectorRef.markForCheck();
          this.teamService.page = 0;
          this.teamService.searchString = searchValues.searchString;
          return this.teamService.searchAccount();
        }),
      )
      .subscribe(() => {
        this.isMemberLoading = false;
        this.changeDetectorRef.markForCheck();
      });
  }

  onChangeTags() {
    const input: any = {
      id: this.project.id,
      tags: this.projectForm.get('tags').value,
    };
    this.projectsService
      .updateProject(input)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.uploadingFiles = false;
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  uploadDocument() {
    const fileInput = this.document.createElement('input');
    fileInput.type = 'file';
    fileInput.name = 'fileUpload';
    fileInput.id = 'fileUpload';
    fileInput.onchange = async () => {
      const file = fileInput.files[0];
      this.changeDetectorRef.markForCheck();
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const posId = this.storageHelper.getData('posId');
        const timestamp = Date.now();
        const fileName = `${posId}_${timestamp}_${file.name}`;
        combineLatest([this.generateS3SignedUrlGQL.fetch({ fileName, fileType: file.type }), this.projectsService.findContentTypeByType(file.type)])
          .pipe(
            catchError((error) => {
              this.modalError();
              this.uploadingFiles = false;
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
                  id: this.project.id,
                  attachments: [response.id, ...map(this.project.attachments, 'id')],
                };
                this.projectsService
                  .updateProject(input)
                  .pipe(
                    catchError(() => {
                      this.modalError();
                      this.uploadingFiles = false;
                      this.changeDetectorRef.markForCheck();
                      return of(null);
                    }),
                  )
                  .subscribe(() => {
                    this.uploadingFiles = false;
                    this.changeDetectorRef.markForCheck();
                  });
              });
          });
      };
    };
    fileInput.click();
  }

  // TODO: to delete
  addedFile(filed: string) {
    const fileInput = this.document.createElement('input');
    fileInput.type = 'file';
    fileInput.name = 'fileUpload';
    fileInput.id = 'fileUpload';
    fileInput.onchange = async () => {
      if (filed === 'resources') {
        if (!this.uploadingFiles) {
          this.uploadingFiles = true;
        }
      } else {
        if (!this.isfileUploading) {
          this.isfileUploading = true;
        }
      }
      let input: any;
      const file = fileInput.files[0];
      if (file?.size > 100000000) {
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
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.projectsService
          .findContentTypeByType(file.type)
          .pipe(
            catchError((error) => {
              this.modalError();
              this.uploadingFiles = false;
              this.changeDetectorRef.markForCheck();
              return throwError(() => new Error(error));
            }),
          )
          .subscribe(async (res) => {
            const posId = this.storageHelper.getData('posId');
            const timestamp = Date.now();
            const fileName = `${posId}_${timestamp}_${file.name}`;
            combineLatest([
              this.generateS3SignedUrlGQL.fetch({ fileName, fileType: file.type }),
              this.projectsService.findContentTypeByType(file.type),
            ])
              .pipe(
                catchError((error) => {
                  this.modalError();
                  this.uploadingFiles = false;
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
                    if (filed === 'resources') {
                      input = {
                        id: this.project.id,
                        resources: [...map(this.project.resources, 'id'), response.id],
                      };
                    } else {
                      input = {
                        id: this.project.id,
                        attachments: [...map(this.project.attachments, 'id'), response.id],
                      };
                    }
                    this.projectsService
                      .updateProject(input)
                      .pipe(
                        catchError((error) => {
                          this.modalError();
                          this.uploadingFiles = false;
                          this.isfileUploading = false;
                          this.changeDetectorRef.markForCheck();
                          return throwError(() => new Error(error));
                        }),
                      )
                      .subscribe(() => {
                        this.uploadingFiles = false;
                        this.isfileUploading = false;
                        this.changeDetectorRef.markForCheck();
                      });
                    this.changeDetectorRef.markForCheck();
                  });
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

  removeDocument(id: string, field: string): void {
    if (field === 'attachment') {
      const attachments = this.attachments.value;
      const index = attachments.findIndex((item) => item.id === id);
      this.attachments.removeAt(index);
    } else {
      const resources = this.resources.value;
      const index = resources.findIndex((item) => item.id === id);
      this.resources.removeAt(index);
    }
    const input: any = {
      id: this.project.id,
      ...(field === 'attachment' ? { attachments: map(this.attachments.value, 'id') } : { resources: map(this.resources.value, 'id') }),
    };
    this.projectsService
      .updateProject(input)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe();
    this.changeDetectorRef.markForCheck();
  }

  openMemberModal(content: any, item: string) {
    this.selectedProject = this.project;
    this.selectedMembers = map(this.project?.members, 'member');
    this.teamService.page = 0;
    this.teamService.team$ = null;
    this.teamService.infiniteTeam$ = null;
    this.team = null;
    this.selectedItem = item;
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
    if (!this.isLast) {
      this.teamService.page += 1;
      this.teamService.getTeam().subscribe();
    }
  }

  isTeamMemberAdded(id: string) {
    const index = findIndex(this.selectedMembers, (o) => o.id === id);
    if (index > -1) {
      return true;
    }
    return false;
  }

  addTeamMember(member: UserType) {
    this.isButtonDisabled = false;
    this.selectedMembers.push(member);
    this.changeDetectorRef.markForCheck();
  }

  isAdded(id: string) {
    if (this.selectedItem === 'member') {
      const index = findIndex(this.selectedMembers, (o) => o.id === id);
      if (index > -1) {
        return true;
      }
      return false;
    } else if (this.selectedItem === 'lead') {
      const index = findIndex(this.selectedLead, (o) => o.id === id);
      if (index > -1) {
        return true;
      }
      return false;
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

  inviteTeam() {
    this.isButtonDisabled = true;
    const input: any = {
      id: this.selectedProject.id,
      members: map(this.selectedMembers, (member: any) => ({
        member: member.id,
        role: 'MEMBER',
      })),
    };
    this.projectsService
      .updateProject(input)
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

  invite() {
    this.isButtonDisabled = true;
    const input: any = {
      id: this.project.id,
      members: this.members.value,
    };
    this.projectsService
      .updateProject(input)
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
    if (this.selectedItem === 'member') {
      const memberFormControl = this.formBuilder.group({
        member: [member?.user?.id],
        role: [ProjectRoleEnum.MEMBER],
      });
      this.members?.push(memberFormControl);
      this.selectedMembers.push(member?.user);
    } else {
      const memberFormControl = this.formBuilder.group({
        member: [member?.user?.id],
        role: [ProjectRoleEnum.LEAD],
      });
      this.members?.push(memberFormControl);
      this.selectedLead.push(member?.user);
    }
    this.changeDetectorRef.markForCheck();
  }

  removeUser(id: string, field?: string) {
    field = field === 'MEMBER' ? 'member' : 'lead';
    if (field === 'member') {
      const index = findIndex(this.members.value, { member: id, role: 'MEMBER' });
      this.members.removeAt(index);
      const index1 = findIndex(this.selectedMembers, (o) => o.id === id);
      this.selectedMembers.splice(index1, 1);
    } else {
      const index = findIndex(this.members.value, { member: id, role: 'LEAD' });
      this.members.removeAt(index);
      const index1 = findIndex(this.selectedLead, (o) => o.id === id);
      this.selectedLead.splice(index1, 1);
    }
    const input: any = {
      id: this.project.id,
      members: this.members.value,
    };
    this.projectsService
      .updateProject(input)
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

  removeMember(id: string, field?: string) {
    const index = findIndex(this.members.value, { member: id });
    this.members.removeAt(index);
    if (field) {
      this.selectedItem = field;
    }
    if (this.selectedItem === 'member') {
      const index1 = findIndex(this.selectedMembers, (o) => o.id === id);
      this.selectedMembers.splice(index1, 1);
    } else {
      const index1 = findIndex(this.selectedLead, (o) => o.id === id);
      this.selectedLead.splice(index1, 1);
    }
    this.changeDetectorRef.markForCheck();
  }

  loadMoreReplies(id: string, index: number) {
    this.commentService.pages[id] = {
      pageLimit: this.commentService.pages[id]?.pageLimit || 5,
      pageIndex: this.commentService.pages[id]?.pageIndex >= 0 ? this.commentService.pages[id]?.pageIndex + 1 : 0,
    };
    this.commentService.getCommentsReplies(id).subscribe(() => {
      this.isLoaded = true;
      this.changeDetectorRef.markForCheck();
    });
  }

  createComment() {
    const input: any = {
      ...(this.commentForm.get('attachments')?.value.length ? { attachments: this.commentForm.value.attachments } : {}),
      ...FormHelper.getNonEmptyValues(omit(this.commentForm.value, 'attachments')),
    };
    this.commentService.createComment(input).subscribe((res) => {
      this.commentForm.get('comment').reset();
      this.changeDetectorRef.markForCheck();
    });
  }

  activeMenu(id: any) {
    this.document.querySelector('.star_' + id)?.classList.toggle('active');
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
