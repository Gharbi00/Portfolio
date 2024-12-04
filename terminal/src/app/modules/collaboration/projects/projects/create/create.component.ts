import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { cloneDeep, findIndex, forEach, isEqual, map, omit, pick, values } from 'lodash';
import { ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { Observable, Subject, catchError, combineLatest, debounceTime, distinctUntilChanged, of, switchMap, takeUntil, throwError } from 'rxjs';
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';

import {
  AccountType,
  ProjectRoleEnum,
  ProjectStatusEnum,
  ProjectPrivacyEnum,
  ProjectPriorityEnum,
  GenerateS3SignedUrlGQL,
  DeleteFileFromAwsGQL,
} from '@sifca-monorepo/terminal-generator';
import { KeyValueListType } from '@sifca-monorepo/terminal-generator';
import { AmazonS3Helper, ConvertorHelper, FormHelper, StorageHelper } from '@diktup/frontend/helpers';

import { ProjectsService } from '../projects.service';
import { TeamService } from '../../../../system/team/team.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ProjectType } from '@sifca-monorepo/terminal-generator';
import { DocumentService } from '../../../../../shared/services/document.service';
import { AWS_CREDENTIALS } from '../../../../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class ProjetCreateComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  isLast = true;
  team: AccountType[];
  selectedItem: string;
  project: ProjectType;
  projectForm: FormGroup;
  uploadingFiles: boolean;
  isButtonDisabled = true;
  isfileUploading: boolean;
  isMemberLoading: boolean;
  selectedLead: any[] = [];
  selectedMembers: any[] = [];
  breadCrumbItems!: Array<any>;
  brandColors: KeyValueListType[];
  status = values(ProjectStatusEnum);
  privacies = values(ProjectPrivacyEnum);
  priorities = values(ProjectPriorityEnum);
  selectValue = ['Choice 1', 'Choice 2', 'Choice 3'];
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  team$: Observable<AccountType[]> = this.teamService.infiniteTeam$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  currentUserId: string;
  initValues: any;
  isLoading = false;
  public files: NgxFileDropEntry[] = [];

  get members() {
    return this.projectForm?.get('members') as FormArray;
  }
  get tags() {
    return this.projectForm?.get('tags') as FormArray;
  }
  get resources() {
    return this.projectForm?.get('resources') as FormArray;
  }
  get attachments() {
    return this.projectForm?.get('attachments') as FormArray;
  }
  get picture(): FormGroup {
    return this.projectForm.get('picture') as FormGroup;
  }

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private teamService: TeamService,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private storageHelper: StorageHelper,
    private sharedService: SharedService,
    private activatedRoute: ActivatedRoute,
    private amazonS3Helper: AmazonS3Helper,
    private convertorHelper: ConvertorHelper,
    private projectsService: ProjectsService,
    private documentService: DocumentService,
    private changeDetectorRef: ChangeDetectorRef,
    private deleteFileFromAwsGQL: DeleteFileFromAwsGQL,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.currentUserId = this.storageHelper.getData('currentUserId');
    this.projectsService.getBrandColors().subscribe();
    this.projectsService.brandColors$.pipe(takeUntil(this.unsubscribeAll)).subscribe((brandColors: KeyValueListType[]) => {
      this.brandColors = brandColors;
      this.changeDetectorRef.markForCheck();
    });
    this.projectsService.project$.pipe(takeUntil(this.unsubscribeAll)).subscribe((project: any) => {
      this.project = project;
      this.selectedLead = [];
      this.selectedMembers = [];
      forEach(project?.members, (member) => {
        if (member?.role === 'LEAD') {
          this.selectedLead.push(member?.member);
        } else if (member?.role === 'MEMBER') {
          this.selectedMembers.push(member?.member);
        }
      });
      this.projectForm = this.formBuilder.group({
        name: [project?.name || '', Validators.required],
        color: [project?.color || undefined, Validators.required],
        description: [project?.description || '', Validators.required],
        privacy: [project?.privacy || '', Validators.required],
        tags: [project?.tags?.length ? project?.tags : []],
        deadline: [project?.deadline || '', Validators.required],
        priority: [project?.priority || '', Validators.required],
        status: [project?.status || '', Validators.required],
        members: this.formBuilder.array(
          project?.members?.length
            ? map(project?.members, (m) => {
                return this.formBuilder.group({
                  member: m?.member?.id,
                  role: m?.role,
                });
              })
            : [],
        ),
        attachments: this.formBuilder.array(project?.attachments?.length ? project?.attachments : []),
        resources: this.formBuilder.array(project?.resources?.length ? project?.resources : []),
        picture: this.formBuilder.group({
          baseUrl: [project?.picture?.baseUrl || ''],
          path: [project?.picture?.path || ''],
        }),
      });
      this.changeDetectorRef.markForCheck();
    });
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
    this.initValues = this.projectForm?.value;
    this.projectForm?.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val: any): void => {
      this.isButtonDisabled = isEqual(val, this.initValues);
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.COLLABORATION').subscribe((collaboration: string) => {
      this.translate.get('MENUITEMS.TS.CREATE_PROJECT').subscribe((createProject: string) => {
        this.breadCrumbItems = [{ label: collaboration }, { label: createProject, active: true }];
      });
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

  save() {
    this.isButtonDisabled = true;
    if (!this.project) {
      const input: any = {
        ...FormHelper.getNonEmptyValues(this.projectForm.value),
        resources: map(this.projectForm.get('resources').value, (res) => res?.id),
      };
      this.projectsService
        .createProject(input)
        .pipe(
          catchError((error) => {
            if (error) {
              this.modalError();
              this.uploadingFiles = false;
              this.changeDetectorRef.markForCheck();
              return of(null);
            }
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.position();
            this.router.navigate(['/collaboration/projects/all'], { relativeTo: this.activatedRoute });
            this.changeDetectorRef.markForCheck();
          }
        });
    } else {
      const input: any = {
        id: this.project?.id,
        ...FormHelper.getDifference(
          pick(this.project, 'name', 'color', 'description', 'privacy', 'deadline', 'priority', 'status'),
          omit(this.projectForm.value, 'resources', 'attachments', 'members', 'tags', 'picture'),
        ),
        ...(isEqual(
          (this.project.tags?.length ? cloneDeep(this.project.tags) : []).sort(),
          (this.projectForm.value?.tags?.length ? cloneDeep(this.projectForm.value.tags) : []).sort(),
        )
          ? {}
          : { tags: this.projectForm.value.tags }),
        ...(isEqual(
          (this.project.resources?.length ? cloneDeep(this.project.resources) : []).sort(),
          (this.projectForm.get('resources').value?.length ? cloneDeep(this.projectForm.get('resources').value) : []).sort(),
        )
          ? {}
          : { resources: map(this.projectForm.get('resources').value, (res) => res?.id) }),
        ...(isEqual(
          (this.project.attachments?.length ? cloneDeep(this.project.attachments) : []).sort(),
          (this.projectForm.get('attachments').value?.length ? cloneDeep(this.projectForm.get('attachments').value) : []).sort(),
        )
          ? {}
          : { attachments: map(this.projectForm.get('attachments').value, (res) => res?.id) }),
        members: this.members.value,
        ...(isEqual(this.initValues.picture, this.picture.value) ? {} : { picture: this.picture.value }),
      };
      this.projectsService
        .updateProject(input)
        .pipe(
          catchError((error) => {
            if (error) {
              this.modalError();
              this.uploadingFiles = false;
              this.changeDetectorRef.markForCheck();
              return of(null);
            }
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.position();
            this.router.navigate(['/collaboration/projects/all'], { relativeTo: this.activatedRoute });
            this.changeDetectorRef.markForCheck();
          }
        });
    }
  }

  removePicture() {
    const fileName = this.picture.value.path;
    this.deleteFileFromAwsGQL.fetch({ fileName }).subscribe(({ data }) => {
      if (data.deleteFileFromAws) {
        this.picture.patchValue({
          baseUrl: '',
          path: '',
        });
        if (this.project) {
          const input = {
            id: this.project?.id,
            picture: { baseUrl: '', path: '' },
          };
          this.projectsService
            .updateProject(input)
            .pipe(
              catchError((error) => {
                if (error) {
                  this.modalError();
                  this.uploadingFiles = false;
                  this.changeDetectorRef.markForCheck();
                  return of(null);
                }
              }),
            )
            .subscribe((res) => {
              if (res) {
                this.position();
                this.router.navigate(['/collaboration/projects/all'], { relativeTo: this.activatedRoute });
                this.changeDetectorRef.markForCheck();
              }
            });
        }
      }
    })
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

  loadMoreMembers() {
    if (!this.isLast) {
      this.teamService.page += 1;
      this.teamService.getTeam().subscribe();
    }
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

  removeMember(id: string) {
    if (this.selectedItem === 'member') {
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
    this.changeDetectorRef.markForCheck();
  }

  openMemberModal(content: any, item: string) {
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

  fileForm(resource) {
    return this.formBuilder.group({
      content: this.formBuilder.group({
        type: this.formBuilder.group({
          id: [resource?.content?.type?.id || ''],
          image: this.formBuilder.group({
            background: this.formBuilder.group({
              svg: this.formBuilder.group({
                baseUrl: [resource?.content?.type?.image?.background?.svg?.baseUrl || ''],
                path: [resource?.content?.type?.image?.background?.svg?.path || ''],
              }),
            }),
          }),
          name: [resource?.content?.type?.name || ''],
          type: [resource?.content?.type?.type || ''],
        }),
      }),
      id: [resource?.id || ''],
      name: [resource?.name || ''],
      size: [resource?.size || ''],
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
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
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
                if (filed === 'resources') {
                  this.resources.push(this.fileForm(response));
                  this.uploadingFiles = false;
                } else {
                  this.attachments.push(this.fileForm(response));
                  this.isfileUploading = false;
                }
                this.changeDetectorRef.markForCheck();
              });
          });
      };
    };
    fileInput.click();
  }

  // TODO: to delete
  upload(): void {
    const fileInput = this.document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.name = 'fileUpload';
    fileInput.id = 'fileUpload';
    fileInput.onchange = async () => {
      this.isLoading = true;
      const file = fileInput.files[0];
      this.changeDetectorRef.markForCheck();
      const posId = this.storageHelper.getData('posId');
      const timestamp = Date.now();
      const fileName = `${posId}_${timestamp}_${file.name}`;
      this.generateS3SignedUrlGQL
        .fetch({
          fileName,
          fileType: file.type,
        })
        .subscribe(async (res) => {
          const picture = await this.amazonS3Helper.uploadS3AwsWithSignature(
            res.data.generateS3SignedUrl.message,
            file,
            fileName,
            AWS_CREDENTIALS.storage,
            AWS_CREDENTIALS.region,
          );
          this.picture.patchValue({ path: picture.path, baseUrl: picture.baseUrl });
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        });
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
    this.changeDetectorRef.markForCheck();
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

  addTagField(): void {
    const tagFormControl = this.formBuilder.control('');
    this.tags?.push(tagFormControl);
    this.changeDetectorRef.markForCheck();
  }

  removeTagField(index: number): void {
    const tagsArray = this.tags as FormArray;
    tagsArray.removeAt(index);
    this.changeDetectorRef.markForCheck();
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.projectForm.reset();
  }
}
