import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import {
  QuestGQL,
  QuestType,
  QuestActivityType,
  QuestPerformedType,
  GetQuestActivitiesByQuestGQL,
  QuestionWithResponsesStatsType,
  GetQuestsByTargetAndUserAudiencePaginatedGQL,
  GetQuestionsbyFormWithResponsesStatsPaginatedGQL,
  GetComingSoonQuestsByTargetAndUserAudiencePaginatedGQL,
  PerformNonPredefinedQuestByUserGQL,
} from '@sifca-monorepo/widget-generator';
import { IPagination } from '@diktup/frontend/models';
import { isBoolean, sortBy } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class QuestsService {
  private loadingQuests: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private questPagination: BehaviorSubject<IPagination> = new BehaviorSubject<IPagination>(null);
  private loadingActivitiesByQuest: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private questions: BehaviorSubject<QuestionWithResponsesStatsType[]> = new BehaviorSubject<QuestionWithResponsesStatsType[]>(null);
  private questActivitesByQuest: BehaviorSubject<QuestActivityType[]> = new BehaviorSubject<QuestActivityType[]>(null);
  private quests: BehaviorSubject<QuestPerformedType[] | QuestType[]> = new BehaviorSubject<QuestPerformedType[] | QuestType[]>(null);
  private quest: BehaviorSubject<QuestPerformedType | QuestType> = new BehaviorSubject<QuestPerformedType | QuestType>(null);
  private selectedQuestActivity: BehaviorSubject<QuestActivityType> = new BehaviorSubject<QuestActivityType>(null);

  reversed = true;
  performed: boolean;
  pageIndex: number = 0;
  pageLimit: number = 10;
  questionsPageIndex = 0;
  questionsPageLimit = 10;

  get selectedQuestActivity$(): Observable<QuestActivityType> {
    return this.selectedQuestActivity.asObservable();
  }
  set selectedQuestActivity$(value: any) {
    this.selectedQuestActivity.next(value);
  }

  get quest$(): Observable<QuestPerformedType | QuestType> {
    return this.quest.asObservable();
  }
  set quest$(value: any) {
    this.quest.next(value);
  }

  get questPagination$(): Observable<IPagination> {
    return this.questPagination.asObservable();
  }

  get quests$(): Observable<QuestPerformedType[] | QuestType[]> {
    return this.quests.asObservable();
  }

  get loadingQuests$(): Observable<boolean> {
    return this.loadingQuests.asObservable();
  }

  get loadingActivitiesByQuest$(): Observable<boolean> {
    return this.loadingActivitiesByQuest.asObservable();
  }

  get questActivitesByQuest$(): Observable<QuestActivityType[]> {
    return this.questActivitesByQuest.asObservable();
  }
  set questActivitesByQuest$(value: any) {
    this.questActivitesByQuest.next(value);
  }

  get questions$(): Observable<QuestionWithResponsesStatsType[]> {
    return this.questions.asObservable();
  }
  set questions$(value: any) {
    this.questions.next(value);
  }

  constructor(
    private questGQL: QuestGQL,
    private getQuestActivitiesByQuestGQL: GetQuestActivitiesByQuestGQL,
    private performNonPredefinedQuestByUserGQL: PerformNonPredefinedQuestByUserGQL,
    private getQuestionsbyFormWithResponsesStatsPaginatedGQL: GetQuestionsbyFormWithResponsesStatsPaginatedGQL,
    private getQuestsByTargetAndUserAudiencePaginatedGQL: GetQuestsByTargetAndUserAudiencePaginatedGQL,
    private getComingSoonQuestsByTargetAndUserAudiencePaginatedGQL: GetComingSoonQuestsByTargetAndUserAudiencePaginatedGQL,
  ) {}

  performNonPredefinedQuestByUser(input: any): Observable<any> {
    return this.performNonPredefinedQuestByUserGQL
      .mutate({ input })
      .pipe(
        map(({ data }: any) => {
          return data.performNonPredefinedQuestByUser;
        }),
      );
  }

  getQuestionsByForm(id: string): Observable<QuestionWithResponsesStatsType[]> {
    return this.getQuestionsbyFormWithResponsesStatsPaginatedGQL.fetch({ id, pagination: { page: 0, limit: 20000 } }).pipe(
      map(({ data }: any) => {
        this.questions.next(sortBy(data.getQuestionsbyFormWithResponsesStatsPaginated.objects, 'order'));
        return data.getQuestionsbyFormWithResponsesStatsPaginated.objects;
      }),
    );
  }

  getQuestActivitiesByQuest(quest: string): Observable<QuestActivityType[]> {
    this.loadingActivitiesByQuest.next(true);
    return this.getQuestActivitiesByQuestGQL.fetch({ quest }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.loadingActivitiesByQuest.next(false);
          this.questActivitesByQuest.next(data.getQuestActivitiesByQuest);
          return data.getQuestActivitiesByQuest;
        }
      }),
    );
  }

  getQuestById(id: string): Observable<QuestType> {
    return this.questGQL.fetch({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.quest.next(data.quest);
          return data.quest;
        }
      }),
    );
  }

  getComingSoonQuestsByTargetAndUserAudiencePaginated(): Observable<QuestPerformedType[] | QuestType[]> {
    this.loadingQuests.next(true);
    return this.getComingSoonQuestsByTargetAndUserAudiencePaginatedGQL
      .fetch({
        input: {
          reversed: this.reversed,
          target: { pos: (window as any).widgetInit.appId },
        },
        pagination: { page: this.pageIndex, limit: this.pageLimit },
      })
      .pipe(
        map(({ data }: any) => {
          this.loadingQuests.next(false);
          this.quests.next(data.getComingSoonQuestsByTargetAndUserAudiencePaginated.objects);
          this.questPagination.next({
            page: this.pageIndex,
            size: this.pageLimit,
            length: data.getComingSoonQuestsByTargetAndUserAudiencePaginated?.count,
          });
          return data.getComingSoonQuestsByTargetAndUserAudiencePaginated.objects;
        }),
      );
  }

  getQuestsByTargetAndUserAudiencePaginated(): Observable<QuestPerformedType[]> {
    this.loadingQuests.next(true);
    return this.getQuestsByTargetAndUserAudiencePaginatedGQL
      .fetch({
        input: {
          reversed: this.reversed,
          ...(isBoolean(this.performed) ? { performed: this.performed } : {}),
          target: { pos: (window as any).widgetInit.appId },
        },
        pagination: { page: this.pageIndex, limit: this.pageLimit },
      })
      .pipe(
        map(({ data }: any) => {
          this.loadingQuests.next(false);
          if (data) {
            this.questPagination.next({
              page: this.pageIndex,
              size: this.pageLimit,
              length: data.getQuestsByTargetAndUserAudiencePaginated?.count,
            });
            this.quests.next(data.getQuestsByTargetAndUserAudiencePaginated.objects);
            return data.getQuestsByTargetAndUserAudiencePaginated.objects;
          }
        }),
      );
  }
}
