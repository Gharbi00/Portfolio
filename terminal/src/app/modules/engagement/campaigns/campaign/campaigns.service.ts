import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map as rxMap, switchMap, take } from 'rxjs/operators';
import { filter, findIndex, map, sortBy, omit, keys } from 'lodash';

import {
  QuestGQL,
  QuestType,
  QuestInput,
  LanguageType,
  KeyValueInput,
  CreateFormGQL,
  UpdateFormGQL,
  AnswerDtoType,
  QuestionInput,
  ApiReturnType,
  CreateQuestGQL,
  UpdateQuestGQL,
  QuestBudgetType,
  QuestionDtoType,
  QuestActionType,
  CreateFormInput,
  UpdateFormInput,
  QuestActivityGQL,
  QuestUpdateInput,
  ActivityTypeType,
  FormResponseType,
  QuestOverviewType,
  CreateQuestionGQL,
  UpdateQuestionGQL,
  DeleteQuestionGQL,
  GetFormSummaryGQL,
  QuestActivityType,
  QuestActivityInput,
  QuestionSimpleType,
  QuestStatisticsType,
  AddBudgetToQuestGQL,
  SendTestQuestApiGQL,
  GetQuestOverviewGQL,
  GetFormResponsesGQL,
  GetCampaignsStatsGQL,
  QuestWithProgressType,
  GetQuestStatisticsGQL,
  GetQuestionsByFormGQL,
  DeleteResponseDtoType,
  CreateQuestActivityGQL,
  DeleteQuestActivityGQL,
  UpdateQuestActivityGQL,
  SummaryResponseDtoType,
  ReorderQuestActivityGQL,
  CalculateQuestBudgetGQL,
  GetQuestionResponsesGQL,
  ReorderQuestionOfFormGQL,
  GetQuestionsPaginationGQL,
  DeleteFormAndQuestionsGQL,
  QuestActionDefinitionType,
  QuestActionDefinitionInput,
  RemoveAudienceFromQuestGQL,
  FindlanguagesPaginationGQL,
  CampaignsStatsDashboardType,
  CreateQuestActionDefinitionGQL,
  UpdateQuestActionDefinitionGQL,
  GetQuestionResponsesPaginateType,
  FindNonPredefinedQuestsByTargetGQL,
  GetQuestActionsByQuestPaginatedGQL,
  GetQuestActivitiesByQuestPaginatedGQL,
  QuestActionDefinitionDefinitionApiInput,
  GetNonPredefinedActivityTypesPaginatedGQL,
} from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';
import { FetchPolicy } from '@apollo/client/core';

@Injectable({ providedIn: 'root' })
export class CampaignsService {
  private activeTab: BehaviorSubject<number> = new BehaviorSubject(null);
  private isLastQuest: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingStats: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingQuests: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private isLoadingQuest: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private languages: BehaviorSubject<LanguageType[]> = new BehaviorSubject(null);
  private isLastDefinition: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingQuestions: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private question: BehaviorSubject<QuestionDtoType> = new BehaviorSubject(null);
  private isLastActivityType: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private laodingFormSummary: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private quest: BehaviorSubject<QuestWithProgressType> = new BehaviorSubject(null);
  private questions: BehaviorSubject<QuestionDtoType[]> = new BehaviorSubject(null);
  private isLastFormResponses: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingQuestOverview: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingFormResponses: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private isLastQuestActivities: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private questActions: BehaviorSubject<QuestActionType[]> = new BehaviorSubject(null);
  private quests: BehaviorSubject<QuestWithProgressType[]> = new BehaviorSubject(null);
  private activityPagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private loadingQuestStatistics: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private questOverview: BehaviorSubject<QuestOverviewType> = new BehaviorSubject(null);
  private questActivity: BehaviorSubject<QuestActivityType> = new BehaviorSubject(null);
  private isLastQuestionResponses: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private isLoadingQuestActivities: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingQuestionResponses: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private isLastQuestions: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private activityTypes: BehaviorSubject<ActivityTypeType[]> = new BehaviorSubject(null);
  private loadingActivitiesByQuest: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private questionResponses: BehaviorSubject<AnswerDtoType[]> = new BehaviorSubject(null);
  private questActionsPagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private loadingQuestActionsByQuest: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private formResponses: BehaviorSubject<QuestionSimpleType[]> = new BehaviorSubject(null);
  private formResponsesPagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private infiniteQuestions: BehaviorSubject<QuestionDtoType[]> = new BehaviorSubject(null);
  private questActivities: BehaviorSubject<QuestActivityType[]> = new BehaviorSubject(null);
  private questStatistics: BehaviorSubject<QuestStatisticsType> = new BehaviorSubject(null);
  private quesDefinitionPagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private formSummary: BehaviorSubject<SummaryResponseDtoType[]> = new BehaviorSubject(null);
  private questActivitiesPagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private infiniteQuests: BehaviorSubject<QuestWithProgressType[]> = new BehaviorSubject(null);
  private infiniteActivityTypes: BehaviorSubject<ActivityTypeType[]> = new BehaviorSubject(null);
  private questActivitesByQuest: BehaviorSubject<QuestActivityType[]> = new BehaviorSubject(null);
  private campaignsStats: BehaviorSubject<CampaignsStatsDashboardType> = new BehaviorSubject(null);
  private infiniteQuestActivities: BehaviorSubject<QuestActivityType[]> = new BehaviorSubject(null);
  private infiniteDefinitions: BehaviorSubject<QuestActionDefinitionType[]> = new BehaviorSubject(null);

  pageLimit = 10;
  searchString = '';
  questPageIndex = 0;
  questActionsPage = 0;
  activityPageIndex = 0;
  formResponsesPage = 0;
  activityPageLimit = 10;
  questionsPageIndex = 0;
  responsesPageIndex = 0;
  questionsPageLimit = 7;
  pageDefinitionIndex = 0;
  pageDefinitionLimit = 10;
  questActivityPageIndex = 0;
  questionsSearchString = '';
  questActivitesPageIndex = 0;
  questActivitiesPageLimit = 5;
  questActivitiesSearchString = '';

  get loadingQuestions$(): Observable<boolean> {
    return this.loadingQuestions.asObservable();
  }

  get loadingQuestionResponses$(): Observable<boolean> {
    return this.loadingQuestionResponses.asObservable();
  }

  get loadingQuestActionsByQuest$(): Observable<boolean> {
    return this.loadingQuestActionsByQuest.asObservable();
  }

  get laodingFormSummary$(): Observable<boolean> {
    return this.laodingFormSummary.asObservable();
  }

  get loadingFormResponses$(): Observable<boolean> {
    return this.loadingFormResponses.asObservable();
  }

  get question$(): Observable<QuestionDtoType> {
    return this.question.asObservable();
  }

  get questionResponses$(): Observable<AnswerDtoType[]> {
    return this.questionResponses.asObservable();
  }
  set questionResponses$(value: any) {
    this.questionResponses.next(value);
  }

  get formResponses$(): Observable<QuestionSimpleType[]> {
    return this.formResponses.asObservable();
  }

  get formSummary$(): Observable<SummaryResponseDtoType[]> {
    return this.formSummary.asObservable();
  }

  get isLastFormResponses$(): Observable<boolean> {
    return this.isLastFormResponses.asObservable();
  }

  get questActivitiesPagination$(): Observable<IPagination> {
    return this.questActivitiesPagination.asObservable();
  }

  get isLastQuestionResponses$(): Observable<boolean> {
    return this.isLastQuestionResponses.asObservable();
  }

  get loadingQuestStatistics$(): Observable<boolean> {
    return this.loadingQuestStatistics.asObservable();
  }

  get questActivitesByQuest$(): Observable<QuestActivityType[]> {
    return this.questActivitesByQuest.asObservable();
  }

  get loadingQuestOverview$(): Observable<boolean> {
    return this.loadingQuestOverview.asObservable();
  }

  get loadingActivitiesByQuest$(): Observable<boolean> {
    return this.loadingActivitiesByQuest.asObservable();
  }

  get questActions$(): Observable<QuestActionType[]> {
    return this.questActions.asObservable();
  }

  get questStatistics$(): Observable<QuestStatisticsType> {
    return this.questStatistics.asObservable();
  }

  get questOverview$(): Observable<QuestOverviewType> {
    return this.questOverview.asObservable();
  }

  get isLastQuestions$(): Observable<boolean> {
    return this.isLastQuestions.asObservable();
  }

  get campaignsStats$(): Observable<CampaignsStatsDashboardType> {
    return this.campaignsStats.asObservable();
  }

  get questActionsPagination$(): Observable<IPagination> {
    return this.questActionsPagination.asObservable();
  }

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  get loadingStats$(): Observable<boolean> {
    return this.loadingStats.asObservable();
  }

  get isLoadingQuest$(): Observable<boolean> {
    return this.isLoadingQuest.asObservable();
  }
  get isLoadingQuestActivities$(): Observable<boolean> {
    return this.isLoadingQuestActivities.asObservable();
  }
  set isLoadingQuestActivities$(value: any) {
    this.isLoadingQuestActivities.next(value);
  }

  get isLastQuest$(): Observable<boolean> {
    return this.isLastQuest.asObservable();
  }

  get isLastQuestActivities$(): Observable<boolean> {
    return this.isLastQuestActivities.asObservable();
  }
  set isLastQuestActivities$(value: any) {
    this.isLastQuestActivities.next(value);
  }

  get infiniteQuestions$(): Observable<QuestionDtoType[]> {
    return this.infiniteQuestions.asObservable();
  }
  set infiniteQuestions$(value: any) {
    this.infiniteQuestions.next(value);
  }

  get activityPagination$(): Observable<IPagination> {
    return this.activityPagination.asObservable();
  }

  get formResponsesPagination$(): Observable<IPagination> {
    return this.formResponsesPagination.asObservable();
  }

  get quesDefinitionPagination$(): Observable<IPagination> {
    return this.quesDefinitionPagination.asObservable();
  }

  get quests$(): Observable<QuestWithProgressType[]> {
    return this.quests.asObservable();
  }
  set quests$(value: any) {
    this.quests.next(value);
  }

  get infiniteQuests$(): Observable<QuestWithProgressType[]> {
    return this.infiniteQuests.asObservable();
  }
  set infiniteQuests$(value: any) {
    this.infiniteQuests.next(value);
  }

  get quest$(): Observable<QuestWithProgressType> {
    return this.quest.asObservable();
  }
  set quest$(value: any) {
    this.quest.next(value);
  }

  get loadingQuests$(): Observable<boolean> {
    return this.loadingQuests.asObservable();
  }

  get isLastDefinition$(): Observable<boolean> {
    return this.isLastDefinition.asObservable();
  }

  get languages$(): Observable<LanguageType[]> {
    return this.languages.asObservable();
  }

  get questActivities$(): Observable<QuestActivityType[]> {
    return this.questActivities.asObservable();
  }
  set questActivities$(value: any) {
    this.questActivities.next(value);
  }

  get infiniteQuestActivities$(): Observable<QuestActivityType[]> {
    return this.infiniteQuestActivities.asObservable();
  }
  set infiniteQuestActivities$(value: any) {
    this.infiniteQuestActivities.next(value);
  }

  get infiniteDefinitions$(): Observable<QuestActionDefinitionType[]> {
    return this.infiniteDefinitions.asObservable();
  }
  set infiniteDefinitions$(value: any) {
    this.infiniteDefinitions.next(value);
  }

  get questActivity$(): Observable<QuestActivityType> {
    return this.questActivity.asObservable();
  }

  get isLastActivityType$(): Observable<boolean> {
    return this.isLastActivityType.asObservable();
  }

  get infiniteActivityTypes$(): Observable<ActivityTypeType[]> {
    return this.infiniteActivityTypes.asObservable();
  }
  get activityTypes$(): Observable<ActivityTypeType[]> {
    return this.activityTypes.asObservable();
  }
  set infiniteActivityTypes$(value: any) {
    this.infiniteActivityTypes.next(value);
  }

  get questions$(): Observable<QuestionDtoType[]> {
    return this.questions.asObservable();
  }
  set questions$(value: any) {
    this.questions.next(value);
  }

  get activeTab$(): Observable<number> {
    return this.activeTab.asObservable();
  }
  set activeTab$(tab: any) {
    this.activeTab.next(tab);
  }

  constructor(
    private questGQL: QuestGQL,
    private createFormGQL: CreateFormGQL,
    private updateFormGQL: UpdateFormGQL,
    private storageHelper: StorageHelper,
    private createQuestGQL: CreateQuestGQL,
    private updateQuestGQL: UpdateQuestGQL,
    private questActivityGQL: QuestActivityGQL,
    private createQuestionGQL: CreateQuestionGQL,
    private deleteQuestionGQL: DeleteQuestionGQL,
    private updateQuestionGQL: UpdateQuestionGQL,
    private getFormSummaryGQL: GetFormSummaryGQL,
    private sendTestQuestApiGQL: SendTestQuestApiGQL,
    private getFormResponsesGQL: GetFormResponsesGQL,
    private getQuestOverviewGQL: GetQuestOverviewGQL,
    private addBudgetToQuestGQL: AddBudgetToQuestGQL,
    private getCampaignsStatsGQL: GetCampaignsStatsGQL,
    private getQuestStatisticsGQL: GetQuestStatisticsGQL,
    private getQuestionsByFormGQL: GetQuestionsByFormGQL,
    private deleteQuestActivityGQL: DeleteQuestActivityGQL,
    private createQuestActivityGQL: CreateQuestActivityGQL,
    private updateQuestActivityGQL: UpdateQuestActivityGQL,
    private getQuestionResponsesGQL: GetQuestionResponsesGQL,
    private reorderQuestActivityGQL: ReorderQuestActivityGQL,
    private calculateQuestBudgetGQL: CalculateQuestBudgetGQL,
    private reorderQuestionOfFormGQL: ReorderQuestionOfFormGQL,
    private deleteFormAndQuestionsGQL: DeleteFormAndQuestionsGQL,
    private getQuestionsPaginationGQL: GetQuestionsPaginationGQL,
    private removeAudienceFromQuestGQL: RemoveAudienceFromQuestGQL,
    private findlanguagesPaginationGQL: FindlanguagesPaginationGQL,
    private createQuestActionDefinitionGQL: CreateQuestActionDefinitionGQL,
    private updateQuestActionDefinitionGQL: UpdateQuestActionDefinitionGQL,
    private getQuestActionsByQuestPaginatedGQL: GetQuestActionsByQuestPaginatedGQL,
    private findNonPredefinedQuestsByTargetGQL: FindNonPredefinedQuestsByTargetGQL,
    private getQuestActivitiesByQuestPaginatedGQL: GetQuestActivitiesByQuestPaginatedGQL,
    private getNonPredefinedActivityTypesPaginatedGQL: GetNonPredefinedActivityTypesPaginatedGQL,
  ) {}

  findNonPredefinedQuestsByTarget(filter?: any): Observable<QuestWithProgressType[]> {
    this.loadingQuests.next(true);
    return this.findNonPredefinedQuestsByTargetGQL
      .fetch({
        ...(keys(omit(filter, 'advertiser', 'target'))?.length
          ? { filter: omit(filter, 'advertiser', 'target'), reversed: true }
          : { filter: { reversed: true } }),
        ...(this.searchString ? { searchString: this.searchString } : {}),
        ...(filter?.advertiser?.pos ? { advertiser: filter?.advertiser } : {}),
        ...(filter?.status ? { status: filter.status } : {}),
        ...(filter?.users?.length ? { users: filter.users } : {}),
        ...(filter?.target?.pos
          ? { target: filter.target }
          : {
              target: { pos: this.storageHelper.getData('posId') },
            }),
        pagination: { page: this.questPageIndex, limit: this.pageLimit },
      })
      .pipe(
        rxMap(({ data }: any) => {
          this.loadingQuests.next(false);
          if (data) {
            this.pagination.next({
              page: this.questPageIndex,
              size: this.pageLimit,
              length: data.findNonPredefinedQuestsByTarget?.count,
            });
            this.quests.next(data.findNonPredefinedQuestsByTarget.objects);
            this.isLastQuestActivities.next(data.findNonPredefinedQuestsByTarget.isLast);
            this.infiniteQuests.next([...(this.infiniteQuests.value || []), ...data.findNonPredefinedQuestsByTarget.objects]);
            return data.findNonPredefinedQuestsByTarget.objects;
          }
        }),
      );
  }

  createQuest(input: QuestInput): Observable<QuestType> {
    return this.createQuestGQL
      .mutate({
        input: {
          ...input,
          ...(input?.target?.pos
            ? { target: input.target }
            : {
                target: { pos: this.storageHelper.getData('posId') },
              }),
        },
      })
      .pipe(
        rxMap(({ data }: any) => {
          if (data) {
            this.quests.next([data.createQuest, ...(this.quests?.value || [])]);
            return data.createQuest;
          }
        }),
      );
  }

  getQuestOverview(quest: string, fetchPolicy: FetchPolicy = 'cache-first'): Observable<QuestOverviewType> {
    this.loadingQuestOverview.next(true);
    return this.getQuestOverviewGQL.fetch({ quest }, { fetchPolicy }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          this.loadingQuestOverview.next(false);
          this.questOverview.next(data.getQuestOverview);
          return data.getQuestOverview;
        }
      }),
    );
  }

  getFormSummary(formId: string, fetchPolicy: FetchPolicy = 'cache-first'): Observable<SummaryResponseDtoType[]> {
    this.laodingFormSummary.next(true);
    return this.getFormSummaryGQL.fetch({ formId }, { fetchPolicy }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          this.laodingFormSummary.next(false);
          this.formSummary.next(data.getFormSummary);
          return data.getFormSummary;
        }
      }),
    );
  }

  getQuestActivitiesByQuest(quest: string, fetchPolicy: FetchPolicy = 'cache-first'): Observable<QuestActivityType[]> {
    this.loadingActivitiesByQuest.next(true);
    return this.getQuestActivitiesByQuestPaginatedGQL
      .fetch({ quest, pagination: { page: this.questActivitesPageIndex, limit: this.questActivitiesPageLimit } }, { fetchPolicy })
      .pipe(
        rxMap(({ data }: any) => {
          if (data) {
            this.loadingActivitiesByQuest.next(false);
            this.questActivitesByQuest.next(data.getQuestActivitiesByQuestPaginated.objects);
            this.questActivitiesPagination.next({
              page: this.questActivitesPageIndex,
              size: this.questActivitiesPageLimit,
              length: data.getQuestActivitiesByQuestPaginated?.count,
            });
            return data.getQuestActivitiesByQuestPaginated.objects;
          }
        }),
      );
  }

  getQuestStatistics(quest: string, fetchPolicy: FetchPolicy = 'cache-first'): Observable<QuestStatisticsType> {
    this.loadingQuestStatistics.next(true);
    return this.getQuestStatisticsGQL.fetch({ quest }, { fetchPolicy }).pipe(
      rxMap(({ data }: any) => {
        this.loadingQuestStatistics.next(false);
        if (data) {
          this.questStatistics.next(data.getQuestStatistics);
          return data.getQuestStatistics;
        }
      }),
    );
  }

  getQuestActionsByQuestPaginated(quest: string, fetchPolicy: FetchPolicy = 'cache-first'): Observable<QuestActionType[]> {
    this.loadingQuestActionsByQuest.next(true);
    return this.getQuestActionsByQuestPaginatedGQL
      .fetch({ quest, pagination: { limit: this.pageLimit, page: this.questActionsPage } }, { fetchPolicy })
      .pipe(
        rxMap(({ data }: any) => {
          if (data) {
            this.loadingQuestActionsByQuest.next(false);
            this.questActions.next(data.getQuestActionsByQuestPaginated.objects);
            this.questActionsPagination.next({
              page: this.questActionsPage,
              size: this.pageLimit,
              length: data.getQuestActionsByQuestPaginated?.count,
            });
            return data.getQuestActionsByQuestPaginated.objects;
          }
        }),
      );
  }

  removeAudienceFromQuest(id: string): Observable<QuestWithProgressType> {
    return this.removeAudienceFromQuestGQL.mutate({ id }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          this.quest.next(data.removeAudienceFromQuest);
          return data.removeAudienceFromQuest;
        }
      }),
    );
  }

  createQuestion(input: QuestionInput): Observable<QuestionDtoType> {
    return this.createQuestionGQL.mutate({ input }).pipe(
      rxMap((response: any) => {
        if (response.data) {
          this.infiniteQuestions.next(sortBy([...(this.infiniteQuestions.value || []), response.data.createQuestion], 'order'));
          this.questions.next([...(this.questions.value || []), response.data.createQuestion]);
          return response.data.createQuestion;
        }
      }),
    );
  }

  deleteQuestion(id: string): Observable<boolean> {
    return this.deleteQuestionGQL.mutate({ id }).pipe(
      rxMap(({ data }: any) => {
        if (data.deleteQuestion) {
          const questions = this.questions.value.filter((item) => item.id !== id);
          this.questions.next(questions);
          return true;
        }
        return false;
      }),
    );
  }

  createForm(input: CreateFormInput): Observable<FormResponseType> {
    return this.createFormGQL.mutate({ input: { ...input, owner: { pos: this.storageHelper.getData('posId') } } }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          return data.createForm;
        }
      }),
    );
  }

  updateForm(input: UpdateFormInput): Observable<FormResponseType> {
    return this.updateFormGQL.mutate({ input }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          return data.updateForm;
        }
      }),
    );
  }

  updateQuestion(id: string, input: QuestionInput): Observable<QuestionDtoType> {
    return this.questions$.pipe(
      take(1),
      switchMap((questions: any[]) => {
        return this.updateQuestionGQL.mutate({ input, id }).pipe(
          rxMap(({ data }: any) => {
            if (data) {
              const index = findIndex(questions, (qst) => qst.id === id);
              questions[index] = data.updateQuestion;
              this.questions.next(questions);
              return data.updateQuestion;
            }
          }),
        );
      }),
    );
  }

  getQuestionsByForm(id: string, reset = true): Observable<QuestionDtoType[]> {
    if (reset) {
      this.loadingQuestions.next(true);
    }
    return this.getQuestionsByFormGQL
      .fetch({ id, pagination: { page: this.questionsPageIndex, limit: this.questionsPageLimit }, searchString: this.questionsSearchString })
      .pipe(
        rxMap(({ data }: any) => {
          this.loadingQuestions.next(false);
          this.questions.next(sortBy(data.getQuestionsByForm.objects, 'order'));
          if (!reset) {
            this.infiniteQuestions.next([...(this.infiniteQuestions.value || []), ...data.getQuestionsByForm.objects]);
          } else {
            this.infiniteQuestions.next(sortBy([...(this.infiniteQuestions.value || []), ...data.getQuestionsByForm.objects], 'order'));
          }
          this.isLastQuestions.next(data.getQuestionsByForm.isLast);
          return data.getQuestionsByForm.objects;
        }),
      );
  }

  getFormResponses(form: string, fetchPolicy: FetchPolicy = 'cache-first'): Observable<QuestionSimpleType[]> {
    this.loadingFormResponses.next(true);
    return this.getFormResponsesGQL.fetch({ form, page: this.formResponsesPage }, { fetchPolicy }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          this.loadingFormResponses.next(false);
          this.isLastFormResponses.next(data.getFormResponses.isLast);
          this.formResponses.next(data.getFormResponses.objects);
          this.formResponsesPagination.next({
            page: this.formResponsesPage,
            size: this.formResponses.value?.length,
            length: data.getFormResponses?.count,
          });
          return data.getFormResponses.objects;
        }
      }),
    );
  }

  getQuestionResponses(questionId: string, fetchPolicy: FetchPolicy = 'cache-first'): Observable<GetQuestionResponsesPaginateType> {
    this.loadingQuestionResponses.next(true);
    return this.getQuestionResponsesGQL
      .fetch({ questionId, pagination: { page: this.responsesPageIndex, limit: this.pageLimit } }, { fetchPolicy })
      .pipe(
        rxMap(({ data }: any) => {
          if (data) {
            this.loadingQuestionResponses.next(false);
            this.question.next(data.getQuestionResponses.question);
            this.isLastQuestionResponses.next(data.getQuestionResponses.isLast);
            this.questionResponses.next([...(this.questionResponses.value || []), ...data.getQuestionResponses.results]);
            return data.getQuestionResponses;
          }
        }),
      );
  }

  addBudgetToQuest(id: string, maxAnswers: number): Observable<QuestType> {
    return this.addBudgetToQuestGQL.mutate({ id, maxAnswers }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          this.quest.next(data.addBudgetToQuest);
          return data.addBudgetToQuest;
        }
      }),
    );
  }

  calculateQuestBudget(quest: string, maxAnswers: number): Observable<QuestBudgetType> {
    return this.calculateQuestBudgetGQL.fetch({ quest, maxAnswers }).pipe(
      rxMap(({ data }: any) => {
        return data.calculateQuestBudget;
      }),
    );
  }

  getCampaignsStats(fetchPolicy: FetchPolicy = 'cache-first'): Observable<CampaignsStatsDashboardType> {
    this.loadingStats.next(true);
    return this.getCampaignsStatsGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }, { fetchPolicy }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          this.loadingStats.next(false);
          this.campaignsStats.next(data.getCampaignsStats);
          return data.getCampaignsStats;
        }
      }),
    );
  }

  findlanguagesPagination(): Observable<LanguageType[]> {
    return this.findlanguagesPaginationGQL.fetch({ pagination: { page: 0, limit: 200 } }).pipe(
      rxMap((response: any) => {
        if (response.data) {
          this.languages.next(response.data.findlanguagesPagination.objects);
          return response.data.findlanguagesPagination.objects;
        }
      }),
    );
  }

  getQuestionsPagination(): Observable<QuestionDtoType[]> {
    return this.getQuestionsPaginationGQL.fetch({ pagination: { page: this.questionsPageIndex, limit: this.questionsPageLimit } }).pipe(
      rxMap((response: any) => {
        if (response.data) {
          this.infiniteQuestions.next([...(this.infiniteQuestions.value || []), ...response.data.getQuestionsPagination.objects]);
          return response.data.getQuestionsPagination.objects;
        }
      }),
    );
  }

  getQuestById(id: string): Observable<QuestWithProgressType> {
    this.isLoadingQuest.next(true);
    return this.questGQL.fetch({ id }).pipe(
      rxMap(({ data }: any) => {
        if ({ data }) {
          this.isLoadingQuest.next(false);
          this.quest.next(data.quest);
          this.activityTypes.next(map(data.quest, 'questType.activityTypes'));
          return data.quest;
        }
      }),
    );
  }

  getNonPredefinedActivityTypesPaginated(): Observable<ActivityTypeType[]> {
    return this.getNonPredefinedActivityTypesPaginatedGQL.fetch({ pagination: { page: this.activityPageIndex, limit: this.activityPageLimit } }).pipe(
      rxMap((response: any) => {
        if (response.data) {
          this.activityPagination.next({
            page: this.activityPageIndex,
            size: this.activityPageLimit,
            length: response.data.getNonPredefinedActivityTypesPaginated?.count,
          });
          this.infiniteActivityTypes.next([
            ...(this.infiniteActivityTypes.value || []),
            ...response.data.getNonPredefinedActivityTypesPaginated.objects,
          ]);
          this.isLastActivityType.next(response.data.getNonPredefinedActivityTypesPaginated.isLast);
          return response.data.getNonPredefinedActivityTypesPaginated.objects;
        }
      }),
    );
  }

  createQuestActivity(input: QuestActivityInput): Observable<QuestActivityType> {
    return this.createQuestActivityGQL.mutate({ input }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          this.questActivities.next([...(this.questActivities.value || []), data.createQuestActivity]);
          return data.createQuestActivity;
        }
      }),
    );
  }

  createQuestActionDefinition(input: QuestActionDefinitionInput): Observable<QuestActivityType> {
    return this.createQuestActionDefinitionGQL.mutate({ input }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          return data.createQuestActionDefinition;
        }
      }),
    );
  }

  sendTestQuestApi(api: QuestActionDefinitionDefinitionApiInput, params?: KeyValueInput[]): Observable<ApiReturnType> {
    return this.sendTestQuestApiGQL.mutate({ api, ...(params?.length ? { params } : {}) }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          return data.sendTestQuestApi;
        }
      }),
    );
  }

  deleteFormAndQuestions(form: string): Observable<DeleteResponseDtoType> {
    return this.deleteFormAndQuestionsGQL.mutate({ form }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          return data.deleteFormAndQuestions;
        }
      }),
    );
  }

  deleteQuestActivity(id: string): Observable<DeleteResponseDtoType> {
    return this.deleteQuestActivityGQL.mutate({ id }).pipe(
      rxMap((response: any) => {
        if (response.data) {
          const questions = filter(this.questActivities.value, (quest) => quest.id !== id);
          this.questActivities.next(questions);
          return response.data.deleteQuestActivity;
        }
      }),
    );
  }

  updateQuestActionDefinition(id: string, input: QuestActionDefinitionInput): Observable<QuestActivityType> {
    return this.updateQuestActionDefinitionGQL.mutate({ id, input }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          return data.updateQuestActionDefinition;
        }
      }),
    );
  }

  updateQuestActivity(id: string, input: QuestActivityInput): Observable<QuestActivityType> {
    return this.questActivities$.pipe(
      take(1),
      switchMap((quests: any[]) => {
        return this.updateQuestActivityGQL.mutate({ id, input }).pipe(
          rxMap(({ data }: any) => {
            if (data) {
              const index = findIndex(quests, (qst) => qst.id === id);
              quests[index] = data.updateQuestActivity;
              this.questActivities.next(quests);
              this.questActivity.next(data.updateQuestActivity);
              return data.updateQuestActivity;
            }
          }),
        );
      }),
    );
  }

  reorderQuestActivity(id: string, order: number): Observable<QuestActivityType> {
    return this.questActivities$.pipe(
      take(1),
      switchMap((quests: any[]) => {
        return this.reorderQuestActivityGQL.mutate({ id, order }).pipe(
          rxMap(({ data }: any) => {
            if (data) {
              const index = findIndex(quests, (qst) => qst.id === id);
              quests[index] = data.reorderQuestActivity;
              this.questActivities.next(quests);
              this.questActivity.next(data.reorderQuestActivity);
              return data.reorderQuestActivity;
            }
          }),
        );
      }),
    );
  }

  reorderQuestionOfForm(id: string, order: number): Observable<QuestActivityType> {
    return this.reorderQuestionOfFormGQL.mutate({ id, order }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          this.questions.next(sortBy(data.reorderQuestionOfForm, 'order'));
          return data.reorderQuestionOfForm;
        }
      }),
    );
  }

  getQuestActivitiesByQuestPaginated(questId: string, reset = false): Observable<QuestActivityType[]> {
    if (reset === true) {
      this.isLoadingQuestActivities.next(true);
    }
    return this.getQuestActivitiesByQuestPaginatedGQL
      .fetch({ quest: questId, pagination: { page: this.questActivityPageIndex, limit: 9 }, searchString: this.questActivitiesSearchString })
      .pipe(
        rxMap(({ data }: any) => {
          if (data) {
            this.isLoadingQuestActivities.next(false);
            this.questActivities.next(data.getQuestActivitiesByQuestPaginated.objects);
            this.isLastQuestActivities.next(data.getQuestActivitiesByQuestPaginated.isLast);
            this.infiniteQuestActivities.next([...(this.infiniteQuestActivities.value || []), ...data.getQuestActivitiesByQuestPaginated.objects]);
            return filter(data.getQuestActivitiesByQuestPaginated.objects, (act) => act?.activity?.action?.id);
          }
        }),
      );
  }

  getQuestActivityById(id: string): Observable<QuestActivityType> {
    return this.questActivityGQL.fetch({ id }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          this.questActivity.next(data.quest);
          return data.questActivity;
        }
      }),
    );
  }

  updateQuest(id: string, input: QuestUpdateInput): Observable<QuestType> {
    return this.updateQuestGQL.mutate({ input, id }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          this.quest.next(data.updateQuest);
          if (this.quests.value?.length) {
            const index = findIndex(this.quests.value, (quest) => quest?.id === id);
            this.quests.value[index] = data.updateQuest;
            this.quests.next(this.quests.value);
          }
          return data.updateQuest;
        }
      }),
    );
  }
}
