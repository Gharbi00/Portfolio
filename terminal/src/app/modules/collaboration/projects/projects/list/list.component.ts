import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap, take, takeUntil, throwError } from 'rxjs';

import Swal from 'sweetalert2';
import { findIndex, isEqual, map, values } from 'lodash';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { IPagination } from '@diktup/frontend/models';
import { AccountType, ProjectFilterInput } from '@sifca-monorepo/terminal-generator';
import { ProjectPriorityEnum, ProjectPrivacyEnum, ProjectStatusEnum, ProjectType, UserType } from '@sifca-monorepo/terminal-generator';

import { ProjectsService } from '../projects.service';
import { TeamService } from '../../../../system/team/team.service';
import { UserService } from '../../../../../core/services/user.service';
import { ConvertorHelper } from '@diktup/frontend/helpers';
import { SharedService } from '../../../../../shared/services/shared.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ProjectsListComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  isLast: boolean;
  team: AccountType[];
  selectedItem: string;
  pageChanged: boolean;
  emailForm: FormGroup;
  filterForm: FormGroup;
  pagination: IPagination;
  isButtonDisabled = true;
  isMemberLoading: boolean;
  selectedUsers: any[] = [];
  selectedMembers: any[] = [];
  breadCrumbItems!: Array<any>;
  selectedProject: ProjectType;
  isEmailButtonDisabled = true;
  isFilterButtonDisabled = true;
  status = values(ProjectStatusEnum);
  filterdProjects: ProjectFilterInput;
  privacies = values(ProjectPrivacyEnum);
  priorities = values(ProjectPriorityEnum);
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  projects$: Observable<ProjectType[]> = this.projectsService.projects$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  searchProjectForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  loadingProjects$: Observable<boolean> = this.projectsService.loadingProjects$;

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private translate: TranslateService,
    private teamService: TeamService,
    private sharedService: SharedService,
    private convertorHelper: ConvertorHelper,
    private projectsService: ProjectsService,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.projectsService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.projectsService.pageIndex ? this.projectsService.pageIndex + 1 : 1,
        size: this.projectsService.filterLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.projectsService.pageIndex || 0) * this.projectsService.filterLimit,
        endIndex: Math.min(((this.projectsService.pageIndex || 0) + 1) * this.projectsService.filterLimit - 1, pagination?.length - 1),
      };
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
  }

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.COLLABORATION').subscribe((collaboration: string) => {
      this.translate.get('MENUITEMS.TS.PROJECTS').subscribe((projects: string) => {
        this.breadCrumbItems = [{ label: collaboration }, { label: projects, active: true }];
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
    this.searchProjectForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.changeDetectorRef.markForCheck();
          this.projectsService.pageIndex = 0;
          this.projectsService.searchString = searchValues.searchString;
          return this.projectsService.getProjectsByTargetWithFilter();
        }),
      )
      .subscribe(() => {
        this.isMemberLoading = false;
        this.changeDetectorRef.markForCheck();
      });
    this.filterForm = this.formBuilder.group({
      privacy: [[]],
      status: [[]],
      members: [[]],
      priority: [[]],
      date: [],
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

  resetDate() {
    this.filterForm.get('date').reset();
  }

  filter() {
    this.isFilterButtonDisabled = true;
    const input: any = {
      ...(this.filterForm.get('privacy').value?.length ? { privacy: this.filterForm.get('privacy').value } : {}),
      ...(this.filterForm.get('status').value?.length ? { status: this.filterForm.get('status').value } : {}),
      ...(this.filterForm.get('members').value?.length ? { members: this.filterForm.get('members').value } : {}),
      ...(this.filterForm.get('priority').value?.length ? { priority: this.filterForm.get('priority').value } : {}),
      ...(this.filterForm.get('date').value ? { from: this.filterForm.get('date').value.from, to: this.filterForm.get('date').value.to } : {}),
    };
    this.projectsService
      .getProjectsByTargetWithFilter(input)
      .pipe(
        catchError((error) => {
          this.modalService.dismissAll();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
        this.filterdProjects = input;
        this.modalService.dismissAll();
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

  openFilterModal(content: any) {
    this.modalService.open(content, { centered: true });
  }

  openEmailModal(content: any) {
    this.modalService.open(content, { size: 'md', centered: true });
    this.userService.user$.pipe(take(1)).subscribe((user: any) => {
      this.emailForm = this.formBuilder.group({
        emails: [[user?.email], Validators.required],
      });
      const initialValues = this.emailForm.value;
      this.emailForm.valueChanges.subscribe((ivalues) => {
        this.isEmailButtonDisabled = isEqual(ivalues, initialValues);
      });
      this.changeDetectorRef.markForCheck();
    });
  }

  send() {
    this.isEmailButtonDisabled = true;
    this.projectsService
      .sendProjectsBymail(this.emailForm.get('emails').value, this.filterdProjects)
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
  }

  downloadDocument() {
    if (isPlatformBrowser(this.platformId)) {
      this.projectsService.getProjectsByExcel().subscribe((res) => {
        const blob = this.convertorHelper.b64toBlob(res, 'xlsx');
        const a = this.document.createElement('a');
        this.document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = String('projects.xlsx');
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      });
    }
  }

  isAdded(id: string) {
    const index = findIndex(this.selectedMembers, (o) => o.id === id);
    if (index > -1) {
      return true;
    }
    return false;
  }

  loadMoreMembers() {
    if (!this.isLast) {
      this.teamService.page += 1;
      this.teamService.getTeam().subscribe();
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

  invite() {
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

  addMember(member: UserType) {
    this.isButtonDisabled = false;
    this.selectedMembers.push(member);
    this.changeDetectorRef.markForCheck();
  }

  removeMember(id: string) {
    this.isButtonDisabled = false;
    const index = findIndex(this.selectedMembers, (o) => o.id === id);
    this.selectedMembers.splice(index, 1);
    this.changeDetectorRef.markForCheck();
  }

  openMemberModal(content: any, item: string, project?: ProjectType) {
    this.selectedProject = project;
    this.selectedUsers = this.selectedMembers = map(project.members, 'member');
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

  onPageChange(page: number) {
    this.page = page;
    this.projectsService.pageIndex = page - 1;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    if (this.pageChanged) {
      this.projectsService.getProjectsByTargetWithFilter().subscribe();
    }
  }

  openDeleteModal(content: any, id: any) {
    this.selectedProject = id;
    this.modalService.open(content, { centered: true });
  }

  deleteProject() {
    this.projectsService
      .deleteProject(this.selectedProject.id)
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
        this.modalService.dismissAll();
      });
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.projectsService.pageIndex = 0;
    this.teamService.searchString = '';
    this.projectsService.searchString = '';
  }
}
