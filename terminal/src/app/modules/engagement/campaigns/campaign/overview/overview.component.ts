import { isEqual, values, map, uniq, filter, forEach, sumBy, truncate } from 'lodash';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { circle, latLng, tileLayer } from 'leaflet';
import { TranslateService } from '@ngx-translate/core';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, combineLatest, takeUntil, map as rxMap, forkJoin, take, BehaviorSubject } from 'rxjs';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { LoyaltySettingsType, QuestActionType, QuestActivityType, QuestCategoryEnum, QuestStatusEnum } from '@sifca-monorepo/terminal-generator';
import { QuestOverviewType, QuestStatisticsType, QuestWithProgressType } from '@sifca-monorepo/terminal-generator';

import { candidate } from './data';
import { JobService } from './job.service';
import { CampaignsService } from '../campaigns.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { IPagination } from '@diktup/frontend/models';
import format from 'date-fns/format';
import { AnswerDtoType, QuestionDtoType, QuestionSimpleType, SummaryResponseDtoType } from '@sifca-monorepo/terminal-generator';
import { LoyaltyService } from '../../../../system/apps/apps/loyalty/loyalty.service';

@Component({
  selector: 'sifca-monorepo-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  providers: [JobService, DecimalPipe],
})
export class OverviewComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  private formId: BehaviorSubject<string> = new BehaviorSubject('');

  page = 0;
  questId: string;
  stepsChart: any;
  num: number = 0;
  budgetChart: any;
  repliesChart: any;
  actionsChart: any;
  compaignId: string;
  initialValues: any;
  audienceChart: any;
  followbtn: any = 1;
  consumedChart: any;
  responseChart: any;
  recomendedjobs: any;
  questForm: FormGroup;
  questStateChart: any;
  candidatedetail: any;
  pageChanged: boolean;
  candidatelist!: any[];
  formResponsesPage = 0;
  totalResponses: number;
  isButtonDisabled = true;
  asicRadialbarChart: any;
  followtxt: any = 'Follow';
  total: Observable<number>;
  selectedField = 'summary';
  jobList!: Observable<any[]>;
  quest: QuestWithProgressType;
  filter = new FormControl('');
  questions: QuestionDtoType[];
  activities: QuestActivityType[];
  status = values(QuestStatusEnum);
  questOverview: QuestOverviewType;
  formResponsesPageChanged: boolean;
  questionResponses: AnswerDtoType[];
  formResponses: QuestionSimpleType[];
  questActionsPagination: IPagination;
  questStatistics: QuestStatisticsType;
  formResponsesPagination: IPagination;
  formSummary: SummaryResponseDtoType[];
  categories = values(QuestCategoryEnum);
  questActivitiesPagination: IPagination;
  selectedQuestActivity: QuestActivityType;
  summaryBarChart: Map<number, any> = new Map<number, any>();
  summaryDonutChart: Map<number, any> = new Map<number, any>();
  loadingQuestions$: Observable<boolean> = this.campaignService.loadingQuestions$;
  questActions$: Observable<QuestActionType[]> = this.campaignService.questActions$;
  laodingFormSummary$: Observable<boolean> = this.campaignService.laodingFormSummary$;
  isLastResponses$: Observable<boolean> = this.campaignService.isLastQuestionResponses$;
  loadingFormResponses$: Observable<boolean> = this.campaignService.loadingFormResponses$;
  loadingQuestOverview$: Observable<boolean> = this.campaignService.loadingQuestOverview$;
  loyaltySettings$: Observable<LoyaltySettingsType> = this.loyaltyService.loyaltySettings$;
  infiniteQuestions$: Observable<QuestionDtoType[]> = this.campaignService.infiniteQuestions$;
  loadingQuestStatistics$: Observable<boolean> = this.campaignService.loadingQuestStatistics$;
  loadingActivitiesByQuest$: Observable<boolean> = this.campaignService.loadingActivitiesByQuest$;
  loadingQuestionResponses$: Observable<boolean> = this.campaignService.loadingQuestionResponses$;
  loadingQuestActionsByQuest$: Observable<boolean> = this.campaignService.loadingQuestActionsByQuest$;
  questActivitesByQuest$: Observable<QuestActivityType[]> = this.campaignService.questActivitesByQuest$;

  option = {
    startVal: this.num,
    useEasing: true,
    duration: 2,
    decimalPlaces: 2,
  };
  questActionsPageChanged: boolean;
  questActionsPage = 0;
  selectedQuestion: QuestionDtoType;

  get pictures(): FormArray {
    return (this.questForm?.get('media') as FormGroup)?.get('pictures') as FormArray;
  }

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    public router: Router,
    public service: JobService,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private sharedService: SharedService,
    private activatedRoute: ActivatedRoute,
    private loyaltyService: LoyaltyService,
    private campaignService: CampaignsService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.activities = [];
    this.campaignService.infiniteQuestActivities$ = null;
    this.campaignService.questActivityPageIndex = 0;
    this.jobList = service.countries$;
    this.total = service.total$;
  }

  ngOnInit() {
    this.compaignId = this.activatedRoute.snapshot.paramMap.get('id');
    this.formId.subscribe(() => {
      if (this.formId && this.selectedField === 'questions') {
        this.campaignService.questionsPageIndex = 0;
        this.campaignService.infiniteQuestions$ = null;
        this.campaignService.responsesPageIndex = 0;
        this.campaignService.questionResponses$ = null;
      } else if (this.formId.value && this.selectedField === 'individual') {
        this.campaignService.formResponsesPage = 0;
        this.campaignService.getFormResponses(this.formId.value).subscribe();
      } else if (this.formId.value && this.selectedField === 'summary') {
        this.campaignService.getFormSummary(this.formId.value).subscribe();
      }
    });
    this.campaignService.quest$.pipe(takeUntil(this.unsubscribeAll)).subscribe((quest) => {
      if (quest) {
        combineLatest([
          this.loyaltyService.findLoyaltySettingsByTarget(),
          this.campaignService.getQuestOverview(quest.id),
          this.campaignService.getQuestActivitiesByQuest(quest.id),
          this.campaignService.getQuestStatistics(quest.id),
          this.campaignService.getQuestActionsByQuestPaginated(quest.id),
        ]).subscribe();
        this.quest = quest;
        this.questId = quest?.id;
        this.questForm = this.formBuilder.group({
          title: [quest?.title || ''],
          audience: [quest?.audience?.id || ''],
          description: [quest?.description || ''],
          media: this.formBuilder.group({
            pictures: this.formBuilder.array([
              this.formBuilder.group({
                baseUrl: [quest?.media?.pictures?.length ? quest?.media?.pictures[0]?.baseUrl : ''],
                path: [quest?.media?.pictures?.length ? quest?.media?.pictures[0]?.path : ''],
              }),
            ]),
          }),
          status: [quest?.status || QuestStatusEnum.ONGOING],
          category: [quest?.category || QuestCategoryEnum.FAMILY],
          sponsored: [quest?.sponsored === false ? false : true],
          leaderboard: [quest?.leaderboard === false ? false : true],
        });
        this.initialValues = this.questForm.value;
        this.questForm.valueChanges.subscribe((values) => {
          this.isButtonDisabled = isEqual(this.initialValues, values);
        });
        this.changeDetectorRef.markForCheck();
      }
    });
    this.campaignService.infiniteQuestions$
      .pipe(
        takeUntil(this.unsubscribeAll),
        rxMap((questions) => {
          if (questions?.length) {
            this.campaignService.getQuestionResponses(questions[0].id).subscribe();
            this.selectedQuestion = questions[0];
            this.questions = questions;
          }
        }),
      )
      .subscribe();
    combineLatest([this.campaignService.formResponses$, this.campaignService.formResponsesPagination$])
      .pipe(
        rxMap(([responses, pagination]) => {
          if (responses?.length) {
            this.formResponses = responses;
          }
          if (pagination) {
            this.formResponsesPagination = {
              length: pagination?.length,
              page: this.campaignService.formResponsesPage || 0,
              size: pagination.size,
              lastPage: pagination?.length - 1,
              startIndex: (this.campaignService.formResponsesPage || 0) * this.campaignService.pageLimit,
              endIndex: Math.min(((this.campaignService.formResponsesPage || 0) + 1) * this.campaignService.pageLimit - 1, pagination.length - 1),
            };
          }
          this.changeDetectorRef.markForCheck();
        }),
      )
      .subscribe();

    this.campaignService.infiniteQuestActivities$
      .pipe(
        takeUntil(this.unsubscribeAll),
        rxMap((activities) => {
          this.activities = filter(activities, (act: QuestActivityType) => act.activity?.action?.activityType?.code === 'QUESTION');
          if (this.activities?.length) {
            this.selectedQuestActivity = this.activities[0];
            this.formId.next(this.selectedQuestActivity?.activity?.action?.definition?.form?.form?.id);
            return this.campaignService.getFormSummary(this.formId.value).subscribe();
          }
        }),
      )
      .subscribe();

    this.campaignService.questionResponses$
      .pipe(
        takeUntil(this.unsubscribeAll),
        rxMap((responses) => {
          this.questionResponses = responses;
        }),
      )
      .subscribe();
    this.campaignService.formSummary$
      .pipe(
        takeUntil(this.unsubscribeAll),
        rxMap((formSummary) => {
          this.formSummary = formSummary;
          this.totalResponses = sumBy(formSummary, (question) => question?.responses?.length);
          const colorsArray = '["--vz-primary", "--vz-warning", "--vz-success", "--vz-danger", "--vz-secondary"]';
          const colors = this.getChartColorsArray(colorsArray);
          forEach(formSummary, (question, index) => {
            if (question?.responses?.length >= 9) {
              this.summaryBarChart.set(index, {
                series: map(question?.responses, (response) => {
                  return {
                    name:
                      response?.answer?.smiley?.icon ||
                      response?.answer?.smiley?.picture ||
                      (response?.answer?.date?.from && response?.answer?.date?.to
                        ? `${this.datePipe.transform(response?.answer?.date?.from, 'yyyy-MM-dd')} / ${this.datePipe.transform(
                            response?.answer?.date?.to,
                            'yyyy-MM-dd',
                          )}`
                        : '') ||
                      (response?.answer?.paragraph?.length > 40 && response.answer.paragraph.slice(0, 40) + '...') ||
                      response?.answer?.rating ||
                      (response?.answer?.shortAnswer?.length > 40 && response.answer.shortAnswer.slice(0, 40) + '...') ||
                      response?.answer?.number ||
                      response.answer.singleChoice ||
                      map(response?.answer?.multipleChoices, (choice) =>
                        choice.length > 20 ? truncate(choice, { length: 20, omission: `${choice}...` }) : choice,
                      ),
                    data: [response?.count],
                  };
                }),
                chart: {
                  type: 'bar',
                  height: 350,
                  toolbar: {
                    show: false,
                  },
                },
                plotOptions: {
                  bar: {
                    horizontal: false,
                    columnWidth: '65%',
                  },
                },
                stroke: {
                  show: true,
                  width: 5,
                  colors: ['transparent'],
                },
                xaxis: {
                  categories: [''],
                  axisTicks: {
                    show: false,
                    borderType: 'solid',
                    color: '#78909C',
                    height: 6,
                    offsetX: 0,
                    offsetY: 0,
                  },
                  title: {
                    text: `${question?.title} (${question?.responses?.length} ${question?.responses?.length <= 1 ? 'response' : 'responses'})`,
                    offsetX: 0,
                    offsetY: -30,
                    style: {
                      color: '#78909C',
                      fontSize: '12px',
                      fontWeight: 400,
                    },
                  },
                },
                yaxis: {
                  labels: {
                    formatter: function (value: any) {
                      return value;
                    },
                  },
                  tickAmount: 4,
                  min: 0,
                },
                fill: {
                  opacity: 1,
                },
                legend: {
                  show: true,
                  position: 'bottom',
                  horizontalAlign: 'center',
                  fontWeight: 500,
                  offsetX: 0,
                  offsetY: -14,
                  itemMargin: {
                    horizontal: 8,
                    vertical: 0,
                  },
                  markers: {
                    width: 10,
                    height: 10,
                  },
                },
                colors: colors,
              });
            } else {
              this.summaryDonutChart.set(index, {
                series: map(question?.responses, 'count'),
                labels: map(question?.responses, (response) => {
                  return (
                    response?.answer?.smiley?.icon ||
                    response?.answer?.smiley?.picture ||
                    (response?.answer?.date?.from && response?.answer?.date?.to
                      ? `${this.datePipe.transform(response?.answer?.date?.from, 'yyyy-MM-dd')} / ${this.datePipe.transform(
                          response?.answer?.date?.to,
                          'yyyy-MM-dd',
                        )}`
                      : '') ||
                    (response?.answer?.paragraph?.length > 40 && response.answer.paragraph.slice(0, 40) + '...') ||
                    response?.answer?.rating ||
                    (response?.answer?.shortAnswer?.length > 40 && response.answer.shortAnswer.slice(0, 40) + '...') ||
                    response?.answer?.number ||
                    response.answer.singleChoice ||
                    map(response?.answer?.multipleChoices, (choice) =>
                      choice.length > 10 ? truncate(choice, { length: 10, omission: `${choice}...` }) : choice,
                    )
                  );
                }),
                chart: {
                  height: 333,
                  type: 'donut',
                },
                legend: {
                  position: 'bottom',
                },
                stroke: {
                  show: false,
                },
                dataLabels: {
                  dropShadow: {
                    enabled: false,
                  },
                },
                colors: colors,
              });
            }
          });
          this.changeDetectorRef.markForCheck();
        }),
      )
      .subscribe();
    this.campaignService.questStatistics$.pipe(takeUntil(this.unsubscribeAll)).subscribe((questStatistics) => {
      if (questStatistics) {
        this.questStatistics = questStatistics;
        this.statisticChart(questStatistics, '["--vz-success", "--vz-primary", "--vz-warning"]');
      }
    });
    this.campaignService.questOverview$.pipe(takeUntil(this.unsubscribeAll)).subscribe((questOverview) => {
      if (questOverview) {
        this.questOverview = questOverview;
        this.audienceChart = this.generateChart(+questOverview?.totalAudience?.percentage <= 100 ? +questOverview?.totalAudience?.percentage : 100, '["--vz-success"]');
        this.repliesChart = this.generateChart(+questOverview?.totalReplies?.percentage <= 100 ? +questOverview?.totalReplies?.percentage : 100, '["--vz-warning"]');
        this.budgetChart = this.generateChart(+questOverview?.totalBudget?.percentage <= 100 ? +questOverview?.totalBudget?.percentage : 100, '["--vz-success"]');
        this.consumedChart = this.generateChart(+questOverview?.consumedBudget?.percentage <= 100 ? +questOverview?.consumedBudget?.percentage : 100, '["--vz-danger"]');
        this.stepsChart = this.generateChart(+questOverview?.totalSteps?.percentage <= 100 ? +questOverview?.totalSteps?.percentage : 100, '["--vz-info"]');
        this.actionsChart = this.generateChart(+questOverview?.totalActions?.percentage <= 100 ? +questOverview?.totalActions?.percentage : 100, '["--vz-info"]');
      }
    });
    this.campaignService.questActivitiesPagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.questActivitiesPagination = {
        length: pagination?.length,
        page: this.campaignService.questActivitesPageIndex || 0,
        size: this.campaignService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.campaignService.questActivitesPageIndex || 0) * this.campaignService?.pageLimit,
        endIndex: Math.min(((this.campaignService?.questActivitesPageIndex || 0) + 1) * this.campaignService?.pageLimit - 1, pagination?.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
    this.campaignService.questActionsPagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.questActionsPagination = {
        length: pagination?.length,
        page: this.campaignService.questActionsPage || 0,
        size: this.campaignService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.campaignService.questActionsPage || 0) * this.campaignService?.pageLimit,
        endIndex: Math.min(((this.campaignService?.questActionsPage || 0) + 1) * this.campaignService?.pageLimit - 1, pagination?.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
    this.candidatelist = candidate;
    this.jobList.subscribe((x) => {
      this.recomendedjobs = Object.assign([], x);
    });
  }

  ngAfterViewInit() {
    this.campaignService.getQuestActivitiesByQuestPaginated(this.quest?.id).subscribe();
  }

  onChangeSummary(field: string) {
    this.selectedField = field;
    if (this.formId && field === 'questions') {
      this.campaignService?.getQuestionsByForm(this.formId.value).subscribe();
    } else if (this.formId && field === 'individual') {
      this.campaignService.getFormResponses(this.formId.value).subscribe();
    } else if (this.formId && field === 'summary') {
      this.campaignService.getFormSummary(this.formId.value).subscribe();
    }
  }

  onChangeForm(form: QuestActivityType) {
    this.formId.next(form?.activity?.action?.definition?.form?.form?.id);
    this.campaignService.getFormSummary(this.formId.value).subscribe();
  }

  onChangeQuestion(question: QuestionDtoType) {
    this.campaignService.responsesPageIndex = 0;
    this.campaignService.questionResponses$ = null;
    this.selectedQuestion = question;
    this.campaignService.getQuestionResponses(this.selectedQuestion?.id).subscribe();
  }

  loadMoreResponses() {
    this.campaignService.responsesPageIndex++;
    this.campaignService.getQuestionResponses(this.selectedQuestion?.id).subscribe();
  }

  loadMoreQuestions() {
    this.campaignService.isLastQuestions$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.campaignService.questionsPageIndex++;
        this.campaignService.getQuestionsByForm(this.formId.value, false).subscribe();
      }
    });
  }

  loadMoreQuestActivities() {
    this.campaignService.isLastQuestActivities$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.campaignService.questActivityPageIndex++;
        this.campaignService.getQuestActivitiesByQuestPaginated(this.quest?.id).subscribe();
      }
    });
  }

  onCampaingRoute() {
    this.campaignService.activeTab$ = 2;
    this.router.navigate(['/engagement/campaigns/campaigns/', this.quest?.id, 'campaign']);
  }

  onAudienceRoute() {
    this.campaignService.activeTab$ = 3;
    this.router.navigate(['/engagement/campaigns/campaigns/', this.quest?.id, 'audience']);
  }

  onFormResponsesPageChange(page: number) {
    this.formResponsesPage = page;
    if (page > 1) {
      this.formResponsesPageChanged = true;
    }
    this.campaignService.formResponsesPage = page - 1;
    if (this.formResponsesPageChanged) {
      this.campaignService.getFormResponses(this.formId.value).subscribe();
    }
  }

  onPageChange(page: number) {
    this.page = page;
    if (this.page > 1) {
      this.pageChanged = true;
    }
    this.campaignService.questActivitesPageIndex = page - 1;
    if (this.pageChanged) {
      this.campaignService.getQuestActivitiesByQuest(this.quest?.id).subscribe();
    }
  }

  onQuestActionsPageChange(page: number) {
    this.questActionsPage = page;
    if (page > 1) {
      this.questActionsPageChanged = true;
    }
    this.campaignService.questActivitesPageIndex = page - 1;
    if (this.questActionsPageChanged) {
      this.campaignService.getQuestActionsByQuestPaginated(this.quest?.id).subscribe();
    }
  }

  getValue(value: number): string {
    return Number.isFinite(value) ? value.toFixed(3) : '0';
  }

  generateChart(series: number, colors: any) {
    colors = this.getChartColorsArray(colors);
    return {
      series: [series.toFixed(0)],
      chart: {
        type: 'radialBar',
        width: 105,
        sparkline: {
          enabled: true,
        },
      },
      dataLabels: {
        enabled: false,
      },
      plotOptions: {
        radialBar: {
          hollow: {
            margin: 0,
            size: '70%',
          },
          track: {
            margin: 1,
          },
          dataLabels: {
            show: true,
            name: {
              show: false,
            },
            value: {
              show: true,
              fontSize: '16px',
              fontWeight: 600,
              offsetY: 8,
            },
          },
        },
      },
      colors: colors,
    };
  }

  private getChartColorsArray(colors: any) {
    colors = JSON.parse(colors);
    return colors.map(function (value: any) {
      var newValue = value.replace(' ', '');
      if (newValue.indexOf(',') === -1) {
        var color = getComputedStyle(document.documentElement).getPropertyValue(newValue);
        if (color) {
          color = color.replace(' ', '');
          return color;
        } else return newValue;
      } else {
        var val = value.split(',');
        if (val.length == 2) {
          var rgbaColor = getComputedStyle(document.documentElement).getPropertyValue(val[0]);
          rgbaColor = 'rgba(' + rgbaColor + ',' + val[1] + ')';
          return rgbaColor;
        } else {
          return newValue;
        }
      }
    });
  }

  private statisticChart(chart: QuestStatisticsType, colors: any) {
    colors = this.getChartColorsArray(colors);
    forkJoin([this.translate.get('MENUITEMS.TS.REPLIES'), this.translate.get('MENUITEMS.TS.ORDERS'), this.translate.get('MENUITEMS.TS.ACTIONS')])
      .pipe(
        rxMap(([replies, budget, actions]: [string, string, string]) => {
          const categories = uniq([
            ...map(chart.chart.replies, (reply) => {
              return format(reply[0], 'dd LLL');
            }),
            ...map(chart.chart.budget, (budget) => {
              return format(budget[0], 'dd LLL');
            }),
            ...map(chart.chart.actions, (action) => {
              return format(action[0], 'dd LLL');
            }),
          ]);
          this.questStateChart = {
            chart: {
              height: 345,
              type: 'line',
              zoom: {
                enabled: false,
              },
              toolbar: {
                show: false,
              },
            },
            colors: colors,
            dataLabels: {
              enabled: false,
            },
            stroke: {
              width: [3, 4, 3],
              curve: 'straight',
              dashArray: [0, 8, 5],
            },
            series: [
              {
                name: replies,
                data: map(chart.chart.replies, '1'),
              },
              {
                name: budget,
                data: map(chart.chart.budget, '1'),
              },
              {
                name: actions,
                data: map(chart.chart.actions, '1'),
              },
            ],
            markers: {
              size: 0,
              hover: {
                sizeOffset: 6,
              },
            },
            xaxis: {
              categories,
            },
            grid: {
              borderColor: '#f1f1f1',
            },
          };
        }),
      )
      .subscribe();
  }

  options = {
    layers: [
      tileLayer(
        'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoidGhlbWVzYnJhbmQiLCJhIjoiY2xmbmc3bTV4MGw1ejNzbnJqOWpubzhnciJ9.DNkdZVKLnQ6I9NOz7EED-w',
        {
          id: 'mapbox/light-v9',
          tileSize: 512,
          zoomOffset: 0,
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        },
      ),
    ],
    zoom: 1.1,
    center: latLng(28, 1.5),
  };
  layers = [
    circle([41.9, 12.45], { color: '#435fe3', opacity: 0.5, weight: 10, fillColor: '#435fe3', fillOpacity: 1, radius: 400000 }),
    circle([12.05, -61.75], { color: '#435fe3', opacity: 0.5, weight: 10, fillColor: '#435fe3', fillOpacity: 1, radius: 400000 }),
    circle([1.3, 103.8], { color: '#435fe3', opacity: 0.5, weight: 10, fillColor: '#435fe3', fillOpacity: 1, radius: 400000 }),
  ];

  // Follow - unfollow
  follow(ev: any) {
    this.translate.get('MENUITEMS.TS.UNFOLLOW').subscribe((unfollow: string) => {
      this.translate.get('MENUITEMS.TS.FOLLOW').subscribe((follow: string) => {
        if (this.followbtn == '1') {
          this.followbtn = '2';
          this.followtxt = unfollow;
        } else {
          this.followbtn = '1';
          this.followtxt = follow;
        }
      });
    });
  }

  // open candidate detail
  opendetail(id: any) {
    this.candidatedetail = this.candidatelist[id];
  }

  ngOnDestroy() {
    this.activities = [];
    this.campaignService.infiniteQuestActivities$ = null;
    this.campaignService.questionResponses$ = null;
    this.campaignService.infiniteQuestions$ = null;
    this.campaignService.infiniteActivityTypes$ = null;
    this.campaignService.questActivityPageIndex = 0;
    this.campaignService.activityPageIndex = 0;
    this.campaignService.responsesPageIndex = 0;
    this.campaignService.questionsPageIndex = 0;
    this.campaignService.questActionsPage = 0;
    this.campaignService.questActivitesPageIndex = 0;
    this.campaignService.formResponsesPage = 0;
    this.campaignService.questPageIndex = 0;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
