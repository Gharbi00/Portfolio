import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { Clipboard } from '@angular/cdk/clipboard';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { cloneDeep, filter, find, includes, isEqual, keys, map, omit, random, some, times, values } from 'lodash';
import {
  of,
  take,
  Subject,
  takeUntil,
  switchMap,
  Observable,
  catchError,
  map as rxMap,
  debounceTime,
  combineLatest,
  distinctUntilChanged,
} from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import {
  AudienceCriteriaFieldType,
  AudienceCriteriaType,
  GenerateS3SignedUrlGQL,
  LoyaltySettingsType,
  PluginType,
  QuestTypeAudienceType,
} from '@sifca-monorepo/terminal-generator';
import {
  UserRole,
  CauseType,
  SocialType,
  WalletType,
  QuestTypeType,
  ActivityTypeType,
  QuestionTypeEnum,
  PartnershipTypeEnum,
  PartnershipNetworkType,
} from '@sifca-monorepo/terminal-generator';

import { IPagination } from '@diktup/frontend/models';
import { AmazonS3Helper, FormHelper, StorageHelper } from '@diktup/frontend/helpers';

import { QuestTypeService } from './campaigns.service';
import { IntegrationAppsService } from '../../apps.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { PosService } from '../../../../../core/services/pos.service';
import { AWS_CREDENTIALS } from '../../../../../../environments/environment';
import { SharedService } from '../../../../../shared/services/shared.service';
import { AudiencesService } from '../../../../engagement/audience/audience.service';
import { CampaignsService } from '../../../../engagement/campaigns/campaign/campaigns.service';

@Component({
  selector: 'campaigns',
  templateUrl: './campaigns.component.html',
  styleUrls: ['./campaigns.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignsComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  causePage = 0;
  posId: string;
  initValues: any;
  selectedNav = 1;
  donationPage = 0;
  selectedIndex = 0;
  initialValues: any;
  advertiserPage = 0;
  userExist: boolean;
  pageChanged: boolean;
  causeForm: FormGroup;
  causeInitValues: any;
  saveSuccess: boolean;
  managePartner = false;
  partnerForm: FormGroup;
  partnerInitValues: any;
  pagination: IPagination;
  isButtonDisabled = true;
  campaignForm: FormGroup;
  hasSocialMedia: boolean;
  donationForm: FormGroup;
  hasQuestionType: boolean;
  selectedCause: CauseType;
  isValidQualitative = true;
  selectedCauseType: string;
  causePageChanged: boolean;
  isValidQuantitative = true;
  infiniteCauses: CauseType[];
  selectedPartnerType: string;
  partnershipDonationPage = 0;
  causePagination: IPagination;
  selectedDonationType: string;
  donationPageChanged: boolean;
  createPartnerForm: FormGroup;
  loadingCreateParner: boolean;
  filteredSocials: SocialType[];
  advertiserPageChanged: boolean;
  isPartnerButtonDisabled = true;
  donationPagination: IPagination;
  selectedCampaign: QuestTypeType;
  initcreatePartnerFormValue: any;
  originalCauses: CauseType[] = [];
  advertiserPagination: IPagination;
  criterias: AudienceCriteriaType[];
  selectedDonation: ActivityTypeType;
  isCreatePartnerButtonDisabled = true;
  isCauseButtonDisabled: boolean = true;
  selectedPartner: PartnershipNetworkType;
  partnershipDonationPageChanged: boolean;
  isDonationButtonDisabled: boolean = true;
  questionTypes = values(QuestionTypeEnum);
  filteredActivityTypes: ActivityTypeType[];
  originalCriterias: AudienceCriteriaType[];
  partnershipDonationPagination: IPagination;
  fields: AudienceCriteriaFieldType[][] = [];
  originalFields: AudienceCriteriaFieldType[][] = [];
  causesSearchInput$: Subject<string> = new Subject<string>();
  walletSearchInput$: Subject<string> = new Subject<string>();
  socials$: Observable<SocialType[]> = this.posService.socials$;
  criteriasSearchInput$: Subject<string> = new Subject<string>();
  wallet$: Observable<WalletType[]> = this.loyaltyService.wallet$;
  causes$: Observable<CauseType[]> = this.questTypeService.causes$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  quests$: Observable<QuestTypeType[]> = this.questTypeService.quests$;
  plugin$: Observable<PluginType> = this.integrationAppsService.plugin$;
  loadingCauses$: Observable<boolean> = this.questTypeService.loadingCauses$;
  donations$: Observable<ActivityTypeType[]> = this.questTypeService.donations$;
  infiniteCauses$: Observable<CauseType[]> = this.questTypeService.infiniteCauses$;
  loadingCompaigns$: Observable<boolean> = this.questTypeService.loadingCompaigns$;
  loadingDonations$: Observable<boolean> = this.questTypeService.loadingDonations$;
  loadingAdvertiser$: Observable<boolean> = this.questTypeService.loadingPartnership$;
  advertisers$: Observable<PartnershipNetworkType[]> = this.questTypeService.advertisers$;
  loyaltySettings$: Observable<LoyaltySettingsType> = this.loyaltyService.loyaltySettings$;
  criterias$: Observable<AudienceCriteriaType[]> = this.audiencesService.infinteCriterias$;
  activityTypes$: Observable<ActivityTypeType[]> = this.campaignsService.infiniteActivityTypes$;
  targetsByPartner$: Observable<PartnershipNetworkType[]> = this.questTypeService.targetsByPartner$;
  partnershipDonation$: Observable<PartnershipNetworkType[]> = this.questTypeService.partnershipDonation$;

  get pictures(): FormArray {
    return (this.campaignForm?.get('media') as FormGroup)?.get('pictures') as FormArray;
  }
  get audienceArray(): FormArray {
    return this.campaignForm?.get('audience') as FormArray;
  }
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }
  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private location: Location,
    private clipboard: Clipboard,
    private modalService: NgbModal,
    private posService: PosService,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private sharedService: SharedService,
    private storageHelper: StorageHelper,
    private loyaltyService: LoyaltyService,
    private amazonS3Helper: AmazonS3Helper,
    private questTypeService: QuestTypeService,
    private campaignsService: CampaignsService,
    private audiencesService: AudiencesService,
    private changeDetectorRef: ChangeDetectorRef,
    private integrationAppsService: IntegrationAppsService,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
  ) {
    this.posService.pos$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pos) => {
      this.posId = pos?.id;
    });
    this.criteriasSearchInput$
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchString) => {
          this.audiencesService.criteriasPageIndex = 0;
          this.audiencesService.infinteCriterias$ = null;
          this.audiencesService.criteriaSearchString = searchString;
          return this.audiencesService.getAudienceCriteriasPaginated();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });

    this.walletSearchInput$
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchString) => {
          this.loyaltyService.walletPageIndex = 0;
          this.loyaltyService.wallet$ = null;
          this.loyaltyService.walletSearchString = searchString;
          return this.loyaltyService.quantitativeWalletsByOwnerPagination();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });

    this.audiencesService.infinteCriterias$.pipe(takeUntil(this.unsubscribeAll)).subscribe((criterias) => {
      this.originalCriterias = this.criterias = criterias;
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    this.integrationAppsService.findPluginByURL(this.location.path()).subscribe();
    this.questTypeService.infiniteCauses$.pipe(takeUntil(this.unsubscribeAll)).subscribe((causes) => {
      this.infiniteCauses = causes;
    });
    this.questTypeService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.questTypeService.pageIndex || 0,
        size: this.questTypeService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.questTypeService.pageIndex || 0) * this.questTypeService.pageLimit,
        endIndex: Math.min(((this.questTypeService.pageIndex || 0) + 1) * this.questTypeService.pageLimit - 1, pagination?.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
    this.questTypeService.causePagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.causePagination = {
        length: pagination?.length,
        page: this.questTypeService.causesPageIndex || 0,
        size: this.questTypeService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.questTypeService.causesPageIndex || 0) * this.questTypeService.pageLimit,
        endIndex: Math.min(((this.questTypeService.causesPageIndex || 0) + 1) * this.questTypeService.pageLimit - 1, pagination?.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
    this.questTypeService.donationPagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.donationPagination = {
        length: pagination?.length,
        page: this.questTypeService.donationPageIndex || 0,
        size: this.questTypeService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.questTypeService.donationPageIndex || 0) * this.questTypeService.pageLimit,
        endIndex: Math.min(((this.questTypeService.donationPageIndex || 0) + 1) * this.questTypeService.pageLimit - 1, pagination?.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
    this.questTypeService.advertiserPagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.advertiserPagination = {
        length: pagination?.length,
        page: this.questTypeService.advertiserPageIndex || 0,
        size: this.questTypeService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.questTypeService.advertiserPageIndex || 0) * this.questTypeService.pageLimit,
        endIndex: Math.min(((this.questTypeService.advertiserPageIndex || 0) + 1) * this.questTypeService.pageLimit - 1, pagination?.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
    this.questTypeService.partnershipDonationPagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.partnershipDonationPagination = {
        length: pagination?.length,
        page: this.questTypeService.partnershipDonationPageIndex || 0,
        size: this.questTypeService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.questTypeService.partnershipDonationPageIndex || 0) * this.questTypeService.pageLimit,
        endIndex: Math.min(
          ((this.questTypeService.partnershipDonationPageIndex || 0) + 1) * this.questTypeService.pageLimit - 1,
          pagination?.length - 1,
        ),
      };
      this.changeDetectorRef.markForCheck();
    });
    this.causesSearchInput$
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchString) => {
          this.filterCauses(searchString);
          return of(this.infiniteCauses);
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
    this.changeDetectorRef.markForCheck();
  }

  ngAfterViewInit() {
    combineLatest([
      this.campaignsService.getNonPredefinedActivityTypesPaginated(),
      this.questTypeService.getCausesByTargetPaginated(),
      this.questTypeService.getDonationActivityTypesByTargetPaginated(),
      this.questTypeService.getPartnershipNetworksByTargetAndPartnershipPagination(PartnershipTypeEnum.ADVERTISER),
      this.questTypeService.getPartnershipNetworksByTargetAndPartnershipPagination(PartnershipTypeEnum.DONATION),
      this.loyaltyService.quantitativeWalletsByOwnerPagination(),
      this.loyaltyService.findLoyaltySettingsByTarget(),
      this.posService.findSocialsPagination(),
      this.audiencesService.getAudienceCriteriasPaginated(),
    ]).subscribe();
  }

  onChangeCriteria(criteria: any, audienceControl: FormControl) {
    const fieldsArray = audienceControl.get('fields') as FormArray;
    while (fieldsArray.length !== 0) {
      fieldsArray.removeAt(0);
    }
    fieldsArray.push(
      new FormGroup({
        field: new FormControl(undefined),
        operators: new FormControl(undefined),
      })
    );
    this.changeDetectorRef.markForCheck();
  }

  calculateAmount(formValue: number) {
    return formValue * +this.campaignForm.get('wallet').value.coin?.unitValue?.amount;
  }

  onCampaignTabChange(event: any) {
    this.selectedNav = +event.nextId;
    this.changeDetectorRef.markForCheck();
  }

  openCampaignModal(content: any, campaign: QuestTypeType) {
    this.selectedNav = 1;
    this.questTypeService.parnterPageIndex = 0;
    this.questTypeService.targetsByPartner$ = null;
    this.questTypeService.getPartnershipNetworksByPartnerAndPartnershipPagination().subscribe();
    this.selectedCampaign = campaign;
    this.activityTypes$
      .pipe(
        take(1),
        rxMap((activityTypes) => {
          return activityTypes?.filter((activityType) => {
            const typeTitle = (activityType?.title || '').toLowerCase().trim();
            return !campaign?.activityTypes.some((type) => {
              const campaignTypeTitle = (type.title || '').toLowerCase().trim();
              return campaignTypeTitle === typeTitle;
            });
          });
        }),
      )
      .subscribe((filteredActivityTypes) => {
        if (filteredActivityTypes?.length) {
          this.filteredActivityTypes = filteredActivityTypes;
          this.hasQuestionType = filteredActivityTypes.every((item) => item.code !== 'QUESTION');
          this.hasSocialMedia = filteredActivityTypes.every((item) => item.code !== 'SOCIAL_MEDIA');
        }
      });

    this.socials$
      .pipe(
        take(1),
        rxMap((socials) => {
          return socials?.filter((social) => {
            const typeTitle = (social?.name || '').toLowerCase().trim();
            return !campaign?.social.some((type) => {
              const socialTypeTitle = (type.name || '').toLowerCase().trim();
              return socialTypeTitle === typeTitle;
            });
          });
        }),
      )
      .subscribe((filteredSocials) => {
        this.filteredSocials = filteredSocials;
      });
    this.modalService.open(content, { size: 'xl', centered: true });
    this.campaignForm = this.formBuilder.group({
      media: this.formBuilder.group({
        pictures: this.formBuilder.array([
          this.formBuilder.group({
            baseUrl: [campaign?.media?.pictures?.length ? campaign?.media?.pictures[0]?.baseUrl : ''],
            path: [campaign?.media?.pictures?.length ? campaign?.media?.pictures[0]?.path : ''],
          }),
        ]),
      }),
      title: [campaign?.title || ''],
      wallet: [campaign?.wallet || undefined, Validators.required],
      questionTypes: [campaign?.questionTypes || []],
      social: [campaign?.social?.length ? campaign?.social : []],
      maxQuestions: [campaign?.maxQuestions || undefined],
      description: [campaign?.description || ''],
      maxActivities: [campaign?.maxActivities || 0],
      advertiser: this.formBuilder.group({
        pos: [campaign?.advertiser?.pos?.id],
      }),
      activityTypes: [campaign?.activityTypes || []],
      qualitative: this.formBuilder.group({
        min: [campaign?.qualitative?.min || ''],
        max: [campaign?.qualitative?.max || ''],
      }),
      quantitative: this.formBuilder.group({
        min: [campaign?.quantitative?.min || ''],
        max: [campaign?.quantitative?.max || ''],
      }),
      transition: [campaign?.transition || false],
      enable: [campaign?.enable || false],
      audience: this.formBuilder.array(
        campaign?.audience?.length
          ? map(campaign?.audience, (item) => {
              return this.formBuilder.group({
                criteria: [item?.criteria || ''],
                fields: this.formBuilder.array(
                  item?.fields?.length
                    ? map(item?.fields, (field) => {
                        return this.formBuilder.group({
                          field: [field?.field || undefined],
                          operators: [field?.operators || undefined],
                        });
                      })
                    : [
                        this.formBuilder.group({
                          field: [undefined],
                          operators: [undefined],
                        }),
                      ],
                ),
              });
            })
          : [
              this.formBuilder.group({
                criteria: [undefined],
                fields: this.formBuilder.array([
                  this.formBuilder.group({
                    field: [undefined],
                    operators: [undefined],
                  }),
                ]),
              }),
            ],
      ),
    });
    this.refreshFields();
    this.audienceArray.controls.forEach((audienceControl, index) => {
      const criteriaControl = audienceControl.get('criteria');
      const fieldsControl = audienceControl.get('fields') as FormArray;
      const existingFields = criteriaControl?.value?.fields || [];
      this.originalFields[index] = existingFields;
      this.fields[index] = filter(existingFields, (field) => {
        return !some(fieldsControl.value, (existingField) => existingField.field === field.field);
      });
      this.changeDetectorRef.markForCheck();
    });
    this.initialValues = this.campaignForm.value;
    this.audienceArray.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values: QuestTypeAudienceType[]) => {
      this.criterias = filter(this.originalCriterias, (criteria) => {
        return !some(values, (value) => value.criteria?.id === criteria.id);
      });
    });
    this.campaignForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
      this.isButtonDisabled = isEqual(this.initialValues, values);
      this.isValidQuantitative = values?.quantitative?.max && +values?.quantitative?.max <= +values?.quantitative?.min ? false : true;
      this.isValidQualitative = values?.qualitative?.max && +values?.qualitative?.max <= +values?.qualitative?.min ? false : true;
      this.changeDetectorRef.markForCheck();
    });
    this.campaignForm
      .get('quantitative')
      .valueChanges.pipe(takeUntil(this.unsubscribeAll))
      .subscribe((values) => {
        this.isValidQuantitative = values?.max && +values?.max <= +values?.min ? false : true;
      });
    this.campaignForm
      .get('qualitative')
      .valueChanges.pipe(takeUntil(this.unsubscribeAll))
      .subscribe((values) => {
        this.isValidQualitative = isEqual(this.initialValues.qualitative, values);
      });
    this.campaignForm
      .get('activityTypes')
      .valueChanges.pipe(takeUntil(this.unsubscribeAll))
      .subscribe((val) => {
        this.activityTypes$
          .pipe(
            take(1),
            rxMap((activityTypes) => {
              return activityTypes.filter((activityType) => {
                const typeTitle = (activityType?.title || '').toLowerCase().trim();
                return !val.some((type) => {
                  const campaignTypeTitle = (type.title || '').toLowerCase().trim();
                  return campaignTypeTitle === typeTitle;
                });
              });
            }),
          )
          .subscribe((filteredActivityTypes) => {
            this.filteredActivityTypes = filteredActivityTypes;
            this.hasQuestionType = filteredActivityTypes.every((item) => item.code !== 'QUESTION');
            this.hasSocialMedia = filteredActivityTypes.every((item) => item.code !== 'SOCIAL_MEDIA');
            if (!this.hasQuestionType) {
              this.campaignForm.get('maxQuestions').reset();
              this.campaignForm.get('questionTypes').reset();
            }
          });
      });

    this.campaignForm
      .get('social')
      .valueChanges.pipe(takeUntil(this.unsubscribeAll))
      .subscribe((val) => {
        this.socials$
          .pipe(
            take(1),
            rxMap((socials) => {
              return socials?.filter((social) => {
                const typeTitle = (social?.name || '').toLowerCase().trim();
                return !val.some((type) => {
                  const socialTypeTitle = (type.name || '').toLowerCase().trim();
                  return socialTypeTitle === typeTitle;
                });
              });
            }),
          )
          .subscribe((filteredSocials) => {
            this.filteredSocials = filteredSocials;
          });
      });
    this.changeDetectorRef.detectChanges();
  }

  onChangeAdvertiser(advertiser: PartnershipNetworkType) {
    this.loyaltyService.walletPageIndex = 0;
    this.loyaltyService.wallet$ = null;
    this.loyaltyService.quantitativeWalletsByOwnerPagination(advertiser?.partner?.pos?.id).subscribe();
  }

  refreshFields() {
    this.audienceArray.controls.forEach((audienceControl, index) => {
      const criteriaControl = audienceControl.get('criteria');
      const fieldsControl = audienceControl.get('fields') as FormArray;
      const existingFields = criteriaControl?.value?.fields || [];
      this.originalFields[index] = existingFields;
      this.fields[index] = filter(existingFields, (field) => {
        return !some(fieldsControl.value, (existingField) => existingField.field === field.field);
      });
      this.changeDetectorRef.markForCheck();
    });
  }

  enableAll(index: number) {
    const fieldsControl = this.audienceArray.at(index).get('fields') as FormArray;
    fieldsControl.reset();
    if (!this.originalFields?.[this.selectedIndex]) {
      this.originalFields[this.selectedIndex] = this.criterias?.[0]?.fields;
    }
    this.originalFields[this.selectedIndex].forEach((field, i) => {
      if (fieldsControl.at(i)) {
        fieldsControl.at(i).patchValue({
          field: field?.field,
          operators: field?.operators,
        });
      } else {
        fieldsControl.push(
          this.formBuilder.group({
            field: [field?.field],
            operators: [field?.operators],
          }),
        );
      }
    });
    this.refreshFields();
  }

  onSelectAudience(index: number) {
    this.selectedIndex = index;
    this.audienceArray
      .at(this.selectedIndex)
      .get('criteria')
      .valueChanges.pipe(takeUntil(this.unsubscribeAll))
      .subscribe((values) => {
        this.audienceArray.at(this.selectedIndex).get('fields').reset();
        this.originalFields[this.selectedIndex] = this.fields[this.selectedIndex] = values?.fields;
        this.changeDetectorRef.markForCheck();
      });

    this.audienceArray
      .at(this.selectedIndex)
      .get('fields')
      .valueChanges.pipe(takeUntil(this.unsubscribeAll))
      .subscribe((values) => {
        const filteredFields: any = filter(this.originalFields[this.selectedIndex], (item) => {
          return !some(this.audienceArray.value[this.selectedIndex].fields, (field) => field.field === item.field);
        });
        this.fields[this.selectedIndex] = filteredFields;
      });
  }

  addAudienceField() {
    this.audienceArray.push(
      this.formBuilder.group({
        criteria: [undefined],
        fields: this.formBuilder.array([
          this.formBuilder.group({
            field: [undefined],
            operators: [undefined],
          }),
        ]),
      }),
    );
    this.changeDetectorRef.markForCheck();
  }

  removeAudienceField(index: number) {
    this.audienceArray.removeAt(index);
    this.fields.splice(index, 1);
    this.changeDetectorRef.markForCheck();
  }

  addField(i: number) {
    (this.audienceArray.at(i).get('fields') as FormArray).push(
      this.formBuilder.group({
        field: [undefined],
        operators: [undefined],
      }),
    );
    this.changeDetectorRef.markForCheck();
  }

  removeField(i: number, j: number) {
    (this.audienceArray.at(i).get('fields') as FormArray).removeAt(j);
    this.changeDetectorRef.markForCheck();
  }

  onFindOperators(index: number, j: number) {
    return find(this.audienceArray?.value[index].criteria?.fields, (field) => field?.field === this.audienceArray?.value[index].fields[j].field)
      ?.operators;
  }

  resetField(i: number, j: number) {
    this.audienceArray.get([i, 'fields', j, 'operators']).reset();
    this.changeDetectorRef.markForCheck();
  }

  onChangeStatus(checked: boolean, campaign: QuestTypeType) {
    this.selectedCampaign = campaign;
    this.updateQuestType({ enable: checked });
  }

  openPartnershipModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.partnerForm = this.formBuilder.group({
      partner: this.formBuilder.group({
        pos: [''],
      }),
    });
    this.partnerInitValues = this.partnerForm.value;
    this.partnerForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
      this.isPartnerButtonDisabled = isEqual(this.partnerInitValues, values);
      this.changeDetectorRef.markForCheck();
    });
  }

  openCreatePartnershipModal(content: any) {
    this.saveSuccess = false;
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
    this.createPartnerForm = this.formBuilder.group({
      partner: this.formBuilder.group({
        user: this.formBuilder.group({
          email: ['', [Validators.required, Validators.email]],
          firstName: ['', Validators.required],
          lastName: ['', Validators.required],
          // password: [this.getRandomString(10)],
          // roles: [[UserRole.POS_MANAGER, UserRole.POS_OWNER]],
        }),
        pos: this.formBuilder.group({
          email: ['', [Validators.required, Validators.email]],
          title: [''],
          name: ['', Validators.required],
        }),
      }),
    });
    this.initcreatePartnerFormValue = this.createPartnerForm.value;
    this.createPartnerForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
      this.isCreatePartnerButtonDisabled = isEqual(values, this.initcreatePartnerFormValue);
    });
  }

  openPartnerDeleteModal(content: any, partner) {
    this.selectedPartner = partner;
    this.modalService.open(content, { centered: true });
  }

  deletePartnershipNetwork() {
    const partner = this.selectedPartnerType === 'advertiser' ? PartnershipTypeEnum.ADVERTISER : PartnershipTypeEnum.DONATION;
    this.questTypeService
      .deletePartnershipNetwork(this.selectedPartner.id, partner)
      .pipe(
        catchError(() => {
          this.modalService.dismissAll();
          this.modalError();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          if (this.selectedPartnerType === 'advertiser') {
            this.advertiserPagination.length--;
            this.advertiserPagination.endIndex--;
          } else {
            this.partnershipDonationPagination.length--;
            this.partnershipDonationPagination.endIndex--;
          }
          this.modalService.dismissAll();
          this.position();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  createPartnership() {
    this.userExist = false;
    this.loadingCreateParner = true;
    this.isCreatePartnerButtonDisabled = true;
    const input: any = {
      ...FormHelper.getChangedValues(this.createPartnerForm.value, this.initcreatePartnerFormValue),
      partner: {
        ...omit(this.createPartnerForm.get('partner').value, 'user'),
        user: {
          ...omit(this.createPartnerForm.get(['partner', 'user']).value, 'password'),
          password: this.getRandomString(10),
          roles: [UserRole.POS_MANAGER, UserRole.POS_OWNER],
        },
      },
      ...(this.selectedPartnerType === 'advertiser'
        ? { partnership: [PartnershipTypeEnum.ADVERTISER] }
        : { partnership: [PartnershipTypeEnum.DONATION] }),
    };
    this.questTypeService
      .createPartnershipNetwork(input)
      .pipe(
        catchError((error) => {
          const err = find(error.graphQLErrors, (er) => {
            return er?.extensions?.exception?.response?.error.includes('login already exists.');
          });
          if (err) {
            this.userExist = true;
          }
          this.loadingCreateParner = false;
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
        switchMap((res) => {
          if (res && this.managePartner) {
            return this.questTypeService.addTargetsToAccount(this.storageHelper.getData('currentUserId'), res.id);
          }
          return of(null);
        }),
        catchError(() => {
          this.loadingCreateParner = false;
          this.changeDetectorRef.markForCheck();
          return of(null);
        })
      )
      .subscribe((res) => {
        if (res) {
          this.saveSuccess = true;
          this.loadingCreateParner = false;
          if (this.selectedPartnerType === 'advertiser') {
            this.advertiserPagination.length++;
            this.advertiserPagination.endIndex++;
          } else {
            this.partnershipDonationPagination.length++;
            this.partnershipDonationPagination.endIndex++;
          }
          this.modalService.dismissAll();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  getRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return times(length, () => characters[random(characters.length - 1)]).join('');
  }

  onTabChange(field: string) {
    this.selectedPartnerType = field;
  }

  invitePartner() {
    let errorMessage;
    this.isPartnerButtonDisabled = true;
    const input: any = {
      ...FormHelper.getChangedValues(this.partnerForm.value, this.partnerInitValues),
      ...(this.selectedPartnerType === 'advertiser'
        ? { partnership: [PartnershipTypeEnum.ADVERTISER] }
        : { partnership: [PartnershipTypeEnum.DONATION] }),
    };
    this.questTypeService
      .invitePartnerToNetwork(input)
      .pipe(
        catchError((error) => {
          this.translate.get(['SHARED.SHOULD_NOT_BE_EQUAL', 'SHARED.DIFFERENT_VALUE']).subscribe((translations) => {
            const errorMessageResponse = error.graphQLErrors?.[0]?.extensions?.response?.message?.[0];
            const exceptionError = error.graphQLErrors?.[0]?.extensions?.exception?.response?.error;
            if (errorMessageResponse && includes(errorMessageResponse, translations['SHARED.SHOULD_NOT_BE_EQUAL'])) {
              errorMessage = translations['SHARED.DIFFERENT_VALUE'];
            } else if (exceptionError) {
              errorMessage = exceptionError;
            }
            this.modalError(errorMessage);
          });
          this.modalService.dismissAll();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.position();
          this.modalService.dismissAll();
          if (this.selectedPartnerType === 'advertiser') {
            this.advertiserPagination.length++;
            this.advertiserPagination.endIndex++;
          } else {
            this.partnershipDonationPagination.length++;
            this.partnershipDonationPagination.endIndex++;
          }
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  filterCauses(searchTerm: string) {
    if (!this.originalCauses.length) {
      this.originalCauses = [...this.infiniteCauses];
    }
    this.infiniteCauses = filter(this.originalCauses, (state) => state.title.toLowerCase().includes(searchTerm?.toLowerCase()));
  }

  openDonationModal(content: any, activity: ActivityTypeType) {
    this.questTypeService.infinteCausesPageIndex = 0;
    this.questTypeService.infiniteCauses$ = null;
    this.infiniteCauses = [];
    this.originalCauses = [];
    this.questTypeService.getInfiniteCauses().subscribe();
    this.selectedDonation = activity;
    this.selectedDonationType = activity?.media?.pictures?.length && activity?.media?.pictures?.[0]?.baseUrl !== '' ? 'picture' : 'icon';
    this.modalService.open(content, { size: 'lg', centered: true });
    this.donationForm = this.formBuilder.group({
      title: [activity?.title || ''],
      code: [activity?.code || ''],
      description: [activity?.description || ''],
      icon: [activity?.icon || ''],
      theme: [activity?.theme || ''],
      media: this.formBuilder.group({
        pictures: this.formBuilder.array([
          this.formBuilder.group({
            baseUrl: [activity?.media?.pictures?.length ? activity?.media?.pictures[0]?.baseUrl : ''],
            path: [activity?.media?.pictures?.length ? activity?.media?.pictures[0]?.path : ''],
          }),
        ]),
      }),
      donation: this.formBuilder.group({
        cause: [activity?.donation?.cause || undefined],
      }),
    });
    this.initValues = this.donationForm.value;
    this.donationForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
      this.isDonationButtonDisabled = isEqual(this.initValues, values);
      this.changeDetectorRef.markForCheck();
    });
  }

  saveDonation() {
    let field = this.selectedDonation ? 'updateActivityType' : 'createActivityType';
    this.isDonationButtonDisabled = true;
    const input: any = {
      ...FormHelper.getDifference(omit(this.initValues, 'media', 'donation', 'icon'), omit(this.donationForm.value, 'media', 'donation', 'icon')),
      ...(this.initValues.donation?.cause?.id !== this.donationForm.value.donation?.cause?.id
        ? { donation: { cause: this.donationForm.value.donation?.cause?.id } }
        : {}),
      ...(this.selectedDonationType === 'icon' && this.donationForm.get('icon').value !== this.initValues.icon
        ? {
            icon: this.donationForm.get('icon').value,
          }
        : {}),
      ...(this.selectedDonationType === 'picture' && this.donationForm.get(['media', 'pictures']).value[0] !== this.initValues.media?.pictures[0]
        ? {
            media: this.donationForm.get('media').value,
          }
        : {}),
    };
    const args = this.selectedDonation ? [this.selectedDonation.id, input] : [input];
    this.updateOrCreateDonation(args, field);
  }

  openCauseModal(content: any, cause: CauseType) {
    this.selectedCauseType = cause?.media?.pictures?.length && cause?.media?.pictures?.[0]?.baseUrl !== '' ? 'picture' : 'icon';
    this.selectedCause = cause;
    this.modalService.open(content, { size: 'lg', centered: true });
    this.causeForm = this.formBuilder.group({
      title: [cause?.title || ''],
      code: [cause?.code || ''],
      description: [cause?.description || ''],
      icon: [cause?.icon || ''],
      qualitativeRatio: [cause?.qualitativeRatio || ''],
      coin: [cause?.coin?.id || undefined],
      media: this.formBuilder.group({
        pictures: this.formBuilder.array([
          this.formBuilder.group({
            baseUrl: [cause?.media?.pictures?.length ? cause?.media?.pictures[0]?.baseUrl : ''],
            path: [cause?.media?.pictures?.length ? cause?.media?.pictures[0]?.path : ''],
          }),
        ]),
      }),
    });
    this.causeInitValues = this.causeForm.value;
    this.causeForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
      this.isCauseButtonDisabled = isEqual(this.causeInitValues, values);
      this.changeDetectorRef.markForCheck();
    });
  }

  updateOrCreateDonation(args: any, field: string) {
    this.questTypeService[field](...args)
      .pipe(
        catchError(() => {
          this.modalService.dismissAll();
          this.modalError();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          if (field === 'createActivityType') {
            this.donationPagination.length++;
            this.donationPagination.endIndex++;
          }
          this.modalService.dismissAll();
          this.position();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  updateCause(args: any, field: string) {
    this.questTypeService[field](...args)
      .pipe(
        catchError(() => {
          this.modalService.dismissAll();
          this.modalError();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          if (field === 'createActivityType') {
            this.causePagination.length++;
            this.causePagination.endIndex++;
          }
          this.modalService.dismissAll();
          this.position();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  saveCause() {
    let field = this.selectedCause ? 'updateCause' : 'createCause';
    this.isCauseButtonDisabled = true;
    const input: any = {
      ...FormHelper.getDifference(
        omit(this.causeInitValues, 'media', 'icon', 'coin', 'qualitativeRatio'),
        omit(this.causeForm.value, 'media', 'icon', 'coin', 'qualitativeRatio'),
      ),
      ...(this.causeInitValues?.coin === this.causeForm.value.coin ? {} : { coin: this.causeForm.value.coin }),
      ...(this.causeInitValues?.qualitativeRatio === this.causeForm.value.qualitativeRatio
        ? {}
        : { qualitativeRatio: this.causeForm.value.qualitativeRatio.toString() }),
      ...(this.selectedCauseType === 'icon' && this.causeForm.get('icon').value !== this.causeInitValues.icon
        ? {
            icon: this.causeForm.get('icon').value,
          }
        : {}),
      ...(this.selectedCauseType === 'picture' && this.causeForm.get(['media', 'pictures']).value[0] !== this.causeInitValues.media?.pictures[0]
        ? {
            media: this.causeForm.get('media').value,
          }
        : {}),
    };
    const args = this.selectedCause ? [this.selectedCause.id, input] : [input];
    this.updateCause(args, field);
  }

  copyText(textToCopy: string) {
    this.clipboard.copy(textToCopy);
  }

  loadMoreWallets() {
    this.loyaltyService.isLastWallet$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.loyaltyService.walletPageIndex++;
        this.loyaltyService.quantitativeWalletsByOwnerPagination().subscribe();
      }
    });
  }

  loadMoreAdvertisers() {
    this.questTypeService.isLastPartners$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.questTypeService.parnterPageIndex++;
        this.questTypeService.getPartnershipNetworksByPartnerAndPartnershipPagination().subscribe();
      }
    });
  }

  loadMoreCauses() {
    this.questTypeService.isLastCauses$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.questTypeService.infinteCausesPageIndex++;
        this.questTypeService.getInfiniteCauses().subscribe();
      }
    });
  }

  getClassForItem(item: string): string {
    switch (item) {
      case 'SHORT_ANSWER':
        return 'ri-question-answer-line text-success';
      case 'PARAGRAPH':
        return 'ri-paragraph text-info';
      case 'MULTIPLE_CHOICE':
        return 'ri-checkbox-multiple-line text-warning';
      case 'SINGLE_CHOICE':
        return 'ri-checkbox-line text-danger';
      case 'PICTURE':
        return 'ri-image-line text-success';
      case 'DATETIME':
        return 'ri-calendar-line text-info';
      case 'NUMBER':
        return 'ri-numbers-line text-warning';
      case 'RATING':
        return 'ri-star-line text-success';
      case 'SMILEY':
        return 'ri-emotion-happy-line text-danger';
      case 'TOGGLE':
        return 'ri-toggle-line text-success';
      default:
        return '';
    }
  }

  openDeleteModal(content: any, item: any, field?: string) {
    if (field === 'campaign') {
      this.selectedCampaign = item;
      this.selectedCause = null;
      this.selectedDonation = null;
    } else if (field === 'cause') {
      this.selectedCampaign = null;
      this.selectedDonation = null;
      this.selectedCause = item;
    } else if (field === 'donation') {
      this.selectedCampaign = null;
      this.selectedCause = null;
      this.selectedDonation = item;
    }
    this.modalService.open(content, { centered: true });
  }

  deleteCause() {
    this.questTypeService
      .deleteCause(this.selectedCause.id)
      .pipe(
        catchError(() => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe(() => {
        this.causePagination.length--;
        this.causePagination.endIndex--;
        this.position();
        this.modalService.dismissAll();
      });
  }

  deleteDonation() {
    this.questTypeService
      .deleteActivityType(this.selectedDonation.id)
      .pipe(
        catchError(() => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe(() => {
        this.donationPagination.length--;
        this.donationPagination.endIndex--;
        this.position();
        this.modalService.dismissAll();
      });
  }

  deleteQuestType() {
    this.questTypeService
      .deleteQuestType(this.selectedCampaign.id)
      .pipe(
        catchError(() => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe(() => {
        this.pagination.length--;
        this.pagination.endIndex--;
        this.position();
        this.modalService.dismissAll();
      });
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.questTypeService.pageIndex = page - 1;
    if (this.pageChanged) {
      this.questTypeService.getQuestTypesByTargetPaginated().subscribe();
    }
  }

  onPartnershipAdvertiserPageChange(page: number) {
    this.advertiserPage = page;
    if (page > 1) {
      this.advertiserPageChanged = true;
    }
    this.questTypeService.advertiserPageIndex = page - 1;
    if (this.advertiserPageChanged) {
      this.questTypeService.getPartnershipNetworksByTargetAndPartnershipPagination(PartnershipTypeEnum.ADVERTISER).subscribe();
    }
  }

  onPartnershipDonationPageChange(page: number) {
    this.partnershipDonationPage = page;
    if (page > 1) {
      this.partnershipDonationPageChanged = true;
    }
    this.questTypeService.partnershipDonationPageIndex = page - 1;
    if (this.partnershipDonationPageChanged) {
      this.questTypeService.getPartnershipNetworksByTargetAndPartnershipPagination(PartnershipTypeEnum.DONATION).subscribe();
    }
  }

  onCausePageChange(page: number) {
    this.causePage = page;
    if (this.causePage > 1) {
      this.causePageChanged = true;
    }
    this.questTypeService.causesPageIndex = page - 1;
    if (this.causePageChanged) {
      this.questTypeService.getCausesByTargetPaginated().subscribe();
    }
  }

  onDonationPageChange(page: number) {
    this.donationPage = page;
    if (this.donationPage > 1) {
      this.donationPageChanged = true;
    }
    this.questTypeService.donationPageIndex = page - 1;
    if (this.donationPageChanged) {
      this.questTypeService.getDonationActivityTypesByTargetPaginated().subscribe();
    }
  }

  loadMoreActivities() {
    this.campaignsService.isLastActivityType$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.campaignsService.activityPageIndex += 1;
        this.campaignsService.getNonPredefinedActivityTypesPaginated().subscribe();
      }
      this.changeDetectorRef.markForCheck();
    });
  }

  save() {
    let input: any;
    this.isButtonDisabled = true;
    const audience = map(this.audienceArray.value as QuestTypeAudienceType[], (item) => {
      const fields = item?.fields?.filter((field) => field?.field) || [];
      return {
        ...(fields.length > 0 ? { fields } : {}),
        ...(item?.criteria?.id ? { criteria: item?.criteria?.id } : {}),
      };
    }).filter((item) => Object.keys(item).length > 0);
    const activities = {
      activityTypes: this.campaignForm.value?.activityTypes?.length ? this.campaignForm.value?.activityTypes.map((act) => act?.id) : [''],
    };
    const quantitative = {
      ...FormHelper.getDifference(this.initialValues.quantitative, this.campaignForm.value.quantitative),
    };
    const qualitative = {
      ...FormHelper.getDifference(this.initialValues.qualitative, this.campaignForm.value.qualitative),
    };
    input = {
      ...FormHelper.getDifference(
        omit(this.initialValues, 'media', 'activityTypes', 'enable', 'transition', 'quantitative', 'qualitative', 'wallet', 'social', 'advertiser'),
        omit(
          this.campaignForm.value,
          'media',
          'activityTypes',
          'enable',
          'transition',
          'quantitative',
          'qualitative',
          'wallet',
          'social',
          'advertiser',
          'audience',
        ),
      ),
      ...(audience?.length ? { audience } : {}),
      ...(keys(qualitative)?.length ? { qualitative } : {}),
      ...(keys(quantitative)?.length ? { quantitative } : {}),
      ...(this.campaignForm.value?.enable === this.initialValues?.enable ? {} : { enable: this.campaignForm.value?.enable }),
      ...(this.initialValues.advertiser?.pos === this.campaignForm.value?.advertiser?.pos
        ? {}
        : { advertiser: { pos: this.campaignForm.value?.advertiser?.pos } }),
      ...(this.campaignForm.value?.wallet?.id === this.initialValues?.wallet?.id ? {} : { wallet: this.campaignForm.value?.wallet?.id }),
      ...(this.campaignForm.value?.transition === this.initialValues?.transition ? {} : { transition: this.campaignForm.value?.transition }),
      ...(isEqual(
        this.initialValues?.social?.length ? cloneDeep(map(this.initialValues?.social, 'id')) : [],
        this.campaignForm.value?.social?.length ? map(this.campaignForm.value?.social, 'id') : [],
      )
        ? {}
        : { social: map(this.campaignForm.value?.social, 'id') }),
      ...(isEqual(
        this.initialValues?.activityTypes?.length ? cloneDeep(map(this.initialValues?.activityTypes, 'id')) : [],
        this.campaignForm.value?.activityTypes?.length ? map(this.campaignForm.value?.activityTypes, 'id') : [],
      )
        ? {}
        : { activityTypes: activities?.activityTypes }),
      ...(isEqual(this.initialValues?.media, this.campaignForm.value?.media) ? {} : { media: this.campaignForm.value?.media }),
    };
    if (this.selectedCampaign) {
      this.questTypeService
        .updateQuestType(this.selectedCampaign?.id, input)
        .pipe(
          catchError(() => {
            this.modalService.dismissAll();
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
          }),
        )
        .subscribe((res: any) => {
          if (res) {
            this.modalService.dismissAll();
            this.position();
            this.changeDetectorRef.markForCheck();
          }
        });
    } else {
      this.questTypeService
        .createQuestType(input)
        .pipe(
          catchError(() => {
            this.modalService.dismissAll();
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
          }),
        )
        .subscribe((res: any) => {
          if (res) {
            this.pagination.length++;
            this.pagination.endIndex++;
            this.position();
            this.modalService.dismissAll();
            this.changeDetectorRef.markForCheck();
          }
        });
    }
  }

  upload(field: string): void {
    const fileInput = document.createElement('input');
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
          if (field === 'campaign') {
            const input: any = {
              pictures: [
                {
                  path: picture.path,
                  baseUrl: picture.baseUrl,
                },
              ],
            };
            this.pictures.at(0).patchValue({
              path: picture.path,
              baseUrl: picture.baseUrl,
            });
            if (this.selectedCampaign) {
              this.updateQuestType({ media: input });
            }
          } else if (field === 'cause') {
            const input: any = {
              media: {
                pictures: [
                  {
                    path: picture.path,
                    baseUrl: picture.baseUrl,
                  },
                ],
              },
            };
            (this.causeForm.get(['media', 'pictures']) as FormArray).at(0).patchValue({
              path: picture.path,
              baseUrl: picture.baseUrl,
            });
            if (this.selectedCause) {
              this.updateCause([this.selectedCause.id, input], 'updateCause');
            }
          } else if (field === 'donation') {
            const input: any = {
              media: {
                pictures: [
                  {
                    path: picture.path,
                    baseUrl: picture.baseUrl,
                  },
                ],
              },
            };
            (this.donationForm.get(['media', 'pictures']) as FormArray).at(0).patchValue({
              path: picture.path,
              baseUrl: picture.baseUrl,
            });
            if (this.selectedDonation) {
              this.updateCause([this.selectedDonation.id, input], 'updateActivityType');
            }
          }
          this.changeDetectorRef.markForCheck();
        });
    };
    fileInput.click();
  }

  updateQuestType(input: any) {
    this.questTypeService
      .updateQuestType(this.selectedCampaign?.id, input)
      .pipe(
        catchError(() => {
          this.modalService.dismissAll();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res: any) => {
        if (res) {
          this.modalService.dismissAll();
          this.position();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  modalError(text = '') {
    this.translate.get('MENUITEMS.TS.STH_WENT_WRONG').subscribe((sthWentWrong: string) => {
      Swal.fire({
        title: 'Oops...',
        text: text !== '' ? text : sthWentWrong,
        icon: 'error',
        showCancelButton: false,
        confirmButtonColor: 'rgb(3, 142, 220)',
        cancelButtonColor: 'rgb(243, 78, 78)',
      });
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

  ngOnDestroy(): void {
    this.loyaltyService.walletPageIndex = 0;
    this.loyaltyService.wallet$ = null;
    this.questTypeService.pageIndex = 0;
    this.questTypeService.causesPageIndex = 0;
    this.questTypeService.donationPageIndex = 0;
    this.questTypeService.advertiserPageIndex = 0;
    this.questTypeService.causes$ = null;
    this.questTypeService.infiniteCauses$ = null;
    this.questTypeService.infinteCausesPageIndex = 0;
    this.questTypeService.activityTypes$ = null;
    this.campaignsService.infiniteActivityTypes$ = null;
    this.activityTypes$ = null;
    this.infiniteCauses = [];
    this.questTypeService.infiniteQuestType$ = null;
    this.questTypeService.questTypePageIndex = 0;
    this.audiencesService.criteriasPageIndex = 0;
    this.audiencesService.infinteCriterias$ = null;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
