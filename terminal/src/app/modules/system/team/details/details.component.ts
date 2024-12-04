import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { NgbPaginationConfig } from '@ng-bootstrap/ng-bootstrap';
import { SwiperComponent, SwiperDirective } from 'ngx-swiper-wrapper';
import { Observable, Subject, catchError, combineLatest, of, takeUntil, throwError } from 'rxjs';
import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';

import { IPagination } from '@diktup/frontend/models';
import { AmazonS3Helper, ConvertorHelper, StorageHelper } from '@diktup/frontend/helpers';
import { GenerateS3SignedUrlGQL, ProjectPaginateType } from '@sifca-monorepo/terminal-generator';

import { TeamService } from '../team.service';
import { PosService } from '../../../../core/services/pos.service';
import { AWS_CREDENTIALS } from '../../../../../environments/environment';
import { SharedService } from '../../../../shared/services/shared.service';
import { DocumentService } from '../../../../shared/services/document.service';
import { AccountType, DocumentType, ProjectType, UserType } from '@sifca-monorepo/terminal-generator';

@Component({
  selector: 'sifca-monorepo-profile',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class TeamDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChild(SwiperDirective) directiveRef?: SwiperDirective;
  @ViewChild(SwiperComponent, { static: false }) componentRef?: SwiperComponent;

  config = {
    slidesPerView: 1,
    initialSlide: 0,
    spaceBetween: 25,
    breakpoints: {
      768: {
        slidesPerView: 2,
      },
      1200: {
        slidesPerView: 3,
      },
    },
  };
  page = 0;
  id: string;
  docPage = 0;
  doc!: any[];
  userData: UserType;
  projectList!: any[];
  team: AccountType[];
  docPageSize: number;
  pageChanged: boolean;
  socialForm: FormGroup;
  currentUserId: string;
  projects: ProjectType[];
  pagination: IPagination;
  uploadingFiles: boolean;
  documents: DocumentType[];
  docPagination: IPagination;
  isProjectLastPage$: Observable<boolean> = this.teamService.isProjectLastPage$;
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    config: NgbPaginationConfig,
    private sharedService: SharedService,
    private posService: PosService,
    private teamService: TeamService,
    private formBuilder: FormBuilder,
    private storageHelper: StorageHelper,
    private activatedRoute: ActivatedRoute,
    private amazonS3Helper: AmazonS3Helper,
    private translate: TranslateService,
    private convertorHelper: ConvertorHelper,
    private documentService: DocumentService,
    private changeDetectorRef: ChangeDetectorRef,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.docPageSize = this.documentService.limit;
    config.maxSize = 5;
    config.rotate = true;
    this.teamService.projectsPagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
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
    this.documentService.docPagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      if (pagination) {
        this.docPagination = {
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
  }

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.currentUserId = this.storageHelper.getData('currentUserId');
    this.teamService.team$.pipe(takeUntil(this.unsubscribeAll)).subscribe((team: AccountType[]) => {
      this.team = team;
      this.changeDetectorRef.markForCheck();
    });
    this.teamService.projects$.pipe(takeUntil(this.unsubscribeAll)).subscribe((projects: ProjectPaginateType) => {
      this.projects = projects.objects;
      this.changeDetectorRef.markForCheck();
    });
    this.documentService.documents$.pipe(takeUntil(this.unsubscribeAll)).subscribe((documents: DocumentType[]) => {
      this.documents = documents;
      this.changeDetectorRef.markForCheck();
    });
    this.teamService.user$.subscribe((user) => {
      this.userData = user;
      this.posService.findSocialsPagination().subscribe((res) => {
        this.socialForm = this.formBuilder.group({
          facebook: this.formBuilder.group({
            value: [user.socialMedia?.find((item) => item.name.code === 'FB')?.value || ''],
            name: [res?.find((item) => item.code === 'FB')?.id || ''],
          }),
          instagram: this.formBuilder.group({
            value: [user.socialMedia?.find((item) => item.name.code === 'IG')?.value || ''],
            name: [res?.find((item) => item.code === 'IG')?.id || ''],
          }),
          twitter: this.formBuilder.group({
            value: [user.socialMedia?.find((item) => item.name.code === 'TT')?.value || ''],
            name: [res?.find((item) => item.code === 'TT')?.id || ''],
          }),
          youtube: this.formBuilder.group({
            value: [user.socialMedia?.find((item) => item.name.code === 'YT')?.value || ''],
            name: [res?.find((item) => item.code === 'YT')?.id || ''],
          }),
          tikTok: this.formBuilder.group({
            value: [user.socialMedia?.find((item) => item.name.code === 'TK')?.value || ''],
            name: [res?.find((item) => item.code === 'TK')?.id || ''],
          }),
          linkedin: this.formBuilder.group({
            value: [user.socialMedia?.find((item) => item.name.code === 'LI')?.value || ''],
            name: [res?.find((item) => item.code === 'LI')?.id || ''],
          }),
          pinterest: this.formBuilder.group({
            value: [user.socialMedia?.find((item) => item.name.code === 'PR')?.value || ''],
            name: [res?.find((item) => item.code === 'PR')?.id || ''],
          }),
        });
        this.changeDetectorRef.markForCheck();
      });
      this.changeDetectorRef.markForCheck();
    });
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      window.dispatchEvent(new Event('resize'));
    }
  }

  validateEmail() {
    this.teamService
      .sendValidMail()
      .pipe(
        catchError(() => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.successModal();
        }
      });
  }

  uploadDocument() {
    const fileInput = this.document.createElement('input');
    fileInput.type = 'file';
    fileInput.name = 'fileUpload';
    fileInput.id = 'fileUpload';
    fileInput.onchange = async () => {
      this.uploadingFiles = true;
      const file = fileInput.files[0];
      this.changeDetectorRef.markForCheck();
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.documentService.findContentTypeByType(file.type).subscribe(async (res) => {
          const posId = this.storageHelper.getData('posId');
          const timestamp = Date.now();
          const fileName = `${posId}_${timestamp}_${file.name}`;
          combineLatest([this.generateS3SignedUrlGQL.fetch({ fileName, fileType: file.type }), this.documentService.findContentTypeByType(file.type)])
            .pipe(
              catchError(() => {
                this.modalError();
                this.changeDetectorRef.markForCheck();
                return of(null);
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
              this.documentService
                .createDocument({
                  owner: this.currentUserId,
                  name: file.name,
                  content: {
                    type: result.id,
                    url: picture.baseUrl + '/' + picture.path,
                  },
                  size: file.size,
                })
                .subscribe(() => {
                  this.docPagination.length++;
                  this.docPagination.endIndex++;
                  this.uploadingFiles = false;
                  this.changeDetectorRef.markForCheck();
                });
            });
        });
      };
      this.changeDetectorRef.markForCheck();
    };
    fileInput.click();
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

  successModal() {
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

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.teamService.page = page - 1;
    if (this.pageChanged) {
      this.teamService.getUserProjects(this.id).subscribe();
    }
  }

  onDocPageChange(page: number) {
    this.docPage = page;
    this.teamService.page = page - 1;
    this.documentService.getUserDocuments(this.id).subscribe();
  }

  previousSlideComp() {
    this.teamService.page--;
    this.teamService.getUserProjects(this.id).subscribe();
  }

  nextSlideComp() {
    this.teamService.page++;
    this.teamService.getUserProjects(this.id).subscribe();
  }

  removeDocument(id: string): void {
    this.documentService
      .deleteDocument(id)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
        this.docPagination.length--;
        this.docPagination.endIndex--;
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
    this.teamService.page = 0;
    this.documentService.page = 0;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
