import Swal from 'sweetalert2';
import { DOCUMENT } from '@angular/common';
import { isEqual, keys, omit, values } from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import {
  Observable,
  Subject,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  of,
  switchMap,
  take,
  takeUntil,
  map as rxMap,
  firstValueFrom,
} from 'rxjs';

import { IPagination } from '@diktup/frontend/models';
import { PointOfSaleType, QuestWithProgressType } from '@sifca-monorepo/terminal-generator';
import { CampaignsStatsDashboardType } from '@sifca-monorepo/terminal-generator';
import { AmazonS3Helper, FormHelper, StorageHelper } from '@diktup/frontend/helpers';
import { DeleteFileFromAwsGQL, GenerateS3SignedUrlGQL, QuestCategoryEnum } from '@sifca-monorepo/terminal-generator';
import { PartnershipNetworkType, QuestStatusEnum, QuestType, QuestTypeType, UserType } from '@sifca-monorepo/terminal-generator';

import { CampaignsService } from '../campaigns.service';
import { TeamService } from '../../../../system/team/team.service';
import { AWS_CREDENTIALS } from '../../../../../../environments/environment';
import { SharedService } from '../../../../../shared/services/shared.service';
import { QuestTypeService } from '../../../../system/apps/apps/campaigns/campaigns.service';
import { PosService } from '../../../../../../app/core/services/pos.service';

@Component({
  selector: 'sifca-monorepo-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class CampaignsListComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  initialValues: any;
  pageChanged: boolean;
  questForm: FormGroup;
  pos: PointOfSaleType;
  filterForm: FormGroup;
  formInitialValues: any;
  pagination: IPagination;
  isButtonDisabled = true;
  breadCrumbItems!: Array<any>;
  isFilterButtonDisabled = true;
  status = values(QuestStatusEnum);
  categories = values(QuestCategoryEnum);
  currentStatus = [QuestStatusEnum.DRAFT];
  campaignsStats: CampaignsStatsDashboardType;
  userSearchInput$: Subject<string> = new Subject<string>();
  users$: Observable<UserType[]> = this.teamService.infiniteUsers$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  loadingStats$: Observable<boolean> = this.campaignService.loadingStats$;
  loadingQuests$: Observable<boolean> = this.campaignService.loadingQuests$;
  quests$: Observable<QuestWithProgressType[]> = this.campaignService.quests$;
  questTypes$: Observable<QuestTypeType[]> = this.questTypeService.infiniteQuestType$;
  advertisers$: Observable<PartnershipNetworkType[]> = this.questTypeService.advertisers$;
  targetsByPartner$: Observable<PartnershipNetworkType[]> = this.questTypeService.targetsByPartner$;
  statData: { icon: string; title: string; value: string; persantage: string; profit: string; bg_color: string; color: string }[];
  selectedAdvertiser: PartnershipNetworkType;
  questTypes: QuestTypeType[];
  selectedQuest: QuestType;
  filterInput: any;

  get pictures(): FormArray {
    return this.questForm.get(['media', 'pictures']) as FormArray;
  }

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private modalService: NgbModal,
    private posService: PosService,
    private formBuilder: FormBuilder,
    private teamService: TeamService,
    private sharedService: SharedService,
    private storageHelper: StorageHelper,
    private amazonS3Helper: AmazonS3Helper,
    private campaignService: CampaignsService,
    private questTypeService: QuestTypeService,
    private changeDetectorRef: ChangeDetectorRef,
    private deleteFileFromAwsGQL: DeleteFileFromAwsGQL,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
    @Inject(DOCUMENT) private document: Document,
    private translate: TranslateService,
  ) {
    this.questTypeService.infiniteQuestType$ = null;
    this.questTypeService.questTypePageIndex = 0;
    this.campaignService.infiniteQuests$ = null;
    this.campaignService.questActivities$ = null;
    this.campaignService.questPageIndex = 0;
    this.questTypeService.parnterPageIndex = 0;
    this.questTypeService.targetsByPartner$ = null;
    this.posService.pos$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pos) => {
      this.pos = pos;
    });
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.campaignService.searchString = searchValues.searchString;
          return this.campaignService.findNonPredefinedQuestsByTarget();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
    this.userSearchInput$
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchString: any) => {
          this.teamService.page = 0;
          this.teamService.infiniteUsers$ = null;
          this.teamService.infiniteTeam$ = null;
          this.teamService.searchString = searchString;
          return this.teamService.searchAccount();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnInit(): void {
    this.sharedService.resetFilter$.pipe(takeUntil(this.unsubscribeAll)).subscribe((reset) => {
      if (reset && this.filterForm) {
        this.filterForm.reset();
        this.formInitialValues = this.filterForm.value;
        this.changeDetectorRef.markForCheck();
      }
    });
    combineLatest([this.translate.get('MENUITEMS.TS.ENGAGEMENT'), this.translate.get('MENUITEMS.TS.CAMPAIGNS')]).pipe(
      rxMap(([engagement, campaigns]) => {
        this.breadCrumbItems = [{ label: engagement }, { label: campaigns, active: true }];
      }),
    );
    this.campaignService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.campaignService.questPageIndex ? this.campaignService.questPageIndex + 1 : 1,
        size: this.campaignService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.campaignService.questPageIndex || 0) * this.campaignService.pageLimit,
        endIndex: Math.min(((this.campaignService.questPageIndex || 0) + 1) * this.campaignService.pageLimit - 1, pagination?.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
    this.sharedService.navigating$ = false;
    this.campaignService.campaignsStats$.pipe(takeUntil(this.unsubscribeAll)).subscribe((campaignsStats) => {
      this.campaignsStats = campaignsStats;
      if (campaignsStats) {
        this.statData = [
          {
            icon: 'bx-dollar-circle',
            title: 'Total Campaigns',
            value: campaignsStats?.campaigns?.value,
            persantage: campaignsStats?.campaigns?.percentage,
            profit: +campaignsStats?.campaigns?.percentage >= 0 ? 'up' : 'down',
            bg_color: +campaignsStats?.campaigns?.percentage >= 0 ? 'success' : 'danger',
            color: 'primary',
          },
          {
            icon: 'bx-wallet',
            title: 'Quest Actions',
            value: campaignsStats?.questActions?.value,
            persantage: campaignsStats?.questActions?.percentage,
            profit: +campaignsStats?.questActions?.percentage >= 0 ? 'up' : 'down',
            bg_color: +campaignsStats?.questActions?.percentage >= 0 ? 'success' : 'danger',
            color: 'danger',
          },
        ];
      }
    });
    this.filterForm = this.formBuilder.group({
      status: [[]],
      number: [],
      advertiser: this.formBuilder.group({
        pos: [undefined],
      }),
      target: this.formBuilder.group({
        pos: [undefined],
      }),
      createdAt: this.formBuilder.group({
        from: [''],
        to: [''],
      }),
      dueDate: this.formBuilder.group({
        from: [''],
        to: [''],
      }),
      users: [[]],
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

  reset() {
    this.filterForm.reset();
  }

  openPreviewQrCode(content: any, campaign: QuestType) {
    this.selectedQuest = campaign;
    this.modalService.open(content);
  }

  clearAdvertiser() {
    this.questForm.get('questType').reset();
    this.questForm.get('advertiser').reset();
    this.questTypeService.questTypePageIndex = 0;
    this.questTypeService.infiniteQuestType$ = null;
    this.questTypeService.searchQuestTypesByTargetWithFilterPaginated().subscribe();
  }

  onChangeAdvertiser(advertiser: PartnershipNetworkType) {
    this.selectedAdvertiser = advertiser;
    this.questTypeService.questTypePageIndex = 0;
    this.questTypeService.infiniteQuestType$ = null;
    this.questForm.get('questType').reset();
    if (advertiser) {
      this.questTypeService.searchQuestTypesByTargetWithFilterPaginated(advertiser?.target?.pos?.id).subscribe();
    } else {
      this.questTypeService.searchQuestTypesByTargetWithFilterPaginated().subscribe();
    }
  }

  loadMoreQuests() {
    this.questTypeService.isLastQuests$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.questTypeService.questTypePageIndex++;
        if (!this.selectedAdvertiser) {
          this.questTypeService.searchQuestTypesByTargetWithFilterPaginated().subscribe();
        } else {
          this.questTypeService.searchQuestTypesByTargetWithFilterPaginated(this.selectedAdvertiser?.target?.pos?.id).subscribe();
        }
      }
    });
  }

  openFilterModal(content: any) {
    this.teamService.infiniteUsers$ = null;
    this.teamService.infiniteTeam$ = null;
    this.teamService.searchString = '';
    this.teamService.page = 0;
    this.questTypeService.parnterPageIndex = 0;
    this.questTypeService.targetsByPartner$ = null;
    this.questTypeService.getPartnershipNetworksByPartnerAndPartnershipPagination().subscribe();
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.teamService.searchAccount().subscribe();
  }

  openCamapaignModal(targetModal: any) {
    this.questTypeService.parnterPageIndex = 0;
    this.questTypeService.targetsByPartner$ = null;
    this.questTypeService.questTypePageIndex = 0;
    this.questTypeService.infiniteQuestType$ = null;
    this.questTypeService.searchQuestTypesByTargetWithFilterPaginated(null, true).subscribe();
    this.questTypeService.getPartnershipNetworksByPartnerAndPartnershipPagination().subscribe();
    this.modalService.open(targetModal, {
      centered: true,
      backdrop: 'static',
      size: 'lg',
    });
    this.questForm = this.formBuilder.group({
      title: [''],
      audience: [''],
      questType: [undefined],
      description: [''],
      advertiser: this.formBuilder.group({
        pos: [undefined],
      }),
      target: this.formBuilder.group({
        pos: [undefined],
      }),
      media: this.formBuilder.group({
        pictures: this.formBuilder.array([
          this.formBuilder.group({
            baseUrl: [''],
            path: [''],
          }),
        ]),
      }),
      status: [QuestStatusEnum.DRAFT],
      category: [],
      sponsored: [false],
    });
    this.initialValues = this.questForm.value;
    this.questForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
      this.isButtonDisabled = isEqual(this.initialValues, values);
    });
  }

  save() {
    let input: any;
    this.isButtonDisabled = true;
    input = {
      ...FormHelper.getDifference(
        omit(this.initialValues, 'media', 'sponsored', 'advertiser'),
        omit(this.questForm.value, 'media', 'sponsored', 'advertiser'),
      ),
      ...(this.initialValues.sponsored === this.questForm.value?.sponsored ? {} : { sponsored: this.questForm.value?.sponsored }),
      ...(this.initialValues.target?.pos !== this.questForm.value?.target?.pos
        ? {
            target: { pos: this.questForm.value?.target?.pos },
            advertiser: { pos: this.storageHelper.getData('posId') },
          }
        : {}),

      ...(isEqual(this.initialValues.media, this.questForm.value?.media) ? {} : { media: this.questForm.value?.media }),
    };
    this.campaignService
      .createQuest(input)
      .pipe(
        catchError(() => {
          this.modalService.dismissAll();

          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res: any) => {
        if (res) {
          this.pagination.length++;
          this.pagination.endIndex++;
          this.modalService.dismissAll();
          this.position();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  saveFilter() {
    this.isFilterButtonDisabled = true;
    const createdAt = {
      ...FormHelper.getNonEmptyValues(this.filterForm.value.createdAt),
    };
    const dueDate = {
      ...FormHelper.getNonEmptyValues(this.filterForm.value.dueDate),
    };
    this.filterInput = {
      ...(keys(dueDate)?.length ? { dueDate } : {}),
      ...(keys(createdAt)?.length ? { createdAt } : {}),
      ...(isEqual(this.formInitialValues.status, this.filterForm.value.status) ? {} : { status: this.filterForm.value.status }),
      ...(isEqual(this.formInitialValues.users, this.filterForm.value.users) ? {} : { users: this.filterForm.value.users }),
      ...(this.filterForm.value?.target?.pos && this.formInitialValues?.target?.pos !== this.filterForm.value?.target?.pos
        ? {
            target: { pos: this.filterForm.value?.target?.pos },
            advertiser: { pos: this.storageHelper.getData('posId') },
          }
        : {}),
    };
    this.modalService.dismissAll();
    if (this.campaignService.questPageIndex > 0) {
      this.campaignService.questPageIndex = 0;
      this.onPageChange(this.campaignService.questPageIndex + 1);
      this.formInitialValues = this.filterForm.value;
      return;
    }
    this.campaignService
      .findNonPredefinedQuestsByTarget(this.filterInput)
      .pipe(
        catchError(() => {
          this.modalService.dismissAll();
          this.translate.get('MENUITEMS.TS.STH_WENT_WRONG').subscribe((text) => {
            this.modalError(text);
            this.changeDetectorRef.markForCheck();
          });
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

  resetFilter() {
    this.filterForm.reset();
    this.changeDetectorRef.markForCheck();
  }

  loadMorePlatforms() {
    this.questTypeService.isLastPartners$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.questTypeService.parnterPageIndex++;
        this.questTypeService.getPartnershipNetworksByPartnerAndPartnershipPagination().subscribe();
      }
    });
  }

  async getStatusDisplay(quest?: QuestType, status?: QuestStatusEnum, field?: string, isChecked = false): Promise<void> {
    const isPlatform = quest?.target?.pos?.id === this.storageHelper.getData('posId');

    switch (status) {
      case QuestStatusEnum.DRAFT:
        this.currentStatus = isPlatform ? [QuestStatusEnum.ONGOING, QuestStatusEnum.IN_REVIEW] : [QuestStatusEnum.IN_REVIEW];
        if (field === 'status') {
          this.updateQuestStatus(quest.id, status);
        }
        break;

      case QuestStatusEnum.IN_REVIEW:
        this.currentStatus = isPlatform
          ? [QuestStatusEnum.ONGOING, QuestStatusEnum.ON_HOLD, QuestStatusEnum.FINISHED]
          : [QuestStatusEnum.ON_HOLD, QuestStatusEnum.FINISHED];
        if (field === 'status') {
          this.updateQuestStatus(quest.id, status);
        }
        break;

      case QuestStatusEnum.ONGOING:
        if (field === 'status' && isChecked) {
          const questCompleted = await this.checkQuestCompleted(quest, field); // Await the checkQuestCompleted call
          if (questCompleted) {
            this.updateQuestStatus(quest.id, status);
          }
        }
        this.currentStatus = [QuestStatusEnum.ON_HOLD, QuestStatusEnum.FINISHED, QuestStatusEnum.IN_REVIEW];
        break;

      case QuestStatusEnum.ON_HOLD:
        this.currentStatus = isPlatform
          ? [QuestStatusEnum.ONGOING, QuestStatusEnum.FINISHED, QuestStatusEnum.IN_REVIEW]
          : [QuestStatusEnum.FINISHED, QuestStatusEnum.IN_REVIEW];
        if (field === 'status') {
          this.updateQuestStatus(quest.id, status);
        }
        break;

      case QuestStatusEnum.FINISHED:
        if (field === 'status' && isChecked) {
          const questCompleted = await this.checkQuestCompleted(quest, field); // Await the checkQuestCompleted call
          if (questCompleted) {
            this.updateQuestStatus(quest.id, status);
          }
        }
        this.currentStatus = [QuestStatusEnum.ON_HOLD];
        break;

      default:
        break;
    }
  }

  async checkQuestCompleted(quest: QuestType, field: string) {
    if (!quest?.remuneration?.length && field === 'status') {
      this.translate.get('MENUITEMS.TS.NO_REMUNERATION').subscribe((text) => {
        this.modalError(text);
        this.changeDetectorRef.markForCheck();
      });
      return;
    }
    if (!quest?.budget?.maxAnswers || (quest?.budget?.maxAnswers === 0 && field === 'status')) {
      this.translate.get('MENUITEMS.TS.NO_QUEST_BUDGET').subscribe((text) => {
        this.modalError(text);
        this.changeDetectorRef.markForCheck();
      });
      return;
    }
    if (!quest?.title && field === 'status') {
      this.translate.get('MENUITEMS.TS.NO_QUEST_TITLE').subscribe((text) => {
        this.modalError(text);
        this.changeDetectorRef.markForCheck();
      });
      return;
    }
    if (!quest?.description && field === 'status') {
      this.translate.get('MENUITEMS.TS.NO_QUEST_DESCRIPTION').subscribe((text) => {
        this.modalError(text);
        this.changeDetectorRef.markForCheck();
      });
      return;
    }
    if (!quest?.startDate && field === 'status') {
      this.translate.get('MENUITEMS.TS.NO_QUEST_START_DATE').subscribe((text) => {
        this.modalError(text);
        this.changeDetectorRef.markForCheck();
      });
      return;
    } else {
      this.currentStatus = [QuestStatusEnum.ON_HOLD, QuestStatusEnum.FINISHED];
      try {
        const res = await firstValueFrom(this.campaignService.getQuestActivitiesByQuestPaginated(quest?.id));
        if (!res?.length) {
          this.translate.get('MENUITEMS.TS.NO_QUEST_ACTIVITY').subscribe((text) => {
            this.modalError(text);
          });
          return false;
        }
        return true;
      } catch (error) {
        this.translate.get('MENUITEMS.TS.FAILED_TO_FIND_QUEST_ACTIVITIES').subscribe((text) => {
          this.modalError(text);
        });
        return false;
      }
    }
    return true;
  }

  updateQuestStatus(questId: string, status: QuestStatusEnum): void {
    this.campaignService
      .updateQuest(questId, { status } as any)
      .pipe(
        catchError(() => {
          this.translate.get('MENUITEMS.TS.STH_WENT_WRONG').subscribe((text) => {
            this.modalError(text);
            this.changeDetectorRef.markForCheck();
          });
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.position();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  resetDate(field1: string, field2: string) {
    this.filterForm.get([field1, field2]).reset();
  }

  loadMoreOwners() {
    this.teamService.isLast$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.teamService.page++;
        this.teamService.getTeam().subscribe();
      }
    });
  }

  getValue(value: number): string {
    return Number.isFinite(value) ? value.toFixed(3) : '0.000';
  }

  loadMoreActivities() {
    this.questTypeService.isLastQuestType$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.questTypeService.pageIndex += 1;
        this.questTypeService.getQuestTypesByTargetPaginated().subscribe();
      }
      this.changeDetectorRef.markForCheck();
    });
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
          const pictureControl = this.pictures.at(0);
          pictureControl.patchValue({
            path: picture.path,
            baseUrl: picture.baseUrl,
          });
          this.changeDetectorRef.markForCheck();
        });
    };
    fileInput.click();
  }

  removePicture(): void {
    const fileName = this.pictures.at(0).value.path;
    this.deleteFileFromAwsGQL.fetch({ fileName }).subscribe(({ data }) => {
      if (data.deleteFileFromAws) {
        const pictureControl = this.pictures.at(0);
        pictureControl.patchValue({
          path: '',
          baseUrl: '',
          width: null,
          height: null,
        });
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  modalError(text) {
    Swal.fire({
      title: 'Oops...',
      text,
      icon: 'error',
      showCancelButton: false,
      confirmButtonColor: 'rgb(3, 142, 220)',
      cancelButtonColor: 'rgb(243, 78, 78)',
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

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.campaignService.questPageIndex = page - 1;
    if (this.pageChanged) {
      this.campaignService.findNonPredefinedQuestsByTarget(this.filterInput).subscribe();
    }
  }

  ngOnDestroy() {
    this.campaignService.searchString = '';
    this.campaignService.questPageIndex = 0;
    this.questTypeService.infiniteQuestType$ = null;
    this.questTypeService.questTypePageIndex = 0;
    this.campaignService.infiniteQuests$ = null;
    this.campaignService.questActivities$ = null;
    this.campaignService.questPageIndex = 0;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
