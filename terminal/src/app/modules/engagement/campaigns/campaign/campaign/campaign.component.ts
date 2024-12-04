import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgxFileDropEntry, FileSystemFileEntry } from 'ngx-file-drop';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forEach, isEqual, map, omit, range, values, max, min, find, chain, cloneDeep, some, compact, uniq } from 'lodash';
import { BehaviorSubject, Observable, Subject, catchError, combineLatest, of, switchMap, takeUntil, map as rxMap } from 'rxjs';

import {
  ApiMethods,
  FormStatus,
  OperatorEnum,
  GameTypeEnum,
  GameTimerEnum,
  WalletTypeEnum,
  MemorySetupEnum,
  QuestStatusEnum,
  ActivityTypeType,
  QuestActivityType,
  LoyaltySettingsType,
  DeleteFileFromAwsGQL,
  SocialContentTypeEnum,
  GenerateS3SignedUrlGQL,
  QuestActionDefinitionVideo,
  QuestActionDefinitionDefinitionInput,
  QuestActionDefinitionDefinitionGamePuzzleThresholdType,
} from '@sifca-monorepo/terminal-generator';
import { SocialType } from '@sifca-monorepo/terminal-generator';
import { AmazonS3Helper, FormHelper, StorageHelper } from '@diktup/frontend/helpers';
import { QuestWithProgressType } from '@sifca-monorepo/terminal-generator';
import { QuestionDtoType, QuestionSettingsInput } from '@sifca-monorepo/terminal-generator';
import { Gender, AcademicLevel, MaritalStatus, QuestionTypeEnum, SocialActionEnum } from '@sifca-monorepo/terminal-generator';

import { CampaignsService } from '../campaigns.service';
import { PosService } from '../../../../../core/services/pos.service';
import { AWS_CREDENTIALS } from '../../../../../../environments/environment';
import { SharedService } from '../../../../../shared/services/shared.service';
import { LoyaltyService } from '../../../../system/apps/apps/loyalty/loyalty.service';

@Component({
  selector: 'app-campaign',
  templateUrl: './campaign.component.html',
  styleUrls: ['./campaign.component.scss'],
})
export class CampaignComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  questId: string;
  currentRate = 8;
  initValues: any;
  mediaVideo: any;
  videoId: string;
  currentIndex = 0;
  isLoading = false;
  pieceOptions: any;
  formsCount: number;
  stepForm: FormGroup;
  challengeId: string;
  questionType: string;
  isReadyToDrag = true;
  loadingUpload = false;
  selectedStepId: string;
  initialFormValues: any;
  selectedFormId: string;
  selectedDefinition: any;
  questionForm: FormGroup;
  showEmojiPicker = false;
  ratingRanges: any[] = [];
  isButtonDisabled = false;
  genders = values(Gender);
  selectedActivity: string;
  editMode: boolean[] = [];
  selectedGameType: string;
  isVideoDisplayed = false;
  files: NgxFileDropEntry[];
  initialActivityValues: any;
  questionSettings: string[];
  questionInitialValues: any;
  isDefButtonDisabled = true;
  formQuestionForm: FormGroup;
  isFormButtonDisabled = true;
  selectedTypes: string[] = [];
  quest: QuestWithProgressType;
  questActivityForm: FormGroup;
  selectedActivityType: string;
  questions: QuestionDtoType[];
  games = values(GameTypeEnum);
  selectedQuestionIndex: number;
  timer = values(GameTimerEnum);
  activeTab: string = 'overview';
  questDefinitionForm: FormGroup;
  isChoicesButtonDisabled = true;
  isActionButtonDisabled = false;
  formStatus = values(FormStatus);
  apiMethods = values(ApiMethods);
  setup = values(MemorySetupEnum);
  isQuestionButtonDisabled = true;
  operators = values(OperatorEnum);
  selectedQuestion: QuestionDtoType;
  isButtonDefinitionDisabled = true;
  walletTypes = values(WalletTypeEnum);
  questActivities: QuestActivityType[];
  maritalStatus = values(MaritalStatus);
  currentActivityType: ActivityTypeType;
  academicLevels = values(AcademicLevel);
  selectedSettings: QuestionSettingsInput;
  socialActions = values(SocialActionEnum);
  selectedQuestActivity: QuestActivityType;
  selectedActivityDefinition: QuestActivityType;
  socialContents = values(SocialContentTypeEnum);
  socials$: Observable<SocialType[]> = this.posService.socials$;
  currentStep$: BehaviorSubject<number> = new BehaviorSubject(1);
  isLastQuestions$: Observable<boolean> = this.campaignService.isLastQuestions$;
  isCurrentFormValid$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  activityTypes$: Observable<ActivityTypeType[]> = this.campaignService.activityTypes$;
  loyaltySettings$: Observable<LoyaltySettingsType> = this.loyaltyService.loyaltySettings$;
  infiniteQuestions$: Observable<QuestionDtoType[]> = this.campaignService.infiniteQuestions$;
  loadingQuestActivities$: Observable<boolean> = this.campaignService.isLoadingQuestActivities$;
  questActivitesByQuest$: Observable<QuestActivityType[]> = this.campaignService.questActivitesByQuest$;

  get questionsArray(): FormArray {
    return this.questionForm?.get('questions') as FormArray;
  }

  get pictures(): FormArray {
    return (this.questActivityForm?.get('media') as FormGroup)?.get('pictures') as FormArray;
  }

  get params(): FormArray {
    return this.questDefinitionForm.get('definition').get('api').get('params') as FormArray;
  }

  get headers(): FormArray {
    return this.questDefinitionForm.get('definition').get('api').get('headers') as FormArray;
  }

  get userParams(): FormArray {
    return this.questDefinitionForm.get('definition').get('api').get('userParams') as FormArray;
  }

  get threshold(): FormArray {
    return this.questDefinitionForm.get(['definition', 'game', 'sliding', 'threshold']) as FormArray;
  }

  get api() {
    return this.questDefinitionForm.get('definition').get('api');
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
    private sanitizer: DomSanitizer,
    private translate: TranslateService,
    private sharedService: SharedService,
    private storageHelper: StorageHelper,
    private amazonS3Helper: AmazonS3Helper,
    private loyaltyService: LoyaltyService,
    private campaignService: CampaignsService,
    private changeDetectorRef: ChangeDetectorRef,
    private deleteFileFromAwsGQL: DeleteFileFromAwsGQL,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
  ) {
    combineLatest([
      this.translate.get('MODULES.ENGAGEMENT.PUZZLE2x2'),
      this.translate.get('MODULES.ENGAGEMENT.PUZZLE3x3'),
      this.translate.get('MODULES.ENGAGEMENT.PUZZLE4x4'),
    ])
      .pipe(
        rxMap(([puzzle2x2, puzzle3x3, puzzle4x4]) => {
          this.pieceOptions = [
            { value: 2, label: puzzle2x2 },
            { value: 3, label: puzzle3x3 },
            { value: 4, label: puzzle4x4 },
          ];
        }),
      )
      .subscribe();
    this.campaignService.infiniteQuestions$ = null;
    this.campaignService.questionsPageIndex = 0;
    this.campaignService.isLoadingQuestActivities$ = true;
    this.campaignService.quest$.subscribe((quest) => {
      this.quest = quest;
      if (quest) {
        this.questionSettings = quest?.questType?.questionTypes;
        this.questId = quest?.id;
        this.campaignService.getQuestActivitiesByQuestPaginated(this.questId, true).subscribe((res) => {
          if (res && res[0]?.activity?.action?.definition?.form?.form?.id) {
            this.campaignService.infiniteQuestions$ = null;
            this.campaignService.questionsPageIndex = 0;
            this.questions = [];
            this.campaignService.getQuestionsByForm(this.questActivities[0]?.activity?.action?.definition?.form?.form?.id).subscribe();
          }
        });
        this.campaignService.questActivities$.pipe(takeUntil(this.unsubscribeAll)).subscribe((questActivities: QuestActivityType[]) => {
          this.questActivities = questActivities;
          this.formsCount = questActivities?.length;
          this.currentStep$.subscribe((current: number) => {
            this.currentIndex = questActivities?.length > 0 ? current - 1 : -1;
            if (this.currentIndex > -1 && this.questActivities[this.currentIndex]?.activity?.action?.definition?.form?.form) {
            } else {
              this.editMode = [true];
            }
            this.campaignService.infiniteQuestions$.pipe(takeUntil(this.unsubscribeAll)).subscribe((questions) => {
              this.questions = questions;
              this.editMode = questions?.length ? Array(questions?.length).fill(true) : [true];
              this.questionForm = this.formBuilder.group({
                questions: this.formBuilder.array(
                  questions?.length
                    ? map(questions, (qst, i: number) => {
                        return this.formBuilder.group({
                          id: [qst?.id || ''],
                          title: [qst?.title || ''],
                          form: [
                            this.currentIndex > -1
                              ? this.questActivities[this.currentIndex]?.activity?.action?.definition?.form?.form?.id
                              : undefined,
                          ],
                          description: [qst?.description || ''],
                          choices: this.formBuilder.array(
                            qst?.choices?.length
                              ? map(qst?.choices, (choice) => {
                                  return this.formBuilder.group({
                                    item: [choice?.item || ''],
                                    enable: [choice?.enable || false],
                                  });
                                })
                              : [
                                  this.formBuilder.group({
                                    item: [''],
                                    enable: [false],
                                  }),
                                ],
                          ),
                          type: [qst?.type || undefined],
                          settings: this.formBuilder.group({
                            shortAnswer: this.formBuilder.group({
                              min: [qst?.settings?.shortAnswer?.min || ''],
                              max: [qst?.settings?.shortAnswer?.max || ''],
                            }),
                            paragraph: this.formBuilder.group({
                              min: [qst?.settings?.paragraph?.min || ''],
                              max: [qst?.settings?.paragraph?.max || ''],
                            }),
                            singleChoice: this.formBuilder.group({
                              toggle: [qst?.settings?.singleChoice?.toggle || false],
                              poll: [qst?.settings?.singleChoice?.poll || false],
                            }),
                            multipleChoice: this.formBuilder.group({
                              poll: [qst?.settings?.multipleChoice?.poll || false],
                            }),
                            rating: this.formBuilder.group({
                              levels: [qst?.settings?.rating?.levels || ''],
                            }),
                            date: this.formBuilder.group({
                              outdated: [qst?.settings?.date?.outdated || false],
                              interval: [qst?.settings?.date?.interval || false],
                            }),
                            number: this.formBuilder.group({
                              minValue: [qst?.settings?.number?.minValue >= 0 ? qst?.settings?.number?.minValue : undefined],
                              maxValue: [qst?.settings?.number?.maxValue >= 0 ? qst?.settings?.number?.maxValue : undefined],
                            }),
                            smiley: this.formBuilder.group({
                              levels: this.formBuilder.array(
                                qst?.settings?.smiley?.levels?.length
                                  ? map(qst?.settings?.smiley?.levels, (level) => {
                                      this.selectedTypes[i] = level?.picture ? 'picture' : 'icon';
                                      return this.formBuilder.group({
                                        rank: [level?.rank || undefined],
                                        icon: [level?.icon || ''],
                                        type: [level?.picture ? 'picture' : 'icon'],
                                        picture: this.formBuilder.group({
                                          baseUrl: [level?.picture?.baseUrl || ''],
                                          path: [level?.picture?.path || ''],
                                        }),
                                      });
                                    })
                                  : [],
                              ),
                            }),
                          }),
                        });
                      })
                    : [
                        this.formBuilder.group({
                          title: [''],
                          form: [
                            this.currentIndex > -1 && this.questActivities[this.currentIndex]?.activity?.action?.definition?.form?.form
                              ? this.questActivities[this.currentIndex]?.activity?.action?.definition?.form?.form?.id
                              : '',
                          ],
                          description: [''],
                          choices: this.formBuilder.array([
                            this.formBuilder.group({
                              item: [''],
                              enable: [false],
                            }),
                          ]),
                          type: [QuestionTypeEnum?.MULTIPLE_CHOICE],
                          settings: this.formBuilder.group({
                            shortAnswer: this.formBuilder.group({
                              min: [''],
                              max: [''],
                            }),
                            paragraph: this.formBuilder.group({
                              min: [''],
                              max: [''],
                            }),
                            singleChoice: this.formBuilder.group({
                              toggle: [false],
                              poll: [false],
                            }),
                            multipleChoice: this.formBuilder.group({
                              poll: [false],
                            }),
                            rating: this.formBuilder.group({
                              levels: [''],
                            }),
                            date: this.formBuilder.group({
                              outdated: [false],
                              interval: [false],
                            }),
                            number: this.formBuilder.group({
                              minValue: [undefined],
                              maxValue: [undefined],
                            }),
                            smiley: this.formBuilder.group({
                              levels: this.formBuilder.array([]),
                            }),
                          }),
                        }),
                      ],
                ),
              });
              this.ratingRanges = [];
              forEach(questions, (qst: QuestionDtoType, i: number) => {
                this.ratingRanges[i] = range(min(qst?.settings?.rating?.levels), max(qst?.settings?.rating?.levels) + 1);
              });
              this.questionInitialValues = this.questionForm.value;
              this.questionForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
                this.isQuestionButtonDisabled = isEqual(values, this.questionInitialValues);
              });
              this.changeDetectorRef.markForCheck();
            });
            if (this.currentIndex > -1) {
              this.selectedFormId = this.questActivities[this.currentIndex]?.activity?.action?.definition?.form?.form?.id;
            }
            this.formQuestionForm = this.formBuilder.group({
              title: [this.currentIndex > -1 ? this.questActivities[this.currentIndex]?.activity?.action?.definition?.form?.form?.title : ''],
              description: [
                this.currentIndex > -1 ? this.questActivities[this.currentIndex]?.activity?.action?.definition?.form?.form?.description : '',
              ],
              type: [this.currentIndex > -1 ? this.questActivities[this.currentIndex]?.activity?.action?.definition?.form?.form?.type : undefined],
              status: [
                this.currentIndex > -1
                  ? this.questActivities[this.currentIndex]?.activity?.action?.definition?.form?.form?.status
                  : FormStatus.ONGOING,
              ],
            });
            this.initialFormValues = this.formQuestionForm.value;
            this.formQuestionForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
              this.isFormButtonDisabled = isEqual(values, this.initialFormValues);
            });
            this.questActivityForm = this.formBuilder.group({
              title: [questActivities?.length ? questActivities[this.currentIndex]?.title : '', Validators.required],
              description: [questActivities?.length ? questActivities[this.currentIndex]?.description : ''],
              tags: [questActivities?.length && questActivities[this.currentIndex]?.tags?.length ? questActivities[this.currentIndex]?.tags : []],
              quest: [this.questId],
              media: this.formBuilder.group({
                pictures: this.formBuilder.array([
                  this.formBuilder.group({
                    path: [
                      questActivities?.length && questActivities[this.currentIndex]?.media?.pictures?.length
                        ? questActivities[this.currentIndex]?.media?.pictures[0]?.path
                        : '',
                    ],
                    baseUrl: [
                      questActivities?.length && questActivities[this.currentIndex]?.media?.pictures?.length
                        ? questActivities[this.currentIndex]?.media?.pictures[0]?.baseUrl
                        : '',
                    ],
                  }),
                ]),
              }),
              activity: this.formBuilder.group({
                action: [questActivities?.length ? questActivities[this.currentIndex]?.activity?.action : undefined],
                transition: this.formBuilder.group({
                  title: [questActivities?.length ? questActivities[this.currentIndex]?.activity?.transition?.title : undefined],
                  description: [questActivities?.length ? questActivities[this.currentIndex]?.activity?.transition?.description : ''],
                }),
              }),
            });
            this.currentActivityType = this.currentIndex > -1 ? questActivities[this.currentIndex]?.activity?.action?.activityType : null;
            this.changeDetectorRef.markForCheck();
            this.initialActivityValues = this.questActivityForm.value;
            this.questActivityForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
              this.isButtonDisabled = false;
              // this.isButtonDisabled = isEqual(this.initialActivityValues, values);
            });
            this.selectedActivity = this.questActivityForm.get(['activity', 'action'])?.value?.activityType?.title
              ? 'Action'
              : this.questActivityForm.get(['activity', 'transition']).value?.title
              ? 'Transition'
              : null;
            const definition: QuestActionDefinitionDefinitionInput = this.questActivityForm.get(['activity', 'action'])?.value?.definition;
            this.selectedQuestion = this.questActivityForm.get(['activity', 'action'])?.value?.definition?.choices?.suggestions;
            this.questionType = this.questActivityForm.get(['activity', 'action'])?.value?.definition?.choices?.suggestions?.type;
            this.questDefinitionForm = this.formBuilder.group({
              activityType: [this.questActivityForm.get(['activity', 'action'])?.value?.activityType || undefined, Validators.required],
              required: [this.questActivityForm.get(['activity', 'action'])?.value?.required || true],
              definition: this.formBuilder.group({
                game: this.formBuilder.group({
                  gameType: [
                    {
                      value: definition?.game?.gameType || undefined,
                      disabled: this.quest?.status === QuestStatusEnum.ONGOING || this.quest?.status === QuestStatusEnum.FINISHED,
                    },
                  ],
                  quizz: this.formBuilder.group({
                    picture: this.formBuilder.group({
                      baseUrl: [definition?.game?.quizz?.picture?.baseUrl || ''],
                      path: [definition?.game?.quizz?.picture?.path || ''],
                    }),
                    quizzType: [definition?.game?.quizz?.quizzType || QuestionTypeEnum.SINGLE_CHOICE],
                    choices: this.formBuilder.array(
                      definition?.game?.quizz?.choices?.length
                        ? map(definition?.game?.quizz?.choices, (choice) => {
                            return this.formBuilder.group({
                              item: [choice?.item],
                              correct: [choice?.correct],
                            });
                          })
                        : [
                            this.formBuilder.group({
                              item: [''],
                              correct: [false],
                            }),
                          ],
                    ),
                  }),
                  jigsaw: this.formBuilder.group({
                    pieces: [
                      {
                        value: definition?.game?.jigsaw?.pieces || undefined,
                        disabled: this.quest?.status === QuestStatusEnum.ONGOING || this.quest?.status === QuestStatusEnum.FINISHED,
                      },
                    ],
                    picture: this.formBuilder.group({
                      baseUrl: [definition?.game?.jigsaw?.picture?.baseUrl || ''],
                      path: [definition?.game?.jigsaw?.picture?.path || ''],
                    }),
                  }),
                  memory: this.formBuilder.group({
                    setup: [
                      {
                        value: definition?.game?.memory?.setup || undefined,
                        disabled: this.quest?.status === QuestStatusEnum.ONGOING || this.quest?.status === QuestStatusEnum.FINISHED,
                      },
                    ],
                    pictures: this.formBuilder.array(
                      definition?.game?.memory?.pictures?.length
                        ? map(definition?.game?.memory?.pictures, (pic) => {
                            return this.formBuilder.group({
                              baseUrl: [pic?.baseUrl],
                              path: [pic?.path],
                            });
                          })
                        : [],
                    ),
                    timer: [
                      {
                        value: definition?.game?.memory?.timer || undefined,
                        disabled: this.quest?.status === QuestStatusEnum.ONGOING || this.quest?.status === QuestStatusEnum.FINISHED,
                      },
                    ],
                  }),
                  sliding: this.formBuilder.group({
                    picture: this.formBuilder.group({
                      path: [definition?.game?.sliding?.picture?.path || ''],
                      baseUrl: [definition?.game?.sliding?.picture?.baseUrl || ''],
                    }),
                    threshold: this.formBuilder.array(
                      definition?.game?.sliding?.threshold?.length
                        ? map(definition?.game?.sliding?.threshold, (item: QuestActionDefinitionDefinitionGamePuzzleThresholdType) => {
                            return this.formBuilder.group({
                              bonus: this.formBuilder.array([
                                this.formBuilder.group({
                                  walletType: [item?.bonus[0].walletType],
                                  amount: [item?.bonus[0].amount || ''],
                                }),
                                this.formBuilder.group({
                                  walletType: [item?.bonus[1].walletType],
                                  amount: [item?.bonus[1].amount || ''],
                                }),
                              ]),
                              timer: [
                                {
                                  value: item?.timer || undefined,
                                  disabled: this.quest?.status === QuestStatusEnum.ONGOING || this.quest?.status === QuestStatusEnum.FINISHED,
                                },
                              ],
                            });
                          })
                        : [],
                    ),
                  }),
                }),
                form: this.formBuilder.group({
                  scoring: [definition?.form?.scoring || false],
                  random: [definition?.form?.random || false],
                  form: [definition?.form?.form || ''],
                }),
                video: this.formBuilder.group({
                  link: [definition?.video?.link || ''],
                  source: [definition?.video?.source || QuestActionDefinitionVideo.YOUTUBE],
                  minSeconds: [definition?.video?.minSeconds || undefined],
                }),
                lead: this.formBuilder.group({
                  url: [definition?.lead?.url || ''],
                  minSeconds: [definition?.lead?.minSeconds || undefined],
                }),
                appDownload: this.formBuilder.group({
                  playstore: [definition?.appDownload?.playstore || ''],
                  appstore: [definition?.appDownload?.appstore || ''],
                  appgallery: [definition?.appDownload?.appgallery || ''],
                }),
                socialMedia: this.formBuilder.group({
                  socialMedia: [definition?.socialMedia?.socialMedia || undefined],
                  hashtag: [definition?.socialMedia?.hashtag || undefined],
                  action: [SocialActionEnum.SHARE],
                  socialContent: [SocialContentTypeEnum.PAGE],
                  url: [definition?.socialMedia?.url || undefined],
                }),
                api: this.formBuilder.group({
                  userParams: this.formBuilder.array(
                    this.questActivityForm.get(['activity', 'action'])?.value?.definition?.api?.userParams?.length
                      ? map(this.questActivityForm.get(['activity', 'action'])?.value?.definition?.api?.userParams, (param) => {
                          this.formBuilder.group({
                            key: [param?.key || ''],
                            value: [param?.value || ''],
                          });
                        })
                      : [
                          this.formBuilder.group({
                            key: [''],
                            value: [''],
                          }),
                        ],
                  ),
                  link: [
                    this.questActivityForm.get(['activity', 'action'])?.value?.definition?.api?.link || '',
                    Validators.pattern('^(https?|ftp)://[^s/$.?#].[^s]*$'),
                  ],
                  method: [this.questActivityForm.get(['activity', 'action'])?.value?.definition?.api?.method || ApiMethods?.GET],
                  params: this.formBuilder.array(
                    this.questActivityForm.get(['activity', 'action'])?.value?.definition?.api?.params?.length
                      ? map(this.questActivityForm.get(['activity', 'action'])?.value?.definition?.api?.params, (param) => {
                          return this.formBuilder.group({
                            key: [param?.key || ''],
                            value: [param?.value || ''],
                            user: this.formBuilder.group({
                              label: [param?.user?.label || ''],
                              enable: [param?.user?.enable === true ? true : false],
                            }),
                          });
                        })
                      : [
                          this.formBuilder.group({
                            key: [''],
                            value: [''],
                            user: this.formBuilder.group({
                              label: [''],
                              enable: [false],
                            }),
                          }),
                        ],
                  ),
                  headers: this.formBuilder.array(
                    this.questActivityForm.get(['activity', 'action'])?.value?.definition?.api?.headers?.length
                      ? map(this.questActivityForm.get(['activity', 'action'])?.value?.definition?.api?.headers, (header) => {
                          return this.formBuilder.group({
                            key: [header?.key || ''],
                            value: [header?.value || ''],
                          });
                        })
                      : [
                          this.formBuilder.group({
                            key: [''],
                            value: [''],
                          }),
                        ],
                  ),
                }),
              }),
            });
            if (this.questDefinitionForm.get(['definition', 'video', 'link']).value) {
              this.isVideoDisplayed = true;
              this.mediaVideo =
                this.questDefinitionForm.get(['definition', 'video', 'source']).value === QuestActionDefinitionVideo.YOUTUBE
                  ? this.setVideoLink(this.questDefinitionForm.get(['definition', 'video', 'link']).value)
                  : this.questDefinitionForm.get(['definition', 'video', 'link']).value;
            } else {
              this.mediaVideo = null;
            }
            this.initValues = this.questDefinitionForm.value;
            this.questDefinitionForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
              this.isDefButtonDisabled = this.selectedActivity === 'Action' ? isEqual(this.initValues, values) : false;
              this.changeDetectorRef.markForCheck();
            });
            this.selectedGameType =
              this.questDefinitionForm.get(['definition', 'game', 'gameType']).value === GameTypeEnum.JIGSAW
                ? 'jigsaw'
                : this.questDefinitionForm.get(['definition', 'game', 'gameType']).value === GameTypeEnum.MEMORY_GAME
                ? 'memory'
                : this.questDefinitionForm.get(['definition', 'game', 'gameType']).value === GameTypeEnum.SLIDING
                ? 'sliding'
                : 'quizz';
            this.selectedActivityType = this.questActivityForm.get(['activity', 'action'])?.value?.activityType?.code;
          });
          this.changeDetectorRef.markForCheck();
        });
      }
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
    combineLatest([this.loyaltyService.findLoyaltySettingsByTarget(), this.posService.findSocialsPagination()]).subscribe();
  }

  onChangeActivity(activity: string) {
    if (activity === 'transition') {
      this.questDefinitionForm.reset();
      this.clearFormValidators(this.questDefinitionForm);
    } else if (activity === 'action') {
      this.questActivityForm.get(['activity', 'transition']).reset();
      this.clearFormValidators(this.questActivityForm);
    }
  }

  clearFormValidators(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((controlName) => {
      const control = formGroup.get(controlName);
      if (control instanceof FormGroup) {
        this.clearFormValidators(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach((arrayControl) => {
          if (arrayControl instanceof FormGroup) {
            this.clearFormValidators(arrayControl);
          } else {
            arrayControl.clearValidators();
            arrayControl.updateValueAndValidity();
          }
        });
      } else {
        control.clearValidators();
        control.updateValueAndValidity();
      }
    });
  }

  handleButtonDisabled1(): boolean {
    if (this.selectedActivity === 'Transition') {
      return this.questActivityForm.get(['activity', 'transition']).invalid || this.isButtonDisabled;
    } else {
      return (
        this.isButtonDisabled ||
        this.questActivityForm.invalid ||
        !this.questDefinitionForm.get('activityType').value ||
        (this.selectedActivityType === 'QUESTION' && !this.selectedFormId)
      );
    }
  }

  handleButtonDisabled(): boolean {
    if (this.selectedActivity === 'Transition') {
      return this.questActivityForm.get(['activity', 'transition']).invalid || this.isButtonDisabled;
    } else {
      if (this.questDefinitionForm.get('activityType')?.value?.code === 'GAME') {
        let invalid = false;
        switch (this.selectedGameType) {
          case 'quizz':
            invalid =
              !this.questDefinitionForm.get(['definition', 'game', 'quizz', 'picture', 'path']).value ||
              this.questDefinitionForm.get(['definition', 'game', 'quizz', 'choices']).invalid;
            break;
          case 'memory':
            invalid =
              !this.questDefinitionForm.get(['definition', 'game', 'memory', 'setup']).value ||
              !this.questDefinitionForm.get(['definition', 'game', 'memory', 'timer']).value ||
              this.questDefinitionForm.get(['definition', 'game', 'memory', 'pictures']).value?.length <
                (this.questDefinitionForm.get(['definition', 'game', 'memory', 'setup']).value === 'FOUR'
                  ? 4
                  : this.questDefinitionForm.get(['definition', 'game', 'memory', 'setup']).value === 'EIGHT'
                  ? 8
                  : this.questDefinitionForm.get(['definition', 'game', 'memory', 'setup']).value === 'TWELVE'
                  ? 12
                  : 16);
            break;
          case 'sliding':
            invalid = !this.questDefinitionForm.get(['definition', 'game', 'sliding', 'picture', 'path']).value || this.threshold.invalid;
            break;
          case 'jigsaw':
            invalid =
              !this.questDefinitionForm.get(['definition', 'game', 'jigsaw', 'picture', 'path']).value ||
              !this.questDefinitionForm.get(['definition', 'game', 'jigsaw', 'pieces']).value;
            break;
          default:
            invalid = false;
        }

        if (invalid || !this.questDefinitionForm.get(['definition', 'game', 'gameType']).value) {
          return true;
        }
      }
      return (
        this.isButtonDisabled ||
        this.questActivityForm.invalid ||
        !this.questDefinitionForm.get('activityType').value ||
        (this.selectedActivityType === 'QUESTION' && !this.selectedFormId)
      );
    }
  }

  save() {
    this.isDefButtonDisabled = true;
    this.isButtonDisabled = true;
    let field = this.currentIndex === -1 ? 'createQuestActivity' : 'updateQuestActivity';
    this.isLoading = true;
    switch (this.selectedActivityType) {
      case 'GAME':
        const threshold = chain(this.threshold.value)
          .filter((item) => some(item?.bonus, (bonusItem) => bonusItem.amount))
          .map(({ timer, ...rest }) => ({
            ...rest,
            ...(timer ? { timer } : {}),
          }))
          .value();
        const timerValues = compact(threshold.map((item) => item.timer));
        const uniqueTimers = uniq(timerValues);
        if (timerValues.length !== uniqueTimers.length) {
          this.translate.get('MENUITEMS.TS.DUPLICATE_TIMER').subscribe((sthWentWrong: string) => {
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
        this.selectedDefinition = {
          game: {
            gameType: this.questDefinitionForm.get(['definition', 'game', 'gameType']).value,
            ...(this.selectedGameType === 'sliding'
              ? {
                  sliding: {
                    ...(this.questDefinitionForm.get(['definition', 'game', 'sliding', 'picture', 'path']).value ===
                    this.initValues.definition.game.sliding.picture.path
                      ? {}
                      : { picture: this.questDefinitionForm.get(['definition', 'game', 'sliding', 'picture']).value }),

                    ...(isEqual(
                      (this.initValues.definition.game.sliding.threshold?.length
                        ? cloneDeep(this.initValues.definition.game.sliding.threshold)
                        : []
                      ).sort(),
                      (this.questDefinitionForm.get(['definition', 'game', 'sliding', 'threshold']).value?.length
                        ? cloneDeep(this.questDefinitionForm.get(['definition', 'game', 'sliding', 'threshold']).value)
                        : []
                      ).sort(),
                    )
                      ? {}
                      : {
                          threshold: threshold,
                        }),
                  },
                }
              : {}),
            ...(this.selectedGameType === 'quizz'
              ? {
                  quizz: {
                    ...(this.questDefinitionForm.get(['definition', 'game', 'quizz', 'picture', 'path']).value ===
                    this.initValues.definition.game.quizz.picture.path
                      ? {}
                      : { picture: this.questDefinitionForm.get(['definition', 'game', 'quizz', 'picture']).value }),
                    ...(this.questDefinitionForm.get(['definition', 'game', 'quizz', 'quizzType']).value ===
                    this.initValues.definition.game.quizz.quizzType
                      ? {}
                      : { quizzType: this.questDefinitionForm.get(['definition', 'game', 'quizz', 'quizzType']).value }),

                    ...(isEqual(
                      (this.initValues.definition.game.quizz.choices?.length ? cloneDeep(this.initValues.definition.game.quizz.choices) : []).sort(),
                      (this.questDefinitionForm.get(['definition', 'game', 'quizz', 'choices']).value?.length
                        ? cloneDeep(this.questDefinitionForm.get(['definition', 'game', 'quizz', 'choices']).value)
                        : []
                      ).sort(),
                    )
                      ? {}
                      : {
                          choices: chain(this.questDefinitionForm.get(['definition', 'game', 'quizz', 'choices']).value)
                            .filter((choice) => choice?.item !== '')
                            .map((choice) => ({
                              ...(choice.item ? { item: choice.item } : {}),
                              correct: choice.correct === true ? true : false,
                            }))
                            .value(),
                        }),
                  },
                }
              : {}),
            ...(this.selectedGameType === 'jigsaw'
              ? {
                  jigsaw: {
                    ...(this.questDefinitionForm.get(['definition', 'game', 'jigsaw', 'picture', 'path']).value ===
                    this.initValues.definition.game.jigsaw.picture.path
                      ? {}
                      : { picture: this.questDefinitionForm.get(['definition', 'game', 'jigsaw', 'picture']).value }),
                    ...(this.questDefinitionForm.get(['definition', 'game', 'jigsaw', 'pieces']).value ===
                    this.initValues.definition.game.jigsaw.pieces
                      ? {}
                      : { pieces: this.questDefinitionForm.get(['definition', 'game', 'jigsaw', 'pieces']).value }),
                  },
                }
              : {}),
            ...(this.selectedGameType === 'memory'
              ? {
                  memory: {
                    ...(this.questDefinitionForm.get(['definition', 'game', 'memory', 'setup']).value === this.initValues.definition.game.memory.setup
                      ? {}
                      : { setup: this.questDefinitionForm.get(['definition', 'game', 'memory', 'setup']).value }),

                    ...(this.questDefinitionForm.get(['definition', 'game', 'memory', 'timer']).value === this.initValues.definition.game.memory.timer
                      ? {}
                      : { timer: this.questDefinitionForm.get(['definition', 'game', 'memory', 'timer']).value }),

                    ...(isEqual(
                      (this.initValues.definition.game.memory.pictures?.length
                        ? cloneDeep(this.initValues.definition.game.memory.pictures)
                        : []
                      ).sort(),
                      (this.questDefinitionForm.get(['definition', 'game', 'memory', 'pictures']).value?.length
                        ? cloneDeep(this.questDefinitionForm.get(['definition', 'game', 'memory', 'pictures']).value)
                        : []
                      ).sort(),
                    )
                      ? {}
                      : {
                          pictures: this.questDefinitionForm.get(['definition', 'game', 'memory', 'pictures']).value,
                        }),
                  },
                }
              : {}),
          },
        };
        break;
      case 'API_ACTION':
        this.selectedDefinition = {
          api: {
            ...omit(this.api.value, 'userParams'),
            params: map(this.params.value, (pm) => {
              return {
                ...pm,
                ...(pm.value ? { user: { label: null, enable: false } } : { value: null }),
              };
            }),
          },
        };
        break;
      case 'MEDIA':
        this.selectedDefinition = {
          video: this.questDefinitionForm.get(['definition', 'video']).value,
        };
        break;
      case 'SOCIAL_MEDIA':
        this.selectedDefinition = {
          socialMedia: {
            ...this.questDefinitionForm.get(['definition', 'socialMedia']).value,
            socialMedia: this.questDefinitionForm.get(['definition', 'socialMedia', 'socialMedia']).value?.id,
          },
        };
        break;
      case 'DOWNLOAD_APP':
        this.selectedDefinition = {
          appDownload: this.questDefinitionForm.get(['definition', 'appDownload']).value,
        };
        break;
      case 'LEAD_GENERATION':
        this.selectedDefinition = {
          lead: this.questDefinitionForm.get(['definition', 'lead']).value,
        };
        break;
      case 'QUESTION':
        this.selectedDefinition = {
          form: {
            ...omit(this.questDefinitionForm.get(['definition', 'form']).value, 'form'),
            form:
              this.questDefinitionForm.get(['definition', 'form', 'form']).value?.id ||
              this.questDefinitionForm.get(['definition', 'form', 'form']).value,
          },
        };
        break;
    }
    if (this.selectedActivity === 'Action') {
      const input: any = {
        activityType: this.questDefinitionForm.get('activityType')?.value?.id,
        required: this.questDefinitionForm.get('required')?.value || false,
        definition: this.selectedDefinition,
      };
      if (this.questActivities[this.currentIndex]?.activity?.action?.id) {
        this.campaignService
          .updateQuestActionDefinition(this.questActivities[this.currentIndex]?.activity?.action?.id, input)
          .pipe(
            catchError(() => {
              this.isButtonDisabled = false;
              this.isLoading = false;
              this.modalError();
              this.changeDetectorRef.markForCheck();
              return of(null);
            }),
            switchMap((res) => {
              if (res) {
                const questInput: any = {
                  ...FormHelper.getDifference(
                    omit(this.initialActivityValues, 'media', 'tags', 'quest'),
                    omit(this.questActivityForm.value, 'media', 'tags', 'quest'),
                  ),
                  quest: this.questActivityForm.get('quest').value,
                  ...(isEqual(this.initialActivityValues.media, this.questActivityForm.get('media').value)
                    ? {}
                    : { media: this.questActivityForm.get('media').value }),
                  ...(isEqual(this.initialActivityValues.tags, this.questActivityForm.get('tags').value)
                    ? {}
                    : { tags: this.questActivityForm.get('tags').value }),
                  activity: { action: res?.id },
                };
                return this.campaignService[field](this.currentIndex === -1 ? questInput : this.questActivities[this.currentIndex].id, questInput);
              }
            }),
          )
          .subscribe((res) => {
            if (res) {
              this.isButtonDisabled = false;
              this.isLoading = false;
              this.position();
              this.changeDetectorRef.markForCheck();
            }
          });
      } else {
        this.campaignService
          .createQuestActionDefinition(input)
          .pipe(
            catchError(() => {
              this.isLoading = false;
              this.modalError();
              this.isButtonDisabled = false;
              this.changeDetectorRef.markForCheck();
              return of(null);
            }),
            switchMap((res) => {
              if (res) {
                const questInput: any = {
                  ...FormHelper.getDifference(
                    omit(this.initialActivityValues, 'media', 'tags', 'quest'),
                    omit(this.questActivityForm.value, 'media', 'tags', 'quest'),
                  ),
                  quest: this.questActivityForm.get('quest').value,
                  ...(isEqual(this.initialActivityValues.media, this.questActivityForm.get('media').value)
                    ? {}
                    : { media: this.questActivityForm.get('media').value }),
                  ...(isEqual(this.initialActivityValues.tags, this.questActivityForm.get('tags').value)
                    ? {}
                    : { tags: this.questActivityForm.get('tags').value }),
                  ...(field === 'createQuestActivity' ? { rank: (this.questActivities[this.questActivities?.length - 1]?.rank || 0) + 1 } : {}),
                  activity: { action: res?.id },
                };
                return this.campaignService[field](this.currentIndex === -1 ? questInput : this.questActivities[this.currentIndex]?.id, questInput);
              }
            }),
          )
          .subscribe((res) => {
            if (res) {
              this.isLoading = false;
              this.position();
              this.isButtonDisabled = false;
              this.changeDetectorRef.markForCheck();
            }
          });
      }
    } else if (this.selectedActivity === 'Transition') {
      const questInput: any = {
        ...FormHelper.getDifference(
          omit(this.initialActivityValues, 'media', 'tags', 'quest'),
          omit(this.questActivityForm.value, 'media', 'tags', 'quest'),
        ),
        quest: this.questActivityForm.get('quest').value,
        ...(isEqual(this.initialActivityValues.media, this.questActivityForm.get('media').value)
          ? {}
          : { media: this.questActivityForm.get('media').value }),
        ...(isEqual(this.initialActivityValues.tags, this.questActivityForm.get('tags').value)
          ? {}
          : { tags: this.questActivityForm.get('tags').value }),
        ...(field === 'createQuestActivity' ? { rank: (this.questActivities[this.questActivities?.length - 1]?.rank || 0) + 1 } : {}),
        activity: { transition: FormHelper.getNonEmptyValues(this.questActivityForm.get(['activity', 'transition']).value) },
      };
      this.campaignService[field](this.currentIndex === -1 ? questInput : this.questActivities[this.currentIndex].id, questInput)
        .pipe(
          catchError(() => {
            this.isLoading = false;
            this.modalError();
            this.isButtonDisabled = false;
            this.changeDetectorRef.markForCheck();
            return of(null);
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.isLoading = false;
            this.position();
            this.changeDetectorRef.markForCheck();
          }
        });
    }
  }

  setVideoLink(videoLink) {
    if (videoLink) {
      this.videoId = this.extractVideoId(videoLink);
      if (this.videoId) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${this.videoId}`);
      }
    }
    return null;
  }

  extractVideoId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|\/u\/\w\/|embed\/|watch\?v=|\&v=|v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length == 11 ? match[2] : null;
  }

  addThresholdField() {
    this.threshold.push(
      this.formBuilder.group({
        bonus: this.formBuilder.array([
          this.formBuilder.group({
            walletType: [WalletTypeEnum.QUALITATIVE],
            amount: [''],
          }),
          this.formBuilder.group({
            walletType: [WalletTypeEnum.QUANTITATIVE],
            amount: [''],
          }),
        ]),
        timer: [undefined],
      }),
    );
    this.changeDetectorRef.markForCheck();
  }

  deleteThreshold(index: number) {
    this.threshold.removeAt(index);
    this.changeDetectorRef.markForCheck();
  }

  onChangeChoiceType(choices: FormArray) {
    forEach(choices.controls, (choice: AbstractControl) => {
      choice.get('correct').patchValue(false);
    });
  }

  onChangeQuizzStatus(choices: FormArray, index: number) {
    forEach(choices.controls, (choice: AbstractControl) => {
      choice.get('correct').patchValue(false);
    });
    choices.at(index).get('correct').patchValue(true);
  }

  onChangeChoice(choices: FormArray, index: number) {
    forEach(choices.controls, (choice: AbstractControl) => {
      choice.get('enable').patchValue(false);
    });
    choices.at(index).get('enable').patchValue(true);
  }

  onChangeGame(game: string) {
    switch (game) {
      case GameTypeEnum.MEMORY_GAME:
        this.selectedGameType = 'memory';
        break;
      case GameTypeEnum.SLIDING:
        this.selectedGameType = 'sliding';
        break;
      case GameTypeEnum.JIGSAW:
        this.selectedGameType = 'jigsaw';
        break;
      default:
        this.selectedGameType = 'quizz';
    }
    this.changeDetectorRef.markForCheck();
  }

  onTabChange(event) {
    if (+event.nextId && this.questActivities?.length) {
      this.campaignService.questionsPageIndex = 0;
      this.questions = [];
      this.campaignService.infiniteQuestions$ = null;
      if (this.questActivities[+event.nextId - 1]?.activity?.action?.definition?.form?.form?.id) {
        this.campaignService.getQuestionsByForm(this.questActivities[+event.nextId - 1]?.activity?.action?.definition?.form?.form?.id).subscribe();
      }
    }
  }

  loadMoreQuestions() {
    this.campaignService.questionsPageIndex += 1;
    this.campaignService.getQuestionsByForm(this.selectedFormId, false).subscribe();
  }

  questionDropped(event: CdkDragDrop<any[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    const draggedItem = this.questionsArray.at(event.previousIndex);
    const item = this.questionForm.get('questions').value[event.previousIndex];
    this.questionsArray.removeAt(event.previousIndex);
    this.questionsArray.insert(event.currentIndex, draggedItem);
    this.campaignService
      .reorderQuestionOfForm(item.id, event.currentIndex + 1)
      .pipe(
        catchError(() => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  onChangeActivityType(event: ActivityTypeType) {
    this.selectedActivityType = event?.code;
    combineLatest([
      this.translate.get('MENUITEMS.TS.ARE_YOU_SURE'),
      this.translate.get('MENUITEMS.TS.CONFIRM_CHANGE_ACTIVITY_TYPE'),
      this.translate.get('COMMON.YES_DELETE_IT'),
      this.translate.get('MENUITEMS.TS.CANCEL'),
    ])
      .pipe(
        rxMap(([areYouSure, changingActivityType, yesDelete, noCancel]) => {
          if (this.currentActivityType?.code === 'QUESTION') {
            Swal.fire({
              title: areYouSure,
              text: changingActivityType,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: yesDelete,
              cancelButtonText: noCancel,
              confirmButtonColor: 'rgb(3, 142, 220)',
              cancelButtonColor: 'rgb(243, 78, 78)',
              reverseButtons: true,
            }).then((result) => {
              if (result.isConfirmed) {
                if (this.questActivityForm.get('activity').value.action?.definition?.form?.form?.id) {
                  this.campaignService
                    .deleteFormAndQuestions(this.questActivityForm.get('activity').value.action?.definition?.form?.form?.id)
                    .subscribe((res) => {
                      if (res) {
                        this.questActivities[this.currentIndex].activity.action.definition.form = null;
                      }
                    });
                }
              }
              if (result.isDismissed) {
                this.questDefinitionForm.get('activityType').patchValue(this.currentActivityType);
                this.selectedActivityType = this.currentActivityType.code;
              }
            });
          }
        }),
      )
      .subscribe();
  }

  onChangeVideo(UrlControl: AbstractControl) {
    UrlControl.patchValue('');
    this.isVideoDisplayed = false;
    this.mediaVideo = null;
    this.changeDetectorRef.markForCheck();
  }

  addedFile(videoControl: AbstractControl) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.name = 'fileUpload';
    fileInput.id = 'fileUpload';
    fileInput.accept = 'video/*';
    fileInput.onchange = async () => {
      const file = fileInput.files[0];
      if (file?.size > 2000000) {
        this.translate.get('MENUITEMS.TS.FILE_SIZE').subscribe((sthWentWrong: string) => {
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
        this.loadingUpload = true;
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
            this.mediaVideo = `${picture?.baseUrl}/${picture?.path}`;
            this.isVideoDisplayed = true;
            this.loadingUpload = false;
            videoControl.get('link').patchValue(this.mediaVideo);
            this.changeDetectorRef.markForCheck();
          });
      };
    };
    fileInput.click();
  }

  dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          if (!file) {
            return;
          }
          if (file.size > 100000000) {
            this.translate.get('MENUITEMS.TS.SIZE_WARNING').subscribe((sthWentWrong: string) => {
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
          this.loadingUpload = true;
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
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
                this.mediaVideo = `${picture?.baseUrl}/${picture?.path}`;
                this.isVideoDisplayed = true;
                this.loadingUpload = false;
                this.changeDetectorRef.markForCheck();
              });
          };
        });
      }
    }
  }

  saveForm() {
    const input: any = {
      ...FormHelper.getDifference(this.initialFormValues, this.formQuestionForm.value),
      id: this.selectedFormId,
    };
    this.campaignService
      .updateForm(input)
      .pipe(
        catchError(() => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.position();
          this.selectedFormId = res?.id;
          this.questDefinitionForm.get(['definition', 'form', 'form']).patchValue(res?.id);
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  saveQuestion(index: number) {
    this.editMode[index] = !this.editMode[index];
    if (this.isQuestionButtonDisabled === false && this.questionForm.valid && this.editMode[index] === false) {
      switch (this.questionForm.get('questions').value[index]?.type) {
        case 'SINGLE_CHOICE':
          this.selectedSettings = {
            singleChoice: {
              poll: this.questionForm.get('questions').value[index]?.settings?.singleChoice?.poll,
              ...(this.questionForm.get('questions').value[index].choices?.length < 3
                ? { toggle: this.questionForm.get('questions').value[index]?.settings?.singleChoice.toggle === true ? true : false }
                : { toggle: false }),
            },
          };
          break;

        case 'MULTIPLE_CHOICE':
          this.selectedSettings = {
            multipleChoice: this.questionForm.get('questions').value[index]?.settings?.multipleChoice,
          };
          break;
        case 'PARAGRAPH':
          this.selectedSettings = {
            paragraph: this.questionForm.get('questions').value[index].settings.paragraph,
          };
          break;
        case 'SHORT_ANSWER':
          this.selectedSettings = {
            shortAnswer: this.questionForm.get('questions').value[index].settings.shortAnswer,
          };
          break;
        case 'DATETIME':
          this.selectedSettings = {
            date: this.questionForm.get('questions').value[index].settings.date,
          };
          break;
        case 'NUMBER':
          this.selectedSettings = {
            number: this.questionForm.get('questions').value[index].settings.number,
          };
          break;
        case 'RATING':
          this.selectedSettings = {
            rating: this.questionForm.get('questions').value[index].settings.rating,
          };
          break;
        case 'SMILEY':
          this.selectedSettings = {
            smiley: {
              levels: map(this.questionForm.get('questions').value[index].settings?.smiley?.levels, (level) => {
                return {
                  rank: level?.rank,
                  ...(this.selectedTypes[index] === 'icon' ? { icon: level?.icon } : { picture: level?.picture }),
                };
              }),
            },
          };
          break;
      }
      let input: any = {
        ...FormHelper.getDifference(
          omit(this.questionInitialValues.questions[index], 'settings', 'choices', 'id', 'form'),
          omit(this.questionForm.get('questions').value[index], 'settings', 'choices', 'id', 'form'),
        ),
        settings: this.selectedSettings,
        ...(this.questionForm.get('questions').value[index].type === QuestionTypeEnum?.MULTIPLE_CHOICE ||
        this.questionForm.get('questions').value[index].type === QuestionTypeEnum?.SINGLE_CHOICE
          ? { choices: this.questionForm.get('questions').value[index]?.choices }
          : {}),
        order: this.questions?.length ? this.questions?.length + 1 : 1,
      };
      if (this.questionForm.get('questions').value[index]?.id) {
        this.campaignService
          .updateQuestion(this.questions[index]?.id, input)
          .pipe(
            catchError(() => {
              this.modalError();
              this.changeDetectorRef.markForCheck();
              return of(null);
            }),
          )
          .subscribe((res: any) => {
            if (res) {
              this.position();
              this.isQuestionButtonDisabled = true;
              this.changeDetectorRef.markForCheck();
            }
          });
      } else if (this.selectedFormId) {
        const args = {
          ...input,
          form: this.selectedFormId,
        };
        this.campaignService
          .createQuestion(args)
          .pipe(
            catchError(() => {
              this.modalError();
              this.changeDetectorRef.markForCheck();
              return of(null);
            }),
          )
          .subscribe((res: any) => {
            if (res) {
              this.position();
              this.isQuestionButtonDisabled = true;
              this.changeDetectorRef.markForCheck();
            }
          });
      } else {
        const formInput: any = {
          ...FormHelper.getDifference(this.initialFormValues, this.formQuestionForm.value),
        };
        this.campaignService
          .createForm(omit(formInput, 'id') as any)
          .pipe(
            catchError(() => {
              this.modalError();
              this.changeDetectorRef.markForCheck();
              return of(null);
            }),
            switchMap((res) => {
              if (res) {
                this.selectedFormId = res?.id;
                this.questDefinitionForm.get(['definition', 'form', 'form']).patchValue(res?.id);
                input = {
                  ...input,
                  form: this.selectedFormId,
                };
                return this.campaignService.createQuestion(input);
              }
              return of(null);
            }),
          )
          .subscribe((res) => {
            if (res) {
              this.position();
              this.isQuestionButtonDisabled = true;
            }
          });
      }
    }
  }

  addQuestion() {
    const question = this.formBuilder.group({
      title: [''],
      form: [
        this.currentIndex > -1 && this.questActivities[this.currentIndex]?.activity?.action?.definition?.form?.form
          ? this.questActivities[this.currentIndex]?.activity?.action?.definition?.form?.form?.id
          : '',
      ],
      description: [''],
      choices: this.formBuilder.array([
        this.formBuilder.group({
          item: [''],
          enable: [false],
        }),
      ]),
      type: [undefined],
      settings: this.formBuilder.group({
        shortAnswer: this.formBuilder.group({
          min: [''],
          max: [''],
        }),
        paragraph: this.formBuilder.group({
          min: [''],
          max: [''],
        }),
        singleChoice: this.formBuilder.group({
          toggle: [false],
          poll: [false],
        }),
        multipleChoice: this.formBuilder.group({
          poll: [false],
        }),
        rating: this.formBuilder.group({
          levels: [''],
        }),
        date: this.formBuilder.group({
          outdated: [false],
          interval: [false],
        }),
        number: this.formBuilder.group({
          minValue: [undefined],
          maxValue: [undefined],
        }),
        smiley: this.formBuilder.group({
          levels: this.formBuilder.array([]),
        }),
      }),
    });
    (this.questionForm.get('questions') as FormArray).push(question);
    this.selectedTypes.push('icon');
    this.questionInitialValues = this.questionForm.value;
    this.editMode.push(true);
    this.changeDetectorRef.markForCheck();
  }

  removeQuestion(index: number) {
    (this.questionForm.get('questions') as FormArray).removeAt(index);
    this.selectedTypes.splice(index, 1);
    this.editMode.splice(index, 1);
    this.questionInitialValues = this.questionForm.value;
    // this.editMode = Array(this.questionForm.get('questions').value?.length).fill(true);
  }

  onChangeUserLabel(checked: boolean, index: number) {
    if (checked) {
      this.params.at(index).get('value').patchValue(null);
    } else {
      this.params.at(index).get('user').patchValue(null);
    }
  }

  openSendApi(content) {
    this.userParams.clear();
    forEach(this.params.value, (param) => {
      if (param.user.enable === true) {
        this.userParams.push(
          this.formBuilder.group({
            key: [param.user?.label || ''],
            value: [''],
          }),
        );
      }
    });
    if (this.userParams.value.length) {
      this.modalService.open(content, { centered: true });
    } else {
      this.sendTest();
    }
  }

  sendTest() {
    const input: any = {
      ...(this.userParams.value?.length
        ? {
            params: map(this.userParams.value, (param) => {
              const pm = find(this.params.value, (item) => item.user?.label === param.key) as any;
              return {
                key: pm?.key,
                value: param.value,
              };
            }),
          }
        : {}),
      api: {
        ...omit(this.api.value, 'userParams'),
        params: map(this.params.value, (pm) => {
          return {
            ...pm,
            ...(pm.value ? { user: { label: null, enable: false } } : { value: null }),
          };
        }),
      },
    };
    this.campaignService
      .sendTestQuestApi(input.api, this.userParams.value.length ? input.params : null)
      .pipe(
        catchError(() => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
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

  smileySectionDropped(event: CdkDragDrop<any[]>, i: number): void {
    const formArray = (this.questionForm.get('questions') as FormArray).at(i).get(['settings', 'smiley', 'levels']) as FormArray;
    moveItemInArray(formArray.controls, event.previousIndex, event.currentIndex);
  }

  onChangeSmileyType(i) {
    const levelsControl = (this.questionForm.get('questions') as FormArray).at(i).get(['settings', 'smiley', 'levels']) as FormArray;
    while (levelsControl.length !== 0) {
      levelsControl.removeAt(0);
    }
  }

  removeSmiley(index: number, j: number) {
    ((this.questionForm.get('questions') as FormArray).at(index).get(['settings', 'smiley', 'levels']) as FormArray).removeAt(j);
  }

  addEmoji(event: any, index: number, j: number) {
    (this.questionForm.get('questions') as FormArray).at(index).get(['settings', 'smiley', 'levels']);
    const level = this.formBuilder.group({
      rank: [
        (((this.questionForm.get('questions') as FormArray).at(index).get(['settings', 'smiley', 'levels']) as FormArray).value?.length || 0) + 1,
      ],
      icon: [event?.emoji?.native],
      picture: [''],
    });
    ((this.questionForm.get('questions') as FormArray).at(index).get(['settings', 'smiley', 'levels']) as FormArray).push(level);
    this.showEmojiPicker = false;
    this.changeDetectorRef.markForCheck();
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  upload(field?: string, i?: number): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.name = 'fileUpload';
    fileInput.id = 'fileUpload';
    fileInput.onchange = async () => {
      const file = fileInput.files[0];
      if (file?.size > 524288) {
        this.translate.get('MENUITEMS.TS.SIZE_WARNING_500').subscribe((sthWentWrong: string) => {
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
      const img = new Image();
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result as string;
      };
      img.onload = async () => {
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
            if (field === 'smiley') {
              const level = this.formBuilder.group({
                rank: [
                  (((this.questionForm.get('questions') as FormArray).at(i).get(['settings', 'smiley', 'levels']) as FormArray).value?.length || 0) +
                    1,
                ],
                icon: [''],
                picture: this.formBuilder.group({
                  path: picture.path,
                  baseUrl: picture.baseUrl,
                }),
              });
              ((this.questionForm.get('questions') as FormArray).at(i).get(['settings', 'smiley', 'levels']) as FormArray).push(level);
            } else if (field === 'quizz') {
              this.questDefinitionForm.get(['definition', 'game', 'quizz', 'picture']).patchValue({
                path: picture.path,
                baseUrl: picture.baseUrl,
              });
            } else if (field === 'jigsaw') {
              this.questDefinitionForm.get(['definition', 'game', 'jigsaw', 'picture']).patchValue({
                path: picture.path,
                baseUrl: picture.baseUrl,
              });
            } else if (field === 'sliding') {
              this.questDefinitionForm.get(['definition', 'game', 'sliding', 'picture']).patchValue({
                path: picture.path,
                baseUrl: picture.baseUrl,
              });
            } else if (field === 'memory') {
              if (img.width === img.height) {
                (this.questDefinitionForm.get(['definition', 'game', 'memory', 'pictures']) as FormArray).push(
                  this.formBuilder.group({
                    path: picture.path,
                    baseUrl: picture.baseUrl,
                  }),
                );
              } else {
                this.translate.get('MENUITEMS.TS.SQUARE_IMAGE').subscribe((text: string) => {
                  Swal.fire({
                    title: 'Oops...',
                    text: text,
                    icon: 'error',
                    showCancelButton: false,
                    confirmButtonColor: 'rgb(3, 142, 220)',
                    cancelButtonColor: 'rgb(243, 78, 78)',
                  });
                });
              }
            } else {
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
              if (this.currentIndex > -1) {
                this.updateQuestActivity({ media: input });
              }
            }
            this.changeDetectorRef.markForCheck();
          });
      };
      reader.readAsDataURL(file);
    };
    fileInput.click();
  }

  removePicture(field?: string, i?: number, j?: number) {
    if (field === 'smiley') {
      ((this.questionForm.get('questions') as FormArray).at(i).get(['settings', 'smiley', 'levels']) as FormArray).removeAt(j);
    } else if (field === 'quizz') {
      this.questDefinitionForm.get(['definition', 'game', 'quizz', 'picture']).patchValue({
        baseUrl: '',
        path: '',
      });
    } else if (field === 'jigsaw') {
      this.questDefinitionForm.get(['definition', 'game', 'jigsaw', 'picture']).patchValue({
        baseUrl: '',
        path: '',
      });
    } else if (field === 'sliding') {
      this.questDefinitionForm.get(['definition', 'game', 'sliding', 'picture']).patchValue({
        baseUrl: '',
        path: '',
      });
    } else if (field === 'memory') {
      (this.questDefinitionForm.get(['definition', 'game', 'memory', 'pictures']) as FormArray).removeAt(i);
    } else {
      const fileName = this.pictures.at(0).value.path;
      this.deleteFileFromAwsGQL.fetch({ fileName }).subscribe(({ data }) => {
        if (data.deleteFileFromAws.success) {
          this.pictures.at(0).patchValue({
            path: null,
            baseUrl: null,
            width: 0,
            height: 0,
          });
          if (this.currentIndex > -1) {
            this.updateQuestActivity({ media: { pictures: [{ baseUrl: '', path: '' }] } });
          }
          this.changeDetectorRef.markForCheck();
        }
      });
    }
  }

  deleteQuestion() {
    this.campaignService
      .deleteQuestion(this.questions[this.selectedQuestionIndex]?.id)
      .pipe(
        catchError(() => {
          this.modalError();
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

  newParam(): void {
    const param = this.formBuilder.group({
      key: [''],
      value: [''],
      user: this.formBuilder.group({
        label: [''],
        enable: [false],
      }),
    });
    this.params.push(param);
  }

  newHeaderParam(): void {
    const param = this.formBuilder.group({
      key: [''],
      value: [''],
    });
    (this.questDefinitionForm.get(['definition', 'api', 'headers']) as FormArray).push(param);
  }

  deleteSection(i?: number): void {
    (this.questDefinitionForm.get(['definition', 'api', 'params']) as FormArray).removeAt(i);
  }

  deleteHeaderSection(i?: number): void {
    (this.questDefinitionForm.get(['definition', 'api', 'headers']) as FormArray).removeAt(i);
  }

  deleteQuestActivity() {
    this.campaignService
      .deleteQuestActivity(this.selectedQuestActivity?.id)
      .pipe(
        catchError(() => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
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

  openDeleteModal(content: any, item: any, field?: string) {
    if (field === 'question') {
      this.selectedQuestionIndex = item;
    } else {
      this.selectedQuestionIndex = -1;
      this.selectedQuestActivity = item;
    }
    this.modalService.open(content, { centered: true });
  }

  addChoice(index?: number, gameControls?: FormArray) {
    if (gameControls) {
      gameControls.push(
        this.formBuilder.group({
          item: [''],
          correct: [false],
        }),
      );
    } else {
      const choices = this.formBuilder.group({
        item: [''],
        enable: [false],
      });
      ((this.questionForm.get('questions') as FormArray).at(index).get('choices') as FormArray).push(choices);
    }
    this.changeDetectorRef.markForCheck();
  }

  removeChoice(index: number, j?: number, gameControls?: FormArray) {
    if (gameControls) {
      gameControls.removeAt(index);
    } else {
      ((this.questionForm.get('questions') as FormArray).at(index).get('choices') as FormArray).removeAt(j);
    }
  }

  sectionDropped(event: CdkDragDrop<any[]>): void {
    this.isReadyToDrag = false;
    const item = this.questActivities[event.previousIndex];
    let rank = event.currentIndex === 0 ? 1 : this.questActivities[event.currentIndex].rank;
    this.currentIndex = event.currentIndex;
    if (
      (rank === 1 && !this.questActivities[event.previousIndex]?.activity?.action?.activityType?.title) ||
      (event.previousIndex === 0 &&
        this.questActivities[event.previousIndex]?.activity?.action?.activityType?.title &&
        !this.questActivities[1]?.activity?.action?.activityType?.title)
    ) {
      this.translate.get('MENUITEMS.TS.FIRST_ELMENT_ACTION').subscribe((firstElementAction: string) => {
        Swal.fire({
          title: 'Oops...',
          text: firstElementAction,
          icon: 'error',
          showCancelButton: false,
          confirmButtonColor: 'rgb(3, 142, 220)',
          cancelButtonColor: 'rgb(243, 78, 78)',
        });
      });
      return;
    }
    moveItemInArray(this.questActivities, event.previousIndex, event.currentIndex);
    if (event.previousIndex !== event.currentIndex) {
      this.campaignService
        .reorderQuestActivity(item.id, rank)
        .pipe(
          catchError(() => {
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
          }),
          switchMap(() => {
            return this.campaignService.getQuestActivitiesByQuestPaginated(this.questId);
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.position();
            this.isReadyToDrag = true;
            this.changeDetectorRef.markForCheck();
          }
        });
    }
  }

  updateQuestActivity(input: any) {
    input = { ...input, quest: this.questActivityForm.get('quest').value };
    this.campaignService
      .updateQuestActivity(this.questActivities[this.currentIndex].id, input)
      .pipe(
        catchError(() => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res: any) => {
        if (res) {
          this.position();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  addStep() {
    this.currentStep$.next(null);
    this.currentIndex = -1;
    this.campaignService.questions$ = null;
    this.questions = null;
    this.selectedFormId = null;
    this.campaignService.infiniteQuestions$ = null;
    this.campaignService.questionsPageIndex = 0;
    this.changeDetectorRef.markForCheck();
  }

  chooseStep(index: number) {
    this.currentStep$.next(index + 1);
    this.currentIndex = index;
    this.campaignService.getQuestActivityById(this.questActivities[this.currentIndex].id).subscribe();
  }

  nextStep() {
    const nextStep = this.currentStep$.value + 1;
    if (nextStep > this.formsCount) {
      return;
    }
    this.currentStep$.next(nextStep);
  }

  prevStep() {
    const prevStep = this.currentStep$.value - 1;
    if (prevStep === 0) {
      return;
    }
    this.currentStep$.next(prevStep);
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
    this.activityTypes$ = null;
    this.campaignService.questionsPageIndex = 0;
    this.campaignService.infiniteQuestions$ = null;
    this.campaignService.infiniteDefinitions$ = null;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
