import Swal from 'sweetalert2';
import { find, isEqual, map, omit, values } from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Observable, Subject, catchError, debounceTime, distinctUntilChanged, switchMap, take, takeUntil, throwError, map as rxMap, combineLatest, of } from 'rxjs';

import { AmazonS3Helper, ConvertorHelper, FormHelper, StorageHelper, UploadHelper } from '@diktup/frontend/helpers';
import {
  AccountType,
  CommentType,
  CompanyType,
  GenerateS3SignedUrlGQL,
  TicketPriorityEnum,
  TicketStatusEnum,
  TicketType,
  UserType,
} from '@sifca-monorepo/terminal-generator';

import { TicketsService } from '../tickets.service';
import { TeamService } from '../../../system/team/team.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { CommentService } from '../../../../shared/services/comment.service';
import { DocumentService } from '../../../../shared/services/document.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { CompaniesService } from '../../customers/companies/companies.service';
import { AWS_CREDENTIALS } from '../../../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class TicketsDetailsComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  isLast = true;
  initValues: any;
  isLoading: boolean;
  ticket: TicketType;
  team: AccountType[];
  selectedUsers: any[];
  ticketForm: FormGroup;
  currentUserId: string;
  commentForm: FormGroup;
  selectedStatus: string;
  comments: CommentType[];
  uploadingFiles: boolean;
  isButtonDisabled = true;
  selectedCompany: string;
  searchCompanyForm: FormGroup;
  selectedPriorities: any[] = [];
  status = values(TicketStatusEnum);
  priorities = values(TicketPriorityEnum);
  isTeamLastPage$: Observable<boolean> = this.teamService.isLast$;
  team$: Observable<UserType[]> = this.teamService.infiniteUsers$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  leads$: Observable<CompanyType[]> = this.companiesService.infiniteLeads$;

  get assignedTo() {
    return this.ticketForm?.get('assignedTo') as FormArray;
  }

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    public modalService: NgbModal,
    public teamService: TeamService,
    public formBuilder: FormBuilder,
    public uploadHelper: UploadHelper,
    private storageHelper: StorageHelper,
    private amazonS3Helper: AmazonS3Helper,
    private sharedService: SharedService,
    private translate: TranslateService,
    public ticketsService: TicketsService,
    private commentService: CommentService,
    public documentService: DocumentService,
    private convertorHelper: ConvertorHelper,
    private companiesService: CompaniesService,
    private changeDetectorRef: ChangeDetectorRef,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.currentUserId = this.storageHelper.getData('currentUserId');
    this.teamService.infiniteTeam$.pipe(takeUntil(this.unsubscribeAll)).subscribe((team: AccountType[]) => {
      if (team) {
        this.team = team;
        this.changeDetectorRef.markForCheck();
      }
    });
    this.ticketsService.ticket$.pipe(takeUntil(this.unsubscribeAll)).subscribe((ticket: TicketType) => {
      this.ticket = ticket;
      this.selectedStatus = ticket.status;
      this.ticketForm = this.formBuilder.group({
        assignedTo: this.formBuilder.array(ticket?.assignedTo?.length ? map(ticket?.assignedTo, 'id') : []),
      });
      const initValues = this.ticketForm?.value;
      this.ticketForm?.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val: any): void => {
        this.isButtonDisabled = isEqual(val, initValues);
      });
      this.changeDetectorRef.markForCheck();
    });
    this.commentService.comments$.pipe(takeUntil(this.unsubscribeAll)).subscribe((comments: CommentType[]) => {
      this.comments = comments;
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    this.teamService.isLast$.pipe(takeUntil(this.unsubscribeAll)).subscribe((isLast: boolean) => {
      this.isLast = isLast;
      this.changeDetectorRef.markForCheck();
    });
    this.commentForm = this.formBuilder.group({
      user: [this.currentUserId],
      comment: [''],
      reply: [''],
      attachments: [[]],
      holder: this.formBuilder.group({
        ticket: [this.ticket.id],
      }),
    });
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.isLoading = true;
          this.team = null;
          this.changeDetectorRef.markForCheck();
          this.teamService.page = 0;
          this.teamService.searchString = searchValues.searchString;
          return this.teamService.searchAccount();
        }),
      )
      .subscribe(() => {
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      });
  }

  openTicketModal(content: NgbModal) {
    this.teamService.page = 0;
    this.companiesService.leadsPageIndex = 0;
    this.teamService.infiniteUsers$ = null;
    this.companiesService.infiniteLeads$ = null;
    this.companiesService.getCompaniesByTarget().subscribe();
    this.teamService.getTeam().subscribe();
    this.selectedCompany = this.ticket?.customer?.name || null;
    this.modalService.open(content, { size: 'md', centered: true });
    this.searchCompanyForm = this.formBuilder.group({ searchString: [this.ticket?.customer?.name || ''] });
    this.ticketForm = this.formBuilder.group({
      name: [this.ticket?.name || '', [Validators.required]],
      assignedTo: [this.ticket?.assignedTo?.length ? map(this.ticket?.assignedTo, 'id') : []],
      deadline: [this.ticket?.deadline || ''],
      description: [this.ticket?.description || ''],
      customer: [this.ticket?.customer?.id || ''],
      status: [this.ticket?.status || ''],
      priority: [this.ticket?.priority || ''],
    });
    this.initValues = this.ticketForm?.value;
    this.ticketForm?.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((val: any): void => {
      this.isButtonDisabled = isEqual(val, this.initValues);
      if (val?.customer !== this.initValues?.customer) {
        this.leads$
          .pipe(
            take(1),
            rxMap((leads) => {
              const company = find(leads, { id: val.customer });
              this.searchCompanyForm.get('searchString').patchValue(company.name, { emitEvent: false });
            }),
          )
          .subscribe();
      }
    });
    this.searchCompanyForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.companiesService.searchString = searchValues.searchString;
          return this.companiesService.getCompaniesByTarget(true);
        }),
      )
      .subscribe(() => {
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

  onPriorityChange(priority: string, isChecked: boolean) {
    if (isChecked) {
      this.ticketsService.priority.push(priority);
    } else {
      const index = this.ticketsService.priority.indexOf(priority);
      if (index > -1) {
        this.ticketsService.priority.splice(index, 1);
      }
    }
    this.selectedPriorities = this.ticketsService.priority;
    this.ticketsService.getTicketsByTargetWithFilter().subscribe();
  }

  save() {
    this.isButtonDisabled = true;
    const args: any = {
      ...FormHelper.getNonEmptyAndChangedValues(this.ticketForm.value, this.initValues),
    };
    this.ticketsService
      .updateTicket(args, this.ticket.id)
      .pipe(
        catchError((error) => {
          this.modalService.dismissAll();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
        this.position();
        this.modalService.dismissAll();
        this.changeDetectorRef.markForCheck();
      });
  }

  loadMoreOwners() {
    this.teamService.isLast$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.teamService.page += 1;
        this.teamService.getTeam().subscribe();
      }
    });
  }

  loadMoreLeads() {
    this.companiesService.leadsPageIndex += 1;
    this.companiesService.getCompaniesByTarget().subscribe();
  }

  onStatusChange(event: any) {
    const input: any = {
      status: event.target.value,
    };
    this.ticketsService
      .updateTicket(input, this.ticket.id)
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

  isAdded(id: string) {
    const index = this.assignedTo.value.indexOf(id);
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
      assignedTo: this.assignedTo.value,
    };
    this.ticketsService
      .updateTicket(input, this.ticket.id)
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
    this.assignedTo?.push(tagFormControl);
  }

  removeMember(id: string) {
    const index = this.assignedTo.value.indexOf(id);
    this.assignedTo.removeAt(index);
  }

  loadMoreMembers() {
    if (!this.isLast) {
      this.teamService.page += 1;
      this.teamService.getTeam().subscribe();
    }
  }

  reply(commentId: string) {
    this.commentForm.get('reply').patchValue(commentId);
  }

  createComment() {
    const input: any = {
      ...(this.commentForm.get('attachments')?.value.length ? { attachments: this.commentForm.value.attachments } : {}),
      ...FormHelper.getNonEmptyValues(omit(this.commentForm.value, 'attachments')),
    };

    this.commentService.createComment(input).subscribe(() => {
      this.commentForm.get('comment').reset();
    });
  }

  openMemberModal(content: any) {
    this.selectedUsers = this.ticket?.assignedTo;
    this.teamService.team$ = null;
    this.teamService.infiniteTeam$ = null;
    this.team = null;
    this.teamService.page = 0;
    this.isLoading = true;
    this.teamService.getTeam().subscribe((res) => {
      if (res) {
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      }
    });
    this.modalService.open(content, { size: 'md', centered: true });
  }

  removeDocument(id: string): void {
    const attachments = this.ticket.attachments;
    const index = attachments.findIndex((item) => item.id === id);
    attachments.splice(index, 1);
    this.ticket.attachments = attachments;
    const input: any = {
      attachments: map(this.ticket.attachments, 'id'),
    };
    this.ticketsService
      .updateTicket(input, this.ticket.id)
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
    this.changeDetectorRef.markForCheck();
  }

  addedFile() {
    if (!this.uploadingFiles) {
      this.uploadingFiles = true;
    }
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
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const posId = this.storageHelper.getData('posId');
        const timestamp = Date.now();
        const fileName = `${posId}_${timestamp}_${file.name}`;
        combineLatest([this.generateS3SignedUrlGQL.fetch({ fileName, fileType: file.type }), this.ticketsService.findContentTypeByType(file.type)])
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
            this.ticketsService
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
                  attachments: map(this.ticket.attachments, (a) => a.id).concat([response.id]),
                };
                this.ticketsService.updateTicket(input, this.ticket.id).subscribe();
                this.changeDetectorRef.markForCheck();
              });
          });
      };
    };
    fileInput.click();
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
    this.ticketsService.pageIndex = 0;
    this.ticketsService.searchString = '';
  }
}
