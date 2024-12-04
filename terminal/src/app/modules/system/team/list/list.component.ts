import Swal from 'sweetalert2';
import { DOCUMENT } from '@angular/common';
import { isEqual, omit, values } from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, Observable, of, Subject, switchMap, takeUntil } from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import {
  App,
  Gender,
  UserRole,
  UserType,
  AccountType,
  MaritalStatus,
  PointOfSaleType,
  GenerateS3SignedUrlGQL,
} from '@sifca-monorepo/terminal-generator';
import { AmazonS3Helper, StorageHelper, ValidationHelper } from '@diktup/frontend/helpers';

import { TeamService } from '../team.service';
import { PosService } from '../../../../core/services/pos.service';
import { UserService } from '../../../../core/services/user.service';
import { AWS_CREDENTIALS } from '../../../../../environments/environment';
import { SharedService } from '../../../../shared/services/shared.service';

@Component({
  selector: 'sifca-monorepo-team-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class TeamListComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 1;
  posId: string;
  user: UserType;
  submitted = false;
  isLoading = false;
  initialValues: any;
  userForm: FormGroup;
  team: AccountType[];
  pageChanged: boolean;
  isButtonDisabled = true;
  pagination: IPagination;
  roles = values(UserRole);
  selectedRoles: any[] = [];
  breadCrumbItems!: Array<{}>;
  selectedItems: string[] = [];
  genders: string[] = values(Gender);
  maritalStatuses: string[] = values(MaritalStatus);
  isLastPage$: Observable<boolean> = this.teamService.isLast$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private posService: PosService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private teamService: TeamService,
    private userService: UserService,
    private translate: TranslateService,
    private sharedService: SharedService,
    private storageHelper: StorageHelper,
    private amazonS3Helper: AmazonS3Helper,
    private changeDetectorRef: ChangeDetectorRef,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.teamService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      if (pagination) {
        this.pagination = {
          length: pagination?.length,
          page: this.teamService.page || 0,
          size: this.teamService.limit,
          lastPage: pagination?.length - 1,
          startIndex: (this.teamService.page || 0) * this.teamService.limit,
          endIndex: Math.min(((this.teamService.page || 0) + 1) * this.teamService.limit - 1, pagination.length - 1),
        };
        this.changeDetectorRef.markForCheck();
      }
    });
    this.userService.user$.pipe(takeUntil(this.unsubscribeAll)).subscribe((user: UserType) => {
      this.user = user;
      this.changeDetectorRef.markForCheck();
    });
    this.teamService.team$.pipe(takeUntil(this.unsubscribeAll)).subscribe((team: AccountType[]) => {
      this.team = team;
      this.changeDetectorRef.markForCheck();
    });
    this.posService.pos$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pos: PointOfSaleType) => {
      this.posId = pos.id;
      this.changeDetectorRef.markForCheck();
    });
    this.teamService.listenForUserStatusChanged().pipe(takeUntil(this.unsubscribeAll)).subscribe();
  }

  ngOnInit(): void {
    this.teamService.page = 0;
    this.translate.get('MENUITEMS.TS.SYSTEM').subscribe((system: string) => {
      this.translate.get('MENUITEMS.TS.TEAM').subscribe((team: string) => {
        this.breadCrumbItems = [{ label: system }, { label: team, active: true }];
      });
    });
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.isLoading = true;
          this.changeDetectorRef.markForCheck();
          this.teamService.searchString = searchValues.searchString;
          return this.teamService.searchAccount();
        }),
      )
      .subscribe(() => {
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      });
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.teamService.page = page - 1;
    if (this.pageChanged) {
      this.teamService.getTeam().subscribe();
    }
  }

  onRoleChange(event: any, role: string) {
    if (event.target.checked) {
      this.selectedRoles.push(role);
    } else {
      const index = this.selectedRoles.indexOf(role);
      if (index !== -1) {
        this.selectedRoles.splice(index, 1);
      }
    }
    this.userForm.get('roles').patchValue(this.selectedRoles);
  }

  save(): void {
    let args: any;
    this.isButtonDisabled = true;
    args = {
      ...omit(this.userForm.value, 'passwordConfirm'),
      roles: [UserRole.POS_MANAGER, UserRole.MANAGER]
    };
    this.teamService
      .registerAccountForApp(args)
      .pipe(
        catchError((error) => {
          this.modalService.dismissAll();
          this.modalError(error.graphQLErrors[0]?.extensions?.exception?.response?.error);
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
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

  modalError(text: string) {
    this.translate.get('MENUITEMS.TS.STH_WENT_WRONG').subscribe((sthWentWrong: string) => {
      Swal.fire({
        title: 'Oops...',
        text: text ? text : sthWentWrong,
        icon: 'warning',
        showCancelButton: false,
        confirmButtonColor: 'rgb(3, 142, 220)',
        cancelButtonColor: 'rgb(243, 78, 78)',
      });
    });
  }

  openAccountModal(content: any) {
    this.userForm = this.formBuilder.group(
      {
        apps: [[App.SIFCA]],
        roles: [[UserRole.POS_MANAGER, UserRole.MANAGER], [Validators.required]],
        lastName: ['', [Validators.required]],
        firstName: ['', [Validators.required]],
        password: ['', [Validators.required]],
        passwordConfirm: ['', [Validators.required]],
        email: ['', [Validators.compose([Validators.required, Validators.email])]],
      },
      {
        validators: [ValidationHelper.matchingFields('password', 'passwordConfirm')] as AbstractControlOptions,
      } as any
    );
    this.initialValues = this.userForm.value;
    this.userForm.valueChanges.subscribe((val) => {
      this.isButtonDisabled = isEqual(this.initialValues, val);
    });
    this.modalService.open(content, { size: 'md', centered: true });
  }

  upload(): void {
    const fileInput = this.document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.name = 'fileUpload';
    fileInput.id = 'fileUpload';
    fileInput.onchange = async () => {
      const file = fileInput.files[0];
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
          (this.userForm.get('picture') as FormGroup).patchValue({
            path: picture.path,
            baseUrl: picture.baseUrl,
          });
          this.changeDetectorRef.markForCheck();
        });
    };
    fileInput.click();
  }

  activeMenu(id: any) {
    this.document.querySelector('.star_' + id)?.classList.toggle('active');
  }

  ngOnDestroy() {
    this.teamService.page = 0;
    this.teamService.searchString = '';
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
