import Swal from 'sweetalert2';
import Flatten from '@flatten-js/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import {
  map,
  omit,
  find,
  keys,
  uniq,
  slice,
  range,
  pickBy,
  values,
  concat,
  isDate,
  filter,
  isEqual,
  forEach,
  isArray,
  identity,
  isObject,
  cloneDeep,
  transform,
  findIndex,
  differenceBy,
} from 'lodash';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  of,
  take,
  Subject,
  forkJoin,
  switchMap,
  takeUntil,
  Observable,
  catchError,
  debounceTime,
  map as rxMap,
  combineLatest,
  BehaviorSubject,
  distinctUntilChanged,
} from 'rxjs';

import {
  Gender,
  FormDtoType,
  LanguageType,
  OperatorEnum,
  AudienceType,
  AcademicLevel,
  MaritalStatus,
  ZoneTypesEnum,
  QuestTypeType,
  ReputationType,
  PeriodCycleEnum,
  QuestionDtoType,
  AudienceReachType,
  QuestActivityType,
  AudienceSegmentType,
  TransactionTypeEnum,
  AudienceCriteriaType,
  AudienceRelationEnum,
  DeleteFileFromAwsGQL,
  QuestTypeAudienceType,
  PartnershipNetworkType,
  GenerateS3SignedUrlGQL,
  AudienceCriteriaFieldEnum,
  QuestionSettingsSmileyObjType,
} from '@sifca-monorepo/terminal-generator';
import { REGEX } from '@diktup/frontend/config';
import { NumberFormatStyle } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { QuestWithProgressType } from '@sifca-monorepo/terminal-generator';
import { AmazonS3Helper, FormHelper, StorageHelper } from '@diktup/frontend/helpers';

import { AudiencesService } from '../audience.service';
import { PosService } from '../../../../core/services/pos.service';
import { AWS_CREDENTIALS } from '../../../../../environments/environment';
import { CampaignsService } from '../../campaigns/campaign/campaigns.service';
import { LoyaltyService } from '../../../system/apps/apps/loyalty/loyalty.service';
import { ProductsService } from '../../../inventory/products/products/products.service';
import { ICatalogueCategoryTreeType } from '../../../inventory/products/products/products.types';
import { QuestTypeService } from '../../../system/apps/apps/campaigns/campaigns.service';

@Component({
  selector: 'sifca-monorepo-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class AudienceDetailsComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  private segmentsReach: Map<number, AudienceReachType> = new Map<number, AudienceReachType>();

  activeId = 1;
  position: any;
  formsCount = 5;
  percentage = 0;
  questId: string;
  currentIndex = 0;
  paths: any[] = [];
  nestedNav: number;
  audienceId: string;
  initialValues: any;
  events: any[] = [];
  allSegments: any[];
  audience: AudienceType;
  audienceForm: FormGroup;
  isButtonDisabled = true;
  selectedDefIndex: number;
  genders = values(Gender);
  languages: LanguageType[];
  selectedForm: FormDtoType;
  isDefaultAudience: boolean;
  breadCrumbItems!: Array<{}>;
  isReachButtonDisabled = true;
  reputations: ReputationType[];
  selectedAudience: AudienceType;
  audienceReach: AudienceReachType;
  operators = values(OperatorEnum);
  period = values(PeriodCycleEnum);
  criterias: AudienceCriteriaType[];
  educations = values(AcademicLevel);
  selectedQuest: QuestWithProgressType;
  selectedCampaign: QuestWithProgressType;
  questAudiences: QuestTypeAudienceType[];
  questQuestions: QuestionDtoType[][][] = [];
  questActivities: QuestActivityType[][][] = [];
  maritalStatus: string[] = values(MaritalStatus);
  transactionsReasons = values(TransactionTypeEnum);
  questSearchInput$: Subject<string> = new Subject<string>();
  currentStep$: BehaviorSubject<number> = new BehaviorSubject(1);
  criteriasSearchInput$: Subject<string> = new Subject<string>();
  questionsSearchInput$: Subject<string> = new Subject<string>();
  questActivitiesSearchInput$: Subject<string> = new Subject<string>();
  loadingReach$: Observable<boolean> = this.audiencesService.loadingReach$;
  quests$: Observable<QuestWithProgressType[]> = this.campaignService.infiniteQuests$;
  questTypes$: Observable<QuestTypeType[]> = this.questTypeService.infiniteQuestType$;
  categories$: Observable<ICatalogueCategoryTreeType[]> = this.productsService.categories$;
  criterias$: Observable<AudienceCriteriaType[]> = this.audiencesService.infinteCriterias$;
  infiniteQuestions$: Observable<QuestionDtoType[]> = this.campaignService.infiniteQuestions$;
  questActivities$: Observable<QuestActivityType[]> = this.campaignService.infiniteQuestActivities$;
  targetsByPartner$: Observable<PartnershipNetworkType[]> = this.questTypeService.targetsByPartner$;
  selectedAdvertiser: PartnershipNetworkType;

  get pictures(): FormArray {
    return (this.audienceForm?.get('media') as FormGroup)?.get('pictures') as FormArray;
  }

  get segments(): FormArray {
    return this.audienceForm?.get('segments') as FormArray;
  }

  constructor(
    private router: Router,
    private posService: PosService,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private storageHelper: StorageHelper,
    private activatedRoute: ActivatedRoute,
    private loyaltyService: LoyaltyService,
    private amazonS3Helper: AmazonS3Helper,
    private productsService: ProductsService,
    private campaignService: CampaignsService,
    private questTypeService: QuestTypeService,
    private audiencesService: AudiencesService,
    private changeDetectorRef: ChangeDetectorRef,
    private deleteFileFromAwsGQL: DeleteFileFromAwsGQL,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
  ) {
    this.audiencesService.infinteCriterias$.pipe(takeUntil(this.unsubscribeAll)).subscribe((criterias) => {
      this.criterias = criterias;
      this.changeDetectorRef.markForCheck();
    });
    this.campaignService.quest$.pipe(takeUntil(this.unsubscribeAll)).subscribe((quest) => {
      if (quest) {
        this.questId = quest?.id;
      }
    });
  }

  ngOnInit(): void {
    this.isDefaultAudience = this.router.url.includes('default') ? true : false;
    combineLatest([this.translate.get('MENUITEMS.TS.ENGAGEMENT'), this.translate.get('MENUITEMS.TS.AUDIENCE')])
      .pipe(
        rxMap(([engagement, audience]: [string, string]) => {
          return (this.breadCrumbItems = [{ label: engagement }, { label: audience, active: true }]);
        }),
      )
      .subscribe();

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

    this.questSearchInput$
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchString) => {
          this.campaignService.infiniteQuests$ = null;
          this.campaignService.questPageIndex = 0;
          this.campaignService.searchString = searchString;
          return this.campaignService.findNonPredefinedQuestsByTarget();
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });

    this.questActivitiesSearchInput$
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchString) => {
          this.campaignService.infiniteQuestActivities$ = null;
          this.campaignService.questActivityPageIndex = 0;
          this.campaignService.questActivitiesSearchString = searchString;
          if (this.selectedQuest?.id) {
            return this.campaignService.getQuestActivitiesByQuestPaginated(this.selectedQuest?.id);
          }
          return of(null);
        }),
      )
      .subscribe((res) => {
        this.questActivities[this.currentIndex] = this.questActivities[this.currentIndex] || [];
        this.questActivities[this.currentIndex][this.selectedDefIndex] = res;
        this.changeDetectorRef.markForCheck();
      });

    this.questionsSearchInput$
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchString) => {
          this.campaignService.infiniteQuestions$ = null;
          this.campaignService.questionsPageIndex = 0;
          this.campaignService.questionsSearchString = searchString;
          return this.campaignService.getQuestionsByForm(this.selectedForm?.id);
        }),
      )
      .subscribe((res) => {
        this.questQuestions[this.currentIndex] = this.questQuestions[this.currentIndex] || [];
        this.questQuestions[this.currentIndex][this.selectedDefIndex] = res;
        this.changeDetectorRef.markForCheck();
      });

    this.audiencesService.audience$.pipe(takeUntil(this.unsubscribeAll)).subscribe((audience: AudienceType) => {
      this.audience = audience;
      this.questAudiences = audience?.questType?.audience;
      this.selectedAudience = audience;
      this.audienceReach = audience?.reach;
      this.percentage = +((audience?.reach?.reach / audience?.reach?.total) * 100).toFixed(1);
      this.audienceForm = this.formBuilder.group({
        title: [audience?.title || '', [Validators.required]],
        advertiser: this.formBuilder.group({
          pos: [audience?.advertiser?.pos?.id || undefined],
        }),
        target: this.formBuilder.group({
          pos: [audience?.target?.pos?.id],
        }),
        questType: [{ value: audience?.questType?.id, disabled: this.audience ? true : false }],
        description: [audience?.description || ''],
        media: this.formBuilder.group({
          pictures: this.formBuilder.array([
            this.formBuilder.group({
              baseUrl: [audience?.media?.pictures[0]?.baseUrl || ''],
              path: [audience?.media?.pictures[0]?.path || ''],
            }),
          ]),
        }),
        segments: this.formBuilder.array(
          this.audience?.segments?.length
            ? map(audience?.segments, (seg, i) => {
                return this.formBuilder.group({
                  relation: [AudienceRelationEnum.AND],
                  reach: this.formBuilder.group({
                    reach: [seg?.reach?.reach],
                    total: [seg?.reach?.total],
                  }),
                  definitions: this.formBuilder.array(
                    seg?.definitions?.length
                      ? map(seg?.definitions, (def, j) => {
                          return this.formBuilder.group({
                            rank: [def?.rank],
                            criteria: [
                              find(audience?.questType?.audience, (item: QuestTypeAudienceType) => item?.criteria?.id === def?.criteria?.id),
                            ],
                            filter: this.formBuilder.group({
                              field: this.formBuilder.group({
                                value: [{ value: def?.filter?.field?.value || undefined, disabled: this.isDefaultAudience ? true : false }],
                              }),
                              operator: [def?.filter?.operator || undefined],
                            }),
                            value: this.formBuilder.group({
                              value: [def?.value?.value || ''],
                              duration: this.formBuilder.group({
                                frequency: [def?.value?.duration?.frequency || '', Validators.min(1)],
                                period: [def?.value?.duration?.period || ''],
                              }),
                              startDate: [def?.value?.startDate || ''],
                              endDate: [def?.value?.endDate || ''],
                              minValue: [def?.value?.minValue || ''],
                              maxValue: [def?.value?.maxValue || ''],
                              zone: this.formBuilder.group({
                                type: [def?.value?.zone?.type || undefined],
                                paths: [def?.value?.zone?.paths?.length ? def?.value?.zone?.paths : []],
                                radius: [def?.value?.zone?.radius || undefined, Validators.pattern(REGEX.ONLY_POSITIVE)],
                              }),
                              reputations: [map(def?.value?.reputations, 'id') || []],
                              genders: [def?.value?.genders || []],
                              maritalStatuses: [def?.value?.maritalStatuses || []],
                              educations: [def?.value?.educations || []],
                              languages: [{ value: map(def?.value?.languages, 'id') || [], disabled: this.isDefaultAudience ? true : false }],
                              values: [{ value: def?.value?.values || [], disabled: this.isDefaultAudience ? true : false }],
                              quest: this.formBuilder.group({
                                questActivity: [def?.value?.quest?.activity?.quest],
                                activity: [{ value: def?.value?.quest?.activity, disabled: this.isDefaultAudience ? true : false }],
                                action: this.formBuilder.group({
                                  form: this.formBuilder.group({
                                    languages: [{ value: map(def?.value?.languages, 'id') || [], disabled: this.isDefaultAudience ? true : false }],
                                    question: [
                                      { value: def?.value?.quest?.action?.form?.question || '', disabled: this.isDefaultAudience ? true : false },
                                    ],
                                    answers: this.formBuilder.group({
                                      paragraph: this.formBuilder.array(
                                        def?.value?.quest?.action?.form?.answers?.paragraph?.length
                                          ? def?.value?.quest?.action?.form?.answers?.paragraph.map((paragraph) =>
                                              this.formBuilder.control(paragraph, [
                                                Validators.minLength(def?.value?.quest?.action?.form?.question?.settings?.paragraph?.min),
                                                Validators.maxLength(def?.value?.quest?.action?.form?.question?.settings?.paragraph?.max),
                                              ]),
                                            )
                                          : [],
                                      ),
                                      shortAnswer: this.formBuilder.array(
                                        def?.value?.quest?.action?.form?.answers?.shortAnswer?.length
                                          ? map(def?.value?.quest?.action?.form?.answers?.shortAnswer, (answer) =>
                                              this.formBuilder.control(answer, [
                                                Validators.minLength(def?.value?.quest?.action?.form?.question?.settings?.shortAnswer?.min),
                                                Validators.maxLength(def?.value?.quest?.action?.form?.question?.settings?.shortAnswer?.max),
                                              ]),
                                            )
                                          : [],
                                      ),
                                      rating: this.formBuilder.array(
                                        def?.value?.quest?.action?.form?.answers?.rating?.length
                                          ? def?.value?.quest?.action?.form?.answers?.rating
                                          : [undefined],
                                      ),
                                      number: this.formBuilder.group({
                                        min: [
                                          def?.value?.quest?.action?.form?.answers?.number?.min,
                                          [
                                            Validators.min(def?.value?.quest?.action?.form?.question?.settings?.number?.minValue),
                                            Validators.max(def?.value?.quest?.action?.form?.question?.settings?.number?.maxValue),
                                          ],
                                        ],
                                        max: [
                                          def?.value?.quest?.action?.form?.answers?.number?.max,
                                          [
                                            Validators.min(def?.value?.quest?.action?.form?.question?.settings?.number?.minValue),
                                            Validators.max(def?.value?.quest?.action?.form?.question?.settings?.number?.maxValue),
                                          ],
                                        ],
                                      }),
                                      singleChoice: this.formBuilder.array(
                                        def?.value?.quest?.action?.form?.answers?.singleChoice?.length
                                          ? def?.value?.quest?.action?.form?.answers?.singleChoice
                                          : [],
                                      ),
                                      multipleChoices: this.formBuilder.array(
                                        def?.value?.quest?.action?.form?.answers?.multipleChoices?.length
                                          ? def?.value?.quest?.action?.form?.answers?.multipleChoices
                                          : [],
                                      ),
                                      date: this.formBuilder.group({
                                        from: [def?.value?.quest?.action?.form?.answers?.date?.from || ''],
                                        to: [def?.value?.quest?.action?.form?.answers?.date?.to || ''],
                                      }),
                                      levels: this.formBuilder.array(
                                        def?.value?.quest?.action?.form?.question?.settings?.smiley?.levels?.length
                                          ? map(
                                              def?.value?.quest?.action?.form?.question?.settings?.smiley?.levels[0]?.icon
                                                ? differenceBy(
                                                    def?.value?.quest?.action?.form?.question?.settings?.smiley?.levels,
                                                    def?.value?.quest?.action?.form?.answers?.smiley,
                                                    'icon',
                                                  )
                                                : differenceBy(
                                                    def?.value?.quest?.action?.form?.question?.settings?.smiley?.levels,
                                                    def?.value?.quest?.action?.form?.answers?.smiley,
                                                    'picture.path',
                                                  ),
                                              (level) => {
                                                return this.formBuilder.group(level);
                                              },
                                            )
                                          : [],
                                      ),
                                      smiley: this.formBuilder.array(
                                        def?.value?.quest?.action?.form?.answers?.smiley?.length
                                          ? map(def?.value?.quest?.action?.form?.answers?.smiley, (smile) => {
                                              return this.formBuilder.group({
                                                ...(smile?.icon ? { icon: [smile?.icon] } : {}),
                                                ...(smile?.picture?.baseUrl
                                                  ? {
                                                      picture: this.formBuilder.group({
                                                        baseUrl: [smile?.picture?.baseUrl || ''],
                                                        path: [smile?.picture?.path || ''],
                                                      }),
                                                    }
                                                  : {}),
                                              });
                                            })
                                          : [],
                                      ),
                                    }),
                                  }),
                                  api: this.formBuilder.group({
                                    performed: [def?.value?.quest?.action?.api?.performed || false],
                                  }),
                                  lead: this.formBuilder.group({
                                    performed: [def?.value?.quest?.action?.lead?.performed || false],
                                  }),
                                  game: this.formBuilder.group({
                                    quizz: this.formBuilder.group({
                                      performed: [def?.value?.quest?.action?.game?.quizz?.performed || false],
                                    }),
                                    memory: this.formBuilder.group({
                                      performed: [def?.value?.quest?.action?.game?.memory?.performed || false],
                                    }),
                                    jigsaw: this.formBuilder.group({
                                      performed: [def?.value?.quest?.action?.game?.jigsaw?.performed || false],
                                    }),
                                    sliding: this.formBuilder.group({
                                      performed: [def?.value?.quest?.action?.game?.sliding?.performed || false],
                                    }),
                                  }),
                                  video: this.formBuilder.group({
                                    performed: [def?.value?.quest?.action?.video?.performed || false],
                                  }),
                                  socialMedia: this.formBuilder.group({
                                    performed: [def?.value?.quest?.action?.socialMedia?.performed || false],
                                  }),
                                  appDownload: this.formBuilder.group({
                                    performed: [def?.value?.quest?.action?.appDownload?.performed || false],
                                  }),
                                }),
                              }),
                              transactionsReasons: [def?.value?.transactionsReasons?.length ? def?.value?.transactionsReasons : []],
                              catalogueCategory: [def?.value?.catalogueCategory?.length ? map(def?.value?.catalogueCategory, 'id') : []],
                              frequency: this.formBuilder.group({
                                frequency: [def?.value?.frequency?.frequency || undefined, Validators.min(1)],
                                period: [def?.value?.frequency?.period || undefined],
                              }),
                            }),
                          });
                        })
                      : [],
                  ),
                });
              })
            : [
                this.formBuilder.group({
                  reach: this.formBuilder.group({
                    reach: [''],
                    total: [''],
                  }),
                  relation: [AudienceRelationEnum.AND],
                  definitions: this.formBuilder.array([
                    this.formBuilder.group({
                      rank: [],
                      criteria: [],
                      filter: this.formBuilder.group({
                        field: this.formBuilder.group({
                          value: [undefined],
                        }),
                        operator: [undefined],
                      }),
                      value: this.formBuilder.group({
                        value: [''],
                        duration: this.formBuilder.group({
                          frequency: [undefined, Validators.min(1)],
                          period: [undefined],
                        }),
                        startDate: [''],
                        endDate: [''],
                        minValue: [''],
                        maxValue: [''],
                        zone: this.formBuilder.group({
                          type: [undefined],
                          paths: [[]],
                          radius: [undefined, Validators.pattern(REGEX.ONLY_POSITIVE)],
                        }),
                        reputations: [[]],
                        languages: [[]],
                        values: [[]],
                        genders: [[]],
                        maritalStatuses: [[]],
                        educations: [[]],
                        quest: this.formBuilder.group({
                          questActivity: [],
                          activity: [undefined],
                          action: this.formBuilder.group({
                            form: this.formBuilder.group({
                              question: [''],
                              answers: this.formBuilder.group({
                                shortAnswer: this.formBuilder.array([]),
                                rating: this.formBuilder.array([]),
                                number: this.formBuilder.group({
                                  min: [''],
                                  max: [''],
                                }),
                                paragraph: this.formBuilder.array([]),
                                singleChoice: this.formBuilder.array([]),
                                multipleChoices: this.formBuilder.array([]),
                                date: this.formBuilder.group({
                                  from: [''],
                                  to: [''],
                                }),
                                smiley: this.formBuilder.array([]),
                              }),
                            }),
                            video: this.formBuilder.group({
                              performed: [false],
                            }),
                            game: this.formBuilder.group({
                              quizz: this.formBuilder.group({
                                performed: [false],
                              }),
                              memory: this.formBuilder.group({
                                performed: [false],
                              }),
                              jigsaw: this.formBuilder.group({
                                performed: [false],
                              }),
                              sliding: this.formBuilder.group({
                                performed: [false],
                              }),
                            }),
                            lead: this.formBuilder.group({
                              performed: [false],
                            }),
                            api: this.formBuilder.group({
                              performed: [false],
                            }),
                            appDownload: this.formBuilder.group({
                              performed: [false],
                            }),
                            socialMedia: this.formBuilder.group({
                              performed: [false],
                            }),
                          }),
                        }),
                        transactionsReasons: [[]],
                        catalogueCategory: [[]],
                        frequency: this.formBuilder.group({
                          frequency: [undefined, Validators.min(1)],
                          period: [undefined],
                        }),
                      }),
                    }),
                  ]),
                }),
              ],
        ),
      });
      if (!this.audience) {
        this.audience = this.audienceForm.value as any;
      }
      if (this.segments?.value.length) {
        this.getSegmentReach(true);
      }
      this.allSegments = this.segments.value;
      this.initialValues = this.audienceForm.value;
      console.log('🚀 ~ AudienceDetailsComponent ~ this.audiencesService.audience$.pipe ~ this.audienceForm.value:', this.audienceForm.value);
      this.audienceForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
        console.log('🚀 ~ AudienceDetailsComponent ~ this.audienceForm.valueChanges.pipe ~ values:', values);
        setTimeout(() => {
          this.isReachButtonDisabled = this.isButtonDisabled = isEqual(this.initialValues, values) || this.audienceForm.invalid;
          this.changeDetectorRef.markForCheck();
        }, 100);
      });
      this.getQuestActivities();
      this.getQuestQuestions();
      this.changeDetectorRef.markForCheck();
    });
    this.questTypeService.searchQuestTypesByTargetWithFilterPaginated().subscribe();
    this.changeDetectorRef.markForCheck();
  }

  ngAfterViewInit() {
    combineLatest([
      this.loyaltyService.getReputationsByTarget(),
      this.posService.findlanguagesPagination(),
      this.productsService.getCatalogueCategoriesByTargetWithChildren(),
      this.campaignService.findNonPredefinedQuestsByTarget(),
    ]).subscribe(([res, response]: any) => {
      this.reputations = res;
      this.languages = response;
      this.changeDetectorRef.markForCheck();
    });
  }

  onChangeAdvertiser(advertiser: PartnershipNetworkType) {
    console.log('🚀 ~ AudienceDetailsComponent ~ onChangeAdvertiser ~ advertiser:', advertiser);
    this.selectedAdvertiser = advertiser;
    this.questTypeService.questTypePageIndex = 0;
    this.questTypeService.infiniteQuestType$ = null;
    this.audienceForm.get('questType').reset();
    if (advertiser) {
      this.questTypeService.searchQuestTypesByTargetWithFilterPaginated(advertiser?.target?.pos?.id).subscribe();
    } else {
      console.log(1);
      this.questTypeService.searchQuestTypesByTargetWithFilterPaginated().subscribe();
    }
  }

  loadMorePlatforms() {
    this.questTypeService.isLastPartners$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.questTypeService.parnterPageIndex++;
        this.questTypeService.getPartnershipNetworksByPartnerAndPartnershipPagination().subscribe();
      }
    });
  }

  getSegmentReach(defaultReach = false) {
    const segments = this.segmentBlock(slice(this.segments.value, 0, this.currentIndex + 1));
    let requests = [this.audiencesService.getAudienceReach({ segments })];
    if (segments?.length < this.audience?.segments?.length) {
      requests = [
        ...requests,
        ...map(range(this.currentIndex, this.audience?.segments?.length), (index) =>
          this.audiencesService.getAudienceReach({ segments: this.segmentBlock(slice(this.segments.value, 0, index + 1)) }),
        ),
      ];
    }
    forkJoin(requests)
      .pipe(
        rxMap((res) => {
          if (res?.length && res[0]) {
            forEach(range(this.currentIndex, this.audience.segments?.length), (index, i) => {
              this.segmentsReach.set(index, res[i]);
              this.audience.segments[index].reach = {
                reach: res[i]?.reach,
                total: res[i]?.total,
              };
            });
            if (defaultReach) {
              this.audienceReach = res[res?.length - 1];
              this.percentage = Number(((res[res?.length - 1]?.reach / res[res?.length - 1]?.total) * 100).toFixed(1));
            }
          }
        }),
      )
      .subscribe();
  }

  onChangeQuestType(questType: QuestTypeType) {
    this.questAudiences = questType?.audience;
  }

  selectDefinition(i: number) {
    this.selectedDefIndex = i;
    this.segments.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.unsubscribeAll),
        switchMap((value) => {
          if (!value?.zone?.paths?.length && !value?.catalogueCategory?.length) {
            const segments = this.segmentBlock(slice(value, 0, this.currentIndex + 1));
            let requests = [this.audiencesService.getAudienceReach({ segments })];
            if (segments?.length < this.audience?.segments?.length) {
              requests = [
                ...requests,
                ...map(range(this.currentIndex, this.audience?.segments?.length), (index) =>
                  this.audiencesService.getAudienceReach({ segments: this.segmentBlock(slice(value, 0, index + 1)) }),
                ),
              ];
            }
            return forkJoin(requests);
          }
          return of(null);
        }),
        catchError(() => {
          return of(null);
        }),
        rxMap((res) => {
          if (res?.length && this.audience) {
            if (this.currentIndex === this.audience?.segments?.length) {
              this.audience.segments[this.currentIndex] = {
                reach: {
                  reach: res[i]?.reach,
                  total: res[i]?.total,
                },
              } as any;
            }
            forEach(range(this.currentIndex, this.audience.segments.length), (index, i) => {
              this.segmentsReach.set(index, res[i]);
              if (!this.audience.segments[index]) {
                this.audience.segments[index] = {
                  reach: {
                    reach: res[i]?.reach,
                    total: res[i]?.total,
                  },
                } as any;
              } else {
                this.audience.segments[index].reach = {
                  reach: res[i]?.reach,
                  total: res[i]?.total,
                };
              }
            });
          }
        }),
      )
      .subscribe(() => this.changeDetectorRef.markForCheck());
  }

  onChangeCategory() {
    if (this.audienceForm.valid && !this.isDefaultAudience) {
      this.getSegmentReach();
    }
  }

  segmentBlock(segments) {
    return segments
      .map((seg: AudienceSegmentType, index: number) => {
        const reach = this.segmentsReach.get(index);
        return {
          ...(reach ? { reach } : {}),
          relation: AudienceRelationEnum.AND,
          definitions: seg.definitions
            .map((def: any) => {
              let value: any;
              switch (true) {
                case !!def?.value?.quest?.activity: {
                  let quest: any;
                  switch (true) {
                    case def?.value?.quest?.activity?.activity?.action?.activityType?.code === 'API_ACTION': {
                      quest = {
                        action: {
                          api: {
                            performed: def?.value?.quest?.action?.api?.performed,
                          },
                        },
                      };
                      break;
                    }
                    case def?.value?.quest?.activity?.activity?.action?.activityType?.code === 'LEAD_GENERATION': {
                      quest = {
                        action: {
                          lead: {
                            performed: def?.value?.quest?.action?.lead?.performed,
                          },
                        },
                      };
                      break;
                    }
                    case def?.value?.quest?.activity?.activity?.action?.activityType?.code === 'GAME': {
                      quest = {
                        action: {
                          game: def?.value?.quest?.action?.game,
                        },
                      };
                      break;
                    }
                    case def?.value?.quest?.activity?.activity?.action?.activityType?.code === 'MEDIA': {
                      quest = {
                        action: {
                          video: {
                            performed: def?.value?.quest?.action?.video?.performed,
                          },
                        },
                      };
                      break;
                    }
                    case def?.value?.quest?.activity?.activity?.action?.activityType?.code === 'SOCIAL_MEDIA': {
                      quest = {
                        action: {
                          socialMedia: {
                            performed: def?.value?.quest?.action?.socialMedia?.performed,
                          },
                        },
                      };
                      break;
                    }
                    case def?.value?.quest?.activity?.activity?.action?.activityType?.code === 'DOWNLOAD_APP': {
                      quest = {
                        action: {
                          appDownload: {
                            performed: def?.value?.quest?.action?.appDownload?.performed,
                          },
                        },
                      };
                      break;
                    }

                    case !!def?.value?.quest?.action?.form?.answers?.date?.from: {
                      quest = {
                        action: {
                          form: {
                            answers: { date: def?.value?.quest?.action?.form?.answers?.date },
                            question: def?.value?.quest?.action?.form?.question?.id,
                          },
                        },
                      };
                      break;
                    }
                    case !!def?.value?.quest?.action?.form?.answers?.number?.max: {
                      quest = {
                        action: {
                          form: {
                            answers: { number: def?.value?.quest?.action?.form?.answers?.number },
                            question: def?.value?.quest?.action?.form?.question?.id,
                          },
                        },
                      };
                      break;
                    }
                    case !!def?.value?.quest?.action?.form?.answers?.paragraph?.length &&
                      def?.value?.quest?.action?.form?.answers?.paragraph?.[0] !== '': {
                      quest = {
                        action: {
                          form: {
                            answers: { paragraph: def?.value?.quest?.action?.form?.answers?.paragraph },
                            question: def?.value?.quest?.action?.form?.question?.id,
                          },
                        },
                      };
                      break;
                    }
                    case !!def?.value?.quest?.action?.form?.answers?.smiley?.length: {
                      quest = {
                        action: {
                          form: {
                            answers: {
                              smiley: map(def?.value?.quest?.action?.form?.answers?.smiley, (smiley) => {
                                return {
                                  ...(smiley?.icon ? { icon: smiley.icon } : {}),
                                  ...(smiley?.picture?.baseUrl ? { picture: smiley.picture } : {}),
                                };
                              }),
                            },
                            question: def?.value?.quest?.action?.form?.question?.id,
                          },
                        },
                      };
                      break;
                    }
                    case !!def?.value?.quest?.action?.form?.answers?.shortAnswer?.length &&
                      def?.value?.quest?.action?.form?.answers?.shortAnswer?.[0] !== '': {
                      quest = {
                        action: {
                          form: {
                            answers: { shortAnswer: def?.value?.quest?.action?.form?.answers?.shortAnswer },
                            question: def?.value?.quest?.action?.form?.question?.id,
                          },
                        },
                      };
                      break;
                    }
                    case !!def?.value?.quest?.action?.form?.answers?.singleChoice?.length &&
                      def?.value?.quest?.action?.form?.answers?.singleChoice?.[0] !== '': {
                      quest = {
                        action: {
                          form: {
                            answers: { singleChoice: def?.value?.quest?.action?.form?.answers?.singleChoice },
                            question: def?.value?.quest?.action?.form?.question?.id,
                          },
                        },
                      };
                      break;
                    }
                    case !!def?.value?.quest?.action?.form?.answers?.multipleChoices?.length &&
                      def?.value?.quest?.action?.form?.answers?.multipleChoices?.[0] !== '': {
                      quest = {
                        action: {
                          form: {
                            answers: { multipleChoices: def?.value?.quest?.action?.form?.answers?.multipleChoices },
                            question: def?.value?.quest?.action?.form?.question?.id,
                          },
                        },
                      };
                      break;
                    }
                    case !!(def?.value?.quest?.action?.form?.answers?.rating?.length && def?.value?.quest?.action?.form?.answers?.rating?.[0]): {
                      quest = {
                        action: {
                          form: {
                            answers: { rating: uniq(def?.value?.quest?.action?.form?.answers?.rating) },
                            question: def?.value?.quest?.action?.form?.question?.id,
                          },
                        },
                      };
                      break;
                    }
                    default:
                      break;
                  }
                  value = {
                    quest: {
                      activity: def?.value?.quest?.activity?.id,
                      ...quest,
                    },
                  };
                  break;
                }
                case !!def?.value?.zone?.radius: {
                  value = {
                    zone: {
                      radius: def?.value?.zone?.radius,
                      paths: def?.value?.zone?.paths?.length
                        ? def?.value.zone.paths.map((path, index) => ({
                            lat: path.lat,
                            lng: path.lng,
                            order: index + 1,
                          }))
                        : [{ lat: 51.14071989052022, lng: 10.38970190429688, order: 1 }],
                      type: ZoneTypesEnum.POINT,
                    },
                  };
                  break;
                }
                case !!(def?.value?.zone?.type === ZoneTypesEnum?.POLYGON): {
                  value = {
                    zone: {
                      paths: [
                        ...def?.value?.zone?.paths.map((path, index) => ({
                          ...path,
                          order: index + 1,
                        })),
                        { ...def?.value?.zone?.paths[0], order: def?.value?.zone?.paths.length + 1 },
                      ],
                      type: ZoneTypesEnum?.POLYGON,
                    },
                  };
                  break;
                }
                case !!def?.value?.languages?.length: {
                  value = { languages: def?.value?.languages };
                  break;
                }
                case !!def?.value?.frequency?.frequency: {
                  value = { frequency: def?.value?.frequency };
                  break;
                }
                case !!def?.value?.duration?.frequency: {
                  value = { duration: def?.value?.duration };
                  break;
                }
                case !!def?.value?.catalogueCategory?.length: {
                  value = { catalogueCategory: def?.value?.catalogueCategory };
                  break;
                }
                case !!def?.value?.transactionsReasons?.length: {
                  value = { transactionsReasons: def?.value?.transactionsReasons };
                  break;
                }
                case !!def?.value?.value: {
                  value = { value: def?.value?.value.toString() };
                  break;
                }
                case !!def?.value?.reputations?.length: {
                  value = { reputations: def?.value?.reputations };
                  break;
                }
                case !!def?.value?.minValue || def?.value?.maxValue: {
                  value = {
                    ...(def?.value?.minValue ? { minValue: def?.value?.minValue.toString() } : {}),
                    ...(def?.value?.maxValue ? { maxValue: def?.value?.maxValue.toString() } : {}),
                  };
                  break;
                }
                case !!(def?.value?.values?.length && !def?.value?.values.some((obj) => Object.keys(obj).length === 0)): {
                  value = { values: def?.value?.values };
                  break;
                }
                case !!def?.value?.genders?.length: {
                  value = { genders: def?.value?.genders };
                  break;
                }
                case !!def?.value?.maritalStatuses?.length: {
                  value = { maritalStatuses: def?.value?.maritalStatuses };
                  break;
                }
                case !!def?.value?.educations?.length: {
                  value = { educations: def?.value?.educations };
                  break;
                }
                default:
                  break;
              }
              return {
                ...(def?.criteria?.criteria?.id ? { criteria: def?.criteria?.criteria?.id } : ''),
                filter: {
                  ...(def.filter?.operator ? { operator: def.filter?.operator } : {}),
                  ...(def.filter?.field?.value ? { field: { value: def.filter?.field?.value } } : {}),
                },
                value: {
                  ...pickBy(
                    omit(
                      def?.value,
                      'quest',
                      'zone',
                      'genders',
                      'educations',
                      'maritalStatuses',
                      'maxValue',
                      'minValue',
                      'languages',
                      'reputations',
                      'values',
                      'frequency',
                      'duration',
                      'catalogueCategory',
                      'questActivity',
                      'transactionsReasons',
                    ),
                    identity,
                  ),
                  ...value,
                },
              };
            })
            .filter((def) => def?.value && def?.criteria),
        };
      })
      .filter((seg) => seg?.definitions && seg?.definitions?.length > 0);
  }

  resetMap(i: number, j: number) {
    const zoneFormGroup = (this.segments.at(i).get('definitions') as FormArray).at(j).get(['value', 'zone']);
    if (!zoneFormGroup.get('type').value) {
      return;
    }
    zoneFormGroup.reset();
  }

  findCheckedChoices(choice: string, i: number, j: number, field: string) {
    if (field === 'singleChoice') {
      const singleChoiceFormArray = (this.segments.at(i).get('definitions') as FormArray)
        .at(j)
        .get(['value', 'quest', 'action', 'form', 'answers', 'singleChoice']) as FormArray;
      const index = findIndex(singleChoiceFormArray.value, (item) => item === choice);
      return index > -1;
    } else {
      const multipleChoiceFormArray = (this.segments.at(i).get('definitions') as FormArray)
        .at(j)
        .get(['value', 'quest', 'action', 'form', 'answers', 'multipleChoices']) as FormArray;
      const index = findIndex(multipleChoiceFormArray.value, (item) => item === choice);
      return index > -1;
    }
  }

  addRatingField(i: number, j: NumberFormatStyle) {
    ((this.segments.at(i).get('definitions') as FormArray).at(j).get(['value', 'quest', 'action', 'form', 'answers', 'rating']) as FormArray).push(
      new FormControl(''),
    );
    this.changeDetectorRef.markForCheck();
  }

  removeRatingField(i: number, j: number, k: number) {
    (
      (this.segments.at(i).get('definitions') as FormArray).at(j).get(['value', 'quest', 'action', 'form', 'answers', 'rating']) as FormArray
    ).removeAt(k);
    this.changeDetectorRef.markForCheck();
  }

  removeSmileyField(emoji, i: number, j: number, k: number) {
    const levelsControls = (this.segments.at(i).get('definitions') as FormArray)
      .at(j)
      .get(['value', 'quest', 'action', 'form', 'answers', 'levels']) as FormArray;
    if ((emoji?.icon && levelsControls.value[0]?.icon) || (emoji?.picture && levelsControls.value?.[0]?.picture) || !levelsControls.value?.length) {
      levelsControls.push(
        this.formBuilder.group({
          ...(emoji?.icon ? { icon: [emoji?.icon] } : {}),
          ...(emoji?.picture?.baseUrl
            ? {
                picture: this.formBuilder.group({
                  baseUrl: [emoji?.picture?.baseUrl || ''],
                  path: [emoji?.picture?.path || ''],
                }),
              }
            : {}),
        }),
      );
    }
    (
      (this.segments.at(i).get('definitions') as FormArray).at(j).get(['value', 'quest', 'action', 'form', 'answers', 'smiley']) as FormArray
    ).removeAt(k);
    this.changeDetectorRef.markForCheck();
  }

  selectEmoji(emoji?: QuestionSettingsSmileyObjType, i?: number, j?: number, f?: number): void {
    (
      ((this.segments.at(i).get('definitions') as FormArray).at(j) as FormArray).get([
        'value',
        'quest',
        'action',
        'form',
        'answers',
        'levels',
      ]) as FormArray
    ).removeAt(f);

    (
      ((this.segments.at(i).get('definitions') as FormArray).at(j) as FormArray).get([
        'value',
        'quest',
        'action',
        'form',
        'answers',
        'smiley',
      ]) as FormArray
    ).push(
      this.formBuilder.group({
        levels: this.formBuilder.array(
          filter(
            (this.segments.at(i).get('definitions') as FormArray).at(j).get(['value', 'quest', 'action', 'form', 'question']).value.settings?.smiley
              ?.levels,
            (level) => level?.icon !== emoji?.icon,
          ),
        ),
        ...(emoji?.icon ? { icon: [emoji?.icon] } : {}),
        ...(emoji?.picture?.baseUrl
          ? {
              picture: this.formBuilder.group({
                baseUrl: [emoji?.picture?.baseUrl || ''],
                path: [emoji?.picture?.path || ''],
              }),
            }
          : {}),
      }),
    );
  }

  addShortAnswer(i: number, j: number) {
    const shortAnswerSettings = (this.segments.at(i).get('definitions') as FormArray)
      .at(j)
      .get(['value', 'quest', 'action', 'form', 'question']) as FormArray;
    const shortAnswersControls = (this.segments.at(i).get('definitions') as FormArray)
      .at(j)
      .get(['value', 'quest', 'action', 'form', 'answers', 'shortAnswer']) as FormArray;
    shortAnswersControls.push(
      new FormControl('', [
        Validators.required,
        Validators.minLength(shortAnswerSettings.value.settings?.shortAnswer?.min),
        Validators.maxLength(shortAnswerSettings.value.settings?.shortAnswer?.max),
      ]),
    );
    this.changeDetectorRef.markForCheck();
  }

  removeShortAnswer(i: number, j: number, k: number) {
    const shortAnswersControls = (this.segments.at(i).get('definitions') as FormArray)
      .at(j)
      .get(['value', 'quest', 'action', 'form', 'answers', 'shortAnswer']) as FormArray;
    shortAnswersControls.removeAt(k);
    this.changeDetectorRef.markForCheck();
  }

  addParagraph(i: number, j: number) {
    const paragraphSettings = (this.segments.at(i).get('definitions') as FormArray)
      .at(j)
      .get(['value', 'quest', 'action', 'form', 'question']) as FormArray;

    const paragraphControls = (this.segments.at(i).get('definitions') as FormArray)
      .at(j)
      .get(['value', 'quest', 'action', 'form', 'answers', 'paragraph']) as FormArray;

    paragraphControls.push(
      this.formBuilder.control('', [
        Validators.required,
        Validators.minLength(paragraphSettings.value.settings?.paragraph?.min),
        Validators.maxLength(paragraphSettings.value.settings?.paragraph?.max),
      ]),
    );
    this.changeDetectorRef.markForCheck();
  }

  removeParagraph(i: number, j: number, k: number) {
    const paragraphControls = (this.segments.at(i).get('definitions') as FormArray)
      .at(j)
      .get(['value', 'quest', 'action', 'form', 'answers', 'paragraph']) as FormArray;
    paragraphControls.removeAt(k);
    this.changeDetectorRef.markForCheck();
  }

  onChangeQuestion(question: QuestionDtoType, i: number, j: number) {
    const valueFormGroup = (this.segments.at(i).get('definitions') as FormArray)
      .at(j)
      .get(['value', 'quest', 'action', 'form', 'answers']) as FormArray;
    this.clearAllValidators(valueFormGroup);
    const smileyControls = (this.segments.at(i).get('definitions') as FormArray)
      .at(j)
      .get(['value', 'quest', 'action', 'form', 'answers', 'smiley']) as FormArray;

    const levelsControls = (this.segments.at(i).get('definitions') as FormArray)
      .at(j)
      .get(['value', 'quest', 'action', 'form', 'answers', 'smiley']) as FormArray;

    const shortAnswersControls = (this.segments.at(i).get('definitions') as FormArray)
      .at(j)
      .get(['value', 'quest', 'action', 'form', 'answers', 'shortAnswer']) as FormArray;

    const ratingFormArray = (this.segments.at(i).get('definitions') as FormArray)
      .at(j)
      .get(['value', 'quest', 'action', 'form', 'answers', 'rating']) as FormArray;

    const singleChoiceFormArray = (this.segments.at(i).get('definitions') as FormArray)
      .at(j)
      .get(['value', 'quest', 'action', 'form', 'answers', 'singleChoice']) as FormArray;
    const multipleChoiceFormArray = (this.segments.at(i).get('definitions') as FormArray)
      .at(j)
      .get(['value', 'quest', 'action', 'form', 'answers', 'multipleChoices']) as FormArray;

    const paragraphFormArray = (this.segments.at(i).get('definitions') as FormArray)
      .at(j)
      .get(['value', 'quest', 'action', 'form', 'answers', 'paragraph']) as FormArray;

    const numberFormGroup = (this.segments.at(i).get('definitions') as FormArray)
      .at(j)
      .get(['value', 'quest', 'action', 'form', 'answers', 'number']);

    (this.segments.at(i).get('definitions') as FormArray).at(j).get(['value', 'quest', 'action', 'form', 'answers']).reset();
    smileyControls.clear();
    levelsControls.clear();
    ratingFormArray.clear();
    shortAnswersControls.clear();
    singleChoiceFormArray.clear();
    multipleChoiceFormArray.clear();
    paragraphFormArray.clear();
    if (question?.settings?.smiley?.levels) {
      const levelsFormArray = (this.segments.at(i).get('definitions') as FormArray)
        .at(j)
        .get(['value', 'quest', 'action', 'form', 'answers', 'levels']) as FormArray;
      question?.settings?.smiley?.levels.forEach((level) => {
        levelsFormArray.push(this.formBuilder.control(level, Validators.required));
      });
    } else if (question?.settings?.rating) {
      ratingFormArray.push(this.formBuilder.control(question?.settings?.rating?.levels[question?.settings?.rating?.levels?.length - 1] || [2]));
    } else if (question?.settings?.shortAnswer) {
      shortAnswersControls.push(
        this.formBuilder.control('', [
          Validators.required,
          Validators.minLength(question?.settings?.shortAnswer?.min),
          Validators.maxLength(question?.settings?.shortAnswer?.max),
        ]),
      );
    } else if (question?.settings?.paragraph) {
      paragraphFormArray.push(
        this.formBuilder.control('', [
          Validators.required,
          Validators.minLength(question?.settings?.paragraph.min),
          Validators.maxLength(question?.settings?.paragraph.max),
        ]),
      );
    } else if (question?.settings?.number) {
      numberFormGroup.get('min').patchValue('');
      numberFormGroup.get('max').patchValue('');
      numberFormGroup
        .get('min')
        .setValidators([Validators.min(question?.settings?.number.minValue), Validators.max(question?.settings?.number.maxValue)]);
      numberFormGroup
        .get('max')
        .setValidators([Validators.min(question?.settings?.number.minValue), Validators.max(question?.settings?.number.maxValue)]);
      numberFormGroup.get('min').updateValueAndValidity();
      numberFormGroup.get('max').updateValueAndValidity();
    }
  }

  onChangeChoice(checked: boolean, i, j, choice: string, field: string) {
    const singleChoiceFormArray = (this.segments.at(i).get('definitions') as FormArray)
      .at(j)
      .get(['value', 'quest', 'action', 'form', 'answers', 'singleChoice']) as FormArray;
    const multipleChoiceFormArray = (this.segments.at(i).get('definitions') as FormArray)
      .at(j)
      .get(['value', 'quest', 'action', 'form', 'answers', 'multipleChoices']) as FormArray;
    if (field === 'singleChoice') {
      if (checked) {
        singleChoiceFormArray.push(this.formBuilder.control(choice));
      } else {
        const index = findIndex(singleChoiceFormArray.value, (item) => item === choice);
        singleChoiceFormArray.removeAt(index);
      }
    } else {
      if (checked) {
        multipleChoiceFormArray.push(this.formBuilder.control(choice));
      } else {
        const index = findIndex(multipleChoiceFormArray.value, (item) => item === choice);
        multipleChoiceFormArray.removeAt(index);
      }
    }
    this.changeDetectorRef.markForCheck();
  }

  onChangeQuestActivity(quest: QuestWithProgressType, form: FormDtoType, i: number, j: number) {
    (this.segments.at(i).get('definitions') as FormArray).at(j).get(['value', 'quest', 'action', 'form']).reset();
    this.selectedQuest = quest;
    this.selectedForm = form;
    if (form) {
      this.campaignService.infiniteQuestions$ = null;
      this.campaignService.questionsPageIndex = 0;
      this.campaignService.getQuestionsByForm(form?.id).subscribe((res: any) => {
        if (res?.length) {
          this.questQuestions[i] = this.questQuestions[i] || [];
          this.questQuestions[i][j] = res;
          this.changeDetectorRef.markForCheck();
        }
      });
    }
  }

  getQuestActivities() {
    forEach(this.allSegments, (seg: AudienceSegmentType, i: number) => {
      forEach(seg?.definitions, (def, j: number) => {
        if (def?.value?.quest?.activity?.quest?.id && def?.filter?.field?.value === AudienceCriteriaFieldEnum.QUEST_ACTION) {
          this.selectedQuest = def?.value?.quest?.activity?.quest as any;
          this.campaignService.getQuestActivitiesByQuestPaginated(this.selectedQuest?.id).subscribe((res: any) => {
            this.questActivities[i] = this.questActivities[i] || [];
            this.questActivities[i][j] = res;
            this.changeDetectorRef.markForCheck();
          });
        }
      });
    });
  }

  getQuestQuestions() {
    this.campaignService.questionsPageIndex = 0;
    forEach(this.allSegments, (seg: AudienceSegmentType, i: number) => {
      forEach(seg?.definitions, (def, j: number) => {
        if (
          def?.value?.quest?.activity?.activity?.action?.activityType?.code === 'QUESTION' &&
          def?.value?.quest?.activity?.activity?.action?.definition?.form?.form
        ) {
          this.selectedForm = def?.value?.quest?.activity?.activity?.action?.definition?.form?.form;
          this.campaignService.getQuestionsByForm(this.selectedForm?.id).subscribe((res: any) => {
            if (res?.length) {
              this.questQuestions[i] = this.questQuestions[i] || [];
              this.questQuestions[i][j] = res;
              this.changeDetectorRef.markForCheck();
            }
            this.changeDetectorRef.markForCheck();
          });
        }
      });
    });
  }

  applyAudienceReach() {
    let segments = [];
    segments = this.segmentBlock(this.segments.value);
    this.getAudienceReach(true, segments);
  }

  getAudienceReach(scrollToTop = true, segments: any[]) {
    this.isReachButtonDisabled = true;
    this.audiencesService
      .getAudienceReach({ segments })
      .pipe(
        catchError(() => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          // if (res.total !== this.audience?.reach?.total) {
          //   const input: any = {};
          //   this.audiencesService.updateAudience(this.audience?.id, input).subscribe();
          // }
          if (scrollToTop) {
            window.scrollTo(0, 0);
          }
          this.audienceReach = res;
          this.percentage = Number(((res?.reach / res?.total) * 100).toFixed(1));
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  addDefinition(i: number) {
    const filterFormGroup = this.formBuilder.group({
      rank: [],
      criteria: [],
      filter: this.formBuilder.group({
        field: this.formBuilder.group({
          value: [undefined],
        }),
        operator: [undefined],
      }),
      value: this.formBuilder.group({
        value: [''],
        duration: this.formBuilder.group({
          frequency: [undefined, Validators.min(1)],
          period: [undefined],
        }),
        startDate: [''],
        endDate: [''],
        minValue: [''],
        maxValue: [''],
        zone: this.formBuilder.group({
          type: [undefined],
          paths: [[]],
          radius: [undefined, Validators.pattern(REGEX.ONLY_POSITIVE)],
        }),
        reputations: [[]],
        languages: [[]],
        values: [[]],
        genders: [[]],
        maritalStatuses: [[]],
        educations: [[]],
        quest: this.formBuilder.group({
          questActivity: [],
          activity: [undefined],
          action: this.formBuilder.group({
            form: this.formBuilder.group({
              question: [''],
              answers: this.formBuilder.group({
                paragraph: this.formBuilder.array([]),
                shortAnswer: this.formBuilder.array([]),
                rating: this.formBuilder.array([]),
                number: this.formBuilder.group({
                  min: [''],
                  max: [''],
                }),
                singleChoice: this.formBuilder.array([]),
                multipleChoices: this.formBuilder.array([]),
                date: this.formBuilder.group({
                  from: [''],
                  to: [''],
                }),
                levels: this.formBuilder.array([]),
                smiley: this.formBuilder.array([]),
              }),
            }),
            video: this.formBuilder.group({
              performed: [false],
            }),
            game: this.formBuilder.group({
              quizz: this.formBuilder.group({
                performed: [false],
              }),
              memory: this.formBuilder.group({
                performed: [false],
              }),
              jigsaw: this.formBuilder.group({
                performed: [false],
              }),
              sliding: this.formBuilder.group({
                performed: [false],
              }),
            }),
            lead: this.formBuilder.group({
              performed: [false],
            }),
            api: this.formBuilder.group({
              performed: [false],
            }),
            appDownload: this.formBuilder.group({
              performed: [false],
            }),
            socialMedia: this.formBuilder.group({
              performed: [false],
            }),
          }),
        }),
        catalogueCategory: [[]],
        transactionsReasons: [[]],
        frequency: this.formBuilder.group({
          frequency: [undefined, Validators.min(1)],
          period: [undefined],
        }),
      }),
    });
    (this.segments.at(i).get('definitions') as FormArray).push(filterFormGroup);
    this.changeDetectorRef.markForCheck();
  }

  removeDefinition(i: number, j: number) {
    (this.segments.at(i).get('definitions') as FormArray).removeAt(j);
  }

  nextStep() {
    this.activeId = this.activeId + 1;
  }

  onTabChange(event: any) {
    this.activeId = +event.nextId;
  }

  onFindOperators(index: number, j: number) {
    return find(
      this.segments?.value[index].definitions[j].criteria?.fields,
      (field) => field?.field === this.segments?.value[index].definitions[j].filter.field?.value,
    )?.operators;
  }

  onCriteriaChange(index: number, j: number, criteria: AudienceCriteriaType) {
    (this.segments.at(index).get('definitions') as FormArray).at(j).get('filter').reset();
    (this.segments.at(index).get('definitions') as FormArray).at(j).get('value').reset();
    (this.segments.at(index).get('definitions') as FormArray).at(j).get('rank').reset();
    this.changeDetectorRef.markForCheck();
  }

  resetField(i: number, j: number) {
    const valueFormGroup = (this.segments.at(i).get('definitions') as FormArray).at(j).get('value') as FormGroup;
    (this.segments.at(i).get('definitions') as FormArray).at(j).get(['filter', 'operator']).reset();
    (this.segments.at(i).get('definitions') as FormArray).at(j).get('value').reset();
    this.clearAllValidators(valueFormGroup);
    this.changeDetectorRef.markForCheck();
  }

  getTooltipContent(fieldValue): string {
    switch (fieldValue) {
      case 'FREQUENT_SHOPPERS':
        return `${this.translate.instant('MENUITEMS.CUSTOMERENGAGEMENT.LIST.FREQUENT_SHOPPERS.DEFINITION')}\n
                ${this.translate.instant('MENUITEMS.CUSTOMERENGAGEMENT.LIST.FREQUENT_SHOPPERS.EXAMPLE')}`;
      case 'BIG_SPENDERS':
        return `${this.translate.instant('MENUITEMS.CUSTOMERENGAGEMENT.LIST.BIG_SPENDERS.DEFINITION')}\n
                ${this.translate.instant('MENUITEMS.CUSTOMERENGAGEMENT.LIST.BIG_SPENDERS.EXAMPLE')}`;
      case 'PRODUCT_CATEGORY':
        return `${this.translate.instant('MENUITEMS.CUSTOMERENGAGEMENT.LIST.PRODUCT_CATEGORY.DEFINITION')}\n
                ${this.translate.instant('MENUITEMS.CUSTOMERENGAGEMENT.LIST.PRODUCT_CATEGORY.EXAMPLE')}`;
      case 'ABANDONED_CARTS':
        return `${this.translate.instant('MENUITEMS.CUSTOMERENGAGEMENT.LIST.ABANDONED_CARTS.DEFINITION')}\n
                ${this.translate.instant('MENUITEMS.CUSTOMERENGAGEMENT.LIST.ABANDONED_CARTS.EXAMPLE')}`;
      case 'ACTIVITY_FREQUENCY':
        return `${this.translate.instant('MENUITEMS.CUSTOMERENGAGEMENT.LIST.ACTIVITY_FREQUENCY.DEFINITION')}\n
                ${this.translate.instant('MENUITEMS.CUSTOMERENGAGEMENT.LIST.ACTIVITY_FREQUENCY.EXAMPLE')}`;
      case 'LAPSED_CUSTOMERS':
        return `${this.translate.instant('MENUITEMS.CUSTOMERENGAGEMENT.LIST.LAPSED_CUSTOMERS.DEFINITION')}\n
                ${this.translate.instant('MENUITEMS.CUSTOMERENGAGEMENT.LIST.LAPSED_CUSTOMERS.EXAMPLE')}`;
      default:
        return '';
    }
  }

  clearAllValidators(control: AbstractControl) {
    if (control instanceof FormGroup) {
      Object.values(control.controls).forEach((childControl) => {
        this.clearAllValidators(childControl);
      });
    } else if (control instanceof FormArray) {
      control.controls.forEach((childControl) => {
        this.clearAllValidators(childControl);
      });
    } else {
      control.clearValidators();
      control.updateValueAndValidity();
    }
  }

  exit() {
    this.router.navigate(['..'], { relativeTo: this.activatedRoute });
  }

  polygonPointDragged(event: any, i: number, j: number, k: number): void {
    const paths: Array<any> = cloneDeep((this.segments.at(i).get('definitions') as FormArray).at(j).get(['value', 'zone', 'paths']).value || []);
    paths[k] = event.coords;
    (this.segments.at(i).get('definitions') as FormArray).at(j).get(['value', 'zone', 'paths']).setValue(paths);
    const shape = new Flatten.Polygon(map(paths, (path) => [path.lat, path.lng]));
    if (shape.isValid() && paths?.length > 3 && this.audienceForm.valid) {
      this.getSegmentReach();
    }
  }

  onCircleChange(i: number, j: number, event: any, definition: AbstractControl) {
    definition.get(['value', 'zone', 'radius']).patchValue(event);
    const paths: Array<any> = cloneDeep((this.segments.at(i).get('definitions') as FormArray).at(j).get(['value', 'zone', 'paths']).value || []);
    const shape = new Flatten.Polygon(map(paths, (path) => [path.lat, path.lng]));
    if (shape.isValid() && paths?.length && !this.isDefaultAudience && this.audienceForm.valid) {
      this.getSegmentReach();
    }
  }

  addPointToPolygon(event: any, i: number, j: number): void {
    if ((this.segments.at(i).get('definitions') as FormArray).at(j).value.value.zone.type === ZoneTypesEnum.POLYGON) {
      const paths: Array<any> = cloneDeep((this.segments.at(i).get('definitions') as FormArray).at(j).get(['value', 'zone', 'paths']).value || []);
      paths.push(event.coords);
      (this.segments.at(i).get('definitions') as FormArray).at(j).get(['value', 'zone', 'paths']).setValue(paths);
      const shape = new Flatten.Polygon(map(paths, (path) => [path.lat, path.lng]));
      if (shape.isValid() && paths?.length > 3 && !this.isDefaultAudience && this.audienceForm.valid) {
        this.getSegmentReach();
      }
      this.changeDetectorRef.markForCheck();
    }
  }

  onChangePoint(field: string, j: number, k: number) {
    if (field === 'POLYGON') {
      (this.segments.at(this.currentIndex).get('definitions') as FormArray).at(j).get(['value', 'zone', 'radius']).reset();
    } else {
      (this.segments.at(this.currentIndex).get('definitions') as FormArray).at(j).get(['value', 'zone', 'paths']).reset();
    }
  }

  addStep() {
    this.currentIndex += 1;
    this.addSegmentField();
    this.changeDetectorRef.markForCheck();
  }

  chooseStep(index: number) {
    this.currentIndex = index;
    this.changeDetectorRef.markForCheck();
  }

  addSegmentField(): void {
    this.segments.push(
      this.formBuilder.group({
        reach: this.formBuilder.group({
          reach: [''],
          total: [''],
        }),
        relation: [AudienceRelationEnum.AND],
        definitions: this.formBuilder.array([
          this.formBuilder.group({
            rank: [],
            criteria: [],
            filter: this.formBuilder.group({
              field: this.formBuilder.group({
                value: [undefined],
              }),
              operator: [undefined],
            }),
            value: this.formBuilder.group({
              value: [''],
              duration: this.formBuilder.group({
                frequency: [undefined, Validators.min(1)],
                period: [undefined],
              }),
              startDate: [''],
              endDate: [''],
              minValue: [''],
              maxValue: [''],
              zone: this.formBuilder.group({
                type: [undefined],
                paths: [[]],
                radius: [undefined, Validators.pattern(REGEX.ONLY_POSITIVE)],
              }),
              reputations: [[]],
              languages: [[]],
              values: [[]],
              genders: [[]],
              maritalStatuses: [[]],
              educations: [[]],
              quest: this.formBuilder.group({
                questActivity: [],
                activity: [undefined],
                action: this.formBuilder.group({
                  form: this.formBuilder.group({
                    question: [''],
                    answers: this.formBuilder.group({
                      paragraph: this.formBuilder.array([]),
                      shortAnswer: this.formBuilder.array([]),
                      rating: this.formBuilder.array([]),
                      number: this.formBuilder.group({
                        min: [''],
                        max: [''],
                      }),
                      singleChoice: this.formBuilder.array([]),
                      multipleChoices: this.formBuilder.array([]),
                      date: this.formBuilder.group({
                        from: [''],
                        to: [''],
                      }),
                      levels: this.formBuilder.array([]),
                      smiley: this.formBuilder.array([]),
                    }),
                  }),
                  video: this.formBuilder.group({
                    performed: [false],
                  }),
                  game: this.formBuilder.group({
                    quizz: this.formBuilder.group({
                      performed: [false],
                    }),
                    memory: this.formBuilder.group({
                      performed: [false],
                    }),
                    jigsaw: this.formBuilder.group({
                      performed: [false],
                    }),
                    sliding: this.formBuilder.group({
                      performed: [false],
                    }),
                  }),
                  lead: this.formBuilder.group({
                    performed: [false],
                  }),
                  api: this.formBuilder.group({
                    performed: [false],
                  }),
                  appDownload: this.formBuilder.group({
                    performed: [false],
                  }),
                  socialMedia: this.formBuilder.group({
                    performed: [false],
                  }),
                }),
              }),
              catalogueCategory: [[]],
              transactionsReasons: [[]],
              frequency: this.formBuilder.group({
                frequency: [undefined, Validators.min(1)],
                period: [undefined],
              }),
            }),
          }),
        ]),
      }),
    );
    this.allSegments = this.segments.value;
    this.nestedNav = this.allSegments?.length - 1;
    this.currentIndex = this.allSegments?.length - 1;
    this.changeDetectorRef.markForCheck();
  }

  deleteSegment(event: Event) {
    event.preventDefault();
    setTimeout(() => {
      this.segments.removeAt(this.currentIndex);
      if (this.audience.segments[this.currentIndex] && !this.audience.segments[this.currentIndex]?.definitions?.length) {
        delete this.audience.segments[this.currentIndex];
      }
      this.allSegments = this.segments.value;
      this.currentIndex = this.allSegments?.length - 1;
      this.nestedNav = this.allSegments?.length - 1;
      this.changeDetectorRef.markForCheck();
    });
  }

  upload(): void {
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
          this.pictures.at(0).patchValue({
            path: picture.path,
            baseUrl: picture.baseUrl,
          });
          this.changeDetectorRef.markForCheck();
        });
    };
    fileInput.click();
  }

  removePicture() {
    const fileName = this.pictures.at(0).value.path;
    this.pictures.at(0).patchValue({
      path: '',
      baseUrl: '',
    });
    this.deleteFileFromAwsGQL.fetch({ fileName }).subscribe((res) => {
      if (res.data.deleteFileFromAws && this.selectedAudience) {
        const input: any = {
          media: { pictures: [{ baseUrl: '', path: '' }] },
        };
        if (this.questId) {
          this.audiencesService
            .updateAudience(this.audience?.id, input)
            .pipe(
              switchMap((result) => {
                const input: any = {
                  audience: result?.id,
                };
                return this.campaignService.updateQuest(this.questId, input);
              }),
              catchError(() => {
                this.modalError();
                this.changeDetectorRef.markForCheck();
                return of(null);
              }),
            )
            .subscribe((res) => {
              if (res) {
                this.successPopUp();
                this.changeDetectorRef.markForCheck();
              }
            });
        } else {
          this.audiencesService
            .updateAudience(this.audience?.id, input)
            .pipe(
              catchError(() => {
                this.modalError();
                this.changeDetectorRef.markForCheck();
                return of(null);
              }),
            )
            .subscribe((res) => {
              if (res) {
                this.successPopUp();
                this.changeDetectorRef.markForCheck();
              }
            });
        }
      }
    });
  }

  loadMoreQuestTypes() {
    this.questTypeService.isLastQuests$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.questTypeService.questTypePageIndex++;
        this.questTypeService.searchQuestTypesByTargetWithFilterPaginated().subscribe();
      }
    });
  }

  loadMoreQuests() {
    this.campaignService.isLastQuestActivities$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.campaignService.questPageIndex += 1;
        this.campaignService.findNonPredefinedQuestsByTarget().subscribe();
      }
      this.changeDetectorRef.markForCheck();
    });
  }

  loadMoreQuestActivities(i: number, j: number) {
    this.campaignService.isLastQuestActivities$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.campaignService.questActivityPageIndex += 1;
        this.campaignService.getQuestActivitiesByQuestPaginated(this.selectedQuest?.id).subscribe((res: any) => {
          this.questActivities[i] = this.questActivities[i] || [];
          this.questActivities[i][j] = concat(this.questActivities[i][j], res) as any;
          this.changeDetectorRef.markForCheck();
        });
      }
      this.changeDetectorRef.markForCheck();
    });
  }

  loadMoreQuestions(i: number, j: number) {
    this.campaignService.isLastQuestions$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.campaignService.questionsPageIndex += 1;
        this.campaignService.getQuestionsByForm(this.selectedForm?.id).subscribe((res: any) => {
          this.questQuestions[i] = this.questQuestions[i] || [];
          this.questQuestions[i][j] = concat(this.questQuestions[i][j], res) as any;
          this.changeDetectorRef.markForCheck();
        });
      }
      this.changeDetectorRef.markForCheck();
    });
  }

  onChangeQuest(quest: QuestWithProgressType, i: number, j: number) {
    (this.segments.at(this.currentIndex).get('definitions') as FormArray).at(j).get(['value', 'quest', 'activity']).reset();
    (this.segments.at(this.currentIndex).get('definitions') as FormArray).at(j).get(['value', 'quest', 'action', 'form']).reset();
    this.campaignService.questActivityPageIndex = 0;
    this.campaignService.isLastQuestActivities$ = false;
    this.campaignService.infiniteQuestActivities$ = null;
    this.selectedQuest = quest;
    this.campaignService.getQuestActivitiesByQuestPaginated(quest?.id).subscribe((res: any) => {
      if (res) {
        this.questActivities[i] = this.questActivities[i] || [];
        this.questActivities[i][j] = res;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  sectionDropped(event: CdkDragDrop<any[]>): void {
    const formArray = this.segments;
    this.nestedNav = event.currentIndex;
    this.currentIndex = event.currentIndex;
    moveItemInArray(formArray.controls, event.previousIndex, event.currentIndex);
  }

  public getChangedValues(formValue: any, controlValue: any): any {
    return transform(
      formValue,
      (result: any, value: any, key: string) => {
        if (isObject(value) && !isArray(value) && !isDate(value)) {
          const changes = this.getChangedValues(value, controlValue[key]);
          if (keys(changes).length > 0) {
            result[key] = changes;
          }
          return;
        }
        if ((value !== '0.000' || isArray(value) || isDate(value)) && !isEqual((controlValue || {})[key], value)) {
          result[key] = value;
          return;
        }
      },
      {},
    );
  }

  save() {
    this.isButtonDisabled = true;
    let segments = [];
    segments = this.segmentBlock(this.segments.value);
    const input: any = {
      ...FormHelper.getDifference(
        omit(this.initialValues, 'segments', 'media', 'advertiser', 'questType'),
        omit(this.audienceForm.value, 'segments', 'media', 'advertiser', 'questType'),
      ),
      ...(this.initialValues?.media?.path === this.audienceForm.value?.media?.path ? {} : { media: this.audienceForm.value?.media }),
      ...(this.initialValues?.questType === this.audienceForm.value?.questType ? {} : { questType: this.audienceForm.value?.questType }),
      ...(isEqual(
        (this.initialValues.media?.pictures?.length ? cloneDeep(this.initialValues.media?.pictures) : []).sort(),
        (this.audienceForm.value?.media?.pictures?.length ? cloneDeep(this.audienceForm.value.media?.pictures) : []).sort(),
      )
        ? {}
        : { media: this.audienceForm.value.media }),
      ...(this.initialValues.target?.pos !== this.audienceForm.value?.target?.pos
        ? {
            target: { pos: this.audienceForm.value?.target?.pos },
            advertiser: { pos: this.storageHelper.getData('posId') },
          }
        : {}),
      segments,
    };
    console.log('input', input);
    if (this.selectedAudience) {
      if (this.questId) {
        this.audiencesService
          .updateAudience(this.audience?.id, input)
          .pipe(
            switchMap((result) => {
              const input: any = {
                audience: result?.id,
              };
              return this.campaignService.updateQuest(this.questId, input);
            }),
            catchError(() => {
              this.modalError();
              this.changeDetectorRef.markForCheck();
              return of(null);
            }),
          )
          .subscribe((res) => {
            if (res) {
              this.successPopUp();
              this.changeDetectorRef.markForCheck();
            }
          });
      } else {
        this.audiencesService
          .updateAudience(this.audience?.id, input)
          .pipe(
            catchError(() => {
              this.modalError();
              this.changeDetectorRef.markForCheck();
              return of(null);
            }),
          )
          .subscribe((res) => {
            if (res) {
              this.successPopUp();
              this.changeDetectorRef.markForCheck();
            }
          });
      }
    } else {
      this.audiencesService
        .createAudience(input)
        .pipe(
          catchError(() => {
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.exit();
            this.successPopUp();
            this.changeDetectorRef.markForCheck();
          }
        });
    }
  }

  modalError() {
    this.translate.get('MENUITEMS.TS.STH_WENT_WRONG').subscribe((sthWentWrong: string) => {
      Swal.fire({
        title: 'Oops...',
        text: sthWentWrong,
        icon: 'error',
        showCancelButton: false,
        confirmButtonColor: 'rgb(3, 142, 220)',
        cancelButtonColor: 'rgb(243, 78, 78)',
      });
    });
  }

  successPopUp() {
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

  prevStep() {
    const prevStep = this.currentStep$.value - 1;
    if (prevStep === 0) {
      return;
    }
    this.currentStep$.next(prevStep);
  }

  ngOnDestroy() {
    this.questActivities = null;
    this.campaignService.infiniteQuestActivities$ = null;
    this.quests$ = null;
    this.questTypeService.infiniteQuestType$ = null;
    this.questTypeService.questTypePageIndex = 0;
    this.campaignService.infiniteQuestions$ = null;
    this.campaignService.infiniteQuests$ = null;
    this.campaignService.questionsPageIndex = 0;
    this.campaignService.questPageIndex = 0;
    this.campaignService.questActivityPageIndex = 0;
    this.audiencesService.audience$ = null;
    this.campaignService.activityPageIndex = 0;
    this.audiencesService.criteriasPageIndex = 0;
    this.audiencesService.infinteCriterias$ = null;
    this.campaignService.searchString = '';
    this.campaignService.questionsSearchString = '';
    this.audiencesService.criteriaSearchString = '';
    this.campaignService.questActivitiesSearchString = '';
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
