import Swal from 'sweetalert2';
import { isEqual, values } from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import {
  of,
  take,
  Subject,
  switchMap,
  takeUntil,
  Observable,
  catchError,
  debounceTime,
  map as rxMap,
  combineLatest,
  distinctUntilChanged,
} from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import {
  AccountType,
  ProjectType,
  AudienceType,
  ProjectFilterInput,
  ProjectPrivacyEnum,
  DefaultAudienceType,
  ProjectPriorityEnum,
  PartnershipNetworkType,
} from '@sifca-monorepo/terminal-generator';

import { AudiencesService } from '../audience.service';
import { TeamService } from '../../../system/team/team.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { QuestTypeService } from '../../../system/apps/apps/campaigns/campaigns.service';
import { StorageHelper } from '@diktup/frontend/helpers';

@Component({
  selector: 'sifca-monorepo-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class AudiencesListComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  isLast: boolean;
  team: AccountType[];
  selectedItem: string;
  pageChanged: boolean;
  emailForm: FormGroup;
  filterForm: FormGroup;
  formInitialValues: any;
  pagination: IPagination;
  isButtonDisabled = true;
  isMemberLoading: boolean;
  selectedUsers: any[] = [];
  selectedMembers: any[] = [];
  breadCrumbItems!: Array<any>;
  selectedProject: ProjectType;
  isEmailButtonDisabled = true;
  isFilterButtonDisabled = true;
  filterdAudiences: ProjectFilterInput;
  privacies = values(ProjectPrivacyEnum);
  priorities = values(ProjectPriorityEnum);
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  audiences$: Observable<AudienceType[]> = this.audiencesService.audiences$;
  loadingAudiences$: Observable<boolean> = this.audiencesService.loadingAudiences$;
  defaultAudiences$: Observable<DefaultAudienceType[]> = this.audiencesService.defaultAudiences$;
  targetsByPartner$: Observable<PartnershipNetworkType[]> = this.questTypeService.targetsByPartner$;

  config = {
    initialSlide: 0,
    slidesPerView: 1,
    spaceBetween: 25,
    breakpoints: {
      768: {
        slidesPerView: 2,
      },
      1200: {
        slidesPerView: 3,
      },
      1599: {
        slidesPerView: 4,
      },
    },
  };

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private teamService: TeamService,
    private translate: TranslateService,
    private sharedService: SharedService,
    private storageHelper: StorageHelper,
    private questTypeService: QuestTypeService,
    private audiencesService: AudiencesService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.audiencesService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.audiencesService.pageIndex ? this.audiencesService.pageIndex + 1 : 1,
        size: this.audiencesService.filterLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.audiencesService.pageIndex || 0) * this.audiencesService.filterLimit,
        endIndex: Math.min(((this.audiencesService.pageIndex || 0) + 1) * this.audiencesService.filterLimit - 1, pagination?.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
    this.filterForm = this.formBuilder.group({
      advertiser: this.formBuilder.group({
        pos: [undefined],
      }),
      target: this.formBuilder.group({
        pos: [undefined],
      }),
    });
    this.formInitialValues = this.filterForm.value;
    this.filterForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
      this.isFilterButtonDisabled = isEqual(this.formInitialValues, values);
    });
    this.sharedService.resetFilter$.pipe(takeUntil(this.unsubscribeAll)).subscribe((reset) => {
      if (reset) {
        this.reset();
      }
    });
  }

  ngOnInit(): void {
    combineLatest([this.translate.get('MENUITEMS.TS.ENGAGEMENT'), this.translate.get('MENUITEMS.TS.AUDIENCES')])
      .pipe(
        rxMap(([engagement, audiences]: [string, string]) => {
          this.breadCrumbItems = [{ label: engagement }, { label: audiences, active: true }];
        }),
      )
      .subscribe();
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.changeDetectorRef.markForCheck();
          this.audiencesService.searchString = searchValues.searchString;
          return this.audiencesService.getAudiencesByTargetPaginated();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  reset() {
    this.filterForm.reset();
  }

  ngAfterViewInit() {
    this.questTypeService.parnterPageIndex = 0;
    this.questTypeService.targetsByPartner$ = null;
    this.questTypeService.getPartnershipNetworksByPartnerAndPartnershipPagination().subscribe();
  }

  loadMoreAdvertisers() {
    this.questTypeService.isLastPartners$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.questTypeService.parnterPageIndex++;
        this.questTypeService.getPartnershipNetworksByPartnerAndPartnershipPagination().subscribe();
      }
    });
  }

  saveFilter() {
    this.modalService.dismissAll();
    this.isFilterButtonDisabled = true;
    const input = {
      ...(this.filterForm.value?.target?.pos && this.formInitialValues?.target?.pos !== this.filterForm.value?.target?.pos
        ? {
            target: { pos: this.filterForm.value?.target?.pos },
            advertiser: { pos: this.storageHelper.getData('posId') },
          }
        : {}),
    };
    this.audiencesService
      .getAudiencesByTargetPaginated(false, input)
      .pipe(
        catchError(() => {
          this.changeDetectorRef.markForCheck();
          this.modalService.dismissAll();
          this.modalError();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.formInitialValues = this.filterForm.value;
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  addAudience(id: string) {
    this.audiencesService
      .assignAudienceToTarget(id)
      .pipe(
        catchError(() => {
          return of(null);
        }),
      )
      .subscribe();
  }

  refreshAudience(audienceId: string) {
    this.audiencesService.refreshAudienceViews(audienceId).subscribe();
  }

  openFilterModal(targetModal: any) {
    this.modalService.open(targetModal, {
      centered: true,
      backdrop: 'static',
    });
  }

  openAudienceModal(targetModal: any) {
    this.modalService.open(targetModal, {
      centered: true,
      backdrop: 'static',
      size: 'lg',
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

  onPageChange(page: number) {
    this.page = page;
    this.audiencesService.pageIndex = page - 1;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    if (this.pageChanged) {
      this.audiencesService.getAudiencesByTargetPaginated().subscribe();
    }
  }

  openDeleteModal(content: any, id: any) {
    this.selectedProject = id;
    this.modalService.open(content, { centered: true });
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.audiencesService.pageIndex = 0;
    this.teamService.searchString = '';
    this.audiencesService.searchString = '';
  }
}
